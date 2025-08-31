import React, { FC, useContext } from "react";
import { View } from "react-native";
import { HStack, ScrollView } from "native-base";
import { TypeUser } from "@/src/types/user";
import TextComponent from "@components/Lib/Text";
import { TextInput } from "react-native-element-textinput";
import { useFormik } from "formik";
import { t } from "@utils/locales/i18n";
import ButtonComponent from "@components/Lib/Button";
import { COLORS } from "@config";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import { styles } from "@/src/styles/styles";
import { signUp } from "./store";
import { AuthContext } from "@/src/provider/AuthProvider";

type Props = {
  clickLogin: () => void;
};

interface IFormErrors {
  name?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const Signup: FC<Props> = ({ clickLogin }) => {
  // const digest = Crypto.digestStringAsync(
  //   Crypto.CryptoDigestAlgorithm.SHA256,
  //   'GitHub stars are neat 🌟'
  // );

  // console.log('Digest: ', digest);

  const { isConnected } = useContext(AuthContext);

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

      if (values.password.length === 0) {
        error.password = "Vui lòng nhập vào password";
      }
      if (values.password !== values.confirmPassword)
        error.confirmPassword = "Mật khẩu nhập lại không khớp. Hãy thử lại.";
      return error;
    },

    onSubmit: (_values) => {
      signUp(_values as any, isConnected);
      clickLogin();
    },
  });

  return (
    <ScrollView>
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
            value={formik.values.username}
            onChangeText={formik.handleChange("username")}
            label={"Username"}
            placeholder={"Nhập vào username"}
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

          <TextInput
            mode="password"
            style={styles.textinput}
            inputStyle={styles.inputStyle}
            labelStyle={styles.labelStyle}
            placeholderStyle={styles.placeholderStyle}
            textErrorStyle={styles.textErrorStyle}
            value={formik.values.confirmPassword}
            textContentType="oneTimeCode"
            onChangeText={formik.handleChange("confirmPassword")}
            label={"Nhập lại mật khẩu"}
            placeholder={"Nhập lại mật khẩu"}
            placeholderTextColor="gray"
            textError={formik.errors.confirmPassword}
          />

          <ButtonComponent
            style={styles.button}
            title={"Đăng ký"}
            fontSize={20}
            onPress={formik.handleSubmit}
            textColor={COLORS.BUTTON}
          />
          <HStack space={4} pt={4} justifyContent={"flex-end"}>
            <TextComponent style={styles.textOr} fontSize={18}>
              Bạn đã có tài khoản?
            </TextComponent>
            <TextComponent
              style={{ ...styles.textOr, color: "blue" }}
              fontSize={18}
              onPress={clickLogin}
            >
              Đăng nhập
            </TextComponent>
          </HStack>
        </View>
      </View>
    </ScrollView>
  );
};

export default Signup;
