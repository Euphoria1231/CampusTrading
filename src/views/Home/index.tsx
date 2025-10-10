import './index.less';
import TypeWriter from "@/components/TypeWriter";
import { useEffect, useRef, useState, type FC } from "react";
import { Image } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import FeatureIcon01 from '@/assets/icons/feature-icon-01.svg';
import FeatureIcon02 from '@/assets/icons/feature-icon-02.svg';
import FeatureIcon03 from '@/assets/icons/feature-icon-03.svg';
import FeatureIcon04 from '@/assets/icons/feature-icon-04.svg';
import FeatureIcon05 from '@/assets/icons/pricing-illustration.svg';
import FeatureImage from '@/assets/images/home-feature.png'
import SystemLayoutNoBackground from '@/components/SystemLayout/SystemLayoutNoBackground';

// import type { ContextMenuOptionsProps } from '@/components/ContextMenu';

const Home: FC = () => {
  // // 右键菜单参数
  // const options: ContextMenuOptionsProps = {
  //   menus: [
  //     {
  //       name: '首页',
  //       onClick: () => console.log('1')
  //     },
  //     {
  //       name: '地点1',
  //       onClick: () => console.log('2')
  //     },
  //     {
  //       name: '地点2',
  //       onClick: () => console.log('3')
  //     },
  //   ]
  // }

  // // 粒子参数
  // const particleOptions = {
  //   "fpsLimit": 60,
  //   "fullScreen": {
  //     "zIndex": 0
  //   },
  //   "interactivity": {
  //     "events": {
  //       "onClick": {
  //         "enable": true,
  //         "mode": "push"
  //       },
  //       "onHover": {
  //         "enable": true,
  //         "mode": ["grab", "attract"],
  //         "parallax": {
  //           "enable": true,
  //           "force": 60,
  //           "smooth": 10
  //         }
  //       },
  //       "resize": true
  //     },
  //     "modes": {
  //       "push": {
  //         "quantity": 4
  //       },
  //       "grab": {
  //         "distance": 140,
  //         "links": {
  //           "opacity": 1
  //         }
  //       },
  //       "bubble": {
  //         "distance": 400,
  //         "duration": 2,
  //         "opacity": 8,
  //         "size": 40,
  //         "speed": 3
  //       },
  //       "repulse": {
  //         "distance": 200,
  //         "duration": 0.4
  //       },
  //       "remove": {
  //         "particles_nb": 2
  //       }
  //     }
  //   },
  //   "particles": {
  //     "color": {
  //       "value": "#7c7c7c"
  //     },
  //     "links": {
  //       "color": {
  //         "value": "#7c7c7c"
  //       },
  //       "distance": 150,
  //       "enable": true,
  //       "opacity": 0.4,
  //       "width": 1
  //     },
  //     "move": {
  //       "enable": true,
  //       "speed": 4,
  //       "direction": "none",
  //       "random": true,
  //       "straight": false,
  //       "outModes": "out",
  //       "bounce": false,
  //       "attract": {
  //         "rotate": {
  //           "x": 600,
  //           "y": 1200
  //         }
  //       }
  //     },
  //     "number": {
  //       "value": 130,
  //       "density": {
  //         "enable": true,
  //         "area": 800
  //       }
  //     },
  //     "opacity": {
  //       "value": 0.5,
  //       "random": false,
  //       "animation": {
  //         "enable": false,
  //         "speed": 1,
  //         "minimumValue": 0.1,
  //         "sync": false
  //       }
  //     },
  //     "shape": {
  //       "type": "circle",
  //       "stroke": {
  //         "width": 0,
  //         "color": "#000000"
  //       },
  //       "polygon": {
  //         "sides": 5
  //       },
  //       "image": {
  //         "src": "img/github.svg",
  //         "width": 100,
  //         "height": 100
  //       }
  //     },
  //     "size": {
  //       "value": 3,
  //       "random": true,
  //       "animation": {
  //         "enable": false,
  //         "speed": 40,
  //         "minimumValue": 0.1,
  //         "sync": false
  //       }
  //     }
  //   },
  //   "detectRetina": true
  // };
  const navigate = useNavigate();
  // 动画控制 ref
  const figureRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const Card2Ref = useRef<HTMLDivElement>(null);
  const Card3Ref = useRef<HTMLDivElement>(null);
  const Card4Ref = useRef<HTMLDivElement>(null);

  // 动画控制开关
  const [sparkStart, setSparkStart] = useState(false);
  const onScroll = (events: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const e = events.currentTarget;
    if (e === undefined || sparkRef.current === null || mainRef.current === null || Card2Ref.current === null || Card3Ref.current === null || Card4Ref.current === null) return;
    // spark 打字机到 main 容器顶部距离
    // 打字机动画显示
    const sparkToMainTop = sparkRef.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - sparkToMainTop > 10) {
      setSparkStart(true);
    }
    // 卡片动画显示
    // 卡片 1 不需要显示
    const Card2ToMainTop = Card2Ref.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - Card2ToMainTop > 400) {
      if (Card2Ref.current)
        Card2Ref.current.classList.add('anime-fade-in');
    }
    const Card3ToMainTop = Card3Ref.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - Card3ToMainTop > 400) {
      if (Card3Ref.current)
        Card3Ref.current.classList.add('anime-fade-in');
    }
    const Card4ToMainTop = Card4Ref.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - Card4ToMainTop > 400) {
      if (Card4Ref.current)
        Card4Ref.current.classList.add('anime-fade-in');
    }

  }
  useEffect(() => {
    // 添加动画就绪类，触发CSS动画
    const timer = setTimeout(() => {
      if (figureRef.current) {
        figureRef.current.classList.add('anime-ready');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SystemLayoutNoBackground onScroll={onScroll} >
        <main
          className='home-container'
          ref={mainRef}
        >
          <section className="hero">
            <div className="container">
              <div className="hero-inner">
                <div className="hero-copy">
                  <TypeWriter
                    className="hero-title"
                    delay={50}
                    text={[
                      'Hi, 欢迎来到',
                      { text: '校园易物', className: 'hero-title-highlight' },
                      '，你的',
                      { text: '校园交易助手', className: 'hero-title-highlight' }
                    ]} />
                  <p className="hero-paragraph">让我们一起开启绿色交易，让闲置好物重获新生，共建美好校园</p>
                  <div className="hero-cta">
                    <div
                      onClick={() => navigate('trade-manage')}
                      className="button button-primary">开始交易<ArrowRightOutlined /> </div>
                  </div>
                </div>
                <div className="home-figure anime-element" ref={figureRef}>
                  <svg className="home-figure-placeholder" width="528" height="396" viewBox="0 0 528 396">
                    <rect width="528" height="396" style={{ fill: 'transparent' }} />
                  </svg>
                  <div className="home-figure-box home-figure-box-01"></div>
                  <div className="home-figure-box home-figure-box-02"></div>
                  <div className="home-figure-box home-figure-box-03"></div>
                  <div className="home-figure-box home-figure-box-04"></div>
                  <div className="home-figure-box home-figure-box-05"></div>
                  <div className="home-figure-box home-figure-box-06"></div>
                  <div className="home-figure-box home-figure-box-07"></div>
                  <div className="home-figure-box home-figure-box-08"></div>
                  <div className="home-figure-box home-figure-box-09"></div>
                  <div className="home-figure-box home-figure-box-10"></div>
                  <div className="home-figure-box home-figure-box-routes">
                    <a
                      onClick={() => navigate('goods')}
                      className="home-figure-box-route">
                      商品管理
                    </a>
                    <a
                      onClick={() => navigate('connection')}
                      className="home-figure-box-route">
                      在线沟通
                    </a>
                    <a
                      onClick={() => navigate('feedback')}
                      className="home-figure-box-route">
                      反馈中心
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="feature">
            <div className="feature-container">
              <div className="feature-item" style={{ opacity: 1 }}>
                <div className="feature-item-header">
                  <Image
                    src={FeatureIcon01}
                    preview={false}
                    className='feature-item-header-img' />
                  <div className="feature-item-header-title">
                    商品管理
                    <p className="feature-item-header-subtitle">闲置物品，轻松管理</p>
                  </div>
                </div>
                <div className='feature-item-content-wrapper'>
                  <div className="feature-item-content">
                    <ul className="feature-item-content-left">
                      <li>创建商品信息，图文并茂展示详情</li>
                      <li>修改商品内容，随时更新最新状态</li>
                      <li>浏览商品列表，快速查找心仪好物</li>
                    </ul>
                    <div className="feature-item-content-right">
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-30px',
                          left: '40px'
                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-25px',
                          left: '50px',

                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          left: '60px',
                          top: '-20px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div ref={Card2Ref} className="feature-item">
                <div className="feature-item-header feature-right">
                  <Image
                    src={FeatureIcon02}
                    preview={false}
                    className='feature-item-header-img' />
                  <div className="feature-item-header-title">
                    交易管理
                    <p className="feature-item-header-subtitle">交易流程，清晰明了</p>
                  </div>
                </div>
                <div className='feature-item-content-wrapper feature-right'>
                  <div className="feature-item-content feature-right">
                    <ul className="feature-item-content-left">
                      <li>申请交易意向，一键发起购买请求</li>
                      <li>接受交易申请，确认订单开启流程</li>
                      <li>查询交易记录，历史订单一目了然</li>
                    </ul>
                    <div className="feature-item-content-right">
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-20px',
                          right: '70px',

                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-15px',
                          right: '60px',

                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          right: '50px',
                          top: '-10px',

                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div ref={Card3Ref} className="feature-item">
                <div className="feature-item-header">
                  <Image
                    src={FeatureIcon03}
                    preview={false}
                    className='feature-item-header-img' />
                  <div className="feature-item-header-title">
                    消息通讯
                    <p className="feature-item-header-subtitle">实时沟通，交流无障碍</p>
                  </div>
                </div>
                <div className='feature-item-content-wrapper'>
                  <div className="feature-item-content">
                    <ul className="feature-item-content-left">
                      <li>发送消息即时送达，买卖沟通畅通无阻</li>
                      <li>接收消息及时提醒，重要信息不再错过</li>
                      <li>查看消息记录清晰，聊天历史随时回溯</li>
                    </ul>
                    <div className="feature-item-content-right">
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-30px',
                          left: '40px'
                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-25px',
                          left: '50px',

                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          left: '60px',
                          top: '-20px'
                        }}
                      />
                    </div>
                  </div>
                  <Image
                    src={FeatureIcon05}
                    preview={false}
                    className='feature-item-placeholder' />
                </div>
              </div>
              <div className="feature-item" ref={Card4Ref}>
                <div className="feature-item-header feature-right">
                  <Image
                    src={FeatureIcon04}
                    preview={false}
                    className='feature-item-header-img' />
                  <div className="feature-item-header-title">
                    评价反馈
                    <p className="feature-item-header-subtitle">信用为本，共建诚信社区</p>
                  </div>
                </div>
                <div className='feature-item-content-wrapper feature-right'>
                  <div className="feature-item-content feature-right">
                    <ul className="feature-item-content-left">
                      <li>发布评价真实客观，交易体验如实记录</li>
                      <li>查看评价参考借鉴，卖家信誉一目了然</li>
                      <li>举报投诉快速响应，维权渠道畅通有效</li>
                    </ul>
                    <div className="feature-item-content-right">
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-20px',
                          right: '70px',

                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          top: '-15px',
                          right: '60px',

                        }}
                      />
                      <Image
                        src={FeatureImage}
                        preview={false}
                        className='feature-item-content-right-item'
                        style={{
                          right: '50px',
                          top: '-10px',

                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section
            className='spark'>
            <div
              className='spark-container'>
              <div className='spark-background'>
                <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 434 313" fill="none">
                  <path d="M4.60263 257.647L0.454102 267.431C101.348 346.683 154.704 318.896 154.704 195.039C154.704 76.5758 214.489 63.0246 337.707 155.109C378.936 184.344 407.744 185.921 423.11 158.71C437.967 132.401 435.509 80.2313 424.029 0.0131984L423.025 0.0126953C434.314 78.9027 432.816 130.892 418.849 155.626C405.391 179.458 379.579 178.046 340.443 150.295C214.446 56.1323 149.645 70.8198 149.645 195.039C149.645 313.864 102.393 334.464 4.60135 257.647H4.60263Z" fill="url(#paint0_linear_590_214)" />
                  <defs>
                    <linearGradient id="paint0_linear_590_214" x1="435.587" y1="153.849" x2="1.71855" y2="153.849" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#4375A5" />
                      <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className='spark-img'>
                <div >
                  <Image
                    className='spark-img-item spark-img-item-1'
                    src={FeatureImage}
                    preview={false}

                  />
                </div>
                <div >
                  <Image
                    className='spark-img-item spark-img-item-2'
                    src={FeatureImage}
                    preview={false}

                  />
                </div>
                <div >
                  <Image
                    className='spark-img-item spark-img-item-3'
                    src={FeatureImage}
                    preview={false}

                  />
                </div>
                <div
                  ref={sparkRef}
                  className='spark-img-info'>
                  Campus-Trading
                  {
                    sparkStart && <TypeWriter
                      className='spark-img-info-text'
                      text={[{ text: '校园易物，让闲置流转更智能', className: 'spark-img-info-text-highlight' }]}
                    />
                  }
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className='home-footer'>
          <div className='home-footer-left'>
            <div className='home-footer-line' />
            <div className='home-footer-copyright'>
              © 2025 CampusTrading, all rights reserved
            </div>
          </div>
          <div className='home-footer-right'>
            <div className='home-footer-options'>
              <div className='home-footer-option'>Contact</div>
              <div className='home-footer-option'>About us</div>
              <div className='home-footer-option'>FAQ's</div>
              <div className='home-footer-option'>Thanks</div>
            </div>
            <div className='home-footer-line' />
          </div>
        </footer>
      </SystemLayoutNoBackground>
    </>
  )
}
export default Home;