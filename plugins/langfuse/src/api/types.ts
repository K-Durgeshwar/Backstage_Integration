export type TimeRange = { from: string; to: string; environment?: string };

export type KpiOverview = {
  traces: number;
  tokens: number;
  cost: number;
  p95LatencyMs: number;
  series: { date: string; traces: number; tokens: number }[];
  costByModel: { model: string; cost: number }[];
};

export type UsageRow = {
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  avgLatencyMs: number;
};

export type CostResult = {
  total: number;
  byModel: { model: string; cost: number }[];
  overTime: { date: string; cost: number }[];
};

export type TraceRow = {
  id: string;
  name: string;
  model: string;
  tokens: number;
  cost: number;
  latencyMs: number;
  status: 'success' | 'error';
  timestamp: string;
};

export type PromptRow = {
  name: string;
  versions: number;
  latestVersion: number;
  labels: string[];
  updatedAt: string;
};

export type ScoresResult = {
  name: string;
  average: number;
  series: { date: string; value: number }[];
};
