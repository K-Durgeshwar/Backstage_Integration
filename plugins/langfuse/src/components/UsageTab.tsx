import React from 'react';
import { Table, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useUsage } from '../hooks/useLangfuse';

const fmt = (n: number) => Intl.NumberFormat().format(Math.round(n));

export const UsageTab = () => {
  const { data, isLoading, error } = useUsage();
  if (isLoading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error as Error} />;

  return (
    <Table
      title="LLM usage by model"
      options={{ paging: true, pageSize: 10, search: true }}
      columns={[
        { title: 'Model', field: 'model' },
        { title: 'Calls', field: 'calls', render: (r: any) => fmt(r.calls) },
        { title: 'Input tokens', field: 'inputTokens', render: (r: any) => fmt(r.inputTokens) },
        { title: 'Output tokens', field: 'outputTokens', render: (r: any) => fmt(r.outputTokens) },
        { title: 'Avg latency (ms)', field: 'avgLatencyMs', render: (r: any) => fmt(r.avgLatencyMs) },
      ]}
      data={data ?? []}
    />
  );
};
