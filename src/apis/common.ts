import { TypeObject } from "@/src/types/object";
import { request } from "./base";
import axios from "axios";

const commonApi = {
    delete: (url: string) => {
        return request(url, {
            method: "Delete"
        });
    },
    getAll: (url: string) => {
        return request(url, {
            method: "GET"
        });
    },
};

export default commonApi;
