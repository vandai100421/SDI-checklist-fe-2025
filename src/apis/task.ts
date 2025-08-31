import { TypeParamsTask, TypeStandardTask, TypeTask } from "@/src/types/task";
import { request } from "./base";
import { TypeGetAll } from "@/src/types/common";
import axios from "axios";

const taskApi = {
  getAll: (params?: TypeParamsTask) => {
    return request("/task", {
      method: "GET",
      params,
    });
  },
  create: (data: TypeTask) => {
    return request("/task", {
      method: "POST",
      data: {
        id: data.id,
        name: data.name,
        checklist_id: data.checklist_id,
        list_object: data.list_object,
        ended_at: data.ended_at,
        started_at: data.started_at,
        position: "",
        creator: data.creator,
        pic: "",
        worker: "",
        process: "",
      },
    });
  },
  async: (data: any) => {
    return request("/check_list/async_data", {
      method: "POST",
      data: data,
    });
  },
  asyncFromMobile: (data: any) => {
    return request("/check_list/async_from_mobile", {
      method: "POST",
      data,
    });
  },
  update: (data: TypeTask) => {
    return request("/task/" + data.id, {
      method: "PUT",
      data,
    });
  },
  delete: (id: number) => {
    return request("/task/" + id, {
      method: "Delete",
    });
  },

  getAllData: () => {
    return request("/task/get_all_data", {
      method: "GET",
    });
  },
  getAllObject: (params?: TypeGetAll) => {
    return request("/task/" + params?.task_id, {
      method: "GET",
      params,
    });
  },
  getDetailObjectTask: (params?: TypeGetAll) => {
    return request("/task/detail/" + params?.object_task_id, {
      method: "GET",
      params,
    });
  },
  updateProcess: (data: TypeStandardTask, formData: any) => {
    return request("/task/update_process/" + data.id, {
      method: "PUT",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updatePDF: (object_task_id: any, formData: any) => {
    return request("/task/upload_pdf/" + object_task_id, {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default taskApi;
