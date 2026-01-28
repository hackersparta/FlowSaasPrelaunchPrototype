# backend/app/utils/email.py
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path

# Try to get settings from env, with defaults for development
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "automations@flowsaas.com")

def send_automation_result(to_email: str, automation_type: str, result_file_path: str = None, error_message: str = None):
    """
    Send automation results via email.
    If result_file_path is provided, it attaches the file.
    If error_message is provided, it sends an error notification.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"⚠️ SMTP not configured. Skipping email to {to_email}")
        return False

    msg = MIMEMultipart()
    msg['From'] = DEFAULT_FROM_EMAIL
    msg['To'] = to_email
    
    if error_message:
        msg['Subject'] = f'❌ Automation Failed: {automation_type}'
        body = f"""
        Hello,
        
        Unfortunately, your automation '{automation_type}' encountered an error:
        
        {error_message}
        
        Please check your input file and try again.
        
        Best regards,
        The FlowSaaS Team
        """
    else:
        msg['Subject'] = f'✅ Automation Complete: {automation_type}'
        body = f"""
        Hello,
        
        Your automation '{automation_type}' has completed successfully!
        
        Please find the results attached.
        
        Best regards,
        The FlowSaaS Team
        """

    msg.attach(MIMEText(body, 'plain'))
    
    # Attach file if present
    if result_file_path and os.path.exists(result_file_path):
        try:
            filename = os.path.basename(result_file_path)
            with open(result_file_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename={filename}'
            )
            msg.attach(part)
        except Exception as e:
            print(f"Error attaching file: {e}")
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False
