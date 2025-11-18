# Optimized Docker image for PneumAI FastAPI Backend
# Target: < 2 GB final image size for Railway free tier

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies and clean up in single layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libgomp1 \
        libgl1 \
        postgresql-client \
        curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies in one layer
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip

# Copy application code (minimal files only)
COPY app/ ./app/

# Download YOLO model and create directories
RUN curl -L -o ./best.pt https://raw.githubusercontent.com/Monmon891Awesome/YOLO12ELCDPPCC/pneumai-clean-backup/best.pt && \
    mkdir -p /tmp/uploads/originals /tmp/uploads/annotated /tmp/uploads/thumbnails && \
    chmod -R 755 /tmp/uploads

# Expose port
EXPOSE 8000

# Health check (simplified)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
