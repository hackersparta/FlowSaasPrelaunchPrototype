from PIL import Image
import io
import os

def run(input_data, mode="percentage", width=None, height=None, percentage=50):
    """
    Resizes an image.
    Args:
        input_data (bytes): Raw image bytes.
        mode (str): 'percentage' or 'fixed'.
        width (int): Target width for fixed mode.
        height (int): Target height for fixed mode.
        percentage (int): Percentage for percentage mode (e.g., 50 for 50%).
    Returns:
        dict: {"file": bytes, "filename": str, "mime_type": str}
    """
    try:
        # Open the image from bytes
        image = Image.open(io.BytesIO(input_data))
        original_format = image.format or "JPEG"
        
        # Calculate new dimensions
        if mode == "fixed" and width and height:
            new_size = (int(width), int(height))
        else:
            # Default to percentage
            scale = int(percentage) / 100.0
            new_size = (int(image.width * scale), int(image.height * scale))
            
        # Resize
        resized_image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output_buffer = io.BytesIO()
        save_format = original_format
        if save_format == "JPEG":
            resized_image.save(output_buffer, format=save_format, quality=85)
        else:
            resized_image.save(output_buffer, format=save_format)
            
        return {
            "output": output_buffer.getvalue(),
            "filename": f"resized_{new_size[0]}x{new_size[1]}.{save_format.lower()}",
            "mime_type": Image.MIME[save_format]
        }
        
    except Exception as e:
        return {"error": f"Image processing failed: {str(e)}"}
