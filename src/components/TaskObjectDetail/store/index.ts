import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { TypeGetAll } from "@/src/types/common";
import { Alert } from "react-native";
import taskApi from "@/src/apis/task";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { v4 as uuidv4 } from "uuid";
import { generateFileName, generateUniqueString, showMessage } from "@utils/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TypeStore = {
  data: Array<any>;
  editable?: boolean;
  pic: string;
  pic_ehs: string;
  pdf_path: string;
  mobile_pdf_path: string;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  editable: true,
  pic: "",
  pic_ehs: "",
  pdf_path: "",
  mobile_pdf_path: "",
  page: 1,
  pageSize: 20,
};

const taskObjectDetailStore = hookstate(initialStore);

function checkCompletionStatus(objects: any) {
  // Kiểm tra nếu có ít nhất một đối tượng có process === "ng"
  const hasIncomplete = objects.some((obj: any) => obj.process === "ng");

  // Trả về kết quả dựa trên điều kiện
  // return hasIncomplete ? "Chưa hoàn thành" : "Đã hoàn thành";
  return "Đã hoàn thành";
}

export const updateTaskObjectDetail = async (
  data: any,
  object_task_id?: string,
  task_id?: string,
  isConnectedInternet?: boolean,
  pic?: string,
  mobile_pdf_path?: string
) => {
  if (!isWeb) {
    const taskName = await AsyncStorage.getItem("task_name")
    const objectName = await AsyncStorage.getItem("object_task_name")
    const position = await AsyncStorage.getItem("object_task_position"); // đảm bảo lưu thêm field này khi chọn object

    if (isConnectedInternet) {
      /// update standard_task
      await data.map(async (item: any) => {
        const formData = new FormData();

        const customFileName = generateFileName(taskName!, position!, objectName!, ".jpeg"); // -> "DDMMYY_HHMMSS_TenViTri_TenDoiTuong.png"

        if (item.mobile_path) {
          formData.append("files", {
            uri: item.mobile_path,
            name: customFileName,
            type: "image/jpeg",
          });
        }


        // Gửi tên file về BE
        formData.append("custom_filename", customFileName);
        formData.append("task_name", taskName || "task");
        formData.append(
          "mobile_path",
          item.mobile_path ? item.mobile_path : ""
        );
        // , generateUniqueString() + ".png");
        formData.append("note", item.note);
        formData.append("checker", item.checker);
        formData.append("count_ng", item.count_ng);
        formData.append("process", item.process);
        formData.append("task_id", task_id as any);
        formData.append("process_object_task", checkCompletionStatus(data));
        try {
          await taskApi.updateProcess(item, formData);
        } catch (error) {
          Alert.alert(
            "Thông báo",
            "Cập nhật thất bại(Standard Task)\n" + error,
            [{ text: "OK" }]
          );
          return;
        }
      });
      // end update standard_task
      // update object_task
      try {
        const filenamePDF = generateFileName(taskName!, position!, objectName!, ".pdf");
        const formDataObjectTask = new FormData();

        formDataObjectTask.append("files", {
          uri: mobile_pdf_path,
          name: filenamePDF,
          type: "application/pdf",
        });
        formDataObjectTask.append("custom_filename", filenamePDF);
        formDataObjectTask.append("task_name", taskName || "task")
        formDataObjectTask.append("pic", pic as any);
        formDataObjectTask.append("mobile_pdf_path", mobile_pdf_path as any);
        await taskApi.updatePDF(object_task_id, formDataObjectTask);
      } catch (error) {
        showMessage("Cập nhật thất bại (ObjectTask)\n" + error);
        return;
      }

      // await taskApi.
      await showMessage("Cập nhật thành công");
      ///
    } else {
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });

      try {
        const count_ng = data.filter((obj: any) => obj.process === "ng").length;

        await data.map(async (item: any) => {
          const res = await db.execAsync(
            `Update detail_task set process = '${item.process ? item.process : ""
            }', mobile_path = '${item.mobile_path ? item.mobile_path : ""
            }', checker = '${item.checker ? item.checker : ""}', note = '${item.note ? item.note : ""
            }', count_ng = '${item.count_ng ? item.count_ng : ""
            }', status='pending-update' where id='${item.id}';`
          );
        });

        const resUpdateObjectTask = await db.execAsync(
          `Update object_task set process = '${"Đã hoàn thành"}' , pic='${pic ? pic : ""}', mobile_pdf_path='${mobile_pdf_path ? mobile_pdf_path : ""
          }', status='pending-update'  where id='${object_task_id}';`
        );

        const listObject = await db.getAllAsync(
          `SELECT * FROM object_task ot2 WHERE ot2.task_id = ?`,
          [task_id as string]
        );

        const countCompleted = listObject.filter(
          (item: any) => item.process === "Đã hoàn thành"
        );

        const resUpdateTask = await db.execAsync(
          `Update task set process = '${countCompleted.length + "/" + listObject.length
          }', status='pending-update' where id='${task_id}';`
        );

        showMessage("Cập nhật thành công");
      } catch (error) {
        showMessage("Cập nhật thất bại\n" + error);
      }
    }
  } else {
    data.map(async (item: any) => {
      const formData = new FormData();
      const files = new Blob(
        [
          JSON.stringify({
            uri: item.mobile_path,
            name: "uploaded_image.jpg",
            type: "image/jpeg",
          }),
        ],
        {
          type: "application/json",
        }
      );
      formData.append("files", files, generateUniqueString() + ".png");
      formData.append("note", item.note);
      formData.append("count_ng", item.count_ng);
      formData.append("checker", item.checker);
      formData.append("process", item.process);
      formData.append("mobile_path", item.mobile_path);
      try {
        await taskApi.updateProcess(item, formData);

        globalMessage.show("Thông báo", "Cập nhật thành công");
      } catch (error) {
        globalMessage.show("Thông báo", "Cập nhật thất bại\n" + error);
      }
    });
  }
};

export const getAllTaskObjectDetail = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    if (!isWeb) {
      try {
        const data = await taskApi.getDetailObjectTask(params);
        const result = data.data.standard_task.map((item: any) => {
          return {
            id: item.id,
            process: item.process,
            note: item.note,
            checker: item.checker,
            count_ng: item.count_ng,
            image: item.image,
            content: item.standard.content,
            content_method: item.standard.content_method,
            standard: item.standard.standard,
            mobile_path: item.mobile_path,
            stt: item.standard.stt,
          };
        });

        taskObjectDetailStore.merge({
          data: result,
          pic: data.data.pic,
          mobile_pdf_path: data.data.mobile_pdf_path,
          editable: data.data.mobile_pdf_path ? false : true,
        });
      } catch (error) {

        Alert.alert("Thất bại", "Lấy dữ liệu thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
    }
    else {
      try {
        const data = await taskApi.getDetailObjectTask(params);

        const result = data.data.standard_task.map((item: any) => {
          return {
            id: item.id,
            process: item.process,
            count_ng: item.count_ng,
            checker: item.checker,
            note: item.note,
            stt: item.standard.stt,
            image: `http://localhost:3001/${item.image}`,
            content: item.standard.content,
            content_method: item.standard.content_method,
            standard: item.standard.standard,
          };
        });

        taskObjectDetailStore.merge({
          data: result,
          pic: data.data.pic,
          mobile_pdf_path: data.data.mobile_pdf_path,
          pdf_path: data.data.pdf_path,
          editable: data.data.mobile_pdf_path ? false : true,
        });
      } catch (error) {
        Alert.alert("Thất bại", "Lấy dữ liệu thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
    }
  }
  else if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      // globalLoading.show();
      const whereClause = params?.name ? " AND content LIKE ?" : "";
      const args = [params?.object_task_id];

      const data: any = await db.getAllAsync(
        `SELECT 
        dt.id,
          dt.mobile_path,
          dt.note,
          dt.process,
          dt.count_ng,
          dt.checker,
          s.content,
          s.content_method,
          s.standard,
          s.stt,
          ot.pic,
          ot.mobile_pdf_path
        FROM 
            standard s
        INNER JOIN
            detail_task dt ON dt.standard_id = s.id
        INNER JOIN
            object_task ot ON ot.id = dt.object_task_id
        WHERE 
            ot.id = ?`,
        args as any
      );

      taskObjectDetailStore.merge({
        data: data,
        pic: data[0].pic || "",
        mobile_pdf_path: data[0].mobile_pdf_path || "",
        editable: data[0].mobile_pdf_path ? false : true,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      Alert.alert("Thất bại", "Lấy dữ liệu thất bại\n" + error, [
        { text: "OK" },
      ]);
    }
  }
};

export default taskObjectDetailStore;
