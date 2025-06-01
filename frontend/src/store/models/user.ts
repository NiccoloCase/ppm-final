import { StateCreator } from "zustand";
import { jwtDecode } from "jwt-decode";
import { api } from "../../api";
import { MergedStoreModel } from "./types";
import { useStore } from "..";
import { isObject } from "formik";
import { ref } from "joi";

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
  clearError: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => Promise<void>;
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
