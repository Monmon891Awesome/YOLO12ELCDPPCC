"""
Create a professional ERD graph using graphviz
"""

from graphviz import Digraph
import os

def create_erd():
    """Create Entity Relationship Diagram"""
    
    # Create a new directed graph
    dot = Digraph(comment='PneumAI Database Schema', format='pdf')
    dot.attr(rankdir='TB', splines='ortho', nodesep='0.8', ranksep='1.2')
    dot.attr('node', shape='plaintext', fontname='Helvetica')
    dot.attr('graph', bgcolor='white', pad='0.5', fontname='Helvetica-Bold', fontsize='20')
    
    # Title
    dot.attr(label='PneumAI Database Schema\\nEntity Relationship Diagram', 
             labelloc='t', fontsize='24')
    
    # Define tables as HTML-like labels
    
    # PATIENTS table
    patients_label = '''<
    <TABLE BORDER="2" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#E6F2FF">
        <TR><TD COLSPAN="3" BGCOLOR="#2C5282"><FONT COLOR="white"><B>PATIENTS</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT">name</TD><TD ALIGN="LEFT">VARCHAR(255)</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">email</TD><TD ALIGN="LEFT">VARCHAR(255)</TD><TD ALIGN="LEFT">UNIQUE</TD></TR>
        <TR><TD ALIGN="LEFT">phone</TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">date_of_birth</TD><TD ALIGN="LEFT">DATE</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">gender</TD><TD ALIGN="LEFT">VARCHAR(20)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">medical_history</TD><TD ALIGN="LEFT">TEXT</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">total_scans</TD><TD ALIGN="LEFT">INTEGER</TD><TD ALIGN="LEFT">DEFAULT 0</TD></TR>
    </TABLE>>'''
    
    # DOCTORS table
    doctors_label = '''<
    <TABLE BORDER="2" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#E0F7FA">
        <TR><TD COLSPAN="3" BGCOLOR="#00838F"><FONT COLOR="white"><B>DOCTORS</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT">name</TD><TD ALIGN="LEFT">VARCHAR(255)</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">email</TD><TD ALIGN="LEFT">VARCHAR(255)</TD><TD ALIGN="LEFT">UNIQUE</TD></TR>
        <TR><TD ALIGN="LEFT">specialization</TD><TD ALIGN="LEFT">VARCHAR(100)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">license_number</TD><TD ALIGN="LEFT">VARCHAR(100)</TD><TD ALIGN="LEFT"></TD></TR>
    </TABLE>>'''
    
    # SCANS table (central)
    scans_label = '''<
    <TABLE BORDER="3" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#FFEBEE">
        <TR><TD COLSPAN="3" BGCOLOR="#C62828"><FONT COLOR="white"><B>SCANS</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT"><I>patient_id (FK)</I></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">FOREIGN KEY</TD></TR>
        <TR><TD ALIGN="LEFT">status</TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">upload_time</TD><TD ALIGN="LEFT">TIMESTAMP</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">detected</TD><TD ALIGN="LEFT">BOOLEAN</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">confidence</TD><TD ALIGN="LEFT">REAL</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">risk_level</TD><TD ALIGN="LEFT">VARCHAR(20)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">top_class</TD><TD ALIGN="LEFT">VARCHAR(100)</TD><TD ALIGN="LEFT"></TD></TR>
    </TABLE>>'''
    
    # DETECTIONS table
    detections_label = '''<
    <TABLE BORDER="2" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#FFF3E0">
        <TR><TD COLSPAN="3" BGCOLOR="#E65100"><FONT COLOR="white"><B>DETECTIONS</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">SERIAL</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT"><I>scan_id (FK)</I></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">FOREIGN KEY</TD></TR>
        <TR><TD ALIGN="LEFT">class_name</TD><TD ALIGN="LEFT">VARCHAR(100)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">confidence</TD><TD ALIGN="LEFT">REAL</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">bbox_x, bbox_y</TD><TD ALIGN="LEFT">INTEGER</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">bbox_width, height</TD><TD ALIGN="LEFT">INTEGER</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">size_mm</TD><TD ALIGN="LEFT">REAL</TD><TD ALIGN="LEFT"></TD></TR>
    </TABLE>>'''
    
    # APPOINTMENTS table
    appointments_label = '''<
    <TABLE BORDER="2" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#E8F5E9">
        <TR><TD COLSPAN="3" BGCOLOR="#2E7D32"><FONT COLOR="white"><B>APPOINTMENTS</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT"><I>patient_id (FK)</I></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">FOREIGN KEY</TD></TR>
        <TR><TD ALIGN="LEFT"><I>doctor_id (FK)</I></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">FOREIGN KEY</TD></TR>
        <TR><TD ALIGN="LEFT">appointment_date</TD><TD ALIGN="LEFT">DATE</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">appointment_time</TD><TD ALIGN="LEFT">TIME</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">status</TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT"></TD></TR>
    </TABLE>>'''
    
    # MESSAGES table
    messages_label = '''<
    <TABLE BORDER="2" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#FFFDE7">
        <TR><TD COLSPAN="3" BGCOLOR="#F57F17"><FONT COLOR="white"><B>MESSAGES</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT">sender_id</TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">receiver_id</TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">NOT NULL</TD></TR>
        <TR><TD ALIGN="LEFT">sender_role</TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">content</TD><TD ALIGN="LEFT">TEXT</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">read</TD><TD ALIGN="LEFT">BOOLEAN</TD><TD ALIGN="LEFT">DEFAULT FALSE</TD></TR>
    </TABLE>>'''
    
    # SCAN_COMMENTS table
    comments_label = '''<
    <TABLE BORDER="2" CELLBORDER="1" CELLSPACING="0" CELLPADDING="8" BGCOLOR="#F3E5F5">
        <TR><TD COLSPAN="3" BGCOLOR="#6A1B9A"><FONT COLOR="white"><B>SCAN_COMMENTS</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id (PK)</B></TD><TD ALIGN="LEFT">SERIAL</TD><TD ALIGN="LEFT">PRIMARY KEY</TD></TR>
        <TR><TD ALIGN="LEFT"><I>scan_id (FK)</I></TD><TD ALIGN="LEFT">VARCHAR(50)</TD><TD ALIGN="LEFT">FOREIGN KEY</TD></TR>
        <TR><TD ALIGN="LEFT">user_id</TD><TD ALIGN="LEFT">VARCHAR(100)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">user_role</TD><TD ALIGN="LEFT">VARCHAR(20)</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT">comment_text</TD><TD ALIGN="LEFT">TEXT</TD><TD ALIGN="LEFT"></TD></TR>
        <TR><TD ALIGN="LEFT"><I>parent_comment_id (FK)</I></TD><TD ALIGN="LEFT">INTEGER</TD><TD ALIGN="LEFT">FOREIGN KEY</TD></TR>
    </TABLE>>'''
    
    # Add nodes
    dot.node('patients', patients_label)
    dot.node('doctors', doctors_label)
    dot.node('scans', scans_label)
    dot.node('detections', detections_label)
    dot.node('appointments', appointments_label)
    dot.node('messages', messages_label)
    dot.node('comments', comments_label)
    
    # Add edges (relationships)
    # Many scans to one patient
    dot.edge('scans', 'patients', label='  belongs to  ', 
             color='#2C5282', penwidth='2', arrowhead='crow', arrowtail='none')
    
    # Many detections to one scan
    dot.edge('detections', 'scans', label='  from  ', 
             color='#E65100', penwidth='2', arrowhead='crow', arrowtail='none')
    
    # Many appointments to one patient
    dot.edge('appointments', 'patients', label='  for  ', 
             color='#2E7D32', penwidth='2', arrowhead='crow', arrowtail='none')
    
    # Many appointments to one doctor
    dot.edge('appointments', 'doctors', label='  with  ', 
             color='#00838F', penwidth='2', arrowhead='crow', arrowtail='none')
    
    # Many comments to one scan
    dot.edge('comments', 'scans', label='  on  ', 
             color='#6A1B9A', penwidth='2', arrowhead='crow', arrowtail='none')
    
    # Self-referencing for comments (replies)
    dot.edge('comments', 'comments', label='  replies to  ', 
             color='#6A1B9A', penwidth='1.5', style='dashed', 
             arrowhead='crow', constraint='false')
    
    # Render the graph
    output_file = 'PneumAI_ERD_Graph'
    dot.render(output_file, cleanup=True)
    print(f"✓ ERD graph created: {output_file}.pdf")
    
    # Also create PNG version
    dot.format = 'png'
    dot.render(output_file + '_png', cleanup=True)
    print(f"✓ ERD graph created: {output_file}_png.png")
    
    return output_file

if __name__ == "__main__":
    create_erd()
