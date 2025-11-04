import { Box, HStack, Input } from "native-base";
import * as React from "react";
import { Alert, Platform, View } from "react-native";
import { Button, Card, DataTable, Icon, Text } from "react-native-paper";
import ModalControl from "./subcomponents/ModalControl";
import { ScrollView } from "react-native-gesture-handler";
import groupObjectStore, {
  createGroupObject,
  deleteGroupObject,
  getAllGroupObject,
  updateGroupObject,
  uploadGroupObject,
} from "./store";
import { useHookstate } from "@hookstate/core";
import { COLORS } from "@config";
import { styles } from "../../styles/styles";
import TextComponent from "@components/Lib/Text";
import { isWeb } from "@utils/deviceInfo";
import PopupConfirm from "@components/Lib/PopupConfirm";
import NetInfo from "@react-native-community/netinfo";
import { AuthContext } from "@/src/provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditableTable from "@components/EditableTable";
import Table from "@components/TestTable";
import { useState } from "react";
import { TypeGroupObject } from "@/src/types/groupObject";
import { globalMessage } from "@components/Lib/GlobalMessage";

type Props = {
  routeToDetail: (id: number) => void;
};

const GroupObject: React.FC<Props> = ({ routeToDetail }) => {
  const groupObjectState = useHookstate(groupObjectStore);
  console.log('groupObjectState', groupObjectState.get().data);

  const [page, setPage] = React.useState<number>(0);
  const [editData, setEditData] = React.useState<TypeGroupObject | undefined>();
  const [type, setType] = React.useState("text");
  const { isAdmin, isConnected, checkOnline } = React.useContext(AuthContext);
  // Fetch the current connection status on mount



  useFocusEffect(
    React.useCallback(() => {
      checkOnline();
      console.log("isConnected=====", isConnected);
      getAllGroupObject({}, isConnected);
    }, [])
  );

  const search = async () => {
    await getAllGroupObject({ name: searchQuery }, isConnected);
  };

  const handleSubmit = async (data: TypeGroupObject) => {
    if (
      groupObjectState.data.get().some((obj: any) => obj.name === data.name)
    ) {
      if (isWeb) {
        globalMessage.show(
          "Thông báo",
          "Dữ liệu này đã tồn tại. Vui lòng thử lại."
        );
      } else {
        Alert.alert("Thông báo", "Dữ liệu này đã tồn tại. Vui lòng thử lại.", [
          { text: "OK" },
        ]);
      }
      return;
    }
    if (!editData) {
      if (type === "file") {
        await uploadGroupObject(data);
      } else {
        await createGroupObject(data, isConnected);
      }
      setVisibleModalControl(false);
      getAllGroupObject({}, isConnected);
    } else {
      try {
        await updateGroupObject(data, isConnected);
        await getAllGroupObject({}, isConnected);
        setVisibleModalControl(false);
      } catch (error) {
        console.error(error);
      }
    }
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
    await deleteGroupObject(id, isConnected);
    await getAllGroupObject({}, isConnected);
  };
  const clickUpdate = async (data: any) => {
    setEditData(data);
    setVisibleModalControl(true);
  };

  const [itemsPerPage, onItemsPerPageChange] = React.useState(10);

  const from = page * itemsPerPage;
  const to = Math.min(
    (page + 1) * itemsPerPage,
    groupObjectState.data.get().length
  );


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
    const filtered = groupObjectState.data.get().filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [groupObjectState.data.get(), sortColumn, sortAscending, searchQuery]);


  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);

  const handleOpenModalControl = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
    setType("text");
  };

  const [controlling, setControlling] = React.useState(false);

  const handleOpenModalControlFile = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
    setType("file");
  };
  const handleCloseModalControl = () => {
    setVisibleModalControl(false);
  };

  const [isVisibleConfirmDelete, setIsVisibleConfirmDelete] =
    React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<any>("");
  const handleConfirm = async () => {
    await deleteItem(selectedItemId);
    setIsVisibleConfirmDelete(false);
  };

  React.useEffect(() => {
    search();
  }, [searchQuery]);

  const clickDetail = (item: any) => {
    if (!isWeb) {
      AsyncStorage.setItem("group_object_name", item.name);
    } else {
      sessionStorage.setItem("group_object_name", item.name);
    }
    routeToDetail(item.id);
  };
  return (
    <ScrollView>
      <Box p="4">
        {!controlling && (
          <HStack space={4} pb={4} justifyContent={"space-between"}>
            <Input
              placeholder="Tìm kiếm theo tên"
              variant="outline"
              width={200}
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            <HStack space={4}>
              {isWeb && <Button
                icon="plus"
                mode="contained"
                onPress={handleOpenModalControl}
              >
                Thêm mới
              </Button>
              }
              {Platform.OS === "web" && (
                <Button
                  icon="plus"
                  mode="contained"
                  onPress={handleOpenModalControlFile}
                >
                  Thêm mới từ file
                </Button>
              )}
            </HStack>
          </HStack>
        )}
        <Card>
          {groupObjectState.data.get().length > 0 ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.center}>STT</DataTable.Title>

                <DataTable.Title style={styles.center} onPress={() => handleSort('name')}>
                  Tên nhóm đối tượng {sortColumn === 'name' && (sortAscending ? ' ▲' : ' ▼')}
                </DataTable.Title>

                <DataTable.Title style={styles.center}>Hành động</DataTable.Title>
              </DataTable.Header>

              {controlling && (
                <DataTable.Row key={"item.id"}>
                  <DataTable.Cell numeric style={styles.cell}>
                    {"index" + 1}
                  </DataTable.Cell>
                  <DataTable.Cell
                    style={[styles.cell, { justifyContent: "flex-start" }]}
                  >
                    <Text numberOfLines={0} style={{ width: "100%" }}>
                      {"item.name"}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <HStack>
                      <Button onPress={() => clickDetail("item")}>
                        Xac nhan
                      </Button>
                      <Button onPress={() => setControlling(false)}>Huy</Button>
                    </HStack>
                  </DataTable.Cell>
                </DataTable.Row>
              )}

              {sortedData
                .map((item, index) => (
                  <DataTable.Row key={item.id}>
                    <DataTable.Cell numeric style={styles.cell}>
                      {index + 1}
                    </DataTable.Cell>
                    <DataTable.Cell
                      style={[styles.cell, { justifyContent: "flex-start" }]}
                    >
                      <Text numberOfLines={0} style={{ width: "100%" }}>
                        {item.name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <HStack>
                        <Button onPress={() => clickDetail(item)}>
                          <Icon
                            source="information-outline"
                            color="gray"
                            size={20}
                          />
                        </Button>
                        {isWeb && isAdmin && <View style={{ display: "flex", flexDirection: "row" }}>
                          <Button onPress={() => clickUpdate(item)}>
                            <Icon source="pencil-box" color="warning" size={20} />
                          </Button>
                          <Button onPress={() => handleDelete(item.id)}>
                            <Icon source="close-box" color="orange" size={20} />
                          </Button>
                        </View>}
                      </HStack>

                    </DataTable.Cell>
                  </DataTable.Row>
                ))}

              {/* <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(
                  groupObjectState.data.get().length / itemsPerPage
                )}
                onPageChange={(page) => setPage(page)}
                label={`${page + 1} of ${Math.ceil(
                  groupObjectState.data.get().length / itemsPerPage
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
      </Box>
      {visibleModalControl && (
        <ModalControl
          data={editData}
          visible={visibleModalControl}
          closeModal={handleCloseModalControl}
          submit={handleSubmit}
          type={type}
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

export default GroupObject;
