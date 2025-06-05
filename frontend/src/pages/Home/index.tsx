import React, { useState } from "react";
import { Home, PlusSquare, User, Radar, Bell } from "lucide-react";
import "./Home.scss";
import { FeedScreen } from "./Feed/Feed";
import { ProfileScreen } from "../../components/Profile";
import { CreatePostScreen } from "./Create";
import { ExploreScreen } from "./Explore";
import { NotificationsScreen } from "./Notifications";

export const HomeScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    "feed" | "profile" | "create" | "explore" | "notification"
  >("feed");

  const NavigationItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
  }> = ({ icon, label, isActive, onClick }) => (
    <div
      className={`d-flex align-items-center p-3 rounded cursor-pointer nav-item ${
        isActive ? "bg-light fw-bold" : ""
      }`}
      onClick={onClick}
      style={{ cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "#f8f9fa";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div className="me-3">{icon}</div>
      <span className="fs-6">{label}</span>
    </div>
  );

  const BottomNavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
  }> = ({ icon, label, isActive, onClick }) => (
    <div
      className={`d-flex flex-column align-items-center justify-content-center cursor-pointer bottom-nav-item ${
        isActive ? "active" : ""
      }`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "all 0.2s",
        flex: 1,
        padding: "8px 4px",
        color: isActive ? "var(--primary)" : "#6c757d",
      }}
    >
      <div className="mb-1">{icon}</div>
      <span
        style={{ fontSize: "10px", fontWeight: isActive ? "bold" : "normal" }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="HomeScreen">
      <div className="min-vh-100" style={{ backgroundColor: "#fafafa" }}>
        {/* Top Header for mobile */}
        <div className="d-lg-none bg-white border-bottom px-3 py-2 d-flex justify-content-center align-items-center">
          <h1 className="h4 mb-0 fw-bold logo">MySocial</h1>
        </div>

        <div className="w-100 d-flex">
          {/* Desktop Sidebar */}
          <aside className="side-bar d-none d-lg-block position-relative bg-white border-end sidebar-nav">
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0 fw-bold logo">MySocial</h1>
              </div>

              <nav>
                <NavigationItem
                  icon={<Home size={24} />}
                  label="Feed"
                  isActive={currentScreen === "feed"}
                  onClick={() => setCurrentScreen("feed")}
                />
                <NavigationItem
                  icon={<Radar size={24} />}
                  label="Esplora"
                  isActive={currentScreen === "explore"}
                  onClick={() => setCurrentScreen("explore")}
                />
                <NavigationItem
                  icon={<PlusSquare size={24} />}
                  label="Nuovo Post"
                  isActive={currentScreen === "create"}
                  onClick={() => setCurrentScreen("create")}
                />

                <NavigationItem
                  icon={<Bell size={24} />}
                  label="Notifiche"
                  isActive={currentScreen === "notification"}
                  onClick={() => setCurrentScreen("notification")}
                />

                <NavigationItem
                  icon={<User size={24} />}
                  label="Profilo"
                  isActive={currentScreen === "profile"}
                  onClick={() => setCurrentScreen("profile")}
                />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-100 main-content">
            {currentScreen === "feed" ? (
              <FeedScreen />
            ) : currentScreen === "profile" ? (
              <ProfileScreen />
            ) : currentScreen === "create" ? (
              <CreatePostScreen />
            ) : currentScreen === "notification" ? (
              <NotificationsScreen />
            ) : (
              <ExploreScreen />
            )}
          </main>
        </div>

        {/* Bottom Navigation for mobile */}
        <div className="d-lg-none position-fixed bottom-0 start-0 w-100 bg-white border-top bottom-nav">
          <div className="d-flex">
            <BottomNavItem
              icon={<Home size={20} />}
              label="Feed"
              isActive={currentScreen === "feed"}
              onClick={() => setCurrentScreen("feed")}
            />
            <BottomNavItem
              icon={<Radar size={20} />}
              label="Esplora"
              isActive={currentScreen === "explore"}
              onClick={() => setCurrentScreen("explore")}
            />
            <BottomNavItem
              icon={<PlusSquare size={20} />}
              label="Nuovo"
              isActive={currentScreen === "create"}
              onClick={() => setCurrentScreen("create")}
            />

            <BottomNavItem
              icon={<Bell size={20} />}
              label="Notifiche"
              isActive={currentScreen === "notification"}
              onClick={() => setCurrentScreen("notification")}
            />
            <BottomNavItem
              icon={<User size={20} />}
              label="Profilo"
              isActive={currentScreen === "profile"}
              onClick={() => setCurrentScreen("profile")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
