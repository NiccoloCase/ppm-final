import { StateCreator } from "zustand";
import { api } from "../../api";
import { MergedStoreModel } from "./types";
import { User } from "./user";

export interface Post {
  id: number;
  author: User;
  content: string;
  image: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

interface PostState {
  feed: Post[];
  userPosts: Post[];
}

interface PostActions {
  createPost: (
    content: string,
    image: File
  ) => Promise<{ success: boolean; error?: string }>;
  likePost: (postId: number) => Promise<{ success: boolean }>;
  unlikePost: (postId: number) => Promise<{ success: boolean }>;
  deletePost: (postId: number) => Promise<{ success: boolean; error?: string }>;
  fetchFeed: () => Promise<void>;
}

export type PostModel = PostState & PostActions;

export const createPostStore: StateCreator<
  MergedStoreModel,
  [],
  [],
  PostModel
> = (set, get) => ({
  feed: [],
  userPosts: [],

  createPost: async (content, image) => {
    try {
      const response = await api.createPost(content, image);
      if (response.success) {
        set((state) => ({
          userPosts: [...state.userPosts, response.data],
          feed: [...state.feed, response.data],
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  fetchFeed: async () => {
    try {
      const response = await api.getFeed();
      if (response.success) {
        set({ feed: response.data });
      } else {
        console.error("Error fetching feed:", response.error);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  },

  likePost: async (postId) => {
    try {
      const response = await api.likePost(postId);
      if (response.success) {
        set((state) => ({
          feed: state.feed.map((post) =>
            post.id === postId
              ? { ...post, is_liked: true, likes_count: post.likes_count + 1 }
              : post
          ),
          userPosts: state.userPosts.map((post) =>
            post.id === postId
              ? { ...post, is_liked: true, likes_count: post.likes_count + 1 }
              : post
          ),
        }));
      }
      return { success: response.success };
    } catch (error) {
      console.error("Error liking post:", error);
      return { success: false };
    }
  },

  unlikePost: async (postId) => {
    try {
      const response = await api.unlikePost(postId);
      if (response.success) {
        set((state) => ({
          feed: state.feed.map((post) =>
            post.id === postId
              ? { ...post, is_liked: false, likes_count: post.likes_count - 1 }
              : post
          ),
          userPosts: state.userPosts.map((post) =>
            post.id === postId
              ? { ...post, is_liked: false, likes_count: post.likes_count - 1 }
              : post
          ),
        }));
      }
      return { success: response.success };
    } catch (error) {
      console.error("Error unliking post:", error);
      return { success: false };
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.deletePost(postId);
      if (response.success) {
        // Remove the post from both feed and userPosts arrays
        set((state) => ({
          feed: state.feed.filter((post) => post.id !== postId),
          userPosts: state.userPosts.filter((post) => post.id !== postId),
        }));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Failed to delete post",
        };
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
