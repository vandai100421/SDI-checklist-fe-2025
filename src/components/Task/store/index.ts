import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { TypeGetAll } from "@/src/types/common";
import taskApi from "@/src/apis/task";
import { TypeTask } from "@/src/types/task";
import {
  statementCreateTask,
  statementInsertChecklist_Task,
  statementInsertObject_Task,
  statementInsertDetail_task,
} from "./sql";
import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { clearAuth, countCompletedTasks, showMessage } from "@utils/common";

type TypeStore = {
  data: Array<TypeTask>;
  page: number;
  pageSize: number;
  checklistTask: string;
  objectTask: Array<string>;
  groupObject?: string;
  checklistValue?: any;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
  checklistValue: { id: 0, name: "" },
};

const taskStore = hookstate(initialStore);

export const createTask = async (
  data: TypeTask,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await taskApi.create(data);
      showMessage("Thêm mới thành công");
    } catch (error: any) {
      showMessage("Thêm mới thất bại.\n" + error.response.data);
    }
    return
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      /// kiem tra ten trung
      const listTask: any = await db.getAllAsync(
        `SELECT * FROM task WHERE name like '${data.name}';`
      );

      if (listTask.length) {
        showMessage(
          "Tạo mới thất bại. Tên nhiệm vụ đã tồn tại.");
        return;
      }
      // end checklist

      /// chekclist
      const dataStandard: any = await db.getAllAsync(
        `SELECT * FROM standard WHERE check_list_id = ?;`,
        data.checklist_id as any
      );

      if (!dataStandard.length) {
        showMessage("Tạo mới thất bại. Checklist không chứa các tiêu chuẩn kiểm tra.");
        return;
      }
      // end checklist

      /// lay ra danh sach cac object tu group object
      const dataListObject: any = await db.getAllAsync(
        `SELECT * FROM object WHERE group_object_id = ?;`,
        data.list_object as any
      );
      const list_object = dataListObject.map((item: any) => item.id);
      if (!list_object.length) {
        showMessage("Tạo mới thất bại. Không có đối tượng trong nhóm.");
        return;
      }
      //end group object

      const insertTaskPrepare = await db.prepareAsync(statementCreateTask);
      const resultInsertTask = await insertTaskPrepare.executeAsync({
        $id: data.id,
        $name: data.name,
        $process: "0/" + list_object.length,
        $creator: data.creator,
        $started_at: data.started_at,
        $ended_at: data.ended_at,
        $position: data.worker,
        $pic: "",
        $worker: "",
      } as any);

      const object_task_id: Array<any> = [];
      list_object.map(async (item, index) => {
        const insertObject_TaskPrepare = await db.prepareAsync(
          statementInsertObject_Task
        );
        object_task_id.push(uuidv4());
        await insertObject_TaskPrepare.executeAsync({
          $id: object_task_id[index],
          $object_id: item,
          $task_id: data.id,
          $process: "Chưa hoàn thành",
        } as any);
      });

      for (let index = 0; index < dataStandard.length; index++) {
        const insertDetail_TaskPrepare = await db.prepareAsync(
          statementInsertDetail_task
        );

        for (let i = 0; i < list_object.length; i++) {
          await insertDetail_TaskPrepare.executeAsync({
            $id: uuidv4(),
            $standard_id: dataStandard[index].id,
            $object_task_id: object_task_id[i],
          } as any);
        }
      }

      const insertChecklist_TaskPrepare = await db.prepareAsync(
        statementInsertChecklist_Task
      );
      await insertChecklist_TaskPrepare.executeAsync({
        $id: uuidv4(),
        $checklist_id: data.checklist_id,
        $task_id: data.id,
      } as any);

      showMessage("Tạo mới thành công",);
    } catch (error) {
      showMessage("Tạo mới thất bại\n" + error);
    }
  }
};
export const createListTask = async (
  data: TypeTask[],
  isConnectedInternet?: boolean
) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const insertTaskPrepare = await db.prepareAsync("INSERT INTO Task (id, name, position, process, creator, pic, worker, started_at, ended_at) VALUES ($id, $name, $position, $process, $creator, $pic, $worker, $started_at, $ended_at);");

    await Promise.all(
      data.map((item) => {
        return insertTaskPrepare.executeAsync({
          $id: item.id,
          $name: item.name,
          $process: item.process,
          $creator: item.creator,
          $started_at: item.started_at,
          $ended_at: item.ended_at,
          $position: item.worker,
          $pic: item.pic,
          $worker: item.worker,
        } as any);
      })
    );
  } catch (e) {
    console.log("error task");
  }
};
export const createListObjectTask = async (data: any) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const insertObject_TaskPrepare = await db.prepareAsync(
      "INSERT INTO `object_task` (id, object_id, task_id, process, pdf_path, mobile_pdf_path) VALUES ($id, $object_id, $task_id, $process, $pdf_path, $mobile_pdf_path);"
    );

    await Promise.all(
      data.map((item: any) => {
        return insertObject_TaskPrepare.executeAsync({
          $id: item.id,
          $object_id: item.object_id,
          $task_id: item.task_id,
          $process: item.process,
          $pdf_path: item.pdf_path,
          $mobile_pdf_path: item.mobile_pdf_path,
        } as any);
      })
    );
  } catch (e) {
    console.log("error object task");
  }
};
export const createListChecklistTask = async (data: any) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const insertChecklist_TaskPrepare = await db.prepareAsync(
      "INSERT INTO `checklist_task` (id, checklist_id, task_id ) VALUES ($id, $checklist_id, $task_id);"
    );

    await Promise.all(
      data.map((item: any) => {
        return insertChecklist_TaskPrepare.executeAsync({
          $id: item.id,
          $checklist_id: item.checklist_id,
          $task_id: item.task_id,
        } as any);
      })
    );
  } catch (e) {
    console.log("error checklist task");
  }
};
export const createListStandardTask = async (data: any) => {
  try {
  } catch (e) {
    console.log(e);
  }
};
export const updateTask = async (
  data: TypeTask,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await taskApi.update(data);
      showMessage("Cập nhật nhiệm vụ thành công");
    } catch (error) {
      showMessage("Cập nhật nhiệm vụ thất bại\n" + error);
    }
    return
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      /// kiem tra ten trung
      const listTask: any = await db.getAllAsync(
        `SELECT * FROM task WHERE name like '${data.name}';`
      );

      if (listTask.length) {
        showMessage("Tạo mới thất bại. Tên nhiệm vụ đã tồn tại.");
        return;
      }
      // end checklist

      /// chekclist
      const dataStandard: any = await db.getAllAsync(
        `SELECT * FROM standard WHERE check_list_id = ?;`,
        data.checklist_id as any
      );

      if (!dataStandard.length) {
        showMessage("Tạo mới thất bại. Checklist không chứa các tiêu chuẩn kiểm tra.");
        return;
      }
      // end checklist

      /// lay ra danh sach cac object tu group object
      const dataListObject: any = await db.getAllAsync(
        `SELECT * FROM object WHERE group_object_id = ?;`,
        data.list_object as any
      );
      const list_object = dataListObject.map((item: any) => item.id);
      if (!list_object.length) {
        showMessage("Tạo mới thất bại. Không có đối tượng trong nhóm.");
        return;
      }
      //end group object

      // end check

      // delete
      await db.runAsync(
        `DELETE FROM detail_task
                            WHERE object_task_id IN (
                                SELECT id FROM object_task WHERE task_id = ?
                            );
                            `,
        data.id
      );
      await db.runAsync(
        `DELETE from checklist_task WHERE task_id=?;`,
        data.id
      );
      await db.runAsync(`DELETE from object_task WHERE task_id=?;`, data.id);
      await db.runAsync(`DELETE from Task WHERE id=?;`, data.id);

      //create
      const insertTaskPrepare = await db.prepareAsync(statementCreateTask);
      const resultInsertTask = await insertTaskPrepare.executeAsync({
        $id: data.id,
        $name: data.name,
        $process: data.process,
        $creator: data.creator,
        $started_at: data.started_at,
        $ended_at: data.ended_at,
        $position: data.worker,
        $pic: "",
        $worker: "",
      } as any);

      const object_task_id: Array<any> = [];
      list_object?.map(async (item, index) => {
        const insertObject_TaskPrepare = await db.prepareAsync(
          statementInsertObject_Task
        );
        object_task_id.push(uuidv4());
        await insertObject_TaskPrepare.executeAsync({
          $id: object_task_id[index],
          $object_id: item,
          $task_id: data.id,
        } as any);
      });

      for (let index = 0; index < dataStandard.length; index++) {
        const insertDetail_TaskPrepare = await db.prepareAsync(
          statementInsertDetail_task
        );

        for (let i = 0; i < list_object.length; i++) {
          await insertDetail_TaskPrepare.executeAsync({
            $id: uuidv4(),
            $standard_id: dataStandard[index].id,
            $object_task_id: object_task_id[i],
          } as any);
        }
      }

      const insertChecklist_TaskPrepare = await db.prepareAsync(
        statementInsertChecklist_Task
      );
      await insertChecklist_TaskPrepare.executeAsync({
        $id: uuidv4(),
        $checklist_id: data.checklist_id,
        $task_id: data.id,
      } as any);

      showMessage("Cập nhật nhiệm vụ thành công");
    } catch (error) {
      showMessage("Cập nhật nhiệm vụ thất bại\n" + error);
    }
  }
};
export const createListDetailTask = async (data: any) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const insertDetail_TaskPrepare = await db.prepareAsync(
      "INSERT INTO `detail_task` (id, standard_id, object_task_id, process, mobile_path, image, note ) VALUES ($id, $standard_id, $object_task_id, $process, $mobile_path, $image, $note);"
    );
    await Promise.all(
      data.map((item: any) => {
        return insertDetail_TaskPrepare.executeAsync({
          $id: item.id,
          $object_task_id: item.object_task_id,
          $standard_id: item.standard_id,
          $process: item.process,
          $mobile_path: item.mobile_path,
          $image: item.image,
          $note: item.note,
        } as any);
      })
    );
  } catch (e) {
    console.log("error detail task");
  }
};
export const deleteTask = async (id: number, isConnectedInternet?: boolean) => {
  if (isConnectedInternet) {
    try {
      await taskApi.delete(id);
      showMessage("Xóa nhiệm vụ thành công");
    } catch (error) {
      showMessage("Xóa nhiệm vụ thất bại\n" + error);
    }
    return
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      await db.runAsync(
        `DELETE FROM detail_task
                            WHERE object_task_id IN (
                                SELECT id FROM object_task WHERE task_id = ?
                            );
                            `,
        id
      );
      await db.runAsync(
        `INSERT INTO tmp_delete (id, table_name, id_value) VALUES ('${uuidv4()}', 'task', '${id}');`
      );

      await db.runAsync(`DELETE from checklist_task WHERE task_id=?;`, id);
      await db.runAsync(`DELETE from object_task WHERE task_id=?;`, id);
      await db.runAsync(`DELETE from Task WHERE id=?;`, id);
      showMessage("Xóa dữ liệu thành công",);
    } catch (error) {
      showMessage("Xóa dữ liệu thất bại\n" + error);
    }
  }
};
export const asyncData = async (data: any) => {
  try {
    const res = await taskApi.async(data);
    return res;
  } catch (error) {
    console.error("err create", error);
  }
};
export const getAllData = async () => {
  try {
    const res = await taskApi.getAllData();
    return res;
  } catch (e) {
    console.log(e);
  }
};
export const getAllTask = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      const data = await taskApi.getAll();

      const results = data.data.map((item: any) => {
        const numOfObjs = item.object_task.length;

        const numOfCompleted = countCompletedTasks(item.object_task);

        return {
          ...item,
        };
      });

      taskStore.merge({
        data: results,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      showMessage("Lấy dữ liệu nhiệm vụ thất bại\n" + error);
    }
    return;
  }
  else if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      let data: any;
      if (!params?.name) {
        data = await db.getAllAsync(`
            SELECT
                  t.*
              FROM
                  task t
            `);
      } else
        data = await db.getAllAsync(`
            SELECT
                  t.*
              FROM
                  task t
            WHERE name like '%${params?.name}%'
            `);

      taskStore.merge({
        data: data,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      showMessage("Lấy dữ liệu nhiệm vụ thất bại\n" + error);
    }
  }
};

export const getDetailTask = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      const data = await taskApi.getAll();

      const detailTask = await taskApi.getAll(params?.task_id as any);

      taskStore.merge({
        data: data.data,
        checklistValue: detailTask.data[0].checklist_task[0].checklists,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      console.error("Error grom Detail Task", error);
    }
    return
  }
  else if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      const checklistTask: any = await db.getFirstAsync(
        `
          SELECT * FROM checklist_task 
          WHERE task_id = ?
          `,
        params?.task_id as any
      );

      const objectTask: any = await db.getAllAsync(
        `
          SELECT object_id FROM object_task 
          WHERE task_id = ?
          `,
        params?.task_id as any
      );

      const checklistValue: any = await db.getAllAsync(
        `
          SELECT * FROM checklist 
          WHERE id = ?
          `,
        checklistTask.checklist_id
      );

      const objectData = objectTask.map((item: any) => item.object_id);

      taskStore.merge({
        checklistTask: checklistTask.checklist_id,
        objectTask: objectData,
        // groupObject: groupObject.id
        checklistValue: checklistValue[0],
      });
    } catch (error) {
      console.error("Error from detail task", error);
    }
  }
};

export default taskStore;
