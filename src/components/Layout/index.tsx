import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, Suspense } from "react";
// import "react-native-reanimated";
import { Drawer } from "expo-router/drawer";

import { isWeb } from "@utils/deviceInfo";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

import React from "react";
import { Alert } from "react-native";
import { Button, PaperProvider } from "react-native-paper";
import Login from "@components/Login";
import { useHookstate } from "@hookstate/core";
import appStore from "@store/index";
import initializeDatabase from "src/database/db";
import authApi from "@/src/apis/auth";
import { COLORS } from "@config";
import { clearAuth } from "@utils/common";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const appState = useHookstate(appStore);

  // checklogin
  const checkLoginMobile = async () => {
    const username = await AsyncStorage.getItem("username");
    const password = await AsyncStorage.getItem("password");

    if (username && password) {
      try {
        const data = await authApi.login({
          username: username as string,
          password: password as string,
        });
        AsyncStorage.setItem("accessToken", data.data.accessToken);
        return;
      } catch (error) { }
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
          appState.isLogin.set(true);
          appState.username.set(username);
        } else appState.isLogin.set(false);
      } catch (error) {
        appState.isLogin.set(false);
        Alert.alert("Thông báo", "Thất bại khi đăng nhập\n" + error, [
          { text: "OK" },
        ]);
      }
    } else {
      appState.isLogin.set(false);
    }
  };

  const checkLoginPC = async () => {
    try {
      const username = await localStorage.getItem("username");
      const password = await localStorage.getItem("password");

      const data = await authApi.login({
        username: username as string,
        password: password as string,
      });
      localStorage.setItem("accessToken", data.data.accessToken);
      appState.isLogin.set(true);
      appState.username.set(username as string);
    } catch (error) {
      appState.isLogin.set(false);
      console.error("Kiểm tra đăng nhập thất bại:", error);
    }
  };

  const changeToHomePage = () => {
    appState.isLogin.set(true);
  };

  const changeToLogin = () => {
    appState.isLogin.set(false);
  };

  const handleLogout = () => {
    appState.isLogin.set(false);
    appState.username.set("");
    clearAuth();
  };

  useEffect(() => {
    if (!isWeb) {
      initializeDatabase();
      checkLoginMobile();
    } else checkLoginPC();
  }, []);

  if (!appState.isLogin.get()) {
    return (
      <PaperProvider>
        <Login changeToHomePage={changeToHomePage} />
      </PaperProvider>
    );
  }

  return (
    <Suspense fallback={<Login changeToHomePage={changeToHomePage} />}>
      <PaperProvider>
        <Drawer>
          <Drawer.Screen
            name="index" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Trang chủ",
              headerRight: () => (
                <Button textColor={COLORS.BUTTON} onPress={handleLogout}>
                  Đăng xuất
                </Button>
              ),
              title: "Trang chủ",
              headerStyle: { backgroundColor: COLORS.PRIMARY },
              sceneContainerStyle: { backgroundColor: "white" },
              drawerStyle: { backgroundColor: "white" },
            }}
          />
          <Drawer.Screen
            name="task" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Nhiệm vụ",
              headerRight: () => (
                <Button textColor={COLORS.BUTTON} onPress={handleLogout}>
                  Đăng xuất
                </Button>
              ),
              title: "Quản lý nhiệm vụ",
              headerStyle: { backgroundColor: COLORS.PRIMARY },
              sceneContainerStyle: { backgroundColor: "white" },
              drawerStyle: { backgroundColor: "white" },
            }}
          />
          <Drawer.Screen
            name="object" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Đối tượng",
              headerRight: () => (
                <Button textColor={COLORS.BUTTON} onPress={handleLogout}>
                  Đăng xuất
                </Button>
              ),
              title: "Quản lý đối tượng",
              headerStyle: { backgroundColor: COLORS.PRIMARY },
              sceneContainerStyle: { backgroundColor: "white" },
              drawerStyle: { backgroundColor: "white" },
            }}
          />
          <Drawer.Screen
            name="user" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Thành viên",
              headerRight: () => (
                <Button textColor={COLORS.BUTTON} onPress={handleLogout}>
                  Đăng xuất
                </Button>
              ),
              title: "Quản lý thành viên",
            }}
          />
          <Drawer.Screen
            name="checklist" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: "Checklist",
              headerRight: () => (
                <Button textColor={COLORS.BUTTON} onPress={handleLogout}>
                  Đăng xuất
                </Button>
              ),
              title: "Quản lý Checklist",
              headerStyle: { backgroundColor: COLORS.PRIMARY },
              sceneContainerStyle: { backgroundColor: "white" },
              drawerStyle: { backgroundColor: "white" },
            }}
          />

          <Drawer.Screen
            name="login" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { display: "none" },
            }}
          />
          <Drawer.Screen
            name="camera" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { display: "none" },
            }}
          />
        </Drawer>
      </PaperProvider>
    </Suspense>
  );
}
