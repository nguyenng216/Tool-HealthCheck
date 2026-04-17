export interface Report {
  id: number;
  title: string;
  summary: string;
  format: string;
  metadata?: Record<string, unknown> | null;
  generatedAt: Date;
  createdAt: Date;
}
