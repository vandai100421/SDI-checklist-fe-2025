import React from "react";
import { View, Linking, ScrollView } from "react-native";
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
import InfoUser from "@components/User/subcomponents/InfoUser";

export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, "Profile">) {
  const { isDarkmode, setTheme } = useTheme();
  const auth = getAuth();
  return (
    <Layout>
      <TopNav
        middleContent="Thông tin cá nhân"

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
        }}>
        <InfoUser />
      </ScrollView>
    </Layout>
  );
}
