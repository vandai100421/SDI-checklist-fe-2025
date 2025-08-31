import React, { useEffect } from "react";
import { Button, Card, Divider, Modal, Portal } from "react-native-paper";
import { HStack, View, Text } from "native-base";
import { styles } from "@/src/styles/styles";
import TextComponent from "@components/Lib/Text";
import { ScrollView } from "react-native-gesture-handler";
import { useFormik } from "formik";
import { Dropdown } from "react-native-element-dropdown";
import { TypeObject } from "@/src/types/object";

import { v4 as uuidv4 } from "uuid";
import { TextInput } from "react-native-rapi-ui";
import { showLog } from "@utils/common";

interface Props {
  id: number;
  visible: boolean;
  data?: TypeObject;
  closeModal: () => void;
  submit: (data: TypeObject) => void;
  type?: string;
}

interface IFormErrors {
  id?: string;
  name?: string;
  position?: string;
  manage?: string;
}

const initData: TypeObject = {
  id: "",
  name: "",
  position: "",
  manage: "",
  group_object_id: 1,
};

const ModalControl: React.FC<Props> = ({
  id,
  visible,
  data,
  closeModal,
  submit,
  type,
}) => {
  const [file, setFile] = React.useState<any>();
  const resetForm = () => {
    formik.resetForm();
  };

  const handleChangeFile = (e: any) => {
    setFile(e.target.files[0]);
  };
  const formik = useFormik({
    initialValues: { ...initData, group_object_id: id },
    validate: (values) => {
      if (type === "text") {
        const error: IFormErrors = {};
        if (values.name.length === 0) {
          error.name = "Không được để trống ô này";
        }
        if (!values.id) {
          error.id = "Không được để trống ô này";
        }
        if (values.id.length > 10) {
          error.id = "Mã đỗi tượng không được quá 10 kí tự";
        }

        if (values.position.length === 0) {
          error.position = "Không được để trống ô này";
        }
        if (values.manage.length === 0) {
          error.manage = "Không được để trống ô này";
        }

        return error;
      }
    },
    onSubmit: (_values) => {
      submit(type === "file" ? file : { ..._values });
      resetForm();
      closeModal();
    },
  });

  const handleSubmit = () => {
    if (
      formik.errors.name ||
      formik.errors.manage ||
      formik.errors.position ||
      formik.errors.id
    ) {
      showLog("Bạn cần điền đầy đủ thông tin");
      return;
    }
    formik.handleSubmit();
  };

  React.useEffect(() => {
    if (visible) {
      if (data) {
        formik.setFieldValue("id", data.id);
        formik.setFieldValue("name", data.name);
        formik.setFieldValue("position", data.position);
        formik.setFieldValue("manage", data.manage);
      } else {
        formik.resetForm();
        formik.setFieldValue("id", uuidv4().toString().slice(0, 10));
      }
    }
  }, [visible]);
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={styles.wrapBox}>
          <TextComponent style={styles.title} bold fontSize={18}>
            {data ? "Cập nhật thông tin" : "Thêm mới đối tượng"}
          </TextComponent>
          <ScrollView>
            {type === "file" && !data ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <input type="file" onChange={handleChangeFile} />
              </div>
            ) : (
              <>
                <Text>
                  ID: <Text style={{ fontWeight: "bold" }}>{data?.id}</Text>
                </Text>
                {!data && (
                  <TextInput
                    style={styles.textinput}
                    value={formik.values.id.toString()}
                    onChangeText={formik.handleChange("id")}
                    label={"ID"}
                    placeholder={"Nhập ID"}
                    placeholderTextColor="gray"
                    textError={formik.errors.id}
                  />
                )}

                <Text style={{ marginTop: 10 }}>Tên đối tượng:</Text>
                <TextInput
                  value={formik.values.name}
                  onChangeText={formik.handleChange("name")}
                  placeholder={"Nhập tên đối tượng"}
                  placeholderTextColor="gray"
                />

                <Text style={{ marginTop: 10 }}>Vị trí:</Text>
                <TextInput
                  value={formik.values.position}
                  textContentType="oneTimeCode"
                  onChangeText={formik.handleChange("position")}
                  placeholder={"Nhập vị trí"}
                  placeholderTextColor="gray"
                />

                <Text style={{ marginTop: 10 }}>Phòng quản lý:</Text>
                <TextInput
                  value={formik.values.manage}
                  textContentType="oneTimeCode"
                  onChangeText={formik.handleChange("manage")}
                  placeholder={"Nhập phòng quản lý"}
                  placeholderTextColor="gray"
                />

                <Divider />
              </>
            )}

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
