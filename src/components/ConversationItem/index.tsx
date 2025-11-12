import { Avatar, Badge, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { FC } from 'react'
import './index.less'

const { Text } = Typography

export interface ConversationItemProps {
  id: string
  avatar?: string
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
  isActive?: boolean
  onClick?: () => void
}

const ConversationItem: FC<ConversationItemProps> = ({
  avatar,
  name,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  isActive = false,
  onClick
}) => {
  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <Badge count={unreadCount > 0 ? unreadCount : 0} offset={[-5, 5]}>
        <Avatar
          size={48}
          icon={<UserOutlined />}
          src={avatar}
          className="conversation-item-avatar"
        />
      </Badge>
      <div className="conversation-item-content">
        <div className="conversation-item-header">
          <Text className="conversation-item-name" strong>
            {name}
          </Text>
          <Text className="conversation-item-time" type="secondary">
            {lastMessageTime}
          </Text>
        </div>
        <Text className="conversation-item-message" ellipsis>
          {lastMessage}
        </Text>
      </div>
    </div>
  )
}

export default ConversationItem

