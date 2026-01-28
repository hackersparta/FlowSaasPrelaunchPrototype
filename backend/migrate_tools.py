from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://flowsaas_user:secure_password_dev@postgres:5432/flowsaas_db")

engine = create_engine(DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Running migration: adding input_schema to free_tools...")
        try:
            conn.execute(text("ALTER TABLE free_tools ADD COLUMN input_schema TEXT;"))
            conn.commit()
            print("Successfully added input_schema column.")
        except Exception as e:
            if "already exists" in str(e):
                print("Column already exists, skipping.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    run_migration()
