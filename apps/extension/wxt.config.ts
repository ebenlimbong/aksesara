import { defineConfig } from 'wxt';

export default defineConfig({
  // 💡 Mematikan auto-launch browser baru saat pnpm dev dijalankan
  runner: {
    disabled: true,
  },
  dev: {
    server: {
      port: 3002, // 🔒 Mengunci port dev server WXT/Vite di 3002
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
    },
    // 🛡️ Mengizinkan skrip HMR Vite dari localhost:3002 agar tidak diblokir CSP Chrome
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval' http://localhost:3002; object-src 'self';",
    },
  },
  srcDir: 'src',
});