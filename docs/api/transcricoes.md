# Guia Postman - Rotas de Transcrição

Guia completo para testar as rotas da API de Transcrição no Postman.

## 🌐 Configuração Base

### Base URL
```
http://localhost:3001
```

### Headers Padrão
```
Content-Type: application/json
Authorization: Bearer {seu_token_aqui} (opcional)
```

---

## 📋 Rotas Disponíveis

### 1. GET /transcricoes - Listar todas as transcrições

**Método:** `GET`  
**URL:** `http://localhost:3001/transcricoes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body:** Não necessário

**Exemplo de Resposta (200 OK):**
```json
[
  {
    "id": "clxtrans123",
    "texto_gerado": "Transcrição completa da sessão de terapia...",
    "data_geracao": "2024-01-15T15:00:00.000Z",
    "status": "CONCLUIDA",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  },
  {
    "id": "clxtrans456",
    "texto_gerado": null,
    "data_geracao": "2024-01-16T10:00:00.000Z",
    "status": "PENDENTE",
    "created_at": "2024-01-16T09:30:00.000Z",
    "updatedAt": "2024-01-16T09:30:00.000Z"
  }
]
```

---

### 2. GET /transcricoes/:id - Buscar transcrição por ID

**Método:** `GET`  
**URL:** `http://localhost:3001/transcricoes/{id}`

**Exemplo de URL:**
```
http://localhost:3001/transcricoes/clxtrans123
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body:** Não necessário

**Exemplo de Resposta (200 OK):**
```json
{
  "id": "clxtrans123",
  "texto_gerado": "Transcrição completa da sessão de terapia...",
  "data_geracao": "2024-01-15T15:00:00.000Z",
  "status": "CONCLUIDA",
  "created_at": "2024-01-15T14:30:00.000Z",
  "updatedAt": "2024-01-15T15:00:00.000Z"
}
```

**Exemplo de Resposta de Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Transcrição não encontrada.",
  "error": "Not Found"
}
```

---

### 3. POST /transcricoes - Criar nova transcrição

**Método:** `POST`  
**URL:** `http://localhost:3001/transcricoes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body (JSON):**
```json
{
  "texto_gerado": "Transcrição completa da sessão de terapia realizada em 15/01/2024...",
  "status": "CONCLUIDA"
}
```

**Campos Opcionais:**
- `texto_gerado` (string) - Texto da transcrição
- `status` (enum: "PENDENTE", "PROCESSANDO", "CONCLUIDA", "ERRO")

**Exemplo de Resposta (201 Created):**
```json
{
  "id": "clxtrans789",
  "texto_gerado": "Transcrição completa da sessão de terapia realizada em 15/01/2024...",
  "data_geracao": "2024-01-15T15:00:00.000Z",
  "status": "CONCLUIDA",
  "created_at": "2024-01-15T14:30:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

**Exemplo de Resposta de Erro (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "status must be one of the following values: PENDENTE, PROCESSANDO, CONCLUIDA, ERRO"
  ],
  "error": "Bad Request"
}
```

---

### 4. PUT /transcricoes/:id - Atualizar transcrição

**Método:** `PUT`  
**URL:** `http://localhost:3001/transcricoes/{id}`

**Exemplo de URL:**
```
http://localhost:3001/transcricoes/clxtrans123
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body (JSON) - Todos os campos são opcionais:**
```json
{
  "texto_gerado": "Transcrição atualizada com novo conteúdo...",
  "status": "CONCLUIDA"
}
```

**Ou atualizar apenas o status:**
```json
{
  "status": "PROCESSANDO"
}
```

**Exemplo de Resposta (200 OK):**
```json
{
  "id": "clxtrans123",
  "texto_gerado": "Transcrição atualizada com novo conteúdo...",
  "data_geracao": "2024-01-15T15:00:00.000Z",
  "status": "CONCLUIDA",
  "created_at": "2024-01-15T14:30:00.000Z",
  "updatedAt": "2024-01-15T16:00:00.000Z"
}
```

**Exemplo de Resposta de Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Transcrição não encontrada.",
  "error": "Not Found"
}
```

---

### 5. DELETE /transcricoes/:id - Deletar transcrição

**Método:** `DELETE`  
**URL:** `http://localhost:3001/transcricoes/{id}`

**Exemplo de URL:**
```
http://localhost:3001/transcricoes/clxtrans123
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body:** Não necessário

**Exemplo de Resposta (200 OK):**
```json
{
  "message": "Transcrição deletada com sucesso."
}
```

**Exemplo de Resposta de Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Transcrição não encontrada.",
  "error": "Not Found"
}
```

---

## 📝 Exemplos de Valores para Teste

### Status
```
PENDENTE
PROCESSANDO
CONCLUIDA
ERRO
```

### Texto de Transcrição
```
Transcrição completa da sessão de terapia realizada em 15/01/2024. O paciente apresentou sinais de melhora significativa...
```

---

## 🔧 Configuração no Postman

### 1. Criar as Requests

#### Request 1: Listar Transcrições
- **Nome:** GET Listar Transcrições
- **Método:** GET
- **URL:** `{{base_url}}/transcricoes`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Request 2: Buscar Transcrição por ID
- **Nome:** GET Buscar Transcrição
- **Método:** GET
- **URL:** `{{base_url}}/transcricoes/{{transcricao_id}}`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Request 3: Criar Transcrição
- **Nome:** POST Criar Transcrição
- **Método:** POST
- **URL:** `{{base_url}}/transcricoes`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body (raw JSON):**
```json
{
  "texto_gerado": "Transcrição completa da sessão...",
  "status": "CONCLUIDA"
}
```

#### Request 4: Atualizar Transcrição
- **Nome:** PUT Atualizar Transcrição
- **Método:** PUT
- **URL:** `{{base_url}}/transcricoes/{{transcricao_id}}`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body (raw JSON):**
```json
{
  "texto_gerado": "Transcrição atualizada...",
  "status": "CONCLUIDA"
}
```

#### Request 5: Deletar Transcrição
- **Nome:** DELETE Deletar Transcrição
- **Método:** DELETE
- **URL:** `{{base_url}}/transcricoes/{{transcricao_id}}`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

---

## ⚠️ Observações Importantes

1. **Campos Opcionais:** Todos os campos são opcionais na criação e atualização

2. **Status Padrão:** Se não fornecido, o status padrão será `PENDENTE`

3. **Validações:**
   - `status` deve ser um dos valores: `PENDENTE`, `PROCESSANDO`, `CONCLUIDA`, `ERRO`
   - `texto_gerado` pode ser uma string ou `null`

4. **Status Codes:**
   - `200 OK` - Sucesso (GET, PUT, DELETE)
   - `201 Created` - Sucesso (POST)
   - `400 Bad Request` - Erro de validação
   - `404 Not Found` - Transcrição não encontrada

5. **Relacionamento com Consulta:**
   - A transcrição é criada independentemente
   - Para associar a uma consulta, use o campo `transcricao_id` na atualização da consulta

---

## 🧪 Sequência de Testes Recomendada

1. **POST /transcricoes** - Criar uma nova transcrição (salve o `id` da resposta)
2. **GET /transcricoes** - Listar todas as transcrições
3. **GET /transcricoes/:id** - Buscar a transcrição criada
4. **PUT /transcricoes/:id** - Atualizar a transcrição criada
5. **GET /transcricoes/:id** - Verificar se a atualização funcionou
6. **PUT /consultas/:id** - Atualizar uma consulta para associar o `transcricao_id`
7. **DELETE /transcricoes/:id** - Deletar a transcrição criada
8. **GET /transcricoes** - Verificar se a transcrição foi deletada

---

## 🔗 Integração com Consultas

Para associar uma transcrição a uma consulta:

1. Crie a transcrição usando `POST /transcricoes`
2. Copie o `id` da transcrição retornada
3. Atualize a consulta usando `PUT /consultas/:id` com o campo `transcricao_id`:
```json
{
  "transcricao_id": "clxtrans123"
}
```

---

## 📚 Documentação Relacionada

- [Guia Postman - Rotas de Consulta](./postman-guide-consultas.md)
- [Documentação Completa das Rotas de Consulta](./rotas-consulta.md)

