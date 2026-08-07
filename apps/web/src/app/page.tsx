export default function LandingPage() {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center px-4 space-y-6">
        <div className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
          Ekstensi Browser GEMASTIK XIX 2026
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Satu formulir, pengalaman akses yang menyesuaikan pengguna.
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Aksesara adalah ekstensi browser pendamping formulir web yang mengubah pengisian formulir panjang menjadi langkah bertahap, mudah dipahami, berorientasi suara, dan sepenuhnya aksesibel tanpa menggantikan sesi website asli.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <a
            href="/console"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-md transition"
          >
            Mulai Integrasi Instansi &rarr;
          </a>
          <a
            href="/docs"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg border transition"
          >
            Baca Dokumentasi SDK
          </a>
        </div>
      </section>

      {/* Two Operational Modes */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Pendekatan Extension-First, Integration-Enhanced</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold">
              U
            </div>
            <h3 className="text-xl font-bold text-gray-900">Mode Universal</h3>
            <p className="text-sm text-gray-600">
              Digunakan pada website mana pun yang belum melakukan integrasi. Ekstensi memindai DOM tab aktif secara otomatis setelah persetujuan pengguna, memetakan label, dan memberikan pendampingan bertahap.
            </p>
          </div>

          <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
              V
            </div>
            <h3 className="text-xl font-bold text-gray-900">Mode Terverifikasi (Bridge SDK)</h3>
            <p className="text-sm text-gray-600">
              Digunakan oleh institusi mitra yang memasang Aksesara Bridge SDK. Menyediakan metadata bertanda tangan resmi, petunjuk terverifikasi, dan peninjauan admin tanpa membuat formulir kedua.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Guarantees */}
      <section className="max-w-4xl mx-auto px-4 bg-gray-50 border rounded-2xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Jaminan Keamanan & Privasi</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span>🔒</span>
            <div>
              <strong>Zero Value Transmission:</strong> Jawaban pengguna, NIK, password, dan dokumen tidak pernah dikirim ke AI atau server Aksesara.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>🔑</span>
            <div>
              <strong>Sesi & Autentikasi Asli:</strong> Pengguna tetap login dan mengirimkan formulir langsung pada website tujuan resmi.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
