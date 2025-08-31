import { ScrollView, Text } from "react-native";
import React from "react";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { HStack, View } from "native-base";
import { TextInput } from "react-native-element-textinput";
import { styles } from "@/src/styles/styles";
import { globalLoading } from "@components/Lib/GlobalLoading";
import TextComponent from "@components/Lib/Text";
import { useFormik } from "formik";
import { COLORS } from "@config";
import ButtonComponent from "@components/Lib/Button";
import { TypeStandard } from "@/src/types/standard";

interface Props {
  id: number;
  visible: boolean;
  data?: TypeStandard;
  closeModal: () => void;
  submit: (data: TypeStandard) => void;
}
interface IFormErrors {
  content?: string;
  standard?: string;
  content_method?: string;
  type_checklist_id?: string;
}

const initData: TypeStandard = {
  id: 0,
  content: "",
  standard: "",
  content_method: "",
  check_list_id: 1,
};

const ModalControl: React.FC<Props> = ({
  id,
  visible,
  data,
  closeModal,
  submit,
}) => {
  const resetForm = () => {
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: { ...initData, check_list_id: id },
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.content.length === 0) {
        error.content = "Không được để trống ô này";
      }
      if (values.standard.length === 0) {
        error.standard = "Không được để trống ô này";
      }
      if (values.content_method.length === 0) {
        error.content_method = "Không được để trống ô này";
      }
      return error;
    },
    onSubmit: (_values) => {
      resetForm();
      submit(_values);
      closeModal();
    },
  });

  React.useEffect(() => {
    if (visible) {
      if (data) {
        formik.values.id = data.id;
        formik.values.content = data.content;
        formik.values.standard = data.standard;
        formik.values.content_method = data.content_method;
        formik.setFieldValue("content", data.content);
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
            {data ? "Cập nhật tiêu chuẩn" : "Thêm mới tiêu chuẩn"}
          </TextComponent>
          <ScrollView>
            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.content}
              onChangeText={formik.handleChange("content")}
              label={"Nội dung kiểm tra"}
              placeholder={"Nhập nội dung kiểm tra"}
              placeholderTextColor="gray"
              textError={formik.errors.content}
            />

            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.standard}
              onChangeText={formik.handleChange("standard")}
              label={"Tiêu chuẩn tham chiếu"}
              placeholder={"Nhập tiêu chuẩn tham chiếu"}
              placeholderTextColor="gray"
              textError={formik.errors.standard}
            />

            <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.content_method}
              onChangeText={formik.handleChange("content_method")}
              label={"Phương pháp kiểm tra"}
              placeholder={"Nhập phương pháp kiểm tra"}
              placeholderTextColor="gray"
              textError={formik.errors.content_method}
            />

            <Divider />

            <HStack space={4} mt={14} justifyContent={"flex-end"}>
              <Button
                mode="outlined"
                onPress={closeModal}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={() => formik.handleSubmit()}
              >
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
