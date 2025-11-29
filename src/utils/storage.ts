/**
 * localStorage 辅助函数
 */

// 用户信息存储键
const USER_STORAGE_KEY = 'user_profile'

/**
 * 通用的 localStorage 操作函数
 */
export const storage = {
  /**
   * 获取 localStorage 中的值
   */
  get: <T = unknown>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`获取 localStorage 失败 [${key}]:`, error)
      return null
    }
  },

  /**
   * 设置 localStorage 中的值
   */
  set: <T = unknown>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`设置 localStorage 失败 [${key}]:`, error)
    }
  },

  /**
   * 移除 localStorage 中的值
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`移除 localStorage 失败 [${key}]:`, error)
    }
  },
}

/**
 * 用户信息相关的 localStorage 操作
 */
export interface UserProfile {
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

/**
 * 保存用户信息到 localStorage
 */
export const saveUser = (user: UserProfile): void => {
  storage.set(USER_STORAGE_KEY, user)
}

/**
 * 从 localStorage 获取用户信息
 */
export const getUser = (): UserProfile | null => {
  return storage.get<UserProfile>(USER_STORAGE_KEY)
}

/**
 * 从 localStorage 移除用户信息
 */
export const removeUser = (): void => {
  storage.remove(USER_STORAGE_KEY)
}

