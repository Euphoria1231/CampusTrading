import { HashRouter, Routes, Route } from "react-router-dom"
import Home from "./views/Home"
import './index.less'
import TradeManage from "./views/TradeManage"
import User from "./views/User"
import Feedback from "./views/Feedback"
import Connection from "./views/Connection"
import Goods from "./views/Goods"
function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route element={<Home />} path="*" />
          <Route element={<TradeManage />} path="trade-manage" />
<<<<<<< HEAD
          <Route element={<TradeManage />} path="trade-manage/detail/:id" /> 添加这一行
=======
          {/* 用户相关路由 */}
>>>>>>> 70a746f35cf8a46be0cd452a41cd40fecd8b9d2b
          <Route element={<User />} path="user" />
          <Route element={<User />} path="/user/register" />
          <Route path="/user/forgot-password" element={<User />} />
          <Route path="/user/profile" element={<User />} />
          
          <Route element={<Feedback />} path="feedback" />
          <Route element={<Connection />} path="connection" />
          <Route element={<Goods />} path="goods"/>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
