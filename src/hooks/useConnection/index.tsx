import { useState } from "react";
import useConnectionService from "../../services/useConnectionService";
import type { ChatMessage } from "../../services/useConnectionService/type";

interface UseConnectionReturn {
  // 数据状态
  chatHistory: ChatMessage[];
  sessionList: ChatMessage[];
  unreadCount: number;
  unreadCountWithUser: number;

  // 加载状态
  loading: {
    chatHistory: boolean;
    sessionList: boolean;
    unreadCount: boolean;
    unreadCountWithUser: boolean;
    markAsRead: boolean;
    sendMessage: boolean;
  };

  // 错误状态
  error: string | null;

  // 方法
  fetchChatHistory: (userId1: number, userId2: number) => Promise<void>;
  fetchSessionList: (userId: number) => Promise<void>;
  fetchUnreadCount: (userId: number) => Promise<void>;
  fetchUnreadCountWithUser: (
    currentUserId: number,
    targetUserId: number
  ) => Promise<void>;
  markMessageAsRead: (sessionId: string, userId: number) => Promise<void>;
  sendMessage: (
    fromUserId: number,
    toUserId: number,
    content: string,
    productId?: number,
    currentTargetUserId?: number
  ) => Promise<void>;
}

const useConnection = (): UseConnectionReturn => {
  const connectionService = useConnectionService();

  // 数据状态
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionList, setSessionList] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadCountWithUser, setUnreadCountWithUser] = useState<number>(0);

  // 加载状态
  const [loading, setLoading] = useState({
    chatHistory: false,
    sessionList: false,
    unreadCount: false,
    unreadCountWithUser: false,
    markAsRead: false,
    sendMessage: false,
  });

  // 错误状态
  const [error, setError] = useState<string | null>(null);

  // 提取错误消息的辅助函数
  const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    const error = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return error?.response?.data?.message || error?.message || defaultMessage;
  };

  /**
   * 获取聊天历史
   */
  const fetchChatHistory = async (userId1: number, userId2: number) => {
    setLoading((prev) => ({ ...prev, chatHistory: true }));
    setError(null);
    try {
      const response = await connectionService.getChatHistory(userId1, userId2);
      if (response.data) {
        setChatHistory(response.data);
      } else {
        setError(response.message || "获取聊天历史失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取聊天历史失败");
      setError(errorMessage);
      console.error("获取聊天历史失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, chatHistory: false }));
    }
  };

  /**
   * 获取会话列表
   */
  const fetchSessionList = async (userId: number) => {
    setLoading((prev) => ({ ...prev, sessionList: true }));
    setError(null);
    try {
      const response = await connectionService.getSessionList(userId);
      if (response.data) {
        setSessionList(response.data);
      } else {
        setError(response.message || "获取会话列表失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取会话列表失败");
      setError(errorMessage);
      console.error("获取会话列表失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, sessionList: false }));
    }
  };

  /**
   * 获取未读消息数
   */
  const fetchUnreadCount = async (userId: number) => {
    setLoading((prev) => ({ ...prev, unreadCount: true }));
    setError(null);
    try {
      const response = await connectionService.getUnreadCount(userId);
      if (response.data !== undefined) {
        setUnreadCount(response.data);
      } else {
        setError(response.message || "获取未读消息数失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取未读消息数失败");
      setError(errorMessage);
      console.error("获取未读消息数失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, unreadCount: false }));
    }
  };

  /**
   * 获取与特定用户的未读消息数
   */
  const fetchUnreadCountWithUser = async (currentUserId: number, targetUserId: number) => {
    setLoading((prev) => ({ ...prev, unreadCountWithUser: true }));
    setError(null);
    try {
      const response = await connectionService.getUnreadCountWithUser(
        currentUserId,
        targetUserId
      );
      if (response.data !== undefined) {
        setUnreadCountWithUser(response.data);
      } else {
        setError(response.message || "获取未读消息数失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取未读消息数失败");
      setError(errorMessage);
      console.error("获取未读消息数失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, unreadCountWithUser: false }));
    }
  };

  /**
   * 标记消息为已读
   */
  const markMessageAsRead = async (sessionId: string, userId: number) => {
    setLoading((prev) => ({ ...prev, markAsRead: true }));
    setError(null);
    try {
      const response = await connectionService.markAsRead(sessionId, userId);
      if (response.data) {
        // 标记成功后，可以刷新未读消息数
        await fetchUnreadCount(userId);
      } else {
        setError(response.message || "标记已读失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "标记已读失败");
      setError(errorMessage);
      console.error("标记已读失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, markAsRead: false }));
    }
  };

  /**
   * 发送消息
   */
  const sendMessage = async (
    fromUserId: number,
    toUserId: number,
    content: string,
    productId?: number,
    currentTargetUserId?: number
  ) => {
    setLoading((prev) => ({ ...prev, sendMessage: true }));
    setError(null);
    try {
      const response = await connectionService.sendMessage(
        fromUserId,
        toUserId,
        content,
        productId
      );
      if (response.data) {
        // 刷新会话列表和未读消息数
        await fetchSessionList(fromUserId);
        await fetchUnreadCount(fromUserId);

        // 如果提供了当前会话的对方用户ID，重新获取聊天历史以确保显示最新消息
        if (currentTargetUserId !== undefined) {
          await fetchChatHistory(fromUserId, currentTargetUserId);
        }
      } else {
        setError(response.message || "发送消息失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "发送消息失败");
      setError(errorMessage);
      console.error("发送消息失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, sendMessage: false }));
    }
  };

  return {
    chatHistory,
    sessionList,
    unreadCount,
    unreadCountWithUser,
    loading,
    error,
    fetchChatHistory,
    fetchSessionList,
    fetchUnreadCount,
    fetchUnreadCountWithUser,
    markMessageAsRead,
    sendMessage,
  };
};

export default useConnection;

