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
import ChecklistDetail from "@components/ChecklistDetail";

export default function ({
  navigation, route
}: NativeStackScreenProps<MainStackParamList, "DetailChecklist">) {
  const { isDarkmode, setTheme } = useTheme();

  const { checklistID = 0 } = route.params || {};

  return (
    <Layout>
      <TopNav
        middleContent="Chi tiết checklist"
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
        <ChecklistDetail id={checklistID} />
      </ScrollView>
    </Layout>
  );
}
