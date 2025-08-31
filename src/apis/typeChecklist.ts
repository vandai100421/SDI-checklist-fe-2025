import { TypeObject } from "@/src/types/object";
import { request } from "./base";

const typeChecklistApi = {
  getAll: () => {
    return request("/check_list_type", {
      method: "GET",
    });
  },
  create: (data: TypeObject) => {
    return request("/check_list_type", {
      method: "POST", data: { name: data.name, position: data.position, manage_department_id: data.manage_department_id }
    });
  },
  update: (data: TypeObject) => {
    return request("/check_list_type/" + data.id, {
      method: "PUT", data
    });
  },
  delete: (id: number) => {
    return request("/check_list_type/" + id, {
      method: "Delete"
    });
  }
};

export default typeChecklistApi;
