import React, { useCallback, useContext, useEffect } from "react";
import { View } from "react-native";
import { MainStackParamList } from "../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Layout, Text, themeColor, TopNav } from "react-native-rapi-ui";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../provider/AuthProvider";

export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, "MainTabs">) {

  const { signOut } = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      // Gọi API hoặc cập nhật dữ liệu khi tab được focus
      return () => {
        console.log('Cleanup nếu cần');
      };
    }, [])
  );

  return (
    <Layout>
      <TopNav
        middleContent="Home"
        rightContent={
          <Text>Đăng xuất</Text>
        }
        rightAction={signOut}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>This is the About tab</Text>
      </View>
    </Layout>
  );
}
