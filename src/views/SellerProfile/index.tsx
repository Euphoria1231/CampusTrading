import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Empty, Spin, Tag, Avatar, Divider, Typography, Row, Col, List, Pagination, message } from "antd"
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, ShoppingOutlined, StarOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { http } from "@/utils/request"
import './index.less'

const { Title, Text } = Typography

interface UserInfo {
  userId: number
  username: string
  email: string
  phoneNumber: string
  avatarUrl?: string
  realName: string
  schoolId: string
  creditScore: number
  created_at: string
}

interface Goods {
  id: number
  name: string
  description: string
  price: number
  category: string
  conditionStatus: string
  imageUrl?: string
  status: string
  createTime: string
  updateTime: string
  sellerId: number
}

interface PageInfo<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

const SellerProfile: FC = () => {
  const [loading, setLoading] = useState(true)
  const [goodsLoading, setGoodsLoading] = useState(false)
  const [sellerInfo, setSellerInfo] = useState<UserInfo | null>(null)
  const [goodsData, setGoodsData] = useState<PageInfo<Goods>>({
    list: [],
    total: 0,
    pageNum: 1,
    pageSize: 6,
    pages: 0
  })
  const navigate = useNavigate()
  const { sellerId } = useParams<{ sellerId: string }>()

  // 获取卖家信息
  const fetchSellerInfo = async () => {
    if (!sellerId) return
    
    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: UserInfo }>(`/user/profile/${sellerId}`)
      if (result.code === 200) {
        setSellerInfo(result.data)
      } else {
        message.error(result.message || '获取卖家信息失败')
        navigate(-1)
      }
    } catch (error) {
      message.error('获取卖家信息失败')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  // 获取卖家的商品列表
  const fetchSellerGoods = async (pageNum: number, pageSize: number) => {
    if (!sellerId) return
    
    setGoodsLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: PageInfo<Goods> }>(
        `/user/recent-goods/${sellerId}?pageNum=${pageNum}&pageSize=${pageSize}`
      )
      if (result.code === 200) {
        setGoodsData(result.data)
      } else {
        message.error(result.message || '获取商品列表失败')
      }
    } catch (error) {
      message.error('获取商品列表失败')
    } finally {
      setGoodsLoading(false)
    }
  }

  useEffect(() => {
    fetchSellerInfo()
    fetchSellerGoods(1, 6)
  }, [sellerId])

  // 返回上一页
  const handleBack = () => {
    navigate(-1)
  }

  // 联系卖家
  const handleContactSeller = () => {
    if (sellerId) {
      navigate(`/connection/${sellerId}`)
      message.success('正在跳转到聊天页面...')
    }
  }

  // 查看商品详情
  const handleViewGoods = (goodsId: number) => {
    navigate(`/goods-detail/${goodsId}`)
  }

  // 分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    fetchSellerGoods(page, pageSize || goodsData.pageSize)
  }

  // 获取信用分标签颜色
  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  // 获取信用分状态
  const getCreditScoreStatus = (score: number) => {
    if (score >= 80) return '良好'
    if (score >= 60) return '一般'
    return '差'
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // 获取商品状态标签颜色
  const getGoodsStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'success',
      'SOLD': 'default',
      'INACTIVE': 'warning'
    }
    return statusMap[status] || 'default'
  }

  // 获取商品状态文本
  const getGoodsStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': '在售',
      'SOLD': '已售',
      'INACTIVE': '下架'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <SystemLayoutNoBackground>
        <div className="seller-profile-container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载卖家信息中...</div>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  if (!sellerInfo) {
    return (
      <SystemLayoutNoBackground>
        <div className="seller-profile-container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div>卖家信息不存在</div>
            <Button onClick={handleBack} style={{ marginTop: 16 }}>
              返回
            </Button>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  return (
    <SystemLayoutNoBackground>
      <div className="seller-profile-container">
        {/* 页面头部 */}
        <div className="seller-profile-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
          >
            返回
          </Button>
          <div className="header-title">
            <Title level={2} className="page-title">卖家主页</Title>
            <Text className="page-subtitle">查看卖家信息及商品</Text>
          </div>
        </div>

        {/* 卖家信息卡片 */}
        <Card className="seller-info-card">
          <Row gutter={24} align="middle">
            <Col>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={sellerInfo.avatarUrl}
                className="seller-avatar"
              />
            </Col>
            <Col flex={1}>
              <div className="seller-details">
                <Title level={3} className="seller-name">{sellerInfo.realName}</Title>
                <Text type="secondary" className="seller-username">@{sellerInfo.username}</Text>
                
                <div className="seller-tags">
                  <Tag color={getCreditScoreColor(sellerInfo.creditScore)} className="credit-tag">
                    <StarOutlined /> 信用分: {sellerInfo.creditScore} ({getCreditScoreStatus(sellerInfo.creditScore)})
                  </Tag>
                  <Tag icon={<ShoppingOutlined />}>学号: {sellerInfo.schoolId}</Tag>
                </div>

                <div className="seller-meta">
                  <Text type="secondary">注册时间: {new Date(sellerInfo.created_at).toLocaleDateString()}</Text>
                </div>
              </div>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                onClick={handleContactSeller}
                className="contact-button"
              >
                联系卖家
              </Button>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* 商品列表 */}
        <Card className="goods-list-card" title={
          <div className="goods-list-title">
            <ShoppingOutlined /> 卖家商品 ({goodsData.total})
          </div>
        }>
          {goodsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>加载商品中...</div>
            </div>
          ) : goodsData.list.length > 0 ? (
            <>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                  xxl: 3,
                }}
                dataSource={goodsData.list}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      className="goods-card"
                      cover={
                        item.imageUrl ? (
                          <div className="goods-image-wrapper">
                            <img
                              alt={item.name}
                              src={item.imageUrl}
                              className="goods-image"
                            />
                          </div>
                        ) : (
                          <div className="goods-image-placeholder">
                            <ShoppingOutlined style={{ fontSize: 48 }} />
                          </div>
                        )
                      }
                      onClick={() => handleViewGoods(item.id)}
                    >
                      <Card.Meta
                        title={
                          <div className="goods-card-title">
                            <Text ellipsis={{ tooltip: item.name }} strong>
                              {item.name}
                            </Text>
                          </div>
                        }
                        description={
                          <div className="goods-card-description">
                            <Text
                              type="secondary"
                              ellipsis={{ tooltip: item.description }}
                              className="goods-description"
                            >
                              {item.description}
                            </Text>
                            <div className="goods-info">
                              <Tag color="blue">{item.category}</Tag>
                              <Tag>{item.conditionStatus}</Tag>
                            </div>
                            <div className="goods-footer">
                              <Text strong className="goods-price">
                                {formatPrice(item.price)}
                              </Text>
                              <Tag color={getGoodsStatusColor(item.status)}>
                                {getGoodsStatusText(item.status)}
                              </Tag>
                            </div>
                            <Text type="secondary" className="goods-time">
                              发布于 {formatTime(item.createTime)}
                            </Text>
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
              
              {/* 分页 */}
              {goodsData.pages > 1 && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination
                    current={goodsData.pageNum}
                    pageSize={goodsData.pageSize}
                    total={goodsData.total}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条商品`
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="该卖家暂无商品"
              style={{ padding: '60px 0' }}
            />
          )}
        </Card>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default SellerProfile
