# backend/app/routers/social.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/social", tags=["social"])

class SocialPost(BaseModel):
    platform: str
    content: str
    url: Optional[str] = None
    media_url: Optional[str] = None

@router.post("/share")
def share_content(post: SocialPost):
    """
    Placeholder for n8n social sharing workflow.
    In the future, this will trigger an n8n webhook to post to social media.
    """
    # TODO: Trigger n8n webhook
    return {"success": True, "message": f"Shared to {post.platform} (Simulation)"}
