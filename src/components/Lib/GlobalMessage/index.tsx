import ButtonComponent from "../Button";
import TextComponent from "../Text";
import React, { useImperativeHandle, useState } from "react";
import { Modal, StatusBar, TouchableWithoutFeedback, View } from "react-native";
import { styles } from "./styles";
import * as ScreenOrientation from "expo-screen-orientation";
import commonApi from "@/src/apis/common";
import { globalLoading } from "../GlobalLoading";

export const globalMessageRef = React.createRef<any>();
export const globalMessage = {
  show: (
    title: string,
    content: string,
    url?: string,
    URLgetAll?: any
  ) => {
    globalMessageRef?.current?.show(title, content, url, URLgetAll);
  },
};

const GlobalMessage = React.forwardRef((_props, ref) => {
  ScreenOrientation.getOrientationAsync();

  const [visible, setVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [url, setUrl] = useState<string>();
  const [URLgetAll, setURLgetAll] = useState()

  useImperativeHandle(ref, () => {
    return { show: show };
  });

  const show = (title: string, content: string, _url?: string, _URLgetAll?: any) => {
    setVisible(true);
    setTitle(title);
    setContent(content);
    setUrl(_url);
    setURLgetAll(_URLgetAll)
  };

  const handleConfirm = async () => {
    try {
      globalLoading.show();
      await commonApi.delete(url);
      await commonApi.getAll(URLgetAll)
      
      globalMessage.show("Thành công", "Xóa dữ liệu thành công");
      await globalLoading.hide();
    } catch (error) {
      await globalLoading.hide();
      globalMessage.show("Thất bại", "Xóa dữ liệu thất bại\n" + error);
    }
  }

  return (
    <Modal
      style={styles.main}
      visible={visible}
      animationType={"none"}
      transparent
    >
      <StatusBar
        translucent
        backgroundColor={"rgba(0,0,0,0.6)"}
        barStyle={"light-content"}
      />
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.main}>
          <View style={styles.boxContent}>
            <View style={styles.content}>
              <View style={styles.title}>
                <TextComponent bold fontSize={17} color={"black"}>
                  {title}
                </TextComponent>
              </View>
              <View style={styles.message}>
                <TextComponent
                  fontSize={15}
                  color={"black"}
                  style={{ textAlign: "center" }}
                >
                  {content}
                </TextComponent>
              </View>
              <View>
                <ButtonComponent
                  style={styles.button}
                  title={url ? "Hủy" : "OK"}
                  onPress={() => {
                    setVisible(false);
                  }}
                  bgColor={"gray"}
                  textColor={"white"}
                />
                {url && (
                  <ButtonComponent
                    style={styles.button}
                    title={"Xác nhận"}
                    onPress={() => {
                      handleConfirm();
                      setVisible(false);
                    }}
                    bgColor={"gray"}
                    textColor={"white"}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

export default GlobalMessage;
