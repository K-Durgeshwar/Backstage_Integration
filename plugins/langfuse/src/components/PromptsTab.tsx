import React from 'react';
import { Chip } from '@material-ui/core';
import { Table, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { usePrompts } from '../hooks/useLangfuse';

export const PromptsTab = () => {
  const { data, isLoading, error } = usePrompts();
  if (isLoading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error as Error} />;

  return (
    <Table
      title="Prompts & versions"
      options={{ paging: true, pageSize: 10, search: true }}
      columns={[
        { title: 'Name', field: 'name' },
        { title: 'Versions', field: 'versions' },
        { title: 'Latest', field: 'latestVersion' },
        {
          title: 'Labels',
          field: 'labels',
          render: (r: any) =>
            (r.labels ?? []).map((l: string) => (
              <Chip key={l} size="small" label={l} style={{ marginRight: 4 }} />
            )),
        },
        {
          title: 'Updated',
          field: 'updatedAt',
          render: (r: any) => (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '-'),
        },
      ]}
      data={data ?? []}
    />
  );
};
