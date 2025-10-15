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
          <Route element={<TradeManage />} path="trade-manage/detail/:id" /> 添加这一行
          <Route element={<User />} path="user" />
          <Route element={<Feedback />} path="feedback" />
          <Route element={<Connection />} path="connection" />
          <Route element={<Goods />} path="goods"/>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
