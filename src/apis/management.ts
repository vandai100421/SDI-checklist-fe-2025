import { TypeObject } from "@/src/types/object";
import { request } from "./base";

const managementApi = {
  getAll: () => {
    return request("/management", {
      method: "GET",
    });
  },
};

export default managementApi;
