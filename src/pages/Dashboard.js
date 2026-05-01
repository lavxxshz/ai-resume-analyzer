import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file first');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await axios.post('https://ai-resume-analyzer-production-9c81.up.railway.app/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setResult(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result ? (result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#f59e0b' : '#ef4444') : '#4f46e5';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome, {user?.name}! 🎉</h2>
        <p style={styles.sub}>Upload your resume to get AI-powered analysis</p>

        <div style={styles.uploadBox}>
          <p>📄 Select your Resume (PDF only)</p>
          <input type="file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
          {file && <p style={styles.fileName}>Selected: {file.name}</p>}
          <button onClick={handleUpload} disabled={loading} style={styles.button}>
            {loading ? '🔄 Analyzing with AI...' : '🚀 Upload & Analyze'}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <div style={styles.result}>

            {/* Score */}
            <div style={styles.scoreBox}>
              <div style={{ ...styles.scoreBadge, backgroundColor: scoreColor }}>
                {result.score}/100
              </div>
              <p style={styles.scoreLabel}>Resume Score</p>
            </div>

            {/* Overall Feedback */}
            <div style={styles.section}>
              <h4>📝 Overall Feedback</h4>
              <p style={styles.feedback}>{result.overall_feedback}</p>
            </div>

            {/* Strengths */}
            <div style={styles.section}>
              <h4 style={{ color: '#22c55e' }}>✅ Strengths</h4>
              {result.strengths.map((s, i) => <p key={i} style={styles.item}>• {s}</p>)}
            </div>

            {/* Weaknesses */}
            <div style={styles.section}>
              <h4 style={{ color: '#ef4444' }}>⚠️ Weaknesses</h4>
              {result.weaknesses.map((w, i) => <p key={i} style={styles.item}>• {w}</p>)}
            </div>

            {/* Missing Skills */}
            <div style={styles.section}>
              <h4 style={{ color: '#f59e0b' }}>🔍 Missing Skills</h4>
              <div style={styles.tags}>
                {result.missing_skills.map((skill, i) => (
                  <span key={i} style={styles.tag}>{skill}</span>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div style={styles.section}>
              <h4 style={{ color: '#4f46e5' }}>💡 Suggestions</h4>
              {result.suggestions.map((s, i) => <p key={i} style={styles.item}>• {s}</p>)}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', justifyContent: 'center',
    minHeight: '90vh', backgroundColor: '#f0f2f5', padding: '20px'
  },
  card: {
    backgroundColor: 'white', padding: '48px',
    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center', width: '100%', maxWidth: '650px', height: 'fit-content'
  },
  sub: { color: '#666', marginBottom: '32px' },
  uploadBox: {
    border: '2px dashed #4f46e5', borderRadius: '12px',
    padding: '40px', color: '#4f46e5', marginBottom: '24px'
  },
  fileInput: { margin: '16px 0', display: 'block', width: '100%' },
  fileName: { fontSize: '13px', color: '#666', marginBottom: '12px' },
  button: {
    padding: '12px 32px', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px'
  },
  error: { color: 'red', marginTop: '12px' },
  result: { marginTop: '24px', textAlign: 'left' },
  scoreBox: { textAlign: 'center', marginBottom: '24px' },
  scoreBadge: {
    display: 'inline-block', color: 'white',
    fontSize: '48px', fontWeight: 'bold',
    padding: '20px 40px', borderRadius: '16px'
  },
  scoreLabel: { color: '#666', marginTop: '8px', fontSize: '16px' },
  section: {
    backgroundColor: '#f8f9ff', padding: '16px',
    borderRadius: '10px', marginBottom: '16px'
  },
  feedback: { color: '#444', lineHeight: '1.6' },
  item: { color: '#444', marginBottom: '6px', lineHeight: '1.5' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  tag: {
    backgroundColor: '#fef3c7', color: '#92400e',
    padding: '4px 12px', borderRadius: '20px', fontSize: '13px'
  }
};

export default Dashboard;