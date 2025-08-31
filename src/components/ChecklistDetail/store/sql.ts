//object
export const statementCreateTableStandard =
  "CREATE TABLE IF NOT EXISTS `standard` (`id` Text PRIMARY KEY NOT NULL,`content` TEXT,`standard` TEXT,`content_method` TEXT, `status` TEXT, `check_list_id` INTEGER NOT NULL, `stt` INTEGER,FOREIGN KEY (`check_list_id`) REFERENCES `checklist` (`id`) ) ;";

export const statementCreateStandard =
  "INSERT INTO `standard` (id, content, standard, content_method, check_list_id, status, stt ) VALUES ($id, $content, $standard, $content_method, $checklist_id, 'pending-add', $stt);";

export const statementUpdateStandard =
  "UPDATE `standard` SET `content` = $content, `standard` = $standard, `content_method` = $content_method, `status`='pending-update' WHERE (`id` = $id);";

export const statementDeleteStandard = "DELETE FROM `standard` WHERE id = $id";

export const statementDropTableStandard = "DROP TABLE IF EXISTS `standard`;";
