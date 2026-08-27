from sqlalchemy import text

from app.core.database import engine

try: 
    with engine.connect() as connection:
        result = connection.execute(text('Select 1'))
        print("Databate connection successful")
        print(result.scalar())

except Exception as e:
    print("Database connection failed")
    print(e)