//object
export const statementCreateTableStandard =
  "CREATE TABLE IF NOT EXISTS `standard` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`content` TEXT,`standard` TEXT,`content_method` TEXT,`check_list_id` INTEGER NOT NULL,FOREIGN KEY (`check_list_id`) REFERENCES `checklist` (`id`) ) ;";

export const statementCreateStandard =
  "INSERT INTO `standard` (id,content, standard, content_method, check_list_id, stt ) VALUES ($id,$content, $standard, $content_method, $checklist_id, $stt);";

export const statementUpdateStandard =
  "UPDATE `standard` SET `content` = $content, `standard` = $standard, `content_method` = $content_method WHERE (`id` = $id);";

export const statementDeleteStandard = "DELETE FROM `standard` WHERE id = $id";

export const statementDropTableStandard = "DROP TABLE IF EXISTS `standard`;";
