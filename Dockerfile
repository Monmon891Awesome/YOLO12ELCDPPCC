# Use Python 3.11 slim image (compatible with M1 and Railway)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and YOLO
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    # Install CPU-only PyTorch first to avoid pulling large CUDA wheels on Linux builders
    pip install --no-cache-dir torch==2.9.1+cpu torchvision==0.24.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY backend_server.py .
COPY start_backend.py .

# Expose port (Railway will set PORT env variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').getcode()" || exit 1

# Start the backend server
CMD ["python3", "start_backend.py"]
