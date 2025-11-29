import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Empty, List, Rate, Spin, Tag, Typography, Avatar, Divider, Space, message, Modal, Form, Input, Checkbox } from "antd"
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, EditOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import useReview from "@/hooks/useReview"
import { useUser } from "@/contexts/UserContext"
import type { Review, SaveReviewReq } from "@/services/useReviewService/type"
import './index.less'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 扩展 Review 类型以兼容显示字段
interface ReviewDisplay extends Review {
  reviewerName?: string
  revieweeName?: string
  comment?: string // 兼容旧字段名
}

const Reviews: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useUser()

  // 使用 useReview hook
  const {
    reviews,
    loading,
    error,
    fetchReviewsByProductId,
    saveReview
  } = useReview()

  // 状态管理
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewForm] = Form.useForm()

  // 获取商品评价列表
  useEffect(() => {
    if (id) {
      fetchReviewsByProductId(Number(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 显示错误提示
  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  // 处理 URL 参数（可能从订单页面跳转过来）
  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const productIdFromUrl = searchParams.get('productId')
    const revieweeIdFromUrl = searchParams.get('revieweeId')

    if (orderId) {
      setIsReviewModalOpen(true)
      const formValues: {
        orderId: number
        productId?: number
        revieweeId?: number
      } = { orderId: Number(orderId) }

      // 如果有商品ID参数，自动填充
      if (productIdFromUrl) {
        formValues.productId = Number(productIdFromUrl)
      } else if (id) {
        // 如果没有 productId 参数但有 id 参数（从路由），也填充
        formValues.productId = Number(id)
      }

      // 如果有被评价者ID参数，自动填充
      if (revieweeIdFromUrl) {
        formValues.revieweeId = Number(revieweeIdFromUrl)
      }

      reviewForm.setFieldsValue(formValues)
    }
  }, [searchParams, reviewForm, id])

  // 返回商品详情页
  const handleBack = () => {
    if (id) {
      navigate(`/goods-detail/${id}`)
    } else {
      navigate('/goods-browse')
    }
  }

  // 处理发布评价
  const handleSubmitReview = async (values: {
    orderId: number
    productId?: number
    revieweeId: number
    rating: number
    content: string
    anonymity?: boolean
  }) => {
    if (!user?.userId) {
      message.error('请先登录')
      return
    }

    // 注意：根据后端实现，revieweeId 和 productId 需要从订单信息中获取
    // 这里先使用表单值，实际应该查询订单信息
    const reviewData: SaveReviewReq = {
      orderId: values.orderId,
      reviewerId: user.userId,
      revieweeId: values.revieweeId || 0, // 需要从订单获取
      productId: values.productId || (id ? Number(id) : 0), // 优先使用表单值，否则使用URL参数
      rating: values.rating,
      content: values.content,
      anonymity: values.anonymity || false
    }

    try {
      await saveReview(reviewData)
      message.success('评价发布成功')
      setIsReviewModalOpen(false)
      reviewForm.resetFields()

      // 刷新商品评价列表
      if (id) {
        fetchReviewsByProductId(Number(id))
      }
    } catch {
      // 错误已在 hook 中处理
    }
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

  // 初始加载时显示全屏loading（仅在首次加载且没有数据时）
  if (loading.fetchReviewsByProductId && reviews.length === 0) {
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
              {id ? '返回商品详情' : '返回'}
            </Button>
            <div className="header-title">
              <Title level={2} className="page-title">商品评价</Title>
              <Text className="page-subtitle">查看该商品的用户评价</Text>
            </div>
            {user && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsReviewModalOpen(true)}
                className="publish-review-button"
              >
                发布评价
              </Button>
            )}
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
          <Spin spinning={loading.fetchReviewsByProductId}>
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
                                {reviewDisplay.reviewerName || `用户${review.reviewerId}`}
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

        {/* 发布评价 Modal */}
        <Modal
          title="发布评价"
          open={isReviewModalOpen}
          onCancel={() => {
            setIsReviewModalOpen(false)
            reviewForm.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={reviewForm}
            layout="vertical"
            onFinish={handleSubmitReview}
          >
            <Form.Item
              name="orderId"
              label="订单ID"
              rules={[{ required: true, message: '请输入订单ID' }]}
            >
              <Input
                type="number"
                placeholder="请输入订单ID"
                disabled={!!searchParams.get('orderId')}
              />
            </Form.Item>

            {!id && (
              <Form.Item
                name="productId"
                label="商品ID"
                rules={[{ required: true, message: '请输入商品ID' }]}
              >
                <Input
                  type="number"
                  placeholder="请输入商品ID"
                />
              </Form.Item>
            )}

            <Form.Item
              name="revieweeId"
              label={searchParams.get('revieweeId') ? undefined : "被评价者ID"}
              rules={[{ required: true, message: '请输入被评价者ID' }]}
              hidden={!!searchParams.get('revieweeId')}
            >
              <Input
                type="number"
                placeholder="请输入被评价者ID（卖家或买家）"
              />
            </Form.Item>

            <Form.Item
              name="rating"
              label="评分"
              rules={[{ required: true, message: '请选择评分' }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item
              name="content"
              label="评价内容"
              rules={[
                { required: true, message: '请输入评价内容' },
                { max: 500, message: '评价内容不能超过500字' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="请输入您的评价内容..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              name="anonymity"
              valuePropName="checked"
            >
              <Checkbox>匿名评价</Checkbox>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading.saveReview}
                >
                  发布评价
                </Button>
                <Button
                  onClick={() => {
                    setIsReviewModalOpen(false)
                    reviewForm.resetFields()
                  }}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default Reviews
