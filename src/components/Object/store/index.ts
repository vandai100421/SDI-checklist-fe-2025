import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { TypeGetAll } from "@/src/types/common";
import objectApi from "@/src/apis/object";
import { TypeObject } from "@/src/types/object";
import {
  statementCreateObject,
  statementDeleteObject,
  statementUpdateObject,
} from "./sql";
import { Alert } from "react-native";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { v4 as uuidv4 } from "uuid";
import { showMessage } from "@utils/common";

type TypeStore = {
  data: Array<TypeObject>;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
};
const objectStore = hookstate(initialStore);

export const createObject = async (
  data: TypeObject,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await objectApi.create(data);
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
    const insertManagement = await db.prepareAsync(statementCreateObject);

    try {
      await insertManagement.executeAsync({
        $id: data.id,
        $name: data.name,
        $position: data.position,
        $manage: data.manage,
        $group_object_id: data.group_object_id,
        $stt: data.stt
      });
      showMessage("Tạo mới thành công");
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        showMessage("Dữ liệu trùng lặp. Tạo mới thất bại.",);
      } else
        showMessage("Tạo mới thất bại\n" + error);
    }
  }
};
export const createListObject = async (data: any) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    const insertManagement = await db.prepareAsync("INSERT INTO object (id, name, position, manage, group_object_id, stt)VALUES ($id, $name, $position, $manage, $group_object_id, $stt);");
    await Promise.all(
      data.map((item: any) => {
        return insertManagement.executeAsync({
          $id: item.id,
          $name: item.name,
          $position: item.position,
          $manage: item.manage,
          $group_object_id: item.group_object_id,
          $stt: item.stt
        });
      })
    );
  } catch (e) {
    console.log("error object");
  }
};
export const uploadObject = async (data: any) => {
  try {
    const upload = new FormData();
    upload.append("files", data);
    console.log(123);
    const res: any = await objectApi.upload(upload);
    console.log("Status code:", res.response.status); // ⬅️ Lấy status code
    showMessage("Tạo mới thành công");
  } catch (error: any) {
    console.log(error);

    console.log("Status code:", error.response.status); // ⬅️ Lấy status code

    showMessage("Tạo mới thất bại\n" + error);
  }
};
export const updateObject = async (
  data: TypeObject,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await objectApi.update(data);
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

    const updateManagement = await db.prepareAsync(statementUpdateObject);

    try {
      await updateManagement.executeAsync({
        $name: data.name,
        $position: data.position,
        $manage: data.manage,
        $id: data.id,
      });
      showMessage("Cập nhật thành công");
    } catch (error) {
      showMessage("Cập nhật thất bại\n" + error);
    }
  }
};

export const deleteObject = async (
  id: number,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await objectApi.delete(id);
      showMessage("Xóa đối tượng thành công");
    } catch (error) {
      showMessage("Xóa đối tượng thất bại\n" + error);
    }
    return
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    const deleteManagement = await db.prepareAsync(statementDeleteObject);

    try {
      await deleteManagement.executeAsync({ $id: id });
      await db.runAsync(
        `INSERT INTO tmp_delete (id, table_name, id_value) VALUES ('${uuidv4()}', 'object', '${id}');`
      );
      showMessage("Xóa đối tượng thành công");
    } catch (error) {
      showMessage("Xóa đối tượng thất bại\n" + error);
    }
  }
};

export const getAllObject = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  if (!isWeb) {
    if (isConnectedInternet) {
      try {
        const data = await objectApi.getAll(params);

        objectStore.merge({
          data: data.data,
          page: params?.page,
          pageSize: params?.pageSize,
        });
      } catch (error) {
        showMessage("Lấy đối tượng thất bại\n" + error);
      }
    } else {
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });

      try {
        const statement = await db.prepareAsync(`SELECT * FROM object;`);

        const result = await statement.executeAsync();

        const data: any = await result.getAllAsync();

        objectStore.merge({
          data: data.filter(
            (item: any) => item.group_object_id === params?.group_object_id
          ),
          page: params?.page,
          pageSize: params?.pageSize,
        });
      } catch (error) {
        showMessage("Lấy đối tượng đối tượng thất bại\n" + error);
      }
    }
  } else {
    try {
      const data = await objectApi.getAll(params);
      objectStore.merge({
        data: data.data,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      globalMessage.show(
        "Thất bại",
        "Lấy đối tượng đối tượng thất bại\n" + error
      );
    }
  }
};

export default objectStore;
