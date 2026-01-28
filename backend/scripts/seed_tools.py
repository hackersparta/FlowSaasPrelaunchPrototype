# backend/seed_tools.py
from app.database import SessionLocal
from app.models import FreeTool
import uuid

# Tool implementations with SEO-optimized names
TOOLS = [
    {
        "name": "Free JSON Formatter Online",
        "slug": "json-formatter-online-free",
        "description": "Format, validate and beautify JSON online for free. Instant JSON syntax checker with error detection.",
        "category": "Text",
        "icon": "📋",
        "input_type": "text",
        "output_type": "text",
        "python_code": """def execute(input_data: str):
    try:
        parsed = json.loads(input_data)
        formatted = json.dumps(parsed, indent=2, sort_keys=True)
        return {
            "success": True,
            "output": formatted,
            "message": "JSON is valid and formatted"
        }
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"Invalid JSON: {str(e)}"
        }"""
    },
    {
        "name": "Base64 Encode Decode Online Free",
        "slug": "base64-encode-decode-online",
        "description": "Free Base64 encoder and decoder tool. Convert text to Base64 or decode Base64 to text instantly online.",
        "category": "Converter",
        "icon": "🔐",
        "input_type": "text",
        "output_type": "text",
        "python_code": """def execute(input_data: str, mode: str = "encode"):
    try:
        if mode == "encode":
            encoded = base64.b64encode(input_data.encode()).decode()
            return {"success": True, "output": encoded}
        else:
            decoded = base64.b64decode(input_data).decode()
            return {"success": True, "output": decoded}
    except Exception as e:
        return {"success": False, "error": str(e)}"""
    },
    {
        "name": "Random Password Generator Strong",
        "slug": "random-password-generator-strong",
        "description": "Generate strong random passwords online free. Create secure passwords with letters, numbers and symbols instantly.",
        "category": "Generator",
        "icon": "🔑",
        "input_type": "none",
        "output_type": "text",
        "python_code": """def execute(length: int = 16, include_symbols: bool = True):
    chars = string.ascii_letters + string.digits
    if include_symbols:
        chars += string.punctuation
    
    password = ''.join(secrets.choice(chars) for _ in range(length))
    
    return {
        "success": True,
        "output": password,
        "strength": "Strong" if length >= 12 else "Medium"
    }"""
    },
    {
        "name": "MD5 SHA256 Hash Generator Online",
        "slug": "md5-sha256-hash-generator",
        "description": "Free online hash generator. Create MD5, SHA256, SHA512 hashes from text instantly. Secure hash calculator.",
        "category": "Converter",
        "icon": "🔒",
        "input_type": "text",
        "output_type": "text",
        "python_code": """def execute(input_data: str, algorithm: str = "sha256"):
    try:
        if algorithm == "md5":
            hash_obj = hashlib.md5(input_data.encode())
        elif algorithm == "sha256":
            hash_obj = hashlib.sha256(input_data.encode())
        elif algorithm == "sha512":
            hash_obj = hashlib.sha512(input_data.encode())
        else:
            return {"success": False, "error": "Invalid algorithm"}
        
        return {
            "success": True,
            "output": hash_obj.hexdigest(),
            "algorithm": algorithm.upper()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}"""
    },
    {
        "name": "Text Compare Tool Online Free",
        "slug": "text-compare-diff-checker",
        "description": "Compare two texts online free. Find differences between text files instantly. Text diff checker with similarity score.",
        "category": "Text",
        "icon": "📊",
        "input_type": "text",
        "output_type": "text",
        "python_code": """def execute(text1: str, text2: str):
    diff = list(difflib.unified_diff(
        text1.splitlines(keepends=True),
        text2.splitlines(keepends=True),
        lineterm=''
    ))
    
    return {
        "success": True,
        "output": ''.join(diff),
        "changes": len(diff),
        "similarity": round(difflib.SequenceMatcher(None, text1, text2).ratio() * 100, 2)
    }"""
    },
    {
        "name": "URL Encode Decode Online Free",
        "slug": "url-encode-decode-online",
        "description": "Free URL encoder and decoder. Convert URLs to percent encoding or decode URL strings instantly online.",
        "category": "Converter",
        "icon": "🌐",
        "input_type": "text",
        "output_type": "text",
        "python_code": """def execute(input_data: str, mode: str = "encode"):
    try:
        if mode == "encode":
            result = quote(input_data)
        else:
            result = unquote(input_data)
        
        return {"success": True, "output": result}
    except Exception as e:
        return {"success": False, "error": str(e)}"""
    },
    {
        "name": "Lorem Ipsum Generator Free",
        "slug": "lorem-ipsum-generator-free",
        "description": "Free Lorem Ipsum generator. Create placeholder text for designs instantly. Generate paragraphs of dummy text online.",
        "category": "Generator",
        "icon": "📝",
        "input_type": "none",
        "output_type": "text",
        "python_code": """LOREM_WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
    "adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
    "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"
]

def execute(paragraphs: int = 3, words_per_para: int = 50):
    result = []
    for _ in range(paragraphs):
        para = []
        for _ in range(words_per_para):
            para.append(random.choice(LOREM_WORDS))
        result.append(' '.join(para).capitalize() + '.')
    
    return {
        "success": True,
        "output": '\\n\\n'.join(result),
        "word_count": paragraphs * words_per_para
    }"""
    },
    {
        "name": "UUID Generator Online Free",
        "slug": "uuid-generator-online-free",
        "description": "Generate UUID online free. Create unique identifiers (UUID v1, v4) instantly. Bulk UUID generator tool.",
        "category": "Generator",
        "icon": "🆔",
        "input_type": "none",
        "output_type": "text",
        "python_code": """def execute(count: int = 1, version: int = 4):
    uuids = []
    for _ in range(min(count, 100)):
        if version == 1:
            uuids.append(str(uuid.uuid1()))
        elif version == 4:
            uuids.append(str(uuid.uuid4()))
        else:
            return {"success": False, "error": "Invalid UUID version"}
    
    return {
        "success": True,
        "output": '\\n'.join(uuids),
        "count": len(uuids)
    }"""
    },
    {
        "name": "HEX to RGB Color Converter",
        "slug": "hex-to-rgb-color-converter",
        "description": "Convert HEX to RGB color codes online free. Color converter tool for web designers. Instant color code conversion.",
        "category": "Converter",
        "icon": "🎨",
        "input_type": "text",
        "output_type": "json",
        "python_code": """def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r: int, g: int, b: int):
    return f"#{r:02x}{g:02x}{b:02x}"

def execute(input_color: str, from_format: str = "hex"):
    try:
        if from_format == "hex":
            r, g, b = hex_to_rgb(input_color)
            return {
                "success": True,
                "hex": input_color,
                "rgb": f"rgb({r}, {g}, {b})",
                "rgb_values": {"r": r, "g": g, "b": b}
            }
        elif from_format == "rgb":
            values = input_color.replace("rgb(", "").replace(")", "").split(",")
            r, g, b = map(int, values)
            hex_color = rgb_to_hex(r, g, b)
            return {
                "success": True,
                "hex": hex_color,
                "rgb": f"rgb({r}, {g}, {b})",
                "rgb_values": {"r": r, "g": g, "b": b}
            }
    except Exception as e:
        return {"success": False, "error": str(e)}"""
    },
    {
        "name": "Markdown to HTML Converter Free",
        "slug": "markdown-to-html-converter",
        "description": "Convert Markdown to HTML online free. Transform MD files to HTML markup instantly. Free Markdown converter tool.",
        "category": "Converter",
        "icon": "📄",
        "input_type": "text",
        "output_type": "text",
        "python_code": """def execute(markdown_text: str):
    html = markdown_text
    
    # Headers
    html = re.sub(r'^### (.*?)$', r'<h3>\\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*?)$', r'<h1>\\1</h1>', html, flags=re.MULTILINE)
    
    # Bold and italic
    html = re.sub(r'\\*\\*(.*?)\\*\\*', r'<strong>\\1</strong>', html)
    html = re.sub(r'\\*(.*?)\\*', r'<em>\\1</em>', html)
    
    # Links
    html = re.sub(r'\\[(.*?)\\]\\((.*?)\\)', r'<a href="\\2">\\1</a>', html)
    
    # Code
    html = re.sub(r'`(.*?)`', r'<code>\\1</code>', html)
    
    # Paragraphs
    html = '<p>' + html.replace('\\n\\n', '</p><p>') + '</p>'
    
    return {
        "success": True,
        "output": html
    }"""
    }
]

def seed_tools():
    db = SessionLocal()
    
    try:
        # Check if tools already exist
        existing_count = db.query(FreeTool).count()
        # Always reseed for now
        if existing_count > 0:
            print(f"Deleting {existing_count} existing tools...")
            db.query(FreeTool).delete()
            db.commit()
        
        # Add all tools
        for tool_data in TOOLS:
            tool = FreeTool(**tool_data, is_active=True)
            db.add(tool)
        
        db.commit()
        print(f"Successfully seeded {len(TOOLS)} tools!")
        
    except Exception as e:
        print(f"Error seeding tools: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_tools()
