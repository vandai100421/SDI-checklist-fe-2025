import { FlatList, StyleSheet } from "react-native";
import React, { useState } from "react";
import {
  Box,
  Heading,
  HStack,
  Avatar,
  VStack,
  Spacer,
  Text,
} from "native-base";
import { Link } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

const SideBar = () => {
  const [activeKey, setActiveKey] = useState("/");
  const data = [
    {
      key: "/",
      label: "Trang chủ",
    },
    {
      key: "task",
      label: "Quản lý nhiệm vụ",
    },
    {
      key: "checklist",
      label: "Quản lý Checklist",
    },
    {
      key: "object",
      label: "Quản lý Đối tượng",
    },
    {
      key: "user",
      label: "Quản lý thành viên",
    },
  ];

  return (
    <ScrollView>
      <FlatList
        data={data}
        numColumns={2}
        horizontal={false}
        renderItem={({ item }) => (
          <Box
            background={activeKey === item.key ? "amber.200" : ""}
            borderColor="muted.900"
            pl={["0", "4"]}
            pr={["0", "5"]}
            py="3"
          >
            <Link href={item.key} onPress={() => setActiveKey(item.key)}>
              <Text
                _dark={{
                  color: "warmGray.50",
                }}
                color="coolGray.800"
                bold={activeKey === item.key}
              >
                {item.label}
              </Text>
            </Link>
          </Box>
        )}
        keyExtractor={(item) => item.key}
      />
    </ScrollView>
  );
};

export default SideBar;

const styles = StyleSheet.create({});
