import React from 'react';
import { Grid } from '@material-ui/core';
import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useScores } from '../hooks/useLangfuse';
import { KpiCard } from './common/KpiCard';

export const AgentsTab = () => {
  const { data, isLoading, error } = useScores('agent');
  if (isLoading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error as Error} />;
  if (!data) return null;

  return (
    <Grid container spacing={3}>
      {data.map(score => (
        <React.Fragment key={score.name}>
          <Grid item xs={12} md={3}>
            <KpiCard
              title={`Avg ${score.name}`}
              value={`${(score.average * 100).toFixed(0)}%`}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <InfoCard title={`${score.name} over time`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={score.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2ca02c" name={score.name} />
                </BarChart>
              </ResponsiveContainer>
            </InfoCard>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
};
