import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(imagePath: string): Promise<{ url: string }> {
    try {
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'mindflow/profile-photos',
      });

      return { url: result.secure_url };
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new InternalServerErrorException('Falha ao fazer upload da imagem.');
    }
  }
  async deleteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Cloudinary: Imagem com ID ${publicId} excluída com sucesso.`);
        } catch (error) {
            // É comum falhar se o ID for inválido ou se o recurso já foi excluído. 
            // Para não quebrar o fluxo, apenas logamos o erro.
            console.warn(`Cloudinary Deletion Warning: Falha ao excluir imagem ${publicId}.`, error);
        }
    }
}