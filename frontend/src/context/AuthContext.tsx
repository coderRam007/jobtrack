import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock user for demo
const MOCK_USER: User = {
  id: 'user-1',
  name: 'Aishwarya R',
  email: 'aishwarya@example.com',
  created_at: '2026-07-01T00:00:00Z',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedToken = localStorage.getItem('jobtrack_token')
    const storedUser = localStorage.getItem('jobtrack_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // TODO: Replace with real API call
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800)) // Simulate network
    
    if (email && password.length >= 6) {
      const mockToken = 'mock-jwt-token-' + Date.now()
      setToken(mockToken)
      setUser(MOCK_USER)
      localStorage.setItem('jobtrack_token', mockToken)
      localStorage.setItem('jobtrack_user', JSON.stringify(MOCK_USER))
    } else {
      throw new Error('Invalid credentials')
    }
    setIsLoading(false)
  }

  const register = async (name: string, email: string, password: string) => {
    // TODO: Replace with real API call
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    
    if (name && email && password.length >= 6) {
      const newUser: User = { ...MOCK_USER, name, email, id: 'user-' + Date.now() }
      const mockToken = 'mock-jwt-token-' + Date.now()
      setToken(mockToken)
      setUser(newUser)
      localStorage.setItem('jobtrack_token', mockToken)
      localStorage.setItem('jobtrack_user', JSON.stringify(newUser))
    } else {
      throw new Error('Registration failed. Please check your inputs.')
    }
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jobtrack_token')
    localStorage.removeItem('jobtrack_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
