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
import CameraApp from "@components/Camera";

interface Props {
  id: number;
  visible: boolean;
  data?: string;
  closeModal: () => void;
  submit: (image: any) => void;
}

const ModalControl: React.FC<Props> = ({
  id,
  data,
  visible,
  closeModal,
  submit,
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={{
          paddingHorizontal: 0,
          paddingVertical: 0,
        }}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <CameraApp
            id="123123_123123"
            data={data}
            closeModal={closeModal}
            submit={submit}
          />
        </View>
      </Modal>
    </Portal>
  );
};

export default ModalControl;
