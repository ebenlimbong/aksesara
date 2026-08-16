import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  publicDir: '../public', // 👈 Memberitahu WXT bahwa folder public ada di luar src/
  runner: {
    disabled: true,
  },
  dev: {
    server: {
      port: 3002,
    },
  },
  manifest: {
    name: 'Aksesara — Pendamping Aksesibilitas Formulir Web',
    description: 'Ekstensi browser adaptif untuk membantu pengisian formulir web secara bertahap dan mudah dipahami.',
    version: '0.1.0',
    permissions: ['activeTab', 'scripting', 'sidePanel', 'storage'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Buka Aksesara',
      default_icon: '/Icon.png',
    },
    icons: {
      16: '/Icon.png',
      32: '/Icon.png',
      48: '/Icon.png',
      128: '/Icon.png',
    },
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval' http://localhost:3002; object-src 'self';",
    },
  },
});