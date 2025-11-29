import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, message, Spin, Tag, Image, Row, Col, Typography, Divider, Space } from "antd"
import { ArrowLeftOutlined, EditOutlined, ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, StarOutlined, HomeOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { http } from "@/utils/request"
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

interface SellerInfo {
  sellerId: number
  username: string
  avatarUrl?: string
  creditScore: number
}

interface GoodsDetailData {
  goods: Goods
  seller?: SellerInfo
}

const GoodsDetail: FC = () => {
  const [loading, setLoading] = useState(true)
  const [detailData, setDetailData] = useState<GoodsDetailData | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 获取商品详情
  const fetchGoodsDetail = async () => {
    if (!id) return

    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: GoodsDetailData }>(`/goods/${id}`)
      if (result.code === 200) {
        setDetailData(result.data)
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

  // 联系卖家
  const handleContactSeller = () => {
    const sellerId = detailData?.goods?.sellerId
    const productId = detailData?.goods?.id
    if (sellerId && productId) {
      // 跳转到消息通讯页面，传递sellerId和productId
      navigate(`/connection/${sellerId}?productId=${productId}`)
      message.success('正在跳转到聊天页面...')
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

  // 查看卖家主页
  const handleViewSellerProfile = () => {
    const sellerId = detailData?.goods?.sellerId
    if (sellerId) {
      // 跳转到卖家个人空间页面
      navigate(`/user/profile/${sellerId}`)
    } else {
      console.log('无法获取卖家信息');
    }
  };

  // 查看近期评价
  const handleViewReviews = () => {
    if (id) {
      // 跳转到评价列表页面
      navigate(`/reviews/goods/${id}`)
    }
  }

  // 发起交易
  const handleCreateTrade = async () => {
    console.log('🛒 开始创建交易订单...')
    
    //const token = localStorage.getItem('token')
    //const currentUserId = localStorage.getItem('userId')
    
    // // 验证登录状态
    // if (!token) {
    //   message.warning('请先登录')
    //   navigate('/user')
    //   return
    // }
    
    // // 验证userId
    // if (!currentUserId) {
    //   message.error('无法获取用户信息，请重新登录')
    //   navigate('/user')
    //   return
    // }
    
    // 验证商品信息
    if (!detailData || !detailData.goods) {
      message.error('商品信息不完整')
      return
    }

    const { goods } = detailData
    
    // // 检查是否是自己的商品
    // if (goods.sellerId === Number(currentUserId)) {
    //   message.warning('不能购买自己发布的商品')
    //   return
    // }

    // 检查商品状态
    if (goods.status !== 'ACTIVE') {
      message.warning('该商品已下架，无法购买')
      return
    }

    try {
      const tradeData = {
        id: goods.id,
        name: goods.name,
        price: goods.price,
        image_url: goods.imageUrl || '',
        trade_localtion: goods.tradeLocation || '待协商',
        seller_id: goods.sellerId,
        //buyer_id: Number(currentUserId)
      }

      console.log('📤 发送交易请求:', tradeData)
      message.loading({ content: '正在创建订单...', key: 'createTrade' })

      const result = await http.post<{ code: number; message: string; data: number }>('/trades', tradeData)
      
      console.log('📥 收到后端响应:', result)
      
      if (result.code === 200) {
        message.success({ content: `交易订单创建成功！订单ID: ${result.data}`, key: 'createTrade', duration: 2 })
        console.log('✅ 交易创建成功，订单ID:', result.data)
        
        // 跳转到交易管理页面查看订单
        setTimeout(() => {
          console.log('🔄 跳转到交易管理页面')
          navigate('/trade-manage')
        }, 1500)
      } else {
        message.error({ content: result.message || '创建交易订单失败', key: 'createTrade' })
        console.error('❌ 后端返回错误:', result)
      }
    } catch (error: any) {
      console.error('❌ 创建交易失败:', error)
      message.error({ 
        content: error.response?.data?.message || '创建交易订单失败，请稍后重试', 
        key: 'createTrade' 
      })
      
      // 打印详细错误信息
      if (error.response) {
        console.error('错误响应:', error.response.data)
        console.error('错误状态码:', error.response.status)
      }
    }
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

  if (!detailData || !detailData.goods) {
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

  const { goods, seller } = detailData

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
                  {goods.imageUrl ? (
                    <Image
                      src={goods.imageUrl}
                      alt={goods.name}
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
                  <Title level={3} className="goods-title">{goods.name}</Title>
                  <div className="goods-price">¥{goods.price}</div>
                </div>

                <div className="goods-tags">
                  <Tag className="category-tag">{goods.category}</Tag>
                  <Tag className="condition-tag">{goods.conditionStatus}</Tag>
                  <Tag className={`status-tag ${goods.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {goods.status === 'ACTIVE' ? '上架' : '下架'}
                  </Tag>
                </div>

                <Divider />

                <div className="goods-description">
                  <Title level={5} className="section-title">商品描述</Title>
                  <Text className="description-text">{goods.description}</Text>
                </div>

                <Divider />

                {/* 卖家信息 */}
                {seller && (
                  <div className="seller-info">
                    <Title level={5} className="section-title">卖家信息</Title>
                    <div className="seller-content">
                      <div className="seller-avatar">
                        {seller.avatarUrl ? (
                          <img src={seller.avatarUrl} alt={seller.username} />
                        ) : (
                          <UserOutlined style={{ fontSize: 32 }} />
                        )}
                      </div>
                      <div className="seller-details">
                        <div className="seller-name">{seller.username}</div>
                        <div className="seller-credit">
                          信用分: <span className={seller.creditScore >= 80 ? 'high' : seller.creditScore >= 60 ? 'medium' : 'low'}>
                            {seller.creditScore}
                          </span>
                        </div>
                      </div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
<<<<<<< HEAD
                        <Button 
                          type="primary" 
                          icon={<ShoppingCartOutlined />}
                          onClick={handleCreateTrade}
                          className="buy-button"
                          size="large"
                          block
                          disabled={goods.status !== 'ACTIVE'}
                        >
                          {goods.status === 'ACTIVE' ? '立即购买' : '商品已下架'}
                        </Button>
                        <Button 
=======
                        <Button
                          type="primary"
>>>>>>> 826fb30ba4934b2a72873855dbd5d925a42cc979
                          icon={<PhoneOutlined />}
                          onClick={handleContactSeller}
                          className="contact-button"
                          block
                        >
                          联系卖家
                        </Button>
                        <Space style={{ width: '100%' }}>
                          <Button
                            icon={<HomeOutlined />}
                            onClick={handleViewSellerProfile}
                            style={{ flex: 1 }}
                          >
                            卖家主页
                          </Button>
                          <Button
                            icon={<StarOutlined />}
                            onClick={handleViewReviews}
                            style={{ flex: 1 }}
                          >
                            近期评价
                          </Button>
                        </Space>
                      </Space>
                    </div>
                  </div>
                )}

                <Divider />

                {/* 交易信息 */}
                <div className="trade-info">
                  <Title level={5} className="section-title">交易信息</Title>
                  <div className="trade-items">
                    {goods.tradeTime && (
                      <div className="trade-item">
                        <ClockCircleOutlined className="trade-icon" />
                        <div className="trade-content">
                          <Text className="trade-label">交易时间</Text>
                          <Text className="trade-value">{goods.tradeTime}</Text>
                        </div>
                      </div>
                    )}

                    {goods.tradeLocation && (
                      <div className="trade-item">
                        <EnvironmentOutlined className="trade-icon" />
                        <div className="trade-content">
                          <Text className="trade-label">交易地点</Text>
                          <Text className="trade-value">{goods.tradeLocation}</Text>
                        </div>
                      </div>
                    )}

                    {goods.contactPhone && (
                      <div className="trade-item">
                        <PhoneOutlined className="trade-icon" />
                        <div className="trade-content">
                          <Text className="trade-label">联系电话</Text>
                          <Text className="trade-value">{goods.contactPhone}</Text>
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
            <Title level={4} className="meta-title">商品信息</Title>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div className="meta-item">
                  <CalendarOutlined className="meta-icon" />
                  <div className="meta-content">
                    <Text className="meta-label">发布时间</Text>
                    <Text className="meta-value">
                      {new Date(goods.createTime!).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </Col>
              {goods.updateTime && goods.updateTime !== goods.createTime && (
                <Col xs={24} sm={12} md={8}>
                  <div className="meta-item">
                    <CalendarOutlined className="meta-icon" />
                    <div className="meta-content">
                      <Text className="meta-label">更新时间</Text>
                      <Text className="meta-value">
                        {new Date(goods.updateTime!).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </div>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default GoodsDetail


