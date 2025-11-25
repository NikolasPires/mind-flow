import { Injectable } from "@nestjs/common";
import { Psicologo } from "src/modules/user/entities/Psicologo";
import { PsicologoRepository } from "src/modules/user/repositories/PsicologoRepository";
import { PrismaService } from "../prisma.service";
import { PrismaPsicologoMapper } from "../mappers/PrismaPsicologoMapper";

@Injectable()
export class PrismaPsicologoRepository implements PsicologoRepository {
    constructor(
        private prisma: PrismaService,
        private mapper: PrismaPsicologoMapper,

    ) {}

    async findByCrpHash(crpHash: string): Promise<Psicologo | null> {
        const psicologo = await this.prisma.psicologo.findUnique({
            where: { crpHash }
        });

        if (!psicologo) return null;
        return this.mapper.toDomain(psicologo); 
    }
    
}