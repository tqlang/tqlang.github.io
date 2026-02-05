import {PrismTheme, themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const blank_theme: PrismTheme = {
  plain: {},
  styles: [],
};

const config: Config = {
  title: 'tq Programming Language',
  favicon: 'img/favicon.ico',

  url: 'https://tqlang.github.io/',
  baseUrl: '/',

  organizationName: 'tqlang',
  projectName: 'tq',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: 'https://github.com/tqlang/tqlang.github.io/tree/main/',
          admonitions: {
            keywords: [
              'under-construction',
              'not-implemented',
            ],
            extendDefaults: true
          }
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },

          editUrl: 'https://github.com/tqlang/tqlang.github.io',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    navbar: {
      logo: {
        alt: 'home',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'languageSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/tqlang/tq-compiler',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
      ],
      copyright: `Copyright © ${new Date().getFullYear()} tq Programming Language. Built with Docusaurus.`,
    },
    prism: {
      theme: blank_theme,
      darkTheme: blank_theme,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

