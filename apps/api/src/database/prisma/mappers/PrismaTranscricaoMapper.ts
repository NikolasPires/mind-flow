import { Injectable } from '@nestjs/common'; 
import { Transcricao as PrismaTranscricao } from "generated/prisma";
import { Transcricao, TranscricaoStatus } from "src/modules/transcricao/entities/Transcricao";
import { EncryptionService } from 'src/modules/services/encryptionService'; 

@Injectable() 
export class PrismaTranscricaoMapper {

 constructor(private encryptionService: EncryptionService) {}

 toPrisma(transcricao: Transcricao) {
  return {
   id: transcricao.id,
   texto_gerado: transcricao.texto_gerado
        ? this.encryptionService.encrypt(transcricao.texto_gerado)
        : null,
   data_geracao: transcricao.data_geracao,
   status: transcricao.status,
   created_at: transcricao.created_at,
   updatedAt: transcricao.updatedAt,
  };
 }

 toDomain(raw: PrismaTranscricao): Transcricao {
  return new Transcricao(
   {
    id: raw.id,
    texto_gerado: raw.texto_gerado ? this.encryptionService.decrypt(raw.texto_gerado) : null,
    data_geracao: raw.data_geracao,
    status: raw.status as TranscricaoStatus,
    created_at: raw.created_at,
    updatedAt: raw.updatedAt,
   }
  );
 }
}