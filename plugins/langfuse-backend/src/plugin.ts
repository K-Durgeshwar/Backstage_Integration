import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { LangfuseClient } from './service/LangfuseClient';
import { MockProvider } from './service/MockProvider';
import type { LangfuseDataSource } from './service/types';

export const langfusePlugin = createBackendPlugin({
  pluginId: 'langfuse',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ logger, config, http }) {
        const mock = config.getOptionalBoolean('langfuse.mock') ?? false;
        let source: LangfuseDataSource;
        if (mock) {
          logger.info('Langfuse plugin running in MOCK mode');
          source = new MockProvider();
        } else {
          source = new LangfuseClient({
            baseUrl: config.getString('langfuse.baseUrl'),
            publicKey: config.getString('langfuse.publicKey'),
            secretKey: config.getString('langfuse.secretKey'),
            cacheTtlSeconds: config.getOptionalNumber('langfuse.cacheTtlSeconds') ?? 60,
          });
        }
        http.use(createRouter({ logger, source }));
        http.addAuthPolicy({ path: '/', allow: 'unauthenticated' });
      },
    });
  },
});
