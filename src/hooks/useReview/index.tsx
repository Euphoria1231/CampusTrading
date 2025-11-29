import { useState } from "react";
import useReviewService from "../../services/useReviewService";
import type { Review, SaveReviewReq } from "../../services/useReviewService/type";

interface UseReviewReturn {
  // 数据状态
  reviews: Review[];
  myReviews: Review[];
  reviewByOrderId: Review | null;

  // 加载状态
  loading: {
    saveReview: boolean;
    fetchReviewsByProductId: boolean;
    fetchReviewsByUserId: boolean;
    fetchReviewByOrderId: boolean;
    fetchMyReviews: boolean;
  };

  // 错误状态
  error: string | null;

  // 方法
  saveReview: (review: SaveReviewReq) => Promise<void>;
  fetchReviewsByProductId: (productId: number) => Promise<void>;
  fetchReviewsByUserId: (userId: number) => Promise<void>;
  fetchReviewByOrderId: (orderId: number) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
}

const useReview = (): UseReviewReturn => {
  const reviewService = useReviewService();

  // 数据状态
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewByOrderId, setReviewByOrderId] = useState<Review | null>(null);

  // 加载状态
  const [loading, setLoading] = useState({
    saveReview: false,
    fetchReviewsByProductId: false,
    fetchReviewsByUserId: false,
    fetchReviewByOrderId: false,
    fetchMyReviews: false,
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
   * 发布评价
   */
  const saveReview = async (review: SaveReviewReq) => {
    setLoading((prev) => ({ ...prev, saveReview: true }));
    setError(null);
    try {
      const response = await reviewService.saveReview(review);
      if (!response.data) {
        setError(response.message || "发布评价失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "发布评价失败");
      setError(errorMessage);
      console.error("发布评价失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, saveReview: false }));
    }
  };

  /**
   * 获取商品评价列表
   */
  const fetchReviewsByProductId = async (productId: number) => {
    setLoading((prev) => ({ ...prev, fetchReviewsByProductId: true }));
    setError(null);
    try {
      const response = await reviewService.getReviewsByProductId(productId);
      if (response.data) {
        setReviews(response.data);
      } else {
        setError(response.message || "获取商品评价列表失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取商品评价列表失败");
      setError(errorMessage);
      console.error("获取商品评价列表失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, fetchReviewsByProductId: false }));
    }
  };

  /**
   * 获取用户收到的评价列表
   */
  const fetchReviewsByUserId = async (userId: number) => {
    setLoading((prev) => ({ ...prev, fetchReviewsByUserId: true }));
    setError(null);
    try {
      const response = await reviewService.getReviewsByUserId(userId);
      if (response.data) {
        setReviews(response.data);
      } else {
        setError(response.message || "获取用户评价列表失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取用户评价列表失败");
      setError(errorMessage);
      console.error("获取用户评价列表失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, fetchReviewsByUserId: false }));
    }
  };

  /**
   * 获取订单评价
   */
  const fetchReviewByOrderId = async (orderId: number) => {
    setLoading((prev) => ({ ...prev, fetchReviewByOrderId: true }));
    setError(null);
    try {
      const response = await reviewService.getReviewByOrderId(orderId);
      if (response.data) {
        setReviewByOrderId(response.data);
      } else {
        setError(response.message || "获取订单评价失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取订单评价失败");
      setError(errorMessage);
      console.error("获取订单评价失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, fetchReviewByOrderId: false }));
    }
  };

  /**
   * 获取我发出的评价列表
   */
  const fetchMyReviews = async () => {
    setLoading((prev) => ({ ...prev, fetchMyReviews: true }));
    setError(null);
    try {
      const response = await reviewService.getMyReviews();
      if (response.data) {
        setMyReviews(response.data);
      } else {
        setError(response.message || "获取我的评价列表失败");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "获取我的评价列表失败");
      setError(errorMessage);
      console.error("获取我的评价列表失败:", err);
    } finally {
      setLoading((prev) => ({ ...prev, fetchMyReviews: false }));
    }
  };

  return {
    reviews,
    myReviews,
    reviewByOrderId,
    loading,
    error,
    saveReview,
    fetchReviewsByProductId,
    fetchReviewsByUserId,
    fetchReviewByOrderId,
    fetchMyReviews,
  };
};

export default useReview;

