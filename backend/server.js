require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const originalFs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const pdfTableToHTMLDashboard = require('./utils/pdfDashboard');

const app = express();
const port = process.env.PORT || 5000;

// Allow any origin during local development (covers localhost and 127.0.0.1 on Vite ports)
app.use(cors());
app.use(express.json());

// Initialize Folders
const uploadsDir = path.join(__dirname, 'uploads');
const dashboardsDir = path.join(__dirname, '../dashboards');
[uploadsDir, dashboardsDir].forEach(dir => {
    if (!originalFs.existsSync(dir)) originalFs.mkdirSync(dir, { recursive: true });
});
app.use('/dashboards', express.static(dashboardsDir));

const upload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})}).array('pdfs', 10);

app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            const results = await Promise.all(req.files.map(async f => {
                const data = await pdfParse(await fs.readFile(f.path));
                return { filename: f.originalname, savedname: f.filename, text: data.text };
            }));
            res.json(results);
        } catch (e) { res.status(500).json({ error: "PDF Processing Failed" }); }
    });
});

app.post('/ask', async (req, res) => {
  try {
    const { question, pdfText } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(400).json({ error: 'Missing GEMINI_API_KEY on server' });
    }
    
    // Using Gemini 1.5 Flash (stable, works with free and pro tiers)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: `Context:\n${pdfText}\n\nQuestion: ${question}` }] }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 2048
      }
    });

    const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ answer });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Gemini Request Failed', details: error.response?.data });
  }
});

// Basic HTML escaper for safe embedding in generated files
const escapeHtml = (str = '') => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Generate a simple comparison HTML file and return its URL
app.post('/compare-html', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const html = `<!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Comparison</title>
    <style>body{font-family:Arial,sans-serif;margin:20px;line-height:1.5;}pre{white-space:pre-wrap;}</style>
    </head><body><h1>Document Comparison</h1><pre>${escapeHtml(prompt)}</pre></body></html>`;

    const filename = `compare-${Date.now()}.html`;
    const outPath = path.join(dashboardsDir, filename);
    await fs.writeFile(outPath, html);
    res.json({ comparisonUrl: `/dashboards/${filename}` });
  } catch (e) {
    console.error('Compare HTML Error:', e.message);
    res.status(500).json({ error: 'Failed to generate comparison HTML', details: e.message });
  }
});

// Generate a dashboard HTML from an uploaded PDF's table-like data
app.post('/dashboard', async (req, res) => {
  try {
    const { savedname } = req.body;
    if (!savedname) {
      return res.status(400).json({ error: 'Missing savedname' });
    }

    const pdfPath = path.join(uploadsDir, savedname);
    const htmlPath = await pdfTableToHTMLDashboard(pdfPath);
    const dashboardUrl = `/dashboards/${path.basename(htmlPath)}`;
    res.json({ dashboardUrl });
  } catch (e) {
    console.error('Dashboard Error:', e.message);
    res.status(500).json({ error: 'Failed to generate dashboard', details: e.message });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`🚀 Server listening on port ${port}`));