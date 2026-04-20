import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	server: {
		"allowedHosts": ["quantity-newsletter-clan-variations.trycloudflare.com"]
	},
  integrations: [
    starlight({
      title: 'Evonic AI Platform',
      description: 'Documentation for the Evonic AI Platform — Local-first agentic AI for open models',
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
          label: 'Agents',
          autogenerate: { directory: 'agents' },
        },
        {
          label: 'Plugins',
          autogenerate: { directory: 'plugins' },
        },
        {
          label: 'Skills & Tools',
          autogenerate: { directory: 'skills' },
        },
        {
          label: 'Model Explorer',
          autogenerate: { directory: 'model-exploration' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'CLI',
          autogenerate: { directory: 'cli' },
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
