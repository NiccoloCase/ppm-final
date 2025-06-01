import axios from "axios";

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

export const api = {
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
};

export { axiosInstance };
