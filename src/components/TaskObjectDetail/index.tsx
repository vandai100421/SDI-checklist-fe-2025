import { Box, HStack, Input, VStack } from "native-base";
import * as React from "react";
import { Alert, Pressable, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  DataTable,
  Icon,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import ModalControl from "./subcomponents/ModalControl";
import { ScrollView } from "react-native-gesture-handler";
import taskObjectDetailStore, {
  getAllTaskObjectDetail,
  updateTaskObjectDetail,
} from "./store";
import { useHookstate } from "@hookstate/core";
import { styles } from "../../styles/styles";
import TextComponent from "@components/Lib/Text";
import { TypeStandard } from "@/src/types/standard";
import { isWeb } from "@utils/deviceInfo";
import { Image } from "expo-image";
import { Badge } from "react-native-paper";

import Checkbox from "expo-checkbox";
import taskDetailStore, {
  getAllTaskDetail,
} from "@components/TaskDetail/store";
import taskStore, { getAllTask } from "@components/Task/store";
import * as ImagePicker from "expo-image-picker";

import { printToFileAsync } from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { TextInput } from "react-native-rapi-ui";
import { AuthContext } from "@/src/provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import ExpoDraw from "expo-draw";
import { captureRef as takeSnapshotAsync } from "react-native-view-shot";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { request } from "@/src/apis/base";
import { formatVietnameseDate } from "@utils/common";
import ProcessTag from "@components/ProcessTag";

type Props = {
  id: number;
  object_task_id: number;
};

const TaskObjectDetail: React.FC<Props> = ({ id, object_task_id }) => {
  const taskObjectDetailState = useHookstate(taskObjectDetailStore);
  const taskState = useHookstate(taskStore);
  const taskDetailState = useHookstate(taskDetailStore);

  const signatureRef = React.useRef(null);
  const signatureEHSRef = React.useRef(null);
  const [strokes, setStrokes] = React.useState([]); // Define strokes state here
  const [strokesEHS, setStrokesEHS] = React.useState([]); // Define strokes state here
  const [signatureUri, setSignatureUri] = React.useState(null);
  const [signatureEHSUri, setSignatureEHSUri] = React.useState(null);

  const { isConnected, checkOnline } = React.useContext(AuthContext);

  const [checkerValue, setCheckerValue] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      checkOnline();
      getAllTaskObjectDetail({ object_task_id }, isConnected);
      getChecker();
      getDetail();
    }, [])
  );

  const [detail, setDetail] = React.useState<any>();
  const getDetail = async () => {
    if (!isWeb) {
      setDetail({
        name: (await AsyncStorage.getItem("object_task_name")) as any,
        manage: (await AsyncStorage.getItem("object_task_manage")) as any,
        process: (await AsyncStorage.getItem("object_task_process")) as any,
        object_id: (await AsyncStorage.getItem("object_task_object_id")) as any,
        position: (await AsyncStorage.getItem("object_task_position")) as any,
        task_name: (await AsyncStorage.getItem("task_name")) as any,
      });
    } else {
      setDetail({
        name: sessionStorage.getItem("object_task_name") as any,
        manage: (sessionStorage.getItem("object_task_manage") as any) || "",
        process: sessionStorage.getItem("object_task_process") as any,
        object_id: sessionStorage.getItem("object_task_object_id") as any,
        position: sessionStorage.getItem("object_task_position") as any,
        task_name: sessionStorage.getItem("task_name") as any,
      });
    }
  };

  const [page, setPage] = React.useState<number>(0);
  const [editData, setEditData] = React.useState<TypeStandard | undefined>();

  const [itemsPerPage, onItemsPerPageChange] = React.useState(10);

  const from = page * itemsPerPage;
  const to = Math.min(
    (page + 1) * itemsPerPage,
    taskObjectDetailState.data.get().length
  );



  const [sortColumn, setSortColumn] = React.useState<string | null>("stt");
  const [sortAscending, setSortAscending] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }
  };

  const sortedData = React.useMemo(() => {
    const filtered = taskObjectDetailState.data.get().filter((item) =>
      item.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [taskObjectDetailState.data.get(), sortColumn, sortAscending, searchQuery]);

  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);
  const handleCloseModalControl = () => {
    setVisibleModalControl(false);
  };

  const getChecker = async () => {
    if (!isWeb)
      setCheckerValue((await AsyncStorage.getItem("username")) as any);
    else setCheckerValue((await localStorage.getItem("username")) as any);
  };

  const changePIC = (value: string) => {
    taskObjectDetailState.pic.set(value);
  };

  const setChecked = (value: string, id: string, checked: boolean) => {
    taskObjectDetailState.data.set((prev) =>
      prev.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,
            process: checked ? value : null,
            checker: checked ? checkerValue : "",
            count_ng: value === "ng" ? '' : '0'
          };
        } else return item;
      })
    );
    taskObjectDetailState.merge({ pic: "", pic_ehs: "" });
    setSignatureUri(null);
    setSignatureEHSUri(null);
  };

  const [selectedObjectTaskID, setSelectedObjectTaskID] = React.useState("");
  const [selectedImage, setSelectedImage] = React.useState("");

  const upload = (id: string) => {
    setVisibleModalControl(true);
    setSelectedObjectTaskID(id);
    if (!isWeb) {
      setSelectedImage(
        taskObjectDetailState.data
          .get()
          .filter((item: any) => item.id === id)[0].mobile_path
      );
    } else {
      setSelectedImage(
        taskObjectDetailState.data
          .get()
          .filter((item: any) => item.id === id)[0].image
      );
    }
  };

  const handleTakePicture = (image: any) => {
    taskObjectDetailState.data.set((prev) =>
      prev.map((item: any) => {
        if (item.id === selectedObjectTaskID) {
          return { ...item, mobile_path: image };
        } else return item;
      })
    );
    setVisibleModalControl(false);
  };

  const handleChangeNote = (text: string, id: string) => {
    taskObjectDetailState.data.set((prev) =>
      prev.map((_item: any) => {
        if (_item.id === id) {
          return { ..._item, note: text };
        } else return _item;
      })
    )
  }


  const handleChangeCountNG = (text: string, id: string) => {
    taskObjectDetailState.data.set((prev) =>
      prev.map((_item: any) => {
        if (_item.id === id) {
          return { ..._item, count_ng: text };
        } else return _item;
      })
    )
  }

  const getPICEHS = () => {
    taskObjectDetailState.pic_ehs.set(checkerValue)
    return taskObjectDetailState.pic_ehs.get() ? taskObjectDetailState.pic_ehs.get() : checkerValue
  }

  const [isSubmiting, setIsSubmiting] = useState(false);

  const submit = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn thực hiện hành động này?",
      [
        {
          text: "Hủy",
          onPress: () => console.log("Hành động bị hủy"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            console.log("Bắt đầu thực hiện hành động");
            await setIsSubmiting(true);
            try {
              await updateTaskObjectDetail(
                taskObjectDetailState.data.get(),
                object_task_id.toString(),
                id.toString(),
                isConnected,
                taskObjectDetailState.pic.get(),
                taskObjectDetailState.mobile_pdf_path.get()
              );
              setTimeout(async () => {
                console.log("updating");
                // console.log("dataSubmit", taskObjectDetailState.data.get()[0]);
                await getAllTaskObjectDetail(
                  { object_task_id: object_task_id },
                  isConnected
                );
                await getAllTaskDetail(
                  {
                    task_id: id,
                  },
                  isConnected
                );
                await getAllTask({}, isConnected);
                await setIsSubmiting(false);
              }, 5000);
              setDetail({ ...detail, process: "Đã hoàn thành" })
              AsyncStorage.setItem("object_task_process", "Đã hoàn thành")

            } catch (error) {

            }

          },
        },
      ],
      { cancelable: false }
    );
  };

  // signal

  const [visibleModalSignal, setVisibleModalSignal] = React.useState(false);

  async function clearCanvas() {
    setSignatureUri("");
    signatureRef.current.clear();
    setStrokes([]); // Clear the strokes state as well
    taskObjectDetailState.mobile_pdf_path.set("");
  }

  const [snapshotImg, setSnapshotImg] = useState();

  async function saveCanvas() {
    // setVisibleModalSignal(false);
    try {
      const signature_result = await takeSnapshotAsync(signatureRef, {
        // format: "png", // 'png' also supported
        // quality: 0.5, // quality 0 for very poor 1 for very good
        result: "tmpfile", //
      });
      await setSignatureUri(signature_result);

      // await createAndPrintPDF(signature_result);
      // taskObjectDetailState.mobile_pdf_path.set(signature_result);
      console.log("signature file ", signature_result);
    } catch (error) {
      console.log("error save canvas", error);
    }
  }

  async function clearCanvasEHS() {
    setSignatureEHSUri("");
    signatureEHSRef.current.clear();
    setStrokesEHS([]); // Clear the strokes state as well
    taskObjectDetailState.mobile_pdf_path.set("");
  }

  async function saveCanvasEHS() {
    // setVisibleModalSignal(false);
    try {
      const signature_result = await takeSnapshotAsync(signatureEHSRef, {
        // format: "png", // 'png' also supported
        // quality: 0.5, // quality 0 for very poor 1 for very good
        result: "tmpfile", //
      });
      await setSignatureEHSUri(signature_result);

      await createAndPrintPDF(signatureUri, signature_result);
      // taskObjectDetailState.mobile_pdf_path.set(signature_result);
      console.log("signature file ", signature_result);
    } catch (error) {
      console.log("error save canvas", error);
    }
  }

  // end signal

  // Function to create the PDF content and print it
  const createAndPrintPDF = async (signatureURL: any, signatureEHSURL: any) => {
    if (!strokes.length) {
      Alert.alert("No Signature", "Please sign before generating the PDF.");
      return;
    }

    try {
      // Read the signature as a base64 string
      const signatureBase64 = await FileSystem.readAsStringAsync(signatureURL, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const signatureEHSBase64 = await FileSystem.readAsStringAsync(
        signatureEHSURL,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      // Convert each image to Base64 (nếu không có ảnh thì để trống)
      const tableRows = await Promise.all(
        sortedData.map(async (row: any, index) => {
          let imageTag = "<p></p>";
          if (row.mobile_path) {
            try {
              const base64Image = await FileSystem.readAsStringAsync(
                row.mobile_path,
                {
                  encoding: FileSystem.EncodingType.Base64,
                }
              );
              imageTag = `<img src="data:image/png;base64,${base64Image}" style="width: 100px; height: auto;" />`;
            } catch (error) {
              console.log("Lỗi khi update ảnh", error);
            }
          }
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${row.content}</td>
              <td style="text-transform: uppercase; text-align: center;">${row.process}</td>
              <td>${imageTag}</td>
              <td>${row.note || ""}</td>
            </tr>
          `;
        })
      );
      // Tạo nội dung HTML cho PDF
      const htmlContent = `
                      <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Báo cáo kiểm tra</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 2.5cm 2cm; /* Căn lề chuẩn A4 */
                  line-height: 1.6;
                }
                h1, h3 {
                  text-align: center;
                  margin-top: 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th, td {
                  border: 1px solid #000;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                .info-section {
                  margin-bottom: 20px;
                }
                .info-section p {
                  margin: 2px 0;
                }
                .date-container {
                  display: flex;
                  justify-content: flex-start;
                  margin-top: 20px;
                }
                .signature-container {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 4px;
                }
                .signature-box {
                  text-align: center;
                  width: 40%;
                }
                .signature-box img {
                  display: block;
                  margin: 10px auto;
                  width: 150px;
                  height: auto;
                }
                .signature-box p {
                  margin: 5px 0;
                }
                .no-break {
                  page-break-inside: avoid;
                }
              </style>
            </head>
            <body>
              <h1>${detail ? detail.task_name : ""}</h1>

              <div class="info-section">
                <p><strong>I. THÔNG TIN ĐỐI TƯỢNG:</strong></p>

                <table>
                  <thead>
                    <tr>
                      <th>1. Tên đối tượng</th>
                      <th>2. Mã quản lý</th>
                      <th>3. Vị trí lắp đặt</th>
                      <th>4. Bộ phận quản lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${taskDetailState.get().selectedItem.name}</td>
                      <td>${taskDetailState.get().selectedItem.object_id}</td>
                      <td>${taskDetailState.get().selectedItem.position}</td>
                      <td>${taskDetailState.get().selectedItem.manage}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="info-section">
                <p><strong>II. KẾT QUẢ KIỂM TRA:</strong></p>

                <!-- Bảng nội dung kiểm tra -->
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Hạng mục kiểm tra</th>
                      <th>Kết quả kiểm tra</th>
                      <th>Hình ảnh vấn đề  (Nếu có)</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Dòng nội dung sẽ được điền động -->
                    ${tableRows.join("")}
                  </tbody>
                </table>

              </div>

              <!-- Ký tên -->
              <div class="no-break">
                <div class="date-container">
                  <p>${formatVietnameseDate()}</p>
                </div>
                <div class="signature-container">
                  <div class="signature-box">
                    <h3>Xác nhận của PIC EHS</h3>
                    <img src="data:image/png;base64,${signatureEHSBase64}" alt="Chữ ký 1" />
                    <p><strong>${taskObjectDetailState.pic_ehs.get()}</strong></p>
                  </div>
                  <div class="signature-box">
                    <h3>Xác nhận của PIC bộ phận</h3>
                    <img src="data:image/png;base64,${signatureBase64}" alt="Chữ ký 2" />
                    <p><strong>${taskObjectDetailState.pic.get()}</strong></p>
                  </div>
                </div>
              </div>

            </body>
            </html>

          `;

      // Generate PDF from HTML content
      const { uri } = await printToFileAsync({
        html: htmlContent,
        base64: false, // If you want the file as Base64, set this to true
      });
      taskObjectDetailState.mobile_pdf_path.set(uri);

      // sharePDF(uri);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const sharePDF = async (fileUri: string) => {
    if (!isWeb) {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Sharing Not Available",
          "This feature is not available on your device."
        );
        return;
      }

      try {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: "Share your signed PDF",
          mimeType: "application/pdf",
        });
      } catch (error) {
        console.error("Error sharing PDF:", error);
      }
    } else {
      try {
        const link = document.createElement("a");
        link.href = "http://localhost:3001" + fileUri;
        link.target = "_blank"; // Mở trong tab mới
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading PDF:", error);
      }
    }
  };

  return isSubmiting ? (
    <View style={styles.emptyBox}>
      <TextComponent fontSize={16}>Đang load lại dữ liệu.</TextComponent>
    </View>
  ) : (
    <ScrollView>
      <Box p={4}>
        {/* <Pressable>
          <Button mode="text" onPress={createAndPrintPDF}>
            Generate PDF
          </Button>
        </Pressable> */}
        {/* 
        <TextComponent style={styles.titleCell} bold fontSize={30}>
          Chi tiết nhiệm vụ
        </TextComponent> */}
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={styles.detailTitle}>
                {detail ? detail.task_name : ""}
              </Text>
              {/* <Text style={styles.detailText}>
                {detail ? detail.object_id : ""}
              </Text> */}
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Mã đối tượng: </Text>
              <Text style={styles.detailText}>
                {detail ? detail.object_id : ""}
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Tên đối tượng: </Text>
              <Text style={styles.detailText}>{detail ? detail.name : ""}</Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Vị trí: </Text>
              <Text style={styles.detailText}>
                {detail ? detail.position : ""}
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Bộ phận quản lý: </Text>
              <Text style={styles.detailText}>
                {detail ? detail.manage : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Tiến độ: </Text>
              <Text style={styles.detailText}>
                <ProcessTag status={detail ? detail.process : ""} />
              </Text>
            </View>
          </View>

          {/* <TextComponent style={styles.titleCell} bold fontSize={30}>
            Danh sách tiêu chuẩn kiểm tra
          </TextComponent> */}
          <HStack space={4} style={{ marginBottom: 12 }}>
            <Input
              placeholder="Tìm kiếm theo nội dung"
              variant="outline"
              width={200}
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </HStack>
          <Card>
            {taskObjectDetailState.data.get().length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title numeric style={styles.center}>
                    STT
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Nội dung
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Tiêu chuẩn
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Phương pháp kiểm tra
                  </DataTable.Title>

                  <DataTable.Title style={styles.center}>
                    Kết quả
                  </DataTable.Title>

                  <DataTable.Title style={styles.center}>
                    Số NG
                  </DataTable.Title>

                  <DataTable.Title style={styles.center}>
                    Người KT
                  </DataTable.Title>

                  <DataTable.Title style={styles.center}>
                    Hình ảnh
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Ghi chú
                  </DataTable.Title>
                </DataTable.Header>

                {sortedData
                  .map((item, index) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell numeric style={styles.cell}>
                        {index + 1}
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[styles.cell, { justifyContent: "flex-start" }]}
                      >
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.content}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[styles.cell, { justifyContent: "flex-start" }]}
                      >
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.standard}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={[styles.cell, { justifyContent: "flex-start" }]}
                      >
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.content_method}
                        </Text>
                      </DataTable.Cell>

                      <DataTable.Cell style={styles.cell}>
                        <VStack py={2}>
                          <View style={styles.section}>
                            <Checkbox
                              style={styles.checkbox}
                              value={
                                sortedData[index]
                                  ?.process === "ok"
                              }
                              onValueChange={(value) =>
                                setChecked("ok", item.id, value)
                              }
                            />
                            <Text style={styles.paragraph}>OK</Text>
                          </View>
                          <View style={styles.section}>
                            <Checkbox
                              style={styles.checkbox}
                              value={
                                sortedData[index]
                                  ?.process === "ng"
                              }
                              onValueChange={(value) => {
                                setChecked("ng", item.id, value);
                              }}
                            />
                            <Text style={styles.paragraph}>NG</Text>
                          </View>
                          <View style={styles.section}>
                            <Checkbox
                              style={styles.checkbox}
                              value={
                                sortedData[index]
                                  ?.process === "na"
                              }
                              onValueChange={(value) =>
                                setChecked("na", item.id, value)
                              }
                            />
                            <Text style={styles.paragraph}>NA</Text>
                          </View>

                        </VStack>
                      </DataTable.Cell>

                      <DataTable.Cell
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        {item.process === "ng" ? <Input
                          variant="outline"
                          keyboardType="decimal-pad"
                          width={50}
                          value={item.count_ng}
                          onChangeText={(text) =>
                            handleChangeCountNG(text, item.id)
                          } /> : null}
                      </DataTable.Cell>

                      <DataTable.Cell
                        style={[styles.cell, { justifyContent: "flex-start" }]}
                      >
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.checker}
                        </Text>
                      </DataTable.Cell>

                      <DataTable.Cell style={styles.cell}>
                        {!isWeb ? (
                          item.mobile_path ? (
                            <Pressable
                              onPress={() => {
                                upload(item.id);
                              }}
                            >
                              <Image
                                source={{
                                  uri: item.mobile_path,
                                }}
                                contentFit="contain"
                                style={{ width: 100, aspectRatio: 1 }}
                              />
                            </Pressable>
                          ) : (
                            <Button mode="text" onPress={() => upload(item.id)}>
                              Chụp ảnh
                            </Button>
                          )
                        ) : (
                          item.image && (
                            <Pressable
                              onPress={() => {
                                upload(item.id);
                              }}
                            >
                              <Image
                                source={{
                                  uri: item.image,
                                }}
                                contentFit="contain"
                                style={{ width: 100, aspectRatio: 1 }}
                              />
                            </Pressable>
                          )
                        )}
                      </DataTable.Cell>
                      <DataTable.Cell
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        <TextInput
                          style={{
                            borderBottomWidth: 1,
                            padding: 5,
                          }}
                          multiline={true} // Cho phép nhập nhiều dòng
                          placeholder="Nhập nội dung"
                          value={item.note}
                          onChangeText={(text) =>
                            handleChangeNote(text, item.id)
                          }
                        />
                        {/* <Button mode="text" onPress={() => handleNote(item)}>
                          {item.note === "" || item.note === null
                            ? "Thêm"
                            : "Xem"}
                        </Button> */}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}

                {/* <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(
                    taskObjectDetailState.data.get().length / itemsPerPage
                  )}
                  onPageChange={(page) => setPage(page)}
                  label={`${page + 1} of ${Math.ceil(
                    taskObjectDetailState.data.get().length / itemsPerPage
                  )}`}
                  showFastPaginationControls
                /> */}
              </DataTable>
            ) : (
              <View style={styles.emptyBox}>
                <TextComponent fontSize={16}>
                  Không có dữ liệu nào. Vui lòng thêm mới dữ liệu.
                </TextComponent>
              </View>
            )}
          </Card>
        </View>
        {!isWeb &&
          taskObjectDetailState.data.get().filter((item: any) => item.process)
            .length === taskObjectDetailState.data.get().length && taskObjectDetailState.data.get().length > 0 && (
            <View
              style={{
                marginTop: 10,
              }}
            >
              {!taskObjectDetailState.mobile_pdf_path.get() && (
                <View>
                  <Text style={{ color: "orange" }}>
                    * Vui lòng điền đầy đủ thông tin PIC và chữ ký.
                  </Text>
                </View>
              )}

              {taskObjectDetailState.mobile_pdf_path.get() ? (
                <View>
                  {/* <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                    }}
                  >
                    <TextComponent style={styles.detailTitle}>
                      PIC Bộ phận:{" "}
                    </TextComponent>
                    <Text style={styles.detailText}>
                      {taskObjectDetailState.pic.get()}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                    }}
                  >
                    <TextComponent style={styles.detailTitle}>
                      PIC EHS:{" "}
                    </TextComponent>
                    <Text style={styles.detailText}>
                      {taskObjectDetailState.pic_ehs.get()}
                    </Text>
                  </View> */}
                </View>
              ) : (
                <VStack space={4}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      padding: 4,
                      backgroundColor: "#d5d5d5",
                      borderRadius: 10,
                      // iOS Shadow
                      shadowColor: "#000", // Color of the shadow
                      shadowOffset: { width: 0, height: 4 }, // Horizontal and vertical offset of the shadow
                      shadowOpacity: 0.2, // Opacity of the shadow
                      shadowRadius: 6, // Blur radius of the shadow
                      // Android Shadow
                      elevation: 3, // Elevation for Android shadow
                    }}
                  >
                    <HStack flex={1}>
                      <TextComponent style={styles.detailTitle}>
                        PIC Bộ phận:{" "}
                      </TextComponent>
                      {!isWeb && (
                        <View style={{ flex: 2 }}>
                          {!taskObjectDetailState.mobile_pdf_path.get() ? (
                            <TextInput
                              aria-disabled
                              placeholder="Điền thông tin PIC bộ phận"
                              value={taskObjectDetailState.pic.get()}
                              onChangeText={changePIC}
                              style={{ flex: 1 }}
                            />
                          ) : (
                            <Text style={styles.detailText}>
                              {taskObjectDetailState.pic.get()}
                            </Text>
                          )}
                        </View>
                      )}
                    </HStack>
                    {!taskObjectDetailState.mobile_pdf_path.get() ? (
                      <HStack flex={1} justifyContent={"flex-end"}>
                        <VStack space={4} mr={2}>
                          <TextComponent style={styles.detailTitle}>
                            Chữ ký:
                          </TextComponent>
                          <Button mode="outlined" onPress={clearCanvas}>
                            Thử lại
                          </Button>
                          {!signatureUri && taskObjectDetailState.pic.get() && (
                            <Button mode="contained" onPress={saveCanvas}>
                              Xong
                            </Button>
                          )}
                        </VStack>

                        <View
                          collapsable={false}
                          // ref={signatureRef}
                          style={{ backgroundColor: "white", borderRadius: 8 }}
                        >
                          {signatureUri ? (
                            <Image
                              resizeMode="contain"
                              style={{
                                height: 200,
                                backgroundColor: "white",
                                width: 300,
                              }}
                              source={{ uri: signatureUri }}
                            />
                          ) : (
                            <ExpoDraw
                              ref={signatureRef}
                              strokes={strokes}
                              containerStyle={{
                                backgroundColor: "rgba(0,0,0,0)",
                                height: 200,
                                width: 300,
                              }}
                              rewind={(undo) => console.log("undo", undo)}
                              clear={(clear) => console.log("clear", clear)}
                              color={"#000000"}
                              strokeWidth={4}
                              enabled={true}
                              onChangeStrokes={(strokes) => setStrokes(strokes)}
                            />
                          )}
                        </View>
                      </HStack>
                    ) : (
                      <HStack flex={1}></HStack>
                    )}
                  </View>
                  {/* pic ehs */}
                  {signatureUri && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        padding: 4,
                        backgroundColor: "#d5d5d5",
                        borderRadius: 10,
                        // iOS Shadow
                        shadowColor: "#000", // Color of the shadow
                        shadowOffset: { width: 0, height: 4 }, // Horizontal and vertical offset of the shadow
                        shadowOpacity: 0.2, // Opacity of the shadow
                        shadowRadius: 6, // Blur radius of the shadow
                        // Android Shadow
                        elevation: 3, // Elevation for Android shadow
                      }}
                    >
                      <HStack flex={1}>
                        <TextComponent style={styles.detailTitle}>
                          PIC EHS:{" "}{getPICEHS()}
                        </TextComponent>
                      </HStack>
                      {!taskObjectDetailState.mobile_pdf_path.get() ? (
                        <HStack flex={1} justifyContent={"flex-end"}>
                          <VStack space={4} mr={2}>
                            <TextComponent style={styles.detailTitle}>
                              Chữ ký:
                            </TextComponent>
                            <Button mode="outlined" onPress={clearCanvasEHS}>
                              Thử lại
                            </Button>
                            {!signatureEHSUri &&
                              taskObjectDetailState.pic.get() && (
                                <Button
                                  mode="contained"
                                  onPress={saveCanvasEHS}
                                >
                                  Xong
                                </Button>
                              )}
                          </VStack>

                          <View
                            collapsable={false}
                            // ref={signatureRef}
                            style={{
                              backgroundColor: "white",
                              borderRadius: 8,
                            }}
                          >
                            {signatureEHSUri ? (
                              <Image
                                resizeMode="contain"
                                style={{
                                  height: 200,
                                  backgroundColor: "white",
                                  width: 300,
                                }}
                                source={{ uri: signatureEHSUri }}
                              />
                            ) : (
                              <ExpoDraw
                                ref={signatureEHSRef}
                                strokes={strokesEHS}
                                containerStyle={{
                                  backgroundColor: "rgba(0,0,0,0)",
                                  height: 200,
                                  width: 300,
                                }}
                                rewind={(undo) => console.log("undo", undo)}
                                clear={(clear) => console.log("clear", clear)}
                                color={"#000000"}
                                strokeWidth={4}
                                enabled={true}
                                onChangeStrokes={(strokes) =>
                                  setStrokesEHS(strokes)
                                }
                              />
                            )}
                          </View>
                        </HStack>
                      ) : (
                        <HStack flex={1}></HStack>
                      )}
                    </View>
                  )}
                </VStack>
              )}
            </View>
          )}

        <HStack pt={4} justifyContent={"flex-end"}>
          <HStack space={4} flexDirection={"row"}>
            {!isWeb
              ? taskObjectDetailState.mobile_pdf_path.get() && (
                <Button
                  mode="contained"
                  onPress={() =>
                    sharePDF(taskObjectDetailState.mobile_pdf_path.get())
                  }
                >
                  Xem file PDF
                </Button>
              )
              : taskObjectDetailState.pdf_path.get() && (
                <Button
                  mode="contained"
                  onPress={() =>
                    sharePDF(taskObjectDetailState.pdf_path.get())
                  }
                >
                  Xem file PDF
                </Button>
              )}
            {!isWeb && (
              taskObjectDetailState.editable.get() &&
              <Button
                mode="contained"
                loading={isSubmiting}
                onPress={submit}
                disabled={
                  !(
                    taskObjectDetailState.mobile_pdf_path.get() &&
                    taskObjectDetailState.data
                      .get()
                      .filter((item: any) => item.process !== null).length ===
                    taskObjectDetailState.data.get().length
                  )
                }
              >
                Xác nhận
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>
      {visibleModalControl && id && (
        <ModalControl
          id={id}
          data={selectedImage}
          visible={visibleModalControl}
          closeModal={handleCloseModalControl}
          submit={handleTakePicture}
        />
      )}
    </ScrollView>
  );
};

export default TaskObjectDetail;
