import axios from "axios";
import { User } from "../store/models/user";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface APIResponse {
  success: boolean;
  error?: any;
  data?: any;
}

export interface FollowResponse {
  message: string;
  user: User;
  followed: boolean;
}

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/login/", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || "Login failed");
      }
      throw new Error("Login failed");
    }
  },

  register: async (
    email: string,
    password: string,
    password_confirm: string,
    username: string,
    bio: string
  ): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post("/auth/register/", {
        username,
        email,
        password,
        password_confirm,
        bio,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          error: error.response.data,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : error,
      };
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await axiosInstance.post("/auth/token/refresh/", {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || "Token refresh failed");
      }
      throw new Error("Token refresh failed");
    }
  },

  whoami: async (): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get("/auth/profile/");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user profile",
      };
    }
  },

  updateProfile: async (
    username?: string,
    bio?: string,
    profile_picture?: File
  ): Promise<APIResponse> => {
    try {
      const formData = new FormData();
      if (username) formData.append("username", username);
      if (bio) formData.append("bio", bio);
      if (profile_picture) formData.append("profile_picture", profile_picture);

      const response = await axiosInstance.patch("/auth/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  getUserProfile: async (username: string): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/auth/users/${username}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user profile",
      };
    }
  },

  followUser: async (username: string): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(`/auth/follow/${username}/`);
      return {
        success: true,
        data: response.data as FollowResponse,
      };
    } catch (error) {
      console.error("Error following user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to follow user",
      };
    }
  },

  unfollowUser: async (username: string): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(`/auth/unfollow/${username}/`);
      return {
        success: true,
        data: response.data as FollowResponse,
      };
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to unfollow user",
      };
    }
  },

  getFollowers: async (
    username: string,
    meId: number
  ): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(
        `/auth/users/${username}/followers/`
      );

      let data: { follower: User; following: User }[] = Array.isArray(
        response?.data
      )
        ? response?.data
        : [];
      let users = data.map((x) =>
        x.follower.id === meId ? x.following : x.follower
      );

      return { success: true, data: users };
    } catch (error) {
      console.error("Error fetching followers:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch followers",
      };
    }
  },

  getFollowing: async (
    username: string,
    meId: number
  ): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(
        `/auth/users/${username}/following/`
      );

      let data: { following: User; follower: User }[] = Array.isArray(
        response?.data
      )
        ? response?.data
        : [];

      let users = data.map((x) =>
        x.follower.id === meId ? x.following : x.follower
      );

      return { success: true, data: users };
    } catch (error) {
      console.error("Error fetching following:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch following",
      };
    }
  },

  getAllUsers: async (): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get("/auth/users/");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching all users:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch all users",
      };
    }
  },

  // Posts endpoints
  getFeed: async (): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/posts/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching feed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch feed",
      };
    }
  },

  createPost: async (content: string, image?: File): Promise<APIResponse> => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const response = await axiosInstance.post("/posts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create post",
      };
    }
  },

  getPost: async (id: number): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/posts/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch post",
      };
    }
  },

  updatePost: async (
    id: number,
    content: string,
    image?: File
  ): Promise<APIResponse> => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const response = await axiosInstance.patch(`/posts/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update post",
      };
    }
  },

  deletePost: async (id: number): Promise<APIResponse> => {
    try {
      await axiosInstance.delete(`/posts/${id}/`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete post",
      };
    }
  },

  getUserPosts: async (username: string): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/posts/users/${username}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch user posts",
      };
    }
  },

  likePost: async (postId: number): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/like/`);
      return { success: response.status === 200 };
    } catch (error) {
      console.error("Error liking post:", error);
      return {
        success: false,
      };
    }
  },

  unlikePost: async (postId: number): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/unlike/`);
      return { success: response.status === 200 };
    } catch (error) {
      console.error("Error unliking post:", error);
      return {
        success: false,
      };
    }
  },

  getPostLikes: async (postId: number): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}/likes/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching post likes:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch post likes",
      };
    }
  },

  // Comments endpoints
  getPostComments: async (postId: number): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}/comments/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch comments",
      };
    }
  },

  createComment: async (
    postId: number,
    content: string
  ): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments/`, {
        content,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create comment",
      };
    }
  },

  getComment: async (id: number): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get(`/posts/comments/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch comment",
      };
    }
  },

  updateComment: async (id: number, content: string): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.patch(`/posts/comments/${id}/`, {
        content,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update comment",
      };
    }
  },

  deleteComment: async (id: number): Promise<APIResponse> => {
    try {
      await axiosInstance.delete(`/posts/comments/${id}/`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete comment",
      };
    }
  },

  getNotifications: async (): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.get("/notifications/");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
      };
    }
  },

  markNotificationAsRead: async (
    notificationId: number
  ): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(
        `/notifications/${notificationId}/read/`
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
      };
    }
  },

  markAllNotificationsAsRead: async (): Promise<APIResponse> => {
    try {
      const response = await axiosInstance.post(
        "/notifications/mark-all-read/"
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark all notifications as read",
      };
    }
  },
};

export { axiosInstance };
