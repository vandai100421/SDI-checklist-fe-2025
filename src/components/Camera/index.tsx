import * as ImagePicker from "expo-image-picker";
import { FC, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Box, Center, HStack } from "native-base";
import { Icon } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { Alert } from 'react-native';

type Props = {
  id: string;
  data?: string;
  closeModal: () => void;
  submit: (image: any) => void;
};

const CameraApp: FC<Props> = ({ id, data, closeModal, submit }) => {
  const [uri, setUri] = useState<string | null>(data);


  async function requestPermissions() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'You need to grant camera permission to use this feature.');
      return false;
    }
    return true;
  }

  async function takePicture() {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri); // The URI of the captured image
      // You can now display or upload the image using the result.uri
      setUri(result.assets[0].uri)
    }
  }

  const renderPicture = () => {
    const handleSubmit = () => {
      submit(uri);
      setUri(null);
    };

    const clear = () => {
      setUri(null)
    }
    
    return (
      <View>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: "40%", aspectRatio: 1 }}
        />
        <HStack space={2} justifyContent={"center"}>
          <Button onPress={clear} title={"Xoá"} />
          {/* <Button onPress={() => setUri(null)} title={data ? "Chụp ảnh khác" : "Hủy"} /> */}
          <Button onPress={handleSubmit} title="Oke" />
        </HStack>
      </View>
    );
  };

  const renderCamera = () => {
    const handleCloseModal = () => {
      submit(null);
      closeModal();
    }
    return (
      <Center>
        <HStack space={2}>
        <Button title="Quay về"  onPress={handleCloseModal}/>
        <Button title="Chụp ảnh"  onPress={takePicture}/>
        </HStack>
      </Center>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
    backgroundColor: "red",
  },
  backBtn: {
    color: "#fff",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});

export default CameraApp;
