# PostgreSQL Setup Guide for PneumAI

This guide will help you set up PostgreSQL with pgAdmin for the PneumAI platform.

## Table of Contents
1. [Install PostgreSQL & pgAdmin](#1-install-postgresql--pgadmin)
2. [Initial Configuration](#2-initial-configuration)
3. [Create Database Using pgAdmin](#3-create-database-using-pgadmin)
4. [Run Database Schema](#4-run-database-schema)
5. [Configure Backend](#5-configure-backend)
6. [Test the Connection](#6-test-the-connection)
7. [Common Operations in pgAdmin](#7-common-operations-in-pgadmin)

---

## 1. Install PostgreSQL & pgAdmin

### macOS (M1/M2/M3 - Apple Silicon)

**Option A: Using Homebrew (Recommended)**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Install pgAdmin 4
brew install --cask pgadmin4
```

**Option B: Using Official Installer**
1. Download PostgreSQL from: https://www.postgresql.org/download/macosx/
2. Download pgAdmin from: https://www.pgadmin.org/download/pgadmin-4-macos/
3. Run both installers and follow the setup wizard

### Windows

1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Run the installer (includes pgAdmin 4)
3. During installation:
   - Set a password for the `postgres` superuser (remember this!)
   - Use default port: `5432`
   - Select default locale

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install pgAdmin 4
sudo apt install pgadmin4
```

---

## 2. Initial Configuration

### Set PostgreSQL Password (First Time Setup)

**macOS/Linux:**
```bash
# Switch to postgres user
sudo -u postgres psql

# Set password for postgres user
ALTER USER postgres PASSWORD 'postgres';

# Exit psql
\q
```

**Windows:**
The password is set during installation.

---

## 3. Create Database Using pgAdmin

### Launch pgAdmin

1. **macOS**: Open pgAdmin 4 from Applications
2. **Windows**: Search for "pgAdmin 4" in Start Menu
3. **Linux**: Run `pgadmin4` from terminal or applications menu

### Connect to PostgreSQL Server

1. pgAdmin will open in your browser
2. Click on **"Servers"** in the left sidebar
3. If PostgreSQL server is not listed:
   - Right-click **"Servers"** → **"Register"** → **"Server"**
   - **General Tab:**
     - Name: `Local PostgreSQL`
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `5432`
     - Maintenance database: `postgres`
     - Username: `postgres`
     - Password: `postgres` (or your password)
     - Save password: ✓ (check this)
   - Click **Save**

### Create the PneumAI Database

1. In pgAdmin, expand **"Servers"** → **"Local PostgreSQL"**
2. Right-click on **"Databases"** → **"Create"** → **"Database"**
3. In the dialog:
   - **Database:** `pneumai_db`
   - **Owner:** `postgres`
4. Click **Save**

---

## 4. Run Database Schema

### Execute Schema SQL

1. In pgAdmin, expand **"Servers"** → **"Local PostgreSQL"** → **"Databases"**
2. Click on **"pneumai_db"**
3. Click on **Tools** → **Query Tool** (or press F7)
4. Open the schema file:
   - Click **File** → **Open** → Select `database_schema.sql`
   - Or copy the contents of `database_schema.sql` and paste into the query editor
5. Click the **Execute/Run** button (▶️) or press F5
6. You should see messages indicating successful table creation

### Verify Tables Were Created

1. In the left sidebar, expand **"pneumai_db"** → **"Schemas"** → **"public"** → **"Tables"**
2. You should see these tables:
   - `patients`
   - `doctors`
   - `scans`
   - `detections`
   - `appointments`
   - `messages`
   - `scan_images`

---

## 5. Configure Backend

### Update Environment Variables

Edit the `.env` file in your project root:

```bash
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pneumai_db
DB_USER=postgres
DB_PASSWORD=postgres  # Change this to your password
```

### Install Python Dependencies

```bash
# Install PostgreSQL adapter
pip3 install psycopg2-binary

# Or install all requirements
pip3 install -r requirements.txt
```

---

## 6. Test the Connection

### Start the Backend Server

```bash
# Make sure PostgreSQL is running
# macOS (Homebrew):
brew services list  # Check if postgresql@15 is running

# Start the backend
python3 backend_server.py
```

### Check Startup Messages

You should see:
```
Starting PneumAI YOLOv12 Backend Server...
Loading YOLO model from best.pt...
Model loaded successfully!
✓ Database pool initialized: pneumai_db@localhost:5432
✓ Database connection established
```

### Test the Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model": "YOLOv12",
  "model_loaded": true,
  "database_connected": true,
  ...
}
```

---

## 7. Common Operations in pgAdmin

### View Data in Tables

1. In pgAdmin, expand **"pneumai_db"** → **"Schemas"** → **"public"** → **"Tables"**
2. Right-click on a table (e.g., `patients`) → **"View/Edit Data"** → **"All Rows"**
3. The data grid will show all rows in the table

### Run Custom Queries

1. Select **"pneumai_db"**
2. Click **Tools** → **Query Tool**
3. Write your SQL query:
   ```sql
   -- Get all patients
   SELECT * FROM patients;

   -- Get all scans with high risk
   SELECT * FROM scans WHERE risk_level = 'high';

   -- Count scans per patient
   SELECT patient_id, COUNT(*) as scan_count
   FROM scans
   GROUP BY patient_id;
   ```
4. Click **Execute** (▶️)

### Export Data

1. Right-click on a table → **"Import/Export Data"**
2. Select **Export** tab
3. Choose format (CSV, JSON, etc.)
4. Click **OK**

### Backup Database

1. Right-click on **"pneumai_db"** → **"Backup"**
2. Choose a filename and location
3. Select **Format:** `Custom`
4. Click **Backup**

### Restore Database

1. Right-click on **"Databases"** → **"Restore"**
2. Select the backup file
3. Click **Restore**

---

## Troubleshooting

### Connection Refused Error

```
✗ Database initialization error: connection refused
```

**Solution:**
```bash
# Check if PostgreSQL is running
# macOS (Homebrew):
brew services list
brew services start postgresql@15

# Linux:
sudo systemctl status postgresql
sudo systemctl start postgresql

# Windows:
# Check Services → PostgreSQL should be "Running"
```

### Authentication Failed

```
✗ Database initialization error: password authentication failed
```

**Solution:**
- Verify password in `.env` matches your PostgreSQL password
- Reset password:
  ```bash
  sudo -u postgres psql
  ALTER USER postgres PASSWORD 'new_password';
  ```

### Database Does Not Exist

```
✗ Database initialization error: database "pneumai_db" does not exist
```

**Solution:**
- Create the database in pgAdmin (see Section 3)
- Or create via command line:
  ```bash
  createdb -U postgres pneumai_db
  ```

### Port Already in Use

```
Port 5432 is already in use
```

**Solution:**
- Another PostgreSQL instance is running
- Check for existing processes:
  ```bash
  lsof -i :5432
  ```

---

## Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database created in pgAdmin
3. ✅ Schema executed successfully
4. ✅ Backend connected to database
5. 🚀 Start using PneumAI!

Your data will now persist across server restarts. You can use pgAdmin to:
- View patient records
- Monitor scan results
- Analyze appointment data
- Export reports

---

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
- [psycopg2 Documentation](https://www.psycopg.org/docs/)
