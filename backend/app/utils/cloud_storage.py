# backend/app/utils/cloud_storage.py
import re
import requests
from typing import Optional

def parse_google_drive_link(share_url: str) -> str:
    """
    Convert Google Drive share link to direct download URL.
    Input: https://drive.google.com/file/d/FILE_ID/view
    Output: https://drive.google.com/uc?export=download&id=FILE_ID
    """
    # Try to extract file ID from various Google Drive URL formats
    patterns = [
        r'/d/([a-zA-Z0-9_-]+)',  # /file/d/{ID}/view
        r'id=([a-zA-Z0-9_-]+)',   # ?id={ID}
    ]
    
    for pattern in patterns:
        match = re.search(pattern, share_url)
        if match:
            file_id = match.group(1)
            return f'https://drive.google.com/uc?export=download&id={file_id}'
    
    # If no pattern matched, return as-is
    return share_url


def parse_dropbox_link(share_url: str) -> str:
    """
    Convert Dropbox share link to direct download.
    Replace ?dl=0 with ?dl=1
    """
    return share_url.replace('?dl=0', '?dl=1').replace('?dl=0&', '?dl=1&')


def parse_onedrive_link(share_url: str) -> str:
    """
    Convert OneDrive share link to direct download.
    Replace ?web=1 with ?download=1
    """
    return share_url.replace('?web=1', '?download=1')


def get_download_url(cloud_url: str) -> str:
    """
    Detect cloud storage provider and return direct download URL.
    """
    if 'drive.google.com' in cloud_url or 'docs.google.com' in cloud_url:
        return parse_google_drive_link(cloud_url)
    elif 'dropbox.com' in cloud_url:
        return parse_dropbox_link(cloud_url)
    elif 'onedrive' in cloud_url or '1drv.ms' in cloud_url:
        return parse_onedrive_link(cloud_url)
    else:
        # Assume it's a direct download link
        return cloud_url


def download_from_cloud(url: str, timeout: int = 30) -> bytes:
    """
    Download file from cloud storage link.
    Returns file content as bytes.
    """
    download_url = get_download_url(url)
    
    try:
        response = requests.get(download_url, allow_redirects=True, timeout=timeout)
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to download file from cloud: {str(e)}")


def save_automation_result(automation_id: str, result_data: bytes, filename: str) -> str:
    """
    Save automation result file to disk.
    Returns the file path.
    """
    import os
    from pathlib import Path
    
    # Create automations directory if it doesn't exist
    results_dir = Path("/app/automation_results")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = results_dir / f"{automation_id}_{filename}"
    file_path.write_bytes(result_data)
    
    return str(file_path)
