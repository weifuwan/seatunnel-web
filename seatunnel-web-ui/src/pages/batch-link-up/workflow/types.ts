export type TabKey = "basic" | "schedule" | "mapping" | "advanced";

export interface TabDefinition {
  key: TabKey;
  label: string;
  content: React.ReactNode;
}