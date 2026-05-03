import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'https://ai-resume-analyzer-production-9c81.up.railway.app';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [matchFile, setMatchFile] = useState(null);

  const handleFileChange = (e) => { setFile(e.target.files[0]); setResult(null); setError(''); };
  const handleMatchFileChange = (e) => { setMatchFile(e.target.files[0]); setMatchResult(null); setMatchError(''); };

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file first');
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await axios.post(`${API_URL}/api/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setResult(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleMatch = async () => {
    if (!matchFile) return setMatchError('Please select a PDF file');
    if (!jobDescription.trim()) return setMatchError('Please paste a job description');
    setMatchLoading(true); setMatchError('');
    try {
      const formData = new FormData();
      formData.append('resume', matchFile);
      formData.append('jobDescription', jobDescription);
      const res = await axios.post(`${API_URL}/api/resume/match`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setMatchResult(res.data.analysis);
    } catch (err) {
      setMatchError(err.response?.data?.msg || 'Match failed');
    } finally { setMatchLoading(false); }
  };

  const scoreColor = result ? (result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#f59e0b' : '#ef4444') : '#4f46e5';
  const matchColor = matchResult ? (matchResult.match_percentage >= 70 ? '#22c55e' : matchResult.match_percentage >= 50 ? '#f59e0b' : '#ef4444') : '#4f46e5';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome, {user?.name}! 🎉</h2>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'analyze' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('analyze')}>
            📄 Analyze Resume
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'match' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('match')}>
            🎯 Job Match
          </button>
        </div>

        {/* ANALYZE TAB */}
        {activeTab === 'analyze' && (
          <div>
            <p style={styles.sub}>Upload your resume to get AI-powered analysis</p>
            <div style={styles.uploadBox}>
              <p>📄 Select your Resume (PDF only)</p>
              <input type="file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
              {file && <p style={styles.fileName}>Selected: {file.name}</p>}
              <button onClick={handleUpload} disabled={loading} style={styles.button}>
                {loading ? '🔄 Analyzing...' : '🚀 Upload & Analyze'}
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            {result && (
              <div style={styles.result}>
                <div style={styles.scoreBox}>
                  <div style={{ ...styles.scoreBadge, backgroundColor: scoreColor }}>{result.score}/100</div>
                  <p style={styles.scoreLabel}>Resume Score</p>
                </div>
                <div style={styles.section}>
                  <h4>📝 Overall Feedback</h4>
                  <p style={styles.feedback}>{result.overall_feedback}</p>
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#22c55e' }}>✅ Strengths</h4>
                  {result.strengths.map((s, i) => <p key={i} style={styles.item}>• {s}</p>)}
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#ef4444' }}>⚠️ Weaknesses</h4>
                  {result.weaknesses.map((w, i) => <p key={i} style={styles.item}>• {w}</p>)}
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#f59e0b' }}>🔍 Missing Skills</h4>
                  <div style={styles.tags}>
                    {result.missing_skills.map((skill, i) => (
                      <span key={i} style={styles.tag}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#4f46e5' }}>💡 Suggestions</h4>
                  {result.suggestions.map((s, i) => <p key={i} style={styles.item}>• {s}</p>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* JOB MATCH TAB */}
        {activeTab === 'match' && (
          <div>
            <p style={styles.sub}>Upload resume + paste job description to see how well you match</p>
            <div style={styles.uploadBox}>
              <p>📄 Select your Resume (PDF only)</p>
              <input type="file" accept=".pdf" onChange={handleMatchFileChange} style={styles.fileInput} />
              {matchFile && <p style={styles.fileName}>Selected: {matchFile.name}</p>}
            </div>
            <textarea
              style={styles.textarea}
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
            />
            <button onClick={handleMatch} disabled={matchLoading} style={styles.button}>
              {matchLoading ? '🔄 Analyzing Match...' : '🎯 Check Job Match'}
            </button>
            {matchError && <p style={styles.error}>{matchError}</p>}
            {matchResult && (
              <div style={styles.result}>
                <div style={styles.scoreBox}>
                  <div style={{ ...styles.scoreBadge, backgroundColor: matchColor }}>
                    {matchResult.match_percentage}%
                  </div>
                  <p style={styles.scoreLabel}>Job Match Score</p>
                </div>
                <div style={styles.section}>
                  <h4>📝 Verdict</h4>
                  <p style={styles.feedback}>{matchResult.verdict}</p>
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#22c55e' }}>✅ Matched Skills</h4>
                  <div style={styles.tags}>
                    {matchResult.matched_skills.map((skill, i) => (
                      <span key={i} style={{ ...styles.tag, backgroundColor: '#dcfce7', color: '#166534' }}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#ef4444' }}>❌ Missing Skills</h4>
                  <div style={styles.tags}>
                    {matchResult.missing_skills.map((skill, i) => (
                      <span key={i} style={styles.tag}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#22c55e' }}>💪 Strong Points</h4>
                  {matchResult.strong_points.map((s, i) => <p key={i} style={styles.item}>• {s}</p>)}
                </div>
                <div style={styles.section}>
                  <h4 style={{ color: '#4f46e5' }}>💡 How to Improve</h4>
                  {matchResult.improvements.map((s, i) => <p key={i} style={styles.item}>• {s}</p>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', minHeight: '90vh', backgroundColor: '#f0f2f5', padding: '20px' },
  card: { backgroundColor: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '650px', height: 'fit-content' },
  tabs: { display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' },
  tab: { padding: '10px 24px', borderRadius: '8px', border: '2px solid #4f46e5', backgroundColor: 'white', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  activeTab: { backgroundColor: '#4f46e5', color: 'white' },
  sub: { color: '#666', marginBottom: '24px' },
  uploadBox: { border: '2px dashed #4f46e5', borderRadius: '12px', padding: '30px', color: '#4f46e5', marginBottom: '16px' },
  fileInput: { margin: '16px 0', display: 'block', width: '100%' },
  fileName: { fontSize: '13px', color: '#666', marginBottom: '12px' },
  button: { width: '100%', padding: '12px 32px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' },
  textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', resize: 'vertical' },
  error: { color: 'red', marginTop: '12px' },
  result: { marginTop: '24px', textAlign: 'left' },
  scoreBox: { textAlign: 'center', marginBottom: '24px' },
  scoreBadge: { display: 'inline-block', color: 'white', fontSize: '48px', fontWeight: 'bold', padding: '20px 40px', borderRadius: '16px' },
  scoreLabel: { color: '#666', marginTop: '8px', fontSize: '16px' },
  section: { backgroundColor: '#f8f9ff', padding: '16px', borderRadius: '10px', marginBottom: '16px' },
  feedback: { color: '#444', lineHeight: '1.6' },
  item: { color: '#444', marginBottom: '6px', lineHeight: '1.5' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  tag: { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }
};

export default Dashboard;