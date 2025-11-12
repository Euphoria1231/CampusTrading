import { HashRouter, Routes, Route } from "react-router-dom"
import Home from "./views/Home"
import './index.less'
import TradeManage from "./views/TradeManage"
import User from "./views/User"
import Feedback from "./views/Feedback"
import Connection from "./views/Connection"
import GoodsBrowse from "./views/GoodsBrowse"
import GoodsCreate from "./views/GoodsCreate"
import GoodsEdit from "./views/GoodsEdit"
import GoodsDetail from "./views/GoodsDetail"
function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route element={<Home />} path="*" />
          <Route element={<TradeManage />} path="trade-manage" />

          <Route element={<TradeManage />} path="trade-manage/detail/:id" /> 

          {/* 用户相关路由 */}

          <Route element={<User />} path="user" />
          <Route element={<User />} path="/user/register" />
          <Route path="/user/forgot-password" element={<User />} />
          <Route path="/user/profile" element={<User />} />
          
          <Route element={<Feedback />} path="feedback" />
          <Route element={<Feedback />} path="feedback/:tradeId" />
          <Route element={<Connection />} path="connection" />
          <Route element={<GoodsBrowse />} path="goods-browse" />
          <Route element={<GoodsCreate />} path="goods-create" />
          <Route element={<GoodsEdit />} path="goods-edit/:id" />
          <Route element={<GoodsDetail />} path="goods-detail/:id" />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
