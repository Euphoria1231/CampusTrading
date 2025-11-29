import { Image } from "antd";
import './index.less';
import { type FC, } from "react";
import { useNavigate } from "react-router-dom";
import avatar from '@/assets/images/111.jpg'
export type SystemLayoutProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
const ToggleStyleContainer = ({ stroke = '#FFFFFFdd' }: { stroke?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M13.0264 1.20543C10.2914 1.91848 8.27275 4.4053 8.27275 7.36365C8.27275 10.8782 11.1218 13.7273 14.6363 13.7273C17.5947 13.7273 20.0815 11.7086 20.7945 8.97365C20.9292 9.628 21 10.3058 21 11C21 16.5229 16.5229 21 11 21C5.47715 21 1 16.5229 1 11C1 5.47715 5.47715 1 11 1C11.6942 1 12.372 1.07075 13.0264 1.20543Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
const SystemLayoutNoBackground: FC<SystemLayoutProps> = ({ children, onScroll }) => {
  const navigate = useNavigate();

  return (
    <div
      className="system-container has-animations"
      onScroll={onScroll}>
      <header className="system-header">
        <div className="system-header-logo">
          {/* {待定} */}
        </div>
        <nav className="system-header-nav">
          <div
            onClick={() => navigate('/')}
            className="system-header-nav-item">
            首页
          </div>
          <div
          onClick={() => {
            const token = localStorage.getItem('token');
            if (token) {
              // 已登录，跳转到个人中心
              navigate('/user/profile');
            } else {
              // 未登录，跳转到登录页面
              navigate('/user');
            }
          }}
          className="system-header-nav-item"
        >
          <span>{localStorage.getItem('token') ? '个人中心' : '登录/注册'}</span>
          <Image className='system-header-nav-item-avatar' src={avatar} preview={false} />
        </div>
          <div className="system-header-nav-item">
            <ToggleStyleContainer />
          </div>
        </nav>
      </header>
      <main className="system-main">
        {children}
      </main>
    </div>
  )
}

export default SystemLayoutNoBackground;