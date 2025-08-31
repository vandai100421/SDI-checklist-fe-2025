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
export default initializeDatabase;
