import type { IResponse } from "../request";

/**
 * 评价实体类型
 */
export interface Review {
  id?: number;
  orderId: number;
  reviewerId: number;
  revieweeId: number;
  productId: number;
  rating: number; // Integer -> number
  content: string;
  anonymity?: boolean; // Boolean -> boolean
  createTime?: string; // LocalDateTime -> string
  updateTime?: string; // LocalDateTime -> string
}

/**
 * 发布评价请求参数
 */
export interface SaveReviewReq {
  orderId: number;
  reviewerId: number;
  revieweeId: number;
  productId: number;
  rating: number;
  content: string;
  anonymity?: boolean;
}

/**
 * 发布评价响应
 */
export type SaveReviewRes = IResponse<boolean>;

/**
 * 根据商品ID查询评价列表响应
 */
export type GetReviewsByProductIdRes = IResponse<Review[]>;

/**
 * 根据用户ID查询评价列表响应
 */
export type GetReviewsByUserIdRes = IResponse<Review[]>;

/**
 * 根据交易ID查询评价响应
 */
export type GetReviewByOrderIdRes = IResponse<Review>;

/**
 * 查询我的评价列表响应
 */
export type GetMyReviewsRes = IResponse<Review[]>;

