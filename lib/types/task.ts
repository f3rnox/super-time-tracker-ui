export interface SerializedTask {
  id: string;
  sheetName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskSheetSummary {
  name: string;
  taskCount: number;
  openTaskCount: number;
  isActive: boolean;
  hasActiveEntry: boolean;
}

export interface TasksPageData {
  activeSheetName: string | null;
  sheets: TaskSheetSummary[];
  tasks: SerializedTask[];
  knownTags: string[];
}
