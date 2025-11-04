import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { FC, useEffect, useState } from "react";
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
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  // 🔹 Ask for gallery permission once
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "You need to grant media library permission to save photos."
        );
      } else {
        setHasMediaPermission(true);
      }
    })();
  }, []);


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
      // console.log(result.assets[0].uri); // The URI of the captured image
      // You can now display or upload the image using the result.uri
      // setUri(result.assets[0].uri)
      const photoUri = result.assets[0].uri;
      console.log("Captured image:", photoUri);

      if (hasMediaPermission) {
        try {
          // 1️⃣ Tạo asset và album
          const asset = await MediaLibrary.createAssetAsync(photoUri);
          await MediaLibrary.createAlbumAsync("SDI-Checklist", asset, false);

          // 2️⃣ Đợi MediaStore cập nhật (Android cần delay)
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // 3️⃣ Truy vấn lại asset mới nhất trong album SDI-Checklist
          const album = await MediaLibrary.getAlbumAsync("SDI-Checklist");
          if (album) {
            const { assets } = await MediaLibrary.getAssetsAsync({
              album: album.id,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              first: 1,
            });

            if (assets.length > 0) {
              const latest = assets[0];
              console.log("✅ Saved photo path:", latest.uri);
              setUri(latest.uri);
              return;
            }
          }

          // fallback nếu không truy vấn được
          setUri(photoUri);
        } catch (err) {
          console.error("❌ Error saving photo:", err);
          Alert.alert("Error", "Failed to save photo to gallery.");
        }
      } else {
        setUri(photoUri);
      }
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
          <Button title="Quay về" onPress={handleCloseModal} />
          <Button title="Chụp ảnh" onPress={takePicture} />
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
