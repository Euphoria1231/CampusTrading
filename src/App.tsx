import { HashRouter, Routes, Route } from "react-router-dom"
import Home from "./views/Home"
import './index.less'
function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route element={<Home />} path="*" />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
