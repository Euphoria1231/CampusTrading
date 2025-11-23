import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import ConversationItem from "@/components/ConversationItem"
import MessageList from "@/components/MessageList"
import MessageInput from "@/components/MessageInput"
import { Card, Empty, Typography, Divider, message as antMessage } from "antd"
import { useState, useEffect } from "react"
import type { FC } from "react"
import { useParams } from "react-router-dom"
import type { Message } from "@/components/MessageList"
import './index.less'

const { Title } = Typography

// 模拟会话数据
interface Conversation {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

// 模拟当前用户ID
const CURRENT_USER_ID = 'user1'

// 模拟会话列表数据
const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    userId: 'user2',
    userName: '张三',
    lastMessage: '你好，这个商品还有吗？',
    lastMessageTime: '10:30',
    unreadCount: 2
  },
  {
    id: 'conv2',
    userId: 'user3',
    userName: '李四',
    lastMessage: '好的，我明天去取货',
    lastMessageTime: '昨天',
    unreadCount: 0
  },
  {
    id: 'conv3',
    userId: 'user4',
    userName: '王五',
    lastMessage: '价格可以再优惠一点吗？',
    lastMessageTime: '周一',
    unreadCount: 5
  },
  {
    id: 'conv4',
    userId: 'user5',
    userName: '赵六',
    lastMessage: '谢谢，商品收到了',
    lastMessageTime: '上周',
    unreadCount: 0
  }
]

// 模拟消息数据（根据会话ID）
const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: 'msg1',
      senderId: 'user2',
      senderName: '张三',
      content: '你好，这个商品还有吗？',
      timestamp: '10:30',
      isOwn: false
    },
    {
      id: 'msg2',
      senderId: CURRENT_USER_ID,
      senderName: '我',
      content: '有的，还有库存',
      timestamp: '10:32',
      isOwn: true
    },
    {
      id: 'msg3',
      senderId: 'user2',
      senderName: '张三',
      content: '好的，那我明天过去看看',
      timestamp: '10:33',
      isOwn: false
    }
  ],
  conv2: [
    {
      id: 'msg4',
      senderId: 'user3',
      senderName: '李四',
      content: '好的，我明天去取货',
      timestamp: '昨天 15:20',
      isOwn: false
    },
    {
      id: 'msg5',
      senderId: CURRENT_USER_ID,
      senderName: '我',
      content: '好的，到时联系我',
      timestamp: '昨天 15:25',
      isOwn: true
    }
  ],
  conv3: [
    {
      id: 'msg6',
      senderId: 'user4',
      senderName: '王五',
      content: '价格可以再优惠一点吗？',
      timestamp: '周一 14:10',
      isOwn: false
    },
    {
      id: 'msg7',
      senderId: CURRENT_USER_ID,
      senderName: '我',
      content: '已经是最低价了',
      timestamp: '周一 14:15',
      isOwn: true
    },
    {
      id: 'msg8',
      senderId: 'user4',
      senderName: '王五',
      content: '那好吧，我再考虑一下',
      timestamp: '周一 14:20',
      isOwn: false
    }
  ],
  conv4: [
    {
      id: 'msg9',
      senderId: 'user5',
      senderName: '赵六',
      content: '谢谢，商品收到了',
      timestamp: '上周 16:00',
      isOwn: false
    },
    {
      id: 'msg10',
      senderId: CURRENT_USER_ID,
      senderName: '我',
      content: '不客气，满意的话给个好评哦',
      timestamp: '上周 16:05',
      isOwn: true
    }
  ]
}

const Connection: FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const { sellerId } = useParams<{ sellerId: string }>()

  // 当传入 sellerId 时，自动选中或创建与该卖家的会话
  useEffect(() => {
    if (sellerId) {
      // 查找是否已有与该卖家的会话
      const existingConversation = mockConversations.find(
        conv => conv.userId === `user${sellerId}`
      )
      
      if (existingConversation) {
        // 如果已存在会话，自动选中
        setSelectedConversationId(existingConversation.id)
      } else {
        // 如果不存在，可以创建新会话或提示用户
        antMessage.info(`正在联系卖家 ID: ${sellerId}`)
        // 这里可以扩展：调用后端API创建新会话
        // 目前使用模拟数据，直接选中第一个会话作为示例
        if (mockConversations.length > 0) {
          setSelectedConversationId(mockConversations[0].id)
        }
      }
    }
  }, [sellerId])

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleSendMessage = (message: string) => {
    // 静态页面，这里只是打印，后续用户自己实现逻辑
    console.log('发送消息:', message, '到会话:', selectedConversationId)
  }

  const selectedConversation = mockConversations.find(
    conv => conv.id === selectedConversationId
  )
  const currentMessages = selectedConversationId ? mockMessages[selectedConversationId] || [] : []

  return (
    <SystemLayoutNoBackground>
      <div className="connection-container">
        <div className="connection-content">
          {/* 左侧会话列表 */}
          <Card className="conversation-list-card" title="会话列表" bordered={false}>
            <div className="conversation-list">
              {mockConversations.length === 0 ? (
                <Empty description="暂无会话" />
              ) : (
                mockConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    id={conversation.id}
                    name={conversation.userName}
                    avatar={conversation.userAvatar}
                    lastMessage={conversation.lastMessage}
                    lastMessageTime={conversation.lastMessageTime}
                    unreadCount={conversation.unreadCount}
                    isActive={selectedConversationId === conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                  />
                ))
              )}
            </div>
          </Card>

          {/* 右侧聊天窗口 */}
          <Card className="chat-window-card" bordered={false}>
            {selectedConversation ? (
              <>
                <div className="chat-window-header">
                  <div className="chat-window-user-info">
                    <Title level={4} className="chat-window-user-name">
                      {selectedConversation.userName}
                    </Title>
                  </div>
                  <Divider style={{ margin: '12px 0', border: 'none'}} />
                </div>
                <div className="chat-window-body">
                  <MessageList
                    messages={currentMessages}
                    currentUserId={CURRENT_USER_ID}
                  />
                </div>
                <div className="chat-window-footer">
                  <MessageInput
                    onSend={handleSendMessage}
                    placeholder={`发送消息给 ${selectedConversation.userName}...`}
                  />
                </div>
              </>
            ) : (
              <div className="chat-window-empty">
                <Empty
                  description="选择一个会话开始聊天"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </SystemLayoutNoBackground>
  )
}

export default Connection
