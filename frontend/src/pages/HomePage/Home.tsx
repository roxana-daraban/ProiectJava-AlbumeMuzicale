import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import AlbumList from '../../components/AlbumList/AlbumList';
import UserManagement from '../../components/UserManagement/UserManagement';

type Tab = 'albums' | 'users';

/**
 * Componenta Home - pagina principală după autentificare
 */
const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('albums');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Normalizează rolul eliminând prefixul "ROLE_" dacă există
   */
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return '';
    return role.startsWith('ROLE_') ? role.substring(5) : role;
  };

  const isAdmin = normalizeRole(user?.role) === 'ADMIN';

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Music Album Manager</h1>
        <div className="user-info">
          <span className="welcome-text">
            Bine ai venit, <strong>{user?.username}</strong> ({normalizeRole(user?.role)})
          </span>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs pentru navigare (doar pentru ADMIN) */}
      {isAdmin && (
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Albume
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Utilizatori
          </button>
        </div>
      )}

      <div className="home-content">
        {activeTab === 'albums' || !isAdmin ? (
          <AlbumList />
        ) : (
          <UserManagement />
        )}
      </div>
    </div>
  );
};

export default Home;