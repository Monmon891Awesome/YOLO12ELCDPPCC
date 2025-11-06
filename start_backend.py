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


def check_model_file():
    """Check if best.pt model file exists"""
    if not os.path.exists("best.pt"):
        print("=" * 70)
        print("ERROR: best.pt model file not found!")
        print("=" * 70)
        print("\nPlease ensure best.pt is in the same directory as this script.")
        print(f"Current directory: {os.getcwd()}")
        print("\nExpected location: ./best.pt")
        return False
    else:
        file_size_mb = os.path.getsize("best.pt") / (1024 * 1024)
        print(f"✓ Found best.pt model ({file_size_mb:.2f} MB)")
        return True


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
    print("\n" + "=" * 70)
    print("Starting LungEvity YOLOv12 Backend Server")
    print("=" * 70)
    print("\nServer will be available at:")
    print("  - Local:   http://localhost:8000")
    print("  - Network: http://0.0.0.0:8000")
    print("\nAPI Documentation:")
    print("  - Swagger UI: http://localhost:8000/docs")
    print("  - ReDoc:      http://localhost:8000/redoc")
    print("\nHealth Check:")
    print("  - http://localhost:8000/health")
    print("\nPress CTRL+C to stop the server")
    print("=" * 70 + "\n")

    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "backend_server:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
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

    if not check_model_file():
        sys.exit(1)

    if not check_dependencies():
        sys.exit(1)

    print("\n✓ All checks passed!\n")

    # Start the server
    start_server()


if __name__ == "__main__":
    main()
