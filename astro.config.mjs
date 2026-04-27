import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	server: {
		allowedHosts: true,
	},
  integrations: [
    starlight({
      title: 'Evonic AI',
      description: 'Documentation for Evonic AI — Local-first agentic AI for open models',
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
            { label: 'Quick Start', slug: 'getting-started/quickstart' },
          ],
        },
        {
          label: 'System',
          items: [
            { label: 'Overview', slug: 'system' },
            { label: 'Agents', slug: 'system/agents' },
            { label: 'Skills', slug: 'system/skills' },
            { label: 'Plugins', slug: 'system/plugins' },
            { label: 'Models', slug: 'system/models' },
            { label: 'Events', slug: 'system/events' },
          ],
        },
        {
          label: 'Agents',
          autogenerate: { directory: 'agents' },
        },
        {
          label: 'Plugins',
          items: [
            { label: 'Overview', slug: 'plugins' },
            { label: 'Setup', slug: 'plugins/setup' },
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
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Development',
          autogenerate: { directory: 'development' },
        },
      ],
    }),
  ],
});
