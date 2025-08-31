import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { StackProps } from "@navigator/stack";
import { colors } from "@theme";
import { Text, Box, Heading, Input, Stack, HStack } from "native-base";
import { Card, DataTable, Button, PaperProvider } from "react-native-paper";
import ModalControl from "./ModalControl";
import * as SQLite from "expo-sqlite";
import userStore, { getAllUser } from "../store";
import initializeDatabase from "src/database/db";
import { useHookstate } from "@hookstate/core";
import { TypeUser } from "@/src/types/user";
import { green } from "react-native-reanimated/lib/typescript/reanimated2/Colors";

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.lightGrayPurple,
    height: "100%",
    padding: 24,
    paddingTop: 16,
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.lightPurple,
    height: 44,
    width: "50%",
  },
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  wrapper: { flexDirection: "row" },
  title: { flex: 1, backgroundColor: "#f6f8fa" },
  row: { height: 28 },
  text: { textAlign: "center" },
  cell: { marginRight: 10 },
  titleCell: { marginRight: 10 },
});

const User = () => {
  const userState = useHookstate(userStore);

  const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );
  const [items] = React.useState([
    {
      key: 1,
      name: "Cupcake",
      calories: 356,
      fat: 16,
    },
    {
      key: 2,
      name: "Eclair",
      calories: 262,
      fat: 16,
    },
    {
      key: 3,
      name: "Frozen yogurt",
      calories: 159,
      fat: 6,
    },
    {
      key: 4,
      name: "Gingerbread",
      calories: 305,
      fat: 3.7,
    },
  ]);

  const from = userState.page.get() * itemsPerPage;
  const to = Math.min((userState.page.get() + 1) * itemsPerPage, items.length);

  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);

  const handleOpenModalControl = () => {
    setEditData(null);
    setVisibleModalControl(true);
  };

  const handleCloseModalControl = () => {
    setVisibleModalControl(false);
  };

  const refreshData = async () => {
    await getAllUser();
  };

  React.useEffect(() => {
    getAllUser();
  }, [userState.page.get()]);

  const search = async () => {
    await getAllUser({
      page: userState.page.get(),
      pageSize: userState.pageSize.get(),
      name: "dai",
    });
  };

  ///// edit

  const [editData, setEditData] = useState<any>();

  const openModalEdit = (data: any) => {
    setEditData(data);
    setVisibleModalControl(true);
  };

  return (
    <PaperProvider>
      <ScrollView>
        <HStack space={4} py={4} justifyContent={"flex-end"}>
          <Button icon="plus" mode="contained" onPress={search}>
            Reset
          </Button>

          <Input placeholder="Tìm kiếm theo tên" w="200" />

          <Button icon="plus" mode="contained" onPress={handleOpenModalControl}>
            Thêm mới
          </Button>
        </HStack>
        <Card>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title numeric style={styles.titleCell}>
                STT
              </DataTable.Title>
              <DataTable.Title>Họ tên</DataTable.Title>
              <DataTable.Title>Email</DataTable.Title>
              <DataTable.Title>Username</DataTable.Title>
              <DataTable.Title>Bộ phận</DataTable.Title>
            </DataTable.Header>
            {userState.data.map((item: any, index: number) => (
              <DataTable.Row key={index}>
                <DataTable.Cell numeric style={styles.cell}>
                  {index}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Button onPress={() => openModalEdit(item.value)}>
                    {item.value.name}
                  </Button>
                </DataTable.Cell>
                <DataTable.Cell>{item.value.email}</DataTable.Cell>
                <DataTable.Cell>{item.value.username}</DataTable.Cell>
                <DataTable.Cell>{item.value.company}</DataTable.Cell>
              </DataTable.Row>
            ))}

            <DataTable.Pagination
              page={userState.page.get()}
              numberOfPages={Math.ceil(items.length / itemsPerPage)}
              onPageChange={(page) => userState.page.set(page)}
              label={`${from + 1}-${to} of ${items.length}`}
              numberOfItemsPerPageList={numberOfItemsPerPageList}
              numberOfItemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              showFastPaginationControls
              selectPageDropdownLabel={"Rows per page"}
            />
          </DataTable>
        </Card>
        <ModalControl
          visible={visibleModalControl}
          closeModal={handleCloseModalControl}
          refreshData={refreshData}
          editData={editData}
        />
      </ScrollView>
    </PaperProvider>
  );
};

export default User;
