import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'agents',
    {
      type: 'category',
      label: 'Charts',
      link: { type: 'doc', id: 'charts' },
      collapsed: false,
      items: ['charts/line', 'charts/area', 'charts/bar', 'charts/stacked-bar', 'charts/histogram', 'charts/stacked-area', 'charts/pie-donut', 'charts/scatter', 'charts/bubble', 'charts/radar', 'charts/candlestick', 'charts/heatmap', 'charts/gauge', 'charts/progress-rings'],
    },
    'interaction',
    'effects',
    'gradients',
    'gpu',
    'example-app',
    'compat',
    'migration',
    'api',
  ],
};

export default sidebars;
