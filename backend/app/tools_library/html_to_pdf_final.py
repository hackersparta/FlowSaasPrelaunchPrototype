from fpdf import FPDF
import re

def run(html_content):
    """Convert HTML to PDF by removing scripts/styles and stripping tags"""
    try:
        # Remove script tags and their contents
        html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove style tags and their contents
        html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove head tag and its contents
        html_content = re.sub(r'<head[^>]*>.*?</head>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        
        # Convert common block elements to line breaks
        html_content = html_content.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
        html_content = html_content.replace('</p>', '\n\n').replace('</div>', '\n')
        html_content = html_content.replace('</h1>', '\n\n').replace('</h2>', '\n\n')
        html_content = html_content.replace('</h3>', '\n\n').replace('</h4>', '\n\n')
        html_content = html_content.replace('</h5>', '\n\n').replace('</h6>', '\n\n')
        html_content = html_content.replace('</li>', '\n')
        
        # Remove all remaining HTML tags
        clean_text = re.sub(r'<[^>]+>', '', html_content)
        
        # Decode HTML entities
        clean_text = clean_text.replace('&nbsp;', ' ')
        clean_text = clean_text.replace('&lt;', '<')
        clean_text = clean_text.replace('&gt;', '>')
        clean_text = clean_text.replace('&amp;', '&')
        clean_text = clean_text.replace('&quot;', '"')
        
        # Remove excessive whitespace and normalize line breaks
        clean_text = re.sub(r'\n\s*\n', '\n\n', clean_text)
        clean_text = re.sub(r' +', ' ', clean_text)
        clean_text = clean_text.strip()
        
        if not clean_text or len(clean_text) < 5:
            return {"error": "No text content found in HTML. The HTML might only contain scripts/styles."}
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', '', 12)
        
        # Split by lines and add to PDF
        for line in clean_text.split('\n'):
            if line.strip():
                # Handle encoding issues
                safe_line = line.encode('latin-1', 'replace').decode('latin-1')
                pdf.multi_cell(0, 5, safe_line)
            else:
                pdf.ln(3)
        
        pdf_buffer = pdf.output(dest='S').encode('latin-1')
        return {
            "output": pdf_buffer,
            "filename": "converted.pdf",
            "mime_type": "application/pdf"
        }
    except Exception as e:
        return {"error": str(e)}
