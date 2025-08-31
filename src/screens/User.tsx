import React, { useContext } from "react";
import { View, Linking, ScrollView, Pressable } from "react-native";
import { MainStackParamList } from "../types/navigation";
// import { getAuth, signOut } from "firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getAuth } from '../utils/store'

import {
  Layout,
  Button,
  Text,
  TopNav,
  Section,
  SectionContent,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import HomePage from "@components/Home";
import UserPage from "@components/User";
import { Menu } from "native-base";
import { AuthContext } from "../provider/AuthProvider";
import { asyncAllData } from "@utils/common";
import { isWeb } from "@utils/deviceInfo";

export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, "MainTabs">) {
  const { isDarkmode, setTheme } = useTheme();
  const { signOut, isConnected, username } = useContext(AuthContext)
  return (
    <Layout>
      <TopNav
        middleContent="Người dùng"
        leftContent={
          <Ionicons
            name={isDarkmode ? "sunny" : "moon"}
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        leftAction={() => {
          if (isDarkmode) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
        }}

        rightContent={
          <Menu shadow={2} w="190" trigger={triggerProps => {
            return <Pressable accessibilityLabel="More options menu" {...triggerProps}>
              <Ionicons
                name={"menu"}
                size={20}
                color={isDarkmode ? themeColor.white100 : themeColor.dark}
              />
            </Pressable>;
          }}>
            <Menu.Item>{username}</Menu.Item>
            {!isWeb && isConnected && <Menu.Item onPress={() => asyncAllData()} >Đồng bộ WEB</Menu.Item>}
            <Menu.Item onPress={() => { signOut() }}>Đăng xuất</Menu.Item>
          </Menu>
        }
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <UserPage />
      </ScrollView>
    </Layout>
  );
}
