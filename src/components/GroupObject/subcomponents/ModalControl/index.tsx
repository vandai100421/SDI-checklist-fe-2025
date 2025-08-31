import { ScrollView, Text } from "react-native";
import React, { useState } from "react";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { HStack, View } from "native-base";
import { styles } from "@/src/styles/styles";
import { globalLoading } from "@components/Lib/GlobalLoading";
import TextComponent from "@components/Lib/Text";
import { useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";
import { TypeGroupObject } from "@/src/types/groupObject";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { TextInput } from "react-native-rapi-ui";
import { showLog } from "@utils/common";

interface Props {
  visible: boolean;
  data?: TypeGroupObject;
  closeModal: () => void;
  submit: (data: TypeGroupObject) => void;
  type?: string;
}
interface IFormErrors {
  name?: string;
}

const initData: TypeGroupObject = {
  id: uuidv4(),
  name: "",
};

const ModalControl: React.FC<Props> = ({
  visible,
  data,
  closeModal,
  submit,
  type,
}) => {
  const [file, setFile] = React.useState<any>();
  const resetForm = () => {
    formik.resetForm();
    formik.values.id = uuidv4();
  };
  const handleOnchangeFile = (e: any) => {
    setFile(e.target.files[0]);
  };

  const formik = useFormik({
    initialValues: initData,
    validate: (values) => {
      const error: IFormErrors = {};
      if (values.name === "") {
        error.name = "Không được để trống ô này";
      }
      // if (error !== {}) {
      // }
      return error;
    },
    onSubmit: (_values) => {
      if (!data && type === "file" && !file) {
        globalMessage.show("Thông báo.", "Vui lòng thêm nội dung file.");
        return;
      }
      resetForm();
      submit(
        !data && type === "file"
          ? { files: file, id: uuidv4(), name: _values.name }
          : { ..._values, id: data ? data.id : uuidv4() }
      );
      closeModal();
      setTimeout(() => {
        globalLoading.hide();
      }, 1000);
    },
  });

  const handleSubmit = () => {
    if (formik.errors.name) {
      showLog("Bạn cần điền đầy đủ thông tin");
      return;
    }
    formik.handleSubmit();
  };

  React.useEffect(() => {
    if (visible) {
      if (data) {
        formik.values.id = data.id;
        formik.setFieldValue("name", data.name);
      } else {
        resetForm();
      }
    }
  }, [visible]);

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/download-template-object-info", {
        method: "GET",
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      });

      if (!response.ok) {
        throw new Error("Lỗi tải file");
      }

      // Chuyển dữ liệu response thành Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Tạo một thẻ <a> ẩn để tải file
      const a = document.createElement("a");
      a.href = url;
      a.download = "objects_template.xlsx"; // Tên file khi tải xuống
      document.body.appendChild(a);
      a.click();

      // Dọn dẹp URL sau khi tải
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={{ paddingHorizontal: 100, paddingVertical: 20 }}
      >
        <View style={styles.wrapBox}>
          <TextComponent style={styles.title} bold fontSize={18}>
            {data ? "Cập nhật nhóm đối tượng" : "Thêm mới nhóm đối tượng"}
          </TextComponent>
          <ScrollView>
            {/* <TextInput
              style={styles.textinput}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
              placeholderStyle={styles.placeholderStyle}
              textErrorStyle={styles.textErrorStyle}
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
              label={"Tên nhóm đối tượng"}
              placeholder={"Nhập tên nhóm đối tượng"}
              placeholderTextColor="gray"
              textError={formik.errors.name}
            /> */}
            <Text>Tên nhóm đối tượng:</Text>
            <TextInput
              placeholder="Nhập tên nhóm đối tượng"
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="name-phone-pad"
              style={{ marginHorizontal: 2 }}
            />

            {type === "file" && !data && (
              <>
                <Button style={{ flexDirection: "row" }} onPress={handleDownloadTemplate}>Tải xuống mẫu file danh sách đối tượng</Button>
                <div
                  style={{
                    height: 200,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <input type="file" onChange={handleOnchangeFile} />
                </div></>
            )}

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
