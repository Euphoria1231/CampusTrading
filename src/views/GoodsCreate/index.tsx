import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Form, Input, InputNumber, Select, message, Space, Upload, Divider, Typography, Row, Col } from "antd"
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { UploadFile, UploadProps } from 'antd'
import { http } from "@/utils/request"
import './index.less'

const { Title, Text } = Typography

const { Option } = Select
const { TextArea } = Input

interface GoodsForm {
  name: string
  description: string
  price: number
  category: string
  conditionStatus: string
  imageUrl: string
  tradeTime?: string
  tradeLocation?: string
  contactPhone?: string
  sellerId?: number
}

const GoodsCreate: FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false) // 防止重复提交
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const navigate = useNavigate()


  // 处理文件上传
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  // 自定义上传函数
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    
    try {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        message.error('只能上传图片文件')
        onError(new Error('文件类型错误'))
        return
      }
      
      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片大小不能超过5MB')
        onError(new Error('文件过大'))
        return
      }
      
      // 创建FormData
      const formData = new FormData()
      formData.append('file', file)
      
      // 暂时使用blob URL进行预览，但不保存到数据库
      // 实际项目中应该上传到服务器并返回真实URL
      const blobUrl = URL.createObjectURL(file)
      
      // 模拟上传过程
      setTimeout(() => {
        onSuccess({ 
          url: blobUrl,
          // 注意：这里返回的是临时URL，实际应该返回服务器URL
          // 建议用户使用URL输入方式上传到图床服务
        })
        message.warning('图片已上传，建议使用图床URL确保图片持久保存')
      }, 1000)
    } catch (error) {
      onError(error)
    }
  }

  // 提交表单
  const handleSubmit = async (values: GoodsForm) => {
    // 防止重复提交
    if (submitting) {
      console.log('正在提交中，请勿重复操作')
      return
    }
    
    setLoading(true)
    setSubmitting(true)
    try {
      // 检查图片URL，如果是blob URL则清空
      // sellerId将由后端从token中自动获取
      const submitData = {
        ...values,
        imageUrl: values.imageUrl?.startsWith('blob:') ? '' : values.imageUrl
      }
      
      // 如果用户上传了本地图片但没有提供URL，给出提示
      if (fileList.length > 0 && !submitData.imageUrl) {
        message.warning('检测到您上传了本地图片，但未提供图片URL。请使用图床服务（如imgur、七牛云等）获取图片URL，或留空使用默认图片。')
      }
      
      const result = await http.post<{ code: number; message: string }>('/goods/create', submitData)
      
      if (result.code === 200) {
        message.success('商品创建成功')
        navigate('/goods-browse')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('创建失败')
      setSubmitting(false) // 失败时重置状态，允许重试
    } finally {
      setLoading(false)
      // 成功时不重置submitting，因为会跳转页面
    }
  }

  // 返回浏览页面
  const handleBack = () => {
    navigate('/goods-browse')
  }

  return (
    <SystemLayoutNoBackground>
      <div className="goods-create-container">
        {/* 页面头部 */}
        <div className="goods-create-header">
          <div className="header-content">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="back-button"
            >
              返回
            </Button>
            <div className="header-title">
              <Title level={2} className="page-title">创建商品</Title>
              <Text className="page-subtitle">填写商品信息，让更多人发现您的宝贝</Text>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="goods-create-content">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="goods-form"
            size="large"
          >
            <Row gutter={[24, 24]}>
              {/* 左侧基本信息 */}
              <Col xs={24} lg={12}>
                <Card className="form-card">
                  <div className="form-header">
                    <Title level={4} className="form-title">📝 基本信息</Title>
                    <Text className="form-description">填写商品的基本信息</Text>
                  </div>
                  
                  <Form.Item
                    name="name"
                    label={<span className="form-label">商品名称 <span className="required">*</span></span>}
                    rules={[{ required: true, message: '请输入商品名称' }]}
                  >
                    <Input 
                      placeholder="请输入商品名称" 
                      className="form-input"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="price"
                    label={<span className="form-label">价格 <span className="required">*</span></span>}
                    rules={[{ required: true, message: '请输入价格' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="请输入价格"
                      min={0}
                      precision={2}
                      className="form-input"
                      size="large"
                      addonBefore="¥"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="description"
                    label={<span className="form-label">商品描述 <span className="required">*</span></span>}
                    rules={[{ required: true, message: '请输入商品描述' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="请详细描述商品的特点、使用情况等信息" 
                      className="form-textarea"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* 右侧分类和交易信息 */}
              <Col xs={24} lg={12}>
                <Row gutter={[0, 24]}>
                  {/* 分类信息 */}
                  <Col xs={24}>
                    <Card className="form-card">
                      <div className="form-header">
                        <Title level={4} className="form-title">🏷️ 分类信息</Title>
                        <Text className="form-description">选择商品分类和成色</Text>
                      </div>
                      
                      <Form.Item
                        name="category"
                        label={<span className="form-label">商品分类 <span className="required">*</span></span>}
                        rules={[{ required: true, message: '请选择分类' }]}
                      >
                        <Select 
                          placeholder="请选择分类" 
                          className="form-input"
                          size="large"
                        >
                          <Option value="电子产品">📱 电子产品</Option>
                          <Option value="服装鞋帽">👕 服装鞋帽</Option>
                          <Option value="图书文具">📚 图书文具</Option>
                          <Option value="生活用品">🏠 生活用品</Option>
                          <Option value="体育用品">⚽ 体育用品</Option>
                          <Option value="其他">📦 其他</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="conditionStatus"
                        label={<span className="form-label">商品成色 <span className="required">*</span></span>}
                        rules={[{ required: true, message: '请选择成色' }]}
                      >
                        <Select 
                          placeholder="请选择成色" 
                          className="form-input"
                          size="large"
                        >
                          <Option value="全新">✨ 全新</Option>
                          <Option value="九成新">🆕 九成新</Option>
                          <Option value="八成新">👍 八成新</Option>
                          <Option value="七成新">👌 七成新</Option>
                          <Option value="六成新">👀 六成新</Option>
                          <Option value="五成新">⚠️ 五成新</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  </Col>

                  {/* 交易信息 */}
                  <Col xs={24}>
                    <Card className="form-card">
                      <div className="form-header">
                        <Title level={4} className="form-title">🤝 交易信息</Title>
                        <Text className="form-description">设置交易时间和地点</Text>
                      </div>
                      
                      <Form.Item
                        name="tradeTime"
                        label={<span className="form-label">交易时间</span>}
                      >
                        <Input 
                          placeholder="如：工作日晚上7-9点" 
                          className="form-input"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="tradeLocation"
                        label={<span className="form-label">交易地点</span>}
                      >
                        <Input 
                          placeholder="如：学校图书馆门口" 
                          className="form-input"
                          size="large"
                        />
                      </Form.Item>
                      
                      <Form.Item
                        name="contactPhone"
                        label={<span className="form-label">联系电话</span>}
                        rules={[
                          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                        ]}
                      >
                        <Input 
                          placeholder="请输入手机号码" 
                          className="form-input"
                          size="large"
                          maxLength={11}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* 图片上传区域 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24}>
                <Card className="form-card">
                  <div className="form-header">
                    <Title level={4} className="form-title">📸 商品图片</Title>
                    <Text className="form-description">上传商品图片或输入图片链接</Text>
                  </div>
                  
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <div className="upload-section">
                        <Text className="upload-title">本地图片上传</Text>
                        <Upload.Dragger
                          name="file"
                          listType="picture-card"
                          fileList={fileList}
                          onChange={handleUploadChange}
                          customRequest={customUpload}
                          accept="image/*"
                          maxCount={1}
                          className="upload-dragger"
                        >
                          <div className="upload-content">
                            <InboxOutlined className="upload-icon" />
                            <div className="upload-text">点击或拖拽上传图片</div>
                            <div className="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</div>
                          </div>
                        </Upload.Dragger>
                      </div>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <div className="url-section">
                        <Text className="url-title">图片链接输入</Text>
                        <Form.Item
                          name="imageUrl"
                          label={<span className="form-label">图片URL</span>}
                        >
                          <Input 
                            placeholder="请输入图片URL地址" 
                            className="form-input"
                            size="large"
                          />
                        </Form.Item>
                        <Text className="url-tip">
                          💡 建议使用图床服务（如imgur、七牛云等）获取永久链接
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* 操作按钮 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24}>
                <Card className="form-card">
                  <div className="form-actions">
                    <Space size="large">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        className="submit-button"
                        size="large"
                        onClick={() => form.submit()}
                      >
                        创建商品
                      </Button>
                      <Button 
                        onClick={handleBack}
                        className="cancel-button"
                        size="large"
                      >
                        取消
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default GoodsCreate