import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // On mount, if token exists, fetch the current user
  useEffect(() => {
    if (token) {
      api.get('/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password })
    const { user, token } = res.data
    localStorage.setItem('token', token)
    setToken(token)
    setUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: password,
    })
    const { user, token } = res.data
    localStorage.setItem('token', token)
    setToken(token)
    setUser(user)
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      loading,
    }}>
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
