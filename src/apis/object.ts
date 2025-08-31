import { TypeObject } from "@/src/types/object";
import { request } from "./base";
import axios from "axios";
import { TypeGetAll } from "../types/common";

const objectApi = {
  getAll: (params?: TypeGetAll) => {
    return request("/object", {
      method: "GET",
      params,
    });
  },
  downloadTmp: () => {
    return request("/download-template-object-info", {
      method: "GET",
    });
  },
  create: (data: TypeObject) => {
    return request("/object", {
      method: "POST",
      data,
    });
  },
  update: (data: TypeObject) => {
    return request("/object/" + data.id, {
      method: "PUT",
      data,
    });
  },
  delete: (id: number) => {
    return request("/object/" + id, {
      method: "Delete",
    });
  },
  upload: (data: any) => {
    return axios.post("http://localhost:3001/api/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default objectApi;
