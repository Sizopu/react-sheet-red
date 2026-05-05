import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Декодируем JWT для получения username (без запроса к бэкенду)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ username: payload.sub })
      } catch (e) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await authAPI.login(username, password)
    const token = res.data.access_token
    localStorage.setItem('token', token)
    
    // Декодируем токен
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUser({ username: payload.sub })
    
    // Отправляем событие о смене пользователя
    window.dispatchEvent(new Event('authChanged'))
    
    return res.data
  }

  const register = async (userData) => {
    await authAPI.register(userData)
    // После регистрации сразу логинимся
    return login(userData.username, userData.password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    
    // Отправляем событие о смене пользователя
    window.dispatchEvent(new Event('authChanged'))
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
