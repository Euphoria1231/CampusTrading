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

const API_BASE = "/api";

// 定义后端分页结果结构
interface PageResult {
  records: RawTrade[];
  total: number;
}

// 获取交易列表
const getTrades = async (params?: {
  page?: number;
  limit?: number;  // 对应后端的 pageSize
  status?: string;
}): Promise<{ trades: Trade[], total: number }> => {
  // 转换参数名称以匹配后端
  const requestParams = {
    page: params?.page,
    pageSize: params?.limit,
    status: params?.status === "ALL" ? undefined : params?.status
  };
  
  const res = await axios.get(`${API_BASE}/trades`, { 
    params: requestParams 
  });
  
  // 处理后端返回的 PageResult 结构
  const pageResult: PageResult = res.data.data;
  const trades = (pageResult.records || []).map(convertTrade);
  
  return {
    trades,
    total: pageResult.total
  };
};

// 获取交易详情
const getTradeById = async (id: number): Promise<Trade> => {
  const res = await axios.get(`${API_BASE}/trades/${id}`);
  return convertTrade(res.data.data);
};

// 更新交易状态
const updateTradeStatus = async (id: number, status: string): Promise<Trade> => {
  const res = await axios.patch(`${API_BASE}/trades/${id}`, { status });
  return convertTrade(res.data.data);
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
    console.log("🎯 点击交易卡片，ID:", id);
    console.log("📝 准备跳转路径:", `/trade-manage/detail/${id}`);
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

  useEffect(() => {
    if (!id) {
      console.error("❌ TradeDetailPage: id 为空");
      setLoading(false);
      return;
    }

    console.log("🔍 TradeDetailPage 开始加载，ID:", id);
    
    const fetchData = async () => {
      try {
        const data = await getTradeById(Number(id));
        console.log("✅ 获取交易详情成功:", data);
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

    try {
      const updated = await updateTradeStatus(trade.id, "ACCEPTED");
      setTrade(updated);
      alert("交易已接受！");
    } catch (err) {
      console.error("接受交易失败:", err);
      alert("操作失败，请重试");
    }
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
  } = trade;

  return (
    <div className="trade-content">
      <div className="trade-detail">
        <div className="header">
          <h2>交易详情</h2>
          <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
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
      </div>
      {trade.status === "PENDING" && (
        <button onClick={handleAccept} style={{ marginTop: "20px" }}>
          接受交易
        </button>
      )}
    </div>
  );
};

// 主组件 - 修复版本
const TradeManage: FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  
  console.log("=== 🚀 TradeManage 路由调试 ===");
  console.log("📍 location.pathname:", location.pathname);
  console.log("🎯 useParams id:", id);
  
  const match = location.pathname.match(/\/trade-manage\/detail\/(\d+)/);
  console.log("🔍 正则匹配结果:", match);
  
  // 优先使用 useParams，如果为空则使用正则匹配的结果
  const finalId = id || (match ? match[1] : null);
  console.log("✅ 最终使用的 ID:", finalId);
  console.log("===============================");

  return (
    <SystemLayoutNoBackground>
      <div className="trade-manage-container">
        {finalId ? <TradeDetailPage id={finalId} /> : <TradeListPage />}
      </div>
    </SystemLayoutNoBackground>
  );
};

export default TradeManage;