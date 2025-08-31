import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { TypeGetAll } from "@/src/types/common";
import { Alert } from "react-native";
import {
  statementCreateGroupObject,
  statementDeleteGroupObject,
  statementUpdateGroupObject,
} from "./sql";
import { globalMessage } from "@components/Lib/GlobalMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import groupObjectApi from "@/src/apis/groupObject";
import { TypeGroupObject } from "@/src/types/groupObject";
import { v4 as uuidv4 } from "uuid";
import { clearAuth, showMessage } from "@utils/common";

type TypeStore = {
  data: Array<TypeGroupObject>;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
};
const groupObjectStore = hookstate(initialStore);

export const createGroupObject = async (
  data: TypeGroupObject,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await groupObjectApi.create(data);
      showMessage("Tạo mới thành công");
    } catch (error) {
      showMessage("Tạo mới thất bại\n" + error);
    }
    return
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const insertPrepare = await db.prepareAsync(statementCreateGroupObject);

    try {
      await insertPrepare.executeAsync({
        $id: data.id,
        $name: data.name,
      });
      showMessage("Tạo mới thành công");
    } catch (error) {
      showMessage("Tạo mới thất bại\n" + error);
    }
  }
};
export const createListGroupObject = async (data: TypeGroupObject[]) => {
  const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
    useNewConnection: true,
  });
  const insertPrepare = await db.prepareAsync("INSERT INTO GroupObject (id, name) VALUES ($id, $name);");
  try {
    await Promise.all(
      data.map((item) => {
        return insertPrepare.executeAsync({
          $id: item.id,
          $name: item.name,
        });
      })
    );
    // showMessage( "Tạo mới thành công", [{ text: "OK" }]);
  } catch (error) {
    console.log("nhóm đối tượng", error);

    // showMessage( "Tạo mới thất bại\n" + error, [{ text: "OK" }]);
  }
};
export const uploadGroupObject = async (data: any) => {
  try {
    const upload = new FormData();
    upload.append("files", data.files);
    upload.append("id", data.id);
    upload.append("name", data.name);

    await groupObjectApi.upload(upload);
    showMessage("Tạo mới thành công");
  } catch (error: any) {
    if (error.status === 422) {
      // console.log(error.response, error.response.data.duplicatedIds.join(','));

      showMessage(`Tạo mới thất bại.\nMã đối tượng đã tồn tại (${error.response.data.duplicatedIds.join(',')}).`);
    }
    else
      showMessage("Tạo mới thất bại\n" + error);
  }
};
export const updateGroupObject = async (
  data: TypeGroupObject,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await groupObjectApi.update(data);
      showMessage("Cập nhật thành công");
    } catch (error) {
      showMessage("Cập nhật thất bại\n" + error);
    }
    return
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      const updatePrepare = await db.prepareAsync(statementUpdateGroupObject);
      await updatePrepare.executeAsync({
        $name: data.name,
        $id: data.id,
      });
      showMessage("Cập nhật thành công");
    } catch (error) {
      showMessage("Cập nhật thất bại\n" + error);
    }
  }
};

export const deleteGroupObject = async (
  id: number,
  isConnectedInternet?: boolean
) => {

  if (isConnectedInternet) {
    try {
      await groupObjectApi.delete(id);
      showMessage("Xóa nhóm đối tượng thành công");
    } catch (error) {
      showMessage("Xóa nhóm đối tượng thất bại\n" + error);
    }
    return
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const deletePrepare = await db.prepareAsync(statementDeleteGroupObject);

    try {
      await deletePrepare.executeAsync({ $id: id });
      await db.runAsync(
        `INSERT INTO tmp_delete (id, table_name, id_value) VALUES ('${uuidv4()}', 'GroupObject', '${id}');`
      );
      showMessage("Xóa nhóm đối tượng thành công");
    } catch (error) {
      showMessage("Xóa nhóm đối tượng thất bại\n" + error);
    }
  }
};

export const getAllGroupObject = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  console.log('isConnectedInternet00000000000000', isConnectedInternet);

  if (isConnectedInternet) {
    try {
      const data = await groupObjectApi.getAll();
      groupObjectStore.merge({
        data: data.data,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      showMessage("Lấy nhóm đối tượng thất bại\n" + error);
    }
    return;
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const statement = await db.prepareAsync(
      `SELECT * FROM GroupObject where  name like '%${params?.name || ""}%' ;`
    );

    try {
      const result = await statement.executeAsync();
      const data: any = await result.getAllAsync();

      groupObjectStore.merge({
        data: data,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      await statement.finalizeAsync();
      showMessage("Lấy nhóm đối tượng thất bại\n" + error);
    }
  }
};

export default groupObjectStore;
