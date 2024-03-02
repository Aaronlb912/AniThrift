import React from "react";
import SidebarNavigation from "./SettingsNavBar";
import "../css/MainLayout.css"; // Path to your CSS file

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Component implementation
  return (
    <div className="main-layout-container">
      {/*  */}
      <div className="sidebar-navigation">
        <SidebarNavigation />
      </div>
      <div className="main-content">{children}</div>
    </div>
  );
};

export default MainLayout;
