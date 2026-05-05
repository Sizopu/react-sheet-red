import React from 'react';
import { CharacterProvider, useCharacter } from './contexts/CharacterContext';
import AuthModal from './components/AuthModal';
import CharacterSheet from './components/CharacterSheet'; // Ваш основной компонент листа
import './App.css';

function AppContent() {
  const { isAuthenticated, login, logout } = useCharacter();

  return (
    <div className="App">
      {!isAuthenticated ? (
        <AuthModal onLogin={login} />
      ) : (
        <>
          <button 
            onClick={logout} 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 100,
              padding: '8px 16px',
              background: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
          <CharacterSheet />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <CharacterProvider>
      <AppContent />
    </CharacterProvider>
  );
}

export default App;