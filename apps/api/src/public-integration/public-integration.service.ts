import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PublicIntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async getVerifiedFormMetadata(publicKey: string, externalFormId: string, requestOrigin?: string) {
    const project = await this.prisma.project.findUnique({
      where: { publicKey },
      include: {
        domains: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project dengan public key tersebut tidak ditemukan');
    }

    // Verify requesting origin against allowed origins
    if (requestOrigin) {
      const isAllowed = project.domains.some(
        (d) => d.origin === requestOrigin && d.verificationStatus === 'verified'
      );
      if (!isAllowed) {
        throw new ForbiddenException(`Origin "${requestOrigin}" tidak terdaftar pada project ini.`);
      }
    }

    const formProfile = await this.prisma.formProfile.findUnique({
      where: {
        projectId_externalFormId: {
          projectId: project.id,
          externalFormId,
        },
      },
      include: {
        versions: {
          where: { status: 'published' },
          include: { fields: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!formProfile || formProfile.versions.length === 0) {
      throw new NotFoundException('Formulir terverifikasi tidak ditemukan');
    }

    const activeVersion = formProfile.versions[0];

    return {
      project: {
        name: project.name,
        publicKey: project.publicKey,
      },
      form: {
        externalFormId: formProfile.externalFormId,
        title: formProfile.title,
        version: activeVersion.version,
        verified: true,
        origin: formProfile.origin,
        fields: activeVersion.fields.map((f) => ({
          externalFieldId: f.externalFieldId,
          selector: f.selector,
          fieldType: f.fieldType,
          officialLabel: f.officialLabel,
          simpleLabel: f.simpleLabel,
          helpText: f.helpText,
          example: f.example,
          required: f.required,
          sensitivity: f.sensitivity,
        })),
      },
      integrity: {
        algorithm: 'HMAC-SHA256',
        signature: activeVersion.integritySignature || 'signature_verified_mock',
      },
    };
  }
}
