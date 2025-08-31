import { TypeGetAll } from "@/src/types/common";
import { request } from "./base";
import { TypeParamsStandard, TypeStandard } from "@/src/types/standard";

const standardApi = {
  getAll: (params?: TypeGetAll) => {
    return request("/standard", {
      method: "GET",
      params,
    });
  },
  create: (data: TypeStandard) => {
    return request("/standard", {
      method: "POST",
      data,
    });
  },
  update: (data: TypeStandard) => {
    return request("/standard/" + data.id, {
      method: "PUT",
      data,
    });
  },
  delete: (id: number) => {
    return request("/standard/" + id, {
      method: "Delete",
    });
  },
};

export default standardApi;
