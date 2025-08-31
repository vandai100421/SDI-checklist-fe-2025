import { ScrollView, Text } from "react-native";
import React from "react";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { HStack, View } from "native-base";
import { styles } from "@/src/styles/styles";
import { globalLoading } from "@components/Lib/GlobalLoading";
import TextComponent from "@components/Lib/Text";
import { useFormik } from "formik";
import { COLORS } from "@config";
import ButtonComponent from "@components/Lib/Button";
import { TypeStandard } from "@/src/types/standard";
import { v4 as uuidv4 } from "uuid";
import { TextInput } from "react-native-rapi-ui";
import { showLog } from "@utils/common";

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
  id: uuidv4(),
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
    formik.values.id = uuidv4();
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
      submit({ ..._values, id: data ? data.id : uuidv4() });
      closeModal();
    },
  });

  const handleSubmit = () => {
    if (
      formik.errors.content ||
      formik.errors.content_method ||
      formik.errors.standard
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
            <Text>Nội dung kiểm tra:</Text>
            <TextInput
              value={formik.values.content}
              onChangeText={formik.handleChange("content")}
              placeholder={"Nhập nội dung kiểm tra"}
              placeholderTextColor="gray"
            />

            <Text style={{ marginTop: 10 }}>Tiêu chuẩn tham chiếu:</Text>
            <TextInput
              value={formik.values.standard}
              onChangeText={formik.handleChange("standard")}
              placeholder={"Nhập tiêu chuẩn tham chiếu"}
              placeholderTextColor="gray"
            />

            <Text style={{ marginTop: 10 }}>Phương pháp kiểm tra:</Text>
            <TextInput
              value={formik.values.content_method}
              onChangeText={formik.handleChange("content_method")}
              placeholder={"Nhập phương pháp kiểm tra"}
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
