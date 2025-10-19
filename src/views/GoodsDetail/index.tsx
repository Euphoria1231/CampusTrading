import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Descriptions, message, Spin, Tag, Image, Row, Col, Typography, Divider, Space } from "antd"
import { ArrowLeftOutlined, EditOutlined, ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import './index.less'

const { Title, Text } = Typography

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

const GoodsDetail: FC = () => {
  const [loading, setLoading] = useState(true)
  const [goodsData, setGoodsData] = useState<Goods | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 获取商品详情
  const fetchGoodsDetail = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8081/api/goods/${id}`)
      const result = await response.json()
      if (result.code === 200) {
        setGoodsData(result.data)
      } else {
        message.error(result.message)
        navigate('/goods-browse')
      }
    } catch (error) {
      message.error('获取商品详情失败')
      navigate('/goods-browse')
    } finally {
      setLoading(false)
    }
  }

  // 返回浏览页面
  const handleBack = () => {
    navigate('/goods-browse')
  }

  // 跳转到编辑页面
  const handleEdit = () => {
    navigate(`/goods-edit/${id}`)
  }

  useEffect(() => {
    fetchGoodsDetail()
  }, [id])

  if (loading) {
    return (
      <SystemLayoutNoBackground>
        <div className="goods-detail-container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载商品详情中...</div>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  if (!goodsData) {
    return (
      <SystemLayoutNoBackground>
        <div className="goods-detail-container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div>商品不存在</div>
            <Button onClick={handleBack} style={{ marginTop: 16 }}>
              返回商品列表
            </Button>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  return (
    <SystemLayoutNoBackground>
      <div className="goods-detail-container">
        {/* 页面头部 */}
        <div className="goods-detail-header">
          <div className="header-content">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="back-button"
            >
              返回
            </Button>
            <div className="header-title">
              <Title level={2} className="page-title">商品详情</Title>
              <Text className="page-subtitle">查看商品详细信息</Text>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="edit-button"
            >
              编辑商品
            </Button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="goods-detail-content">
          <Row gutter={[32, 32]}>
            {/* 左侧商品图片 */}
            <Col xs={24} lg={12}>
              <Card className="image-card">
                <div className="image-container">
                  {goodsData.imageUrl ? (
                    <Image
                      src={goodsData.imageUrl}
                      alt={goodsData.name}
                      className="goods-image"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSk6TpGpRE9BqJp0cKQ"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <div className="placeholder-icon">📷</div>
                      <div className="placeholder-text">暂无图片</div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* 右侧商品信息 */}
            <Col xs={24} lg={12}>
              <Card className="info-card">
                <div className="goods-header">
                  <Title level={3} className="goods-title">{goodsData.name}</Title>
                  <div className="goods-price">¥{goodsData.price}</div>
                </div>

                <div className="goods-tags">
                  <Tag className="category-tag">{goodsData.category}</Tag>
                  <Tag className="condition-tag">{goodsData.conditionStatus}</Tag>
                  <Tag className={`status-tag ${goodsData.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {goodsData.status === 'ACTIVE' ? '上架' : '下架'}
                  </Tag>
                </div>

                <Divider />

                <div className="goods-description">
                  <Title level={5} className="section-title">商品描述</Title>
                  <Text className="description-text">{goodsData.description}</Text>
                </div>

                <Divider />

                {/* 交易信息 */}
                <div className="trade-info">
                  <Title level={5} className="section-title">交易信息</Title>
                  <div className="trade-items">
                    {goodsData.tradeTime && (
                      <div className="trade-item">
                        <ClockCircleOutlined className="trade-icon" />
                        <div className="trade-content">
                          <Text className="trade-label">交易时间</Text>
                          <Text className="trade-value">{goodsData.tradeTime}</Text>
                        </div>
                      </div>
                    )}
                    
                    {goodsData.tradeLocation && (
                      <div className="trade-item">
                        <EnvironmentOutlined className="trade-icon" />
                        <div className="trade-content">
                          <Text className="trade-label">交易地点</Text>
                          <Text className="trade-value">{goodsData.tradeLocation}</Text>
                        </div>
                      </div>
                    )}
                    
                    {goodsData.contactPhone && (
                      <div className="trade-item">
                        <PhoneOutlined className="trade-icon" />
                        <div className="trade-content">
                          <Text className="trade-label">联系电话</Text>
                          <Text className="trade-value">{goodsData.contactPhone}</Text>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 详细信息卡片 */}
          <Card className="meta-card">
            <Title level={4} className="meta-title">详细信息</Title>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className="meta-item">
                  <UserOutlined className="meta-icon" />
                  <div className="meta-content">
                    <Text className="meta-label">商品ID</Text>
                    <Text className="meta-value">{goodsData.id}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="meta-item">
                  <UserOutlined className="meta-icon" />
                  <div className="meta-content">
                    <Text className="meta-label">卖家ID</Text>
                    <Text className="meta-value">{goodsData.sellerId}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="meta-item">
                  <CalendarOutlined className="meta-icon" />
                  <div className="meta-content">
                    <Text className="meta-label">创建时间</Text>
                    <Text className="meta-value">
                      {new Date(goodsData.createTime!).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="meta-item">
                  <CalendarOutlined className="meta-icon" />
                  <div className="meta-content">
                    <Text className="meta-label">更新时间</Text>
                    <Text className="meta-value">
                      {new Date(goodsData.updateTime!).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default GoodsDetail


