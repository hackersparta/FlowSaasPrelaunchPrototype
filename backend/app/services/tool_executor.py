# backend/app/services/tool_executor.py
from typing import Dict, Any
import json
import base64
import hashlib
import secrets
import string
import difflib
from urllib.parse import quote, unquote
import uuid
import re
import random
import io
import pypdf
import inspect
import sys

def execute_tool(tool_code: str, **kwargs) -> Dict[str, Any]:
    """
    Safely execute tool code with provided inputs.
    Returns the tool's output.
    """
    try:
        if 'PyPDF2' not in sys.modules:
            # Create a fake module for PyPDF2 if it's not installed, pointing to pypdf
            # This is safer than just relying on namespace injection
            import types
            shim_module = types.ModuleType('PyPDF2')
            shim_module.PdfFileReader = pypdf.PdfReader
            shim_module.PdfFileWriter = pypdf.PdfWriter
            
            # Copy other pypdf attributes to shim
            for attr in dir(pypdf):
                if not attr.startswith('_'):
                    setattr(shim_module, attr, getattr(pypdf, attr))
            
            sys.modules['PyPDF2'] = shim_module

        # Monkeypatch PIL ImageFont.getsize if missing (removed in Pillow 10)
        try:
            from PIL import ImageFont
            if not hasattr(ImageFont.FreeTypeFont, 'getsize'):
                def getsize_shim(self, text, *args, **kwargs):
                    left, top, right, bottom = self.getbbox(text, *args, **kwargs)
                    return (right - left, bottom - top)
                ImageFont.FreeTypeFont.getsize = getsize_shim
                ImageFont.ImageFont.getsize = getsize_shim # Also base class just in case
        except ImportError:
            pass

        # Monkeypatch PIL Image.open to handle bytes automatically
        try:
            from PIL import Image
            if not hasattr(Image, '_original_open'):
                Image._original_open = Image.open
                def safe_open(fp, mode='r', formats=None):
                    if isinstance(fp, bytes):
                        fp = io.BytesIO(fp)
                    return Image._original_open(fp, mode, formats)
                Image.open = safe_open
        except ImportError:
            pass

        # Monkeypatch pypdf.PdfReader to handle bytes automatically
        # This also covers the PyPDF2 shim since it points to this class
        if not hasattr(pypdf.PdfReader, '_original_init'):
            pypdf.PdfReader._original_init = pypdf.PdfReader.__init__
            def safe_pdf_init(self, stream, *args, **kwargs):
                if isinstance(stream, bytes):
                    stream = io.BytesIO(stream)
                pypdf.PdfReader._original_init(self, stream, *args, **kwargs)
            pypdf.PdfReader.__init__ = safe_pdf_init

        # Custom import to force using our shims if needed
        original_import = __builtins__['__import__']
        def custom_import(name, *args, **kwargs):
            if name == 'PyPDF2':
                 return sys.modules['PyPDF2']
            return original_import(name, *args, **kwargs)

        # Create a namespace with safe built-ins and modules
        namespace = {
            '__builtins__': {
                '__import__': custom_import,  # Intercept imports
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'bool': bool,
                'list': list,
                'dict': dict,
                'tuple': tuple,
                'range': range,
                'enumerate': enumerate,
                'zip': zip,
                'map': map,
                'filter': filter,
                'min': min,
                'max': max,
                'sum': sum,
                'abs': abs,
                'round': round,
                'isinstance': isinstance,
                'type': type,
                'bytes': bytes,
                'bytearray': bytearray,
                'open': open,
                'print': print,
                'sorted': sorted,
                'reversed': reversed,
                'any': any,
                'all': all,
                'hasattr': hasattr,
                'getattr': getattr,
                'setattr': setattr,
                'Exception': Exception,
                'ValueError': ValueError,
                'TypeError': TypeError,
                'IndexError': IndexError,
                'KeyError': KeyError,
                'ImportError': ImportError,
                'AttributeError': AttributeError,
                'RuntimeError': RuntimeError,
                '__build_class__': __build_class__,  # Required for class definitions (FPDF, etc)
                '__name__': '__main__',  # Some libraries check this
            },
            # Add safe modules
            'json': json,
            'base64': base64,
            'hashlib': hashlib,
            'secrets': secrets,
            'string': string,
            'difflib': difflib,
            'quote': quote,
            'unquote': unquote,
            'uuid': uuid,
            're': re,
            'random': random,
            'io': io,
            'PyPDF2': sys.modules.get('PyPDF2'), # Enhanced Shim
            'pypdf': pypdf,
        }
        
        # Execute the tool code
        # Capture stdout in case the tool prints instead of returning
        from contextlib import redirect_stdout
        
        f = io.StringIO()
        with redirect_stdout(f):
            exec(tool_code, namespace)
            
            # Smart Function Discovery
            # If 'execute' is missing, look for 'main', 'run', or the only function defined
            entry_point = 'execute'
            if entry_point not in namespace:
                candidates = ['main', 'run', 'process', 'handler']
                for c in candidates:
                    if c in namespace:
                        entry_point = c
                        break
                
                # If still not found, check if there is exactly one user-defined function
                if entry_point not in namespace:
                    functions = [obj for name, obj in namespace.items() 
                               if inspect.isfunction(obj) and obj.__module__ == None] # __module__ is None for exec-ed functions usually
                    if len(functions) == 1:
                        # Find the name of this function
                        for name, obj in namespace.items():
                             if obj == functions[0]:
                                 entry_point = name
                                 break

            if entry_point not in namespace:
                return {
                    "success": False,
                    "error": "Tool code must define an 'execute', 'main', or 'run' function"
                }

            # Introspect the execute function to handle flexible inputs
            func = namespace[entry_point]
            sig = inspect.signature(func)
            func_args = {}
            params = list(sig.parameters.values())
            
            # prioritized inputs from system
            primary_input = kwargs.get('input_file') or kwargs.get('input_data')
            for i, param in enumerate(params):
                name = param.name
                
                # 0. Special case for multi-input signature execute(inputs: dict)
                if name == 'inputs' and len(params) == 1 and name not in kwargs:
                    func_args[name] = kwargs
                    continue

                # 1. Check exact match
                if name in kwargs:
                    func_args[name] = kwargs[name]
                    continue
                    
                # 2. Check for smart mappings
                if name == 'input_data' and 'input_file' in kwargs:
                    func_args[name] = kwargs['input_file']
                    continue
                if name == 'input_file' and 'input_data' in kwargs:
                    func_args[name] = kwargs['input_data']
                    continue
                    
                # 3. Handle specific commonly used names by AI
                if name in ['input', 'data', 'file', 'content', 'text', 'string', 'blob']:
                     if primary_input is not None:
                         func_args[name] = primary_input
                         continue
                
                # 4. Fallback: If it's the first argument and we have a primary input, use it
                if i == 0 and primary_input is not None and name not in func_args:
                    func_args[name] = primary_input
                    continue
                
                # 5. Handle kwargs
                if param.kind == param.VAR_KEYWORD:
                    func_args.update(kwargs)
                    
            # Execute
            result = func(**func_args)
        
        # Capture printed output if result is None
        printed_output = f.getvalue().strip()
        if result is None and printed_output:
            result = printed_output
        
        # Handle complex objects (like DataFrames) that generated code might return
        # Attempt to convert DataFrame/Series to JSON/Dict automatically
        v = result
        if hasattr(v, 'to_dict'):
            result = v.to_dict()
        elif hasattr(v, 'to_json'):
             # If it returns json string, parse it back to dict if possible for cleaner API response
             try:
                 json_str = v.to_json()
                 result = json.loads(json_str) 
             except:
                 result = v.to_json()
        elif hasattr(v, 'tolist'): # Numpy arrays
            result = v.tolist()

        # Helper to recursively encode bytes
        def encode_bytes(obj):
            if isinstance(obj, bytes):
                return base64.b64encode(obj).decode('utf-8')
            if isinstance(obj, dict):
                return {k: encode_bytes(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [encode_bytes(i) for i in obj]
            return obj
            
        result = encode_bytes(result)
        
        # Auto-wrap result if it doesn't match expected schema
        if not isinstance(result, dict) or 'success' not in result:
             return {
                "success": True,
                "output": result
            }
            
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Execution error: {str(e)}"
        }
