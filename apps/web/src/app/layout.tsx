import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aksesara — Pendamping Aksesibilitas Formulir Digital',
  description: 'Ekstensi browser adaptif untuk membantu pengisian formulir web secara bertahap, mudah dipahami, dan lebih aksesibel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
            <a href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Aksesara</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium text-gray-700">
              <a href="/" className="hover:text-blue-600 transition">Tentang Aksesara</a>
              <a href="/docs" className="hover:text-blue-600 transition">Dokumentasi Integrasi</a>
              <a href="/console" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
                Developer Console
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 bg-gray-50 text-center text-sm text-gray-500">
          Aksesara Platform — Divisi Pengembangan Perangkat Lunak GEMASTIK XIX 2026
        </footer>
      </body>
    </html>
  );
}
