//Task
export const statementCreateTableTask =
  "CREATE TABLE IF NOT EXISTS `task` (`id` Text PRIMARY KEY NOT NULL,`name` TEXT NOT NULL,`position` TEXT NOT NULL,`process` TEXT NOT NULL,`creator` TEXT NOT NULL,`pic` TEXT NOT NULL,`worker` TEXT NOT NULL,`started_at` DATE,`ended_at` DATE, `status` TEXT);";

export const statementCreateTask =
  "INSERT INTO Task (id, name, position, process, creator, pic, worker, started_at, ended_at, status)VALUES ($id, $name, $position, $process, $creator, $pic, $worker, $started_at, $ended_at, 'pending-add');";

export const statementUpdateTask =
  "UPDATE `Task` SET name=$name, position=$position, process=$process, creator=$creator, pic=$pic, worker=$worker, status='pending-update' WHERE (`id` = $id);";

export const statementDeleteTask = "DELETE FROM Task WHERE id = $id";

export const statementDropTableTask = "DROP TABLE IF EXISTS `Task`;";

// checklist task
export const statementCreateTableObject_Task =
  "CREATE TABLE IF NOT EXISTS `object_task` (`id` Text PRIMARY KEY NOT NULL, `object_id` TEXT NOT NULL,`task_id` TEXT NOT NULL, `process` TEXT, `pic` TEXT,`pdf_path` TEXT,`mobile_pdf_path` TEXT, `status` TEXT);";
export const statementCreateTableChecklist_Task =
  "CREATE TABLE IF NOT EXISTS `checklist_task` (`id` Text PRIMARY KEY NOT NULL,`checklist_id` TEXT NOT NULL,`task_id` TEXT NOT NULL,`process` TEXT,`image` TEXT, `status` TEXT);";
export const statementCreateTableDetail_Task =
  "CREATE TABLE IF NOT EXISTS `detail_task` (`id` Text PRIMARY KEY NOT NULL,  `object_task_id` TEXT NOT NULL,  `standard_id` TEXT NOT NULL,  `image` TEXT, `mobile_path` TEXT,  `checker` TEXT,  `process` TEXT, `count_ng` TEXT, `note` TEXT, `status` TEXT);";

export const statementInsertObject_Task =
  "INSERT INTO `object_task` (id, object_id, task_id, process, status ) VALUES ($id, $object_id, $task_id, $process, 'pending-add');";
export const statementInsertChecklist_Task =
  "INSERT INTO `checklist_task` (id, checklist_id, task_id, status ) VALUES ($id, $checklist_id, $task_id,'pending-add');";
export const statementInsertDetail_task =
  "INSERT INTO `detail_task` (id, standard_id, object_task_id, process, image, note, status ) VALUES ($id, $standard_id, $object_task_id, $process, $image, $note, 'pending-add');";
// checklist
