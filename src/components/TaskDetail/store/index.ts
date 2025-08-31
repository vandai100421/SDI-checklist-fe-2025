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
import taskApi from "@/src/apis/task";
import { isArrayCompleted, showMessage } from "@utils/common";

type TypeStore = {
  data: Array<any>;
  selectedItem?: any;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
  selectedItem: {}
};

const taskDetailStore = hookstate(initialStore);

export const createTaskDetail = async (data: TypeStandard) => {
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      const insertPrepare = await db.prepareAsync(statementCreateStandard);

      await insertPrepare.executeAsync({
        $content: data.content,
        $standard: data.standard,
        $content_method: data.content_method,
        $checklist_id: data.check_list_id?.toString(),
      } as any);

      Alert.alert("Thông báo", "Tạo mới thành công", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert("Thông báo", "Tạo mới thất bại\n" + error, [{ text: "OK" }]);
    }
  } else {
    try {
      await standardApi.create(data);
    } catch (error) {
      console.error("err create", error);
    }
  }
};
export const createListStandard = async (data: TypeStandard[]) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const insertPrepare = await db.prepareAsync(statementCreateStandard);
    await Promise.all(
      data.map((item) => {
        return insertPrepare.executeAsync({
          $id: item.id,
          $content: item.content,
          $standard: item.standard,
          $content_method: item.content_method,
          $checklist_id: item.check_list_id?.toString(),
          $stt: item.stt
        } as any);
      })
    );
  } catch (e) {
    console.log("error standard");
  }
};
export const updateTaskDetail = async (data: TypeStandard) => {
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
      Alert.alert("Thông báo", "Cập nhật thành công", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert("Thông báo", "Cập nhật thất bại\n" + error, [{ text: "OK" }]);
    }
  } else {
    try {
      await standardApi.update(data);
    } catch (error) {
      console.error("err create", error);
    }
  }
};

export const deleteTaskDetail = async (id: number) => {
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      const deletePrepare = await db.prepareAsync(statementDeleteStandard);
      await deletePrepare.executeAsync({ $id: id });
      Alert.alert("Thành công", "Xóa dữ liệu thành công", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert("Thất bại", "Xóa dữ liệu thất bại\n" + error, [
        { text: "OK" },
      ]);
    }
  } else {
    try {
      await standardApi.delete(id);
    } catch (error) {
      console.error("err create", error);
    }
  }
};

export const getAllTaskDetail = async (params?: TypeGetAll, isConnectedInternet?: boolean) => {
  if (isConnectedInternet) {
    try {
      const data = await taskApi.getAllObject(params);

      const result = data.data.object_task.map((item: any) => {

        const countNG = item.standard_task.filter(it => it.process === "ng").length;

        return {
          id: item.id,
          process: item.process,
          object_id: item.object_id,
          name: item.objects.name,
          position: item.objects.position,
          manage: item.objects.manage,
          ng: countNG ? `${countNG}/${item.standard_task.length}` : "",
          stt: item.objects.stt
        };
      });

      taskDetailStore.merge({
        data: result,
      });
      return;
    } catch (error) {
      showMessage("Lấy dữ liệu thất bại")
    }
    return;
  }
  else if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      // globalLoading.show();
      const whereClause = params?.name ? " AND content LIKE ?" : "";
      const args = params?.name
        ? [params.task_id, `%${params?.name}%`]
        : [params?.task_id];

      const data: any = await db.getAllAsync(
        `SELECT 
            ob.id,
            o.position,
            o.manage,
            ob.process,
            o.stt,
            o.name,
            o.id AS object_id,
            (
                SELECT COUNT(*) 
                FROM detail_task dt 
                WHERE dt.object_task_id = ob.id AND dt.process = 'ng'
            ) AS ng,
              (
                SELECT COUNT(*) 
                FROM detail_task dt 
                WHERE dt.object_task_id = ob.id
            ) AS total
        FROM 
            task t
        INNER JOIN 
            object_task ob ON t.id = ob.task_id
        INNER JOIN 
            object o ON o.id = ob.object_id    
        WHERE
            t.id = ? ${whereClause}`,
        args as any
      );


      taskDetailStore.merge({
        data: data.map((item: any) => { return { ...item, ng: item.ng ? `${item.ng}/${item.total}` : "" } }),
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      Alert.alert("Thất bại", "Lấy dữ liệu thất bại\n" + error, [
        { text: "OK" },
      ]);
    }
  }
}

export default taskDetailStore;
