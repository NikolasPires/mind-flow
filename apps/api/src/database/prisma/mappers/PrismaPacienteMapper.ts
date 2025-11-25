import { Injectable } from '@nestjs/common';
import { Paciente as PrismaPaciente } from "generated/prisma"; // Ajuste o import conforme seu projeto
import { EncryptionService } from "src/modules/services/encryptionService";
import { Paciente, Gender, PatientStatus } from "src/modules/user/entities/Paciente";

@Injectable() 
export class PrismaPacienteMapper {

  constructor(private encryptionService: EncryptionService) {}

  toPrisma(paciente: Paciente) {
    return {
      userId: paciente.userId,
      // ... (sem alterações aqui)
      cpf: paciente.cpf ? this.encryptionService.encrypt(paciente.cpf) : null,
      history: paciente.history 
        ? this.encryptionService.encrypt(paciente.history) 
        : null,
      initial_observations: paciente.initial_observations 
        ? this.encryptionService.encrypt(paciente.initial_observations) 
        : null,

      cpfHash: paciente.cpfHash,
      gender: paciente.gender,
      status: paciente.status,
      psicologo_responsavel_id: paciente.psicologo_responsavel_id,
    };
  }
  
  toDomain(raw: PrismaPaciente): Paciente {
      // ... (sem alterações aqui)
      return new Paciente({
          userId: raw.userId,
          cpf: raw.cpf ? this.encryptionService.decrypt(raw.cpf) : null,
          history: raw.history 
            ? this.encryptionService.decrypt(raw.history) 
            : null,
          initial_observations: raw.initial_observations 
            ? this.encryptionService.decrypt(raw.initial_observations) 
            : null,
          
          gender: raw.gender as Gender,
          cpfHash: raw.cpfHash,
          status: raw.status as PatientStatus,
          psicologo_responsavel_id: raw.psicologo_responsavel_id,
      });
  }

  // --- AQUI ESTÁ A MUDANÇA ---
  toDomainWithUser(
    raw: PrismaPaciente & { 
      user: { 
        name: string; 
        email: string; 
        photo_url: string | null; 
        phone: string | null; // 1. Adicionei o tipo aqui
      } | null 
    }
  ): Paciente & { user: { name: string; email: string; photo_url: string | null; phone: string | null } } {
    
    const paciente = this.toDomain(raw); 
    
    if (!raw.user) {
      throw new Error(`Paciente com userId ${raw.userId} não possui usuário associado.`);
    }
    
    return {
      userId: paciente.userId,
      cpf: paciente.cpf,
      gender: paciente.gender,
      initial_observations: paciente.initial_observations,
      history: paciente.history,
      status: paciente.status,
      psicologo_responsavel_id: paciente.psicologo_responsavel_id,
      cpfHash: paciente.cpfHash,
      user: {
        name: this.encryptionService.decrypt(raw.user.name),
        email: this.encryptionService.decrypt(raw.user.email),
        photo_url: raw.user.photo_url,
        phone: raw.user.phone ? this.encryptionService.decrypt(raw.user.phone) : null,
      },
    } as any;
  }
}