export type TypeParamsStandard = {
  checklist_id: number;
  name?: string;
};

export type TypeStandard = {
  id: number;
  content: string;
  standard: string;
  content_method: string;
  check_list_id?: number;
  stt?: number;
};
