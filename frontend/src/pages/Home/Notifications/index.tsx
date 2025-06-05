import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../../store";
import { getProfilePicture } from "../../../utils";
import { palette } from "../../../config";

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isMarkingAllAsRead,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    clearError,
  } = useStore();

  const [loadingNotificationId, setLoadingNotificationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    setLoadingNotificationId(notificationId);
    const result = await markAsRead(notificationId);
    setLoadingNotificationId(null);

    if (!result.success) {
      console.error("Failed to mark notification as read:", result.error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();

    if (!result.success) {
      console.error("Failed to mark all notifications as read:", result.error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return "👤";
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "mention":
        return "📢";
      default:
        return "🔔";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "ora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}g`;
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-vh-100" style={{ paddingTop: "2rem" }}>
        <div className="row justify-content-center">
          <div className="col-11">
            <section
              className="card border-0 mb-3"
              style={{ backgroundColor: "transparent", boxShadow: "none" }}
            >
              <div className="card-body p-3">
                <h1 className="h5 mb-0 fw-bold text-center">Notifiche</h1>
              </div>
            </section>
            <div className="text-center py-5">
              <div
                className="spinner-border "
                role="status"
                style={{ color: palette.primary }}
              >
                <span className="visually-hidden">Caricamento...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ paddingTop: "2rem" }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <section
            className="card border-0 mb-3"
            style={{ backgroundColor: "transparent", boxShadow: "none" }}
          >
            <div className="card-body p-3">
              {/* Option 1: Always center the title */}
              <div className="text-center position-relative">
                <h1 className="h5 mb-0 fw-bold">Notifiche</h1>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-outline-primary position-absolute"
                    style={{
                      right: "0",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllAsRead}
                  >
                    {isMarkingAllAsRead ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : null}
                    Segna tutte come lette
                  </button>
                )}
              </div>

              {/* Alternative Option 2: Keep the flex layout but center when no button */}
              {/* 
              <div className={`d-flex ${unreadCount > 0 ? 'justify-content-between' : 'justify-content-center'} align-items-center`}>
                <h1 className="h5 mb-0 fw-bold">Notifiche</h1>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllAsRead}
                  >
                    {isMarkingAllAsRead ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : null}
                    Segna tutte come lette
                  </button>
                )}
              </div>
              */}

              {unreadCount > 0 && (
                <div className="text-center">
                  <small className="text-muted">
                    {unreadCount} notifica{unreadCount !== 1 ? "e" : ""} non
                    lett
                    {unreadCount !== 1 ? "e" : "a"}
                  </small>
                </div>
              )}
            </div>
          </section>

          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={clearError}
              >
                ✕
              </button>
            </div>
          )}

          {/* Notifiche */}
          {notifications.length === 0 && !isLoading ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  🔔
                </div>
                <h5 className="text-muted">Nessuna notifica</h5>
                <p className="text-muted mb-0">
                  Le tue notifiche appariranno qui
                </p>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="list-group list-group-flush">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`list-group-item list-group-item-action border-0 ${
                      !notification.is_read ? "bg-light" : ""
                    }`}
                    style={{
                      cursor: notification.is_read ? "default" : "pointer",
                    }}
                    onClick={() =>
                      !notification.is_read && handleMarkAsRead(notification.id)
                    }
                  >
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        {notification.sender ? (
                          <Link
                            to={`/profile/${notification.sender.username}`}
                            className="text-decoration-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={getProfilePicture(
                                notification.sender as any
                              )}
                              alt={notification.sender.username}
                              className="rounded-circle"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                          </Link>
                        ) : (
                          <div
                            className="rounded-circle  d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: "40px",
                              height: "40px",
                              fontSize: "1.2rem",
                              background: palette.primary,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1 text-dark">
                              {notification.sender && (
                                <Link
                                  to={`/profile/${notification.sender.username}`}
                                  className="fw-semibold text-decoration-none text-dark"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {notification.sender.username}
                                </Link>
                              )}{" "}
                              {notification.message}
                            </p>

                            {notification.post && (
                              <Link
                                to={`/post/${notification.post.id}`}
                                className="text-muted text-decoration-none small"
                                onClick={(e) => e.stopPropagation()}
                              >
                                "{notification.post.content.slice(0, 50)}
                                {notification.post.content.length > 50
                                  ? "..."
                                  : ""}
                                "
                              </Link>
                            )}

                            {notification.comment && (
                              <p className="text-muted small mb-0">
                                "{notification.comment.content.slice(0, 50)}
                                {notification.comment.content.length > 50
                                  ? "..."
                                  : ""}
                                "
                              </p>
                            )}
                          </div>

                          <div className="d-flex align-items-center">
                            <small className="text-muted me-2">
                              {getTimeAgo(notification.created_at)}
                            </small>

                            {!notification.is_read && (
                              <div className="d-flex align-items-center">
                                {loadingNotificationId === notification.id ? (
                                  <div
                                    className="spinner-border spinner-border-sm"
                                    style={{
                                      width: "12px",
                                      height: "12px",
                                      color: palette.primary,
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle"
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      background: palette.primary,
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && notifications.length > 0 && (
            <div className="text-center py-3">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                style={{ color: palette.primary }}
              >
                <span className="visually-hidden">Caricamento...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
