import { ScrollView, StyleSheet, } from "react-native";
import React, { useEffect, useState } from "react";
import { Box, Center, FormControl, HStack, Input, VStack } from "native-base";
import { colors } from "@theme";
import { COLORS } from "@config";
import { TextInput } from "react-native-element-textinput";
import { useFormik } from "formik";
import { styles } from "@/src/styles/styles";
import { TypeUser } from "@/src/types/user";
import { isWeb } from "@utils/deviceInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from 'expo-sqlite'
import authApi from "@/src/apis/auth";
import { Avatar, Button } from "react-native-rapi-ui";
import { clearAuth } from "@utils/common";

const initData: TypeUser = {
  id: 0,
  name: "",
  email: "",
  company: "",
  username: "",
  password: "",
  create_at: "",
};
interface IFormErrors {
  name?: string;
  username?: string;
  email?: string;
  company?: string;
  password?: string;
}
const InfoUser = () => {
  useEffect(() => {
    getInfo();
  }, [])

  const [isUpdate, setIsUpdate] = useState(false)
  const [userData, setUserData] = useState<TypeUser>()

  const clickCancel = () => {
    setIsUpdate(false);
  }

  const clickUpdate = () => {
    setIsUpdate(true);
  }

  const handleUpdate = () => {
    formik.handleSubmit();
  }

  const getInfo = async () => {
    if (!isWeb) {
      const username = await AsyncStorage.getItem("username");
      const password = await AsyncStorage.getItem("password");

      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });

      try {
        const firstRow: any = await db.getFirstAsync(
          `SELECT * FROM User WHERE username = '${username}' and password ='${password}';`
        );
        if (firstRow) {
          setUserData(firstRow);
          formik.values.id = firstRow.id;
          formik.values.username = firstRow.username;
          formik.values.name = firstRow.name;
          formik.values.email = firstRow.email;
          formik.values.company = firstRow.company;
          formik.values.password = firstRow.password;
        }
      } catch (error) {
        console.error(error);

      }

    } else {
      try {
        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");
        const data = await authApi.login({
          username: username as string,
          password: password as string,
        });
        if (data.data) {
          setUserData(data.data);
          formik.values.id = data.data.id;
          formik.values.username = data.data.username;
          formik.values.name = data.data.name;
          formik.values.email = data.data.email;
          formik.values.company = data.data.company;
          formik.values.password = data.data.password;
        }

        // localStorage.setItem("accessToken", data.data.accessToken);
      } catch (error) {
        clearAuth()
      }
    }
  };


  const formik = useFormik({
    initialValues: {
      id: 0,
      name: userData?.name || "",
      email: userData?.email || "",
      company: userData?.company || "",
      username: userData?.username || "",
      password: userData?.password || "",
      create_at: userData?.create_at || "",
    },
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.name.length === 0) {
        error.name = "Không được để trống ô này";
      }

      if (values.email.length === 0) {
        error.email = "Không được để trống ô này";
      }

      if (values.company.length === 0) {
        error.company = "Không được để trống ô này";
      }
      if (values.password.length === 0) {
        error.password = "Không được để trống ô này";
      }

      return error;
    },
    onSubmit: (_values) => {
      console.log(_values);
    },
  });

  return (
    <Box p="4">
      <VStack py={4}>
        <Center>
          <Avatar
            size={"xl"}
            source={require("@assets/images/avatar.jpg")}
          />
          <Box minW={isWeb ? 500 : "100%"}>
            <TextInput
              disableFullscreenUI={true}
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.username}
              onChangeText={formik.handleChange("username")}
              label={"Tên đăng nhập"}
              placeholder={"Nhập vào tên đăng nhập"}
              placeholderTextColor="gray"
              textError={formik.errors.username}
            />

            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
              label={"Họ và tên"}
              placeholder={"Nhập vào họ và tên"}
              placeholderTextColor="gray"
              textError={formik.errors.name}
            />

            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              label={"Email"}
              placeholder={"Nhập vào email"}
              placeholderTextColor="gray"
              textError={formik.errors.name}
            />

            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.company}
              onChangeText={formik.handleChange("company")}
              label={"Bộ phận"}
              placeholder={"Nhập vào bộ phận"}
              placeholderTextColor="gray"
              textError={formik.errors.name}
            />

            <TextInput
              mode="password"
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.password}
              onChangeText={formik.handleChange("password")}
              label={"Mật khẩu"}
              placeholder={"Nhập vào mật khẩu"}
              placeholderTextColor="gray"
              textError={formik.errors.name}
            />
          </Box>
        </Center>

      </VStack>

      {isUpdate ?
        <HStack space={4} pb={4} justifyContent={"center"}>

          <Button
            text="Hủy"
            outline
            onPress={clickCancel}
          />


          <Button
            text="Cập nhật"
            status={"primary"}
            onPress={handleUpdate}
          />
        </HStack>
        :
        <HStack space={4} pb={4} justifyContent={"center"}>
          <Button
            text="Chỉnh sửa thông tin cá nhân"
            status={"primary"}
            onPress={clickUpdate}
          >
          </Button>
        </HStack>}
    </Box>
  );
};

export default InfoUser;
