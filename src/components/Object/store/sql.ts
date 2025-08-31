export const statementCreateTableManagement =
  "CREATE TABLE IF NOT EXISTS manage (id Text PRIMARY KEY NOT NULL, name TEXT NOT NULL);";

export const statementDropTable = "DROP TABLE IF EXISTS `manage`;";

export const statementGetAll = "SELECT * FROM manage;";

export const stateInsertDataManagement =
  "INSERT INTO `manage` (id, name) VALUES ($id, $name);";

//object
export const statementCreateTableObject =
  "CREATE TABLE IF NOT EXISTS `object` (`id` Text PRIMARY KEY NOT NULL,`name` TEXT NOT NULL,`position` TEXT NOT NULL,`manage` TEXT ,`group_object_id` TEXT, `status` TEXT, `stt` INTERGER );";

export const statementGetAllObject =
  "SELECT * FROM object where  name like '%${name}%' AND group_object_id = $group_object_id ;";

export const statementCreateObject =
  "INSERT INTO object (id, name, position, manage, group_object_id, status, stt)VALUES ($id, $name, $position, $manage, $group_object_id, 'pending-add', $stt);";

export const statementUpdateObject =
  "UPDATE `object` SET `name` = $name, `manage` = $manage, `position` = $position, `status` = 'pending-update' WHERE (`id` = $id);";

export const statementDeleteObject = "DELETE FROM object WHERE id = $id";

export const statementDropTableObject = "DROP TABLE IF EXISTS `object`;";
