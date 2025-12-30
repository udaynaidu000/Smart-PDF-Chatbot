# Smart PDF Chatbot 🤖📄

An intelligent PDF chatbot with voice capabilities, document comparison, and interactive dashboards powered by Gemini AI.

## Features

- 📤 **Upload & Process PDFs** - Extract and analyze text from multiple PDF files
- 💬 **AI Chat** - Ask questions about your PDFs using Gemini AI
- 🎤 **Voice Input** - Speak your questions using speech recognition
- 🔊 **Voice Output** - Hear responses with natural text-to-speech
- 📊 **Dashboard Generation** - Create interactive dashboards from PDF tables
- 🔄 **Document Comparison** - Compare multiple PDFs side-by-side

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Web Speech API

### Backend
- Node.js + Express
- Gemini AI API
- PDF-Parse
- Multer for file uploads

## Setup

### Prerequisites
- Node.js 18+
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/Smart-PDF-Chatbot.git
cd Smart-PDF-Chatbot
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running Locally

1. Start backend:
```bash
cd backend
node server.js
```
Backend runs on http://localhost:5000

2. Start frontend (in another terminal):
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## Deployment

### Frontend (Vercel)
- Connect your GitHub repo to Vercel
- Set build command: `npm run build`
- Set output directory: `dist`
- Deploy!

### Backend (Render/Railway)
- Add `GEMINI_API_KEY` environment variable
- Deploy from GitHub
- Update frontend API calls to production backend URL

## Usage

1. Upload one or more PDF files
2. Click "Upload PDF(s) and Process"
3. Ask questions via text or voice
4. Generate dashboards or compare documents

## License

MIT

## Author

Created by [Your Name]
