import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Card, Empty, List, Rate, Spin, Tag, Typography, Avatar, Space, message, Tabs } from "antd"
import { UserOutlined, CalendarOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import useReview from "@/hooks/useReview"
import { useUser } from "@/contexts/UserContext"
import type { Review } from "@/services/useReviewService/type"
import './index.less'

const { Title, Text, Paragraph } = Typography

// 扩展 Review 类型以兼容显示字段
interface ReviewDisplay extends Review {
  reviewerName?: string
  revieweeName?: string
  comment?: string // 兼容旧字段名
}

type FeedbackTabType = 'my' | 'received'

const Feedback: FC = () => {
  const { user } = useUser()
  const currentUserId = user?.userId

  // 使用 useReview hook
  const {
    reviews,
    myReviews,
    loading,
    error,
    fetchMyReviews,
    fetchReviewsByUserId
  } = useReview()

  // 状态管理
  const [activeTab, setActiveTab] = useState<FeedbackTabType>('my')

  // 当前显示的评价列表
  const displayReviews: ReviewDisplay[] = activeTab === 'my' ? myReviews : reviews

  // 获取我的评价列表
  useEffect(() => {
    if (activeTab === 'my' && currentUserId) {
      fetchMyReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUserId])

  // 获取收到的评价列表
  useEffect(() => {
    if (activeTab === 'received' && currentUserId) {
      fetchReviewsByUserId(currentUserId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUserId])

  // 显示错误提示
  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  useEffect(() => {
    console.log(currentUserId)
  }, [currentUserId])

  // 处理 Tab 切换
  const handleTabChange = (key: string) => {
    setActiveTab(key as FeedbackTabType)
  }

  // 格式化时间
  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
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

  // 获取当前加载状态
  const currentLoading = activeTab === 'my'
    ? loading.fetchMyReviews
    : loading.fetchReviewsByUserId

  // 如果用户未登录，显示提示
  if (!currentUserId) {
    return (
      <SystemLayoutNoBackground>
        <div className="feedback-container">
          <div className="feedback-header">
            <div className="header-content">
              <div className="header-title">
                <Title level={2} className="page-title">评价反馈</Title>
                <Text className="page-subtitle">查看我的评价和收到的评价</Text>
              </div>
            </div>
          </div>
          <Card className="feedback-list-card">
            <Empty
              description="请先登录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            >
              <Text type="secondary">请先登录以查看评价反馈</Text>
            </Empty>
          </Card>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  // 初始加载时显示全屏loading
  if (currentLoading && displayReviews.length === 0) {
    return (
      <SystemLayoutNoBackground>
        <div className="feedback-container">
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
      <div className="feedback-container">
        {/* 页面头部 */}
        <div className="feedback-header">
          <div className="header-content">
            <div className="header-title">
              <Title level={2} className="page-title">评价反馈</Title>
              <Text className="page-subtitle">查看我的评价和收到的评价</Text>
            </div>
          </div>
        </div>

        {/* Tabs 切换 */}
        <Card className="feedback-tabs-card">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={[
              {
                key: 'my',
                label: '我发布的评价'
              },
              {
                key: 'received',
                label: '收到的评价'
              }
            ]}
          />
        </Card>

        {/* 评价列表 */}
        <Card className="feedback-list-card">
          <Spin spinning={currentLoading}>
            {displayReviews.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无评价"
                style={{ padding: '60px 0' }}
              >
                <Text type="secondary">
                  {activeTab === 'my'
                    ? '您还没有发布过评价'
                    : '您还没有收到评价'}
                </Text>
              </Empty>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={displayReviews}
                renderItem={(review) => {
                  const reviewDisplay = review as ReviewDisplay
                  return (
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
                                {activeTab === 'my'
                                  ? (reviewDisplay.revieweeName || `用户${review.revieweeId}`)
                                  : (reviewDisplay.reviewerName || `用户${review.reviewerId}`)}
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
                            {review.createTime && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined /> {formatTime(review.createTime)}
                              </Text>
                            )}
                            {review.orderId && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                订单号: {review.orderId}
                              </Text>
                            )}
                            {review.productId && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                商品ID: {review.productId}
                              </Text>
                            )}
                          </Space>
                        </div>
                        <div className="review-body">
                          <Paragraph className="review-comment">
                            {(reviewDisplay.comment || review.content) || '该用户没有填写评价内容'}
                          </Paragraph>
                        </div>
                      </div>
                    </List.Item>
                  )
                }}
              />
            )}
          </Spin>
        </Card>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default Feedback
