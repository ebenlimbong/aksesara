import { defineConfig } from 'wxt';

export default defineConfig({
  // 💡 Menikmatkan auto-launch browser baru saat pnpm dev dijalankan
  runner: {
    disabled: true,
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
  },
  srcDir: 'src',
});