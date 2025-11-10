import { Avatar, List, Typography, Empty } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { FC } from 'react'
import './index.less'

const { Text } = Typography

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isOwn: boolean
}

export interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

const MessageList: FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <Empty description="暂无消息，开始聊天吧" />
      </div>
    )
  }

  return (
    <div className="message-list-container">
      <List
        dataSource={messages}
        renderItem={(message) => (
          <List.Item className={`message-item ${message.isOwn ? 'own' : 'other'}`}>
            <div className="message-bubble">
              {!message.isOwn && (
                <div className='message-bubble-client'>
                  <Avatar
                    size={36}
                    icon={<UserOutlined />}
                    src={message.senderAvatar}
                    className="message-avatar"
                  />
                  <Text className="message-sender-name" type="secondary">
                    {message.senderName}
                  </Text>
                </div>
              )}
              <div className="message-content-wrapper">
                <div className={`message-bubble-content ${message.isOwn ? 'own' : 'other'}`}>
                  <Text className="message-text">{message.content}</Text>
                  <Text className="message-time" type="secondary">
                    {message.timestamp}
                  </Text>
                </div>
              </div>
              {message.isOwn && (
                <div className="message-bubble-client">
                  <Avatar
                    size={36}
                    icon={<UserOutlined />}
                    src={message.senderAvatar}
                    className="message-avatar"
                  />
                  <Text className="message-sender-name" type="secondary">
                    {message.senderName}
                  </Text>
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}

export default MessageList

