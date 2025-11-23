import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Empty, List, Rate, Spin, Tag, Typography, Avatar, Divider, Space, message } from "antd"
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, StarOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { http } from "@/utils/request"
import './index.less'

const { Title, Text, Paragraph } = Typography

interface Review {
  id: number
  reviewerId: number
  reviewerName?: string
  revieweeId: number
  revieweeName?: string
  productId: number
  orderId: number
  rating: number
  comment: string
  createTime: string
  updateTime?: string
}

const Reviews: FC = () => {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 获取商品评价列表
  const fetchReviews = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: Review[] }>(`/review/product/${id}`)
      if (result.code === 200) {
        setReviews(result.data || [])
      } else {
        message.error(result.message || '获取评价失败')
      }
    } catch (error) {
      message.error('获取评价列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [id])

  // 返回商品详情页
  const handleBack = () => {
    navigate(`/goods-detail/${id}`)
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取评分标签颜色
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 3.5) return 'processing'
    if (rating >= 2.5) return 'warning'
    return 'error'
  }

  // 计算平均评分
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <SystemLayoutNoBackground>
        <div className="reviews-container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载评价中...</div>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  return (
    <SystemLayoutNoBackground>
      <div className="reviews-container">
        {/* 页面头部 */}
        <div className="reviews-header">
          <div className="header-content">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="back-button"
            >
              返回商品详情
            </Button>
            <div className="header-title">
              <Title level={2} className="page-title">商品评价</Title>
              <Text className="page-subtitle">查看该商品的用户评价</Text>
            </div>
          </div>
        </div>

        {/* 评价统计 */}
        {reviews.length > 0 && (
          <Card className="reviews-stats-card">
            <div className="reviews-stats">
              <div className="stats-main">
                <div className="rating-large">{averageRating}</div>
                <Rate disabled value={parseFloat(averageRating)} allowHalf />
                <Text type="secondary" className="stats-count">
                  共 {reviews.length} 条评价
                </Text>
              </div>
              <Divider type="vertical" style={{ height: 80 }} />
              <div className="stats-breakdown">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Math.round(r.rating) === star).length
                  const percentage = reviews.length > 0 ? (count / reviews.length * 100).toFixed(0) : 0
                  return (
                    <div key={star} className="stats-item">
                      <Text>{star} 星</Text>
                      <div className="stats-bar">
                        <div 
                          className="stats-bar-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: star >= 4 ? '#52c41a' : star >= 3 ? '#faad14' : '#ff4d4f'
                          }}
                        />
                      </div>
                      <Text type="secondary">{count}</Text>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}

        {/* 评价列表 */}
        <Card className="reviews-list-card">
          {reviews.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无评价"
              style={{ padding: '60px 0' }}
            >
              <Text type="secondary">该商品暂时还没有用户评价</Text>
            </Empty>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item className="review-item">
                  <div className="review-content">
                    <div className="review-header">
                      <Space size="middle">
                        <Avatar 
                          size={48} 
                          icon={<UserOutlined />}
                          style={{ backgroundColor: '#1890ff' }}
                        />
                        <div className="reviewer-info">
                          <div className="reviewer-name">
                            {review.reviewerName || `用户${review.reviewerId}`}
                          </div>
                          <Space size="small" className="review-meta">
                            <Rate 
                              disabled 
                              value={review.rating} 
                              style={{ fontSize: 14 }}
                            />
                            <Tag color={getRatingColor(review.rating)}>
                              {review.rating.toFixed(1)} 分
                            </Tag>
                          </Space>
                        </div>
                      </Space>
                      <Space direction="vertical" align="end" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined /> {formatTime(review.createTime)}
                        </Text>
                        {review.orderId && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            订单号: {review.orderId}
                          </Text>
                        )}
                      </Space>
                    </div>
                    <div className="review-body">
                      <Paragraph className="review-comment">
                        {review.comment || '该用户没有填写评价内容'}
                      </Paragraph>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default Reviews
