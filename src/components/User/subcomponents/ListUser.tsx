import React, { useCallback, useContext, useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { Text, Box, Input, HStack } from "native-base";
import { Card, DataTable, Button, Icon } from "react-native-paper";
import ModalControl from "./ModalControl";
import userStore, {
  createUser,
  deleteUser,
  getAllUser,
  updateUser,
} from "../store";
import { useHookstate } from "@hookstate/core";
import { TypeUser } from "@/src/types/user";
import TextComponent from "@components/Lib/Text";
import { styles } from "@/src/styles/styles";
import { isWeb } from "@utils/deviceInfo";
import PopupConfirm from "@components/Lib/PopupConfirm";
import NetInfo from "@react-native-community/netinfo";
import { AuthContext } from "@/src/provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";

const User = () => {
  const userState = useHookstate(userStore);

  const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(10);
  const [page, setPage] = React.useState<number>(0);
  const { isConnected, checkOnline, isAdmin } = useContext(AuthContext);


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
    const filtered = userState.data.get().filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [userState.data.get(), sortColumn, sortAscending, searchQuery]);


  useFocusEffect(
    useCallback(() => {
      checkOnline();
      getAllUser({}, isConnected);
    }, [])
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, userState.data.get().length);

  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);

  const handleOpenModalControl = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
  };

  const handleCloseModalControl = () => {
    setVisibleModalControl(false);
  };

  const refreshData = async () => {
    await getAllUser({}, isConnected);
  };

  ///// edit

  const [editData, setEditData] = useState<TypeUser | undefined>();

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
    await deleteUser(id, isConnected);
    await getAllUser({}, isConnected);
  };
  const clickUpdate = async (data: TypeUser) => {
    setEditData(data);
    setVisibleModalControl(true);
  };

  const handleSubmit = async (data: TypeUser) => {
    if (!editData) {
      await createUser(data, isConnected);
      setVisibleModalControl(false);
      getAllUser({}, isConnected);
    } else {
      try {
        await updateUser(data, isConnected);
        await getAllUser({}, isConnected);
        setVisibleModalControl(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const [isVisibleConfirmDelete, setIsVisibleConfirmDelete] =
    React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<any>("");
  const handleConfirm = async () => {
    await deleteItem(selectedItemId);
    setIsVisibleConfirmDelete(false);
  };

  return (
    <Box p="4">
      <HStack space={4} pb={4} pt={2} justifyContent={"space-between"}>
        {/* <Input placeholder="Tìm kiếm theo tên" w="200" /> */}

        <Input
          placeholder="Tìm kiếm theo tên"
          variant="outline"
          width={200}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <Button icon="plus" mode="contained" onPress={handleOpenModalControl}>
          Thêm mới
        </Button>
      </HStack>
      <Card>
        {userState.data.get().length > 0 ? (
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={styles.center}>STT</DataTable.Title>

              <DataTable.Title style={styles.center} onPress={() => handleSort("name")}>
                Họ tên {sortColumn === "name" && (sortAscending ? " ▲" : " ▼")}
              </DataTable.Title>

              <DataTable.Title style={styles.center} onPress={() => handleSort("email")}>
                Email {sortColumn === "email" && (sortAscending ? " ▲" : " ▼")}
              </DataTable.Title>

              <DataTable.Title style={styles.center} onPress={() => handleSort("username")}>
                Username {sortColumn === "username" && (sortAscending ? " ▲" : " ▼")}
              </DataTable.Title>

              <DataTable.Title style={styles.center} onPress={() => handleSort("company")}>
                Bộ phận {sortColumn === "company" && (sortAscending ? " ▲" : " ▼")}
              </DataTable.Title>

              <DataTable.Title style={styles.center}>Hành động</DataTable.Title>
            </DataTable.Header>


            {sortedData
              .map((item, index) => (
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
                    {item.email}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.username}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.company}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <HStack>
                      <Button onPress={() => clickUpdate(item)}>
                        <Icon source="pencil-box" color="warning" size={20} />
                      </Button>
                      <Button onPress={() => handleDelete(item.id)}>
                        <Icon source="close-box" color="orange" size={20} />
                      </Button>
                    </HStack>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

            {/* <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(
                userState.data.get().length / itemsPerPage
              )}
              onPageChange={(page) => setPage(page)}
              label={`${from + 1}-${to} of ${userState.data.get().length}`}
              numberOfItemsPerPageList={numberOfItemsPerPageList}
              onItemsPerPageChange={onItemsPerPageChange}
              showFastPaginationControls
              selectPageDropdownLabel={"Rows per page"}
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
      <ModalControl
        visible={visibleModalControl}
        closeModal={handleCloseModalControl}
        data={editData}
        submit={handleSubmit}
      />
      {isVisibleConfirmDelete && (
        <PopupConfirm
          title="Thông báo xác nhận"
          message="Bạn có muốn xóa dữ liệu này?"
          onCancel={() => setIsVisibleConfirmDelete(false)}
          visible={isVisibleConfirmDelete}
          onConfirm={handleConfirm}
        />
      )}
    </Box>
  );
};

export default User;
