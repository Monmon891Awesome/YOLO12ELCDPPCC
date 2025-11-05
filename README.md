# LungEvity - YOLOv12-Powered Lung Cancer Detection Platform

An integrated platform for early lung cancer detection and patient-physician collaborative care, powered by YOLOv12.

## Features

- Patient Registration and Login
- AI-Powered Lung Cancer Detection using YOLOv12
- Patient Dashboard for viewing results and history
- Admin Dashboard for physicians
- Patient-Physician Communication Platform

## Prerequisites

- Node.js 16.x or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd YOLO12ELCDPPCC-1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API endpoints.

## Development

Run the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Build

Create a production build:
```bash
npm run build
```

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect it's a Create React App
6. Click "Deploy"

### Environment Variables on Vercel

Add these environment variables in your Vercel project settings:
- `REACT_APP_API_URL` - Your backend API URL
- `REACT_APP_YOLO_API_URL` - Your YOLOv12 model API URL

## Project Structure

```
YOLO12ELCDPPCC-1/
├── public/              # Static files
│   └── index.html       # HTML template
├── src/                 # Source files
│   ├── components/      # React components
│   ├── App.js          # Main app with routing
│   ├── index.js        # Entry point
│   ├── LungEvityUI.jsx # Landing page
│   ├── Login.jsx       # Login page
│   ├── AdminDashboard.jsx
│   ├── PatientDashboard.jsx
│   ├── PatientRegistration.jsx
│   └── PatientPlatform.jsx
├── docs/               # Documentation
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
└── package.json       # Dependencies

```

## Available Routes

- `/` - Landing page
- `/login` - User login
- `/register` - Patient registration
- `/admin` - Admin dashboard
- `/patient` - Patient dashboard
- `/platform` - Patient platform

## Technologies Used

- React 18.2.0
- React Router DOM 6.16.0
- React Scripts 5.0.1

## License

Private Project