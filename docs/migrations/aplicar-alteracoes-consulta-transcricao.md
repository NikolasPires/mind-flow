# Guia: Aplicar Alterações no Banco de Dados

## Alterações a serem aplicadas

1. **Campo `sugestao_IA`** na tabela `Consulta` (campo opcional do tipo String)
2. **Nova tabela `Transcricao`** com os campos:
   - `id` (String, PK)
   - `id_consulta` (String, único, FK para Consulta)
   - `texto_gerado` (String, opcional)
   - `data_geracao` (DateTime)
   - `status` (enum TranscricaoStatus)
   - `created_at` (DateTime)
   - `updatedAt` (DateTime)
3. **Novo enum `TranscricaoStatus`** com valores: `PENDENTE`, `PROCESSANDO`, `CONCLUIDA`, `ERRO`

## Passo a Passo

### 1. Navegar até o diretório da API

```bash
cd apps/api
```

### 2. Criar a migração

O Prisma irá comparar o schema atual (`prisma/schema.prisma`) com o estado atual do banco de dados e criar uma nova migração com as alterações necessárias.

```bash
npx prisma migrate dev --name add_sugestao_ia_and_transcricao
```

Este comando irá:
- Criar um novo arquivo de migração na pasta `prisma/migrations/`
- Aplicar a migração no banco de dados
- Regenerar automaticamente o Prisma Client

**Alternativa (apenas criar a migração sem aplicar):**

```bash
npx prisma migrate dev --create-only --name add_sugestao_ia_and_transcricao
```

Depois, para aplicar:

```bash
npx prisma migrate deploy
```

### 3. Regenerar o Prisma Client (se necessário)

Se você não usou `migrate dev` (que já regenera automaticamente), execute:

```bash
npx prisma generate
```

### 4. Verificar se a migração foi aplicada

Você pode verificar o estado das migrações com:

```bash
npx prisma migrate status
```

## Scripts Disponíveis (VS Code)

Você também pode usar os scripts de debug configurados no VS Code:

1. **Prisma: Gerar Cliente** - Regenera o Prisma Client
2. **Prisma: Aplicar Migrações (deploy)** - Aplica migrações pendentes

## O que a migração fará

A migração SQL gerada deverá conter algo similar a:

```sql
-- CreateEnum
CREATE TYPE "TranscricaoStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDA', 'ERRO');

-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN "sugestao_IA" TEXT;

-- CreateTable
CREATE TABLE "Transcricao" (
    "id" TEXT NOT NULL,
    "id_consulta" TEXT NOT NULL,
    "texto_gerado" TEXT,
    "data_geracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TranscricaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcricao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcricao_id_consulta_key" ON "Transcricao"("id_consulta");

-- AddForeignKey
ALTER TABLE "Transcricao" ADD CONSTRAINT "Transcricao_id_consulta_fkey" 
    FOREIGN KEY ("id_consulta") REFERENCES "Consulta"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Ambiente de Produção

Para aplicar migrações em produção, use:

```bash
npx prisma migrate deploy
```

**⚠️ Importante:** `migrate deploy` apenas aplica migrações já criadas, não cria novas. Use apenas em ambientes onde o schema já está versionado.

## Troubleshooting

### Erro: "Migration failed to apply"

Se a migração falhar:

1. Verifique se o banco de dados está acessível:
   ```bash
   # Verificar a conexão
   npx prisma db pull
   ```

2. Se necessário, resetar o banco (⚠️ **CUIDADO: Isso apaga todos os dados**):
   ```bash
   npx prisma migrate reset
   ```

### Erro: "Type not found" após a migração

Regenere o Prisma Client:

```bash
npx prisma generate
```

### Verificar o estado do schema no banco

Para ver como está o schema atual no banco de dados:

```bash
npx prisma db pull
```

Isso atualizará o `schema.prisma` com o estado real do banco.

## Comandos Rápidos

```bash
# Criar e aplicar migração
cd apps/api
npx prisma migrate dev --name add_sugestao_ia_and_transcricao

# Apenas regenerar o client (se já aplicou manualmente)
npx prisma generate
```

## Próximos Passos

Após aplicar a migração:

1. ✅ O Prisma Client será regenerado automaticamente
2. ✅ Os tipos TypeScript estarão atualizados
3. ✅ As type assertions (`as any`) podem ser removidas do código
4. ✅ A API estará pronta para usar os novos campos
