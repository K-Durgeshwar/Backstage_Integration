import React from 'react';
import { Chip } from '@material-ui/core';
import { Table, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useTraces } from '../hooks/useLangfuse';

const fmt = (n: number) => Intl.NumberFormat().format(Math.round(n));

export const TracesTab = () => {
  const { data, isLoading, error } = useTraces(100);
  if (isLoading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error as Error} />;

  return (
    <Table
      title="Recent traces"
      options={{ paging: true, pageSize: 20, search: true }}
      columns={[
        { title: 'Name', field: 'name' },
        { title: 'Model', field: 'model' },
        { title: 'Tokens', field: 'tokens', render: (r: any) => fmt(r.tokens) },
        { title: 'Cost ($)', field: 'cost', render: (r: any) => `$${r.cost.toFixed(4)}` },
        { title: 'Latency (ms)', field: 'latencyMs', render: (r: any) => fmt(r.latencyMs) },
        {
          title: 'Status',
          field: 'status',
          render: (r: any) => (
            <Chip
              size="small"
              label={r.status}
              color={r.status === 'success' ? 'primary' : 'secondary'}
            />
          ),
        },
        {
          title: 'Timestamp',
          field: 'timestamp',
          render: (r: any) => new Date(r.timestamp).toLocaleString(),
        },
      ]}
      data={data ?? []}
    />
  );
};
