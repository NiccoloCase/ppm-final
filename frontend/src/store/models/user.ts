import { StateCreator } from "zustand";
import { jwtDecode } from "jwt-decode";
import { api } from "../../api";
import { MergedStoreModel } from "./types";
import { useStore } from "..";
import { isObject } from "formik";

export interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  profile_picture: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  created_at: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // New fields for followers/following functionality
  allUsers: User[];
  followers: User[];
  following: User[];
  isLoadingUsers: boolean;
  isLoadingFollowers: boolean;
  isLoadingFollowing: boolean;
  isFollowingUser: boolean;
  followError: string | null;
}

interface UserActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    password_confirm: string,
    username: string,
    bio: string
  ) => Promise<{
    success: boolean;
    usernameAlreadyExists?: boolean;
    emailAlreadyExists?: boolean;
  }>;
  refreshAccessToken: (refreshToken: string) => Promise<string>;
  editProfile: (
    username?: string,
    bio?: string,
    profile_picture?: File
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => Promise<void>;
  // New actions for followers/following functionality
  loadAllUsers: () => Promise<{ success: boolean; error?: string }>;
  loadFollowers: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  loadFollowing: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  followUser: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  unfollowUser: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  clearFollowError: () => void;
}

export type UserModel = UserState & UserActions;

const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken: any = jwtDecode(token);

    if (!decodedToken || typeof decodedToken.exp !== "number") return true;

    const expirationTimeInSeconds = decodedToken.exp;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    return expirationTimeInSeconds < currentTimeInSeconds;
  } catch (e) {
    console.error("Error checking token expiration:", e);
    return true;
  }
};

export const createUserStore: StateCreator<
  MergedStoreModel,
  [],
  [],
  UserModel
> = (set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  // New state initialization
  allUsers: [],
  followers: [],
  following: [],
  isLoadingUsers: false,
  isLoadingFollowers: false,
  isLoadingFollowing: false,
  isFollowingUser: false,
  followError: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.login(email, password);
      const { user, refresh, access } = response;

      set({
        user,
        token: access,
        refreshToken: refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      saveRefreshToken(refresh);

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
      return false;
    }
  },

  register: async (
    email: string,
    password: string,
    password_confirm: string,
    username: string,
    bio: string
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.register(
        email,
        password,
        password_confirm,
        username,
        bio
      );

      if (response.success === false) {
        const error = response.error;
        // Controlla se l'errore è un oggetto con proprietà specifiche
        if (isObject(error)) {
          if (
            "username" in error &&
            Array.isArray((error as any).username) &&
            (error as any).username.some((msg: string) =>
              msg.includes("exists")
            )
          ) {
            return { success: false, usernameAlreadyExists: true };
          } else if (
            "email" in error &&
            Array.isArray((error as any).email) &&
            (error as any).email.some((msg: string) => msg.includes("exists"))
          ) {
            alert("Email already exists");
            return { success: false, emailAlreadyExists: true };
          }
        }
        return { success: false };
      }

      const { user, access, refresh } = response.data;

      set({
        user,
        token: access,
        refreshToken: refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      saveRefreshToken(refresh);

      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: "Registration failed",
      });

      return { success: false };
    }
  },

  logout: async () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      // Clear all user-related data on logout
      allUsers: [],
      followers: [],
      following: [],
      followError: null,
    });
    saveRefreshToken("");
  },

  refreshAccessToken: async (refreshToken: string) => {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await api.refreshToken(refreshToken);
      const { access: newToken, refresh: newRefreshToken } = response;

      set({
        token: newToken,
        refreshToken: newRefreshToken || refreshToken,
      });

      saveRefreshToken(newRefreshToken || refreshToken);

      return newToken;
    } catch (error) {
      // If refresh fails, logout the user
      get().logout();
      throw error;
    }
  },

  editProfile: async (
    username?: string,
    bio?: string,
    profile_picture?: File
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.updateProfile(username, bio, profile_picture);

      if (response.success && response.data) {
        // Update the user in the store with the new data
        set((state) => ({
          user: {
            ...state.user,
            ...response.data,
          },
        }));

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Failed to update profile",
        };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  initAuth: async () => {
    // Controlla se e' già autenticato
    const { isAuthenticated, token } = get();

    set({ isLoading: true });

    if (isAuthenticated && token && !isTokenExpired(token)) {
      console.log("User is already authenticated and token is valid.");
      set({ isLoading: false });
      return;
    }

    // Prova a recuperare il refresh token dallo storage
    const storedRefreshToken = getRefreshToken();
    console.log("Stored refresh token:", storedRefreshToken);
    if (storedRefreshToken) {
      try {
        console.log(
          "Attempting to refresh access token with stored refresh token."
        );
        // Se il refresh token esiste, prova a rinfrescare il token di accesso
        const newToken = await get().refreshAccessToken(storedRefreshToken);

        console.log("New access token received:", newToken);

        if (newToken && !isTokenExpired(newToken)) {
          console.log("New access token is valid.");

          // Load the user profile after refreshing the token
          const response = await api.whoami();
          if (response.success) {
            const user = response.data as User;
            set({ user, isAuthenticated: true, isLoading: false, error: null });
          } else {
            console.error("Failed to load user profile after token refresh.");
            set({ error: "Failed to load user profile" });
          }
        } else {
          console.log("New access token is invalid or expired.");
          get().logout();
        }
      } catch (error) {
        console.error("Failed to refresh access token:", error);
        get().logout();
        set({ isLoading: false, error: "Failed to refresh access token" });
      }
    } else {
      get().logout();
      console.log("No refresh token found, user is not authenticated.");
      set({ isLoading: false, error: "No refresh token found" });
    }
  },

  // New actions implementation
  loadAllUsers: async (): Promise<{ success: boolean; error?: string }> => {
    set({ isLoadingUsers: true, followError: null });

    try {
      const response = await api.getAllUsers();

      if (response.success && response.data) {
        set({
          allUsers: response.data,
          isLoadingUsers: false,
        });
        return { success: true };
      } else {
        set({
          isLoadingUsers: false,
          followError: response.error || "Failed to load users",
        });
        return {
          success: false,
          error: response.error || "Failed to load users",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load users";
      set({
        isLoadingUsers: false,
        followError: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  loadFollowers: async (
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    const meId = get().user?.id;
    if (!meId)
      return {
        success: false,
        error: "Client not logged in",
      };

    set({ isLoadingFollowers: true, followError: null });

    try {
      const response = await api.getFollowers(username, meId);

      if (response.success && response.data) {
        set({
          followers: response.data,
          isLoadingFollowers: false,
        });
        return { success: true };
      } else {
        set({
          isLoadingFollowers: false,
          followError: response.error || "Failed to load followers",
        });
        return {
          success: false,
          error: response.error || "Failed to load followers",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load followers";
      set({
        isLoadingFollowers: false,
        followError: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  loadFollowing: async (
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    const meId = get().user?.id;

    if (!meId)
      return {
        success: false,
        error: "Client not logged in",
      };

    set({ isLoadingFollowing: true, followError: null });

    try {
      const response = await api.getFollowing(username, meId);

      if (response.success && response.data) {
        set({
          following: response.data,
          isLoadingFollowing: false,
        });
        return { success: true };
      } else {
        set({
          isLoadingFollowing: false,
          followError: response.error || "Failed to load following",
        });
        return {
          success: false,
          error: response.error || "Failed to load following",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load following";
      set({
        isLoadingFollowing: false,
        followError: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  followUser: async (
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    set({ isFollowingUser: true, followError: null });

    try {
      const response = await api.followUser(username);

      if (response.success && response.data) {
        const { user: updatedUser, followed } = response.data;

        set((state) => {
          const updatedFollowing = state.following.some(
            (following) => following.username === username
          )
            ? state.following
            : followed
            ? [...state.following, followed]
            : state.following;

          return {
            allUsers: state.allUsers.map((user) =>
              user.username === username
                ? {
                    ...user,
                    is_following: true,
                    followers_count: updatedUser.followers_count,
                  }
                : user
            ),
            user: state.user
              ? {
                  ...state.user,
                  following_count: state.user.following_count + 1,
                }
              : state.user,
            following: updatedFollowing,
            isFollowingUser: false,
          };
        });

        return { success: true };
      } else {
        set({
          isFollowingUser: false,
          followError: response.error || "Failed to follow user",
        });
        return {
          success: false,
          error: response.error || "Failed to follow user",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to follow user";
      set({
        isFollowingUser: false,
        followError: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  unfollowUser: async (
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    set({ isFollowingUser: true, followError: null });

    try {
      const response = await api.unfollowUser(username);

      if (response.success && response.data) {
        const { user: updatedUser } = response.data;

        set((state) => {
          const updatedFollowing = state.following.filter(
            (following) => following.username !== username
          );

          return {
            allUsers: state.allUsers.map((user) =>
              user.username === username
                ? {
                    ...user,
                    is_following: false,
                    followers_count: updatedUser.followers_count,
                  }
                : user
            ),
            user: state.user
              ? {
                  ...state.user,
                  following_count: Math.max(0, state.user.following_count - 1),
                }
              : state.user,
            following: updatedFollowing,
            isFollowingUser: false,
          };
        });

        return { success: true };
      } else {
        set({
          isFollowingUser: false,
          followError: response.error || "Failed to unfollow user",
        });
        return {
          success: false,
          error: response.error || "Failed to unfollow user",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unfollow user";
      set({
        isFollowingUser: false,
        followError: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  clearFollowError: () => set({ followError: null }),
});

export const setupAxiosInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const { token } = useStore.getState();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshAccessToken, refreshToken } = useStore.getState();
          if (!refreshToken) throw new Error("No refresh token available");

          const newToken = await refreshAccessToken(refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          const { logout } = useStore.getState();
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export const useAuthGuard = () => {
  const { isAuthenticated, token } = useStore();

  const isAuthorized = () => {
    if (!isAuthenticated || !token) return false;
    return !isTokenExpired(token);
  };

  return { isAuthorized };
};

/**
 * Salva il refresh token nello storage.
 * @param refreshToken
 */
export const saveRefreshToken = (refreshToken: string) => {
  console.log("Saving refresh token:", refreshToken);
  localStorage.setItem("refreshToken", refreshToken);
};

/**
 * Recupera il refresh token dallo storage.
 * @returns Il refresh token o null se non esiste.
 */
export const getRefreshToken = (): string | null => {
  const refreshToken = localStorage.getItem("refreshToken");
  return refreshToken ? refreshToken : null;
};
