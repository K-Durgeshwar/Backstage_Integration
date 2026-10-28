import React from 'react';
import { Grid } from '@material-ui/core';
import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useOverview } from '../hooks/useLangfuse';
import { KpiCard } from './common/KpiCard';

const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
const fmt = (n: number) => Intl.NumberFormat().format(Math.round(n));

export const OverviewTab = () => {
  const { data, isLoading, error } = useOverview();
  if (isLoading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error as Error} />;
  if (!data) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}><KpiCard title="Total Traces" value={fmt(data.traces)} /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Total Tokens" value={fmt(data.tokens)} /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Total Cost" value={`$${data.cost.toFixed(2)}`} /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="P95 Latency" value={`${fmt(data.p95LatencyMs)} ms`} /></Grid>

      <Grid item xs={12} md={8}>
        <InfoCard title="Volume over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="traces" stroke="#1f77b4" name="Traces" />
              <Line type="monotone" dataKey="tokens" stroke="#ff7f0e" name="Tokens" />
            </LineChart>
          </ResponsiveContainer>
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <InfoCard title="Cost by model">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.costByModel} dataKey="cost" nameKey="model" outerRadius={100} label>
                {data.costByModel.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </InfoCard>
      </Grid>
    </Grid>
  );
};
