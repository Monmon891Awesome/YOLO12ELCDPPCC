# Useful Commands Reference

Quick reference for common operations with your YOLOv12 lung cancer detection system.

---

## Starting the System

### Start Backend Server
```bash
python3 start_backend.py
```

Or manually:
```bash
python3 -m uvicorn backend_server:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend
```bash
npm start
```

---

## Testing Commands

### Test Backend Health
```bash
curl http://localhost:8000/health
```

Pretty print with Python:
```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```

### Test File Upload
```bash
curl -X POST http://localhost:8000/api/v1/scan/analyze \
  -F "scan=@/path/to/your/scan.jpg"
```

### Open API Documentation
```bash
# macOS
open http://localhost:8000/docs

# Linux
xdg-open http://localhost:8000/docs

# Or just paste in browser:
# http://localhost:8000/docs
```

---

## Checking Status

### Check if Backend is Running
```bash
curl -s http://localhost:8000/health | grep "healthy"
```

### Check Port 8000
```bash
lsof -i:8000
```

### Check Frontend Port 3000
```bash
lsof -i:3000
```

### View Backend Logs
The logs appear in the terminal where you ran `python3 start_backend.py`

---

## Stopping Services

### Stop Backend (if running in foreground)
Press `Ctrl+C` in the terminal

### Kill Backend Process
```bash
lsof -ti:8000 | xargs kill -9
```

### Stop Frontend (if running in foreground)
Press `Ctrl+C` in the terminal

### Kill Frontend Process
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Python Environment

### Check Python Version
```bash
python3 --version
```

### Check Installed Packages
```bash
pip3 list | grep -E "(ultralytics|fastapi|opencv|torch)"
```

### Reinstall Dependencies
```bash
pip3 install -r requirements.txt
```

### Update Specific Package
```bash
pip3 install --upgrade ultralytics
```

---

## File Operations

### Check Model File
```bash
ls -lh best.pt
```

### Verify All Backend Files
```bash
ls -lh backend_server.py start_backend.py requirements.txt best.pt
```

### View Server Logs
```bash
# If running in background, check process output
# Otherwise logs appear in the terminal
```

---

## Git Operations (if using version control)

### Check Git Status
```bash
git status
```

### Stage All Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Add YOLOv12 backend integration"
```

### Push to Remote
```bash
git push
```

---

## Quick Diagnostics

### Full System Check
```bash
echo "=== Python Version ==="
python3 --version

echo -e "\n=== Backend Files ==="
ls -lh backend_server.py start_backend.py requirements.txt best.pt 2>/dev/null || echo "Some files missing!"

echo -e "\n=== Backend Health ==="
curl -s http://localhost:8000/health 2>/dev/null || echo "Backend not running!"

echo -e "\n=== Port Status ==="
echo "Port 8000:" && lsof -ti:8000 >/dev/null && echo "  ✓ In use" || echo "  ✗ Free"
echo "Port 3000:" && lsof -ti:3000 >/dev/null && echo "  ✓ In use" || echo "  ✗ Free"

echo -e "\n=== Dependencies ==="
pip3 show ultralytics >/dev/null 2>&1 && echo "  ✓ Ultralytics installed" || echo "  ✗ Ultralytics missing"
pip3 show fastapi >/dev/null 2>&1 && echo "  ✓ FastAPI installed" || echo "  ✗ FastAPI missing"
```

---

## API Testing Examples

### Get Thresholds
```bash
curl http://localhost:8000/api/v1/config/thresholds
```

### Check Scan by ID (after upload)
```bash
curl http://localhost:8000/api/v1/scan/SCAN_ID_HERE
```

### Batch Upload (multiple files)
```bash
curl -X POST http://localhost:8000/api/v1/scan/batch-analyze \
  -F "scans=@scan1.jpg" \
  -F "scans=@scan2.jpg" \
  -F "scans=@scan3.jpg"
```

---

## Development Commands

### Run with Debug Mode
```bash
# Add verbose logging
python3 backend_server.py --log-level debug
```

### Test Specific Endpoint
```bash
# Health check
curl -v http://localhost:8000/health

# Upload with verbose output
curl -v -X POST http://localhost:8000/api/v1/scan/analyze \
  -F "scan=@test.jpg"
```

### Monitor Server Logs
```bash
# If using systemd (Linux production)
journalctl -u yolo-backend -f

# If running manually
# Just watch the terminal where server is running
```

---

## Troubleshooting Commands

### Clear Python Cache
```bash
find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
```

### Reinstall Everything
```bash
pip3 uninstall -y ultralytics fastapi uvicorn
pip3 install -r requirements.txt
```

### Test Model Loading
```python
python3 -c "from ultralytics import YOLO; model = YOLO('best.pt'); print('✓ Model loaded successfully')"
```

### Check CUDA/GPU Availability
```python
python3 -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}')"
```

---

## Performance Monitoring

### Check CPU/Memory Usage
```bash
# Backend process
ps aux | grep backend_server

# Detailed monitoring
top -pid $(lsof -ti:8000)
```

### Monitor Network Traffic
```bash
# macOS
nettop

# Linux
iftop
```

---

## Production Deployment

### Run as Background Service (systemd)
```bash
# Create service file
sudo nano /etc/systemd/system/yolo-backend.service

# Enable and start
sudo systemctl enable yolo-backend
sudo systemctl start yolo-backend
sudo systemctl status yolo-backend
```

### Using PM2 (Node.js process manager)
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
pm2 start "python3 start_backend.py" --name yolo-backend

# Monitor
pm2 status
pm2 logs yolo-backend
```

---

## Backup Commands

### Backup Model File
```bash
cp best.pt best.pt.backup
```

### Backup Configuration
```bash
cp .env .env.backup
```

### Create Full Backup
```bash
tar -czf yolo-backup-$(date +%Y%m%d).tar.gz \
  backend_server.py \
  start_backend.py \
  requirements.txt \
  best.pt \
  .env
```

---

## Environment Variables

### View Current Config
```bash
cat .env
```

### Set API URL
```bash
echo "REACT_APP_YOLO_API_URL=http://localhost:8000" >> .env
```

### Test with Different Port
```bash
# Edit backend_server.py to use port 8080
# Then update .env
export REACT_APP_YOLO_API_URL=http://localhost:8080
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `python3 start_backend.py` | Start backend server |
| `npm start` | Start frontend |
| `curl localhost:8000/health` | Test backend |
| `lsof -ti:8000 \| xargs kill -9` | Kill backend |
| `pip3 install -r requirements.txt` | Install dependencies |
| `open http://localhost:8000/docs` | View API docs |

---

## Getting Help

### View Logs
```bash
# Backend logs appear in terminal
# Check for errors starting with "ERROR:"
```

### Check Documentation
```bash
# Quick start
cat QUICKSTART.md

# Full guide
cat BACKEND_INTEGRATION.md

# Success summary
cat SUCCESS.md
```

### Test Connection
```bash
# Simple ping test
curl -I http://localhost:8000/health

# Full response
curl http://localhost:8000/health | jq .
```

---

## One-Liners

### Start Everything
```bash
# Terminal 1
python3 start_backend.py &

# Terminal 2
npm start
```

### Stop Everything
```bash
lsof -ti:8000 | xargs kill -9 && lsof -ti:3000 | xargs kill -9
```

### Full Restart
```bash
lsof -ti:8000 | xargs kill -9 && sleep 2 && python3 start_backend.py &
```

### Check Everything
```bash
curl -s localhost:8000/health && echo "✓ Backend OK" || echo "✗ Backend Failed"
```

---

**Keep this file handy for quick reference!**
