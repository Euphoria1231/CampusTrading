import { request } from "../request";
import type {
  SaveReviewReq,
  SaveReviewRes,
  GetReviewsByProductIdRes,
  GetReviewsByUserIdRes,
  GetReviewByOrderIdRes,
  GetMyReviewsRes,
} from "./type";

const useReviewService = () => {
  /**
   * 发布评价
   */
  const saveReview = (review: SaveReviewReq): Promise<SaveReviewRes> => {
    return request("post", "/api/review", review);
  };

  /**
   * 根据商品ID查询评价列表
   */
  const getReviewsByProductId = (
    productId: number
  ): Promise<GetReviewsByProductIdRes> => {
    return request("get", `/api/review/product/${productId}`);
  };

  /**
   * 根据用户ID查询收到的评价列表
   */
  const getReviewsByUserId = (
    userId: number
  ): Promise<GetReviewsByUserIdRes> => {
    return request("get", `/api/review/user/${userId}`);
  };

  /**
   * 根据交易ID查询评价
   */
  const getReviewByOrderId = (
    orderId: number
  ): Promise<GetReviewByOrderIdRes> => {
    return request("get", `/api/review/order/${orderId}`);
  };

  /**
   * 查询我的评价列表（我发出的评价）
   */
  const getMyReviews = (): Promise<GetMyReviewsRes> => {
    return request("get", "/api/review/my");
  };

  return {
    saveReview,
    getReviewsByProductId,
    getReviewsByUserId,
    getReviewByOrderId,
    getMyReviews,
  };
};

export default useReviewService;

