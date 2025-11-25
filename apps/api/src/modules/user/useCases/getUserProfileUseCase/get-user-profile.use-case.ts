import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { EncryptionService } from "src/modules/services/encryptionService";

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        psicologo: true,
        paciente: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    // Descriptografar dados sensíveis
    let decryptedUser = { ...user };
    try {
      decryptedUser.name = this.encryptionService.decrypt(user.name);
      decryptedUser.email = this.encryptionService.decrypt(user.email);

      if (user.psicologo) {
        decryptedUser.psicologo = {
          ...user.psicologo,
          crp: this.encryptionService.decrypt(user.psicologo.crp),
        };
      }

      if (user.paciente) {
        decryptedUser.paciente = {
          ...user.paciente,
          cpf: user.paciente.cpf
            ? this.encryptionService.decrypt(user.paciente.cpf)
            : null,
        };
      }
    } catch (e) {
      console.warn("Falha ao descriptografar:", e);
    }

    return decryptedUser;
  }
}

