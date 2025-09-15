export type TypeParamsTask = {
  checklist_id: number;
  name?: string;
};

export type TypeTask = {
  id: number;
  name: string;
  position?: string;
  process?: string;
  totalNG?: string;
  creator?: string;
  pic?: string;
  worker?: string;
  started_at?: string;
  ended_at?: string;
  checklist_id?: string;
  list_object?: string;
};

export type TypeStandardTask = {
  id?: number;
  process?: string;
  files?: string;
  note?: string;
  object_task_id?: string;
  standard_id?: string;
  standard_task_id?: string;
};
