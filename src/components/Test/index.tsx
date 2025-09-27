import React, { useState } from "react";
import { View, Button, Text, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const SERVER_URL = "http://<IP_SERVER>:3000/api/images"; 
// ⚠️ thay <IP_SERVER> = địa chỉ LAN của server, vd: http://192.168.1.5:3000/api/images

export default function SyncImages() {
  const [logs, setLogs] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, msg]);
  };

  const downloadImages = async () => {
    setDownloading(true);
    setLogs([]);

    try {
      // 1. Lấy danh sách URL từ server
      const response = await fetch(SERVER_URL);
      const urls = await response.json();

      // 2. Xin quyền truy cập Gallery
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        addLog("❌ Không có quyền lưu vào thư viện ảnh.");
        setDownloading(false);
        return;
      }

      // 3. Lặp qua danh sách ảnh để tải
      for (const url of urls) {
        try {
          const filename = url.split("/").pop(); 
          const localUri = FileSystem.documentDirectory + filename;

          // tải về
          const { uri } = await FileSystem.downloadAsync(url, localUri);
          addLog(`✅ Đã tải: ${filename}`);

          // lưu vào Gallery
          await MediaLibrary.saveToLibraryAsync(uri);
          addLog(`📸 Đã lưu vào Gallery: ${filename}`);
        } catch (err) {
          addLog(`❌ Lỗi tải ảnh: ${url} | ${err.message}`);
        }
      }

      addLog("🎉 Hoàn thành đồng bộ ảnh!");
    } catch (error) {
      addLog(`❌ Lỗi: ${error.message}`);
    }

    setDownloading(false);
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 40 }}>
      <Button
        title={downloading ? "Đang tải..." : "Download All Images"}
        onPress={downloadImages}
        disabled={downloading}
      />
      <ScrollView style={{ marginTop: 20 }}>
        {logs.map((log, index) => (
          <Text key={index} style={{ marginBottom: 5 }}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
