import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import CharacterSheet from './pages/CharacterSheet'
import Characters from './pages/Characters'
import Implants from './pages/Implants'
import Mobs from './pages/Mobs'
import Notes from './pages/Notes'
import Scripts from './pages/Scripts'
import AuthModal from './components/AuthModal'
import { useState } from 'react'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/characters" state={{ from: location }} replace />
  }
  
  return children
}

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  
  // Показываем AuthModal на странице characters если не авторизован
  const showAuthModal = !isAuthenticated && location.pathname === '/characters'

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout authModalOpen={showAuthModal} setAuthModalOpen={setAuthModalOpen} />}>
          <Route index element={<Navigate to="/characters" replace />} />
          <Route path="characters" element={<Characters />} />
          <Route 
            path="sheet" 
            element={
              <PrivateRoute>
                <CharacterSheet />
              </PrivateRoute>
            } 
          />
          <Route 
            path="implants" 
            element={
              <PrivateRoute>
                <Implants />
              </PrivateRoute>
            } 
          />
          <Route 
            path="notes" 
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            } 
          />
          <Route 
            path="mobs" 
            element={
              <PrivateRoute>
                <Mobs />
              </PrivateRoute>
            } 
          />
          <Route 
            path="scripts" 
            element={
              <PrivateRoute>
                <Scripts />
              </PrivateRoute>
            } 
          />
        </Route>
      </Routes>
    </>
  )
}

export default App
