import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import AlbumList from '../../components/AlbumList/AlbumList';

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
      <AlbumList />
      </div>
    </div>
  );
};

export default Home;