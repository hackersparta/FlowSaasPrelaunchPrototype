
import os
import json
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

# Import SDKs - using conditional imports or try/except to avoid crashes if dependencies aren't installed yet
try:
    from groq import Groq
except ImportError:
    Groq = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None

try:
    from huggingface_hub import InferenceClient
except ImportError:
    InferenceClient = None

logger = logging.getLogger(__name__)

# --- System Prompt & Shared Logic ---

SYSTEM_PROMPT = """
You are a Senior n8n Workflow Architect. Your mission is to generate perfectly valid, high-fidelity, and bug-free n8n workflow JSON files.

### STABLE NODE REFERENCE:
- **Triggers**: `n8n-nodes-base.scheduleTrigger` (v1), `n8n-nodes-base.webhook` (v1).
- **Actions/Data**: `n8n-nodes-base.httpRequest` (v4). **USE THIS FOR EVERYTHING** (Emails, Slack, Databases, APIs).
- **Logic**: `n8n-nodes-base.set` (v1), `n8n-nodes-base.if` (v1).

### CRITICAL SCHEMA RULES:
1. **Node Type Strings**: Every node `type` MUST be a valid n8n base type. Use `n8n-nodes-base.httpRequest` (v4) for any external service to ensure compatibility.
2. **Metadata**: Each node MUST have:
   - `name`: Unique string.
   - `typeVersion`: MUST BE AN INTEGER (e.g., 1 or 4). No decimals.
   - `position`: Array `[x, y]`. Sequential nodes should increment X by 250 (e.g., [100,200], [350,200]).
   - `parameters`: Exact config required for the node.
3. **Connections**: Ensure `main` output of node A maps to `main` input of node B.

### Response Format:
Return a SINGLE JSON object with "workflow" and "schema". Do NOT include any preamble or markdown.

### GOLDEN EXAMPLE:
{
  "workflow": {
    "nodes": [
      {
        "parameters": { "rule": { "interval": [ { "field": "hours", "interval": 1 } ] } },
        "name": "Trigger", "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1, "position": [100, 300]
      },
      {
        "parameters": { "method": "GET", "url": "https://api.example.com", "options": {} },
        "name": "Action", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4, "position": [350, 300]
      }
    ],
    "connections": {
      "Trigger": { "main": [ [ { "node": "Action", "type": "main", "index": 0 } ] ] }
    }
  },
  "schema": [
    { "label": "API Hook", "type": "text", "placeholder": "https://api.example.com" }
  ]
}
"""

TOOL_GENERATION_PROMPT = """
You are a Senior Python Developer specializing in creating production-ready, serverless tool functions.

Your mission is to generate secure, efficient, and well-documented Python tool code that follows strict standards.

### CRITICAL: INPUT SCHEMA DESIGN

Analyze the user's request and identify ALL inputs needed for the tool to function perfectly. 
Do NOT just use a generic 'input_data'. Break it down into logical fields.

**Available Input types:**
- text: Short text (URL, name, label)
- textarea: Long text (code, JSON, markdown)
- number: Numeric values (specify min, max, step, default)
- file: Single file upload (specify accept types, e.g. ["image/png", "application/pdf"], max_size_mb)
- files: Multiple file uploads
- select: Dropdown selection (specify options)
- checkbox: Boolean true/false
- color: Hex color code picker
- date: Date selector

Example for Image Watermarker:
"input_schema": [
  {"name": "image", "type": "file", "label": "Upload Image", "accept": ["image/*"], "required": true},
  {"name": "text", "type": "text", "label": "Watermark Text", "placeholder": "Enter text...", "required": true},
  {"name": "opacity", "type": "number", "label": "Opacity (0-100)", "default": 50, "min": 0, "max": 100},
  {"name": "position", "type": "select", "label": "Position", "options": ["top-left", "top-right", "bottom-left", "bottom-right", "center"], "default": "bottom-right"}
]

### CRITICAL REQUIREMENTS:

1. **Function Signature**: MUST be exactly:
   ```python
   def execute(inputs: dict) -> dict:
   ```
   The `inputs` dictionary keys correspond exactly to the `name` fields in your `input_schema`.

2. **Return Format**: ALWAYS return a dict with:
   ```python
   {
       "success": True/False,
       "output": <result_data>,
       "error": None or "error message"
   }
   ```

3. **Security Rules** (CRITICAL):
   - NO `eval()`, `exec()`, `compile()`, `__import__()`, or dynamic code execution
   - NO file system writes (reading is OK for processing)
   - NO network requests unless explicitly required for tool purpose
   - VALIDATE all inputs before processing
   - Handle errors gracefully with try/except

4. **Dependencies**:
   - Prefer Python standard library
   - List any third-party packages needed in the "dependencies" array

### CRITICAL: LIBRARY VERSIONS & BEST PRACTICES
- **PDF Handling**: Use `pypdf` (version 3+). DO NOT use `PyPDF2.PdfFileReader` (it's deprecated). Use `pypdf.PdfReader` instead.
- **Image Handling**: Use `PIL` (Pillow).
- **Type Safety**: Your `execute(inputs)` function SHOULD explicitly cast inputs if needed (e.g., `opacity = int(inputs.get('opacity', 50))`) for maximum robustness.
- **Error Messages**: Provide clear, user-friendly error messages in the `error` field of the return dict.

### RESPONSE FORMAT:

Return a SINGLE JSON object. No markdown, no explanation. Just JSON:

{
  "metadata": {
    "name": "Tool Name",
    "slug": "tool-slug",
    "description": "SEO description",
    "category": "Converter|Generator|Text|PDF|Image|Utility",
    "icon": "📝",
    "output_type": "text|file|json"
  },
}

### IMPORTANT REMINDERS:
- Output ONLY the JSON object, no markdown formatting
- Ensure proper escaping of quotes and newlines in python_code string
- Include at least 2 test cases (1 success, 1 failure scenario)
- Always validate input before processing
- Return proper error messages for failures
"""

class AIService(ABC):
    @abstractmethod
    def generate_workflow(self, prompt: str) -> Dict[str, Any]:
        """Generate n8n workflow JSON from prompt."""
        pass

    @abstractmethod
    def generate_tool(self, prompt: str) -> Dict[str, Any]:
        """Generate Python tool code from prompt."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the name of the provider (e.g., 'groq', 'gemini')."""
        pass

    @classmethod
    def clean_json(cls, text: str) -> str:
        """Robust helper to extract JSON from LLM response even with preamble/markdown."""
        text = text.strip()
        
        # Find first '{' and last '}'
        start = text.find('{')
        end = text.rfind('}')
        
        if start != -1 and end != -1:
            json_str = text[start:end+1]
            return json_str

        # Fallback to original cleaning if brackets not found or failed
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    @classmethod
    def robust_loads(cls, cleaned: str) -> Dict[str, Any]:
        """Attempt to load JSON with strictly literal character escaping if standard loads fails."""
        try:
            return json.loads(cleaned, strict=False)
        except json.JSONDecodeError:
            # Manually escape problematic control characters that might be literal
            # This is a last resort to handle very mangled AI output
            import re
            # Replace literal control characters (except maybe tabs if they are okay, but let's be safe)
            # Unicode range 0-31
            def escape_control(m):
                char = m.group()
                return "\\n" if char == "\n" else "\\r" if char == "\r" else "\\t" if char == "\t" else f"\\u{ord(char):04x}"
            
            # We target control characters that are NOT properly escaped
            purlined = re.sub(r'[\x00-\x1f\x7f-\x9f]', escape_control, cleaned)
            return json.loads(purlined, strict=False)

# --- Provider Implementations ---

class GroqProvider(AIService):
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key and Groq else None

    @property
    def provider_name(self) -> str:
        return "groq"

    def generate_workflow(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("Groq client not initialized. Check API Key.")
        
        chat_completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Create this workflow: {prompt}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1, # Even lower for stability
        )
        content = chat_completion.choices[0].message.content
        cleaned = self.clean_json(content)
        try:
            return self.robust_loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error. Content: {content}")
            raise ValueError(f"AI returned invalid JSON: {str(e)}")

    def generate_tool(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("Groq client not initialized. Check API Key.")
        
        chat_completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": TOOL_GENERATION_PROMPT},
                {"role": "user", "content": f"Create this tool: {prompt}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
        )
        content = chat_completion.choices[0].message.content
        cleaned = self.clean_json(content)
        try:
            return self.robust_loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error. Content: {content}")
            raise ValueError(f"AI returned invalid JSON: {str(e)}")

class GeminiProvider(AIService):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and genai:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    @property
    def provider_name(self) -> str:
        return "gemini"

    def generate_workflow(self, prompt: str) -> Dict[str, Any]:
        if not self.model:
            raise ValueError("Gemini model not initialized. Check API Key.")
        
        response = self.model.generate_content(
            f"{SYSTEM_PROMPT}\n\nUser Request: {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json" # Gemini supports native JSON mode
            )
        )
        return self.robust_loads(self.clean_json(response.text))

    def generate_tool(self, prompt: str) -> Dict[str, Any]:
        if not self.model:
            raise ValueError("Gemini model not initialized. Check API Key.")
        
        response = self.model.generate_content(
            f"{TOOL_GENERATION_PROMPT}\n\nUser Request: {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        return self.robust_loads(self.clean_json(response.text))

class OpenAIProvider(AIService):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key and OpenAI else None

    @property
    def provider_name(self) -> str:
        return "openai"

    def generate_workflow(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("OpenAI client not initialized. Check API Key.")
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        content = response.choices[0].message.content
        return self.robust_loads(content)

    def generate_tool(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("OpenAI client not initialized. Check API Key.")
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": TOOL_GENERATION_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        content = response.choices[0].message.content
        return self.robust_loads(content)

class AnthropicProvider(AIService):
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=self.api_key) if self.api_key and Anthropic else None

    @property
    def provider_name(self) -> str:
        return "anthropic"

    def generate_workflow(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("Anthropic client not initialized. Check API Key.")
        
        message = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=4096,
            temperature=0.2,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        content = message.content[0].text
        return self.robust_loads(self.clean_json(content))

    def generate_tool(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("Anthropic client not initialized. Check API Key.")
        
        message = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=4096,
            temperature=0.2,
            system=TOOL_GENERATION_PROMPT,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        content = message.content[0].text
        return self.robust_loads(self.clean_json(content))

class HuggingFaceProvider(AIService):
    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")
        self.client = InferenceClient(token=self.api_key) if self.api_key and InferenceClient else None

    @property
    def provider_name(self) -> str:
        return "huggingface"

    def generate_workflow(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("HuggingFace client not initialized. Check API Key.")
        
        # Using a good open/generic model
        response = self.client.text_generation(
            f"{SYSTEM_PROMPT}\n\nUser Request: {prompt}",
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            max_new_tokens=2000,
            temperature=0.2
        )
        return self.robust_loads(self.clean_json(response))

    def generate_tool(self, prompt: str) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("HuggingFace client not initialized. Check API Key.")
        
        response = self.client.text_generation(
            f"{TOOL_GENERATION_PROMPT}\n\nUser Request: {prompt}",
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            max_new_tokens=2000,
            temperature=0.2
        )
        return self.robust_loads(self.clean_json(response))


# --- Factory ---

class AIWorkflowFactory:
    _providers = {
        "groq": GroqProvider,
        "gemini": GeminiProvider,
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "huggingface": HuggingFaceProvider
    }

    @classmethod
    def get_provider(cls, name: str) -> AIService:
        if name not in cls._providers:
            raise ValueError(f"Provider '{name}' not supported.")
        provider_class = cls._providers[name]
        return provider_class()

    @classmethod
    def get_available_providers(cls) -> List[str]:
        available = []
        for name, provider_cls in cls._providers.items():
            # Quick check if provider can be initialized (has API key env var set)
            # We instantiate it briefly to check.
            try:
                p = provider_cls()
                # Each provider's init checks for the env var and sets client/model to None if missing
                # So we check if the internal client/model is present
                if name == "groq" and p.client: available.append(name)
                elif name == "gemini" and p.model: available.append(name)
                elif name == "openai" and p.client: available.append(name)
                elif name == "anthropic" and p.client: available.append(name)
                elif name == "huggingface" and p.client: available.append(name)
            except Exception:
                continue
        return available
