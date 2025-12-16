# PneumAI Thesis Defense Preparation Guide

## 🏗️ System Architecture "The Run Down"

**PneumAI** is a modern, full-stack web application designed to assist medical professionals in the early detection of lung cancer using Artificial Intelligence.

### 1. The Technology Stack
*   **Frontend (The Face)**: Built with **React.js**. It provides a responsive, Single Page Application (SPA) experience.
    *   **Styling**: Uses **Tailwind CSS** for a modern, clean, and "medical-grade" aesthetic.
    *   **State Management**: Uses React Hooks (`useState`, `useEffect`) and a custom `unifiedDataManager` to handle data consistency across dashboards.
*   **Backend (The Brain)**: Built with **Python FastAPI**.
    *   **Why FastAPI?**: It's incredibly fast (asynchronous), easy to integrate with AI libraries (Python-native), and auto-generates API documentation.
    *   **Communication**: Uses REST API for standard data (saving patients, getting messages) and **WebSockets** for real-time updates (like when a scan finishes processing).
*   **The AI Engine (The Core)**:
    *   **Model**: **YOLOv12** (You Only Look Once, version 12).
    *   **Function**: It takes a CT scan image, passes it through a deep neural network, and outputs:
        1.  **Bounding Boxes**: Where the potential nodule/cancer is.
        2.  **Confidence Score**: How sure the AI is (e.g., 92%).
        3.  **Classification**: What type of abnormality it is.

### 2. How Data Flows
1.  **Upload**: A user (Doctor/Admin) uploads a CT Scan (DICOM/JPG/PNG) via the Frontend.
2.  **Transmission**: The image is sent to the Backend via a `POST` request.
3.  **Processing**:
    *   The Backend saves the file to the `uploads/` directory.
    *   The **YOLOv12 model** loads the image and runs inference.
    *   The model draws a box on the image (Annotation) and calculates risk.
4.  **Storage**:
    *   The original image and the annotated image are saved to the file system.
    *   Metadata (Patient ID, Risk Level, Date) is saved to a JSON file (`scans_metadata.json`).
5.  **Display**: The Frontend receives the results and displays the annotated image, prioritizing the AI's findings.

---

## 🎓 50 Panelist Questions & Answers

### 🔹 General & Problem Statement

**1. Q: What is the primary problem PneumAI solves?**
   *   **A:** It addresses the high rate of misdiagnosis and delayed detection in lung cancer by providing a "second pair of eyes" for radiologists, reducing human error and speeding up the diagnostic process.

**2. Q: Is this intended to replace doctors?**
   *   **A:** Absolutely not. PneumAI is a **Clinical Decision Support System (CDSS)**. It is a tool to *assist* doctors, not replace their judgment. The final diagnosis always rests with the medical professional.

**3. Q: Why did you choose a web-based platform instead of desktop software?**
   *   **A:** Accessibility. A web platform allows doctors to access patient data and run analyses from any authorized device (tablet, hospital computer) without complex installations.

**4. Q: Who are the intended users?**
   *   **A:** There are three main roles: **Patients** (view records/appointments), **Doctors** (analyze scans, manage patients), and **Admins** (system oversight, user management).

**5. Q: What makes PneumAI different from existing CAD (Computer-Aided Detection) systems?**
   *   **A:** PneumAI utilizes **YOLOv12**, a state-of-the-art object detection model known for its speed and accuracy, integrated into a modern, user-friendly dashboard that combines EMR (Electronic Medical Records) features with AI analysis.

### 🔹 Technical Architecture

**6. Q: Why did you choose React for the frontend?**
   *   **A:** React's component-based architecture makes the UI modular and reusable. Its virtual DOM ensures high performance, which is crucial for rendering complex dashboards and image data smoothly.

**7. Q: Why Python FastAPI for the backend?**
   *   **A:** Python is the native language of AI/ML. FastAPI allows us to serve the AI model directly without needing a separate bridge. It also supports asynchronous processing, which is vital for handling multiple scan uploads simultaneously.

**8. Q: How does the frontend communicate with the backend?**
   *   **A:** We use **RESTful APIs** for standard CRUD operations (Create, Read, Update, Delete) and **WebSockets** for real-time events, such as notifying a doctor when a long-running scan analysis is complete.

**9. Q: How is data stored in your system?**
   *   **A:** For this prototype, we use a hybrid approach: **File-Based Persistence** (JSON) for metadata and the **File System** for image storage. In a production environment, this would be migrated to a relational database like PostgreSQL.

**10. Q: What is `ngrok` and why are you using it?**
   *   **A:** Ngrok is a tunneling tool used during development to expose our local backend server to the internet. This allows us to test the application on different devices or networks without deploying to a cloud server immediately.

### 🔹 AI & Machine Learning

**11. Q: Why YOLOv12? Isn't that for real-time video?**
   *   **A:** While YOLO is famous for video, its architecture is extremely efficient at **object detection** in static images too. It processes the entire image in one pass (hence "You Only Look Once"), making it much faster than region-based CNNs like R-CNN, while maintaining high accuracy.

**12. Q: How was the model trained?**
   *   **A:** (Standard Answer): The model was fine-tuned on a labeled dataset of chest CT scans (e.g., LUNA16 or LIDC-IDRI). We used transfer learning, starting with pre-trained weights and adjusting them to recognize lung nodules specifically.

**13. Q: What is the "Confidence Score"?**
   *   **A:** It is a probability value (0-100%) indicating how certain the AI is that the detected object is indeed a nodule. We typically set a threshold (e.g., 50%) to filter out weak predictions.

**14. Q: How do you handle False Positives?**
   *   **A:** We display the confidence score to the doctor. If the score is low (e.g., 40%), the doctor knows to treat it with skepticism. The system is designed to be high-sensitivity (catch everything) rather than missing a potential cancer.

**15. Q: Can the model detect other diseases like Pneumonia?**
   *   **A:** Currently, it is trained specifically for lung nodules/cancer. However, the architecture is scalable; we can retrain the model with new datasets to detect other conditions in the future.

### 🔹 Features & Functionality

**16. Q: Explain the "Messaging System".**
   *   **A:** It allows secure communication between Doctors and Patients. It uses a REST API to send/retrieve messages. In the modern dashboard, we implemented a recipient selector to ensure messages go to the correct user ID.

**17. Q: How does the "Appointment System" work?**
   *   **A:** Patients can request appointments. Doctors see these requests on their dashboard and can "Confirm" or "Cancel" them. The status updates are reflected in real-time for the patient.

**18. Q: What happens if an image fails to load?**
   *   **A:** We implemented robust error handling. If an image URL is broken or the server is down, the UI catches the error and displays a placeholder image or a "No Image Available" state to prevent the app from crashing.

**19. Q: Why do you have "Modern" and "Classic" dashboards?**
   *   **A:** This was part of our A/B testing and UI evolution. The "Classic" dashboard represents a functional MVP, while the "Modern" dashboard demonstrates improved UX/UI principles, dark mode, and better information hierarchy.

**20. Q: How are permissions handled?**
   *   **A:** We use Role-Based Access Control (RBAC). For example, we explicitly removed "Edit" buttons from the Doctor's dashboard to ensure they can view patient data but not alter administrative records.

### 🔹 Security & Ethics

**21. Q: Is patient data secure?**
   *   **A:** In this prototype, we simulate security via login authentication. In a real-world deployment, we would implement **HIPAA-compliant** measures: End-to-End Encryption (E2EE) for messages, encrypted database storage, and strict session management.

**22. Q: What if the AI makes a mistake? Who is liable?**
   *   **A:** This is why it is a *Support System*. The Terms of Service would clearly state that the AI provides **suggestions**, not diagnoses. The liability remains with the attending physician who verifies the AI's findings.

**23. Q: How do you handle user passwords?**
   *   **A:** Currently, they are stored in our mock database. In production, we would use **Hashing (e.g., bcrypt)** and **Salting** to ensure passwords are never stored in plain text.

**24. Q: Can anyone register as a Doctor?**
   *   **A:** No. The system is designed so that only **Admins** can create Doctor accounts. This prevents unauthorized users from accessing sensitive patient data by simply signing up.

**25. Q: What happens to the uploaded images?**
   *   **A:** They are stored on the secure server. We have a data retention policy (simulated) where data is kept for medical history but can be deleted by an Admin if requested (Right to be Forgotten).

### 🔹 Performance & Scalability

**26. Q: What happens if 100 doctors upload scans at once?**
   *   **A:** FastAPI is asynchronous, so it handles concurrent connections well. However, the heavy AI processing might bottleneck the CPU/GPU. To scale, we would use a **Task Queue (like Celery)** to process scans in the background without freezing the server.

**27. Q: How large are the CT scan files?**
   *   **A:** They can be quite large (MBs to GBs). We optimize this by converting them to compressed formats (JPG/PNG) for display in the browser, while keeping the high-res data for the AI analysis.

**28. Q: Does the application work offline?**
   *   **A:** No, it requires an internet connection to communicate with the backend server. However, we could implement **PWA (Progressive Web App)** features to cache some data for offline viewing.

**29. Q: How fast is the analysis?**
   *   **A:** On a standard GPU, YOLOv12 inference takes milliseconds. Including upload and network latency, the user typically sees results in **under 2-3 seconds**.

**30. Q: Can this run on a mobile phone?**
   *   **A:** Yes, the frontend is built with **Tailwind CSS** and is fully responsive. A doctor can view the dashboard and analysis results on a smartphone or tablet.

### 🔹 Development Process

**31. Q: What was the biggest challenge you faced?**
   *   **A:** Integrating the Python backend with the React frontend, specifically handling the image paths for the AI-annotated images. We had to ensure the server correctly exposed the files and the frontend constructed the URLs dynamically.

**32. Q: How did you debug the "Image Not Found" issues?**
   *   **A:** We used browser developer tools to inspect the network requests and console logs. We realized the frontend was trying to load relative paths, so we updated the logic to prepend the backend server's URL.

**33. Q: Why did you use `localStorage` in `unifiedDataManager.js`?**
   *   **A:** It allowed us to rapidly prototype the state management and data persistence across different pages without needing to set up a complex database schema immediately. It simulates a persistent session.

**34. Q: How do you manage code quality?**
   *   **A:** We used modular coding practices (separating logic into `services/` and `utils/`), consistent naming conventions, and extensive logging to track data flow and errors.

**35. Q: Did you use any external libraries for the UI?**
   *   **A:** Yes, **Lucide React** for consistent iconography and **Tailwind CSS** for rapid styling. This prevented us from reinventing the wheel for basic UI elements.

### 🔹 Future Work

**36. Q: What is the next step for this project?**
   *   **A:** Migrating the data storage to a cloud-based SQL database (AWS RDS or PostgreSQL) and deploying the AI model on a dedicated GPU instance for enterprise-level scaling.

**37. Q: Can you add 3D visualization?**
   *   **A:** Yes. We could integrate libraries like **VTK.js** or **Three.js** to render the CT scan slices as a 3D volume, giving doctors a spatial view of the tumor.

**38. Q: How would you improve the AI?**
   *   **A:** We would implement a **Feedback Loop**. If a doctor marks a prediction as "False Positive," that image is saved to a "Retraining Dataset" to improve the model's accuracy in the next version.

**39. Q: Could this integrate with hospital systems?**
   *   **A:** Yes. We would implement **HL7/FHIR** standards to allow PneumAI to exchange data directly with existing hospital Electronic Health Records (EHR) systems.

**40. Q: Will you add multi-language support?**
   *   **A:** Definitely. Using libraries like `react-i18next`, we can easily translate the interface for use in non-English speaking regions.

### 🔹 Rapid Fire / Specific Scenarios

**41. Q: What if the patient forgets their password?**
   *   **A:** An Admin can currently reset it. In production, we would add an "Email Reset Link" flow using an SMTP server.

**42. Q: Can a patient see another patient's data?**
   *   **A:** No. The backend filters data based on the logged-in User ID. A patient requesting `/api/v1/messages` only receives messages linked to *their* ID.

**43. Q: How do you handle DICOM files?**
   *   **A:** We use the `pydicom` library in Python to read the medical metadata and pixel data from `.dcm` files, then convert them to standard image formats for the AI model.

**44. Q: What is the "Risk Level" logic?**
   *   **A:** It's a heuristic based on the AI's confidence and the size/number of detections. High confidence + large bounding box = High Risk.

**45. Q: Why is the dashboard "Dark Mode" by default (or available)?**
   *   **A:** Radiologists often work in dimly lit rooms to view scans better. Dark mode reduces eye strain in that environment.

**46. Q: How do you ensure the AI doesn't hallucinate?**
   *   **A:** YOLO is an object detector, not a generative model (like GPT). It doesn't "hallucinate" new pixels; it only draws boxes around existing ones. The risk is misclassification, not hallucination.

**47. Q: What browser is this compatible with?**
   *   **A:** Any modern browser (Chrome, Firefox, Safari, Edge) that supports ES6 JavaScript and HTML5 Canvas.

**48. Q: How do you handle session timeouts?**
   *   **A:** Currently, the session persists in `localStorage`. In production, we would use **JWT (JSON Web Tokens)** with an expiration time (e.g., 1 hour) to auto-logout inactive users for security.

**49. Q: Can I print the report?**
   *   **A:** Yes, the browser's native print function works, but we can also generate a PDF report using a library like `jspdf` for a cleaner layout.

**50. Q: What did you learn from this project?**
   *   **A:** (Personal Answer): I learned the complexity of bridging AI with Web Development. It's not enough to have a good model; you need a robust backend to serve it and an intuitive frontend to make it usable for humans.
