import {
  statementCreateTableChecklist,
  statementDropTableChecklist,
} from "@components/Checklist/store/sql";
import { statementCreateTableStandard } from "@components/ChecklistDetail/store/sql";
import {
  statementCreateGroupObject,
  statementCreateTableGroupObject,
} from "@components/GroupObject/store/sql";
import {
  stateInsertDataManagement,
  statementCreateTableManagement,
  statementCreateTableObject,
  statementDropTable,
  statementDropTableObject,
} from "@components/Object/store/sql";
import {
  statementCreateTableChecklist_Task,
  statementCreateTableObject_Task,
  statementCreateTableDetail_Task,
  statementCreateTableTask,
  statementDropTableTask,
} from "@components/Task/store/sql";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
    useNewConnection: true,
  });
  try {
    await db.execAsync(`PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tmp_delete (id TEXT PRIMARY KEY NOT NULL, table_name TEXT,  id_value TEXT);
      `);
    await db.execAsync(`PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY NOT NULL, name TEXT, email TEXT, company TEXT, username TEXT, password TEXT, created_at TEXT, status TEXT);
      `);
  } catch (error) {
    console.log("error", error);
  }

  /// statement  prepare
  try {
    const createTableManagement = await db.prepareAsync(
      statementCreateTableManagement
    );

    // const insertManagement = await db.prepareAsync(stateInsertDataManagement);

    const createTableGroupObject = await db.prepareAsync(
      statementCreateTableGroupObject
    );
    const createTableObject = await db.prepareAsync(statementCreateTableObject);
    const createTableChecklist = await db.prepareAsync(
      statementCreateTableChecklist
    );

    const createTableStandard = await db.prepareAsync(
      statementCreateTableStandard
    );

    const createTableTask = await db.prepareAsync(statementCreateTableTask);

    // create management
    try {
      await createTableManagement.executeAsync();
      // const rs = await insertManagement.executeAsync({$id: "1325423986", $name: "Phong Khao sat" });
    } catch (error) {
      // await createTableManagement.finalizeAsync();
      console.error("e", error);
    }

    // create object

    try {
      await createTableGroupObject.executeAsync();
    } catch (error) {
      await createTableGroupObject.finalizeAsync();
    }

    try {
      await createTableObject.executeAsync();
    } catch (error) {
      await createTableObject.finalizeAsync();
    }
    // create checklist
    try {
      await createTableChecklist.executeAsync();
    } catch (error) {
      await createTableChecklist.finalizeAsync();
    }

    // create Standard
    try {
      await createTableStandard.executeAsync();
    } catch (error) {
      await createTableStandard.finalizeAsync();
    }

    // create Task
    try {
      await createTableTask.executeAsync();
    } catch (error) {
      await createTableTask.finalizeAsync();
    }

    // create related Task
    try {
      const createTableObject_Task = await db.prepareAsync(
        statementCreateTableObject_Task
      );
      await createTableObject_Task.executeAsync();
    } catch (error) {
      Alert.alert("Thông báo", "Lỗi khi tạo mới csdl\n" + error, [
        { text: "OK" },
      ]);
    }
    try {
      const reateTableChecklist_Task = await db.prepareAsync(
        statementCreateTableChecklist_Task
      );
      await reateTableChecklist_Task.executeAsync();
    } catch (error) {
      Alert.alert("Thông báo", "Lỗi khi tạo mới csdl\n" + error, [
        { text: "OK" },
      ]);
    }
    try {
      const createTableDetail_Task = await db.prepareAsync(
        statementCreateTableDetail_Task
      );
      await createTableDetail_Task.executeAsync();
    } catch (error) {
      Alert.alert("Thông báo", "Lỗi khi tạo mới csdl\n" + error, [
        { text: "OK" },
      ]);
    }
  } catch (error) {
    console.log("error", error);
  }

  return db;
};

export const deleteDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("sdi-checklist.db", {
    useNewConnection: true,
  });
  try {
    await db.execAsync("DROP TABLE IF EXISTS `User`;");
    await db.execAsync("DROP TABLE IF EXISTS `tmp_delete`;");
    await db.execAsync(statementDropTable);
    await db.execAsync(statementDropTableObject);
    await db.execAsync(statementDropTableChecklist);
    await db.execAsync("DROP TABLE IF EXISTS `checklist_task`;");
    await db.execAsync("DROP TABLE IF EXISTS `detail_task`;");
    await db.execAsync("DROP TABLE IF EXISTS `object_task`;");
    await db.execAsync("DROP TABLE IF EXISTS `standard_object`;");
    await db.execAsync("DROP TABLE IF EXISTS `GroupObject`;");
    await db.execAsync("DROP TABLE IF EXISTS `standard`;");
    await db.execAsync(statementDropTableTask);
    console.log("end delete");
    return db;
  } catch (error) {
    console.log("Xoa du lieu khong thanh cong");
    console.log("error", error);
  }
};

export const deleteDatabase2 = async () => {
  try {
    const dbName = "sdi-checklist.db";
    const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

    const info = await FileSystem.getInfoAsync(dbPath);
    if (info.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      console.log("✅ Đã xóa toàn bộ database:", dbPath);
      await clearMediaLibraryAlbum();
      await clearAllLocalFiles();

    } else {
      console.log("⚠️ Database không tồn tại:", dbPath);
    }
  } catch (error) {
    console.error("❌ Lỗi khi xóa database:", error);
  }
};

export async function clearAllLocalFiles() {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || "");

    for (const file of files) {
      const filePath = FileSystem.documentDirectory + file;
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    }

    console.log("✅ Đã xóa toàn bộ file trong documentDirectory");
  } catch (err) {
    console.error("❌ Lỗi khi xóa file:", err);
  }
}



export async function clearMediaLibraryAlbum() {
  try {
    const album = await MediaLibrary.getAlbumAsync("SDI-Checklist");
    if (album) {
      const assets = await MediaLibrary.getAssetsAsync({ album: album });
      const assetIds = assets.assets.map((a) => a.id);

      if (assetIds.length > 0) {
        await MediaLibrary.deleteAssetsAsync(assetIds);
        console.log(`✅ Đã xóa ${assetIds.length} ảnh trong album SDI-Checklist`);
      }
    } else {
      console.log("⚠️ Không tìm thấy album SDI-Checklist");
    }
  } catch (err) {
    console.error("❌ Lỗi khi xóa MediaLibrary:", err);
  }
}

export default initializeDatabase;
