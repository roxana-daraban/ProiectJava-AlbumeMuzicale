import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/LoginPage/Login';
import Register from './pages/RegisterPage/Register';
import Home from './pages/HomePage/Home';
import './App.css'


/**
 * Componenta ProtectedRoute - protejează rutele care necesită autentificare
 * 
 * Verifică dacă utilizatorul este autentificat:
 * - Dacă DA → afișează componenta copil (children)
 * - Dacă NU → redirecționează la /login
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Se încarcă...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Componenta principală App
 * 
 * Structura rutelor:
 * - /login → Login (public)
 * - /register → Register (public)
 * - / → Home (PROTECTATĂ - necesită autentificare)
 */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rute publice (nu necesită autentificare) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rută protejată - doar pentru utilizatori autentificați */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: orice altă rută redirecționează la home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    
  );
}

export default App
