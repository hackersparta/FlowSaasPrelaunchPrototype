import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE free_tools ADD COLUMN IF NOT EXISTS content_json VARCHAR"))
        conn.commit()
        print("Migration successful: Added content_json to free_tools table.")

if __name__ == "__main__":
    migrate()
