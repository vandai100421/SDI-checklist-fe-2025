import AsyncStorage from "@react-native-async-storage/async-storage";
import { isWeb } from "@utils/deviceInfo";
import axios from "axios";
import qs from "qs";

const DEFAULT_IP = "http://172.20.10.3:3001/api";

// Create a function to get the access token from localStorage
const getAccessToken = async () => {
  if (isWeb) {
    return localStorage.getItem("accessToken");
  }
  return JSON.stringify(await AsyncStorage.getItem("accessToken")).replace(
    /"/g,
    ""
  );
};

// Lấy baseURL từ AsyncStorage hoặc localStorage
const getBaseURL = async () => {
  if (isWeb) {
    return "http://localhost:3001/api"; // Nếu không có, sử dụng default IP
  }
  return (await AsyncStorage.getItem("baseURL")) || DEFAULT_IP; // Nếu không có, sử dụng default IP
};

export const request = axios.create({
  baseURL: DEFAULT_IP,

  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => qs.stringify(params),
});

request.interceptors.request.use(
  async (config: any) => {
    const baseURL = await getBaseURL(); // Lấy baseURL từ AsyncStorage/localStorage
    config.baseURL = baseURL; // Cập nhật baseURL của axios

    // Get the access token before each request
    let accessToken = await getAccessToken();

    // If access token is available, add it to the Authorization header
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);
