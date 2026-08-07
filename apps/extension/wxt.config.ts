import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Aksesara — Pendamping Aksesibilitas Formulir Web',
    description: 'Ekstensi browser adaptif untuk membantu pengisian formulir web secara bertahap dan mudah dipahami.',
    version: '0.1.0',
    permissions: ['activeTab', 'scripting', 'sidePanel', 'storage'],
    action: {
      default_title: 'Buka Aksesara',
    },
  },
  srcDir: 'src',
});
