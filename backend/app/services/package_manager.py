# backend/app/services/package_manager.py
import sys
import subprocess
import ast
import logging
import importlib.util

logger = logging.getLogger("uvicorn")

# Common mapping for packages where import name != pip package name
PACKAGE_MAPPING = {
    'PIL': 'pillow',
    'cv2': 'opencv-python',
    'PyPDF2': 'PyPDF2',
    'pypdf': 'pypdf',
    'fitz': 'pymupdf',
    'bs4': 'beautifulsoup4',
    'sklearn': 'scikit-learn',
    'skimage': 'scikit-image',
    'yaml': 'pyyaml',
    'google': 'google-cloud-aiplatform',  # Heuristic
}

def get_required_packages(code: str) -> set[str]:
    """Parse Python code to find imported modules."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return set()
        
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                module_name = name.name.split('.')[0]
                imports.add(PACKAGE_MAPPING.get(module_name, module_name))
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                module_name = node.module.split('.')[0]
                imports.add(PACKAGE_MAPPING.get(module_name, module_name))
    
    return imports

def is_standard_module(module_name: str) -> bool:
    if module_name in sys.builtin_module_names:
        return True
    try:
        spec = importlib.util.find_spec(module_name)
        if spec is None:
            return False
        # If it's in site-packages, it's likely 3rd party
        if 'site-packages' in (spec.origin or ''):
            return False
        return True
    except (ImportError, ValueError):
        return False

def install_missing_packages(code: str):
    """Detect and install missing packages."""
    required = get_required_packages(code)
    
    for package in required:
        try:
            # Check if already installed/importable
            # Note: find_spec needs the module name, not the pip name
            # So we check both or just try to install
            
            logger.info(f"Checking package: {package}")
            
            # Simple check via pip show (safer than importlib if we only have pip names)
            result = subprocess.run([sys.executable, "-m", "pip", "show", package], capture_output=True)
            if result.returncode == 0:
                continue
                
            logger.info(f"Installing missing package: {package}")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            
        except Exception as e:
            # We log but DON'T raise on all errors to prevent blocking tool save
            # if a package is just weird or already handled by system
            logger.warning(f"Failed to verify/install {package}: {e}")
