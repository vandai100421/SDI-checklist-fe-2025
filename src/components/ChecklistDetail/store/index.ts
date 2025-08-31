import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { TypeGetAll } from "@/src/types/common";
import { TypeParamsStandard, TypeStandard } from "@/src/types/standard";
import standardApi from "@/src/apis/standard";
import { Alert } from "react-native";
import {
  statementCreateStandard,
  statementDeleteStandard,
  statementUpdateStandard,
} from "./sql";

import { globalMessage } from "@components/Lib/GlobalMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { showMessage } from "@utils/common";

type TypeStore = {
  data: Array<TypeStandard>;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
};
const checklistDetailStore = hookstate(initialStore);

export const createChecklistDetail = async (
  data: TypeStandard,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await standardApi.create(data);
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

    try {
      const insertPrepare = await db.prepareAsync(statementCreateStandard);

      await insertPrepare.executeAsync({
        $id: data.id,
        $content: data.content,
        $standard: data.standard,
        $content_method: data.content_method,
        $checklist_id: data.check_list_id?.toString(),
        $stt: data.stt,
      } as any);

      showMessage("Tạo mới thành công");
    } catch (error) {
      showMessage("Tạo mới thất bại\n" + error);
    }
  }
};

export const updateChecklistDetail = async (
  data: TypeStandard,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await standardApi.update(data);
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
      const updatePrepare = await db.prepareAsync(statementUpdateStandard);
      await updatePrepare.executeAsync({
        $content: data.content,
        $standard: data.standard,
        $content_method: data.content_method,
        $id: data.id,
      });
      showMessage("Cập nhật thành công");
    } catch (error) {
      showMessage("Cập nhật thất bại\n" + error);
    }
  }
};

export const deleteChecklistDetail = async (
  id: number,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await standardApi.delete(id);
      globalMessage.show("Thành công", "Xóa dữ liệu thành công");
    } catch (error) {
      globalMessage.show("Thất bại", "Xóa dữ liệu thất bại\n" + error);
    }
    return
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      const deletePrepare = await db.prepareAsync(statementDeleteStandard);
      await deletePrepare.executeAsync({ $id: id });
      await db.runAsync(
        `INSERT INTO tmp_delete (id, table_name, id_value) VALUES ('${uuidv4()}', 'standard', '${id}');`
      );
      showMessage("Xóa dữ liệu thành công");
    } catch (error) {
      showMessage("Xóa dữ liệu thất bại\n" + error);
    }
  }
};

export const getAllChecklistDetail = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  if (!isWeb) {
    if (isConnectedInternet) {
      try {
        const data = await standardApi.getAll(params);
        checklistDetailStore.merge({
          data: data.data,
        });
      } catch (error) {
        Alert.alert("Thất bại", "Lấy dữ liệu thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
    } else {
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });
      try {
        const whereClause = params?.name ? " AND content LIKE ?" : "";
        const args = params?.name
          ? [params.checklist_id, `%${params?.name}%`]
          : [params?.checklist_id];

        const data: any = await db.getAllAsync(
          `SELECT * FROM standard WHERE check_list_id = ? ${whereClause}`,
          args as any
        );

        checklistDetailStore.merge({
          data: data,
          page: params?.page,
          pageSize: params?.pageSize,
        });
      } catch (error) {
        Alert.alert("Thất bại", "Lấy dữ liệu thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
    }
  } else {
    try {
      const data = await standardApi.getAll(params);
      checklistDetailStore.merge({
        data: data.data,
      });
    } catch (error) {
      globalMessage.show("Thất bại", "Lấy dữ liệu thất bại\n" + error);
    }
  }
};

export default checklistDetailStore;
