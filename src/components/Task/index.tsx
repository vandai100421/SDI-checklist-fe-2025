import { Box, HStack, Input } from "native-base";
import * as React from "react";
import { View, Alert, ScrollView } from "react-native";

import { Button, Card, DataTable, Icon, Text } from "react-native-paper";
import StatisticCard from "../StatisticCard";
import ModalControl from "./subcomponents/ModalControl";
import { } from "react-native-gesture-handler";
import { useHookstate } from "@hookstate/core";
import taskStore, {
  createTask,
  deleteTask,
  getAllTask,
  getDetailTask,
  updateTask,
  asyncData,
  getAllData,
  createListTask,
  createListObjectTask,
  createListDetailTask,
  createListChecklistTask,
} from "./store";
import { TypeTask } from "@/src/types/task";
import { styles } from "../../styles/styles";
import TextComponent from "@components/Lib/Text";
import checklistStore, {
  createListCheckList,
  getAllChecklist,
} from "@components/Checklist/store";
import initializeDatabase from "@/src/database/db";
import * as SQLite from "expo-sqlite";

import moment from "moment";

import { createListObject } from "@components/Object/store";
import { createListStandard } from "@components/TaskDetail/store";
import { createListUser } from "@components/User/store";
import { isWeb } from "@utils/deviceInfo";
import PopupConfirm from "@components/Lib/PopupConfirm";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/src/provider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { countCompleteTask } from "@utils/common";
import { createListGroupObject } from "@components/GroupObject/store";
import TienDoTag from "@components/TienDoTag";
import ProcessTag from "@components/ProcessTag";
const initData: TypeTask = {
  id: 0,
  name: "",
  position: "",
  process: "",
  creator: "",
  pic: "",
  worker: "",
  started_at: "",
  ended_at: "",
};

type Props = {
  routeToDetail: (id: number) => void;
};

const Task: React.FC<Props> = ({ routeToDetail }) => {
  const taskState = useHookstate(taskStore);

  const checklistState = useHookstate(checklistStore);
  const [refresh, setRefresh] = React.useState(false);
  const [page, setPage] = React.useState<number>(0);
  const [formData, setData] = React.useState<TypeTask>(initData);
  const [editData, setEditData] = React.useState<any | undefined>();
  const [checklist, setChecklist] = React.useState<any>([]);
  const [isFocus, setIsFocus] = React.useState<boolean>(false);

  const [selectedChecklist, setSelectedChecklist] = React.useState();
  const { isAdmin, isConnected, checkOnline } = React.useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      checkOnline();
      getAllTask({}, isConnected);
    }, [])
  );

  const dataChecklist = checklistState.data.get().map((item: any) => {
    return { value: item.id.toString(), label: item.name };
  });

  const check = async () => {
    try {
      // await initializeDatabase();

      // await initializeDatabase();
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });
      // console.log(db);

      // const data2: any = await db.getAllAsync("SELECT * FROM checklist_task");

      // const taskDB: any = await db.getAllAsync("SELECT * FROM task");
      // const users: any = await db.getAllAsync("SELECT * FROM user");
      const object_task: any = await db.getAllAsync(
        "SELECT * FROM object_task"
      );
      // const allRows2: any = await db.getAllAsync("SELECT * FROM object");
      // const allRows4: any = await db.getAllAsync("SELECT * FROM standard");
      // const allRows3: any = await db.getAllAsync("SELECT * FROM checklist");
      // const allRows5: any = await db.getAllAsync("SELECT * FROM GroupObject");
      const detail_task: any = await db.getAllAsync(
        "SELECT * FROM detail_task"
      );
      // console.log(taskDB);
      // const typeChecklist: any = await db.getAllAsync("SELECT * FROM checklist");
      console.log(object_task);

      const res = await asyncData(
        JSON.stringify({
          // object: allRows2,
          object_task: object_task,
          // task: taskDB,
          // check_list: allRows3,
          // checklist_task: data2,
          // standard: allRows4,
          // user: users,
          standard_task: detail_task,
          // group_object: allRows5,
          // standard_task
        })
      );

      // await db.runAsync("DELETE FROM checklist_task");
      await db.runAsync("DELETE FROM detail_task");
      await db.runAsync("DELETE FROM object_task");
      // await db.runAsync("DELETE FROM standard");
      // await db.runAsync("DELETE FROM object");
      // await db.runAsync("DELETE FROM GroupObject");
      // await db.runAsync("DELETE FROM checklist");
      // await db.runAsync("DELETE FROM task");
      // await db.runAsync("DELETE FROM user");
      // console.log(res?.data);
    } catch (e) {
      console.log(e);
    }
  };

  // React.useEffect(() => {
  //   const check = async () => {
  //     try {
  //       await initializeDatabase();
  //       const db = await SQLite.openDatabaseAsync("sdi-checklist.db");
  //       const data2: any = await db.getAllAsync("SELECT * FROM checklist_task");
  //       const taskDB: any = await db.getAllAsync("SELECT * FROM task");
  //       const users: any = await db.getAllAsync("SELECT * FROM user");
  //       const allRows: any = await db.getAllAsync("SELECT * FROM object_task");
  //       const allRows2: any = await db.getAllAsync("SELECT * FROM object");
  //       const allRows4: any = await db.getAllAsync("SELECT * FROM standard");
  //       const allRows3: any = await db.getAllAsync("SELECT * FROM checklist");
  //       const detail_task: any = await db.getAllAsync("SELECT * FROM detail_task");
  //       // const typeChecklist: any = await db.getAllAsync("SELECT * FROM checklist");

  //       const res = await asyncData(JSON.stringify({
  //         object: allRows2,
  //         object_task: allRows,
  //         task: taskDB,
  //         check_list: allRows3,
  //         checklist_task: data2,
  //         standard: allRows4,
  //         user:users,
  //         standard_task:detail_task
  //         // standard_task
  //       }))
  //       await db.runAsync('DELETE FROM checklist_task')
  //       await db.runAsync('DELETE FROM detail_task')
  //       await db.runAsync('DELETE FROM object_task')
  //       await db.runAsync('DELETE FROM standard')
  //       await db.runAsync('DELETE FROM object')
  //       await db.runAsync('DELETE FROM checklist')
  //       await db.runAsync('DELETE FROM task')
  //       await db.runAsync('DELETE FROM user')
  //       console.log(res);

  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   if (isConnected) {
  //     check();
  //   }
  // }, [isConnected]);

  React.useEffect(() => {
    getAllChecklist();
    getAllTask({}, isConnected);
  }, [refresh]);

  const search = async () => {
    await getAllTask({}, isConnected);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Thông báo xác nhận", "Bạn có muốn xóa dữ liệu này không?", [
      { text: "OK", onPress: () => deleteItem(id) },
      { text: "Hủy" },
    ]);
    if (isWeb) {
      setSelectedItemId(id);
      setIsVisibleConfirmDelete(true);
      // deleteItem(id);
    }
  };

  const deleteItem = async (id: number) => {
    await deleteTask(id, isConnected);
    await getAllTask({}, isConnected);
  };
  const clickUpdate = async (data: any) => {
    getDetailTask(
      {
        task_id: data.id,
      },
      isConnected
    );
    setEditData(data);
    setVisibleModalControl(true);
  };

  const [numberOfItemsPerPageList] = React.useState([10, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, taskState.data.get().length);

  // filter and search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortAscending, setSortAscending] = React.useState<boolean>(true);


  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }
  };

  const sortedData = React.useMemo(() => {
    const filtered = taskState.data.get().filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [taskState.data.get(), sortColumn, sortAscending, searchQuery]);

  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);

  const handleOpenModalControl = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
  };

  const handleCloseModalControl = () => {
    setVisibleModalControl(false);
  };

  const handleSubmit = async (data: TypeTask) => {
    if (!editData) {
      await createTask(data, isConnected);
      await getAllTask({}, isConnected);
      setVisibleModalControl(false);
    } else {
      await updateTask(data, isConnected);
      await getAllTask({}, isConnected);
      setVisibleModalControl(false);
    }
  };
  const asyncAllData = async () => {
    try {
      await initializeDatabase();
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });
      const data2: any = await db.getAllAsync("SELECT * FROM checklist_task");
      console.log(data2);
      await db.runAsync("DELETE FROM checklist_task");
      await db.runAsync("DELETE FROM detail_task");
      await db.runAsync("DELETE FROM object_task");
      await db.runAsync("DELETE FROM standard");
      await db.runAsync("DELETE FROM object");
      await db.runAsync("DELETE FROM GroupObject");
      await db.runAsync("DELETE FROM checklist");
      await db.runAsync("DELETE FROM task");
      await db.runAsync("DELETE FROM user");
      const res: any = await getAllData();

      // console.log(res.data.object);

      await createListCheckList(res.data.check_list);
      await createListGroupObject(res.data.group_object);
      await createListObject(res.data.object);
      await createListTask(res.data.task);
      await createListUser(res.data.users);
      await createListStandard(res.data.standard);
      await createListObjectTask(res.data.object_task);
      await createListDetailTask(res.data.standard_task);
      await createListChecklistTask(res.data.checklist_task);
      setRefresh(!refresh);
      Alert.alert(
        "Thông báo",
        "Đồng bộ dữ liệu thành công. Toàn bộ dữ liệu đã được sao lưu về máy.",
        [{ text: "OK" }]
      );
      // await createListStandard(res.data.standard)
      // await createListObject(res.object)
    } catch (e: any) {
      Alert.alert(
        "Thông báo",
        "Đồng bộ thất bại\n" + e.responses.massage,
        [{ text: "OK" }]
      );
    }
  };

  const clickDetail = (item: any) => {
    if (!isWeb) {
      AsyncStorage.setItem("task_creator", item.creator);
      AsyncStorage.setItem("task_started_at", item.started_at);
      AsyncStorage.setItem("task_ended_at", item.ended_at);
      AsyncStorage.setItem("task_name", item.name);
      AsyncStorage.setItem("task_process", item.process);
    } else {
      sessionStorage.setItem("task_creator", item.creator);
      sessionStorage.setItem("task_started_at", item.started_at);
      sessionStorage.setItem("task_ended_at", item.ended_at);
      sessionStorage.setItem("task_name", item.name);
      sessionStorage.setItem("task_process", item.process);
    }
    getDetailTask(
      {
        task_id: item.id,
      },
      isConnected
    );
    routeToDetail(item.id);
  };

  const [isVisibleConfirmDelete, setIsVisibleConfirmDelete] =
    React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<any>("");
  const handleConfirm = async () => {
    await deleteItem(selectedItemId);
    setIsVisibleConfirmDelete(false);
  };

  return (
    <ScrollView>
      <Box p={4}>
        <TextComponent style={styles.titleCell} bold fontSize={30}>
          Thống kê
        </TextComponent>
        <HStack>
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
      </Box>

      <Box p="4">
        <TextComponent style={styles.titleCell} bold fontSize={30}>
          Danh sách nhiệm vụ
        </TextComponent>

        <HStack space={4} pb={4} justifyContent={"space-between"}>
          <Input
            placeholder="Tìm kiếm theo tên"
            variant="outline"
            width={200}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {isWeb && <Button icon="plus" mode="contained" onPress={handleOpenModalControl}>
            Thêm mới nhiệm vụ
          </Button>}
        </HStack>
        <View style={{ flex: 1 }}>
          <Card>
            {taskState.data.get().length > 0 ? (
              <DataTable style={styles.table}>
                <DataTable.Header>
                  <DataTable.Title style={styles.center}>STT</DataTable.Title>
                  <DataTable.Title style={styles.center} onPress={() => handleSort("name")}>
                    Tên nhiệm vụ {sortColumn === "name" && (sortAscending ? " ▲" : " ▼")}
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Tiến độ
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    NG
                  </DataTable.Title>
                  <DataTable.Title style={styles.center} onPress={() => handleSort("creator")}>
                    Người tạo {sortColumn === "creator" && (sortAscending ? " ▲" : " ▼")}
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Ngày tạo
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Thời hạn hoàn thành
                  </DataTable.Title>
                  <DataTable.Title style={styles.center}>
                    Hành động
                  </DataTable.Title>
                </DataTable.Header>

                {sortedData.map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell numeric style={styles.cell}>
                      {index + 1}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <Text numberOfLines={0} style={{ width: "100%" }}>
                        {item.name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <TienDoTag status={item.process || ""} />
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      {item.totalNG && <ProcessTag status={item.totalNG} />}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <Text>
                        {item.creator}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <Text>

                        {item.started_at
                          ? moment(new Date(item.started_at)).format(
                            "DD/MM/YYYY"
                          )
                          : ""}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <Text>
                        {item.ended_at
                          ? moment(new Date(item.ended_at)).format(
                            "DD/MM/YYYY"
                          )
                          : ""}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <HStack>
                        <Button
                          onPress={() => {
                            clickDetail(item);
                          }}
                        >
                          <Icon
                            source="information-outline"
                            color="gray"
                            size={20}
                          />
                        </Button>
                        {isConnected && isWeb && isAdmin && <View style={{ display: "flex", flexDirection: "row" }}>
                          {/* <Button onPress={() => clickUpdate(item)}>
                            <Icon
                              source="pencil-box"
                              color="warning"
                              size={20}
                            />
                          </Button> */}
                          <Button onPress={() => handleDelete(item.id)}>
                            <Icon source="close-box" color="orange" size={20} />
                          </Button>
                        </View>}
                      </HStack>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
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
      </Box>
      {visibleModalControl && (
        <ModalControl
          data={editData}
          visible={visibleModalControl}
          closeModal={handleCloseModalControl}
          submit={handleSubmit}
        />
      )}
      {isVisibleConfirmDelete && (
        <PopupConfirm
          title="Thông báo xác nhận"
          message="Bạn có muốn xóa dữ liệu này?"
          onCancel={() => setIsVisibleConfirmDelete(false)}
          visible={isVisibleConfirmDelete}
          onConfirm={handleConfirm}
        />
      )}
    </ScrollView>
  );
};

export default Task;
