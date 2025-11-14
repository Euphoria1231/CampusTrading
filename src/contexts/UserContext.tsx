import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { http } from '@/utils/request'

interface UserProfile {
  userId: number
  username: string
  email: string
  phoneNumber: string
  avatarUrl?: string
  realName: string
  schoolId: string
  creditScore: number
  created_at: string
  token?: string
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  login: (userData: UserProfile) => void
  logout: () => void
  updateUser: (userData: Partial<UserProfile>) => void
  fetchUserProfile: () => Promise<void>
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!user && !!localStorage.getItem('token')

  const login = (userData: UserProfile) => {
    setUser(userData)
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  const updateUser = (userData: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: UserProfile }>('/user/profile')
      
      if (result.code === 200) {
        setUser(result.data)
      } else {
        console.error('获取用户信息失败:', result.message)
        // 如果获取用户信息失败，清除token
        logout()
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      // 如果请求失败，清除token
      logout()
    } finally {
      setLoading(false)
    }
  }

  // 初始化时检查token并获取用户信息
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      fetchUserProfile()
    }
  }, [])

  const value: UserContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    fetchUserProfile,
    isAuthenticated
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
