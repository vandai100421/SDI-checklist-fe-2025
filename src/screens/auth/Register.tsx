import React, { useCallback, useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { AuthStackParamList } from "../../types/navigation";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { isWeb } from "@utils/deviceInfo";
import { useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";
import { signUp } from "@components/Signup/store";
import { AuthContext } from "@/src/provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import { globalMessage } from "@components/Lib/GlobalMessage";

interface IFormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "Register">) {
  const { isDarkmode, setTheme } = useTheme();
  // const auth = getAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { isConnected, checkOnline } = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      checkOnline();
    }, [])
  );
  const formik = useFormik({
    initialValues: {
      id: uuidv4(),
      company: "",
      create_at: "",
      email: "",
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.name.length === 0) {
        error.name = "Vui lòng nhập vào vọ và tên";
      }
      if (values.username.length === 0) {
        error.username = "Vui lòng nhập vào username";
      }

      if (values.username.length === 0) {
        error.username = "Vui lòng nhập vào username";
      }

      if (values.email.length === 0) {
        error.email = "Vui lòng nhập vào email";
      }
      if (values.password !== values.confirmPassword)
        error.confirmPassword = "Mật khẩu nhập lại không khớp. Hãy thử lại.";
      return error;
    },

    onSubmit: async (_values) => {
      setLoading(true);
      await signUp(_values as any, isConnected);
      setLoading(false);
      navigation.navigate("Login");
      // clickLogin();
    },
  });

  const handleSubmit = async () => {

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((key) => {
        globalMessage.show("Thông báo", errors[key]);
        return;
      });
    }
    else {
      formik.handleSubmit();
    }
  }

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
              source={require("../../../assets/images/register.png")}
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
              <Text
                fontWeight="bold"
                size="h3"
                style={{
                  alignSelf: "center",
                  padding: 30,
                }}
              >
                Đăng ký
              </Text>

              <Text>Họ và tên</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập đầy đủ họ và tên"
                value={formik.values.name}
                onChangeText={formik.handleChange("name")}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text style={{ marginTop: 15 }}>Username</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập vào Username"
                value={formik.values.username}
                onChangeText={formik.handleChange("username")}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                keyboardType="default"
              />

              <Text style={{ marginTop: 15 }}>Email</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập vào email"
                value={formik.values.email}
                onChangeText={formik.handleChange("email")}
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

              <Text style={{ marginTop: 15 }}>Xác nhận mật khẩu</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập lại Password"
                value={formik.values.confirmPassword}
                onChangeText={formik.handleChange("confirmPassword")}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                secureTextEntry={true}
              />

              <Button
                text={loading ? "Loading" : "Tạo mới tài khoản"}
                onPress={handleSubmit}
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
                <Text size="md">Bạn đã có tài khoản?</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Login");
                  }}
                >
                  <Text
                    size="md"
                    fontWeight="bold"
                    style={{
                      marginLeft: 5,
                    }}
                  >
                    Đăng nhập
                  </Text>
                </TouchableOpacity>
              </View>
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
