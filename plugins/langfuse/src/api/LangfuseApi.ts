import {
    createApiRef,
    DiscoveryApi,
    FetchApi,
  } from '@backstage/core-plugin-api';
  import type {
    CostResult, KpiOverview, PromptRow, ScoresResult, TimeRange, TraceRow, UsageRow,
  } from './types';
  
  export interface LangfuseApi {
    overview(range: TimeRange): Promise<KpiOverview>;
    usage(range: TimeRange): Promise<UsageRow[]>;
    cost(range: TimeRange): Promise<CostResult>;
    traces(range: TimeRange, limit?: number): Promise<TraceRow[]>;
    prompts(): Promise<PromptRow[]>;
    scores(range: TimeRange, kind: 'rag' | 'agent'): Promise<ScoresResult[]>;
  }
  
  export const langfuseApiRef = createApiRef<LangfuseApi>({
    id: 'plugin.langfuse.service',
  });
  
  export class LangfuseClientApi implements LangfuseApi {
    constructor(
      private readonly discoveryApi: DiscoveryApi,
      private readonly fetchApi: FetchApi,
    ) {}
  
    private async base() {
      return this.discoveryApi.getBaseUrl('langfuse');
    }
  
    private qs(range: TimeRange, extra: Record<string, string> = {}) {
      const p = new URLSearchParams({ from: range.from, to: range.to, ...extra });
      if (range.environment) p.set('environment', range.environment);
      return p.toString();
    }
  
    private async get<T>(path: string): Promise<T> {
      const res = await this.fetchApi.fetch(`${await this.base()}${path}`);
      if (!res.ok) throw new Error(`Langfuse API ${res.status}: ${await res.text()}`);
      return (await res.json()) as T;
    }
  
    overview(range: TimeRange) {
      return this.get<KpiOverview>(`/overview?${this.qs(range)}`);
    }
    usage(range: TimeRange) {
      return this.get<UsageRow[]>(`/usage?${this.qs(range)}`);
    }
    cost(range: TimeRange) {
      return this.get<CostResult>(`/cost?${this.qs(range)}`);
    }
    traces(range: TimeRange, limit = 50) {
      return this.get<TraceRow[]>(`/traces?${this.qs(range, { limit: String(limit) })}`);
    }
    prompts() {
      return this.get<PromptRow[]>(`/prompts`);
    }
    scores(range: TimeRange, kind: 'rag' | 'agent') {
      return this.get<ScoresResult[]>(`/scores?${this.qs(range, { kind })}`);
    }
  }
  