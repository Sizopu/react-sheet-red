import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import CharacterSheet from './pages/CharacterSheet'
import Characters from './pages/Characters'
import Implants from './pages/Implants'
import Mobs from './pages/Mobs'
import Notes from './pages/Notes'
import Scripts from './pages/Scripts'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/characters" replace />} />
        <Route path="characters" element={<Characters />} />
        <Route path="sheet" element={<CharacterSheet />} />
        <Route path="implants" element={<Implants />} />
        <Route path="notes" element={<Notes />} />
        <Route path="mobs" element={<Mobs />} />
        <Route path="scripts" element={<Scripts />} />
      </Route>
    </Routes>
  )
}

export default App
