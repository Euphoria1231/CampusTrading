import { PlusOutlined, SearchOutlined, GlobalOutlined, AudioOutlined, SendOutlined } from '@ant-design/icons'
import { useState, useRef, useEffect } from 'react'
import type { FC } from 'react'
import './index.less'

export interface MessageInputProps {
  onSend?: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

const MessageInput: FC<MessageInputProps> = ({
  onSend,
  placeholder = '输入消息...',
  disabled = false
}) => {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim())
      setMessage('')
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="message-input-container">
      <div className={`message-input-wrapper ${isFocused ? 'focused' : ''}`}>
        {/* 左侧图标区域 */}
        <div className="message-input-left-icons">
          <button className="input-icon-btn" type="button" title="添加">
            <PlusOutlined />
          </button>
        </div>

        {/* 输入框 */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="message-input-textarea"
          rows={1}
        />

       
      </div>
    </div>
  )
}

export default MessageInput

