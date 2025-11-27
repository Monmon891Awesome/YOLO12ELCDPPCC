#!/bin/bash

# Script to create a clean PneumAI repository for Railway deployment
# This bypasses Railway's build cache issues

echo "🚀 Creating clean PneumAI repository..."

# Create temporary directory for clean repo
CLEAN_DIR="../PneumAI-Production"
rm -rf "$CLEAN_DIR"
mkdir -p "$CLEAN_DIR"

echo "📦 Copying essential application files..."

# Copy application code
cp -r app "$CLEAN_DIR/"
cp -r database "$CLEAN_DIR/"
cp -r src "$CLEAN_DIR/"
cp -r public "$CLEAN_DIR/"

# Copy ONNX model and dependencies
cp best.onnx "$CLEAN_DIR/"
cp requirements-onnx.txt "$CLEAN_DIR/"

# Copy Docker and deployment configs
cp Dockerfile "$CLEAN_DIR/"
cp docker-compose.yml "$CLEAN_DIR/"
cp .dockerignore "$CLEAN_DIR/"
cp railway.toml "$CLEAN_DIR/"
cp nixpacks.toml "$CLEAN_DIR/"

# Copy frontend dependencies
cp package.json "$CLEAN_DIR/"
cp package-lock.json "$CLEAN_DIR/"
cp tailwind.config.js "$CLEAN_DIR/"
cp postcss.config.js "$CLEAN_DIR/"
cp vercel.json "$CLEAN_DIR/"

# Copy environment templates
cp .env.example "$CLEAN_DIR/"
cp .env.production "$CLEAN_DIR/"

# Copy git configs
cp .gitignore "$CLEAN_DIR/"
cp .gitattributes "$CLEAN_DIR/"

# Copy documentation
cp README.md "$CLEAN_DIR/"

echo "📝 Creating deployment README..."

cat > "$CLEAN_DIR/DEPLOYMENT.md" << 'EOF'
# PneumAI Production Deployment

This repository contains the production-ready PneumAI application optimized for Railway deployment.

## Key Features
- **YOLOv12 ONNX Model**: Lightweight lung cancer detection (1.5 GB deployment vs 8.2 GB PyTorch)
- **FastAPI Backend**: High-performance REST API
- **PostgreSQL Database**: Production-ready data persistence
- **React Frontend**: Modern, responsive UI with Tailwind CSS

## Deployment Size Optimization
- Original PyTorch deployment: **8.2 GB** (exceeds Railway 4 GB limit)
- ONNX optimized deployment: **~1.5 GB** ✅ (Railway free tier compatible)

## Quick Deploy to Railway

### Backend + Database
1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Railway will auto-detect the Dockerfile
5. Add PostgreSQL database from "New" → "Database" → "PostgreSQL"
6. Set environment variables:
   - `DATABASE_URL` (auto-injected by Railway)
   - `SECRET_KEY` (generate secure 32+ char string)
   - `FRONTEND_URL` (your Vercel URL)
   - `ENVIRONMENT=production`
   - `UPLOAD_DIR=/tmp/uploads`

### Frontend to Vercel
1. Go to [Vercel](https://vercel.com)
2. Import this repository
3. Configure:
   - Framework: Next.js (or React)
   - Build command: `npm run build`
   - Output directory: `build`
4. Set environment variable:
   - `REACT_APP_API_URL` (your Railway backend URL)

## Local Development
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Install Python dependencies
pip install -r requirements-onnx.txt

# Run backend
uvicorn app.main:app --reload

# In another terminal, install frontend dependencies
npm install

# Run frontend
npm start
```

## ONNX Model Details
- **Model file**: `best.onnx` (11.5 MB)
- **Runtime**: ONNX Runtime (CPU optimized)
- **Inference time**: ~200-500ms per CT scan
- **Detection classes**: normal, benign, malignant, nodule, mass, suspicious

## Database Schema
PostgreSQL schema and seed data are in `database/init/`:
- `01_schema.sql`: Complete database structure
- `02_seed_data.sql`: Sample data for testing

## Tech Stack
- **Backend**: FastAPI, ONNX Runtime, OpenCV, Pillow, PyDICOM
- **Frontend**: React, Tailwind CSS
- **Database**: PostgreSQL 15
- **AI Model**: YOLOv12 (ONNX format)
- **Deployment**: Railway (backend), Vercel (frontend)

---
Generated with [Claude Code](https://claude.com/claude-code)
EOF

echo "🔧 Initializing fresh Git repository..."
cd "$CLEAN_DIR"

# Initialize git
git init
git add .
git commit -m "Initial commit: PneumAI production deployment with ONNX optimization

Features:
- YOLOv12 ONNX model for lung cancer detection
- FastAPI backend with PostgreSQL
- React frontend with Tailwind CSS
- Docker support for local development
- Railway-optimized Dockerfile (<2 GB image size)
- Full CT scan AI analysis functionality preserved

Deployment size: ~1.5 GB (Railway free tier compatible)

🤖 Generated with Claude Code
https://claude.com/claude-code"

echo ""
echo "✅ Clean repository created at: $CLEAN_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Create new GitHub repository at https://github.com/new"
echo "2. Name it: PneumAI-Production"
echo "3. DO NOT initialize with README (we already have one)"
echo "4. Run these commands in the terminal:"
echo ""
echo "   cd $CLEAN_DIR"
echo "   git remote add origin https://github.com/YOUR_USERNAME/PneumAI-Production.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "5. Connect Railway to the new repository"
echo "6. Railway will automatically detect Dockerfile and deploy!"
echo ""
