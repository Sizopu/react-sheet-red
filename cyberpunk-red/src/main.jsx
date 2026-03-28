import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CharacterProvider } from './context/CharacterContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import './css/common.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CharacterProvider>
          <App />
        </CharacterProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
)
