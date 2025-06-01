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
});
