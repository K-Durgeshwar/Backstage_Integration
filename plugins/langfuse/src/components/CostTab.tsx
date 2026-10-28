import React from 'react';
import { Grid } from '@material-ui/core';
import { InfoCard, Table, Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts';
import { useCost } from '../hooks/useLangfuse';

export const CostTab = () => {
  const { data, isLoading, error } = useCost();
  if (isLoading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error as Error} />;
  if (!data) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <InfoCard title={`Total cost: $${data.total.toFixed(2)}`}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.overTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cost" stroke="#2ca02c" name="Cost ($)" />
            </LineChart>
          </ResponsiveContainer>
        </InfoCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <InfoCard title="Cost by model">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byModel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="#1f77b4" name="Cost ($)" />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>
      </Grid>
      <Grid item xs={12}>
        <Table
          title="Spend by model"
          options={{ paging: true, pageSize: 10, search: false }}
          columns={[
            { title: 'Model', field: 'model' },
            { title: 'Cost ($)', field: 'cost', render: (r: any) => `$${r.cost.toFixed(2)}` },
          ]}
          data={data.byModel}
        />
      </Grid>
    </Grid>
  );
};
