"""
Database connection and utilities for PneumAI
PostgreSQL integration using psycopg2
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import os
from contextlib import contextmanager
from typing import Optional, Dict, List, Any
import json
from datetime import date, datetime, time

class Database:
    """PostgreSQL database connection manager"""

    _pool: Optional[SimpleConnectionPool] = None

    @classmethod
    def initialize(cls,
                   host: str = "localhost",
                   port: int = 5432,
                   database: str = "pneumai_db",
                   user: str = "postgres",
                   password: str = "postgres",
                   min_connections: int = 1,
                   max_connections: int = 10):
        """
        Initialize the database connection pool

        Args:
            host: Database host
            port: Database port
            database: Database name
            user: Database user
            password: Database password
            min_connections: Minimum number of connections in pool
            max_connections: Maximum number of connections in pool
        """
        try:
            cls._pool = SimpleConnectionPool(
                min_connections,
                max_connections,
                host=host,
                port=port,
                database=database,
                user=user,
                password=password
            )
            print(f"✓ Database pool initialized: {database}@{host}:{port}")
            return True
        except Exception as e:
            print(f"✗ Database initialization failed: {e}")
            return False

    @classmethod
    @contextmanager
    def get_connection(cls):
        """
        Get a connection from the pool (context manager)

        Usage:
            with Database.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM patients")
        """
        if cls._pool is None:
            raise Exception("Database pool not initialized. Call Database.initialize() first.")

        conn = cls._pool.getconn()
        try:
            yield conn
        finally:
            cls._pool.putconn(conn)

    @classmethod
    def execute(cls, query: str, params: tuple = None, fetch: str = "all") -> Optional[List[Dict]]:
        """
        Execute a query and return results

        Args:
            query: SQL query
            params: Query parameters (tuple)
            fetch: "all", "one", or "none"

        Returns:
            List of dictionaries (fetch="all"), single dictionary (fetch="one"), or None
        """
        with cls.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params)

            if fetch == "all":
                result = cursor.fetchall()
                return [cls._serialize_row(dict(row)) for row in result] if result else []
            elif fetch == "one":
                result = cursor.fetchone()
                return cls._serialize_row(dict(result)) if result else None
            else:
                conn.commit()
                return None

    @staticmethod
    def _serialize_row(row: Dict) -> Dict:
        """Convert date/datetime/time objects to ISO format strings"""
        for key, value in row.items():
            if isinstance(value, (date, datetime, time)):
                row[key] = value.isoformat()
        return row

    @classmethod
    def close(cls):
        """Close all database connections"""
        if cls._pool:
            cls._pool.closeall()
            print("✓ Database connections closed")


# Database utility functions

def get_patient(patient_id: str) -> Optional[Dict]:
    """Get patient by ID"""
    query = "SELECT * FROM patients WHERE id = %s"
    return Database.execute(query, (patient_id,), fetch="one")


def create_patient(patient_data: Dict) -> Dict:
    """Create a new patient"""
    query = """
        INSERT INTO patients (id, name, email, phone, date_of_birth, gender, medical_history)
        VALUES (%(id)s, %(name)s, %(email)s, %(phone)s, %(dateOfBirth)s, %(gender)s, %(medicalHistory)s)
        RETURNING *
    """
    Database.execute(query, patient_data, fetch="none")
    return get_patient(patient_data['id'])


def update_patient(patient_id: str, updates: Dict) -> Optional[Dict]:
    """Update patient information"""
    set_clauses = []
    params = {}

    field_mapping = {
        'name': 'name',
        'email': 'email',
        'phone': 'phone',
        'dateOfBirth': 'date_of_birth',
        'gender': 'gender',
        'medicalHistory': 'medical_history'
    }

    for key, db_field in field_mapping.items():
        if key in updates and updates[key] is not None:
            set_clauses.append(f"{db_field} = %({db_field})s")
            params[db_field] = updates[key]

    if not set_clauses:
        return get_patient(patient_id)

    params['id'] = patient_id
    query = f"""
        UPDATE patients
        SET {', '.join(set_clauses)}
        WHERE id = %(id)s
        RETURNING *
    """

    Database.execute(query, params, fetch="none")
    return get_patient(patient_id)


def get_all_patients() -> List[Dict]:
    """Get all patients"""
    query = "SELECT * FROM patients ORDER BY created_at DESC"
    return Database.execute(query, fetch="all")


def delete_patient(patient_id: str) -> bool:
    """Delete a patient"""
    query = "DELETE FROM patients WHERE id = %s"
    Database.execute(query, (patient_id,), fetch="none")
    return True


def create_scan(scan_data: Dict, detections: List[Dict], image_data: bytes) -> str:
    """Create a new scan with detections and image"""
    scan_id = scan_data['scanId']

    # Insert scan
    scan_query = """
        INSERT INTO scans (
            id, patient_id, status, upload_time, processing_time,
            detected, confidence, risk_level, top_class,
            file_size, image_format, image_width, image_height
        ) VALUES (
            %(scanId)s, %(patientId)s, %(status)s, %(uploadTime)s, %(processingTime)s,
            %(detected)s, %(confidence)s, %(riskLevel)s, %(topClass)s,
            %(fileSize)s, %(format)s, %(width)s, %(height)s
        )
    """

    params = {
        'scanId': scan_id,
        'patientId': scan_data.get('patientId', 'unknown'),
        'status': scan_data['status'],
        'uploadTime': scan_data['uploadTime'],
        'processingTime': scan_data['processingTime'],
        'detected': scan_data['results']['detected'],
        'confidence': scan_data['results']['confidence'],
        'riskLevel': scan_data['results']['riskLevel'],
        'topClass': scan_data['results']['topClass'],
        'fileSize': scan_data['metadata']['fileSize'],
        'format': scan_data['metadata']['format'],
        'width': scan_data['metadata']['imageSize']['width'],
        'height': scan_data['metadata']['imageSize']['height']
    }

    Database.execute(scan_query, params, fetch="none")

    # Insert detections
    if detections:
        detection_query = """
            INSERT INTO detections (
                scan_id, class_name, confidence,
                bbox_x, bbox_y, bbox_width, bbox_height,
                size_mm, shape, density
            ) VALUES (
                %(scan_id)s, %(class)s, %(confidence)s,
                %(x)s, %(y)s, %(width)s, %(height)s,
                %(size_mm)s, %(shape)s, %(density)s
            )
        """

        for det in detections:
            det_params = {
                'scan_id': scan_id,
                'class': det['class'],
                'confidence': det['confidence'],
                'x': det['boundingBox']['x'],
                'y': det['boundingBox']['y'],
                'width': det['boundingBox']['width'],
                'height': det['boundingBox']['height'],
                'size_mm': det['characteristics']['size_mm'],
                'shape': det['characteristics']['shape'],
                'density': det['characteristics']['density']
            }
            Database.execute(detection_query, det_params, fetch="none")

    # Store image
    image_query = "INSERT INTO scan_images (scan_id, original_image) VALUES (%s, %s)"
    Database.execute(image_query, (scan_id, psycopg2.Binary(image_data)), fetch="none")

    return scan_id


def get_scan(scan_id: str) -> Optional[Dict]:
    """Get scan by ID with detections"""
    scan_query = "SELECT * FROM scans WHERE id = %s"
    scan = Database.execute(scan_query, (scan_id,), fetch="one")

    if not scan:
        return None

    # Get detections
    detections_query = "SELECT * FROM detections WHERE scan_id = %s"
    detections = Database.execute(detections_query, (scan_id,), fetch="all")

    # Format response
    # Handle upload_time - it might be a string or datetime object
    upload_time = scan['upload_time']
    if isinstance(upload_time, str):
        upload_time_str = upload_time
    else:
        upload_time_str = upload_time.isoformat()

    return {
        'scanId': scan['id'],
        'status': scan['status'],
        'uploadTime': upload_time_str,
        'processingTime': scan['processing_time'],
        'results': {
            'detected': scan['detected'],
            'confidence': scan['confidence'],
            'riskLevel': scan['risk_level'],
            'topClass': scan['top_class'],
            'detections': [
                {
                    'class': d['class_name'],
                    'confidence': d['confidence'],
                    'boundingBox': {
                        'x': d['bbox_x'],
                        'y': d['bbox_y'],
                        'width': d['bbox_width'],
                        'height': d['bbox_height']
                    },
                    'characteristics': {
                        'size_mm': d['size_mm'],
                        'shape': d['shape'],
                        'density': d['density']
                    }
                }
                for d in detections
            ]
        },
        'metadata': {
            'imageSize': {
                'width': scan['image_width'],
                'height': scan['image_height']
            },
            'fileSize': scan['file_size'],
            'format': scan['image_format']
        }
    }


def get_scan_image(scan_id: str) -> Optional[bytes]:
    """Get scan image data"""
    query = "SELECT original_image FROM scan_images WHERE scan_id = %s"
    result = Database.execute(query, (scan_id,), fetch="one")
    return bytes(result['original_image']) if result else None


def get_patient_scans(patient_id: str) -> List[Dict]:
    """Get all scans for a patient"""
    query = """
        SELECT id, upload_time, status, risk_level, confidence, detected
        FROM scans
        WHERE patient_id = %s
        ORDER BY upload_time DESC
    """
    return Database.execute(query, (patient_id,), fetch="all")


def create_appointment(appointment_data: Dict) -> Dict:
    """Create a new appointment"""
    query = """
        INSERT INTO appointments (
            id, patient_id, doctor_id, doctor_name,
            appointment_date, appointment_time, type, status, notes
        ) VALUES (
            %(id)s, %(patientId)s, %(doctorId)s, %(doctorName)s,
            %(date)s, %(time)s, %(type)s, %(status)s, %(notes)s
        ) RETURNING *
    """
    Database.execute(query, appointment_data, fetch="none")

    get_query = "SELECT * FROM appointments WHERE id = %s"
    return Database.execute(get_query, (appointment_data['id'],), fetch="one")


def get_patient_appointments(patient_id: str) -> List[Dict]:
    """Get all appointments for a patient"""
    query = """
        SELECT * FROM appointments
        WHERE patient_id = %s
        ORDER BY appointment_date DESC, appointment_time DESC
    """
    return Database.execute(query, (patient_id,), fetch="all")


def create_message(message_data: Dict) -> Dict:
    """Create a new message"""
    query = """
        INSERT INTO messages (
            id, sender_id, sender_name, sender_role,
            receiver_id, receiver_name, content
        ) VALUES (
            %(id)s, %(senderId)s, %(senderName)s, %(senderRole)s,
            %(receiverId)s, %(receiverName)s, %(content)s
        ) RETURNING *
    """
    Database.execute(query, message_data, fetch="none")

    get_query = "SELECT * FROM messages WHERE id = %s"
    return Database.execute(get_query, (message_data['id'],), fetch="one")


def get_user_messages(user_id: str) -> List[Dict]:
    """Get all messages for a user"""
    query = """
        SELECT * FROM messages
        WHERE sender_id = %s OR receiver_id = %s
        ORDER BY created_at DESC
    """
    return Database.execute(query, (user_id, user_id), fetch="all")


def get_all_doctors() -> List[Dict]:
    """Get all doctors"""
    query = "SELECT * FROM doctors ORDER BY name"
    return Database.execute(query, fetch="all")


def get_doctor(doctor_id: str) -> Optional[Dict]:
    """Get doctor by ID"""
    query = "SELECT * FROM doctors WHERE id = %s"
    return Database.execute(query, (doctor_id,), fetch="one")
