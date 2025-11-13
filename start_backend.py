#!/usr/bin/env python3
"""
Startup script for YOLOv12 Lung Cancer Detection Backend Server

This script:
1. Checks if best.pt model file exists
2. Verifies Python dependencies are installed
3. Starts the FastAPI server with uvicorn

Usage:
    python start_backend.py
"""

import os
import sys
import subprocess
import urllib.request
import socket


def check_model_file():
    """Check if best.pt model file exists"""
    if not os.path.exists("best.pt"):
        return False
    else:
        file_size_mb = os.path.getsize("best.pt") / (1024 * 1024)
        print(f"✓ Found best.pt model ({file_size_mb:.2f} MB)")
        return True


def download_model(url, dest="best.pt", timeout=120):
    """Download a model file from a URL to `dest` using streaming.

    Supports HTTP(S) and presigned S3 URLs. Uses standard library only.
    """
    print(f"Attempting to download model from: {url}")
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            total = resp.getheader('Content-Length')
            if total:
                total = int(total)
            downloaded = 0
            chunk_size = 8192
            with open(dest + ".part", "wb") as out:
                while True:
                    chunk = resp.read(chunk_size)
                    if not chunk:
                        break
                    out.write(chunk)
                    downloaded += len(chunk)
                    if total:
                        pct = downloaded * 100 / total
                        print(f"\rDownloading: {downloaded}/{total} bytes ({pct:.1f}%)", end="", flush=True)
        # move into place
        os.replace(dest + ".part", dest)
        print("\nDownload completed")
        return True
    except Exception as e:
        print(f"\nError downloading model: {e}")
        return False


def ensure_model():
    """Ensure `best.pt` exists locally. If it's missing and MODEL_URL is set, try to download.

    Returns True if the model is present after the call.
    """
    if check_model_file():
        return True

    model_url = os.environ.get("MODEL_URL")
    if not model_url:
        print("ERROR: best.pt model file not found and MODEL_URL not set.")
        print("Set the MODEL_URL env var to a public or presigned URL where the model can be downloaded.")
        print(f"Current directory: {os.getcwd()}")
        return False

    # attempt download
    success = download_model(model_url)
    if not success:
        print("Failed to download model from MODEL_URL")
        return False

    # final check
    return check_model_file()


def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        "fastapi",
        "uvicorn",
        "ultralytics",
        "cv2",
        "PIL",
        "numpy"
    ]

    missing_packages = []

    for package in required_packages:
        try:
            if package == "cv2":
                __import__("cv2")
            elif package == "PIL":
                __import__("PIL")
            else:
                __import__(package)
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print("\n" + "=" * 70)
        print("ERROR: Missing required Python packages!")
        print("=" * 70)
        print("\nMissing packages:")
        for pkg in missing_packages:
            if pkg == "cv2":
                print("  - opencv-python")
            elif pkg == "PIL":
                print("  - pillow")
            else:
                print(f"  - {pkg}")

        print("\nPlease install dependencies with:")
        print("  pip install -r requirements.txt")
        print("\nOr install them individually:")
        print("  pip install fastapi uvicorn ultralytics opencv-python pillow numpy pydicom")
        return False
    else:
        print("✓ All required dependencies are installed")
        return True


def start_server():
    """Start the FastAPI server"""
    # Get port from environment variable (Railway) or default to 8000
    port = int(os.environ.get("PORT", 8000))

    print("\n" + "=" * 70)
    print("Starting LungEvity YOLOv12 Backend Server")
    print("=" * 70)
    print(f"\nServer will be available at:")
    print(f"  - Local:   http://localhost:{port}")
    print(f"  - Network: http://0.0.0.0:{port}")
    print("\nAPI Documentation:")
    print(f"  - Swagger UI: http://localhost:{port}/docs")
    print(f"  - ReDoc:      http://localhost:{port}/redoc")
    print("\nHealth Check:")
    print(f"  - http://localhost:{port}/health")
    print("\nPress CTRL+C to stop the server")
    print("=" * 70 + "\n")

    try:
        # Start uvicorn server
        # Remove --reload for production deployment
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "backend_server:app",
            "--host", "0.0.0.0",
            "--port", str(port)
        ])
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\nError starting server: {e}")
        return False

    return True


def main():
    """Main function"""
    print("\n" + "=" * 70)
    print("YOLOv12 Lung Cancer Detection Backend - Startup")
    print("=" * 70 + "\n")

    # Check prerequisites
    print("Checking prerequisites...\n")

    if not ensure_model():
        sys.exit(1)

    if not check_dependencies():
        sys.exit(1)

    print("\n✓ All checks passed!\n")

    # Start the server
    start_server()


if __name__ == "__main__":
    main()
