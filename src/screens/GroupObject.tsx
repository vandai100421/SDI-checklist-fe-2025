import React, { useContext } from "react";
import { ScrollView, Pressable } from "react-native";
import { MainStackParamList } from "../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  Layout,
  TopNav,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { Menu } from "native-base";
import { AuthContext } from "../provider/AuthProvider";
import GroupObject from "@components/GroupObject";
import { asyncAllData } from "@utils/common";
import { isWeb } from "@utils/deviceInfo";

export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, "MainTabs">) {
  const { isDarkmode, setTheme } = useTheme();
  const { signOut, isConnected, username } = useContext(AuthContext)

  const routeToDetail = (groupObjectID: number) => {
    navigation.navigate("DetailGroupObject", { groupObjectID } as any)
  }

  return (
    <Layout>
      <TopNav
        middleContent="Nhóm đối tượng"
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
        <GroupObject routeToDetail={routeToDetail} />
      </ScrollView>
    </Layout>
  );
}
