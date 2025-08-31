import { TypeChecklist } from "@/src/types/checklist";
import { request } from "./base";
import axios from "axios";
const checklistApi = {
  getAll: () => {
    return request("/check_list", {
      method: "GET",
    });
  },
  downloadTmp: () => {
    return request("/download-template-checklist", {
      method: "GET",
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    });
  },
  create: (data: TypeChecklist) => {
    return request("/check_list", {
      method: "POST",
      data,
    });
  },
  update: (data: TypeChecklist) => {
    return request("/check_list/" + data.id, {
      method: "PUT",
      data: {
        name: data.name,
        type_checklist_id: data.type_checklist_id,
      },
    });
  },
  delete: (id: number) => {
    return request("/check_list/" + id, {
      method: "Delete",
    });
  },
  upload: (data: any) => {
    return axios.post("http://localhost:3001/checklist/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default checklistApi;
