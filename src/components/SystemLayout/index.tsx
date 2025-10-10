import type { FC } from "react";
import SystemLayoutNoBackground, { type SystemLayoutProps } from "./SystemLayoutNoBackground";

const SystemLayout: FC<SystemLayoutProps> = ({ children }) => {
  return (
    <SystemLayoutNoBackground>
      <div className="system-background system-figure">
        <svg className="system-figure-placeholder" width="528" height="396" viewBox="0 0 528 396">
          <rect width="528" height="396" style={{ fill: 'transparent' }} />
        </svg>
        <div className="system-figure-box system-figure-box-01"></div>
        <div className="system-figure-box system-figure-box-02"></div>
        <div className="system-figure-box system-figure-box-03"></div>
        <div className="system-figure-box system-figure-box-04"></div>
        <div className="system-figure-box system-figure-box-05"></div>
        <div className="system-figure-box system-figure-box-06"></div>
        <div className="system-figure-box system-figure-box-07"></div>
        <div className="system-figure-box system-figure-box-08"></div>
        <div className="system-figure-box system-figure-box-09"></div>
        <div className="system-figure-box system-figure-box-10"></div>
      </div>
      <main className="system-main-content">
        {children}
      </main>
    </SystemLayoutNoBackground>
  )
}

export default SystemLayout;