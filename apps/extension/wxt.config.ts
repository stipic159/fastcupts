import preact from '@preact/preset-vite';
import { defineConfig } from 'wxt';

const apiBaseUrl = process.env.WXT_SCOUT_API_BASE_URL ?? 'http://127.0.0.1:3000';
const backendHostPermission = `${new URL(apiBaseUrl).origin}/*`;

export default defineConfig({
  manifest: {
    name: 'FASTCUP Tournament Scout',
    description: 'FACEIT-based tournament analysis for FASTCUP.',
    version: '0.1.0',
    permissions: ['storage', 'downloads'],
    host_permissions: ['https://cs2.fastcup.net/*', backendHostPermission],
    action: { default_title: 'FASTCUP Tournament Scout' },
  },
  vite: () => ({ plugins: [preact()] }),
});
