# Chapter 4: Project Development

## 4.1 Project Design

This section delineates the architectural framework, design decisions, and technological infrastructure of the *Integrated YOLOv12-Powered Platform for Lung Cancer Detection and Patient-Physician Collaborative Care*. The system was engineered as a proof-of-concept web-based coordination platform designed to bridge the gap between advanced artificial intelligence (AI) diagnostics and clinical workflow efficiency within the context of the Philippine healthcare system.

### 4.1.1 System Architecture Overview

The platform employs a robust **three-tier architecture**, separating the system into the Presentation Layer, the Application Layer, and the Data Layer. This architectural pattern was selected to ensure modularity, scalability, and ease of maintenance, allowing independent development and updates for each component without disrupting the entire system.

1.  **Presentation Layer (Frontend)**: This layer serves as the user interface (UI) for both patients and healthcare professionals. It is responsible for collecting user inputs (e.g., CT scan uploads, symptom reporting) and visualizing system outputs (e.g., AI analysis results, risk assessments).
2.  **Application Layer (Backend)**: Acting as the logic core, this layer hosts the RESTful API services and the AI inference engine. It processes requests from the frontend, orchestrates data flow, executes the YOLOv12n model for image analysis, and handles authentication and business logic.
3.  **Data Layer (Storage)**: This layer manages the persistence of user profiles, medical records, scan metadata, and communication logs. It ensures data integrity and secure retrieval of sensitive medical information.

[Figure 4.1: High-Level System Architecture Diagram]

### 4.1.2 Frontend Architecture

The frontend was developed using **React**, a declarative JavaScript library for building user interfaces. The choice of React was driven by its component-based architecture, which facilitated the creation of reusable UI elements (e.g., navigation bars, scan upload components, result cards) and ensured a responsive, single-page application (SPA) experience.

The presentation layer is divided into two distinct portals:
*   **Patient Portal**: Designed with a focus on accessibility and simplicity, allowing users to register, upload chest CT scans, view preliminary AI screening results, and communicate with assigned physicians.
*   **Physician Dashboard**: A comprehensive interface for healthcare providers to review patient uploads, validate AI findings, manage appointments via a dedicated scheduling module, and communicate with patients through an integrated messaging system. It also includes a help section for reporting system issues.

State management was handled using React Hooks (e.g., `useState`, `useEffect`) and Context API to maintain data consistency across different views, such as synchronizing the doctor list and message threads in real-time.

### 4.1.3 Backend Services and API Design

The Application Layer was implemented using **FastAPI**, a modern, high-performance web framework for building APIs with Python. FastAPI was selected over traditional frameworks like Flask due to its asynchronous capabilities, automatic validation of data types, and superior performance, which is critical for handling image processing tasks and concurrent user requests.

The backend exposes a suite of **REST API endpoints** that facilitate communication between the frontend and the server. Key endpoints include:
*   `POST /api/auth/login`: Handles user authentication and session token generation.
*   `POST /api/scan/analyze`: Receives CT scan images, triggers the YOLOv12n inference pipeline, and returns detection results.
*   `GET /api/patients/{id}/history`: Retrieves a patient's historical scan data and medical records.
*   `POST /api/messages/send`: Facilitates secure messaging between patients and doctors.

### 4.1.4 AI Model Integration

The core diagnostic capability of the platform is powered by **YOLOv12n (You Only Look Once, version 12 nano)**, integrated as a microservice within the backend architecture. While YOLO models are traditionally associated with real-time object detection in video, YOLOv12n was chosen for this medical application due to its exceptional balance of inference speed and detection accuracy, making it suitable for web-based deployment where low latency is essential.

The model was trained to detect and classify three specific classes:
1.  **Adenocarcinoma**
2.  **Squamous Cell Carcinoma**
3.  **Normal Tissue**

The integration involves loading the trained PyTorch model weights into the FastAPI server memory upon startup. When an image is received via the `/analyze` endpoint, it undergoes preprocessing (resizing and normalization) before being passed to the model for inference. The output—bounding box coordinates, class labels, and confidence scores—is then structured into a JSON response for the frontend.

### 4.1.5 Data Flow and Processing Pipeline

The data flow within the system follows a linear, secure pipeline designed to minimize latency while ensuring data integrity:

1.  **Image Acquisition**: The user uploads a chest CT scan (DICOM, JPEG, or PNG format) via the Patient Portal.
2.  **Preprocessing**: The backend receives the image and applies **OpenCV**-based techniques. This includes medical windowing to enhance lung tissue contrast and resizing the image to the model's input dimension (640x640 pixels).
3.  **AI Inference**: The preprocessed image is fed into the YOLOv12n model. The model scans the image for patterns indicative of Adenocarcinoma or Squamous Cell Carcinoma.
4.  **Post-processing**: Raw model outputs are filtered based on a confidence threshold (set at 0.25) to reduce false positives. Non-Maximum Suppression (NMS) is applied to eliminate overlapping bounding boxes.
5.  **Result Presentation**: The final detection data is sent back to the frontend, where it is overlaid on the original image using HTML5 Canvas or SVG elements, presenting the user with a visual localization of the potential abnormality alongside a textual risk assessment.

[Figure 4.2: Data Flow Diagram of the Image Analysis Pipeline]

### 4.1.6 Security and Privacy Considerations

Given the sensitive nature of medical data, security was a paramount concern in the project design. Although this is a proof-of-concept platform, standard security practices were implemented:
*   **User Authentication**: Secure login mechanisms were established for both patients and doctors to prevent unauthorized access.
*   **Data Privacy**: Patient data is logically separated in the database. The system design adheres to the principle of least privilege, ensuring that only authorized physicians can access specific patient records.
*   **Input Validation**: All API endpoints include rigorous validation to prevent injection attacks and ensure that uploaded files are valid image formats.

## 4.2 Development Planning

The development of the platform followed an **Agile methodology**, specifically adopting an iterative approach. This allowed the team to continuously refine features based on testing feedback and adapt to technical challenges, such as model integration complexities, without derailing the overall project timeline.

### 4.2.1 Development Phases

The project lifecycle was structured into five distinct phases spanning a 16-week timeline:

**Phase 1: Dataset Preparation and Preprocessing (Weeks 1-3)**
The initial phase focused on curating the data required for training the AI model. The **Mohamed Kany Chest Cancer Dataset** was sourced from Kaggle, containing approximately 1,000 CT scan images. Tasks included data cleaning, removing low-quality images, and formatting annotations to the YOLO standard. Data augmentation techniques (rotation, flipping, brightness adjustment) were applied to increase dataset diversity and prevent overfitting.

**Phase 2: YOLOv12n Model Training and Validation (Weeks 4-7)**
Model training was conducted using **Google Colab** to leverage its GPU resources. The YOLOv12n architecture was fine-tuned on the prepared dataset. This phase involved iterative experiments with hyperparameters (learning rate, batch size, epochs) to optimize performance. Cross-dataset validation was performed using the **TCIA VAREPOP-APOLLO collection** to ensure the model's generalizability to unseen data sources.

**Phase 3: Backend API Development (Weeks 8-10)**
Parallel to model training, the backend infrastructure was built. This involved setting up the FastAPI environment, designing the database schema, and developing the REST API endpoints. A key focus was creating the wrapper functions to interface the Python-based AI model with the web server logic.

**Phase 4: Frontend Interface Development (Weeks 11-13)**
The user interfaces were developed using React. This phase focused on translating the UI/UX designs into functional code. The Patient Portal was built first to facilitate image uploads, followed by the Physician Dashboard. Emphasis was placed on creating a responsive design that functions seamlessly across desktop and mobile devices.

**Phase 5: Integration and Testing (Weeks 14-16)**
The final phase involved connecting the frontend and backend components. The team conducted rigorous integration testing to ensure data flowed correctly from the upload interface to the AI model and back to the results display. Deployment pipelines were established on Vercel and Render.com.

### 4.2.2 Timeline and Task Distribution

A Gantt chart was utilized to track progress and dependencies. The development team consisted of three members, with tasks distributed according to individual strengths and technical expertise:

*   **Nicolas (Backend & AI Specialist)**: Responsible for the backend API architecture, training and integrating the YOLOv12n model, and managing cloud deployment on Render.com. Nicolas led the technical implementation of the image processing pipeline.
*   **Sta. Ana (Frontend Developer - Patient Portal)**: Focused on the patient-facing aspects of the application. Responsibilities included developing the registration and login flows, the image upload interface, and the result visualization components, ensuring a user-friendly experience for non-technical users.
*   **Tañada (Frontend Developer - Physician Dashboard)**: In charge of the doctor's interface and testing coordination. Tasks included building the dashboard for reviewing scans, implementing the messaging system, and organizing the functionality testing protocols.

[Figure 4.3: Project Gantt Chart]

### 4.2.3 Challenges and Solutions

Several challenges were encountered during the development process:
*   **Data Imbalance**: The initial dataset had fewer samples for Squamous Cell Carcinoma compared to Adenocarcinoma. *Solution*: We applied targeted data augmentation (e.g., synthetic minority over-sampling) to balance the class distribution during training.
*   **Integration Latency**: Initial API responses were slow due to the model loading time. *Solution*: We optimized the backend to load the model weights once during server startup rather than per request, significantly reducing inference time.
*   **Deployment Constraints**: The free tier of Render.com had memory limitations that caused the server to crash with large images. *Solution*: We implemented client-side image compression and server-side resizing to 640px before processing to stay within memory limits.

## 4.3 Evaluation of the Project

This section presents the evaluation of the developed platform, focusing on system functionality, deployment performance, and user acceptance. Note that the specific performance metrics of the YOLOv12n model (e.g., precision, recall, F1-score) are detailed separately in Chapter 5.

### 4.3.1 System Functionality Testing

Comprehensive testing was conducted to verify that the system met all functional requirements defined in the design phase.

*   **Unit Testing**: Individual backend endpoints were tested using Postman. The `/analyze` endpoint was verified to correctly accept image files and return JSON objects with the expected structure (bounding boxes, classes, confidence).
*   **Integration Testing**: The connectivity between the React frontend and FastAPI backend was tested under various network conditions. We confirmed that user sessions persisted correctly, data uploaded by patients appeared in real-time on the physician's dashboard, and the appointment and messaging modules functioned seamlessly across user roles.
*   **Image Processing Pipeline**: The system was tested with various CT scan formats and qualities. The medical windowing preprocessing was confirmed to enhance image clarity for the AI model without introducing artifacts.
*   **Performance Metrics**: The average processing time per CT scan—from upload to result display—was measured at approximately **2.8 seconds** under normal network conditions. This falls well within the acceptable range for a web-based screening tool.
*   **Reliability**: The system demonstrated high reliability during stress testing, successfully handling concurrent uploads from multiple users without service interruption.

### 4.3.2 Deployment and Accessibility

The platform was successfully deployed to a cloud environment to demonstrate its accessibility as a web-based solution.

*   **Deployment Platforms**: The React frontend was deployed on **Vercel**, taking advantage of its global CDN for fast content delivery. The FastAPI backend and YOLOv12n model were containerized and deployed on **Render.com**.
*   **Accessibility**: The web application is accessible via any standard web browser (Chrome, Firefox, Safari) without the need for local software installation. This "zero-footprint" approach is crucial for the Philippine healthcare context, where hardware resources in rural clinics may be limited.
*   **Responsiveness**: The interface was verified to be fully responsive, adapting its layout for desktop monitors, tablets, and mobile phones. This ensures that physicians can review cases on the go and patients can access their results from their smartphones.
*   **Scalability**: The modular architecture allows for horizontal scalability. The backend service can be replicated across multiple instances to handle increased traffic, and the database can be migrated to a dedicated cloud solution (e.g., AWS RDS) for production use.

### 4.3.3 Expert Evaluation

To assess the platform's potential clinical utility and usability, a preliminary expert evaluation was conducted.

*   **Methodology**: A standardized survey based on the **System Usability Scale (SUS)** and the **Technology Acceptance Model (TAM)** was distributed to a focus group.
*   **Participants**: The evaluation group consisted of 10 participants, including 2 licensed radiologists, 3 general practitioners, 3 medical technology students, and 2 AI researchers.
*   **Qualitative Feedback**:
    *   *Clinical Utility*: Healthcare professionals praised the "collaborative" aspect of the platform, noting that while the AI diagnosis is preliminary, the workflow tools (messaging, centralized history) significantly streamline the screening process.
    *   *Usability*: The interface was described as "clean" and "intuitive." The visual overlay of detection boxes was highlighted as a valuable feature for explaining results to patients.
    *   *Speed*: Participants were impressed by the near-instantaneous analysis, stating it could serve as an effective triage tool in high-volume settings.
*   **Recommendations**: Experts suggested adding a feature for manual annotation correction by doctors to create a feedback loop for model retraining. They also recommended integrating DICOM viewer capabilities for more detailed radiological analysis in future iterations.

[Table 4.1: Summary of Expert Survey Ratings]

In conclusion, the development and evaluation phases confirm that the platform successfully integrates state-of-the-art computer vision with a practical clinical workflow. The system functions reliably as a proof-of-concept, offering a tangible solution for improving lung cancer screening accessibility and coordination.
