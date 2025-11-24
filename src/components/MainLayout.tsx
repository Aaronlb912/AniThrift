import React from "react";
import { useLocation } from "react-router-dom";
import SidebarNavigation from "./SettingsNavBar";
import "../css/MainLayout.css"; // Path to your CSS file

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar }) => {
  const location = useLocation();
  
  // Automatically hide sidebar for category pages and other pages that shouldn't have it
  // Check route immediately on mount to prevent any flash
  const shouldShowSidebar = React.useMemo(() => {
    // If showSidebar is explicitly set, use that
    if (showSidebar !== undefined) {
      return showSidebar;
    }
    
    // Otherwise, check the route - hide sidebar for category pages
    const path = location.pathname;
    const hideSidebarRoutes = ['/category/', '/search', '/item/', '/cart', '/checkout', '/messages'];
    
    return !hideSidebarRoutes.some(route => path.startsWith(route));
  }, [showSidebar, location.pathname]);

  // Use useMemo to prevent re-renders and ensure class is applied immediately
  const containerClass = React.useMemo(
    () => `main-layout-container ${!shouldShowSidebar ? 'no-sidebar' : ''}`,
    [shouldShowSidebar]
  );

  // Don't render sidebar at all if it shouldn't be shown - prevents any flash
  return (
    <div className={containerClass}>
      {shouldShowSidebar ? (
        <div className="sidebar-navigation">
          <SidebarNavigation />
        </div>
      ) : null}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default MainLayout;
