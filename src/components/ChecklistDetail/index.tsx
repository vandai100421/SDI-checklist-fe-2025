import { Box, HStack, Input } from "native-base";
import * as React from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { Button, Card, DataTable, Icon, Text } from "react-native-paper";
import ModalControl from "./subcomponents/ModalControl";
import { ScrollView } from "react-native-gesture-handler";
import checklistStore, {
  createChecklistDetail,
  deleteChecklistDetail,
  getAllChecklistDetail,
  updateChecklistDetail,
} from "./store";
import { useHookstate } from "@hookstate/core";
import { styles } from "../../styles/styles";
import TextComponent from "@components/Lib/Text";
import { TypeStandard } from "@/src/types/standard";
import { isWeb } from "@utils/deviceInfo";
import PopupConfirm from "@components/Lib/PopupConfirm";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/src/provider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { fontSize } from "react-native-rapi-ui/constants/typography";

type Props = {
  id: number;
};

const ChecklistDetail: React.FC<Props> = ({ id }) => {
  const checklistState = useHookstate(checklistStore);
  const [page, setPage] = React.useState<number>(0);
  const [editData, setEditData] = React.useState<TypeStandard | undefined>();

  const { isAdmin, isConnected, checkOnline } = React.useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      checkOnline();
      getAllChecklistDetail({ checklist_id: id }, isConnected);
      getDetail();
    }, [])
  );

  const [detail, setDetail] = React.useState<any>();
  const getDetail = async () => {
    if (!isWeb) {
      setDetail({
        name: (await AsyncStorage.getItem("checklist_name")) as any,
      });
    } else {
      setDetail({
        name: (sessionStorage.getItem("checklist_name") as any) || "",
      });
    }
  };

  const search = async () => {
    await getAllChecklistDetail(
      { name: searchQuery, checklist_id: id },
      isConnected
    );
  };

  const handleSubmit = async (data: TypeStandard) => {
    if (!editData) {
      await createChecklistDetail({ ...data, stt: checklistState.data.get().length }, isConnected);
      setVisibleModalControl(false);
      getAllChecklistDetail({ checklist_id: id }, isConnected);
    } else {
      try {
        await updateChecklistDetail(data, isConnected);
        await getAllChecklistDetail({ checklist_id: id }, isConnected);
        setVisibleModalControl(false);
      } catch (error) {
        console.log(error);
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
    }
  };

  const deleteItem = async (_id: number) => {
    await deleteChecklistDetail(_id, isConnected);
    await getAllChecklistDetail({ checklist_id: id }, isConnected);
  };
  const clickUpdate = async (data: any) => {
    setEditData(data);
    setVisibleModalControl(true);
  };

  const [itemsPerPage, onItemsPerPageChange] = React.useState(10);

  const from = page * itemsPerPage;
  const to = Math.min(
    (page + 1) * itemsPerPage,
    checklistState.data.get().length
  );

  // filter and search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>("stt");
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
    const filtered = checklistState.data.get().filter((item) =>
      item.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [checklistState.data.get(), sortColumn, sortAscending, searchQuery]);


  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);

  const handleOpenModalControl = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
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

  const initData: TypeStandard = {
    id: uuidv4(),
    content: "",
    standard: "",
    content_method: "",
    check_list_id: id,
  };

  const [newRow, setNewRow] = useState(null); // Dòng mới
  const [formData, setFormData] = useState(initData); // Dữ liệu hiện tại

  const addNewRow = () => {
    setNewRow({ id: Date.now(), name: "" }); // Tạo dòng trống
  };

  const saveNewRow = async () => {
    if (
      formData.content === "" ||
      formData.content_method === "" ||
      formData.standard === ""
    ) {
      if (!isWeb) {
        Alert.alert("Cảnh báo!", "Vui lòng nhập đầy đủ dữ liệu!");
      } else {
        globalMessage.show("Cảnh báo!", "Vui lòng nhập đầy đủ dữ liệu!");
      }
    } else {
      await createChecklistDetail({ ...formData, stt: checklistState.data.get().length }, isConnected);
      await getAllChecklistDetail({ checklist_id: id }, isConnected);
      cancelNewRow();
    }
  };

  const cancelNewRow = () => {
    setFormData(initData);
    setNewRow(null); // Hủy bỏ dòng mới
  };

  return (
    <ScrollView>
      <Box p={4}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.detailTitle}>Tên checklist: </Text>
          <Text style={styles.detailText}>{detail ? detail.name : ""}</Text>
        </View>

        <HStack space={4} pb={4} pt={2} justifyContent={"space-between"}>

          <Input
            placeholder="Tìm kiếm theo nội dung"
            variant="outline"
            width={200}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <Button icon="plus" mode="contained" onPress={addNewRow}>
            Thêm mới
          </Button>
        </HStack>
        <View style={{ flex: 1 }}>
          <Card>
            {!checklistState.data.get().length && !newRow ? (
              <View style={styles.emptyBox}>
                <TextComponent fontSize={16}>
                  Không có dữ liệu nào. Vui lòng thêm mới dữ liệu.
                </TextComponent>
              </View>
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title numeric style={styles.center}>STT</DataTable.Title>

                  <DataTable.Title style={styles.center} onPress={() => handleSort('content')}>
                    Nội dung {sortColumn === 'content' && (sortAscending ? ' ▲' : ' ▼')}
                  </DataTable.Title>

                  <DataTable.Title style={styles.center} onPress={() => handleSort('standard')}>
                    Tiêu chuẩn tham chiếu {sortColumn === 'standard' && (sortAscending ? ' ▲' : ' ▼')}
                  </DataTable.Title>

                  <DataTable.Title style={styles.center} onPress={() => handleSort('method')}>
                    Phương pháp kiểm tra {sortColumn === 'method' && (sortAscending ? ' ▲' : ' ▼')}
                  </DataTable.Title>

                  {isAdmin && (
                    <DataTable.Title style={styles.center}>
                      Hành động
                    </DataTable.Title>
                  )}
                </DataTable.Header>


                {/* Dòng thêm mới */}
                {newRow && (
                  <DataTable.Row>
                    <DataTable.Cell style={styles.center}>-</DataTable.Cell>
                    <DataTable.Cell>
                      <TextInput
                        style={{
                          borderBottomWidth: 1,
                          padding: 5,
                        }}
                        multiline={true} // Cho phép nhập nhiều dòng
                        placeholder="Nhập nội dung ở đây"
                        value={formData.content}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, content: text }))
                        }
                      />
                    </DataTable.Cell>

                    <DataTable.Cell>
                      <TextInput
                        style={{
                          borderBottomWidth: 1,
                          padding: 5,
                        }}
                        multiline={true} // Cho phép nhập nhiều dòng
                        placeholder="Nhập tiêu chuẩn ở đây"
                        value={formData.standard}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, standard: text }))
                        }
                      />
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <TextInput
                        style={{
                          borderBottomWidth: 1,
                          padding: 5,
                        }}
                        multiline={true} // Cho phép nhập nhiều dòng
                        placeholder="Nhập phương pháp kiểm tra ở đây"
                        value={formData.content_method}
                        onChangeText={(text) =>
                          setFormData((prev) => ({
                            ...prev,
                            content_method: text,
                          }))
                        }
                      />
                    </DataTable.Cell>

                    <DataTable.Cell style={styles.center}>
                      <HStack>
                        <Button onPress={saveNewRow}>Lưu</Button>
                        <Button onPress={cancelNewRow} textColor="red">
                          Hủy
                        </Button>
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
                      <DataTable.Cell>
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.content}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.standard}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text numberOfLines={0} style={{ width: "100%" }}>
                          {item.content_method}
                        </Text>
                      </DataTable.Cell>
                      {isAdmin && <DataTable.Cell style={styles.cell}>
                        <HStack>
                          <Button onPress={() => clickUpdate(item)}>
                            <Icon
                              source="pencil-box"
                              color="warning"
                              size={20}
                            />
                          </Button>
                          <Button onPress={() => handleDelete(item.id)}>
                            <Icon source="close-box" color="orange" size={20} />
                          </Button>
                        </HStack>
                      </DataTable.Cell>}
                    </DataTable.Row>
                  ))}

                {/* <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(
                    checklistState.data.get().length / itemsPerPage
                  )}
                  onPageChange={(page) => setPage(page)}
                  label={`${page + 1} of ${Math.ceil(
                    checklistState.data.get().length / itemsPerPage
                  )}`}
                  showFastPaginationControls
                /> */}
              </DataTable>
            )}
          </Card>
        </View>
      </Box>
      {visibleModalControl && id && (
        <ModalControl
          id={id}
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

export default ChecklistDetail;
