import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  Alert,
} from "react-native";
import { AuthStackParamList } from "../../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { AuthContext } from "@/src/provider/AuthProvider";
import { useFormik } from "formik";
import { isWeb } from "@utils/deviceInfo";
import authApi from "@/src/apis/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { useFocusEffect } from "@react-navigation/native";
import { clearAuth, showMessage } from "@utils/common";
import { useHookstate } from "@hookstate/core";
import { loginStore, checkHealth } from "@components/Home/store";
import CustomRadioButton from "@/components/RadioGroupButton";

interface IFormErrors {
  username?: string;
  password?: string;
}

export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "Login">) {
  const { isConnected, signIn, checkOnline, checkIsAdmin, setIsConnected } = useContext(AuthContext);
  const { isDarkmode, setTheme } = useTheme();
  const options = [{ value: true, label: "Online" }, { value: false, label: "Offline" }];
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    checkHealth().then(data => console.log('data==', data)).catch((error: any) => console.log("err===", error.response))
  }, [isConnected])

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
    onSubmit: async (_values) => {
      await handleLogin(_values, isConnected);
    },
  });

  const handleLogin = async (value: any, isConnected?: boolean) => {
    setLoading(true);

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((key) => {
        globalMessage.show("Thông báo", errors[key]);
        return;
      });
    }

    if (!isWeb) {
      if (isConnected) {
        try {
          const data = await authApi.login({
            username: value.username,
            password: value.password,
          });
          AsyncStorage.setItem("username", value.username);
          AsyncStorage.setItem("password", value.password);
          AsyncStorage.setItem("accessToken", data.data.accessToken);

          signIn && signIn();
          showMessage("Đăng nhập thành công.");
          return;
        } catch (error: any) {
          setLoading(false);

          if (error.response.status === 401) {

            showMessage(
              "Đăng nhập thất bại. Tên đăng nhập hoặc mật khẩu không chính xác.\n"
            );
          }
          else
            showMessage(
              "Đăng nhập thất bại. Vui lòng thử lại.\n" +
              error
            );
        }
      } else {
        const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
          useNewConnection: true,
        });
        const firstRow: any = await db.getFirstAsync(
          `SELECT * FROM User WHERE username = '${value.username}' and password ='${value.password}';`
        );
        console.log("firstRow", firstRow);

        if (firstRow) {
          AsyncStorage.setItem("username", value.username);
          AsyncStorage.setItem("password", value.password);
          globalMessage.show("Thông báo", "Đăng nhập thành công.");
          signIn && signIn();
        }
        else {
          globalMessage.show("Thông báo", "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      }
    } else {
      try {
        const data = await authApi.login({
          username: value.username,
          password: value.password,
        });
        globalMessage.show("Thông báo", "Đăng nhập thành công.");
        localStorage.setItem("username", value.username);
        localStorage.setItem("password", value.password);
        localStorage.setItem("accessToken", data.data.accessToken);
        signIn && signIn();
      } catch (error: any) {
        clearAuth();
        globalMessage.show(
          "Thông báo",
          "Đăng nhập thất bại. Vui lòng đăng thử lại"
        );
      }
    }

    await checkIsAdmin();
    setLoading(false);

  };
  useFocusEffect(
    useCallback(() => {
      checkOnline && checkOnline();
    }, [])
  );

  console.log("isConnected====", isConnected);

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../../../assets/images/login.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
            }}
          >
            <View
              style={{ width: !isWeb ? "100%" : 400, marginHorizontal: "auto" }}
            >
              {
                !isWeb && <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    fontWeight="bold"
                    style={{
                      padding: 8,
                      paddingLeft: 0
                    }}
                  >
                    Trạng thái sử dụng:
                  </Text>

                  {options.map((option, index) => (
                    <CustomRadioButton
                      key={index}
                      label={option.label}
                      selected={isConnected === option.value}
                      onPress={() => {
                        setIsConnected(option.value);
                      }}
                    />
                  ))}
                </View>
              }

              <Text
                fontWeight="bold"
                style={{
                  alignSelf: "center",
                  paddingBottom: 20,
                }}
                size="h3"
              >
                Đăng nhập
              </Text>
              <Text>Username</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập vào username"
                value={formik.values.username}
                onChangeText={formik.handleChange("username")}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text style={{ marginTop: 15 }}>Password</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập vào password"
                value={formik.values.password}
                onChangeText={formik.handleChange("password")}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                secureTextEntry={true}
              />
              <Button
                text={loading ? "Loading" : "Tiếp tục"}
                onPress={() => formik.handleSubmit()}
                style={{
                  marginTop: 20,
                }}
                disabled={loading}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 15,
                  justifyContent: "center",
                }}
              >
                <Text size="md">Bạn chưa có tài khoản?</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Register");
                  }}
                >
                  <Text
                    size="md"
                    fontWeight="bold"
                    style={{
                      marginLeft: 5,
                    }}
                  >
                    Đăng ký
                  </Text>
                </TouchableOpacity>
              </View>
              {
                !isWeb && <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                    justifyContent: "center",
                  }}
                >
                  <Text size="md">Thay đổi địa chỉ IP Address?</Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ForgetPassword");
                    }}
                  >
                    <Text
                      size="md"
                      fontWeight="bold"
                      style={{
                        marginLeft: 5,
                      }}
                    >
                      Thay đổi
                    </Text>
                  </TouchableOpacity>
                </View>
              }
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 30,
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    isDarkmode ? setTheme("light") : setTheme("dark");
                  }}
                >
                  <Text
                    size="md"
                    fontWeight="bold"
                    style={{
                      marginLeft: 5,
                    }}
                  >
                    {isDarkmode ? "☀️ light theme" : "🌑 dark theme"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
