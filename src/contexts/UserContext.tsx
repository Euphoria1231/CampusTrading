import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { http } from '@/utils/request'
import { saveUser, getUser, removeUser, type UserProfile } from '@/utils/storage'

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

  const login = useCallback((userData: UserProfile) => {
    setUser(userData)
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }
    // 保存用户信息到 localStorage
    saveUser(userData)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('token')
    // 清除 localStorage 中的用户信息
    removeUser()
  }, [])

  const updateUser = (userData: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      // 同步更新 localStorage
      saveUser(updatedUser)
    }
  }

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: UserProfile }>('/user/profile')

      if (result.code === 200) {
        setUser(result.data)
        // 成功获取后更新 localStorage
        saveUser(result.data)
      } else {
        console.error('获取用户信息失败:', result.message)
        // 如果获取用户信息失败，清除token
        logout()
      }
    } catch (error: unknown) {
      console.error('获取用户信息失败:', error)
      // 如果请求失败，清除token
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  // 初始化时检查token并获取用户信息
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      // 优先使用本地缓存
      const cachedUser = getUser()
      if (cachedUser) {
        setUser(cachedUser)
      }
      // 然后在后台调用 API 更新用户信息
      fetchUserProfile().catch((error: unknown) => {
        console.error('后台更新用户信息失败:', error)
        // 如果更新失败，清除缓存
        if (cachedUser) {
          removeUser()
          setUser(null)
        }
      })
    }
  }, [user, fetchUserProfile])

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
