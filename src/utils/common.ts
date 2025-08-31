import { Alert } from "react-native";
import { isWeb } from "./deviceInfo";
import { globalMessage } from "@components/Lib/GlobalMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import taskStore, {
  createTask,
  deleteTask,
  getAllTask,
  getDetailTask,
  updateTask,
  asyncData,
  getAllData,
  createListTask,
  createListObjectTask,
  createListDetailTask,
  createListChecklistTask,
} from "../components/Task/store";
import * as SQLite from "expo-sqlite";
import initializeDatabase from "../database/db";
import { createListCheckList } from "@components/Checklist/store";
import { createListGroupObject } from "@components/GroupObject/store";
import { createListObject } from "@components/Object/store";
import { createListUser } from "@components/User/store";
import { createListStandard } from "@components/TaskDetail/store";

export function isArrayCompleted(array: any) {
  if (array.length) {
    // Duyệt qua từng phần tử trong mảng
    for (let i = 0; i < array.length; i++) {
      // Nếu phần tử hiện tại có thuộc tính process bằng 'NG' hoặc rỗng
      if (
        array[i].process === "ng" ||
        array[i].process === "" ||
        array[i].process === null
      ) {
        // Trả về false, tức là mảng chưa hoàn thành
        return false;
      }
    }

    // Nếu duyệt hết mảng mà không tìm thấy phần tử nào có process = 'NG' hoặc rỗng
    // thì trả về true, tức là mảng đã hoàn thành
    return true;
  }
  return false;
}

export function countCompletedTasks(list_object: any) {
  if (list_object.length) {
    // Khởi tạo biến đếm
    let count = 0;

    // Duyệt qua từng phần tử trong mảng
    for (let i = 0; i < list_object.length; i++) {
      // Nếu phần tử có isDone là true thì tăng biến đếm
      if (isArrayCompleted(list_object[i].standard_task)) {
        count++;
      }
    }

    // Trả về số lượng phần tử đã đếm
    return count;
  }
  return 0;
}

// export function generateUniqueString() {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
// }

export function generateUniqueString() {
  const now = new Date();
  const year = now.getFullYear(); // Lấy năm
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Lấy tháng (0-11) nên +1, và định dạng 2 chữ số
  const day = String(now.getDate()).padStart(2, "0"); // Lấy ngày và định dạng 2 chữ số
  const randomStr = Math.random().toString(36).substr(2, 6); // Tạo chuỗi ngẫu nhiên 6 ký tự

  return `${year}${month}${day}_${randomStr}`;
}


export const countCompleteTask = (array: any) => {
  return array.filter((item: any) => {
    const process = item.process;
    // Kiểm tra nếu process có định dạng "x/x"
    return typeof process === "string" && /^(\d+)\/\1$/.test(process);
  }).length;
};

export const showLog = (logInfo: string) => {
  if (!isWeb) {
    Alert.alert("Cảnh báo", logInfo);
  } else globalMessage.show("Cảnh báo", logInfo);
};


export function formatVietnameseDate() {
  const now = new Date();

  // Chuyển sang múi giờ Việt Nam (UTC+7)
  const vietnamTime = new Date(now);

  const hours = vietnamTime.getHours();
  const minutes = vietnamTime.getMinutes();
  const day = vietnamTime.getDate();
  const month = vietnamTime.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
  const year = vietnamTime.getFullYear();

  return `*Biên bản này được hoàn thành vào ${hours} giờ ${minutes} phút ngày ${day} tháng ${month} năm ${year}`;
}


export const clearAuth = () => {
  if (!isWeb) {
    AsyncStorage.removeItem("username");
    AsyncStorage.removeItem("password");
    AsyncStorage.removeItem("accessToken");
  } else {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("accessToken");
  }
}

export const showMessage = (message: string) => {
  globalMessage.show("Thông báo", message);
}

export const asyncAllData = async () => {
  try {
    await initializeDatabase();
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    const data2: any = await db.getAllAsync("SELECT * FROM checklist_task");
    await db.runAsync("DELETE FROM checklist_task");
    await db.runAsync("DELETE FROM detail_task");
    await db.runAsync("DELETE FROM object_task");
    await db.runAsync("DELETE FROM standard");
    await db.runAsync("DELETE FROM object");
    await db.runAsync("DELETE FROM GroupObject");
    await db.runAsync("DELETE FROM checklist");
    await db.runAsync("DELETE FROM task");
    await db.runAsync("DELETE FROM user");
    const res: any = await getAllData();

    // console.log(res.data.object);

    await createListCheckList(res.data.check_list);
    await createListGroupObject(res.data.group_object);
    await createListObject(res.data.object);
    await createListTask(res.data.task);
    await createListUser(res.data.users);
    await createListStandard(res.data.standard);
    await createListObjectTask(res.data.object_task);
    await createListDetailTask(res.data.standard_task);
    await createListChecklistTask(res.data.checklist_task);
    showMessage("Đồng bộ dữ liệu thành công. Toàn bộ dữ liệu đã được sao lưu về máy.");
    // await createListStandard(res.data.standard)
    // await createListObject(res.object)
  } catch (e: any) {
    showMessage("Đồng bộ thất bại\n" + e.responses.massage);
  }
};

export const generateFileName = (taskName: string, position: string, objectName: string, ext: string) => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
  const HH = String(now.getHours()).padStart(2, "0");
  const MM = String(now.getMinutes()).padStart(2, "0");
  const SS = String(now.getSeconds()).padStart(2, "0");

  const safeTask = taskName?.replace(/\s+/g, "_") || "task";
  const safeObject = objectName?.replace(/\s+/g, "_") || "object";
  const safePosition = position?.replace(/\s+/g, "_") || "position";

  return `${dd}${mm}${yy}_${HH}${MM}${SS}_${safeTask}_${safePosition}_${safeObject}${ext}`;
};
