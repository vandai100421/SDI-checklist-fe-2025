import { ScrollView, Text } from "react-native";
import React, { useState } from "react";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { ArrowDownIcon, HStack, View } from "native-base";
import { styles } from "@/src/styles/styles";
import { globalLoading } from "@components/Lib/GlobalLoading";
import TextComponent from "@components/Lib/Text";
import { useFormik } from "formik";
import { TypeChecklist } from "@/src/types/checklist";
import { v4 as uuidv4 } from "uuid";
import { TextInput } from "react-native-rapi-ui";
import { showLog } from "@utils/common";
import checklistApi from "@/src/apis/checklist";

interface Props {
  visible: boolean;
  data?: TypeChecklist;
  closeModal: () => void;
  submit: (data: TypeChecklist) => void;
  type?: string;
}
interface IFormErrors {
  name?: string;
  type_checklist_id?: string;
}

const initData: TypeChecklist = {
  id: uuidv4(),
  name: "",
  type_checklist_id: 1,
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
      if (type !== "file") {
        const error: IFormErrors = {};
        if (values.name.length === 0) {
          error.name = "Không được để trống ô này";
        }

        return error;
      }
    },
    onSubmit: (_values) => {
      resetForm();
      submit(
        !data && type === "file"
          ? file
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
      const response = await fetch("http://localhost:3001/api/download-template-checklist", {
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
      a.download = "checklist_template.xlsx"; // Tên file khi tải xuống
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
            {data ? "Cập nhật checklist" : "Thêm mới checklist"}
          </TextComponent>
          <ScrollView>
            {type === "file" && !data ? (

              <>
                <Button style={{ flexDirection: "row" }} onPress={handleDownloadTemplate}>Tải xuống mẫu file checklist</Button>
                <div
                  style={{
                    height: 200,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <input type="file" onChange={handleOnchangeFile} />
                </div>
              </>
            ) : (
              <View>
                <Text>Tên checklist:</Text>
                <TextInput
                  placeholder="Nhập tên checklist"
                  value={formik.values.name}
                  onChangeText={formik.handleChange("name")}
                  autoCapitalize="none"
                  keyboardType="name-phone-pad"
                />
              </View>
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
