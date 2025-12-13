import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

/**
 * Componenta Register - permite utilizatorilor să își creeze cont nou
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Te rog completează toate câmpurile');
      return;
    }

    if (formData.password.length < 3) {
      setError('Parola trebuie să aibă minim 3 caractere');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la înregistrare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Înregistrare</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="form-select"
              required
            >
              <option value="USER">USER - Vizualizare albume</option>
              <option value="EDITOR">EDITOR - Gestionare albume</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Se înregistrează...' : 'Înregistrează-te'}
          </button>
        </form>

        <p className="login-link">
          Ai deja cont? <Link to="/login" className="link">Conectează-te</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;