# Guia Postman - Rotas de Consulta

Guia completo para testar as rotas da API de Consulta no Postman.

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

### 1. GET /consultas - Listar todas as consultas

**Método:** `GET`  
**URL:** `http://localhost:3001/consultas`

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
    "id": "clx9876543210",
    "paciente_id": "clx1234567890",
    "paciente": {
      "name": "João Silva"
    },
    "horario": "2024-01-15T14:30:00.000Z",
    "tipo": "Terapia Individual",
    "categoria": "Acompanhamento",
    "tags": ["primeira-consulta", "ansiedade"],
    "status": "A_CONFIRMAR",
    "sugestao_IA": "Sugerir exercícios de respiração para ansiedade.",
    "transcricao_id": "clxtrans123",
    "created_at": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  },
  {
    "id": "clx1112223334",
    "paciente_id": "clx5556667778",
    "paciente": {
      "name": "Maria Santos"
    },
    "horario": "2024-01-16T10:00:00.000Z",
    "tipo": "Avaliação Inicial",
    "categoria": "Primeira Consulta",
    "tags": ["avaliacao"],
    "status": "CONFIRMADO",
    "sugestao_IA": null,
    "transcricao_id": null,
    "created_at": "2024-01-11T09:00:00.000Z",
    "updatedAt": "2024-01-11T09:00:00.000Z"
  }
]
```

---

### 2. POST /consultas - Criar nova consulta

**Método:** `POST`  
**URL:** `http://localhost:3001/consultas`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body (JSON):**
```json
{
  "paciente_id": "clx1234567890",
  "horario": "2024-01-15T14:30:00.000Z",
  "tipo": "Terapia Individual",
  "categoria": "Acompanhamento",
  "tags": ["primeira-consulta", "ansiedade"],
  "status": "A_CONFIRMAR",
  "sugestao_IA": "Sugerir exercícios de respiração para ansiedade.",
  "transcricao_id": "clxtrans123"
}
```

**Campos Obrigatórios:**
- `paciente_id` (string)
- `horario` (string ISO 8601)
- `tipo` (string)
- `categoria` (string)
- `tags` (array de strings)

**Campos Opcionais:**
- `status` (enum: "CONFIRMADO", "CANCELADO", "A_CONFIRMAR")
- `sugestao_IA` (string)
- `transcricao_id` (string)

**Exemplo de Resposta (201 Created):**
```json
{
  "id": "clx9876543210",
  "paciente_id": "clx1234567890",
  "horario": "2024-01-15T14:30:00.000Z",
  "tipo": "Terapia Individual",
  "categoria": "Acompanhamento",
  "tags": ["primeira-consulta", "ansiedade"],
  "status": "A_CONFIRMAR",
  "sugestao_IA": "Sugerir exercícios de respiração para ansiedade.",
  "transcricao_id": "clxtrans123",
  "created_at": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T10:00:00.000Z"
}
```

**Exemplo de Resposta de Erro (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "paciente_id should not be empty",
    "horario must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

**Exemplo de Resposta de Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Paciente não encontrado.",
  "error": "Not Found"
}
```

---

### 3. PUT /consultas/:id - Atualizar consulta

**Método:** `PUT`  
**URL:** `http://localhost:3001/consultas/{id}`

**Exemplo de URL:**
```
http://localhost:3001/consultas/clx9876543210
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token} (opcional)
```

**Body (JSON) - Todos os campos são opcionais:**
```json
{
  "status": "CONFIRMADO",
  "sugestao_IA": "Aplicar técnicas de mindfulness durante a sessão.",
  "transcricao_id": "clxtrans456"
}
```

**Ou atualizar múltiplos campos:**
```json
{
  "horario": "2024-01-15T16:00:00.000Z",
  "tipo": "Terapia em Grupo",
  "categoria": "Grupo de Apoio",
  "tags": ["grupo", "terapia-coletiva"],
  "status": "CONFIRMADO",
  "transcricao_id": "clxtrans789"
}
```

**Exemplo de Resposta (200 OK):**
```json
{
  "id": "clx9876543210",
  "paciente_id": "clx1234567890",
  "horario": "2024-01-15T16:00:00.000Z",
  "tipo": "Terapia em Grupo",
  "categoria": "Grupo de Apoio",
  "tags": ["grupo", "terapia-coletiva"],
  "status": "CONFIRMADO",
  "sugestao_IA": "Aplicar técnicas de mindfulness durante a sessão.",
  "transcricao_id": "clxtrans789",
  "created_at": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-12T14:30:00.000Z"
}
```

**Exemplo de Resposta de Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Consulta não encontrada.",
  "error": "Not Found"
}
```

---

### 4. DELETE /consultas/:id - Deletar consulta

**Método:** `DELETE`  
**URL:** `http://localhost:3001/consultas/{id}`

**Exemplo de URL:**
```
http://localhost:3001/consultas/clx9876543210
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
  "message": "Consulta deletada com sucesso."
}
```

**Exemplo de Resposta de Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Consulta não encontrada.",
  "error": "Not Found"
}
```

---

## 📝 Exemplos de Valores para Teste

### Status
```
A_CONFIRMAR
CONFIRMADO
CANCELADO
```

### Tags
```json
["primeira-consulta", "ansiedade"]
["avaliacao"]
["grupo", "terapia-coletiva"]
["follow-up"]
```

### Horário (ISO 8601)
```
2024-01-15T14:30:00.000Z
2024-01-15T16:00:00.000Z
2024-01-20T10:00:00.000Z
```

### Tipos de Consulta
```
Terapia Individual
Terapia em Grupo
Avaliação Inicial
Follow-up
Terapia de Casal
```

### Categorias
```
Acompanhamento
Primeira Consulta
Grupo de Apoio
Avaliação
Emergência
```

---

## 🔧 Configuração no Postman

### 1. Criar uma Collection
1. Clique em "New" → "Collection"
2. Nome: "MindFlow - Consultas API"

### 2. Adicionar Variáveis de Ambiente (Opcional)
Crie um Environment com as seguintes variáveis:

```
base_url: http://localhost:3001
token: seu_token_aqui
```

Use nas URLs: `{{base_url}}/consultas`

### 3. Criar as Requests

#### Request 1: Listar Consultas
- **Nome:** GET Listar Consultas
- **Método:** GET
- **URL:** `{{base_url}}/consultas`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Request 2: Criar Consulta
- **Nome:** POST Criar Consulta
- **Método:** POST
- **URL:** `{{base_url}}/consultas`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body (raw JSON):**
```json
{
  "paciente_id": "clx1234567890",
  "horario": "2024-01-15T14:30:00.000Z",
  "tipo": "Terapia Individual",
  "categoria": "Acompanhamento",
  "tags": ["primeira-consulta"],
  "status": "A_CONFIRMAR"
}
```

#### Request 3: Atualizar Consulta
- **Nome:** PUT Atualizar Consulta
- **Método:** PUT
- **URL:** `{{base_url}}/consultas/{{consulta_id}}`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body (raw JSON):**
```json
{
  "status": "CONFIRMADO",
  "transcricao_id": "clxtrans123"
}
```

#### Request 4: Deletar Consulta
- **Nome:** DELETE Deletar Consulta
- **Método:** DELETE
- **URL:** `{{base_url}}/consultas/{{consulta_id}}`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

---

## ⚠️ Observações Importantes

1. **Formato de Data:** Sempre use ISO 8601 (ex: `2024-01-15T14:30:00.000Z`)

2. **IDs de Paciente:** Certifique-se de usar IDs válidos de pacientes existentes no banco

3. **IDs de Transcrição:** O `transcricao_id` é opcional e deve referenciar uma transcrição existente

4. **Validações:**
   - `paciente_id` deve existir no sistema
   - `horario` deve ser uma data válida no formato ISO 8601
   - `tags` deve ser um array de strings
   - `status` deve ser um dos valores: `CONFIRMADO`, `CANCELADO`, `A_CONFIRMAR`

5. **Status Codes:**
   - `200 OK` - Sucesso (GET, PUT, DELETE)
   - `201 Created` - Sucesso (POST)
   - `400 Bad Request` - Erro de validação
   - `404 Not Found` - Recurso não encontrado

---

## 🧪 Sequência de Testes Recomendada

1. **GET /consultas** - Listar consultas existentes
2. **POST /consultas** - Criar uma nova consulta (salve o `id` da resposta)
3. **GET /consultas** - Verificar se a consulta foi criada
4. **PUT /consultas/:id** - Atualizar a consulta criada
5. **GET /consultas** - Verificar se a atualização funcionou
6. **DELETE /consultas/:id** - Deletar a consulta criada
7. **GET /consultas** - Verificar se a consulta foi deletada

---

## 📚 Documentação Completa

Para mais detalhes, consulte: [docs/api/rotas-consulta.md](./rotas-consulta.md)

