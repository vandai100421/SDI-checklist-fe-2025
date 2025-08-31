import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import authApi from "@/src/apis/auth";
import { TypeUser } from "@/src/types/user";
import { showMessage } from "@utils/common";

export const signUp = async (data: TypeUser, isConnectedInternet?: boolean) => {

  if (isConnectedInternet) {
    try {
      await authApi.register(data);
      showMessage("Đăng ký thành công")
    } catch (error) {
      showMessage("Đăng ký thất bại. Vui lòng thử lại.\n")
    }
    return;
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    try {
      await db.execAsync(`
        INSERT INTO User (id, name, email, company, username, password, created_at, status)
        VALUES ( '${data.id}', '${data.name}', '${data.email}', '${data.company}', '${data.username}', '${data.password}', '${Date.now()}', 'pending-add');
        `);
      showMessage("Đăng ký thành công")
    } catch (error) {
      showMessage("Đăng ký thất bại. Vui lòng thử lại.\n" + error)
    }
  }
};
