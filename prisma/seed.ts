import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Aksesara database...');

  // Create System Users
  const student = await prisma.user.upsert({
    where: { email: 'user@aksesara.id' },
    update: {},
    create: {
      email: 'user@aksesara.id',
      name: 'Pengguna Aksesara',
      passwordHash: '$2b$10$EpRnTzWlqHNP0.1l5/A/8.zL6Yt.bQJmB6fT5tL6uE1Gz3Zz.7gWW',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aksesara.id' },
    update: {},
    create: {
      email: 'admin@aksesara.id',
      name: 'Admin Aksesara Platform',
      passwordHash: '$2b$10$EpRnTzWlqHNP0.1l5/A/8.zL6Yt.bQJmB6fT5tL6uE1Gz3Zz.7gWW',
    },
  });

  // Create Main Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'aksesara-org' },
    update: {},
    create: {
      name: 'Organisasi Aksesara Platform',
      slug: 'aksesara-org',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: student.id, role: 'viewer' },
        ],
      },
    },
  });

  // Create Project for Form Services
  const project = await prisma.project.upsert({
    where: { publicKey: 'aks_pk_demo' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Layanan Formulir Web',
      slug: 'form-services',
      publicKey: 'aks_pk_demo',
      environment: 'development',
      domains: {
        create: [
          { origin: 'http://localhost:3000', verificationStatus: 'verified', verifiedAt: new Date() },
          { origin: 'http://localhost:8080', verificationStatus: 'verified', verifiedAt: new Date() },
          { origin: 'http://localhost:5173', verificationStatus: 'verified', verifiedAt: new Date() },
          { origin: 'http://127.0.0.1:5500', verificationStatus: 'verified', verifiedAt: new Date() },
        ],
      },
      apiKeys: {
        create: {
          keyPrefix: 'aks_sk_demo',
          keyHash: 'c7d5c31b3e944f378a3c8e469542a1749747970d47346fb8cfc3b313',
          scopes: 'forms:read,forms:write,metadata:read',
        },
      },
    },
  });

  // Create Standard Verified Form Profile
  await prisma.formProfile.upsert({
    where: {
      projectId_externalFormId: {
        projectId: project.id,
        externalFormId: 'layanan-formulir-1',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      externalFormId: 'layanan-formulir-1',
      title: 'Formulir Pengajuan Layanan Aksesara',
      origin: 'http://localhost:3000',
      status: 'published',
      versions: {
        create: {
          version: '1.0.0',
          status: 'published',
          publishedAt: new Date(),
          createdById: admin.id,
          integritySignature: 'hmac_sha256_verified_signature',
          schemaJson: JSON.stringify({
            title: 'Formulir Pengajuan Layanan Aksesara',
            sections: [
              { id: 'sec-personal', title: 'Data Identitas Pemohon', description: 'Informasi identitas pemohon.' },
            ],
          }),
          fields: {
            create: [
              {
                externalFieldId: 'full_name',
                selector: '[name="full_name"]',
                fieldType: 'text',
                officialLabel: 'Nama Lengkap Sesuai Kartu Identitas',
                simpleLabel: 'Berapa nama lengkap Anda?',
                helpText: 'Tulis nama lengkap Anda tanpa gelar.',
                example: 'Budi Santoso',
                required: true,
                sensitivity: 'normal',
                verificationStatus: 'verified',
              },
              {
                externalFieldId: 'identity_number',
                selector: '[name="identity_number"]',
                fieldType: 'text',
                officialLabel: 'Nomor Identitas (NIK/NIM/ID)',
                simpleLabel: 'Berapa nomor identitas Anda?',
                helpText: 'Masukkan nomor identifikasi resmi Anda.',
                example: '120140001',
                required: true,
                sensitivity: 'identity',
                verificationStatus: 'verified',
              },
            ],
          },
        },
      },
    },
  });

  console.log('Database Aksesara seeded successfully!');
  console.log('Public Project Key: aks_pk_demo');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
