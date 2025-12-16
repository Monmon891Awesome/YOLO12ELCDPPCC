"""
Generate a visual database schema diagram for PneumAI
Creates a professional ERD diagram as PDF
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfgen import canvas
from datetime import datetime

def create_schema_pdf():
    """Create a comprehensive database schema PDF"""
    
    filename = "PneumAI_Database_Schema.pdf"
    doc = SimpleDocTemplate(filename, pagesize=landscape(A4),
                           rightMargin=30, leftMargin=30,
                           topMargin=30, bottomMargin=30)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a365d'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2c5282'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Title
    title = Paragraph("PneumAI Database Schema", title_style)
    subtitle = Paragraph(f"PostgreSQL Database Structure | Generated: {datetime.now().strftime('%B %d, %Y')}", 
                        styles['Normal'])
    elements.append(title)
    elements.append(subtitle)
    elements.append(Spacer(1, 20))
    
    # Database Overview
    overview_data = [
        ['Database Name', 'pneumai_db'],
        ['Database Type', 'PostgreSQL 14+'],
        ['Total Tables', '7'],
        ['Character Set', 'UTF-8'],
    ]
    
    overview_table = Table(overview_data, colWidths=[2.5*inch, 4*inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e6f2ff')),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a365d')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(overview_table)
    elements.append(Spacer(1, 20))
    
    # Define all tables with their schemas
    tables_schema = {
        'patients': {
            'description': 'Stores patient information and medical records',
            'color': '#e6f7ff',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'VARCHAR(50)', 'PRIMARY KEY', 'Unique patient identifier'],
                ['name', 'VARCHAR(255)', 'NOT NULL', 'Patient full name'],
                ['email', 'VARCHAR(255)', 'UNIQUE, NOT NULL', 'Patient email address'],
                ['phone', 'VARCHAR(50)', '', 'Contact phone number'],
                ['date_of_birth', 'DATE', '', 'Patient date of birth'],
                ['gender', 'VARCHAR(20)', '', 'Patient gender'],
                ['medical_history', 'TEXT', '', 'Medical history notes'],
                ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Record creation time'],
                ['updated_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Last update time'],
                ['total_scans', 'INTEGER', 'DEFAULT 0', 'Total number of scans'],
                ['last_visit', 'TIMESTAMP', '', 'Last visit timestamp'],
            ]
        },
        'doctors': {
            'description': 'Healthcare professional information',
            'color': '#f0f9ff',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'VARCHAR(50)', 'PRIMARY KEY', 'Unique doctor identifier'],
                ['name', 'VARCHAR(255)', 'NOT NULL', 'Doctor full name'],
                ['email', 'VARCHAR(255)', 'UNIQUE, NOT NULL', 'Doctor email address'],
                ['phone', 'VARCHAR(50)', '', 'Contact phone number'],
                ['specialization', 'VARCHAR(100)', '', 'Medical specialization'],
                ['license_number', 'VARCHAR(100)', '', 'Medical license number'],
                ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Record creation time'],
                ['updated_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Last update time'],
            ]
        },
        'scans': {
            'description': 'CT scan metadata and analysis results',
            'color': '#fff0f0',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'VARCHAR(50)', 'PRIMARY KEY', 'Unique scan identifier'],
                ['patient_id', 'VARCHAR(50)', 'FOREIGN KEY → patients(id)', 'Reference to patient'],
                ['status', 'VARCHAR(50)', 'NOT NULL', 'Processing status'],
                ['upload_time', 'TIMESTAMP', 'DEFAULT NOW()', 'Upload timestamp'],
                ['processing_time', 'REAL', '', 'Processing duration (seconds)'],
                ['detected', 'BOOLEAN', '', 'Cancer detected flag'],
                ['confidence', 'REAL', '', 'Detection confidence (0-1)'],
                ['risk_level', 'VARCHAR(20)', '', 'Risk level (none/low/medium/high)'],
                ['top_class', 'VARCHAR(100)', '', 'Detected cancer type'],
                ['file_size', 'INTEGER', '', 'File size in bytes'],
                ['image_format', 'VARCHAR(20)', '', 'Image format (DICOM/JPEG/PNG)'],
                ['image_width', 'INTEGER', '', 'Image width in pixels'],
                ['image_height', 'INTEGER', '', 'Image height in pixels'],
                ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Record creation time'],
            ]
        },
        'detections': {
            'description': 'Individual cancer detections from YOLOv12 analysis',
            'color': '#fff5f5',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'SERIAL', 'PRIMARY KEY', 'Auto-increment ID'],
                ['scan_id', 'VARCHAR(50)', 'FOREIGN KEY → scans(id)', 'Reference to scan'],
                ['class_name', 'VARCHAR(100)', '', 'Cancer type detected'],
                ['confidence', 'REAL', '', 'Detection confidence (0-1)'],
                ['bbox_x', 'INTEGER', '', 'Bounding box X coordinate'],
                ['bbox_y', 'INTEGER', '', 'Bounding box Y coordinate'],
                ['bbox_width', 'INTEGER', '', 'Bounding box width'],
                ['bbox_height', 'INTEGER', '', 'Bounding box height'],
                ['size_mm', 'REAL', '', 'Lesion size in millimeters'],
                ['shape', 'VARCHAR(50)', '', 'Lesion shape description'],
                ['density', 'VARCHAR(50)', '', 'Lesion density description'],
            ]
        },
        'appointments': {
            'description': 'Patient-doctor appointment scheduling',
            'color': '#f0fff4',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'VARCHAR(50)', 'PRIMARY KEY', 'Unique appointment ID'],
                ['patient_id', 'VARCHAR(50)', 'FOREIGN KEY → patients(id)', 'Reference to patient'],
                ['doctor_id', 'VARCHAR(50)', 'FOREIGN KEY → doctors(id)', 'Reference to doctor'],
                ['doctor_name', 'VARCHAR(255)', '', 'Doctor name (denormalized)'],
                ['appointment_date', 'DATE', 'NOT NULL', 'Appointment date'],
                ['appointment_time', 'TIME', 'NOT NULL', 'Appointment time'],
                ['type', 'VARCHAR(100)', '', 'Appointment type'],
                ['status', 'VARCHAR(50)', 'DEFAULT scheduled', 'Appointment status'],
                ['notes', 'TEXT', '', 'Appointment notes'],
                ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Record creation time'],
                ['updated_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Last update time'],
            ]
        },
        'messages': {
            'description': 'Patient-doctor communication messages',
            'color': '#fffbeb',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'VARCHAR(50)', 'PRIMARY KEY', 'Unique message ID'],
                ['sender_id', 'VARCHAR(50)', 'NOT NULL', 'Sender user ID'],
                ['sender_name', 'VARCHAR(255)', 'NOT NULL', 'Sender name'],
                ['sender_role', 'VARCHAR(50)', 'NOT NULL', 'Sender role (patient/doctor)'],
                ['receiver_id', 'VARCHAR(50)', 'NOT NULL', 'Receiver user ID'],
                ['receiver_name', 'VARCHAR(255)', 'NOT NULL', 'Receiver name'],
                ['content', 'TEXT', 'NOT NULL', 'Message content'],
                ['read', 'BOOLEAN', 'DEFAULT FALSE', 'Read status flag'],
                ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Message timestamp'],
            ]
        },
        'scan_comments': {
            'description': 'Comments and feedback on scan results',
            'color': '#faf5ff',
            'columns': [
                ['Column Name', 'Data Type', 'Constraints', 'Description'],
                ['id', 'SERIAL', 'PRIMARY KEY', 'Auto-increment ID'],
                ['scan_id', 'VARCHAR(50)', 'FOREIGN KEY → scans(id)', 'Reference to scan'],
                ['user_id', 'VARCHAR(100)', 'NOT NULL', 'Commenter user ID'],
                ['user_role', 'VARCHAR(20)', 'NOT NULL', 'Commenter role'],
                ['user_name', 'VARCHAR(100)', 'NOT NULL', 'Commenter name'],
                ['comment_text', 'TEXT', 'NOT NULL', 'Comment content'],
                ['parent_comment_id', 'INTEGER', 'FOREIGN KEY → scan_comments(id)', 'Parent comment (for replies)'],
                ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Comment timestamp'],
                ['updated_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Last update time'],
            ]
        },
    }
    
    # Create table for each schema
    for table_name, table_info in tables_schema.items():
        # Table heading
        heading = Paragraph(f"<b>{table_name.upper()}</b>", heading_style)
        elements.append(heading)
        
        # Description
        desc = Paragraph(f"<i>{table_info['description']}</i>", styles['Normal'])
        elements.append(desc)
        elements.append(Spacer(1, 10))
        
        # Create table
        table_data = table_info['columns']
        col_widths = [2*inch, 1.5*inch, 2*inch, 3*inch]
        
        t = Table(table_data, colWidths=col_widths)
        t.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor(table_info['color'])),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1a365d')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(t)
        elements.append(Spacer(1, 15))
        
        # Page break after scans table for better layout
        if table_name == 'scans':
            elements.append(PageBreak())
    
    # Add relationships page
    elements.append(PageBreak())
    elements.append(Paragraph("Database Relationships", title_style))
    elements.append(Spacer(1, 20))
    
    relationships_data = [
        ['From Table', 'To Table', 'Relationship Type', 'Description'],
        ['scans', 'patients', 'Many-to-One', 'Each scan belongs to one patient'],
        ['detections', 'scans', 'Many-to-One', 'Each detection belongs to one scan'],
        ['appointments', 'patients', 'Many-to-One', 'Each appointment has one patient'],
        ['appointments', 'doctors', 'Many-to-One', 'Each appointment has one doctor'],
        ['scan_comments', 'scans', 'Many-to-One', 'Each comment belongs to one scan'],
        ['scan_comments', 'scan_comments', 'Self-referencing', 'Comments can reply to other comments'],
    ]
    
    rel_table = Table(relationships_data, colWidths=[2*inch, 2*inch, 2*inch, 3.5*inch])
    rel_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1a365d')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(rel_table)
    elements.append(Spacer(1, 30))
    
    # Add indexes section
    elements.append(Paragraph("Database Indexes", heading_style))
    elements.append(Spacer(1, 10))
    
    indexes_data = [
        ['Index Name', 'Table', 'Column(s)', 'Purpose'],
        ['idx_scans_patient_id', 'scans', 'patient_id', 'Fast patient scan lookups'],
        ['idx_scans_upload_time', 'scans', 'upload_time', 'Chronological scan queries'],
        ['idx_appointments_patient_id', 'appointments', 'patient_id', 'Patient appointment lookups'],
        ['idx_appointments_doctor_id', 'appointments', 'doctor_id', 'Doctor appointment lookups'],
        ['idx_appointments_date', 'appointments', 'appointment_date', 'Date-based queries'],
        ['idx_messages_sender_id', 'messages', 'sender_id', 'Sender message lookups'],
        ['idx_messages_receiver_id', 'messages', 'receiver_id', 'Receiver message lookups'],
        ['idx_detections_scan_id', 'detections', 'scan_id', 'Scan detection lookups'],
        ['idx_scan_comments_scan_id', 'scan_comments', 'scan_id', 'Scan comment lookups'],
    ]
    
    idx_table = Table(indexes_data, colWidths=[2.5*inch, 1.8*inch, 2*inch, 3.2*inch])
    idx_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1a365d')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(idx_table)
    
    # Build PDF
    doc.build(elements)
    print(f"✓ Database schema PDF created: {filename}")
    return filename

if __name__ == "__main__":
    create_schema_pdf()
