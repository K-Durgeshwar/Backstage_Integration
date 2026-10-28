import NodeCache from 'node-cache';
import type {
  CostResult, KpiOverview, LangfuseDataSource, PromptRow,
  ScoresResult, TimeRange, TraceRow, UsageRow,
} from './types';

export class LangfuseClient implements LangfuseDataSource {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly cache: NodeCache;

  constructor(opts: {
    baseUrl: string; publicKey: string; secretKey: string; cacheTtlSeconds: number;
  }) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.authHeader =
      'Basic ' + Buffer.from(`${opts.publicKey}:${opts.secretKey}`).toString('base64');
    this.cache = new NodeCache({ stdTTL: opts.cacheTtlSeconds });
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const key = `${path}?${JSON.stringify(params ?? {})}`;
    const hit = this.cache.get<T>(key);
    if (hit) return hit;

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url, { headers: { Authorization: this.authHeader } });
    if (!res.ok) throw new Error(`Langfuse ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as T;
    this.cache.set(key, data);
    return data;
  }

  private metrics<T = { data: any[] }>(query: Record<string, unknown>) {
    return this.get<T>('/api/public/v2/metrics', { query: JSON.stringify(query) });
  }

  private baseFilters(range: TimeRange) {
    const f: any[] = [];
    if (range.environment)
      f.push({ column: 'environment', operator: '=', value: range.environment, type: 'string' });
    return f;
  }

  async overview(range: TimeRange): Promise<KpiOverview> {
    const daily = await this.metrics({
      view: 'observations',
      metrics: [
        { measure: 'count', aggregation: 'count' },
        { measure: 'totalTokens', aggregation: 'sum' },
      ],
      dimensions: [],
      filters: this.baseFilters(range),
      timeDimension: { granularity: 'day' },
      fromTimestamp: range.from,
      toTimestamp: range.to,
    });

    const byModel = await this.cost(range);
    const latency = await this.metrics({
      view: 'observations',
      metrics: [{ measure: 'latency', aggregation: 'p95' }],
      dimensions: [],
      filters: this.baseFilters(range),
      fromTimestamp: range.from,
      toTimestamp: range.to,
    });

    const rows: any[] = (daily as any).data ?? [];
    return {
      traces: rows.reduce((s, r) => s + Number(r.count_count ?? 0), 0),
      tokens: rows.reduce((s, r) => s + Number(r.sum_totalTokens ?? 0), 0),
      cost: byModel.total,
      p95LatencyMs: Number((latency as any).data?.[0]?.p95_latency ?? 0) * 1000,
      series: rows.map(r => ({
        date: r.time_dimension,
        traces: Number(r.count_count ?? 0),
        tokens: Number(r.sum_totalTokens ?? 0),
      })),
      costByModel: byModel.byModel,
    };
  }

  async usage(range: TimeRange): Promise<UsageRow[]> {
    const res = await this.metrics({
      view: 'observations',
      metrics: [
        { measure: 'count', aggregation: 'count' },
        { measure: 'inputTokens', aggregation: 'sum' },
        { measure: 'outputTokens', aggregation: 'sum' },
        { measure: 'latency', aggregation: 'avg' },
      ],
      dimensions: [{ field: 'providedModelName' }],
      filters: this.baseFilters(range),
      fromTimestamp: range.from,
      toTimestamp: range.to,
      config: { row_limit: 100 },
    });
    return ((res as any).data ?? []).map((r: any) => ({
      model: r.providedModelName ?? 'unknown',
      calls: Number(r.count_count ?? 0),
      inputTokens: Number(r.sum_inputTokens ?? 0),
      outputTokens: Number(r.sum_outputTokens ?? 0),
      avgLatencyMs: Number(r.avg_latency ?? 0) * 1000,
    }));
  }

  async cost(range: TimeRange): Promise<CostResult> {
    const byModel = await this.metrics({
      view: 'observations',
      metrics: [{ measure: 'totalCost', aggregation: 'sum' }],
      dimensions: [{ field: 'providedModelName' }],
      filters: this.baseFilters(range),
      fromTimestamp: range.from,
      toTimestamp: range.to,
      orderBy: [{ field: 'sum_totalCost', direction: 'desc' }],
      config: { row_limit: 100 },
    });
    const overTime = await this.metrics({
      view: 'observations',
      metrics: [{ measure: 'totalCost', aggregation: 'sum' }],
      dimensions: [],
      filters: this.baseFilters(range),
      timeDimension: { granularity: 'day' },
      fromTimestamp: range.from,
      toTimestamp: range.to,
    });
    const models = ((byModel as any).data ?? []).map((r: any) => ({
      model: r.providedModelName ?? 'unknown',
      cost: Number(r.sum_totalCost ?? 0),
    }));
    return {
      total: models.reduce((s: number, m: any) => s + m.cost, 0),
      byModel: models,
      overTime: ((overTime as any).data ?? []).map((r: any) => ({
        date: r.time_dimension,
        cost: Number(r.sum_totalCost ?? 0),
      })),
    };
  }

  async traces(range: TimeRange, limit = 50): Promise<TraceRow[]> {
    const res = await this.get<{ data: any[] }>('/api/public/traces', {
      fromTimestamp: range.from,
      toTimestamp: range.to,
      limit: String(limit),
      ...(range.environment ? { environment: range.environment } : {}),
    });
    return (res.data ?? []).map(t => ({
      id: t.id,
      name: t.name ?? '(unnamed)',
      model: t.metadata?.model ?? '-',
      tokens: Number(t.usage?.totalTokens ?? t.totalTokens ?? 0),
      cost: Number(t.totalCost ?? 0),
      latencyMs: Number(t.latency ?? 0),
      status: t.level === 'ERROR' ? 'error' : 'success',
      timestamp: t.timestamp,
    }));
  }

  trace(id: string) {
    return this.get(`/api/public/traces/${encodeURIComponent(id)}`);
  }

  async prompts(): Promise<PromptRow[]> {
    const res = await this.get<{ data: any[] }>('/api/public/v2/prompts', { limit: '100' });
    return (res.data ?? []).map(p => ({
      name: p.name,
      versions: p.versions?.length ?? Number(p.version ?? 1),
      latestVersion: Number(p.version ?? (p.versions?.length ?? 1)),
      labels: p.labels ?? [],
      updatedAt: p.updatedAt ?? p.lastUpdatedAt ?? '',
    }));
  }

  async scores(range: TimeRange, kind: 'rag' | 'agent'): Promise<ScoresResult[]> {
    const view = kind === 'agent' ? 'scores-boolean' : 'scores-numeric';
    const res = await this.metrics({
      view,
      metrics: [{ measure: 'value', aggregation: 'avg' }],
      dimensions: [{ field: 'name' }],
      filters: this.baseFilters(range),
      timeDimension: { granularity: 'day' },
      fromTimestamp: range.from,
      toTimestamp: range.to,
      config: { row_limit: 100 },
    });
    const rows: any[] = (res as any).data ?? [];
    const byName = new Map<string, { date: string; value: number }[]>();
    for (const r of rows) {
      const name = r.name ?? kind;
      const arr = byName.get(name) ?? [];
      arr.push({ date: r.time_dimension, value: Number(r.avg_value ?? 0) });
      byName.set(name, arr);
    }
    return [...byName.entries()].map(([name, series]) => ({
      name,
      average: series.reduce((s, p) => s + p.value, 0) / (series.length || 1),
      series,
    }));
  }
}
