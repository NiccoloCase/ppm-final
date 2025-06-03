import React, { useState } from "react";
import { Home, PlusSquare, User, Menu, X, Radar } from "lucide-react";
import "./Home.scss";
import { FeedScreen } from "./Feed/Feed";
import { ProfileScreen } from "./User";
import { CreatePostScreen } from "./Create";
import { ExploreScreen } from "./Explore";

export const HomeScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    "feed" | "profile" | "create" | "explore"
  >("feed");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  return (
    <div className="HomeScreen">
      <div className="min-vh-100" style={{ backgroundColor: "#fafafa" }}>
        {/* <div className="d-lg-none bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
          <button
            className="btn btn-link p-0 border-0"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="h4 mb-0 fw-bold logo">MySocial</h1>
          <div style={{ width: "24px" }}></div>
        </div> */}

        {isDrawerOpen && (
          <div
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        <div className="w-100 d-flex">
          <aside
            className={`side-bar  position-fixed position-lg-relative top-0 bottom-0start-0 h-100 bg-white border-end sidebar-nav ${
              isDrawerOpen ? "show" : ""
            }`}
            style={{
              transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0 fw-bold logo">MySocial</h1>
                <button
                  className="btn btn-link p-0 border-0 d-lg-none"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <nav>
                <NavigationItem
                  icon={<Home size={24} />}
                  label="Feed"
                  isActive={currentScreen === "feed"}
                  onClick={() => {
                    setCurrentScreen("feed");
                    setIsDrawerOpen(false);
                  }}
                />
                <NavigationItem
                  icon={<Radar size={24} />}
                  label="Esplora"
                  isActive={currentScreen === "explore"}
                  onClick={() => {
                    setCurrentScreen("explore");
                    setIsDrawerOpen(false);
                  }}
                />
                <NavigationItem
                  icon={<PlusSquare size={24} />}
                  label="Nuovo Post"
                  isActive={currentScreen === "create"}
                  onClick={() => {
                    setCurrentScreen("create");
                    setIsDrawerOpen(false);
                  }}
                />
                <NavigationItem
                  icon={<User size={24} />}
                  label="Profilo"
                  isActive={currentScreen === "profile"}
                  onClick={() => {
                    setCurrentScreen("profile");
                    setIsDrawerOpen(false);
                  }}
                />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main
            className=" w-100"
            //   style={{ marginLeft: window.innerWidth >= 992 ? "256px" : "0" }}
          >
            {currentScreen === "feed" ? (
              <FeedScreen />
            ) : currentScreen === "profile" ? (
              <ProfileScreen />
            ) : currentScreen === "create" ? (
              <CreatePostScreen />
            ) : (
              <ExploreScreen />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
