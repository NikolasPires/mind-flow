import { Module } from "@nestjs/common";
import { TranscricaoController } from "./controller/transcricao.controller";
import { DatabaseModule } from "src/database/database.module";
import { CreateTranscricaoUseCase } from "./useCases/create-transcricao.use-case";
import { ListTranscricoesUseCase } from "./useCases/list-transcricoes.use-case";
import { FindTranscricaoUseCase } from "./useCases/find-transcricao.use-case";
import { UpdateTranscricaoUseCase } from "./useCases/update-transcricao.use-case";
import { DeleteTranscricaoUseCase } from "./useCases/delete-transcricao.use-case";
import { TranscricaoRepository } from "./repositories/TranscricaoRepository";
import { PrismaTranscricaoRepository } from "src/database/prisma/repositories/PrismaTranscricaoRepository";
import { EncryptionService } from "../services/encryptionService";
import { PrismaTranscricaoMapper } from "src/database/prisma/mappers/PrismaTranscricaoMapper";

@Module({
    imports: [DatabaseModule],
    controllers: [TranscricaoController],
    providers: [
        CreateTranscricaoUseCase,
        ListTranscricoesUseCase,
        FindTranscricaoUseCase,
        UpdateTranscricaoUseCase,
        DeleteTranscricaoUseCase,
        EncryptionService,
        PrismaTranscricaoMapper,
        {
            provide: TranscricaoRepository,
            useClass: PrismaTranscricaoRepository,
            
        },
    ],
    exports: [TranscricaoRepository],
})
export class TranscricaoModule {}

