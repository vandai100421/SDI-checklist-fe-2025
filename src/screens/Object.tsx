import React from "react";
import { ScrollView, View } from "react-native";
import { MainStackParamList } from "../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  TopNav,
  Text,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Object from "@components/Object";

export default function ({
  navigation, route
}: NativeStackScreenProps<MainStackParamList, "DetailChecklist">) {
  const { isDarkmode, setTheme } = useTheme();

  const { groupObjectID = 0 } = route.params || {};

  return (
    <Layout>
      <TopNav
        middleContent="Chi tiết nhóm đôi tượng"
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        leftAction={() => navigation.goBack()}
        rightContent={
          <Ionicons
            name={isDarkmode ? "sunny" : "moon"}
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        rightAction={() => {
          if (isDarkmode) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
        }}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <Object id={groupObjectID} />
      </ScrollView>
    </Layout>
  );
}
