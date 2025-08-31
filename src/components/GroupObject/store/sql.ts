
//object
export const statementCreateTableGroupObject =
  "CREATE TABLE IF NOT EXISTS `GroupObject` (`id` Text PRIMARY KEY NOT NULL,`name` TEXT NOT NULL, `status` TEXT);";

export const statementCreateGroupObject =
  "INSERT INTO GroupObject (id, name, status )VALUES ($id, $name, 'pending-add');";

export const statementUpdateGroupObject =
  "UPDATE `GroupObject` SET `name` = $name, `status` = 'pending-update' WHERE (`id` = $id);";

export const statementDeleteGroupObject = "DELETE FROM GroupObject WHERE id = $id";

export const statementDropTableGroupObject = "DROP TABLE IF EXISTS `GroupObject`;";
