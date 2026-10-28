import React, { useState } from 'react';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  SupportButton,
  TabbedLayout,
} from '@backstage/core-components';
import {
  FormControl, InputLabel, MenuItem, Select, Box, Button, Typography,
} from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import {
  QueryClient, QueryClientProvider, useQueryClient,
} from '@tanstack/react-query';
import { FilterProvider, useFilters } from './common/FilterContext';
import { OverviewTab } from './OverviewTab';
import { UsageTab } from './UsageTab';
import { CostTab } from './CostTab';
import { TracesTab } from './TracesTab';
import { PromptsTab } from './PromptsTab';
import { RagTab } from './RagTab';
import { AgentsTab } from './AgentsTab';

const queryClient = new QueryClient();

const Toolbar = () => {
  const { rangeKey, setRangeKey, environment, setEnvironment } = useFilters();
  const qc = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshAll = async () => {
    await qc.invalidateQueries({ queryKey: ['langfuse'] });
    setLastUpdated(new Date());
  };

  return (
    <Box display="flex" alignItems="center" gridGap={16} flexWrap="wrap">
      <FormControl size="small" variant="outlined" style={{ minWidth: 150 }}>
        <InputLabel>Time range</InputLabel>
        <Select
          label="Time range"
          value={rangeKey}
          onChange={e => setRangeKey(e.target.value as any)}
        >
          <MenuItem value="24h">Last 24 hours</MenuItem>
          <MenuItem value="7d">Last 7 days</MenuItem>
          <MenuItem value="30d">Last 30 days</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" variant="outlined" style={{ minWidth: 160 }}>
        <InputLabel>Environment</InputLabel>
        <Select
          label="Environment"
          value={environment}
          onChange={e => setEnvironment(e.target.value as string)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="production">production</MenuItem>
          <MenuItem value="staging">staging</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        size="small"
        startIcon={<CachedIcon />}
        onClick={refreshAll}
      >
        Refresh
      </Button>

      <Typography variant="caption" color="textSecondary">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </Typography>
    </Box>
  );
};

export const LangfusePage = () => (
  <QueryClientProvider client={queryClient}>
    <FilterProvider>
      <Page themeId="tool">
        <Header title="AI Observability" subtitle="Powered by Langfuse">
          <SupportButton>AI usage, cost, traces and governance.</SupportButton>
        </Header>
        <Content>
          <ContentHeader title="">
            <Toolbar />
          </ContentHeader>
          <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
              <OverviewTab />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/usage" title="LLM Usage">
              <UsageTab />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/cost" title="Cost">
              <CostTab />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/traces" title="Traces">
              <TracesTab />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/prompts" title="Prompts">
              <PromptsTab />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/rag" title="RAG">
              <RagTab />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/agents" title="Agents">
              <AgentsTab />
            </TabbedLayout.Route>
          </TabbedLayout>
        </Content>
      </Page>
    </FilterProvider>
  </QueryClientProvider>
);
