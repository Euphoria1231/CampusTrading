import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import type { FC } from "react"
import { Form, Input, Button, Card, message, Avatar, Descriptions, Tag, Divider, Alert, Steps, notification } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, EditOutlined, SaveOutlined, CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { http } from "@/utils/request" // 导入封装的http方法
import './index.less'

interface LoginForm {
  username: string
  password: string
}

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  email: string
  phoneNumber: string
  realName: string
  schoolId: string
}

interface ForgotPasswordForm {
  username: string
  phoneNumber: string
  realName: string
  schoolId: string
  newPassword: string
  confirmPassword: string
}

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

const User: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'forgotPassword' | 'profile'>('login')
  const [currentStep, setCurrentStep] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [forgotPasswordForm] = Form.useForm()
  const [profileForm] = Form.useForm()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // 用户数据
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // 信用分阈值 - 低于60分被封禁
  const BANNED_CREDIT_SCORE = 60

  // 根据路由判断当前页面
  useEffect(() => {
    console.log('路由变化:', location.pathname)
    console.log('当前token:', localStorage.getItem('token'))
    
    if (location.pathname === '/user/register') {
      setCurrentPage('register')
    } else if (location.pathname === '/user/forgot-password') {
      setCurrentPage('forgotPassword')
    } else if (location.pathname === '/user/profile') {
      // 进入个人中心时检查token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('未找到token，跳转到登录页')
        message.error('请先登录')
        navigate('/user')
        return
      }
      setCurrentPage('profile')
      // 获取用户信息
      fetchUserProfile()
    } else {
      setCurrentPage('login')
    }
  }, [location.pathname])

  // 检查用户是否被封禁
  const isUserBanned = userProfile?.creditScore ? userProfile.creditScore < BANNED_CREDIT_SCORE : false

  // 登录API调用
  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    try {
      const result = await http.post<{ code: number; message: string; data: UserProfile }>('/user/login', values)
      
      if (result.code === 200) {
        // 登录成功，确保token保存到localStorage
        if (result.data.token) {
          localStorage.setItem('token', result.data.token)
          console.log('登录成功，token已保存到localStorage')
        }
        
        setUserProfile(result.data)
        // 跳转到个人中心
        navigate('/user/profile')
        notification.success({
          message: '登录成功',
          duration: 3,
        })
        
        
      } else {
        message.error(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录请求失败:', error)
      // 错误已经在拦截器中处理，这里只需记录日志
    } finally {
      setLoading(false)
    }
  }

  // 获取用户个人资料
  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: UserProfile }>('/user/profile')
      
      if (result.code === 200) {
        setUserProfile(result.data)
        console.log('用户信息获取成功')
      } else {
        console.error('获取用户信息失败:', result.message)
        message.error(result.message || '获取用户信息失败')
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      // 错误已经在拦截器中统一处理
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const handleRegister = async (values: RegisterForm) => {
    setLoading(true)
    try {
      const result = await http.post<{ code: number; message: string; data: any }>('/user/register', values)
      
      if (result.code === 200) {
        message.success('注册成功！')
        navigate('/user')
      } else {
        message.error(result.message || '注册失败')
      }
    } catch (error) {
      console.error('注册请求失败:', error)
      // 错误已经在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  // 忘记密码 - 验证身份
  const handleVerifyUser = async (values: any) => {
    setLoading(true)
    try {
      const result = await http.post<{ code: number; message: string; data: any }>('/user/verify-identity', values)
      
      if (result.code === 200) {
        setUserInfo(values)
        setCurrentStep(1)
        message.success('信息验证成功，请设置新密码')
      } else {
        message.error(result.message || '信息验证失败')
      }
    } catch (error) {
      console.error('验证请求失败:', error)
      // 错误已经在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  // 忘记密码 - 重置密码
  const handleResetPassword = async (values: any) => {
    setLoading(true)
    try {
      const result = await http.post<{ code: number; message: string; data: any }>('/user/reset-password', {
        ...userInfo,
        newPassword: values.newPassword
      })
      
      if (result.code === 200) {
        message.success('密码重置成功！')
        setCurrentStep(0)
        setUserInfo(null)
        forgotPasswordForm.resetFields()
        navigate('/user')
      } else {
        message.error(result.message || '密码重置失败')
      }
    } catch (error) {
      console.error('重置密码请求失败:', error)
      // 错误已经在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  // 处理编辑个人信息
  const handleEditProfile = () => {
    setIsEditing(true)
    if (userProfile) {
      profileForm.setFieldsValue(userProfile)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false)
    profileForm.resetFields()
  }

  // 保存个人信息
  const handleSaveProfile = async (values: any) => {
    setLoading(true)
    try {
      const result = await http.put<{ code: number; message: string; data: UserProfile }>('/user/update-profile', values)
      
      if (result.code === 200) {
        setUserProfile(result.data)
        setIsEditing(false)
        message.success('个人信息更新成功！')
      } else {
        message.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新个人信息失败:', error)
      // 错误已经在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    setUserProfile(null)
    message.success('已退出登录')
    navigate('/user')
  }

  const navigateToRegister = () => {
    navigate('/user/register')
  }

  const navigateToLogin = () => {
    navigate('/user')
  }

  const navigateToForgotPassword = () => {
    navigate('/user/forgot-password')
  }

  const validateConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      if (!value || getFieldValue('password') === value || getFieldValue('newPassword') === value) {
        return Promise.resolve()
      }
      return Promise.reject(new Error('两次输入的密码不一致!'))
    },
  })

  // 获取信用分标签颜色
  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  // 获取信用分状态文本
  const getCreditScoreStatus = (score: number) => {
    if (score >= 80) return '良好'
    if (score >= 60) return '一般'
    return '差'
  }

  // 个人中心页面
  if (currentPage === 'profile') {
    if (!userProfile) {
      return (
        <SystemLayoutNoBackground>
          <div className="user-profile-container">
            <Card title="个人中心" className="profile-card">
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>加载中...</div>
              </div>
            </Card>
          </div>
        </SystemLayoutNoBackground>
      )
    }

    return (
      <SystemLayoutNoBackground>
        <div className="user-profile-container">
          <Card
            title="个人中心"
            className="profile-card"
            extra={
              !isEditing && !isUserBanned ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                  loading={loading}
                >
                  编辑信息
                </Button>
              ) : null
            }
          >
            {isUserBanned && (
              <Alert
                message="账号已被封禁"
                description={`您的信用分${userProfile.creditScore}低于${BANNED_CREDIT_SCORE}分，账号已被封禁。请联系管理员解封。`}
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
                style={{ marginBottom: 24 }}
              />
            )}

            {!isEditing ? (
              // 查看模式
              <div className="profile-view">
                <div className="profile-header">
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    src={userProfile.avatarUrl}
                    className="profile-avatar"
                  />
                  <div className="profile-basic-info">
                    <h2>{userProfile.realName}</h2>
                    <p className="username">@{userProfile.username}</p>
                    <div className="profile-tags">
                      <Tag color={getCreditScoreColor(userProfile.creditScore)}>
                        信用分: {userProfile.creditScore} ({getCreditScoreStatus(userProfile.creditScore)})
                      </Tag>
                      {isUserBanned && (
                        <Tag color="error">已封禁</Tag>
                      )}
                    </div>
                  </div>
                </div>

                <Divider />

                <Descriptions column={1} bordered className="profile-details">
                  <Descriptions.Item label="用户ID">{userProfile.userId}</Descriptions.Item>
                  <Descriptions.Item label="用户名">{userProfile.username}</Descriptions.Item>
                  <Descriptions.Item label="邮箱">{userProfile.email}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{userProfile.phoneNumber}</Descriptions.Item>
                  <Descriptions.Item label="真实姓名">{userProfile.realName}</Descriptions.Item>
                  <Descriptions.Item label="学号">{userProfile.schoolId}</Descriptions.Item>
                  <Descriptions.Item label="注册时间">{userProfile.created_at}</Descriptions.Item>
                  <Descriptions.Item label="信用状态">
                    <Tag color={getCreditScoreColor(userProfile.creditScore)}>
                      {userProfile.creditScore}分 - {getCreditScoreStatus(userProfile.creditScore)}
                      {isUserBanned && ' (已封禁)'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <div className="profile-actions">
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/user/forgot-password')}
                    className="change-password-btn"
                    disabled={isUserBanned}
                    loading={loading}
                  >
                    修改密码
                  </Button>
                  <Button onClick={handleLogout} loading={loading}>
                    退出登录
                  </Button>
                  <Button onClick={() => navigate('/')}>
                    返回首页
                  </Button>
                </div>
              </div>
            ) : (
              // 编辑模式
              <div className="profile-edit">
                <Form
                  form={profileForm}
                  name="profile"
                  onFinish={handleSaveProfile}
                  autoComplete="off"
                  size="large"
                  layout="vertical"
                >
                  <div className="edit-section">
                    <h3>基本信息</h3>
                    <Form.Item
                      name="username"
                      label="用户名"
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="用户名"
                        disabled
                      />
                    </Form.Item>

                    <Form.Item
                      name="realName"
                      label="真实姓名"
                      rules={[
                        { required: true, message: '请输入真实姓名!' },
                        { min: 2, message: '姓名至少2个字符!' }
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="真实姓名"
                      />
                    </Form.Item>

                    <Form.Item
                      name="schoolId"
                      label="学号"
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        placeholder="学号/校园ID"
                        disabled
                      />
                    </Form.Item>
                  </div>

                  <Divider />

                  <div className="edit-section">
                    <h3>联系信息</h3>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱!' },
                        { type: 'email', message: '请输入有效的邮箱地址!' }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="邮箱"
                      />
                    </Form.Item>

                    <Form.Item
                      name="phoneNumber"
                      label="手机号"
                      rules={[
                        { required: true, message: '请输入手机号!' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="手机号"
                      />
                    </Form.Item>
                  </div>

                  <div className="edit-actions">
                    <Button onClick={handleCancelEdit} icon={<CloseOutlined />} loading={loading}>
                      取消
                    </Button>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                      保存
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </Card>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  // 忘记密码页面
  if (currentPage === 'forgotPassword') {
    return (
      <SystemLayoutNoBackground>
        <div className="user-forgot-password-container">
          <Card title="找回密码" className="forgot-password-card">
            <Steps
              current={currentStep}
              items={[
                {
                  title: '验证身份',
                },
                {
                  title: '设置新密码',
                },
              ]}
              className="forgot-password-steps"
            />

            {currentStep === 0 ? (
              <Form
                form={forgotPasswordForm}
                name="verifyUser"
                onFinish={handleVerifyUser}
                autoComplete="off"
                size="large"
                layout="vertical"
              >
                <div className="form-section-title">请填写以下信息验证身份</div>

                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名!' },
                    { min: 3, message: '用户名至少3个字符!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="请输入您的用户名"
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号!' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="请输入注册时使用的手机号"
                  />
                </Form.Item>

                <Form.Item
                  name="realName"
                  label="真实姓名"
                  rules={[
                    { required: true, message: '请输入真实姓名!' },
                    { min: 2, message: '姓名至少2个字符!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="请输入您的真实姓名"
                  />
                </Form.Item>

                <Form.Item
                  name="schoolId"
                  label="学号"
                  rules={[
                    { required: true, message: '请输入学号!' }
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="请输入您的学号"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" className="verify-button" loading={loading}>
                    验证身份
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <Form
                form={forgotPasswordForm}
                name="resetPassword"
                onFinish={handleResetPassword}
                autoComplete="off"
                size="large"
                layout="vertical"
                initialValues={userInfo}
              >
                <div className="form-section-title">请设置您的新密码</div>

                <div className="user-info-display">
                  <p><strong>用户名:</strong> {userInfo?.username}</p>
                  <p><strong>姓名:</strong> {userInfo?.realName}</p>
                </div>

                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码!' },
                    { min: 6, message: '密码至少6个字符!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入新密码"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码!' },
                    validateConfirmPassword
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请再次输入新密码"
                  />
                </Form.Item>

                <Form.Item>
                  <div className="reset-password-actions">
                    <Button onClick={() => setCurrentStep(0)} className="back-button" loading={loading}>
                      上一步
                    </Button>
                    <Button type="primary" htmlType="submit" className="reset-button" loading={loading}>
                      确认修改
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            )}

            <div className="forgot-password-links">
              <Button type="link" onClick={navigateToLogin}>
                返回登录
              </Button>
            </div>
          </Card>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  // 注册页面
  if (currentPage === 'register') {
    return (
      <SystemLayoutNoBackground>
        <div className="user-register-container">
          <Card title="用户注册" className="register-card">
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              autoComplete="off"
              size="large"
              scrollToFirstError
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名!' },
                  { min: 3, message: '用户名至少3个字符!' },
                  { max: 20, message: '用户名最多20个字符!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 6, message: '密码至少6个字符!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码!' },
                  validateConfirmPassword
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                rules={[
                  { required: true, message: '请输入手机号!' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="手机号"
                />
              </Form.Item>

              <Form.Item
                name="realName"
                rules={[
                  { required: true, message: '请输入真实姓名!' },
                  { min: 2, message: '姓名至少2个字符!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="真实姓名"
                />
              </Form.Item>

              <Form.Item
                name="schoolId"
                rules={[
                  { required: true, message: '请输入学号!' }
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="学号/校园ID"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="register-button" loading={loading}>
                  注册
                </Button>
              </Form.Item>
            </Form>

            <div className="register-links">
              <Button type="link" onClick={navigateToLogin}>
                已有账号？立即登录
              </Button>
            </div>
          </Card>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  // 登录页面
  return (
    <SystemLayoutNoBackground>
      <div className="user-login-container">
        <Card title="用户登录" className="login-card">
          <Form
            form={loginForm}
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名!' },
                { min: 3, message: '用户名至少3个字符!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码至少6个字符!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-button" loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-links">
            <Button type="link" onClick={navigateToRegister}>
              立即注册
            </Button>
            <Button type="link" onClick={navigateToForgotPassword}>
              忘记密码
            </Button>
          </div>
        </Card>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default User