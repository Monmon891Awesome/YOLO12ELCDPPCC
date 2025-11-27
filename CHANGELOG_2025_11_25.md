# Changelog - November 25, 2025

## 🚀 Enhancements & Fixes

### 🩺 Doctor Dashboard (Modern & Classic)
- **Role-Based Access Control**: 
  - Removed the **"Edit"** button from the patient list in both Classic and Modern dashboards to strictly enforce that Doctors cannot modify patient records (Admin only).
  - Removed the **"View"** button from the patient list in both dashboards to streamline the UI, as clicking the row or using specific tabs is the primary navigation method.
- **Messaging System (Modern Dashboard)**:
  - **Full Implementation**: Integrated a fully functional messaging system.
  - **Recipient Selection**: Replaced manual ID entry with a user-friendly **dropdown menu** to select recipients (Patients or other Doctors).
  - **UI Polish**: Removed "Under Development" placeholders for the Messages, Appointments, and Help tabs, as these are now implemented.

### 🛡️ Admin Dashboard (Modern)
- **CT Scan Image Display Fix**:
  - **Blob Fetching**: Implemented a `fetchImageAsBlob` utility to securely fetch images through the ngrok tunnel using the `ngrok-skip-browser-warning` header.
  - **Robust Rendering**: Updated the image display logic to:
    - Handle both relative and absolute URLs.
    - Prioritize **Annotated Images** (with AI bounding boxes) over original scans when available.
    - Check multiple potential data paths (`scan.imageUrl`, `scan.results.imageUrl`, etc.) to ensure images always load.

### ⚙️ Backend (`backend_server.py`)
- **Messaging API**: Added new endpoints (`/api/v1/messages`) to support sending, retrieving, and managing messages.
- **Static File Serving**: Mounted the `/uploads` directory to correctly serve uploaded CT scan images to the frontend.

## 📝 Summary
These updates bridge the gap between the Classic and Modern dashboards, ensuring that the Modern interface is not only visually superior but also functionally complete and bug-free. The critical issues with image loading and messaging have been resolved, providing a seamless experience for both Doctors and Admins.
