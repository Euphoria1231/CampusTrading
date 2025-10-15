import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import { Button, Card, Form, Input, InputNumber, Modal, Select, Table, message, Space, Popconfirm } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import type { FC } from "react"
import { useEffect, useState } from "react"
import './index.less'

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
  sellerId: number
  status: string
  createTime?: string
  updateTime?: string
}

const Goods: FC = () => {
  const [goodsList, setGoodsList] = useState<Goods[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGoods, setEditingGoods] = useState<Goods | null>(null)
  const [form] = Form.useForm()

  // 获取商品列表
  const fetchGoodsList = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8081/api/goods/list')
      const result = await response.json()
      if (result.code === 200) {
        setGoodsList(result.data)
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 创建或更新商品
  const handleSubmit = async (values: Goods) => {
    try {
      const url = editingGoods 
        ? `http://localhost:8081/api/goods/update`
        : `http://localhost:8081/api/goods/create`
      
      const response = await fetch(url, {
        method: editingGoods ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          id: editingGoods?.id,
          sellerId: 1 // 模拟卖家ID
        }),
      })
      
      const result = await response.json()
      if (result.code === 200) {
        message.success(editingGoods ? '商品更新成功' : '商品创建成功')
        setModalVisible(false)
        setEditingGoods(null)
        form.resetFields()
        fetchGoodsList()
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 删除商品
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/goods/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
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

  // 打开编辑模态框
  const handleEdit = (record: Goods) => {
    setEditingGoods(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  // 打开创建模态框
  const handleCreate = () => {
    setEditingGoods(null)
    form.resetFields()
    setModalVisible(true)
  }

  useEffect(() => {
    fetchGoodsList()
  }, [])

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '成色',
      dataIndex: 'conditionStatus',
      key: 'conditionStatus',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Goods) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <SystemLayoutNoBackground>
      <div className="goods-container">
        <div className="goods-header">
          <h1>商品管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建商品
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={goodsList}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>

        <Modal
          title={editingGoods ? '编辑商品' : '创建商品'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            setEditingGoods(null)
            form.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="商品名称"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input placeholder="请输入商品名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="商品描述"
              rules={[{ required: true, message: '请输入商品描述' }]}
            >
              <TextArea rows={4} placeholder="请输入商品描述" />
            </Form.Item>

            <Form.Item
              name="price"
              label="价格"
              rules={[{ required: true, message: '请输入价格' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入价格"
                min={0}
                precision={2}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                <Option value="电子产品">电子产品</Option>
                <Option value="服装鞋帽">服装鞋帽</Option>
                <Option value="图书文具">图书文具</Option>
                <Option value="生活用品">生活用品</Option>
                <Option value="体育用品">体育用品</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="conditionStatus"
              label="成色"
              rules={[{ required: true, message: '请选择成色' }]}
            >
              <Select placeholder="请选择成色">
                <Option value="全新">全新</Option>
                <Option value="九成新">九成新</Option>
                <Option value="八成新">八成新</Option>
                <Option value="七成新">七成新</Option>
                <Option value="六成新">六成新</Option>
                <Option value="五成新">五成新</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="图片URL"
            >
              <Input placeholder="请输入图片URL" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingGoods ? '更新' : '创建'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false)
                  setEditingGoods(null)
                  form.resetFields()
                }}>
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

export default Goods;