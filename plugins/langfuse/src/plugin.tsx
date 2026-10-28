import {
    createFrontendPlugin,
    PageBlueprint,
    ApiBlueprint,
    discoveryApiRef,
    fetchApiRef,
  } from '@backstage/frontend-plugin-api';
  import { rootRouteRef } from './routes';
  import { langfuseApiRef, LangfuseClientApi } from './api/LangfuseApi';
  
  const langfuseApi = ApiBlueprint.make({
    name: 'langfuse',
    params: define =>
      define({
        api: langfuseApiRef,
        deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
        factory: ({ discoveryApi, fetchApi }) =>
          new LangfuseClientApi(discoveryApi, fetchApi),
      }),
  });
  
  const langfusePage = PageBlueprint.make({
    params: {
      path: '/langfuse',
      routeRef: rootRouteRef,
      loader: () =>
        import('./components/LangfusePage').then(m => <m.LangfusePage />),
    },
  });
  
  export const langfusePlugin = createFrontendPlugin({
    pluginId: 'langfuse',
    extensions: [langfuseApi, langfusePage],
    routes: {
      root: rootRouteRef,
    },
  });
  
  export default langfusePlugin;