import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import type { LangfuseDataSource, TimeRange } from './types';

export function createRouter(opts: {
  logger: LoggerService;
  source: LangfuseDataSource;
}): express.Router {
  const { source } = opts;
  const router = Router();
  router.use(express.json());

  const range = (req: express.Request): TimeRange => {
    const to = (req.query.to as string) ?? new Date().toISOString();
    const from =
      (req.query.from as string) ?? new Date(Date.now() - 7 * 864e5).toISOString();
    const environment = (req.query.environment as string) || undefined;
    return { from, to, environment };
  };

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));
  router.get('/overview', async (req, res) => res.json(await source.overview(range(req))));
  router.get('/usage', async (req, res) => res.json(await source.usage(range(req))));
  router.get('/cost', async (req, res) => res.json(await source.cost(range(req))));
  router.get('/traces', async (req, res) =>
    res.json(await source.traces(range(req), Number(req.query.limit ?? 50))),
  );
  router.get('/traces/:id', async (req, res) => res.json(await source.trace(req.params.id)));
  router.get('/prompts', async (_req, res) => res.json(await source.prompts()));
  router.get('/scores', async (req, res) =>
    res.json(await source.scores(range(req), (req.query.kind as any) === 'agent' ? 'agent' : 'rag')),
  );

  return router;
}
