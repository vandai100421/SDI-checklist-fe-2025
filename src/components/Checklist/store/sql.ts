
//object
export const statementCreateTableChecklist =
  "CREATE TABLE IF NOT EXISTS `Checklist` (`id` Text PRIMARY KEY NOT NULL,`name` TEXT NOT NULL,`type_checklist_id` INTEGER DEFAULT NULL, `status` TEXT);";

export const statementCreateChecklist =
  "INSERT INTO Checklist (id, name, status )VALUES ($id, $name, 'pending-add');";

export const statementUpdateChecklist =
  "UPDATE `Checklist` SET `name` = $name, `status` = 'pending-update' WHERE (`id` = $id);";

export const statementDeleteChecklist = "DELETE FROM Checklist WHERE id = $id";

export const statementDropTableChecklist = "DROP TABLE IF EXISTS `Checklist`;";
