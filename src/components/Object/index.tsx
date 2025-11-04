import { Box, HStack, Input } from "native-base";
import * as React from "react";
import { Alert, View, Platform } from "react-native";
import {
  Button,
  Card,
  DataTable,
  Icon,
  PaperProvider,
  Text,
} from "react-native-paper";
import ModalControl from "./subcomponents/ModalControl";
import { ScrollView } from "react-native-gesture-handler";
import objectStore, {
  createObject,
  deleteObject,
  getAllObject,
  updateObject,
  uploadObject,
} from "./store";
import { TypeObject } from "@/src/types/object";
import { useHookstate } from "@hookstate/core";
import { styles } from "../../styles/styles";
import TextComponent from "@components/Lib/Text";
import { isWeb } from "@utils/deviceInfo";
import PopupConfirm from "@components/Lib/PopupConfirm";
import { AuthContext } from "@/src/provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  id: number;
};

const Object: React.FC<Props> = ({ id }) => {
  const objectState = useHookstate(objectStore);
  const [page, setPage] = React.useState<number>(0);
  const [editData, setEditData] = React.useState<TypeObject | undefined>();
  const [type, setType] = React.useState("text");

  const { isAdmin, isConnected, checkOnline } = React.useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      checkOnline();
      getAllObject({ group_object_id: id }, isConnected);
      getDetail();
    }, [])
  );

  const [detail, setDetail] = React.useState<any>();

  const getDetail = async () => {
    if (!isWeb) {
      setDetail({
        name: (await AsyncStorage.getItem("group_object_name")) as any,
      });
    } else {
      setDetail({
        name: (sessionStorage.getItem("group_object_name") as any) || "",
      });
    }
  };

  const handleSubmit = async (data: TypeObject) => {
    if (!editData) {
      if (type === "file") {
        await uploadObject(data);
      } else {
        await createObject({ ...data, stt: objectState.data.get().length }, isConnected);
      }
      setVisibleModalControl(false);
      getAllObject({ group_object_id: id }, isConnected);
    } else {
      try {
        await updateObject(data, isConnected);
        await getAllObject({ group_object_id: id }, isConnected);
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
    await deleteObject(_id, isConnected);
    await getAllObject({ group_object_id: id }, isConnected);
  };
  const clickUpdate = async (data: any) => {
    setEditData(data);
    setVisibleModalControl(true);
  };

  const [itemsPerPage, onItemsPerPageChange] = React.useState(10);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, objectState.data.get().length);

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
    const filtered = objectState.data.get().filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query)
      );
    }
    );

    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;

      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";

      return sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [objectState.data.get(), sortColumn, sortAscending, searchQuery]);

  // control modal
  const [visibleModalControl, setVisibleModalControl] = React.useState(false);

  const handleOpenModalControl = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
    setType("text");
  };
  const handleOpenModalControlFile = () => {
    setEditData(undefined);
    setVisibleModalControl(true);
    setType("file");
  };
  const handleCloseModalControl = () => {
    setVisibleModalControl(false);
  };

  const [isSearching, setIsSearching] = React.useState(false);

  const [isVisibleConfirmDelete, setIsVisibleConfirmDelete] =
    React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<any>("");
  const handleConfirm = async () => {
    await deleteItem(selectedItemId);
    setIsVisibleConfirmDelete(false);
  };

  // React.useEffect(() => {
  //   search();
  // }, [searchQuery]);

  return (
    <View>
      <Box p="4">
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.detailTitle}>Tên nhóm đối tượng: </Text>
          <Text style={styles.detailText}>{detail ? detail.name : ""}</Text>
        </View>

        <HStack space={4} pb={4} pt={2} justifyContent={"space-between"}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc IDr"
            variant="outline"
            width={200}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {isWeb && <Button icon="plus" mode="contained" onPress={handleOpenModalControl}>
            Thêm mới
          </Button>}
        </HStack>
        <Card>
          {objectState.data.get().length > 0 ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.center}>STT</DataTable.Title>

                <DataTable.Title
                  style={styles.center}
                  onPress={() => handleSort("id")}
                >
                  ID {sortColumn === "id" && (sortAscending ? " ▲" : " ▼")}
                </DataTable.Title>

                <DataTable.Title
                  style={styles.center}
                  onPress={() => handleSort("name")}
                >
                  Tên đối tượng {sortColumn === "name" && (sortAscending ? " ▲" : " ▼")}
                </DataTable.Title>

                <DataTable.Title
                  style={styles.center}
                  onPress={() => handleSort("position")}
                >
                  Vị trí {sortColumn === "position" && (sortAscending ? " ▲" : " ▼")}
                </DataTable.Title>

                <DataTable.Title
                  style={styles.center}
                  onPress={() => handleSort("manage")}
                >
                  Phòng quản lý {sortColumn === "manage" && (sortAscending ? " ▲" : " ▼")}
                </DataTable.Title>

                {isWeb && isAdmin && (
                  <DataTable.Title style={styles.center}>
                    Hành động
                  </DataTable.Title>
                )}
              </DataTable.Header>


              {sortedData
                .map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell style={styles.center}>{index + 1}</DataTable.Cell>
                    <DataTable.Cell style={styles.center}>{item.id}</DataTable.Cell>
                    <DataTable.Cell>
                      <Text numberOfLines={0} style={styles.textWrap}>{item.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text numberOfLines={0} style={styles.textWrap}>{item.position}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text numberOfLines={0} style={styles.textWrap}>{item.manage}</Text>
                    </DataTable.Cell>
                    {isWeb && isAdmin && <DataTable.Cell>
                      <HStack>
                        <Button onPress={() => clickUpdate(item)}>
                          <Icon source="pencil-box" color="warning" size={20} />
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
                  objectState.data.get().length / itemsPerPage
                )}
                onPageChange={(page) => setPage(page)}
                label={`${page + 1} of ${Math.ceil(
                  objectState.data.get().length / itemsPerPage
                )}`}
                // numberOfItemsPerPage={itemsPerPage}
                // onItemsPerPageChange={onItemsPerPageChange}
                showFastPaginationControls
              // selectPageDropdownLabel={"Rows per page"}
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
          id={id}
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
    </View>
  );
};

export default Object;
