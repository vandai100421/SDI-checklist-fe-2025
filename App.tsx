import React from "react";
import 'react-native-get-random-values';
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/provider/AuthProvider";
import { ThemeProvider, useTheme } from "react-native-rapi-ui";
import { LogBox } from "react-native";
import GlobalLoading, { globalLoadingRef } from "@components/Lib/GlobalLoading";
import GlobalMessage, { globalMessageRef } from "@components/Lib/GlobalMessage";
import { NativeBaseProvider, extendTheme } from "native-base";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider, MD2DarkTheme } from "react-native-paper";
import { DarkTheme } from "@react-navigation/native";

export default function App() {
  const images = [
    require("./assets/images/login.png"),
    require("./assets/images/register.png"),
    require("./assets/images/forget.png"),
  ];

  // Ignore firebase v9 AsyncStorage warning
  React.useEffect(() => {
    LogBox.ignoreLogs([
      "AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage",
    ]);
  }, []);

  const { isDarkmode, setTheme } = useTheme();
  LogBox.ignoreAllLogs();

  return (
    <ThemeProvider images={images}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NativeBaseProvider>
          <PaperProvider theme={
            DefaultTheme
          }>
            <AuthProvider>
              <Navigation />
              <GlobalLoading ref={globalLoadingRef} />
              <GlobalMessage ref={globalMessageRef} />
            </AuthProvider>
          </PaperProvider>
        </NativeBaseProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
