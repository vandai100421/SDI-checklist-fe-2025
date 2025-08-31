import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "components/Themed";
import { colors } from "@theme";
import { Box, HamburgerIcon, Heading, Menu, Pressable } from "native-base";
import { Link } from "expo-router";
import TextComponent from "@components/Lib/Text";
import { styles } from "@/src/styles/styles";
import { COLORS } from "@config";

type Props = {
  changeToLogin: () => void;
};

const Header: FC<Props> = ({ changeToLogin }) => {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.BACKGROUND,
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        },
      ]}
    >
      <TextComponent style={styles.title} bold fontSize={30}>
        Hệ thống SDI Checklist
      </TextComponent>
      <Box style={styles.icon}>
        <Menu
          w="190"
          marginX={4}
          trigger={(triggerProps) => {
            return (
              <Pressable
                accessibilityLabel="More options menu"
                {...triggerProps}
              >
                <HamburgerIcon />
              </Pressable>
            );
          }}
        >
          <Menu.Item>
            <Link href={"/user"}>Thoong tin chi tiet</Link>
          </Menu.Item>
          <Menu.Item>
            <Text onPress={changeToLogin}>Đăng xuất</Text>
          </Menu.Item>
        </Menu>
      </Box>
    </View>
  );
};

export default Header;
