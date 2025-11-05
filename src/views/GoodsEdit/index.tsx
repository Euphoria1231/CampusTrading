import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Form, Input, InputNumber, Select, message, Space, Spin, Row, Col, Typography, Divider, Upload, Image } from "antd"
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import './index.less'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface Goods {
  id?: number
  name: string
  description: string
  price: number
  category: string
  conditionStatus: string
  imageUrl: string
  tradeTime?: string
  tradeLocation?: string
  contactPhone?: string
  sellerId: number
  status: string
  createTime?: string
  updateTime?: string
}

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
}

const GoodsEdit: FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [goodsData, setGoodsData] = useState<Goods | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [fileList, setFileList] = useState<any[]>([])
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 获取商品详情
  const fetchGoodsDetail = async () => {
    if (!id) return
    
    setInitialLoading(true)
    try {
      const response = await fetch(`http://localhost:8081/api/goods/${id}`)
      const result = await response.json()
      if (result.code === 200) {
        setGoodsData(result.data)
        form.setFieldsValue(result.data)
        if (result.data.imageUrl) {
          setImagePreview(result.data.imageUrl)
        }
      } else {
        message.error(result.message)
        navigate('/goods-browse')
      }
    } catch (error) {
      message.error('获取商品详情失败')
      navigate('/goods-browse')
    } finally {
      setInitialLoading(false)
    }
  }

  // 处理图片URL变化
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImagePreview(url)
  }

  // 处理文件上传
  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList]
    newFileList = newFileList.slice(-1) // 只保留最后一个文件
    setFileList(newFileList)

    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`)
      // 这里应该处理上传成功后的逻辑，比如获取图片URL
      // 暂时使用blob URL作为示例
      const blobUrl = URL.createObjectURL(info.file.originFileObj)
      setImagePreview(blobUrl)
      form.setFieldsValue({ imageUrl: blobUrl })
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`)
    }
  }

  // 自定义上传
  const customUpload = (options: any) => {
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
      
      // 模拟上传过程
      setTimeout(() => {
        onSuccess('ok')
        message.warning('图片已上传预览，建议使用图床URL确保图片持久保存')
      }, 1000)
    } catch (error) {
      onError(error)
    }
  }

  // 提交表单
  const handleSubmit = async (values: GoodsForm) => {
    setLoading(true)
    try {
      // 检查图片URL，如果是blob URL则清空
      const submitData = {
        ...values,
        imageUrl: values.imageUrl?.startsWith('blob:') ? '' : values.imageUrl,
        id: goodsData?.id,
        sellerId: goodsData?.sellerId
      }
      
      // 如果用户上传了本地图片但没有提供URL，给出提示
      if (fileList.length > 0 && !submitData.imageUrl) {
        message.warning('检测到您上传了本地图片，但未提供图片URL。请使用图床服务（如imgur、七牛云等）获取图片URL，或留空使用默认图片。')
      }
      
      const response = await fetch('http://localhost:8081/api/goods/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })
      
      const result = await response.json()
      if (result.code === 200) {
        message.success('商品更新成功')
        navigate('/goods-browse')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  // 返回浏览页面
  const handleBack = () => {
    navigate('/goods-browse')
  }

  useEffect(() => {
    fetchGoodsDetail()
  }, [id])

  if (initialLoading) {
    return (
      <SystemLayoutNoBackground>
        <div className="goods-edit-container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载商品详情中...</div>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  return (
    <SystemLayoutNoBackground>
      <div className="goods-edit-container">
        {/* 页面头部 */}
        <div className="goods-edit-header">
          <div className="header-content">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="back-button"
            >
              返回
            </Button>
            <div className="header-title">
              <Title level={2} className="page-title">编辑商品</Title>
              <Text className="page-subtitle">修改商品信息</Text>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="goods-edit-content">
          <Row gutter={[32, 32]}>
            {/* 左侧表单 */}
            <Col xs={24} lg={16}>
              <Card className="form-card">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="goods-form"
                >
                  {/* 基本信息 */}
                  <div className="form-section">
                    <Title level={4} className="section-title">基本信息</Title>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={12}>
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
                      </Col>
                      <Col xs={24} md={12}>
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
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="description"
                      label={<span className="form-label">商品描述 <span className="required">*</span></span>}
                      rules={[{ required: true, message: '请输入商品描述' }]}
                    >
                      <TextArea 
                        rows={4} 
                        placeholder="请输入商品描述" 
                        className="form-input"
                        size="large"
                      />
                    </Form.Item>
                  </div>

                  <Divider />

                  {/* 分类信息 */}
                  <div className="form-section">
                    <Title level={4} className="section-title">分类信息</Title>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="category"
                          label={<span className="form-label">📦 分类 <span className="required">*</span></span>}
                          rules={[{ required: true, message: '请选择分类' }]}
                        >
                          <Select 
                            placeholder="请选择分类" 
                            className="form-input"
                            size="large"
                          >
                            <Option value="电子产品">电子产品</Option>
                            <Option value="服装鞋帽">服装鞋帽</Option>
                            <Option value="图书文具">图书文具</Option>
                            <Option value="生活用品">生活用品</Option>
                            <Option value="体育用品">体育用品</Option>
                            <Option value="其他">其他</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="conditionStatus"
                          label={<span className="form-label">⭐ 成色 <span className="required">*</span></span>}
                          rules={[{ required: true, message: '请选择成色' }]}
                        >
                          <Select 
                            placeholder="请选择成色" 
                            className="form-input"
                            size="large"
                          >
                            <Option value="全新">全新</Option>
                            <Option value="九成新">九成新</Option>
                            <Option value="八成新">八成新</Option>
                            <Option value="七成新">七成新</Option>
                            <Option value="六成新">六成新</Option>
                            <Option value="五成新">五成新</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  <Divider />

                  {/* 交易信息 */}
                  <div className="form-section">
                    <Title level={4} className="section-title">交易信息</Title>
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={12}>
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
                      </Col>
                      <Col xs={24} md={12}>
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
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="contactPhone"
                      label={<span className="form-label">联系电话</span>}
                    >
                      <Input 
                        placeholder="请输入手机号码" 
                        className="form-input"
                        size="large"
                      />
                    </Form.Item>
                  </div>

                  <Divider />

                  {/* 商品图片 */}
                  <div className="form-section">
                    <Title level={4} className="section-title">商品图片</Title>
                    
                    <div className="image-upload-section">
                      <div className="upload-area">
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
                            <PlusOutlined className="upload-icon" />
                            <div className="upload-text">点击或拖拽上传图片</div>
                            <div className="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</div>
                          </div>
                        </Upload.Dragger>
                      </div>
                      
                      <div className="url-input-area">
                        <Form.Item
                          name="imageUrl"
                          label={<span className="form-label">或输入图片URL</span>}
                        >
                          <Input 
                            placeholder="请输入图片URL" 
                            className="form-input"
                            size="large"
                            onChange={handleImageUrlChange}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* 操作按钮 */}
                  <div className="form-actions">
                    <Space size="large">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        className="submit-button"
                        size="large"
                      >
                        保存修改
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
                </Form>
              </Card>
            </Col>

            {/* 右侧预览 */}
            <Col xs={24} lg={8}>
              <Card className="preview-card">
                <Title level={4} className="preview-title">商品预览</Title>
                <div className="preview-content">
                  <div className="preview-image">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="商品预览"
                        className="preview-img"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSk6TpGpRE9BqJp0cKQ"
                      />
                    ) : (
                      <div className="preview-placeholder">
                        <div className="placeholder-icon">📷</div>
                        <div className="placeholder-text">暂无图片</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="preview-info">
                    <Text className="preview-hint">实时预览商品效果</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default GoodsEdit


