import { TypeGroupObject } from "../types/groupObject";
import { request } from "./base";
import axios from "axios";
const groupObjectApi = {
  getAll: () => {
    return request("/group_object", {
      method: "GET",
    });
  },
  create: (data: TypeGroupObject) => {
    return request("/group_object", {
      method: "POST",
      data,
    });
  },
  update: (data: TypeGroupObject) => {
    return request("/group_object/" + data.id, {
      method: "PUT",
      data: {
        name: data.name,
      },
    });
  },
  delete: (id: number) => {
    return request("/group_object/" + id, {
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

export default groupObjectApi;
