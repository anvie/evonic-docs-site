import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://evonic.dev',
	server: {
		allowedHosts: true,
	},
  integrations: [
    starlight({
      title: 'Evonic',
      description: 'Documentation for Evonic \u2014 Local-first agentic AI for open models',
      customCss: ['./src/styles/custom.css'],
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://evonic.dev/img/evonic-thumb-wide.jpg' },
        },
        {
          tag: 'meta',
          attrs: { property: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', slug: 'getting-started/overview' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
            { label: 'Quick Start', slug: 'getting-started/quickstart' },
            { label: 'Setup Wizard', slug: 'getting-started/setup-wizard' },
          ],
        },
        {
          label: 'System',
          items: [
            { label: 'Design Philosophy', slug: 'design-philosophy' },
            { label: 'Overview', slug: 'system' },
            { label: 'Agents', slug: 'system/agents' },
            { label: 'Skills', slug: 'system/skills' },
            { label: 'Plugins', slug: 'system/plugins' },
            { label: 'Plugin Lifecycle', slug: 'system/plugins-lifecycle' },
            { label: 'Models', slug: 'system/models' },
            { label: 'Events', slug: 'system/events' },
            { label: 'CMP (Context Memory)', slug: 'system/memory/cmp' },
            { label: 'ATG (Task Graph)', slug: 'system/memory/atg' },
            { label: 'MCP Client', slug: 'system/mcp/integration' },
          ],
        },
        {
          label: 'Agents',
          autogenerate: { directory: 'agents' },
        },
        {
          label: 'User Interface',
          items: [
            { label: 'Overview', slug: 'ui/overview' },
          ],
        },
        {
          label: 'Evonet',
          items: [
            { label: 'Overview', slug: 'evonet' },
          ],
        },
        {
          label: 'Plugins',
          items: [
            { label: 'Overview', slug: 'plugins' },
            { label: 'Setup', slug: 'plugins/setup' },
            { label: 'GitHub Webhook', slug: 'plugins/webhook' },
            { label: 'Agent API', slug: 'plugins/agent-api' },
            { label: 'SDK', slug: 'plugins/sdk' },
            { label: 'Best Practices', slug: 'plugins/best-practices' },
            { label: 'Troubleshooting', slug: 'plugins/troubleshooting' },
          ],
        },
        {
          label: 'Evaluation',
          autogenerate: { directory: 'evaluation' },
        },
        {
          label: 'Skills & Tools',
          autogenerate: { directory: 'skills' },
        },
        {
          label: 'Security',
          autogenerate: { directory: 'security' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Local Models',
          autogenerate: { directory: 'local-models' },
        },
        {
          label: 'Troubleshooting',
          autogenerate: { directory: 'troubleshooting' },
        },
        {
          label: 'CLI',
          autogenerate: { directory: 'cli' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Development',
          autogenerate: { directory: 'development' },
        },
        {
          label: 'About',
          items: [
            { label: 'License', slug: 'about/license' },
            { label: 'Changelog', slug: 'about/changelog' },
          ],
        },
      ],
    }),
  ],
});
