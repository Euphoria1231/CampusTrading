import { request } from "../request";
import type {
  GetChatHistoryRes,
  GetSessionListRes,
  GetUnreadCountRes,
  GetUnreadCountWithUserRes,
  MarkAsReadRes,
  SendMessageRes,
} from "./type";

const useConnectionService = () => {
  /**
   * 获取聊天历史
   */
  const getChatHistory = (
    userId1: number,
    userId2: number
  ): Promise<GetChatHistoryRes> => {
    return request("get", "/api/chat/history", undefined, {
      params: {
        userId1,
        userId2,
      },
    });
  };

  /**
   * 获取会话列表
   */
  const getSessionList = (userId: number): Promise<GetSessionListRes> => {
    return request("get", "/api/chat/sessions", undefined, {
      params: {
        userId,
      },
    });
  };

  /**
   * 获取未读消息数
   */
  const getUnreadCount = (userId: number): Promise<GetUnreadCountRes> => {
    return request("get", "/api/chat/unread", undefined, {
      params: {
        userId,
      },
    });
  };

  /**
   * 获取与特定用户的未读消息数
   */
  const getUnreadCountWithUser = (
    currentUserId: number,
    targetUserId: number
  ): Promise<GetUnreadCountWithUserRes> => {
    return request("get", "/api/chat/unread/with", undefined, {
      params: {
        currentUserId,
        targetUserId,
      },
    });
  };

  /**
   * 标记消息为已读
   */
  const markAsRead = (
    sessionId: string,
    userId: number
  ): Promise<MarkAsReadRes> => {
    return request("post", "/api/chat/read", undefined, {
      params: {
        sessionId,
        userId,
      },
    });
  };

  /**
   * 发送消息
   */
  const sendMessage = (
    fromUserId: number,
    toUserId: number,
    content: string,
    productId?: number
  ): Promise<SendMessageRes> => {
    const params: Record<string, string | number> = {
      fromUserId,
      toUserId,
      content,
    };
    if (productId !== undefined) {
      params.productId = productId;
    }
    return request("post", "/api/chat/send", undefined, {
      params,
    });
  };

  return {
    getChatHistory,
    getSessionList,
    getUnreadCount,
    getUnreadCountWithUser,
    markAsRead,
    sendMessage,
  };
};

export default useConnectionService;

