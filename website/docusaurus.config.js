// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'KAG',
  tagline: 'KAG is a logical form-guided reasoning and retrieval framework based on OpenSPG engine and LLMs. It is used to build logical reasoning and factual Q&A solutions for professional domain knowledge bases. It can effectively overcome the shortcomings of the traditional RAG vector similarity calculation model.',
  favicon: 'img/favicon.png',
  url: 'https://openspg.github.io',
  baseUrl: '/v2/',
  organizationName: 'OpenSPG',
  projectName: 'v2',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // if your site is Chinese, you may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'blog',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/OpenSPG/v2/tree/master',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/OpenSPG/v2/tree/master',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/kag-social-card.jpg',
      navbar: {
        title: 'KAG',
        logo: {
          alt: 'KAG Logo',
          src: 'img/favicon.png',
        },
        items: [
          {
            label: 'Docs',
            position: 'left',
            items: [
              { label: 'English', to: '/docs_en' },
              { label: '中文', to: '/docs_ch' },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Blog',
          },
          /*{to: '/blog', label: 'Blog', position: 'left'},*/
          {href: 'http://openkg.cn/', label: 'OpenKG', position: 'right'},
          {
            href: 'https://github.com/OpenSPG/KAG',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Docs',
                to: '/docs_en',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'KAG',
                href: 'https://github.com/OpenSPG/KAG/issues',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog/recent_posts/release_notes/0.6',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/OpenSPG/KAG',
              },
            ],
          },
          {
            title: 'Contact US',
            items: [
              {
                html: `<a class="footer__link-item"> mengshu.sms@antgroup.com </a>`,
              },
              {
                html: `<a class="footer__link-item"> zhengke.gzk@antgroup.com </a>`,
              },
              {
                html: `<a class="footer__link-item"> leywar.liang@antgroup.com </a>`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} OpenSPG.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  customFields: {
    partners: [
      { name: 'Tongji University', website: 'https://www.tongji.edu.cn/', imageBackground:'#0A5AA8', logo: 'https://www.tongji.edu.cn/images/logo.png' },
      { name: 'Hundsun Technologies Inc.', website: 'https://www.hundsun.com/', logo: 'https://www.hundsun.com/assets/img/logo.591f4472.gif' },
      { name: 'Zhejiang University',  website: 'https://www.zju.edu.cn/', imageBackground:'#003f88', logo: 'https://www.zju.edu.cn/_upload/tpl/0b/bf/3007/template3007/static/js/../../static/media/mlogo.66388675484ae2a807b2ad65b1d31ca9.svg' },
      { name: 'Tianjin University',  website: 'https://www.tju.edu.cn/', logo: 'https://www.tju.edu.cn/images/logo202107.png' },
      { name: 'Zhejiang Chuanglin Technology Co., Ltd.',  website: 'https://www.galaxybase.com/', imageBackground:'#000', logo: 'https://www.galaxybase.com/cdn/pc/zh/home2/logo.png' },
      { name: 'Datagrand Inc.',  website: 'https://www.datagrand.com/', imageBackground:'#007aff', logo: 'https://www.datagrand.com/images/share/head/dg-logo-v2.png' },
      { name: 'Haiyi Zhi Information Technology (Nanjing) Co., Ltd.',  website: 'https://www.dlzb.com/c-748810/', logo: 'https://img.dlzb.com/favicon.ico' },
      { name: 'Institute of Computing Technology, Chinese Academy of Sciences',  website: 'https://www.ict.ac.cn/', logo: 'https://www.ict.ac.cn/images/header_ict.png' },
      { name: 'Zhejiang Lab',  website: 'https://www.zhejianglab.org/lab/home', logo: 'https://www.zhejianglab.org/static/img/logo.19999760.png' },
    ],
  },
};

export default config;
