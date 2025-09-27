import React, { FC } from "react";
import { HStack, ScrollView } from "native-base";
import Signup from "@components/Signup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import initializeDatabase from "src/database/db";

import * as SQLite from "expo-sqlite";
import { isWeb } from "@utils/deviceInfo";
import authApi from "@/src/apis/auth";

import ButtonComponent from "@components/Lib/Button";
import TextComponent from "@components/Lib/Text";
import { useFormik } from "formik";
import { View } from "react-native";
import { TextInput } from "react-native-element-textinput";

import { t } from "@utils/locales/i18n";
import { COLORS } from "@config";
import { styles } from "@/src/styles/styles";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { clearAuth } from "@utils/common";
import SyncImages from "@components/Test";

interface IFormErrors {
  username?: string;
  password?: string;
}

type Props = {
  changeToHomePage: () => void;
};

const Login: FC<Props> = ({ changeToHomePage }) => {
  const [isRegister, setIsRegister] = React.useState(false);

  const handleSignup = () => {
    setIsRegister(true);
  };
  const clickLogin = () => {
    setIsRegister(false);
  };

  // popup

  const [visible, setVisible] = React.useState(false);

  const showDialog = () => {
    setVisible(true);
  };

  const handleLogin = async (value: any) => {
    if (!isWeb) {
      console.log(value);

      try {
        const data = await authApi.login({
          username: value.username,
          password: value.password,
        });

        AsyncStorage.setItem("username", value.username);
        AsyncStorage.setItem("password", value.password);
        AsyncStorage.setItem("accessToken", data.data.accessToken);
        changeToHomePage();
        return;
      } catch (error) {
        console.error(error);
        globalMessage.show(
          "Thông báo",
          "Đăng nhập thất bại. Vui lòng đăng thử lại"
        );
      }

      await initializeDatabase();
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db");

      const firstRow: any = await db.getFirstAsync(
        `SELECT * FROM User WHERE username = '${value.username}' and password ='${value.password}';`
      );

      if (firstRow) {
        AsyncStorage.setItem("username", value.username);
        AsyncStorage.setItem("password", value.password);
        // AsyncStorage.setItem("accessToken", data.data.accessToken);

        changeToHomePage();
      } else showDialog();
    } else {
      try {
        const data = await authApi.login({
          username: value.username,
          password: value.password,
        });
        localStorage.setItem("username", value.username);
        localStorage.setItem("password", value.password);
        localStorage.setItem("accessToken", data.data.accessToken);
        changeToHomePage();
      } catch (error) {
        clearAuth();
        showDialog();
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.username.length === 0) {
        error.username = "Vui lòng nhập vào username";
      }

      if (values.password.length === 0) {
        error.password = "Vui lòng nhập vào password";
      }

      return error;
    },
    onSubmit: (_values) => {
      handleLogin(_values);
    },
  });

  return (
    <ScrollView>
      <SyncImages />
      {!isRegister ? (
        <View style={styles.container}>
          <View style={styles.wrapBox}>
            <TextComponent style={styles.title} bold fontSize={30}>
              Hệ thống SDI Checklist
            </TextComponent>

            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.username}
              onChangeText={formik.handleChange("username")}
              label={t("login:username")}
              placeholder={t("login:username")}
              placeholderTextColor="gray"
              textError={formik.errors.username}
            />

            <TextInput
              mode="password"
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.password}
              textContentType="oneTimeCode"
              onChangeText={formik.handleChange("password")}
              label={t("login:password")}
              placeholder={t("login:password")}
              placeholderTextColor="gray"
              textError={formik.errors.password}
            />

            <ButtonComponent
              style={styles.button}
              title={"Đăng nhập"}
              fontSize={20}
              textColor={COLORS.BUTTON}
              onPress={formik.handleSubmit}
            />
            <HStack space={4} pt={4} justifyContent={"flex-end"}>
              <TextComponent style={styles.textOr} fontSize={18}>
                Bạn chưa có tài khoản?
              </TextComponent>
              <TextComponent
                style={{ ...styles.textOr, color: "blue" }}
                fontSize={18}
                onPress={handleSignup}
              >
                Đăng ký
              </TextComponent>
            </HStack>
          </View>
        </View>
      ) : (
        <Signup clickLogin={clickLogin} />
      )}
    </ScrollView>
  );
};

export default Login;
