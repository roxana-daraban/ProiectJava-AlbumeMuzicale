import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

/**
 * Componenta Home - pagina principală după autentificare
 */
const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Music Album Manager</h1>
        <div className="user-info">
          <span className="welcome-text">
            Bine ai venit, <strong>{user?.username}</strong> ({user?.role})
          </span>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="home-content">
        <h2>Pagina principală</h2>
        <p>Aici vor apărea albumele în următorii pași.</p>
        <p>Rolul tău: <strong>{user?.role}</strong></p>
      </div>
    </div>
  );
};

export default Home;