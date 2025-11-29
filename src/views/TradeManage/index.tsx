import SystemLayoutNoBackground from "@/components/SystemLayout/SystemLayoutNoBackground";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "./index.less";

// 后端原始结构体
interface RawTrade {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  buyerId: number;
  sellerId: number;
  status: "PENDING" | "ACCEPTED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  quantity: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

// 前端展示结构体
interface Trade {
  id: number;
  product_id: number;
  product_snapshot: {
    title: string;
    price: number;
    image?: string;
  };
  buyer_id: number;
  seller_id: number;
  status: "PENDING" | "ACCEPTED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  total_amount: number;
  quantity: number;
  shipping_address: { address: string };
  created_at: string;
  updated_at: string;
}

// 举报表单数据类型
interface ReportFormData {
  reason: string;
  sellerId: number;
  tradeId: number;
}

// 转换函数
const convertTrade = (item: RawTrade): Trade => ({
  id: item.id,
  product_id: item.productId,
  product_snapshot: {
    title: item.productTitle,
    price: item.productPrice,
    image: item.productImage,
  },
  buyer_id: item.buyerId,
  seller_id: item.sellerId,
  status: item.status,
  total_amount: item.totalAmount,
  quantity: item.quantity,
  shipping_address: { address: item.shippingAddress },
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

// 定义后端分页结果结构
interface PageResult {
  records: RawTrade[];
  total: number;
}

// 获取交易列表
const getTrades = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ trades: Trade[], total: number }> => {
  const token = localStorage.getItem('token');

  console.log(`GET /api/trades`, { token });
  const requestParams = {
    page: params?.page,
    pageSize: params?.limit,
    status: params?.status === "ALL" ? undefined : params?.status
  };

  try {
    const res = await axios.get("/api/trades", {
      params: requestParams,
      headers: {
        'token': token || ''
      }
    });

    const pageResult: PageResult = res.data.data;
    const trades = (pageResult.records || []).map(convertTrade);

    return {
      trades,
      total: pageResult.total
    };
  } catch (error: any) {
    console.error('获取交易失败:', error);
    throw error;
  }
};

// 获取交易详情
const getTradeById = async (id: number): Promise<Trade> => {
  const token = localStorage.getItem('token');

  const res = await axios.get(`/api/trades/${id}`, {
    headers: {
      'token': token || ''
    }
  });
  return convertTrade(res.data.data);
};

// 更新交易状态
const updateTradeStatus = async (id: number, status: string): Promise<Trade> => {
  const token = localStorage.getItem('token');

  // 确保 status 不为空
  if (!status) {
    throw new Error('状态不能为空');
  }

  console.log(`📤 发送请求: POST /api/trades/${id}`, { status });

  const res = await axios.post(`/api/trades/${id}`, { status }, {
    headers: {
      'token': token || '',
      'Content-Type': 'application/json'
    }
  });

  console.log(`📥 接收响应:`, res.data);
  return convertTrade(res.data.data);
};// 提交举报
const submitReport = async (reportData: ReportFormData): Promise<void> => {
  const token = localStorage.getItem('token');

  await axios.post("/api/evaluation/report", reportData, {
    headers: {
      'token': token || ''
    }
  });
};

// 举报表单组件
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => void;
  sellerId: number;
  tradeId: number;
}

const ReportModal: FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sellerId,
  tradeId
}) => {
  const [reason, setReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("请输入举报原因");
      return;
    }

    onSubmit({
      reason: reason.trim(),
      sellerId,
      tradeId
    });

    // 重置表单
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="report-modal">
        <h3>举报交易</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reason">举报原因 *</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请详细描述举报原因..."
              rows={4}
              required
            />
          </div>

          <div className="form-info">
            <p><strong>交易订单号:</strong> {tradeId}</p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel}>取消</button>
            <button type="submit">提交举报</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// TradeListPage 组件
const TradeListPage: FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // 添加 token 检查
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const result = await getTrades({
          page: currentPage,
          limit: pageSize,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        });
        setTrades(result.trades);
        setTotal(result.total);
      } catch (err) {
        console.error("获取交易失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [filterStatus, currentPage, pageSize]);

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    // 状态改变时重置到第一页
    setCurrentPage(1);
  };

  const handleTradeClick = (id: number) => {
    navigate(`/trade-manage/detail/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const statuses = [
    { key: "ALL", label: "全部" },
    { key: "PENDING", label: "待接受" },
    { key: "ACCEPTED", label: "已接受" },
    { key: "COMPLETED", label: "已完成" },
    { key: "CANCELLED", label: "已取消" },
  ];

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="trade-content">
      <h2>我的交易</h2>
      <div className="trade-filter">
        {statuses.map(({ key, label }) => (
          <button
            key={key}
            className={filterStatus === key ? "active" : ""}
            onClick={() => handleFilterChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="trade-list">
        {trades.length > 0 ? (
          trades.map((trade) => (
            <div
              className="trade-card"
              key={trade.id}
              onClick={() => handleTradeClick(trade.id)}
            >
              <img
                src={trade.product_snapshot.image || ""}
                alt={trade.product_snapshot.title}
              />
              <div className="info">
                <h3>{trade.product_snapshot.title}</h3>
                <p>¥{trade.total_amount.toFixed(2)}</p>
                <span className={`status ${trade.status.toLowerCase()}`}>{trade.status}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">暂无交易记录</div>
        )}
      </div>

      {/* 分页控件 */}
      <div className="pagination">
        <button
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          上一页
        </button>
        <span>第 {currentPage} 页 (共 {Math.ceil(total / pageSize)} 页)</span>
        <button
          disabled={trades.length < pageSize}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

// TradeDetailPage 组件
const TradeDetailPage: FC<{ id: string }> = ({ id }) => {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // 获取当前用户ID
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // 解析token获取当前用户ID
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error('解析token失败:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) {
      console.error("❌ TradeDetailPage: id 为空");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getTradeById(Number(id));
        setTrade(data);
      } catch (err) {
        console.error("❌ 获取交易详情失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAccept = async () => {
    if (!trade || trade.status !== "PENDING") return;

    // 检查权限：只有卖家才能接受交易
    if (currentUserId !== trade.seller_id) {
      alert('只有卖家才能接受交易！');
      return;
    }

    // 防止重复点击
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      console.log(`🔄 正在接受交易 ${trade.id}...`);
      const updated = await updateTradeStatus(trade.id, "ACCEPTED");
      console.log(`✅ 交易接受成功:`, updated);

      // 正确更新状态
      setTrade(updated);
      alert("交易已接受！");

    } catch (err: any) {
      console.error("❌ 接受交易失败:", err);

      // 详细打印 Axios 错误信息
      if (err.isAxiosError) {
        console.error("🔍 Axios 错误详情:");
        console.error("状态码:", err.response?.status);
        console.error("状态文本:", err.response?.statusText);
        console.error("响应数据:", err.response?.data);
        console.error("请求URL:", err.config?.url);
        console.error("请求方法:", err.config?.method);
        console.error("请求数据:", err.config?.data);
      }

      // 提供更详细的错误信息
      let errorMessage = "未知错误";

      if (err.response?.status === 403) {
        errorMessage = "权限不足，无法操作此交易";
      } else if (err.response?.status === 404) {
        errorMessage = "交易不存在";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "请求参数错误";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`操作失败: ${errorMessage}`);

    } finally {
      // 重要：无论成功失败都要重置处理状态
      setIsProcessing(false);
    }
  };

  const handleReportSubmit = async (reportData: ReportFormData) => {
    try {
      await submitReport(reportData);
      alert("举报提交成功！");
      setShowReportModal(false);
    } catch (err) {
      console.error("提交举报失败:", err);
      alert("举报提交失败，请重试");
    }
  };

  // 根据用户角色和交易状态渲染操作按钮
  const renderActionButtons = () => {
    if (!trade || !currentUserId) return null;

    const isSeller = currentUserId === trade.seller_id;
    const isBuyer = currentUserId === trade.buyer_id;

    return (
      <div className="action-buttons">
        {/* 卖家操作：接受交易 */}
        {isSeller && trade.status === "PENDING" && (
          <button
            onClick={handleAccept}
            className="accept-button"
            disabled={isProcessing}
          >
            {isProcessing ? "处理中..." : "接受交易"}
          </button>
        )}

        {/* 买家操作：交易完成后显示评价和举报 */}
        {isBuyer && (trade.status === "ACCEPTED" || trade.status === "COMPLETED") && (
          <>
            <button
              onClick={() => navigate(`/reviews/goods/${trade.product_id}?orderId=${trade.id}&revieweeId=${trade.seller_id}`)}
              className="evaluate-button"
            >
              评价
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="report-button"
            >
              举报
            </button>
          </>
        )}

        {/* 卖家交易完成后不显示任何操作按钮 */}
        {isSeller && (trade.status === "ACCEPTED" || trade.status === "COMPLETED") && (
          <div className="no-actions">
            <p>交易已完成</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!trade) {
    return <div className="empty">未找到交易信息</div>;
  }

  const {
    product_snapshot,
    total_amount,
    quantity,
    status,
    created_at,
    shipping_address,
    seller_id,
    id: tradeId
  } = trade;

  return (
    <div className="trade-content">
      <div className="trade-detail">
        <div className="header">
          <h2>交易详情</h2>
          <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
        </div>

        {/* 显示当前用户角色 */}
        <div className="user-role-info">
          {currentUserId && (
            <p className="role-tag">
              {currentUserId === trade.seller_id ? '👨‍💼 卖家' : '👤 买家'}
            </p>
          )}
        </div>

        <div className="product-info">
          <img
            src={product_snapshot.image || ""}
            alt={product_snapshot.title}
          />
          <div className="details">
            <h3>{product_snapshot.title}</h3>
            <p>单价: ¥{product_snapshot.price.toFixed(2)}</p>
            <p>数量: {quantity}</p>
            <p>总价: ¥{total_amount.toFixed(2)}</p>
          </div>
        </div>
        <div className="trade-meta">
          <div className="meta-item">
            <p>
              <strong>创建时间:</strong> {new Date(created_at).toLocaleString()}
            </p>
          </div>
          <div className="meta-item">
            <p>
              <strong>收货地址:</strong> {shipping_address?.address || "暂无"}
            </p>
          </div>
        </div>

        {/* 使用新的操作按钮渲染函数 */}
        {renderActionButtons()}
      </div>

      {/* 举报弹窗 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        sellerId={seller_id}
        tradeId={tradeId}
      />
    </div>
  );
};

// 主组件
const TradeManage: FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();

  const match = location.pathname.match(/\/trade-manage\/detail\/(\d+)/);
  const finalId = id || (match ? match[1] : null);

  return (
    <SystemLayoutNoBackground>
      <div className="trade-manage-container">
        {finalId ? <TradeDetailPage id={finalId} /> : <TradeListPage />}
      </div>
    </SystemLayoutNoBackground>
  );
};

export default TradeManage;