import React, { useEffect, useState } from "react";
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
import { isWeb } from "@utils/deviceInfo";
import { HelperText } from "react-native-paper";
import { globalMessage } from "@components/Lib/GlobalMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "ForgetPassword">) {
  const { isDarkmode, setTheme } = useTheme();
  // const auth = getAuth();
  const [ip, setIp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // useEffect(() => {

  //   let baseURL: any
  //   if (!isWeb) {
  //     baseURL = AsyncStorage.getItem("baseURL");
  //   }
  //   else baseURL = localStorage.getItem("baseURL");

  //   console.log("baseURL===", baseURL);


  //   if (baseURL) {
  //     const _ip = extractIP(baseURL);
  //     _ip && setIp(_ip);
  //   }
  // }, []);


  useEffect(() => {
    const fetchBaseURL = async () => {
      let baseURL: string | null = null;

      if (!isWeb) {
        baseURL = await AsyncStorage.getItem("baseURL"); // Dùng await để lấy dữ liệu thực
      } else {
        baseURL = localStorage.getItem("baseURL");
      }

      if (baseURL) {
        const _ip = extractIP(baseURL);
        _ip && setIp(_ip);
      }
    };

    fetchBaseURL();
  }, []);


  function isValidIP(ip: string): boolean {
    // Định dạng IP hợp lệ: gồm 4 phần, mỗi phần từ 0 đến 255, ngăn cách bằng dấu chấm
    const pattern =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // Kiểm tra xem chuỗi có khớp với định dạng IP hay không
    return pattern.test(ip);
  }
  function extractIP(url: string | undefined | null): string | null {
    if (!url || typeof url !== "string") {
      console.error("Invalid URL:", url);
      return null;
    }

    const pattern = /http:\/\/([0-9]{1,3}\.){3}[0-9]{1,3}/;
    const match = url.match(pattern);

    return match ? match[0].replace("http://", "") : null;
  }


  async function forget() {
    if (isValidIP(ip)) {
      if (!isWeb)
        AsyncStorage.setItem("baseURL", `http://${ip}:3001/api`);
      else localStorage.setItem("baseURL", `http://${ip}:3001/api`); // Nếu không có, sử dụng default IP
      navigation.navigate("Login");
    } else {
      globalMessage.show(
        "Thông báo",
        `${ip} không phải là một địa chỉ IP hợp lệ.`
      );
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
              source={require("../../../assets/images/forget.png")}
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
                size="h3"
                fontWeight="bold"
                style={{
                  alignSelf: "center",
                  padding: 30,
                }}
              >
                Thông tin IP Address
              </Text>
              <Text>IP Address</Text>
              <TextInput
                containerStyle={{ marginTop: 15 }}
                placeholder="Nhập vào địa chỉ IP"
                value={ip}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                onChangeText={(text) => setIp(text)}
              />
              <HelperText type="info">Ví dụ: 192.168.10.25</HelperText>
              <Button
                text={loading ? "Loading" : "Cập nhật"}
                onPress={() => {
                  forget();
                }}
                style={{
                  marginTop: 20,
                }}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
