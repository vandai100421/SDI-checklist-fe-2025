import React, { createContext, useState, useEffect } from "react";
import { getAuth } from "../utils/store";
import { isWeb } from "../utils/deviceInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authApi from "../apis/auth";
import { Alert } from "react-native";
import { globalMessage } from "@components/Lib/GlobalMessage";
import * as SQLite from "expo-sqlite";
import NetInfo from "@react-native-community/netinfo";
import initializeDatabase from "../database/db";
import { checkHealth } from "../components/Home/store";
import axios from "axios";
import { clearAuth } from "@utils/common";

type ContextProps = {
  user: null | boolean;
  username: null | string;
  isAdmin: boolean;
  isConnected: boolean;
  signOut: () => void;
  signIn: () => void;
  checkLogin: () => void;
  checkOnline: () => void;
  checkIsAdmin: () => void;
  setIsConnected: (value: boolean) => void;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [user, setUser] = useState<null | boolean>(null);
  const [username, setUsername] = useState<null | string>(null);
  const [isConnected, setIsConnected] = useState<any>(true);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!isWeb) initializeDatabase();
    checkLogin();
  }, [user]);
  // const getUsername = async () => {
  //   let username
  //   if (!isWeb) username = await AsyncStorage.getItem("username");
  //   else username = await localStorage.getItem("username");
  //   setUsername(username)
  // }

  const checkIsAdmin = async () => {
    let username;
    if (!isWeb) username = await AsyncStorage.getItem("username");
    else username = await localStorage.getItem("username");
    if (username === "admin") setIsAdmin(true);
    else setIsAdmin(false);
  };
  async function checkLogin() {
    if (!isWeb) {
      const username = await AsyncStorage.getItem("username");
      const password = await AsyncStorage.getItem("password");
      setUsername(username)
      if (username && password) {
        try {
          const data = await authApi.login({
            username: username as string,
            password: password as string,
          });
          setUser(true);
          AsyncStorage.setItem("accessToken", data.data.accessToken);
          return;
        } catch (error: any) {
          if (error.status === 401) {
            signOut();
            globalMessage.show(
              "Thông báo",
              "Bạn cần đăng nhập để sử dụng app.\n" + error
            );
            return;
          }
        }

        const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
          useNewConnection: true,
        });
        const login = await db.prepareAsync(
          "select * from user where username = $username and password = $password;"
        );

        try {
          const result = await login.executeAsync({
            $username: username,
            $password: password,
          });
          const firstRow = await result.getFirstAsync();

          if (firstRow) {
            setUser(true);
          } else setUser(false);
        } catch (error) {
          setUser(false);
          globalMessage.show(
            "Thông báo",
            "Bạn cần đăng nhập để sử dụng app.\n" + error
          );
        }
      } else {
        setUser(false);
        globalMessage.show("Thông báo", "Bạn cần đăng nhập để sử dụng app."); // Alert on sign-in
      }
    } else {
      try {
        const username = await localStorage.getItem("username");
        const password = await localStorage.getItem("password");
        setUsername(username)
        const data = await authApi.login({
          username: username as string,
          password: password as string,
        });
        setUser(true);
        localStorage.setItem("accessToken", data.data.accessToken);
      } catch (error: any) {
        setUser(false);
        if (error.code === "ERR_NETWORK") {
          globalMessage.show(
            "Thông báo",
            "Bạn cần phải sử dụng đúng mạng nội bộ yêu cầu."
          );
        } else
          globalMessage.show("Thông báo", "Bạn cần đăng nhập để sử dụng app.");
      }
    }
  }

  // Custom signOut function to set user to logged out
  const signOut = () => {
    console.log("Signing out...");
    setUser(false); // Update state to reflect logged-out status
    clearAuth();
  };

  const signIn = () => {
    console.log("Logging in...");
    setUser(true); // Update state to reflect logged-out status
  };

  const checkOnline = async () => {
    if (!isWeb) {
      try {
        const data = await authApi.checkHealth();
        return;
      } catch (error: any) {
        if (error.code === "ERR_NETWORK") {
          globalMessage.show(
            "Thông báo",
            "Bạn cần phải sử dụng đúng mạng nội bộ yêu cầu."
          );
        }
        // signOut();
      }
    }
  };

  // useEffect(() => {
  //   checkOnline();
  // }, []);
  // checkOnline();
  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        isAdmin,
        isConnected,
        signOut,
        signIn,
        checkLogin,
        checkOnline,
        checkIsAdmin,
        setIsConnected,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
