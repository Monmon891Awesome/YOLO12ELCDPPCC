#!/usr/bin/env python3
"""
Test PostgreSQL connection from Python
"""
import psycopg2
from psycopg2.extras import RealDictCursor

# Connection parameters (from .env.local)
conn_params = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pneumai_db',
    'user': 'pneumai_admin',
    'password': 'pneumai_dev_password_2025'
}

try:
    # Connect
    print("🔄 Connecting to PostgreSQL...")
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Test query
    cursor.execute("SELECT COUNT(*) as count FROM users")
    result = cursor.fetchone()
    print(f"✅ Connection successful! Users count: {result['count']}")

    # List all tables
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print(f"\n📊 Tables found: {len(tables)}")
    for table in tables:
        print(f"   - {table['table_name']}")

    # Get sample user data
    cursor.execute("""
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
        ORDER BY role
    """)
    roles = cursor.fetchall()
    print(f"\n👥 User Roles:")
    for role in roles:
        print(f"   - {role['role']}: {role['count']}")

    # Close connection
    cursor.close()
    conn.close()
    print("\n✅ Database connection test passed!")

except Exception as e:
    print(f"❌ Connection failed: {e}")
    print(f"\nMake sure Docker containers are running:")
    print(f"  docker-compose up -d")
