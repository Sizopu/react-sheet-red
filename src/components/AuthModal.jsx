import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onLogin, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
        onLogin();
      } else {
        await register({ username, email, password });
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose?.();
    setMode('login');
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
          <button onClick={handleClose} style={closeButtonStyle}>×</button>
        </div>
        {error && <p style={{ color: '#f78166', margin: '10px 0' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
          {mode === 'register' && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          style={linkStyle}
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#2a2a2a',
  padding: '30px',
  borderRadius: '8px',
  width: '350px',
  color: 'white',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
  position: 'relative',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '0',
  lineHeight: '1',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '4px',
  border: '1px solid #444',
  background: '#1a1a1a',
  color: 'white',
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  background: '#e53935',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const linkStyle = {
  background: 'none',
  border: 'none',
  color: '#e53935',
  cursor: 'pointer',
  textDecoration: 'underline',
  width: '100%',
  padding: '10px 0',
};

export default AuthModal;