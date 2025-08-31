import { TypeUser } from "@/src/types/user";
import { request } from "./base";

const userApi = {
  getAll: () => {
    return request("/user", {
      method: "GET",
    });
  },
  create: (data: TypeUser) => {
    return request("/user", {
      method: "POST", data
    });
  },
  update: (data: TypeUser) => {
    return request("/user/" + data.id, {
      method: "PUT", data
    });
  },
  delete: (id: number) => {
    return request("/user/" + id, {
      method: "Delete"
    });
  }
};

export default userApi;
