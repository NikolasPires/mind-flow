import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { EncryptionService } from "src/modules/services/encryptionService";
import { UpdateUserDto } from "../../dto/update-user.dto";
import { UpdatePsicologoDto } from "../../dto/update-psicologo.dto";
import { CloudinaryService } from "src/modules/services/cloudinaryService";

const extractPublicId = (url: string | null | undefined): string | null => {
    if (!url || !url.includes('/upload/')) return null;
    const parts = url.split('/upload/');
    const resourcePath = parts[1];
    const idMatch = resourcePath.match(/v\d+\/(.+?)(\.\w+)?$/);
    return idMatch ? idMatch[1] : null;
};

@Injectable()
export class UpdateUserProfileUseCase {
    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService,
        private cloudinaryService: CloudinaryService,
    ) {}

    async execute(userId: string, userData: UpdateUserDto, profileData?: UpdatePsicologoDto) {
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

        const oldPhotoUrl = user.photo_url;
        let newPhotoUrl: string | undefined = userData.photo_url;

        if (newPhotoUrl && newPhotoUrl.startsWith('data:')) {
            const uploadResult = await this.cloudinaryService.uploadImage(newPhotoUrl);
            newPhotoUrl = uploadResult.url; 
        }

        const isPhotoUpdated = newPhotoUrl !== undefined && newPhotoUrl !== oldPhotoUrl;
        if (isPhotoUpdated && oldPhotoUrl) {
            const publicId = extractPublicId(oldPhotoUrl);
            if (publicId) {
                await this.cloudinaryService.deleteImage(publicId); 
            }
        }
        
        const userUpdate: any = {};
        
        if (newPhotoUrl !== undefined) {
            userUpdate.photo_url = newPhotoUrl === '' ? null : newPhotoUrl;
        }

        if (userData.name) {
            userUpdate.name = this.encryptionService.encrypt(userData.name);
        }

        if (userData.email) {
            const { createHash } = require('crypto');
            const emailHash = createHash('sha256')
                .update(userData.email)
                .digest('hex');
            userUpdate.email = this.encryptionService.encrypt(userData.email);
            userUpdate.emailHash = emailHash;
        }

        if (userData.phone !== undefined) {
            userUpdate.phone = userData.phone;
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: userUpdate,
        });

        if (profileData && user.role === 'PSICOLOGO' && user.psicologo) {
            const psicologoUpdate: any = {};

            if (profileData.bio !== undefined) {
                psicologoUpdate.bio = profileData.bio;
            }

            if (profileData.schedule_settings !== undefined) {
                psicologoUpdate.schedule_settings = profileData.schedule_settings;
            }

            await this.prisma.psicologo.update({
                where: { userId },
                data: psicologoUpdate,
            });
        }

        const updatedUserWithProfile = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                psicologo: true,
                paciente: true,
            },
        });

        if (!updatedUserWithProfile) {
            throw new NotFoundException("Usuário não encontrado após atualização");
        }

        let finalUser: any = { ...updatedUserWithProfile };
        try {
            if (finalUser.name) finalUser.name = this.encryptionService.decrypt(finalUser.name);
            if (finalUser.email) finalUser.email = this.encryptionService.decrypt(finalUser.email);

            if (finalUser.psicologo) {
                finalUser.psicologo = {
                    ...finalUser.psicologo,
                    crp: this.encryptionService.decrypt(finalUser.psicologo.crp),
                };
            }

            if (finalUser.paciente && finalUser.paciente.cpf) {
                finalUser.paciente = {
                    ...finalUser.paciente,
                    cpf: this.encryptionService.decrypt(finalUser.paciente.cpf),
                };
            }
        } catch (e) {
            console.warn("Falha ao descriptografar retorno:", e);
        }

        return {
            message: "Dados atualizados com sucesso",
            user: finalUser,
        };
    }
}