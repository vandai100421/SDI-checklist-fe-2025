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
import TaskObjectDetail from "@components/TaskObjectDetail";

export default function ({
  navigation, route
}: NativeStackScreenProps<MainStackParamList, "TaskObjectDetail">) {
  const { isDarkmode, setTheme } = useTheme();

  const { taskDetailId = 0, taskID = 0 } = route.params || {};

  return (
    <Layout>
      <TopNav
        middleContent="Chi tiết đối tượng nhiệm vụ"
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
        <TaskObjectDetail object_task_id={taskDetailId} id={taskID} />
      </ScrollView>
    </Layout>
  );
}
