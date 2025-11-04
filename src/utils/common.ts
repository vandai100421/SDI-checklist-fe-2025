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
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import initializeDatabase from "../database/db";
import { createListCheckList } from "@components/Checklist/store";
import { createListGroupObject } from "@components/GroupObject/store";
import { createListObject } from "@components/Object/store";
import { createListUser } from "@components/User/store";
import { createListStandard } from "@components/TaskDetail/store";
import { getBaseURL } from "../apis/base";

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

    // Xóa dữ liệu cũ
    const tables = [
      "checklist_task",
      "detail_task",
      "object_task",
      "standard",
      "object",
      "GroupObject",
      "checklist",
      "task",
      "user",
    ];
    for (const table of tables) {
      await db.runAsync(`DELETE FROM ${table}`);
    }

    // Gọi API lấy dữ liệu
    const res: any = await getAllData();
    const {
      check_list,
      group_object,
      object,
      task,
      users,
      standard,
      object_task,
      standard_task,
      checklist_task,
    } = res.data;

    // Tạo dữ liệu mới
    await createListCheckList(check_list);
    await createListGroupObject(group_object);
    await createListObject(object);
    await createListTask(task);
    await createListUser(users);
    await createListStandard(standard);
    await createListObjectTask(object_task);
    await createListDetailTask(standard_task);
    await createListChecklistTask(checklist_task);

    // ==============================
    // 🖼️ Xử lý tải ảnh và PDF
    // ==============================
    await handleMediaSync(db, standard_task, object_task);

    showMessage("✅ Đồng bộ dữ liệu và file thành công.");
  } catch (e: any) {
    console.error(e);
    showMessage("❌ Đồng bộ thất bại: " + (e.message || "Lỗi không xác định"));
  }
};

// export const handleMediaSync = async (db: any, standard_task: any[], object_task: any[]) => {
//   try {
//     // ✅ 1. Kiểm tra quyền lưu file vào thư viện chỉ 1 lần duy nhất
//     let { status } = await MediaLibrary.getPermissionsAsync();
//     if (status !== "granted") {
//       const permission = await MediaLibrary.requestPermissionsAsync();
//       status = permission.status;
//     }
//     if (status !== "granted") {
//       showMessage("❌ Không có quyền truy cập thư viện ảnh. Không thể lưu ảnh.");
//       return;
//     }

//     // ==============================
//     // 🖼️ TẢI ẢNH → LƯU VÀO THƯ VIỆN
//     // ==============================
//     const imagePromises = standard_task
//       .filter((item) => !!item.image)
//       .map(async (item) => {
//         try {
//           const fullUrl = await getFullUrl(item.image);
//           const filename = item.image.split("/").pop();
//           const localPath = `${FileSystem.documentDirectory}${filename}`;

//           // 🔹 Kiểm tra nếu file đã tồn tại -> bỏ qua
//           const fileInfo = await FileSystem.getInfoAsync(localPath);
//           let _uri: string
//           if (!fileInfo.exists) {
//             console.log("📥 Tải ảnh:", fullUrl);
//             const { uri } = await FileSystem.downloadAsync(fullUrl, localPath);
//             _uri = uri
//           } else {
//             console.log("⚡ Ảnh đã tồn tại:", localPath);
//           }

//           // 🔹 Tạo asset một lần
//           const asset = await MediaLibrary.createAssetAsync(localPath);
//           let album = await MediaLibrary.getAlbumAsync("SDI-Checklist");
//           if (!album) {
//             album = await MediaLibrary.createAlbumAsync("SDI-Checklist", asset, false);
//           }
//           await MediaLibrary.addAssetsToAlbumAsync(asset, album, false);

//           // 🔹 Cập nhật lại SQLite
//           await db.runAsync(
//             "UPDATE detail_task SET mobile_path = ? WHERE id = ?",
//             [asset.uri, item.id]
//           );

//           console.log('===uri', asset.uri);
//           console.log('===localPath', localPath);

//         } catch (err) {
//           console.warn("❌ Lỗi tải ảnh:", item.image, err);
//         }
//       });

//     // ==============================
//     // 📄 TẢI PDF → LƯU LOCAL
//     // ==============================
//     const pdfPromises = object_task
//       .filter((item) => !!item.pdf_path)
//       .map(async (item) => {
//         try {
//           const fullUrl = await getFullUrl(item.pdf_path);
//           const filename = item.pdf_path.split("/").pop();
//           const localPath = `${FileSystem.documentDirectory}${filename}`;

//           const fileInfo = await FileSystem.getInfoAsync(localPath);
//           if (!fileInfo.exists) {
//             console.log("📥 Tải PDF:", fullUrl);
//             await FileSystem.downloadAsync(fullUrl, localPath);
//           } else {
//             console.log("⚡ PDF đã tồn tại:", localPath);
//           }

//           await db.runAsync(
//             "UPDATE object_task SET mobile_pdf_path = ? WHERE id = ?",
//             [localPath, item.id]
//           );
//         } catch (err) {
//           console.warn("❌ Lỗi tải PDF:", item.pdf_path, err);
//         }
//       });

//     await Promise.all([...imagePromises, ...pdfPromises]);
//     showMessage("✅ Tải file & cập nhật đường dẫn hoàn tất!");
//   } catch (err: any) {
//     console.error("❌ Lỗi tổng thể khi đồng bộ file:", err);
//     showMessage("❌ Lỗi đồng bộ file: " + err.message);
//   }
// };



export const handleMediaSync = async (db: any, standard_task: any[], object_task: any[]) => {
  try {
    // ==============================
    // 🖼️ TẢI ẢNH → LƯU LOCAL & CẬP NHẬT DB
    // ==============================
    const imagePromises = standard_task
      .filter((item) => !!item.image)
      .map(async (item) => {
        try {
          const fullUrl = await getFullUrl(item.image);
          const filename = item.image.split("/").pop();
          const localPath = `${FileSystem.documentDirectory}${filename}`;

          // 🔹 Kiểm tra nếu file đã tồn tại -> bỏ qua tải lại
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          if (!fileInfo.exists) {
            console.log("📥 Đang tải ảnh:", fullUrl);
            const { uri } = await FileSystem.downloadAsync(fullUrl, localPath);
            console.log("✅ Tải xong:", uri);

            // 🔹 Cập nhật path vào DB
            await db.runAsync(
              "UPDATE detail_task SET mobile_path = ? WHERE id = ?",
              [uri, item.id]
            );
          } else {
            console.log("⚡ Ảnh đã tồn tại:", localPath);
            // 🔹 Đảm bảo DB có path đúng
            await db.runAsync(
              "UPDATE detail_task SET mobile_path = ? WHERE id = ?",
              [localPath, item.id]
            );
          }
        } catch (err) {
          console.warn("❌ Lỗi tải ảnh:", item.image, err);
        }
      });

    // ==============================
    // 📄 TẢI PDF → LƯU LOCAL & CẬP NHẬT DB
    // ==============================
    const pdfPromises = object_task
      .filter((item) => !!item.pdf_path)
      .map(async (item) => {
        try {
          const fullUrl = await getFullUrl(item.pdf_path);
          const filename = item.pdf_path.split("/").pop();
          const localPath = `${FileSystem.documentDirectory}${filename}`;

          const fileInfo = await FileSystem.getInfoAsync(localPath);
          if (!fileInfo.exists) {
            console.log("📥 Đang tải PDF:", fullUrl);
            const { uri } = await FileSystem.downloadAsync(fullUrl, localPath);
            console.log("✅ Tải PDF xong:", uri);

            await db.runAsync(
              "UPDATE object_task SET mobile_pdf_path = ? WHERE id = ?",
              [uri, item.id]
            );
          } else {
            console.log("⚡ PDF đã tồn tại:", localPath);
            await db.runAsync(
              "UPDATE object_task SET mobile_pdf_path = ? WHERE id = ?",
              [localPath, item.id]
            );
          }
        } catch (err) {
          console.warn("❌ Lỗi tải PDF:", item.pdf_path, err);
        }
      });

    // Chờ tất cả hoàn tất
    await Promise.all([...imagePromises, ...pdfPromises]);

    showMessage("✅ Đồng bộ file & cập nhật đường dẫn hoàn tất!");
  } catch (err: any) {
    console.error("❌ Lỗi tổng thể khi đồng bộ file:", err);
    showMessage("❌ Lỗi đồng bộ file: " + err.message);
  }
};

const getFullUrl = async (path?: string) => {
  return `${await AsyncStorage.getItem("baseURL")}/images${path}`;
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
