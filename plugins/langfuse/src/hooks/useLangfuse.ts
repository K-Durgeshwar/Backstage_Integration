import { useApi } from '@backstage/core-plugin-api';
import { useQuery } from '@tanstack/react-query';
import { langfuseApiRef } from '../api/LangfuseApi';
import { useFilters } from '../components/common/FilterContext';

// How often (ms) each live section polls the backend.
const LIVE_INTERVAL = 15_000;

export const useOverview = () => {
  const api = useApi(langfuseApiRef);
  const { range } = useFilters();
  return useQuery({
    queryKey: ['langfuse', 'overview', range],
    queryFn: () => api.overview(range),
    refetchInterval: LIVE_INTERVAL,
    refetchOnWindowFocus: true,
  });
};

export const useUsage = () => {
  const api = useApi(langfuseApiRef);
  const { range } = useFilters();
  return useQuery({
    queryKey: ['langfuse', 'usage', range],
    queryFn: () => api.usage(range),
    refetchInterval: LIVE_INTERVAL,
    refetchOnWindowFocus: true,
  });
};

export const useCost = () => {
  const api = useApi(langfuseApiRef);
  const { range } = useFilters();
  return useQuery({
    queryKey: ['langfuse', 'cost', range],
    queryFn: () => api.cost(range),
    refetchInterval: LIVE_INTERVAL,
    refetchOnWindowFocus: true,
  });
};

export const useTraces = (limit = 50) => {
  const api = useApi(langfuseApiRef);
  const { range } = useFilters();
  return useQuery({
    queryKey: ['langfuse', 'traces', range, limit],
    queryFn: () => api.traces(range, limit),
    refetchInterval: LIVE_INTERVAL,
    refetchOnWindowFocus: true,
  });
};

export const usePrompts = () => {
  const api = useApi(langfuseApiRef);
  return useQuery({
    queryKey: ['langfuse', 'prompts'],
    queryFn: () => api.prompts(),
    // prompt versions rarely change, poll less aggressively
    refetchInterval: 60_000,
  });
};

export const useScores = (kind: 'rag' | 'agent') => {
  const api = useApi(langfuseApiRef);
  const { range } = useFilters();
  return useQuery({
    queryKey: ['langfuse', 'scores', kind, range],
    queryFn: () => api.scores(range, kind),
    refetchInterval: LIVE_INTERVAL,
    refetchOnWindowFocus: true,
  });
};
