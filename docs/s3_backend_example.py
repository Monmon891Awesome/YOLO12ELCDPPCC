"""
AWS S3 Backend Integration Example
FastAPI endpoints for secure image storage with S3

Installation:
pip install fastapi uvicorn boto3 python-dotenv

Setup:
1. Create AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Set environment variables in .env file
4. Run: uvicorn s3_backend_example:app --host 0.0.0.0 --port 5000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="LungEvity S3 Storage API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS S3 Configuration
S3_BUCKET = os.getenv("S3_BUCKET", "lungevity-scans")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Initialize S3 client
s3_client = boto3.client(
    's3',
    region_name=S3_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

# Database connection (PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


class PresignedUrlRequest(BaseModel):
    fileName: str
    fileType: str
    fileHash: str
    bucket: Optional[str] = S3_BUCKET


class ScanMetadata(BaseModel):
    scanId: str
    patientId: str
    fileHash: str
    originalKey: str
    thumbnailKey: str
    fileName: str
    fileSize: int
    fileType: str
    uploadTime: str


@app.get("/health")
async def health_check():
    """Check API health and S3 connection"""
    try:
        # Test S3 connection
        s3_client.head_bucket(Bucket=S3_BUCKET)
        s3_status = "connected"
    except ClientError:
        s3_status = "disconnected"

    return {
        "status": "healthy",
        "s3": s3_status,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/v1/storage/presigned-url")
async def get_presigned_upload_url(request: PresignedUrlRequest):
    """
    Generate presigned URL for S3 upload
    """
    try:
        # Generate S3 key
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        s3_key = f"scans/{request.fileHash[:8]}/{timestamp}_{request.fileName}"

        # Generate presigned URL for upload (PUT)
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': request.bucket,
                'Key': s3_key,
                'ContentType': request.fileType
            },
            ExpiresIn=3600  # URL expires in 1 hour
        )

        # Generate presigned URL for access (GET)
        access_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': request.bucket,
                'Key': s3_key
            },
            ExpiresIn=86400  # URL expires in 24 hours
        )

        return {
            "uploadUrl": upload_url,
            "accessUrl": access_url,
            "s3Key": s3_key,
            "bucket": request.bucket,
            "expiresIn": 3600
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")


@app.get("/api/v1/storage/signed-url/{s3_key:path}")
async def get_signed_url(s3_key: str):
    """
    Get signed URL to access an S3 object
    """
    try:
        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': s3_key
            },
            ExpiresIn=3600  # 1 hour
        )

        return {
            "signedUrl": signed_url,
            "expiresIn": 3600
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")


@app.get("/api/v1/storage/check-duplicate/{file_hash}")
async def check_duplicate_image(file_hash: str):
    """
    Check if an image with this hash already exists
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Query database for existing scan with this hash
        cur.execute(
            "SELECT * FROM scans WHERE file_hash = %s LIMIT 1",
            (file_hash,)
        )

        result = cur.fetchone()
        cur.close()
        conn.close()

        if result:
            return {
                "exists": True,
                "scanId": result['scan_id'],
                "uploadTime": result['upload_time'].isoformat(),
                "originalKey": result['original_key'],
                "thumbnailKey": result['thumbnail_key']
            }
        else:
            raise HTTPException(status_code=404, detail="No duplicate found")

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/v1/storage/save-metadata")
async def save_scan_metadata(metadata: ScanMetadata):
    """
    Save scan metadata to database
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Insert scan metadata
        cur.execute("""
            INSERT INTO scans (
                scan_id, patient_id, file_hash, original_key,
                thumbnail_key, file_name, file_size, file_type,
                upload_time
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING scan_id
        """, (
            metadata.scanId,
            metadata.patientId,
            metadata.fileHash,
            metadata.originalKey,
            metadata.thumbnailKey,
            metadata.fileName,
            metadata.fileSize,
            metadata.fileType,
            metadata.uploadTime
        ))

        scan_id = cur.fetchone()['scan_id']
        conn.commit()
        cur.close()
        conn.close()

        return {
            "success": True,
            "scanId": scan_id,
            "message": "Metadata saved successfully"
        }

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/api/v1/storage/delete/{scan_id}")
async def delete_scan(scan_id: str):
    """
    Delete scan from S3 and database
    """
    try:
        # Get scan metadata from database
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT original_key, thumbnail_key FROM scans WHERE scan_id = %s",
            (scan_id,)
        )

        result = cur.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Scan not found")

        # Delete from S3
        s3_client.delete_objects(
            Bucket=S3_BUCKET,
            Delete={
                'Objects': [
                    {'Key': result['original_key']},
                    {'Key': result['thumbnail_key']}
                ]
            }
        )

        # Delete from database
        cur.execute("DELETE FROM scans WHERE scan_id = %s", (scan_id,))
        conn.commit()
        cur.close()
        conn.close()

        return {
            "success": True,
            "message": f"Scan {scan_id} deleted successfully"
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/v1/storage/patient/{patient_id}/scans")
async def get_patient_scans(patient_id: str):
    """
    Get all scans for a patient
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                scan_id, file_hash, file_name, file_size,
                upload_time, original_key, thumbnail_key
            FROM scans
            WHERE patient_id = %s
            ORDER BY upload_time DESC
        """, (patient_id,))

        scans = cur.fetchall()
        cur.close()
        conn.close()

        # Generate signed URLs for each scan
        for scan in scans:
            scan['thumbnailUrl'] = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': S3_BUCKET,
                    'Key': scan['thumbnail_key']
                },
                ExpiresIn=3600
            )
            scan['originalUrl'] = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': S3_BUCKET,
                    'Key': scan['original_key']
                },
                ExpiresIn=3600
            )

        return {
            "patientId": patient_id,
            "totalScans": len(scans),
            "scans": scans
        }

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Database schema creation script
"""
CREATE TABLE IF NOT EXISTS scans (
    scan_id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE,
    original_key VARCHAR(512) NOT NULL,
    thumbnail_key VARCHAR(512) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    upload_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_file_hash (file_hash),
    INDEX idx_upload_time (upload_time)
);
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
