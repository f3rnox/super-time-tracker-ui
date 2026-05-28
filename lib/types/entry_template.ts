export interface EntryTemplate {
  id: string;
  name: string;
  description: string;
  defaultSheetName?: string;
  tags?: string[];
  favorite?: boolean;
  shortcutKey?: string;
  pomodoroLinked?: boolean;
  createdAt?: string;
  lastUsedAt?: string;
  useCount?: number;
}
