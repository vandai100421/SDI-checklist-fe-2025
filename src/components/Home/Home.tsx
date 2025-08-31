import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Box, HStack, VStack } from "native-base";
import Pie from "@components/Chart/Pie";
import Bar from "@components/Chart/Bar";
import StatisticCard from "@components/StatisticCard";
import { ScrollView } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";

import { styles } from "@styles/styles";
import TextComponent from "@components/Lib/Text";
import { useHookstate } from "@hookstate/core";
import userStore, { getAllUser } from "@components/User/store";
import checklistStore, { getAllChecklist } from "@components/Checklist/store";
import taskStore, { getAllTask } from "@components/Task/store";
import { getAllObject } from "@components/Object/store";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/src/provider/AuthProvider";
import { Button, Switch } from "react-native-paper";
import initializeDatabase, { deleteDatabase } from "@/src/database/db";
import { asyncAllData, countCompleteTask, generateFileName, generateUniqueString } from "@utils/common";
import taskApi from "@/src/apis/task";
import { isWeb } from "@utils/deviceInfo";
import { TextInput } from "react-native-rapi-ui";
import axios from "axios";
import authApi from "@/src/apis/auth";

const Home = () => {
  const userState = useHookstate(userStore);
  const taskState = useHookstate(taskStore);
  const checklistState = useHookstate(checklistStore);
  const { isConnected, checkOnline, setIsConnected } = useContext(AuthContext);
  const fetchPendingData = async () => {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    // Danh sách các bảng cần truy vấn
    const tables = [
      "GroupObject",
      "object",
      "checklist",
      "standard",
      "user",
      "task",
      "object_task",
      "checklist_task",
      "detail_task",
    ];

    // Object để lưu kết quả
    const resultData = {};
    let totalRecords = 0; // Biến đếm tổng số bản ghi

    for (const table of tables) {
      try {
        const statement = await db.prepareAsync(
          `SELECT * FROM ${table} WHERE status = 'pending-add';`
        );
        const result = await statement.executeAsync();
        const data = await result.getAllAsync();

        // Đếm số bản ghi của bảng hiện tại
        const count = data.length;

        // Tăng tổng số bản ghi
        totalRecords += count;

        // Lưu dữ liệu dưới dạng { table_name: { table_name: 'name', data: [...] } }
        resultData[table] = {
          table_name: table,
          data: data,
          count: count,
        };

        await statement.finalizeAsync();
      } catch (error) {
        Alert.alert(
          "Thất bại",
          `Lấy dữ liệu từ bảng ${table} thất bại\n` + error,
          [{ text: "OK" }]
        );
        // Đảm bảo vẫn có object với key là tên bảng dù lỗi
        resultData[table] = {
          table_name: table,
          data: [],
          count: 0,
        };
      }
    }

    return { resultData, totalRecords };
  };

  const fetchUpdateData = async () => {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    // Danh sách các bảng cần truy vấn
    const tables = [
      "GroupObject",
      "object",
      "checklist",
      "standard",
      "user",
      "task",
      "object_task",
      "checklist_task",
      "detail_task",
    ];

    // Object để lưu kết quả
    const resultData = {};
    let totalRecords = 0; // Biến đếm tổng số bản ghi

    for (const table of tables) {
      try {
        const statement = await db.prepareAsync(
          `SELECT * FROM ${table}
          WHERE status = 'pending-update';`
        );
        const result = await statement.executeAsync();
        const data = await result.getAllAsync();

        // Đếm số bản ghi của bảng hiện tại
        const count = data.length;

        // Tăng tổng số bản ghi
        totalRecords += count;

        // Lưu dữ liệu dưới dạng { table_name: { table_name: 'name', data: [...] } }
        resultData[table] = {
          table_name: table,
          data: data,
          count: count,
        };

        await statement.finalizeAsync();
      } catch (error) {
        Alert.alert(
          "Thất bại",
          `Lấy dữ liệu từ bảng ${table} thất bại\n` + error,
          [{ text: "OK" }]
        );
        // Đảm bảo vẫn có object với key là tên bảng dù lỗi
        resultData[table] = {
          table_name: table,
          data: [],
          count: 0,
        };
      }
    }

    return { resultData, totalRecords };
  };

  const fetchDeleteData = async () => {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      const statement = await db.prepareAsync(`SELECT * FROM tmp_delete;`);
      const result = await statement.executeAsync();
      const data = await result.getAllAsync();

      // Đếm số bản ghi của bảng hiện tại
      const totalRecords = data.length;

      await statement.finalizeAsync();

      return { resultData: data, totalRecords };
    } catch (error) {
      Alert.alert(
        "Thất bại",
        `Lấy dữ liệu từ bảng tmp_delete thất bại\n` + error,
        [{ text: "OK" }]
      );
      return {
        resultData: [],
        totalRecords: 0,
      };
      // Đảm bảo vẫn có object với key là tên bảng dù lỗi
    }
  };

  const [count, setCount] = useState(0);
  const [dataSynch, setDataSynch] = useState({
    add: null,
    update: null,
    delete: null,
  });

  useFocusEffect(
    useCallback(() => {
      checkHealth();
      setTimeout(() => {
        refreshData();
      }, 1000);

      // Sử dụng hàm
      if (!isWeb) {
        fetchPendingData()
          .then(({ resultData, totalRecords }) => {
            setDataSynch((prev: any) => {
              return { ...prev, add: resultData };
            });
            setCount((prev) => prev + totalRecords);
          })
          .catch((error) => {
            console.error("Lỗi khi lấy dữ liệu:", error);
          });
        // Sử dụng hàm
        fetchUpdateData()
          .then(({ resultData, totalRecords }) => {
            // console.log("Dữ liệu từ các bảng update:", resultData);
            setDataSynch((prev: any) => {
              return { ...prev, update: resultData };
            });
            // console.log("Tổng số lượng bản ghi update:", totalRecords);
            setCount((prev) => prev + totalRecords);
            // setCount(totalRecords);
          })
          .catch((error) => {
            console.error("Lỗi khi lấy dữ liệu:", error);
          });

        // Sử dụng hàm
        fetchDeleteData()
          .then(({ resultData, totalRecords }) => {
            // console.log("Dữ liệu từ các bảng delete:", resultData);
            setDataSynch((prev: any) => {
              return { ...prev, delete: resultData };
            });
            // console.log("Tổng số lượng bản ghi delete:", totalRecords);
            setCount(totalRecords); //  bat dau dem tu day chu khong phai o tren
          })
          .catch((error) => {
            console.error("Lỗi khi lấy dữ liệu:", error);
          });
      }
    }, [isConnected])
  );



  const handleResetDatabase = async () => {
    await deleteDatabase();
    await initializeDatabase();
  };

  const refreshData = () => {
    getAllUser({}, isConnected);
    getAllChecklist({}, isConnected);
    getAllTask({}, isConnected);
    getAllObject({}, isConnected);
  };

  const fncUpdateStatus = async () => {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      await db.execAsync("UPDATE `User` set status='done';");
      await db.execAsync("DELETE FROM `tmp_delete`;");
      await db.execAsync("UPDATE `object` set status='done';");
      await db.execAsync("UPDATE `Checklist` set status='done';");
      await db.execAsync("UPDATE `checklist_task` set status='done';");
      await db.execAsync("UPDATE `detail_task` set status='done';");
      await db.execAsync("UPDATE `object_task` set status='done';");
      // await db.execAsync("UPDATE `standard_object` set status='done';");
      await db.execAsync("UPDATE `GroupObject` set status='done';");
      await db.execAsync("UPDATE `standard` set status='done';");
      await db.execAsync("UPDATE `Task` set status='done';");
      console.log("Update status thanh cong");
    } catch (error) {
      console.log("Update status khong thanh cong\n", error);
    }
  };

  const handleSynchronize = async () => {
    try {
      if (dataSynch.update) {
        if (dataSynch.update.object_task.count)
          updatePDF(dataSynch.update.object_task.data)

        if (dataSynch.update.detail_task.count)
          updateImage(dataSynch.update.detail_task.data)
      }
      await taskApi.asyncFromMobile(dataSynch);
      await fncUpdateStatus();
      await setCount(0);
      await Alert.alert("Thông báo", "Đồng bộ thành công.");
      refreshData();
    } catch (error) {
      Alert.alert("Thông báo", "Đồng bộ không thành công.");
      console.log("Đồng bộ không thành công.\n", error);
    }
  };

  const updatePDF = async (listData: any) => {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      listData.map(async (item: any) => {
        const statement = await db.prepareAsync(
          `SELECT name FROM task WHERE id = '${item.task_id}';`
        );
        const result = await statement.executeAsync();
        const taskName = await result.getAllAsync();

        const statement2 = await db.prepareAsync(
          `SELECT name, position FROM object WHERE id = '${item.object_id}';`
        );
        const result2 = await statement2.executeAsync();
        const objectData = await result2.getAllAsync();
        const customFileName = generateFileName(taskName[0].name, objectData[0].position, objectData[0].name, ".pdf"); // -> "DDMMYY_HHMMSS_TenViTri_TenDoiTuong.png"

        try {
          const formDataObjectTask = new FormData();

          formDataObjectTask.append("files", {
            uri: item.mobile_pdf_path,
            name: customFileName,
            type: "application/pdf",
          });
          formDataObjectTask.append("custom_filename", customFileName);
          formDataObjectTask.append("task_name", taskName[0].name);
          formDataObjectTask.append("mobile_pdf_path", item.mobile_pdf_path as any);
          await taskApi.updatePDF(item.id, formDataObjectTask);
        } catch (error: any) {
          Alert.alert("Thông báo", "Cập nhật file pdf thất bại (ObjectTask)\n" + error.responses.message, [
            { text: "OK" },
          ]);
        }
      })
    } catch (error: any) {
      Alert.alert("Thông báo", "Cập nhật file pdf thất bại (ObjectTask)\n" + error.responses.message, [
        { text: "OK" },
      ]);
    }
  }


  const updateImage = async (listData: any) => {
    try {
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });
      listData.map(async (item: any) => {
        try {
          const statement = await db.prepareAsync(
            `SELECT 
              t.name as task_name,
              o.name as object_name,
              o.position
            FROM object_task ot
            JOIN task t ON ot.task_id = t.id
            JOIN object o ON ot.object_id = o.id
            WHERE ot.id = '${item.object_task_id}';`
          );
          const result = await statement.executeAsync();
          const data = await result.getAllAsync();
          const customFileName = generateFileName(data[0].task_name, data[0].position, data[0].object_name!, ".jpeg"); // -> "DDMMYY_HHMMSS_TenViTri_TenDoiTuong.png"


          const formDataObjectTask = new FormData();
          formDataObjectTask.append("files", {
            uri: item.mobile_path,
            name: customFileName,
            type: "image/jpeg",
          });
          formDataObjectTask.append("custom_filename", customFileName);
          formDataObjectTask.append("task_name", data[0].task_name);

          formDataObjectTask.append("mobile_path", item.mobile_path as any);

          await taskApi.updateProcess({ id: item.id }, formDataObjectTask);
        } catch (error: any) {
          Alert.alert("Thông báo", "Cập nhật file pdf thất bại (ObjectTask)\n" + error.responses.message, [
            { text: "OK" },
          ]);
        }
      })
    } catch (error: any) {
      Alert.alert("Thông báo", "Cập nhật file pdf thất bại (ObjectTask)\n" + error.responses.message, [
        { text: "OK" },
      ]);
    }
  }

  const [isCnt, setIsCnt] = useState(false)
  const checkHealth = async () => {
    if (!isWeb) {
      try {
        const data = await authApi.checkHealth();
        setIsCnt(true)
      } catch (error: any) {
        setIsCnt(false)
      }
    }
  };

  const handleChangeOption = async (value: boolean) => {
    Alert.alert("Thông báo xác nhận", `Bạn có muốn chuyển sang chế độ ${value ? "Online" : "Offline"} và thực hiện đồng bộ dữ liệu?\nLưu ý, ${!value ? "khi thực hiện đồng bộ dữ liệu trên máy này sẽ bị xóa hết và sao chép dữ liệu từ server về." : "khi thực hiện đồng bộ dữ liệu thay đổi sẽ được lưu trên server."}`, [
      {
        text: "Đồng bộ dữ liệu", onPress: () => {
          setIsConnected(value)

          if (value) {
            // chuyen sang che do online
            // Đồng bộ dữ liệu offline -> online
            handleSynchronize();
          }
          else
            //  lấy toàn bộ dữ liệu online về offline
            asyncAllData();
        }
      },
      {
        text: "Chuyển chế độ", onPress: () => {
          setIsConnected(value)
        }
      },
      { text: "Hủy" },
    ]);
  }


  console.log("isConnected", isConnected);

  return (
    <View style={styles.container}>
      <Box p={4}>
        <VStack space={4}>
          <View>
            <Button icon="plus" mode="contained" onPress={handleResetDatabase}>
              Reset DB
            </Button>

            {!isWeb && <View>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Bạn đang ở chế độ:{" "}
                <Switch style={{ height: 12 }} value={isConnected} onValueChange={handleChangeOption} />

                <Text style={{ color: isConnected ? "green" : "red" }}>
                  {isConnected ? "Online" : "Offline"}
                </Text>
              </Text>
            </View>}
            {count > 0 && isCnt && (
              <View>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  Bạn cần đồng bộ dữ liệu từ mobile lên server. {""}
                  <Text style={{ color: "red" }} onPress={handleSynchronize}>
                    Đồng bộ ngay
                  </Text>
                </Text>
              </View>
            )}
            <TextComponent style={styles.titleCell} bold fontSize={30}>
              Thống kê
            </TextComponent>

            <HStack style={{ display: "flex", flexWrap: "wrap" }}>
              <StatisticCard
                title="Số lượng nhiệm vụ"
                iconName="tasks"
                value={taskState.data.get().length}
              />
              <StatisticCard
                title="Số lượng checklist"
                iconName="list-alt"
                value={checklistState.data.get().length}
              />
              <StatisticCard
                title="Số lượng người dùng"
                iconName="users"
                value={userState.data.get().length}
              />
            </HStack>
          </View>

          <View>
            <TextComponent style={styles.titleCell} bold fontSize={30}>
              Nhiệm vụ
            </TextComponent>
            <HStack style={{ display: "flex", flexWrap: "wrap" }}>
              <StatisticCard
                title="Nhiệm vụ đang thực hiện"
                iconName="star-of-life"
                value={
                  taskState.data.get().length -
                  countCompleteTask(taskState.data.get())
                }
              />
              <StatisticCard
                title="Nhiệm vụ đã hoàn thành"
                iconName="user-check"
                value={countCompleteTask(taskState.data.get())}
              />
            </HStack>
          </View>

          {/* <View>
              <TextComponent style={styles.titleCell} bold fontSize={30}>
                Thống kê nhiệm vụ và Checklist
              </TextComponent>

              <Bar />
            </View> */}
        </VStack>
      </Box>
    </View>
  );
};

export default Home;
