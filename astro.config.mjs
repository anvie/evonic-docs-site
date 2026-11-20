import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	// (the dev toolbar sat over the hero's controls at the screen's foot; dev only, the site never shows it)
	devToolbar: { enabled: false },
	site: 'https://evonic.dev',
	server: {
		allowedHosts: true,
	},
  // The Atomic Task Graph (ATG) was removed in v1.6.0; keep old links working.
  redirects: {
    '/system/memory/atg/': '/system/memory/cmp/',
  },
  integrations: [
    starlight({
      title: 'Evonic',
      description: 'Documentation for Evonic \u2014 Local-first agentic AI for open models',
      logo: { src: './src/assets/mascot-mark.png', alt: 'Evonic' },
      customCss: ['./src/styles/custom.css'],
      // Dune is a light, single-scheme theme: code frames are cream sheets with a light syntax theme.
      expressiveCode: {
        themes: ['github-light'],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: '3px',
          borderColor: 'rgba(110, 76, 38, 0.5)',
          codeBackground: '#f6edd4',
          frames: {
            editorBackground: '#f6edd4',
            terminalBackground: '#f6edd4',
            editorTabBarBackground: '#ead9ae',
            editorActiveTabBackground: '#f6edd4',
            editorTabBarBorderBottomColor: 'rgba(110, 76, 38, 0.32)',
            editorActiveTabIndicatorTopColor: '#8a231d',
            editorActiveTabIndicatorBottomColor: 'transparent',
            terminalTitlebarBackground: '#ead9ae',
            terminalTitlebarBorderBottomColor: 'rgba(110, 76, 38, 0.32)',
            terminalTitlebarDotsForeground: '#8d7a5e',
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/anvie/evonic' }],
      head: [
        // each table in a frame that scrolls sideways only when the table is wider than the page (code never breaks)
        {
          tag: 'script',
          content:
            "document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.sl-markdown-content table').forEach((t)=>{if(t.parentElement.classList.contains('table-wrap'))return;const w=document.createElement('div');w.className='table-wrap';t.before(w);w.append(t);});});",
        },
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
            { label: 'Decision Models', slug: 'system/decision-models' },
            { label: 'Events', slug: 'system/events' },
            { label: 'CMP (Context Memory)', slug: 'system/memory/cmp' },
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
          label: 'Proprietary Models',
          autogenerate: { directory: 'proprietary-models' },
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

