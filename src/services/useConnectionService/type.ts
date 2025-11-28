import type { IResponse } from "../request";

/**
 * 聊天消息实体类型
 */
export interface ChatMessage {
  id: number;
  productId?: number;
  senderId: number;
  receiverId: number;
  content: string;
  messageType?: string; // TEXT, IMAGE, SYSTEM
  isRead?: boolean;
  sendTime: string; // LocalDateTime 序列化为字符串
  sessionId: string;
}

/**
 * 获取聊天历史请求参数
 */
export interface GetChatHistoryReq {
  userId1: number;
  userId2: number;
}

/**
 * 获取聊天历史响应
 */
export type GetChatHistoryRes = IResponse<ChatMessage[]>;

/**
 * 获取会话列表请求参数
 */
export interface GetSessionListReq {
  userId: number;
}

/**
 * 获取会话列表响应
 */
export type GetSessionListRes = IResponse<ChatMessage[]>;

/**
 * 获取未读消息数请求参数
 */
export interface GetUnreadCountReq {
  userId: number;
}

/**
 * 获取未读消息数响应
 */
export type GetUnreadCountRes = IResponse<number>;

/**
 * 获取与特定用户的未读消息数请求参数
 */
export interface GetUnreadCountWithUserReq {
  currentUserId: number;
  targetUserId: number;
}

/**
 * 获取与特定用户的未读消息数响应
 */
export type GetUnreadCountWithUserRes = IResponse<number>;

/**
 * 标记消息为已读请求参数
 */
export interface MarkAsReadReq {
  sessionId: string;
  userId: number;
}

/**
 * 标记消息为已读响应
 */
export type MarkAsReadRes = IResponse<string>;

/**
 * 发送消息请求参数
 */
export interface SendMessageReq {
  fromUserId: number;
  toUserId: number;
  content: string;
  productId?: number;
}

/**
 * 发送消息响应
 */
export type SendMessageRes = IResponse<ChatMessage>;

