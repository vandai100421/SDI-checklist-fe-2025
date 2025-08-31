import { Box, HStack, Input } from "native-base";
import * as React from "react";
import { Alert, Pressable, View } from "react-native";
import { Button, Card, DataTable, Icon, Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import taskDetailStore, { getAllTaskDetail } from "./store";
import { useHookstate } from "@hookstate/core";
import { styles } from "../../styles/styles";
import TextComponent from "@components/Lib/Text";
import { getAllTaskObjectDetail } from "@components/TaskObjectDetail/store";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/src/provider/AuthProvider";
import { isWeb } from "@utils/deviceInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from '@expo/vector-icons/Entypo';
import moment from "moment";
import ProcessTag from "@components/ProcessTag";

type Props = {
  id: number;
  routeToDetail: (id: number) => void;
};

const TaskDetail: React.FC<Props> = ({ id, routeToDetail }) => {
  const taskDetailState = useHookstate(taskDetailStore);
  const [page, setPage] = React.useState<number>(0);
  const { isConnected, isAdmin, checkOnline } = React.useContext(AuthContext);

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
    const filtered = taskDetailState.data.get().filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [taskDetailState.data.get(), sortColumn, sortAscending, searchQuery]);


  useFocusEffect(
    React.useCallback(() => {
      checkOnline();
      getAllTaskDetail({ task_id: id }, isConnected);
      getDetail();
    }, [id])
  );

  const [itemsPerPage, onItemsPerPageChange] = React.useState(10);

  const from = page * itemsPerPage;
  const to = Math.min(
    (page + 1) * itemsPerPage,
    taskDetailState.data.get().length
  );

  // // filter and search
  // const [searchQuery, setSearchQuery] = React.useState("");

  const linkToTaskObjectDetail = (item: any) => {
    console.log(item);
    if (!isWeb) {
      AsyncStorage.setItem("object_task_name", item.name);
      AsyncStorage.setItem("object_task_manage", item.manage);
      AsyncStorage.setItem("object_task_process", item.process);
      AsyncStorage.setItem("object_task_object_id", item.object_id);
      AsyncStorage.setItem("object_task_position", item.position);
    } else {
      sessionStorage.setItem("object_task_name", item.name);
      sessionStorage.setItem("object_task_manage", item.manage);
      sessionStorage.setItem("object_task_process", item.process);
      sessionStorage.setItem("object_task_object_id", item.object_id);
      sessionStorage.setItem("object_task_position", item.position);
    }
    taskDetailState.merge({ selectedItem: item });
    routeToDetail(item.id);
  };

  const [detail, setDetail] = React.useState<any>();
  const getDetail = async () => {
    if (!isWeb) {
      setDetail({
        creator: (await AsyncStorage.getItem("task_creator")) as any,
        name: (await AsyncStorage.getItem("task_name")) as any,
        started_at: (await AsyncStorage.getItem("task_started_at")) as any,
        ended_at: (await AsyncStorage.getItem("task_ended_at")) as any,
        process: (await AsyncStorage.getItem("task_process")) as any,
      });
    } else {
      setDetail({
        creator: sessionStorage.getItem("task_creator") as any,
        name: (sessionStorage.getItem("task_name") as any) || "",
        started_at: sessionStorage.getItem("task_started_at") as any,
        ended_at: sessionStorage.getItem("task_ended_at") as any,
        process: sessionStorage.getItem("task_process") as any,
      });
    }
  };

  return (
    <ScrollView>
      <Box p={4}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.detailTitle}>Tên nhiệm vụ: </Text>
            <Text style={styles.detailText}>{detail ? detail.name : ""}</Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={styles.detailTitle}>Người tạo: </Text>
            <Text style={styles.detailText}>
              {detail ? detail.creator : ""}
            </Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={styles.detailTitle}>Tiến độ: </Text>
            <Text style={styles.detailText}>
              {detail ? detail.process : ""}
            </Text>
          </View>

          <HStack space={4}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Ngày tạo: </Text>
              <Text style={styles.detailText}>
                {detail
                  ? moment(new Date(detail.started_at)).format(
                    "DD/MM/YYYY"
                  )
                  : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.detailTitle}>Thời hạn hoàn thành: </Text>
              <Text style={styles.detailText}>
                {detail
                  ? moment(new Date(detail.ended_at)).format(
                    "DD/MM/YYYY"
                  )
                  : ""}
              </Text>
            </View>
          </HStack>

          <View style={{ flex: 1, marginTop: 16 }}>
            <HStack space={4} style={{ marginBottom: 12 }}>
              <Input
                placeholder="Tìm kiếm theo tên"
                variant="outline"
                width={200}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
            </HStack>
            <Card>
              {taskDetailState.data.get().length > 0 ? (
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title numeric style={styles.center} >
                      STT
                    </DataTable.Title>
                    <DataTable.Title style={styles.center} onPress={() => handleSort("name")}>
                      Tên đối tượng {sortColumn === "name" && (sortAscending ? " ▲" : " ▼")}
                    </DataTable.Title>
                    <DataTable.Title style={styles.center} onPress={() => handleSort("position")}>
                      Vị trí {sortColumn === "position" && (sortAscending ? " ▲" : " ▼")}
                    </DataTable.Title>
                    <DataTable.Title style={styles.center} onPress={() => handleSort("manage")}>
                      Bộ phận {sortColumn === "manage" && (sortAscending ? " ▲" : " ▼")}
                    </DataTable.Title>
                    <DataTable.Title style={styles.center} onPress={() => handleSort("process")}>
                      Tiến độ {sortColumn === "process" && (sortAscending ? " ▲" : " ▼")}
                    </DataTable.Title>

                    <DataTable.Title style={styles.center} onPress={() => handleSort('ng')}>
                      Số NG {sortColumn === 'ng' && (sortAscending ? ' ▲' : ' ▼')}
                    </DataTable.Title>
                    <DataTable.Title style={styles.center}>Hành động</DataTable.Title>
                  </DataTable.Header>



                  {sortedData.map((item, index) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell numeric style={styles.cell}>{from + index + 1}</DataTable.Cell>
                      <DataTable.Cell style={[styles.cell, { justifyContent: "flex-start" }]}>
                        <Text numberOfLines={0} style={{ width: "100%" }}>{item.name}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={[styles.cell, { justifyContent: "flex-start" }]}>
                        <Text numberOfLines={0} style={{ width: "100%" }}>{item.position}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={[styles.cell, { justifyContent: "flex-start" }]}>
                        <Text numberOfLines={0} style={{ width: "100%" }}>{item.manage}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.center}>
                        <ProcessTag status={item.process} />
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.center}>
                        {item.ng && <ProcessTag status={item.ng} />}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.center}>
                        <HStack>
                          <Button onPress={() => linkToTaskObjectDetail(item)}>
                            <Icon source="information-outline" color="gray" size={20} />
                          </Button>
                        </HStack>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}



                  {/* <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(
                    taskDetailState.data.get().length / itemsPerPage
                  )}
                  onPageChange={(page) => setPage(page)}
                  label={`${page + 1} of ${Math.ceil(
                    taskDetailState.data.get().length / itemsPerPage
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
        </View>
        {/* <TextComponent style={styles.titleCell} bold fontSize={30}>
          Danh sách đối tượng nhiệm vụ
        </TextComponent> */}


      </Box>
    </ScrollView>
  );
};

export default TaskDetail;
