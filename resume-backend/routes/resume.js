const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  }
});

router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;
    fs.unlinkSync(req.file.path);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume reviewer. Analyze the resume and respond ONLY in this exact JSON format with no extra text or markdown:
{
  "score": <number out of 100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "overall_feedback": "2 sentence summary"
}`
        },
        {
          role: 'user',
          content: `Analyze this resume:\n\n${extractedText}`
        }
      ]
    });

    const aiResponse = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(aiResponse);

    res.json({
      msg: 'Resume analyzed successfully',
      analysis
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error analyzing resume', error: err.message });
  }
});

module.exports = router;