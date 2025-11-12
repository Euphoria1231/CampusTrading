import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, message, Space, Popconfirm, Tag, Image, Row, Col, Empty, Input, Select, Tabs, Divider, Skeleton } from "antd"
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { http } from "@/utils/request"
import './index.less'

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

const { Search } = Input
const { Option } = Select

const GoodsBrowse: FC = () => {
  const [goodsList, setGoodsList] = useState<Goods[]>([])
  const [filteredGoodsList, setFilteredGoodsList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('createTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const navigate = useNavigate()

  // 商品分类选项
  const categories = [
    { value: 'all', label: '全部商品' },
    { value: '电子产品', label: '电子产品' },
    { value: '服装鞋帽', label: '服装鞋帽' },
    { value: '图书文具', label: '图书文具' },
    { value: '生活用品', label: '生活用品' },
    { value: '体育用品', label: '体育用品' },
    { value: '其他', label: '其他' }
  ]

  // 排序选项
  const sortOptions = [
    { value: 'createTime', label: '创建时间' },
    { value: 'price', label: '价格' },
    { value: 'name', label: '商品名称' }
  ]

  // 获取商品列表
  const fetchGoodsList = async () => {
    setLoading(true)
    try {
      const result = await http.get<{ code: number; message: string; data: Goods[] }>('/goods/list')
      if (result.code === 200) {
        setGoodsList(result.data)
        setFilteredGoodsList(result.data)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 搜索和筛选商品
  const filterAndSortGoods = () => {
    let filtered = [...goodsList]

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(goods => goods.category === selectedCategory)
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(goods => 
        goods.name.toLowerCase().includes(keyword) ||
        goods.description.toLowerCase().includes(keyword)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'createTime':
        default:
          aValue = new Date(a.createTime || '').getTime()
          bValue = new Date(b.createTime || '').getTime()
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredGoodsList(filtered)
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  // 处理分类选择
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // 处理排序
  const handleSortChange = (sort: string) => {
    setSortBy(sort)
  }

  // 处理排序顺序
  const handleSortOrderChange = (order: 'asc' | 'desc') => {
    setSortOrder(order)
  }

  // 删除商品
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录后再删除商品')
      navigate('/user')
      return
    }
    
    try {
      const result = await http.delete<{ code: number; message: string }>(`/goods/${id}`)
      if (result.code === 200) {
        message.success('商品删除成功')
        fetchGoodsList()
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 跳转到创建商品页面（需要登录）
  const handleCreateGoods = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录后再创建商品')
      navigate('/user')
      return
    }
    navigate('/goods-create')
  }

  // 跳转到编辑页面（需要登录）
  const handleEdit = (record: Goods) => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录后再编辑商品')
      navigate('/user')
      return
    }
    navigate(`/goods-edit/${record.id}`)
  }

  // 查看商品详情
  const handleView = (record: Goods) => {
    navigate(`/goods-detail/${record.id}`)
  }

  useEffect(() => {
    fetchGoodsList()
  }, [])

  // 当筛选条件改变时，重新筛选和排序
  useEffect(() => {
    filterAndSortGoods()
  }, [searchKeyword, selectedCategory, sortBy, sortOrder, goodsList])

  // 渲染骨架屏
  const renderSkeletonCard = () => (
    <Col xs={24} sm={12} md={8} lg={6} xl={4}>
      <Card className="goods-card">
        <Skeleton.Image 
          active 
          style={{ width: '100%', height: '220px' }}
        />
        <div style={{ padding: '20px' }}>
          <Skeleton.Input active size="small" style={{ width: '80%', marginBottom: '12px' }} />
          <Skeleton.Input active size="small" style={{ width: '60%', marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton.Button active size="small" />
            <Skeleton.Button active size="small" />
          </div>
        </div>
        <div style={{ padding: '16px 20px', background: '#fafbfc' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton.Button active size="small" />
            <Skeleton.Button active size="small" />
            <Skeleton.Button active size="small" />
          </div>
        </div>
      </Card>
    </Col>
  )

  // 渲染商品卡片
  const renderGoodsCard = (goods: Goods) => (
    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={goods.id}>
      <Card
        hoverable
        className="goods-card"
        cover={
          <div className="goods-image-container">
            {goods.imageUrl && !goods.imageUrl.startsWith('blob:') ? (
              <Image
                src={goods.imageUrl}
                alt={goods.name}
                className="goods-image"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSk6TpGpRE9BqJp0cKQ"
                preview={false}
                onError={() => {
                  console.warn(`图片加载失败: ${goods.imageUrl}`)
                }}
              />
            ) : (
              <div className="goods-image-placeholder">
                <div className="placeholder-icon">📷</div>
                <div className="placeholder-text">暂无图片</div>
              </div>
            )}
            <div className="goods-status-overlay">
              <Tag color={goods.status === 'ACTIVE' ? 'green' : 'red'} className="status-tag">
                {goods.status === 'ACTIVE' ? '上架' : '下架'}
              </Tag>
            </div>
          </div>
        }
        actions={[
          <Button
            key="view"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(goods)}
            className="card-action-btn"
          >
            查看
          </Button>,
          <Button
            key="edit"
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(goods)}
            className="card-action-btn"
          >
            编辑
          </Button>,
          <Popconfirm
            key="delete"
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(goods.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="card-action-btn"
            >
              删除
            </Button>
          </Popconfirm>
        ]}
      >
        <Card.Meta
          title={
            <div className="goods-title" title={goods.name}>
              {goods.name}
            </div>
          }
          description={
            <div className="goods-meta">
              <div className="goods-price">¥{goods.price}</div>
              <div className="goods-tags">
                <Tag color="blue" className="category-tag">{goods.category}</Tag>
                <Tag color="green" className="condition-tag">{goods.conditionStatus}</Tag>
              </div>
              <div className="goods-trade-info">
                {goods.tradeTime && (
                  <div className="trade-time">
                    <span className="trade-label">🕒</span>
                    <span className="trade-text">{goods.tradeTime}</span>
                  </div>
                )}
                {goods.tradeLocation && (
                  <div className="trade-location">
                    <span className="trade-label">📍</span>
                    <span className="trade-text">{goods.tradeLocation}</span>
                  </div>
                )}
                {goods.contactPhone && (
                  <div className="contact-phone">
                    <span className="trade-label">📞</span>
                    <span className="trade-text">{goods.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  )

  return (
    <SystemLayoutNoBackground>
      <div className="goods-browse-container">
        <div className="goods-browse-header">
          <h2>商品浏览</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateGoods}>
            添加商品
          </Button>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="goods-browse-filters">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索商品名称或描述"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="选择商品分类"
                size="large"
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                {categories.map(category => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space size="small">
                <Select
                  placeholder="排序方式"
                  size="large"
                  style={{ width: 120 }}
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  {sortOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="排序顺序"
                  size="large"
                  style={{ width: 100 }}
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                >
                  <Option value="desc">降序</Option>
                  <Option value="asc">升序</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* 商品展示区域 */}
        <div className="goods-browse-content">
          {loading ? (
            <>
              <div className="goods-count-info">
                <Skeleton.Input active size="small" style={{ width: '200px' }} />
              </div>
              <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index}>{renderSkeletonCard()}</div>
                ))}
              </Row>
            </>
          ) : filteredGoodsList.length === 0 ? (
            <Empty 
              description={searchKeyword || selectedCategory !== 'all' ? "没有找到符合条件的商品" : "暂无商品数据"} 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <div className="goods-count-info">
                共找到 {filteredGoodsList.length} 个商品
              </div>
              <Row gutter={[16, 16]}>
                {filteredGoodsList.map(renderGoodsCard)}
              </Row>
            </>
          )}
        </div>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default GoodsBrowse

