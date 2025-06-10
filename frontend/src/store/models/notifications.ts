import { StateCreator } from "zustand";
import { api } from "../../api";
import { MergedStoreModel } from "./types";

export interface Notification {
  id: number;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    username: string;
    profile_picture: string | null;
    bio?: string;
    email?: string;
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
  };
  related_post?: number | null;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;
}

interface NotificationActions {
  loadNotifications: () => Promise<{ success: boolean; error?: string }>;
  markAsRead: (
    notificationId: number
  ) => Promise<{ success: boolean; error?: string }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: number) => void;
  updateNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

export type NotificationModel = NotificationState & NotificationActions;

export const createNotificationStore: StateCreator<
  MergedStoreModel,
  [],
  [],
  NotificationModel
> = (set, get) => ({
  // State initialization
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isMarkingAsRead: false,
  isMarkingAllAsRead: false,

  // Actions implementation
  loadNotifications: async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getNotifications();

      if (response.success && response.data) {
        const notifications = Array.isArray(response.data) ? response.data : [];
        const unreadCount = notifications.filter(
          (n: Notification) => !n.is_read
        ).length;

        set({
          notifications,
          unreadCount,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        set({
          isLoading: false,
          error: response.error || "Failed to load notifications",
        });
        return {
          success: false,
          error: response.error || "Failed to load notifications",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load notifications";
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  markAsRead: async (
    notificationId: number
  ): Promise<{ success: boolean; error?: string }> => {
    set({ isMarkingAsRead: true, error: null });

    try {
      const response = await api.markNotificationAsRead(notificationId);

      if (response.success) {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          );

          const unreadCount = updatedNotifications.filter(
            (n) => !n.is_read
          ).length;

          return {
            notifications: updatedNotifications,
            unreadCount,
            isMarkingAsRead: false,
            error: null,
          };
        });

        return { success: true };
      } else {
        set({
          isMarkingAsRead: false,
          error: response.error || "Failed to mark notification as read",
        });
        return {
          success: false,
          error: response.error || "Failed to mark notification as read",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read";
      set({
        isMarkingAsRead: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean; error?: string }> => {
    set({ isMarkingAllAsRead: true, error: null });

    try {
      const response = await api.markAllNotificationsAsRead();

      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            is_read: true,
          })),
          unreadCount: 0,
          isMarkingAllAsRead: false,
          error: null,
        }));

        return { success: true };
      } else {
        set({
          isMarkingAllAsRead: false,
          error: response.error || "Failed to mark all notifications as read",
        });
        return {
          success: false,
          error: response.error || "Failed to mark all notifications as read",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read";
      set({
        isMarkingAllAsRead: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  addNotification: (notification: Notification) => {
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter((n) => !n.is_read).length;

      return {
        notifications: newNotifications,
        unreadCount,
      };
    });
  },

  removeNotification: (notificationId: number) => {
    set((state) => {
      const filteredNotifications = state.notifications.filter(
        (n) => n.id !== notificationId
      );
      const unreadCount = filteredNotifications.filter(
        (n) => !n.is_read
      ).length;

      return {
        notifications: filteredNotifications,
        unreadCount,
      };
    });
  },

  updateNotification: (updatedNotification: Notification) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === updatedNotification.id
          ? updatedNotification
          : notification
      );
      const unreadCount = updatedNotifications.filter((n) => !n.is_read).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      error: null,
    });
  },
});
