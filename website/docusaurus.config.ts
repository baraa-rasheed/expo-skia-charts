import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'react-native-skia-chart',
  tagline: 'GPU-accelerated, animated charts for React Native & Expo — built on react-native-skia v3.',
  favicon: 'img/favicon.svg',
  future: { v4: true },
  url: 'https://baraa-rasheed.github.io',
  baseUrl: '/react-native-skia-chart/',
  organizationName: 'baraa-rasheed',
  projectName: 'react-native-skia-chart',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/baraa-rasheed/react-native-skia-chart/edit/main/website/',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: 'dark', respectPrefersColorScheme: true },
    navbar: {
      title: 'react-native-skia-chart',
      logo: { alt: 'logo', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        { to: '/docs/charts', label: 'Charts', position: 'left' },
        { to: '/docs/agents', label: 'AI agents', position: 'left' },
        { to: '/docs/gradients', label: 'Gradients', position: 'left' },
        { to: '/docs/api', label: 'API', position: 'left' },
        { to: '/docs/gpu', label: 'GPU', position: 'left' },
        { href: 'https://github.com/baraa-rasheed/react-native-skia-chart', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Docs', items: [{ label: 'Getting started', to: '/docs/intro' }, { label: 'Charts', to: '/docs/charts' }, { label: 'AI agents', to: '/docs/agents' }, { label: 'Effects', to: '/docs/effects' }, { label: 'Gradients', to: '/docs/gradients' }] },
        { title: 'Skia', items: [{ label: 'react-native-skia', href: 'https://github.com/wcandillon/react-native-skia' }, { label: 'v3 migration', href: 'https://github.com/wcandillon/react-native-skia/blob/main/apps/docs/docs/getting-started/migration.md' }] },
      ],
      copyright: `MIT © ${new Date().getFullYear()} Baraa Rasheed`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
