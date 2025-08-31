import { TypeLogin } from "@/src/types/auth";
import { request } from "./base";
import { TypeUser } from "@/src/types/user";

const authApi = {
  login: (data: TypeLogin) => {
    return request("/login", {
      method: "POST",
      data,
    });
  },
  register: (data: TypeUser) => {
    return request("/register", {
      method: "POST",
      data,
    });
  },
  checkHealth: () => {
    return request("/", {
      method: "GET",
    });
  },
};

export default authApi;
