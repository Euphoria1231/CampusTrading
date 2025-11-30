import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
  // 使用 useRef 跟踪上一个 token，用于检测 token 变化
  const prevTokenRef = useRef<string | null>(localStorage.getItem('token'))

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

  // 检查并同步用户状态的辅助函数
  const checkAndSyncUser = useCallback(() => {
    const token = localStorage.getItem('token')
    const cachedUser = getUser()

    // 使用函数式更新来获取最新的 user 状态，避免闭包问题
    setUser((currentUser) => {
      // 如果 token 被移除，清空用户状态
      if (!token) {
        prevTokenRef.current = null
        return null
      }

      // 如果 token 变化了（用户切换）
      if (prevTokenRef.current !== token) {
        prevTokenRef.current = token

        // 如果缓存中有用户信息，先使用缓存
        if (cachedUser) {
          // 检查缓存的用户是否与当前 user 匹配
          // 如果 userId 不匹配，说明用户切换了
          if (!currentUser || currentUser.userId !== cachedUser.userId) {
            // 后台更新用户信息
            fetchUserProfile().catch((error: unknown) => {
              console.error('后台更新用户信息失败:', error)
            })
            return cachedUser
          }
        } else {
          // 如果没有缓存，但有 token，尝试获取用户信息
          if (!currentUser) {
            fetchUserProfile().catch((error: unknown) => {
              console.error('获取用户信息失败:', error)
            })
          }
        }
      } else {
        // token 没变化，但检查用户状态是否一致
        if (token && !currentUser) {
          // 有 token 但没有 user，尝试恢复
          if (cachedUser) {
            fetchUserProfile().catch((error: unknown) => {
              console.error('后台更新用户信息失败:', error)
            })
            return cachedUser
          } else {
            fetchUserProfile().catch((error: unknown) => {
              console.error('获取用户信息失败:', error)
            })
          }
        } else if (token && currentUser && cachedUser && currentUser.userId !== cachedUser.userId) {
          // token 存在，但缓存的用户ID与当前用户ID不一致，说明用户切换了
          fetchUserProfile().catch((error: unknown) => {
            console.error('后台更新用户信息失败:', error)
          })
          return cachedUser
        }
      }

      // 如果没有变化，返回当前状态
      return currentUser
    })
  }, [fetchUserProfile])

  // 初始化时检查token并获取用户信息
  useEffect(() => {
    checkAndSyncUser()
  }, [checkAndSyncUser])

  // 监听 storage 事件（用于跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 监听 token 或 user_profile 的变化
      if (e.key === 'token' || e.key === 'user_profile') {
        checkAndSyncUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkAndSyncUser])

  // 定期检查 token 和 user 状态是否同步（用于同一标签页内的变化）
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkAndSyncUser()
    }, 1000) // 每秒检查一次

    return () => {
      clearInterval(intervalId)
    }
  }, [checkAndSyncUser])

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
