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
import TaskDetail from "@components/TaskDetail";

export default function ({
  navigation, route
}: NativeStackScreenProps<MainStackParamList, "TaskDetail">) {
  const { isDarkmode, setTheme } = useTheme();

  const { taskID = 0 } = route.params || {};


  const routeToDetail = (taskDetailId: number) => {
    navigation.navigate("TaskObjectDetail", { taskID, taskDetailId })
  }

  return (
    <Layout>
      <TopNav
        middleContent="Chi tiết nhiệm vụ"
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
        <TaskDetail id={taskID} routeToDetail={routeToDetail} />
      </ScrollView>
    </Layout>
  );
}
