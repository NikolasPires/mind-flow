// mappers/PrismaPsicologoMapper.ts

import { Injectable } from '@nestjs/common';
import { Psicologo as PrismaPsicologo, Prisma } from 'generated/prisma'; // Ou @prisma/client
import { EncryptionService } from 'src/modules/services/encryptionService';
import { Psicologo } from 'src/modules/user/entities/Psicologo';

@Injectable() 
export class PrismaPsicologoMapper {
  
  constructor(private encryptionService: EncryptionService) {}


  toPrisma(psicologo: Psicologo) {
    return {
      userId: psicologo.userId,

      crp: this.encryptionService.encrypt(psicologo.crp),
      crpHash: psicologo.crpHash,
      bio: psicologo.bio ? this.encryptionService.encrypt(psicologo.bio) : null,
      
      schedule_settings: psicologo.schedule_settings as Prisma.JsonValue, 
    };
  }
  toDomain(raw: PrismaPsicologo): Psicologo {
    return new Psicologo(
      {
        userId: raw.userId,
        
        crp: this.encryptionService.decrypt(raw.crp),
        crpHash: raw.crpHash,
        bio: raw.bio ? this.encryptionService.decrypt(raw.bio) : null, 
        
        schedule_settings: raw.schedule_settings ?? null,
      },
    );
  }
}