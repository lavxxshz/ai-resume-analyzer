import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>🧠 AI Resume Analyzer</Link>
      <div>
        {user ? (
          <div style={styles.right}>
            <span style={styles.name}>Hi, {user.name} 👋</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </div>
        ) : (
          <div style={styles.right}>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.link}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 32px',
    backgroundColor: '#4f46e5', color: 'white'
  },
  brand: { color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  name: { color: 'white', fontSize: '14px' },
  button: {
    padding: '8px 16px', backgroundColor: 'white',
    color: '#4f46e5', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold'
  },
  link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' }
};

export default Navbar;