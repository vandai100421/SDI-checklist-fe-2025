import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { TypeGetAll } from "@/src/types/common";
import checklistApi from "@/src/apis/checklist";
import { TypeChecklist } from "@/src/types/checklist";
import { Alert } from "react-native";
import {
  statementCreateChecklist,
  statementDeleteChecklist,
  statementUpdateChecklist,
} from "./sql";
import { globalMessage } from "@components/Lib/GlobalMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { clearAuth, showMessage } from "@utils/common";

type TypeStore = {
  data: Array<TypeChecklist>;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
};
const checklistStore = hookstate(initialStore);

export const createChecklist = async (data: TypeChecklist, isConnectedInternet?: boolean) => {
  if (isConnectedInternet) {
    try {
      await checklistApi.create(data);
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
    const insertPrepare = await db.prepareAsync(statementCreateChecklist);

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
}
export const createListCheckList = async (data: TypeChecklist[]) => {
  const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
    useNewConnection: true,
  });
  const insertPrepare = await db.prepareAsync("INSERT INTO Checklist (id, name) VALUES ($id, $name);");

  try {
    await Promise.all(
      data.map((item) => {
        return insertPrepare.executeAsync({
          $id: item.id,
          $name: item.name,
        });
      })
    );
    // Alert.alert("Thông báo", "Tạo mới thành công", [{ text: "OK" }]);
  } catch (error) {
    console.log("checklist", error);

    // Alert.alert("Thông báo", "Tạo mới thất bại\n" + error, [{ text: "OK" }]);
  }
}
export const uploadChecklist = async (data: any) => {
  try {
    const upload = new FormData();
    upload.append("files", data);
    await checklistApi.upload(upload);
    showMessage("Tạo mới thành công");
  } catch (error) {
    showMessage("Tạo mới thất bại\n" + error);
  }
};
export const updateChecklist = async (data: TypeChecklist, isConnectedInternet?: boolean) => {
  if (isConnectedInternet) {
    try {
      await checklistApi.update(data);
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
      const updatePrepare = await db.prepareAsync(statementUpdateChecklist);
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

export const deleteChecklist = async (id: number, isConnectedInternet?: boolean) => {
  if (isConnectedInternet) {
    try {
      await checklistApi.delete(id);
      showMessage("Xóa checklist thành công");
    } catch (error) {
      showMessage("Xóa checklist thất bại\n" + error);
    }
    return
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const deletePrepare = await db.prepareAsync(statementDeleteChecklist);

    try {
      await deletePrepare.executeAsync({ $id: id });
      showMessage("Xóa checklist thành công");
    } catch (error) {
      showMessage("Xóa checklist thất bại\n" + error);
    }
  }
};

export const getAllChecklist = async (params?: TypeGetAll, isConnectedInternet?: boolean) => {
  if (!isWeb) {
    if (isConnectedInternet) {
      try {
        const data = await checklistApi.getAll();
        checklistStore.merge({
          data: data.data,
          page: params?.page,
          pageSize: params?.pageSize,
        });
        return;
      } catch (error) {
        clearAuth();
        Alert.alert("Thông báo", "Vui lòng đăng nhập lại", [
          { text: "OK" },
        ]);
      }
    }

    else {
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });
      const statement = await db.prepareAsync(
        `SELECT * FROM Checklist where  name like '%${params?.name || ""}%' ;`
      );
      try {
        const result = await statement.executeAsync();
        const data: any = await result.getAllAsync();

        checklistStore.merge({
          data: data,
          page: params?.page,
          pageSize: params?.pageSize,
        });
      } catch (error) {
        await statement.finalizeAsync();
        Alert.alert("Thất bại", "Lấy checklist checklist thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
    }
  } else {
    try {
      const data = await checklistApi.getAll();
      checklistStore.merge({
        data: data.data,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      globalMessage.show("Thất bại", "Lấy checklist checklist thất bại\n" + error);
    }
  }
};

export default checklistStore;
