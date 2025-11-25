// src/shared/services/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor() {
    const secretKey = process.env.ENCRYPTION_KEY;
    if (!secretKey) {
      throw new Error('ENCRYPTION_KEY é obrigatória no .env');
    }
    // Gera chave de 32 bytes a partir da chave secreta
    this.key = scryptSync(secretKey, 'salt', 32);
  }

  // ----------------------------
  // 🔒 Criptografa texto
  // ----------------------------
  encrypt(text: string): string {
    const iv = randomBytes(16); // Vetor de inicialização aleatório
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retorna IV + texto criptografado (separado por ":")
    return `${iv.toString('hex')}:${encrypted}`;
  }

  // ----------------------------
  // 🔓 Descriptografa texto
  // ----------------------------
  decrypt(data: string): string {
    if (!data) return data;

    try {
      // Valores criptografados AES geralmente têm ":" separando IV e conteúdo
      if (!data.includes(':')) {
        return data; // não criptografado → retorna normal
      }

      const [ivHex, encryptedText] = data.split(':');
      const iv = Buffer.from(ivHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.warn('⚠️ Valor não descriptografável, retornando como está:', data);
      return data; // nunca quebra a aplicação
    }
  }
}
