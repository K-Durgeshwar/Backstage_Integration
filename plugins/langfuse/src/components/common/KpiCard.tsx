import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { Typography } from '@material-ui/core';

export const KpiCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) => (
  <InfoCard title={title}>
    <Typography variant="h4">{value}</Typography>
    {subtitle && (
      <Typography variant="body2" color="textSecondary">
        {subtitle}
      </Typography>
    )}
  </InfoCard>
);
