# PneumAI Deployment Specifications (Thesis Chapter 4)

## 1. Frontend Deployment
*   **Platform/Service**: **Local Development Server (Node.js)**
*   **Configuration**: Hosted locally on the presentation machine using the `npm start` development server.
*   **Access Method**: Accessed via `http://localhost:3000` (Localhost).
    *   *Note: For demonstration purposes, this allows for real-time debugging and zero-latency interaction during the presentation.*

## 2. Backend Deployment
*   **Platform/Service**: **Local Python Uvicorn Server** with **Ngrok Tunneling**.
*   **Configuration**: The FastAPI application runs locally on port 8000. **Ngrok** is used to create a secure tunnel (`https://inspirational-ileana-nonsaleable.ngrok-free.dev`), exposing the local API to the internet. This allows the frontend (and potentially external devices) to communicate with the backend securely over HTTPS without deploying to a cloud provider.
*   **API Endpoint**: `http://localhost:8000` (Internal) / `https://[ngrok-id].ngrok-free.app` (External).

## 3. Model Hosting
*   **Storage Location**: **Local File System**.
*   **Implementation**: The **YOLOv12n** model weights (`best.pt`) are stored directly in the project's root directory.
*   **Loading Mechanism**: The model is loaded into the system memory (RAM) by the Python backend upon server startup using the `ultralytics` library. It is **not** hosted on an external cloud storage (like Google Drive or AWS S3) to ensure maximum inference speed and data privacy during the demonstration.

## 4. Database & Storage Architecture
*   **Type**: **Hybrid File-Based Storage**.
*   **Implementation**:
    *   **Structured Data (Metadata)**: Stored in **JSON Flat Files** (`scans_metadata.json`) on the server. This provides a lightweight, portable database structure suitable for prototyping.
    *   **Session & User State**: Managed via **Browser LocalStorage** (`unifiedDataManager.js`) to simulate persistent user sessions and role-based access control (RBAC) without the overhead of a complex SQL database.
    *   **Medical Imaging**: CT Scan files (DICOM/JPG) are stored in the local `uploads/` directory, served statically by the FastAPI backend.
