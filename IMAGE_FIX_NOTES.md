# Annotated Image URL Fix

## Problem
When uploading CT scans through the patient portal, the annotated images (with bounding boxes and detections) were not displaying because the backend was returning **relative URLs** instead of absolute URLs.

Example:
- Backend returned: `/api/v1/scan/12345/annotated`
- Browser tried to load: `http://localhost:3000/api/v1/scan/12345/annotated` (wrong - this is the frontend port!)
- Should load from: `http://localhost:8000/api/v1/scan/12345/annotated` (correct - backend port)

## Solution
Added a helper function `ensureAbsoluteUrl()` in `src/services/yoloApi.js` that:
1. Checks if a URL is already absolute (starts with `http://` or `https://`)
2. If relative, prepends the API_BASE_URL (`http://localhost:8000`)
3. Properly handles URLs with or without leading slashes

This function is now applied to both `imageUrl` and `annotatedImageUrl` in:
- `uploadScanForAnalysis()` - Standard fetch upload
- `uploadScanWithProgress()` - XMLHttpRequest upload with progress tracking

## Files Modified
- `src/services/yoloApi.js` - Added URL fix logic

## Testing
To test the fix:

1. **Start the backend server:**
   ```bash
   python backend_server.py
   # or
   uvicorn backend_server:app --reload --port 8000
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```

3. **Upload a CT scan:**
   - Login as a patient
   - Go to Home tab
   - Upload a CT scan image (JPG, PNG, or DICOM)
   - Wait for analysis to complete

4. **Verify the fix:**
   - Click "View Full Results"
   - You should see TWO image toggles:
     - "With Annotations" - Shows image with bounding boxes (colored boxes around detections)
     - "Original" - Shows original scan without annotations
   - Toggle between them to confirm both images load properly
   - Open browser DevTools > Network tab to see the correct URLs:
     - `http://localhost:8000/api/v1/scan/{scan_id}/image`
     - `http://localhost:8000/api/v1/scan/{scan_id}/annotated`

## Environment Variables
The API base URL can be configured via environment variable:
```bash
REACT_APP_YOLO_API_URL=http://localhost:8000
```

For production, update this to your production backend URL.

## What Changed in the Response
**Before:** (relative URLs)
```json
{
  "results": {
    "imageUrl": "/api/v1/scan/12345/image",
    "annotatedImageUrl": "/api/v1/scan/12345/annotated"
  }
}
```

**After:** (absolute URLs - fixed by frontend)
```json
{
  "results": {
    "imageUrl": "http://localhost:8000/api/v1/scan/12345/image",
    "annotatedImageUrl": "http://localhost:8000/api/v1/scan/12345/annotated"
  }
}
```

## Components That Benefit from This Fix
1. **ScanResults.jsx** - Displays images with toggle for annotations
2. **PatientDashboard.jsx** - Shows scan images in the scans tab
3. **PatientDashboardBootstrap.jsx** - Bootstrap version
4. **PatientDashboardFoundation.jsx** - Foundation version

All patient dashboard variants now properly display annotated images!
