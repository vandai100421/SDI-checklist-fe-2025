import { globalMessage } from "@components/Lib/GlobalMessage";
import { hookstate } from "@hookstate/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isWeb } from "@utils/deviceInfo";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import userApi from "@/src/apis/user";
import { TypeGetAll } from "@/src/types/common";
import { TypeUser } from "@/src/types/user";
import { v4 as uuidv4 } from "uuid";
import { statementUpdateUser } from "./sql";
import { showMessage } from "@utils/common";

type TypeStore = {
  data: Array<TypeUser>;
  page: number;
  pageSize: number;
};

const initialStore: TypeStore = {
  data: [],
  page: 1,
  pageSize: 20,
};

const userStore = hookstate(initialStore);

export const createUser = async (
  data: TypeUser,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await userApi.create(data);
      showMessage("Thêm mới thành công");
    } catch (error: any) {
      showMessage("Thêm mới thất bại.\n" + error.response.data);
    }
    return
  }
  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    /// check
    const dataUser: any = await db.getAllAsync(
      `SELECT * FROM User WHERE username = ?;`,
      data.username as any
    );

    if (dataUser.length) {
      showMessage(
        "Tạo mới thất bại. Thành viên này đã tồn tại."
      );
      return;
    }
    try {
      await db.execAsync(`
        INSERT INTO User (id, name, email, company, username, password, created_at, status)
        VALUES ( '${data.id}', '${data.name}', '${data.email}', '${data.company
        }', '${data.username}', '${data.password
        }', '${Date.now()}', 'pending-add');
        `);

      showMessage("Thêm mới thành công");
    } catch (error) {
      showMessage("Thêm mới thất bại. Vui lòng thử lại.\n" + error);
    }

  }
};
export const createListUser = async (data: TypeUser[]) => {
  try {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });
    await Promise.all(
      data.map((item) => {
        return db.execAsync(`
          INSERT INTO User (id, name, email, company, username, password, created_at)
          VALUES ( '${item.id}', '${item.name}', '${item.email}', '${item.company
          }', '${item.username}', '${item.password}', '${Date.now()}');
          `);
      })
    );
  } catch (e) {
    console.log("error user");
  }
};
export const updateUser = async (
  data: TypeUser,
  isConnectedInternet?: boolean
) => {
  if (isConnectedInternet) {
    try {
      await userApi.update(data);
      globalMessage.show("Thông báo", "Cập nhật người dùng thành công");
    } catch (error) {
      globalMessage.show("Thông báo", "Cập nhật người dùng thất bại\n" + error);
    }
    return
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    const updateUser = await db.prepareAsync(
      statementUpdateUser
    );

    try {
      const res = await updateUser.executeAsync(
        {
          $email: data.email,
          $name: data.name,
          $company: data.company,
          $username: data.username,
          $password: data.password,
          $id: data.id,
        }
      );

      showMessage("Cập nhật người dùng thành công");
    } catch (error) {
      showMessage("Cập nhật người dùng thất bại\n" + error);
    }
  }
};

export const deleteUser = async (id: number, isConnectedInternet?: boolean) => {
  if (isConnectedInternet) {
    try {
      await userApi.delete(id);
      showMessage("Xóa người dùng thành công");
    } catch (error) {
      showMessage("Xóa người dùng thất bại\n" + error);
    }
    return
  }

  if (!isWeb) {
    const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
      useNewConnection: true,
    });

    try {
      await db.runAsync(
        `
      DELETE from user WHERE id=?;
      `,
        id
      );
      showMessage("Xóa người dùng thành công");
    } catch (error) {
      showMessage("Xóa người dùng thất bại\n" + error);
    }
  }
};

export const getAllUser = async (
  params?: TypeGetAll,
  isConnectedInternet?: boolean
) => {
  if (!isWeb) {
    if (isConnectedInternet) {
      try {
        const data = await userApi.getAll();
        userStore.merge({
          data: data.data,
          page: params?.page,
          pageSize: params?.pageSize,
        });
      } catch (error) {
        Alert.alert("Thất bại", "Lấy dữ liệu người dùng thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
      return
    } else {
      const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
        useNewConnection: true,
      });

      try {
        let data: any;
        if (!params?.name) {
          data = await db.getAllAsync(`
        SELECT * FROM User 
        `);
        } else
          data = await db.getAllAsync(`
        SELECT * FROM User WHERE name like '%${params?.name}%'
        `);

        userStore.merge({
          data: data,
          page: params?.page,
          pageSize: params?.pageSize,
        });
      } catch (error) {
        Alert.alert("Thất bại", "Lấy dữ liệu người dùng thất bại\n" + error, [
          { text: "OK" },
        ]);
      }
    }
  } else {
    try {
      const data = await userApi.getAll();
      userStore.merge({
        data: data.data,
        page: params?.page,
        pageSize: params?.pageSize,
      });
    } catch (error) {
      globalMessage.show("Thất bại", "Lấy dữ liệu thất bại\n" + error);
    }
  }
};

export default userStore;
