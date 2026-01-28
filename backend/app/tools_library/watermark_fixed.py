from PIL import Image, ImageDraw, ImageFont
import io

def run(input_file, watermark_text="CONFIDENTIAL"):
    try:
        # Open and convert to RGBA for transparency support
        base = Image.open(io.BytesIO(input_file)).convert("RGBA")
        
        # Create transparent overlay
        txt_layer = Image.new("RGBA", base.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)
        
        # Calculate position (centered bottom) and font size
        img_width, img_height = base.size
        font_size = max(20, int(img_width / 15))  # Dynamic font size
        
        try:
            # Try to use a TrueType font if available
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            # Fallback to default PIL font
            font = ImageFont.load_default()
        
        # Get text bounding box to center it
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Position: centered horizontally, near bottom
        x = (img_width - text_width) // 2
        y = img_height - text_height - 50  # 50px from bottom
        
        # Draw watermark with semi-transparent white/black outline
        draw.text((x-2, y-2), watermark_text, font=font, fill=(0, 0, 0, 120))  # Shadow
        draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 180))  # Main text
        
        # Composite the layers
        watermarked = Image.alpha_composite(base, txt_layer)
        
        # Convert to RGB and save as JPEG
        output = io.BytesIO()
        watermarked.convert("RGB").save(output, format="JPEG", quality=95)
        
        return {
            "output": output.getvalue(),
            "filename": "watermarked.jpg",
            "mime_type": "image/jpeg"
        }
    except Exception as e:
        return {"error": str(e)}
