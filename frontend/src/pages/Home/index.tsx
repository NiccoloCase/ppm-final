import React, { useState } from "react";
import { Home, PlusSquare, User, Menu, X, Radar } from "lucide-react";
import "./Home.scss";
import { FeedScreen } from "./Feed/Feed";
import { Post } from "../../components/Post";
import { ProfileScreen } from "./User";
import { CreatePostScreen } from "./Create";
import { ExploreScreen } from "./Explore";

export const HomeScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    "feed" | "profile" | "create" | "explore"
  >("feed");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      username: "photographer_jane",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
      caption: "Golden hour magic ✨ #photography #sunset",
      likes: 234,
      comments: [
        {
          id: "c1",
          username: "jane_smith",
          text: "Looks amazing!",
          timestamp: "2h",
        },
        {
          id: "c2",
          username: "travel_bug",
          text: "Where is this?",
          timestamp: "1h",
        },
      ],
      timestamp: "2 hours ago",
      isLiked: false,
    },
    {
      id: "2",
      username: "foodie_mike",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=600&fit=crop",
      caption: "Homemade pizza night! 🍕 Recipe in bio",
      likes: 189,
      comments: [
        {
          id: "c1",
          username: "jane_smith",
          text: "Looks amazing!",
          timestamp: "2h",
        },
        {
          id: "c2",
          username: "travel_bug",
          text: "Where is this?",
          timestamp: "1h",
        },
      ],
      timestamp: "4 hours ago",
      isLiked: true,
    },
    {
      id: "3",
      username: "travel_sarah",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      image:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&h=600&fit=crop",
      caption: "Lost in the mountains 🏔️ #wanderlust #nature",
      likes: 456,
      comments: [
        {
          id: "c1",
          username: "jane_smith",
          text: "Looks amazing!",
          timestamp: "2h",
        },
        {
          id: "c2",
          username: "travel_bug",
          text: "Where is this?",
          timestamp: "1h",
        },
      ],
      timestamp: "1 day ago",
      isLiked: false,
    },
  ]);

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
        {/* Mobile Header */}
        <div className="d-lg-none bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center">
          <button
            className="btn btn-link p-0 border-0"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="h4 mb-0 fw-bold logo">MySocial</h1>
          <div style={{ width: "24px" }}></div>
        </div>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        <div className="d-flex">
          {/* Sidebar */}
          <aside
            className={`side-bar  position-fixed position-lg-relative top-0 bottom-0start-0 h-100 bg-white border-end sidebar-nav ${
              isDrawerOpen ? "show" : ""
            }`}
            style={{
              transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="p-4">
              {/* Logo */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0 fw-bold logo">MySocial</h1>
                <button
                  className="btn btn-link p-0 border-0 d-lg-none"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation */}
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
            className="flex-grow-1"
            //   style={{ marginLeft: window.innerWidth >= 992 ? "256px" : "0" }}
          >
            {currentScreen === "feed" ? (
              <FeedScreen posts={posts} />
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
