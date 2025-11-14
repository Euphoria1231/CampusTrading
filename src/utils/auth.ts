/**
 * 解析JWT Token获取用户信息
 */
export const parseToken = (token: string): any => {
  try {
    console.log('parseToken - 输入token:', token?.substring(0, 50) + '...')
    
    // JWT token格式: header.payload.signature
    const parts = token.split('.')
    console.log('parseToken - token分段数:', parts.length)
    
    if (parts.length !== 3) {
      console.error('parseToken - token格式错误，应该有3段')
      return null
    }
    
    // 解析payload部分
    const payload = parts[1]
    console.log('parseToken - payload部分:', payload?.substring(0, 50) + '...')
    
    const decodedPayload = atob(payload)
    console.log('parseToken - 解码后payload:', decodedPayload)
    
    const parsed = JSON.parse(decodedPayload)
    console.log('parseToken - 解析结果:', parsed)
    
    return parsed
  } catch (error) {
    console.error('parseToken - 解析失败:', error)
    return null
  }
}

/**
 * 获取当前登录用户ID
 */
export const getCurrentUserId = (): number | null => {
  const token = localStorage.getItem('token')
  console.log('getCurrentUserId - token存在:', !!token)
  
  if (!token) {
    console.warn('getCurrentUserId - 未找到token')
    return null
  }
  
  const tokenData = parseToken(token)
  console.log('getCurrentUserId - 解析的tokenData:', tokenData)
  console.log('getCurrentUserId - userId:', tokenData?.userId)
  
  return tokenData?.userId || null
}

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = (): any => {
  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }
  
  return parseToken(token)
}

