import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground"
import ConversationItem from "@/components/ConversationItem"
import MessageList from "@/components/MessageList"
import MessageInput from "@/components/MessageInput"
import { Card, Empty, Typography, Divider, message as antMessage, Spin } from "antd"
import { useState, useEffect, useMemo } from "react"
import type { FC } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import type { Message } from "@/components/MessageList"
import useConnection from "@/hooks/useConnection"
import { useUser } from "@/contexts/UserContext"
import type { ChatMessage } from "@/services/useConnectionService/type"
import './index.less'

const { Title } = Typography

// 会话数据接口
interface Conversation {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  sessionId: string
  targetUserId: number
  productId?: number
}

/**
 * 格式化时间显示（相对时间）
 */
const formatRelativeTime = (timeString: string): string => {
  const now = new Date()
  const time = new Date(timeString)
  const diff = now.getTime() - time.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return time.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}

/**
 * 格式化消息时间戳
 */
const formatMessageTime = (timeString: string): string => {
  const time = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    // 今天，只显示时间
    return time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (days === 1) {
    // 昨天
    return `昨天 ${time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  } else if (days < 7) {
    // 本周
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${weekdays[time.getDay()]} ${time.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  } else {
    // 更早
    return time.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

/**
 * 将 ChatMessage[] 转换为 Conversation[]
 */
const convertChatMessagesToConversations = (
  messages: ChatMessage[],
  currentUserId: number,
  urlProductId?: number
): Conversation[] => {
  // 按 sessionId 分组
  const sessionMap = new Map<string, ChatMessage[]>()

  messages.forEach((msg) => {
    if (!sessionMap.has(msg.sessionId)) {
      sessionMap.set(msg.sessionId, [])
    }
    sessionMap.get(msg.sessionId)!.push(msg)
  })

  // 转换为 Conversation 数组
  const conversations: Conversation[] = []

  sessionMap.forEach((msgs, sessionId) => {
    // 获取最新消息
    const latestMessage = msgs[msgs.length - 1]

    // 确定对方用户ID
    const targetUserId =
      latestMessage.senderId === currentUserId
        ? latestMessage.receiverId
        : latestMessage.senderId

    // 计算未读消息数（接收者是当前用户且未读的消息）
    const unreadCount = msgs.filter(
      (msg) => msg.receiverId === currentUserId && !msg.isRead
    ).length

    // 从消息中提取productId，如果消息中没有则使用URL中的productId
    const productId = latestMessage.productId || msgs.find(msg => msg.productId)?.productId || urlProductId

    conversations.push({
      id: sessionId,
      sessionId: sessionId,
      userId: `user${targetUserId}`,
      userName: `用户${targetUserId}`, // 这里可以后续从用户信息中获取
      lastMessage: latestMessage.content,
      lastMessageTime: formatRelativeTime(latestMessage.sendTime),
      unreadCount,
      targetUserId,
      productId
    })
  })

  // 按最新消息时间排序
  return conversations.sort((a, b) => {
    const aMsg = sessionMap.get(a.sessionId)![sessionMap.get(a.sessionId)!.length - 1]
    const bMsg = sessionMap.get(b.sessionId)![sessionMap.get(b.sessionId)!.length - 1]
    return new Date(bMsg.sendTime).getTime() - new Date(aMsg.sendTime).getTime()
  })
}

/**
 * 将 ChatMessage[] 转换为 Message[]
 */
const convertChatMessagesToMessages = (
  messages: ChatMessage[],
  currentUserId: number
): Message[] => {
  return messages.map((msg) => ({
    id: msg.id.toString(),
    senderId: msg.senderId.toString(),
    senderName: msg.senderId === currentUserId ? '我' : `用户${msg.senderId}`,
    content: msg.content,
    timestamp: formatMessageTime(msg.sendTime),
    isOwn: msg.senderId === currentUserId
  }))
}

const Connection: FC = () => {
  const { user } = useUser()
  const { sellerId } = useParams<{ sellerId: string }>()
  const [searchParams] = useSearchParams()
  const currentUserId = user?.userId

  // 从URL获取productId
  const urlProductId = searchParams.get('productId')
  const productIdFromUrl = urlProductId ? Number(urlProductId) : undefined

  // 使用 useConnection hook
  const {
    chatHistory,
    sessionList,
    loading,
    error,
    fetchChatHistory,
    fetchSessionList,
    fetchUnreadCount,
    markMessageAsRead,
    sendMessage
  } = useConnection()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  // 临时会话状态：当从商品详情页跳转过来但没有会话时使用
  const [tempTargetUserId, setTempTargetUserId] = useState<number | null>(null)

  // 加载会话列表
  useEffect(() => {
    if (currentUserId) {
      fetchSessionList(currentUserId)
      fetchUnreadCount(currentUserId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  // 转换会话列表数据
  const conversations = useMemo(() => {
    if (!currentUserId || sessionList.length === 0) {
      return []
    }
    return convertChatMessagesToConversations(sessionList, currentUserId, productIdFromUrl)
  }, [sessionList, currentUserId, productIdFromUrl])

  // 当选择会话时，加载聊天历史
  useEffect(() => {
    if (selectedConversationId && currentUserId) {
      // 使用最新的 conversations，但不作为依赖项，避免会话列表更新时重复获取
      const conversation = conversations.find((c) => c.id === selectedConversationId)
      if (conversation) {
        fetchChatHistory(currentUserId, conversation.targetUserId)
        // 标记消息为已读
        markMessageAsRead(selectedConversationId, currentUserId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, currentUserId])

  // 当有临时目标用户时，加载聊天历史（用于新会话）
  useEffect(() => {
    if (tempTargetUserId && currentUserId && !selectedConversationId) {
      fetchChatHistory(currentUserId, tempTargetUserId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempTargetUserId, currentUserId, selectedConversationId])

  // 当传入 sellerId 时，自动选中或创建与该卖家的会话
  useEffect(() => {
    if (sellerId && currentUserId) {
      const targetUserId = Number(sellerId)

      // 等待会话列表加载完成
      if (loading.sessionList) {
        return
      }

      // 查找是否已有与该卖家的会话
      const existingConversation = conversations.find(
        (conv) => conv.targetUserId === targetUserId
      )

      if (existingConversation) {
        // 如果已存在会话，自动选中并清除临时状态
        setSelectedConversationId(existingConversation.id)
        setTempTargetUserId(null)
      } else if (conversations.length > 0 || !loading.sessionList) {
        // 如果不存在会话，设置临时目标用户，显示聊天窗口
        setTempTargetUserId(targetUserId)
        setSelectedConversationId(null)
        antMessage.info(`正在联系卖家，可以直接发送消息开始对话`)
      }
    }
  }, [sellerId, currentUserId, conversations, loading.sessionList])

  // 当会话列表更新后，检查是否有新创建的会话需要选中
  useEffect(() => {
    if (tempTargetUserId && currentUserId && conversations.length > 0) {
      const newConversation = conversations.find(
        (conv) => conv.targetUserId === tempTargetUserId
      )
      if (newConversation) {
        // 找到新创建的会话，自动选中
        setSelectedConversationId(newConversation.id)
        setTempTargetUserId(null)
      }
    }
  }, [conversations, tempTargetUserId, currentUserId])


  // 转换当前会话的消息数据
  const currentMessages = useMemo(() => {
    console.log('currentMessages useMemo triggered:', {
      selectedConversationId,
      tempTargetUserId,
      currentUserId,
      chatHistoryLength: chatHistory.length,
      chatHistory
    })

    // 需要有选中的会话或临时目标用户
    if ((!selectedConversationId && !tempTargetUserId) || !currentUserId) {
      console.log('Missing selectedConversationId/tempTargetUserId or currentUserId')
      return []
    }

    if (chatHistory.length === 0) {
      console.log('chatHistory is empty')
      return []
    }

    const converted = convertChatMessagesToMessages(chatHistory, currentUserId)
    console.log('Converted messages:', converted)
    return converted
  }, [chatHistory, selectedConversationId, tempTargetUserId, currentUserId])

  // 显示错误提示
  useEffect(() => {
    if (error) {
      antMessage.error(error)
    }
  }, [error])

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleSendMessage = async (message: string) => {
    if (!currentUserId || !message.trim()) {
      return
    }

    let targetUserId: number
    let productId: number | undefined

    // 如果有选中的会话，使用会话信息
    if (selectedConversationId) {
      const conversation = conversations.find(
        (conv) => conv.id === selectedConversationId
      )

      if (!conversation) {
        antMessage.error('未找到会话信息')
        return
      }

      targetUserId = conversation.targetUserId
      productId = conversation.productId || productIdFromUrl
    }
    // 如果有临时目标用户（新会话），使用临时信息
    else if (tempTargetUserId) {
      targetUserId = tempTargetUserId
      productId = productIdFromUrl
    }
    else {
      antMessage.error('请先选择一个会话')
      return
    }

    if (!productId) {
      antMessage.error('商品ID缺失，无法发送消息')
      return
    }

    try {
      await sendMessage(
        currentUserId,
        targetUserId,
        message.trim(),
        productId,
        targetUserId // 传递目标用户ID，用于发送成功后刷新聊天历史
      )
      // 发送成功后，聊天历史会自动刷新（由 hook 处理）
      // 如果是临时会话，会话列表刷新后会自动选中新创建的会话
      antMessage.success('消息发送成功')
    } catch (err) {
      // 错误已经在 hook 中处理并设置到 error 状态
      // 这里可以显示额外的错误提示
      console.error('发送消息失败:', err)
    }
  }

  // 获取当前选中的会话或临时会话
  const selectedConversation = useMemo(() => {
    if (selectedConversationId) {
      return conversations.find((conv) => conv.id === selectedConversationId)
    } else if (tempTargetUserId) {
      // 创建临时会话对象用于显示
      return {
        id: `temp-${tempTargetUserId}`,
        sessionId: `temp-${tempTargetUserId}`,
        userId: `user${tempTargetUserId}`,
        userName: `用户${tempTargetUserId}`,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        targetUserId: tempTargetUserId,
        productId: productIdFromUrl
      } as Conversation
    }
    return undefined
  }, [selectedConversationId, tempTargetUserId, conversations, productIdFromUrl])

  // 如果用户未登录，显示提示
  if (!currentUserId) {
    return (
      <SystemLayoutNoBackground>
        <div className="connection-container">
          <div className="connection-content">
            <Card className="conversation-list-card" title="会话列表" bordered={false}>
              <Empty description="请先登录" />
            </Card>
            <Card className="chat-window-card" bordered={false}>
              <div className="chat-window-empty">
                <Empty
                  description="请先登录以使用聊天功能"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            </Card>
          </div>
        </div>
      </SystemLayoutNoBackground>
    )
  }

  return (
    <SystemLayoutNoBackground>
      <div className="connection-container">
        <div className="connection-content">
          {/* 左侧会话列表 */}
          <Card className="conversation-list-card" title="会话列表" bordered={false}>
            <Spin spinning={loading.sessionList}>
              <div className="conversation-list">
                {conversations.length === 0 ? (
                  <Empty description="暂无会话" />
                ) : (
                  conversations.map((conversation) => (
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
            </Spin>
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
                  <Divider style={{ margin: '12px 0', border: 'none' }} />
                </div>
                <div className="chat-window-body">
                  <Spin spinning={loading.chatHistory} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <MessageList
                      messages={currentMessages}
                      currentUserId={currentUserId?.toString() || ''}
                    />
                  </Spin>
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
