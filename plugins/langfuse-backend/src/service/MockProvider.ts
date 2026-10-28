import type {
    CostResult, KpiOverview, LangfuseDataSource, PromptRow,
    ScoresResult, TimeRange, TraceRow, UsageRow,
  } from './types';
  
  const days = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (n - 1 - i));
      return d.toISOString().slice(0, 10);
    });
  
  export class MockProvider implements LangfuseDataSource {
    async overview(): Promise<KpiOverview> {
      const series = days(7).map(date => ({
        date,
        traces: 4000 + Math.round(Math.random() * 3000),
        tokens: 3_000_000 + Math.round(Math.random() * 2_000_000),
      }));
      return {
        traces: series.reduce((s, r) => s + r.traces, 0),
        tokens: series.reduce((s, r) => s + r.tokens, 0),
        cost: 1284.32,
        p95LatencyMs: 2400,
        series,
        costByModel: [
          { model: 'gpt-4o', cost: 611 },
          { model: 'claude-3.5-sonnet', cost: 402 },
          { model: 'gpt-4o-mini', cost: 271 },
        ],
      };
    }
    async usage(): Promise<UsageRow[]> {
      return [
        { model: 'gpt-4o', calls: 18240, inputTokens: 12_000_000, outputTokens: 6_000_000, avgLatencyMs: 1800 },
        { model: 'claude-3.5-sonnet', calls: 9120, inputTokens: 7_500_000, outputTokens: 3_800_000, avgLatencyMs: 2300 },
        { model: 'gpt-4o-mini', calls: 20850, inputTokens: 1_900_000, outputTokens: 900_000, avgLatencyMs: 900 },
      ];
    }
    async cost(): Promise<CostResult> {
      return {
        total: 1284.32,
        byModel: [
          { model: 'gpt-4o', cost: 611 },
          { model: 'claude-3.5-sonnet', cost: 402 },
          { model: 'gpt-4o-mini', cost: 271.32 },
        ],
        overTime: days(7).map(date => ({ date, cost: 120 + Math.random() * 120 })),
      };
    }
    async traces(): Promise<TraceRow[]> {
      const names = ['chat-request', 'rag-query', 'agent-plan', 'summarize'];
      const models = ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4o-mini'];
      return Array.from({ length: 25 }, (_, i) => ({
        id: `trace-${i}`,
        name: names[i % names.length],
        model: models[i % models.length],
        tokens: 500 + Math.round(Math.random() * 3500),
        cost: Math.random() * 0.06,
        latencyMs: 600 + Math.round(Math.random() * 3000),
        status: Math.random() > 0.1 ? 'success' : 'error',
        timestamp: new Date(Date.now() - i * 3.6e6).toISOString(),
      }));
    }
    async trace(id: string) {
      return { id, name: 'chat-request', observations: [], input: 'hello', output: 'hi there' };
    }
    async prompts(): Promise<PromptRow[]> {
      return [
        { name: 'support-assistant', versions: 5, latestVersion: 5, labels: ['production'], updatedAt: '2026-10-20' },
        { name: 'rag-answer', versions: 3, latestVersion: 3, labels: ['production', 'staging'], updatedAt: '2026-10-25' },
        { name: 'router', versions: 8, latestVersion: 8, labels: ['production'], updatedAt: '2026-10-27' },
      ];
    }
    async scores(_r: TimeRange, kind: 'rag' | 'agent'): Promise<ScoresResult[]> {
      const mk = (name: string) => ({
        name,
        average: 0.6 + Math.random() * 0.3,
        series: days(7).map(date => ({ date, value: 0.5 + Math.random() * 0.45 })),
      });
      return kind === 'rag' ? [mk('relevance'), mk('groundedness')] : [mk('success_rate'), mk('tool_accuracy')];
    }
  }
  