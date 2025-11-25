// src/modules/paciente/paciente.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { EncryptionService } from "src/modules/services/encryptionService";
import { UpdatePacienteDto } from "./dto/update-paciente.dto";

@Injectable()
export class PacienteService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService
  ) {}

  async findById(id: string) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { userId: id },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo_url: true,
            role: true,
            account_status: true,
            created_at: true,
          },
        },

        psicologo_responsavel: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        consultas: true,
      },
    });

    if (!paciente) {
      throw new NotFoundException("Paciente não encontrado");
    }

    // 🔓 Descriptografar dados sensíveis
    try {
      paciente.user.name = this.encryption.decrypt(paciente.user.name);
      paciente.user.email = this.encryption.decrypt(paciente.user.email);

      if (paciente.psicologo_responsavel?.user?.name) {
        paciente.psicologo_responsavel.user.name = this.encryption.decrypt(
          paciente.psicologo_responsavel.user.name
        );
      }
    } catch (e) {
      console.warn("Falha ao descriptografar:", e);
    }

    return paciente;
  }

  async updatePaciente(id: string, data: UpdatePacienteDto) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { userId: id },
      include: { user: true },
    });

    if (!paciente) {
      throw new NotFoundException("Paciente não encontrado");
    }

    // Atualizar USER
    const userUpdate: any = {};

    if (data.name) {
      userUpdate.name = this.encryption.encrypt(data.name);
    }

    if (data.phone) {
      userUpdate.phone = data.phone;
    }

    // Atualizar PACIENTE
    const pacienteUpdate = {
      initial_observations: data.initial_observations,
      history: data.history,
      status: data.status,
    };

    // Atualiza o usuário e paciente
    const updatedUser = await this.prisma.user.update({
      where: { id: paciente.userId },
      data: userUpdate,
    });

    const updatedPaciente = await this.prisma.paciente.update({
      where: { userId: id },
      data: pacienteUpdate,
    });

    // 🔓 Descriptografar antes de devolver ao front
    let finalUser = { ...updatedUser };
    try {
      if (finalUser.name) finalUser.name = this.encryption.decrypt(finalUser.name);
      if (finalUser.email) finalUser.email = this.encryption.decrypt(finalUser.email);
    } catch (e) {
      console.warn("Falha ao descriptografar retorno:", e);
    }

    return {
      message: "Dados atualizados com sucesso",
      user: finalUser,
      paciente: updatedPaciente,
    };
  }
}
