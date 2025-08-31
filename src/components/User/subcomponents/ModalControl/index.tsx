import { ScrollView, Text } from "react-native";
import React from "react";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { HStack, View } from "native-base";
import { styles } from "@/src/styles/styles";
import { globalLoading } from "@components/Lib/GlobalLoading";
import TextComponent from "@components/Lib/Text";
import { useFormik } from "formik";
import { TypeUser } from "@/src/types/user";
import { v4 as uuidv4 } from "uuid";
import { TextInput } from "react-native-rapi-ui";
import { showLog } from "@utils/common";

interface Props {
  visible: boolean;
  data?: TypeUser;
  closeModal: () => void;
  submit: (data: TypeUser) => void;
}
interface IFormErrors {
  name?: string;
  username?: string;
  company?: string;
  email?: string;
  password?: string;
}

const initData: TypeUser = {
  id: uuidv4(),
  name: "",
  company: "",
  username: "",
  email: "",
  password: "",
  create_at: "",
};

const ModalControl: React.FC<Props> = ({
  visible,
  data,
  closeModal,
  submit,
}) => {
  const resetForm = () => {
    formik.resetForm();
    formik.values.id = uuidv4();
  };

  const formik = useFormik({
    initialValues: initData,
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.name.length === 0) {
        error.name = "Không được để trống ô này";
      }
      if (values.email.length === 0) {
        error.email = "Không được để trống ô này";
      }
      if (values.password.length === 0) {
        error.password = "Không được để trống ô này";
      }
      if (values.username.length === 0) {
        error.username = "Không được để trống ô này";
      }

      return error;
    },
    onSubmit: (_values) => {
      submit({ ..._values, id: data ? data.id : uuidv4() });
      resetForm();
      closeModal();
    },
  });

  const handleSubmit = () => {
    if (
      formik.errors.name ||
      formik.errors.email ||
      formik.errors.username ||
      formik.errors.password
    ) {
      showLog("Bạn cần điền đầy đủ thông tin");
      return;
    }
    formik.handleSubmit();
  };

  React.useEffect(() => {
    if (visible) {
      if (data) {
        formik.values.id = data.id;
        formik.setFieldValue("id", data.id);
        formik.setFieldValue("username", data.username);
        formik.setFieldValue("name", data.name);
        formik.setFieldValue("company", data.company);
        formik.setFieldValue("password", data.password);
        formik.setFieldValue("email", data.email);
      } else {
        resetForm();
      }
    }
  }, [visible]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={{ paddingHorizontal: 100, paddingVertical: 20 }}
      >
        <View style={styles.wrapBox}>
          <TextComponent style={styles.title} bold fontSize={18}>
            {data ? "Cập nhật thành viên" : "Thêm mới thành viên"}
          </TextComponent>
          <ScrollView>
            <Text>Tên thành viên:</Text>
            <TextInput
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
              placeholder={"Nhập tên thành viên"}
              placeholderTextColor="gray"
            />

            <Text style={{ marginTop: 10 }}>Username:</Text>
            <TextInput
              value={formik.values.username}
              onChangeText={formik.handleChange("username")}
              placeholder={"Nhập username"}
              placeholderTextColor="gray"
            />

            <Text style={{ marginTop: 10 }}>Password:</Text>
            <TextInput
              value={formik.values.password}
              onChangeText={formik.handleChange("password")}
              placeholder={"Nhập password"}
              placeholderTextColor="gray"
              secureTextEntry
            />

            <Text style={{ marginTop: 10 }}>Email:</Text>
            <TextInput
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              placeholder={"Nhập email"}
              placeholderTextColor="gray"
              keyboardType="email-address"
            />

            <Text style={{ marginTop: 10 }}>Bộ phận:</Text>
            <TextInput
              value={formik.values.company}
              onChangeText={formik.handleChange("company")}
              placeholder={"Nhập bộ phận"}
              placeholderTextColor="gray"
            />

            <Divider />

            <HStack space={4} mt={14} justifyContent={"flex-end"}>
              <Button mode="outlined" onPress={closeModal}>
                Hủy
              </Button>
              <Button mode="contained" onPress={handleSubmit}>
                {data ? "Cập nhật" : "Thêm mới"}
              </Button>
            </HStack>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );
};

export default ModalControl;
