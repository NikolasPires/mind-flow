# Documentação da API - Rotas de Pacientes

## GET /users/patients - Listar pacientes do psicólogo logado

### 📋 Descrição

Retorna a lista de todos os pacientes associados ao psicólogo autenticado. A rota filtra automaticamente os pacientes baseado no psicólogo logado através do token JWT.

### 🔐 Autenticação

**Requerida:** Sim (JWT Token)

O endpoint requer autenticação via JWT. O token deve ser enviado no header `Authorization` no formato `Bearer {token}`.

### 📍 Endpoint

```
GET /users/patients
```

### 🔑 Headers

```
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request

**Body:** Não requerido

**Query Parameters:** Não requeridos

### ✅ Validações

1. **Autenticação:** O usuário deve estar autenticado e possuir um token JWT válido
2. **Tipo de usuário:** O usuário autenticado deve ser um psicólogo (role: `PSICOLOGO`)
3. **Permissões:** Apenas pacientes do psicólogo logado são retornados

### 📤 Response

#### Status 200 OK

Retorna um array de objetos contendo os dados dos pacientes do psicólogo logado.

**Estrutura da Resposta:**

```json
[
  {
    "id": "clx123abc",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "photo_url": "https://example.com/photo.jpg",
    "cpf": "123.456.789-00",
    "gender": "MASCULINO",
    "initial_observations": "Observações iniciais do paciente...",
    "history": "Histórico clínico do paciente...",
    "status": "ATIVO",
    "psicologo_responsavel_id": "clx456def"
  },
  {
    "id": "clx789ghi",
    "name": "Maria Santos",
    "email": "maria.santos@email.com",
    "photo_url": null,
    "cpf": "987.654.321-00",
    "gender": "FEMININO",
    "initial_observations": null,
    "history": null,
    "status": "ATIVO",
    "psicologo_responsavel_id": "clx456def"
  }
]
```

**Campos da Resposta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID do usuário (userId) do paciente |
| `name` | string | Nome completo do paciente (descriptografado) |
| `email` | string | Email do paciente (descriptografado) |
| `photo_url` | string \| null | URL da foto de perfil do paciente |
| `cpf` | string \| null | CPF do paciente (descriptografado) |
| `gender` | enum | Gênero do paciente: `MASCULINO`, `FEMININO`, `OUTRO` |
| `initial_observations` | string \| null | Observações iniciais do paciente (descriptografado) |
| `history` | string \| null | Histórico clínico do paciente (descriptografado) |
| `status` | enum | Status do paciente: `ATIVO`, `ACOMPANHAMENTO`, `ALTA`, `INATIVO` |
| `psicologo_responsavel_id` | string \| null | ID do psicólogo responsável pelo paciente |

#### Status 401 Unauthorized

Token JWT inválido ou ausente.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Status 403 Forbidden

O usuário autenticado não é um psicólogo ou não foi encontrado.

```json
{
  "statusCode": 403,
  "message": "Usuário não é um psicólogo ou não foi encontrado."
}
```

### 📝 Exemplo de Uso

#### cURL

```bash
curl -X GET http://localhost:3001/users/patients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3001/users/patients', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const pacientes = await response.json();
console.log(pacientes);
```

#### Axios

```javascript
import axios from 'axios';

const response = await axios.get('http://localhost:3001/users/patients', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data);
```

### 🔍 Comportamento

1. **Autenticação:** O sistema valida o token JWT e extrai o `userId` do psicólogo logado
2. **Validação:** Verifica se o usuário autenticado é realmente um psicólogo
3. **Filtro:** Busca apenas pacientes onde `psicologo_responsavel_id` corresponde ao psicólogo logado
4. **Descriptografia:** Os dados sensíveis (nome, email, CPF, observações, histórico) são descriptografados automaticamente
5. **Resposta:** Retorna um array com todos os pacientes do psicólogo

### 📌 Observações Importantes

1. **Segurança:** 
   - Apenas pacientes do psicólogo logado são retornados
   - Dados sensíveis são descriptografados automaticamente
   - O `psicologo_responsavel_id` é extraído automaticamente do token JWT

2. **Dados Criptografados:**
   - Os campos `name`, `email`, `cpf`, `initial_observations` e `history` são armazenados criptografados no banco
   - A descriptografia é feita automaticamente antes de retornar os dados

3. **Array Vazio:**
   - Se o psicólogo não tiver pacientes cadastrados, a rota retorna um array vazio `[]`
   - Isso não é considerado um erro

4. **Ordenação:**
   - A lista não tem uma ordenação específica definida
   - Os pacientes são retornados na ordem em que foram encontrados no banco

### 🔗 Relacionamentos

- Cada paciente está associado a um psicólogo através do campo `psicologo_responsavel_id`
- O paciente possui um relacionamento com `User` que contém os dados de autenticação e informações pessoais básicas
- Um paciente pode ter múltiplas consultas associadas

### 📚 Rotas Relacionadas

- `POST /users/patients` - Criar novo paciente associado ao psicólogo logado
- `GET /users/paciente/:id` - Obter detalhes de um paciente específico
- `GET /consultas` - Listar consultas (automaticamente filtradas por psicólogo)

---

## POST /users/patients - Criar paciente associado ao psicólogo logado

### 📋 Descrição

Cria um novo paciente e o associa automaticamente ao psicólogo autenticado. Esta rota é diferente de `POST /users/paciente` pois automaticamente vincula o paciente ao psicólogo logado.

### 🔐 Autenticação

**Requerida:** Sim (JWT Token)

### 📍 Endpoint

```
POST /users/patients
```

### 🔑 Headers

```
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request Body

```json
{
  "name": "João Silva",
  "email": "joao.silva@email.com",
  "password": "senhaSegura123",
  "cpf": "12345678900",
  "gender": "MASCULINO"
}
```

**Campos Obrigatórios:**

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `name` | string | `@IsNotEmpty()`, `@IsString()` | Nome completo do paciente |
| `email` | string | `@IsEmail()` | Email único do paciente |
| `password` | string | `@MinLength(6)` | Senha (mínimo 6 caracteres) |
| `cpf` | string | `@IsString()` | CPF do paciente (sem formatação) |
| `gender` | enum | `@IsEnum(Gender)` | Gênero: `MASCULINO`, `FEMININO`, `OUTRO` |

### ✅ Validações

1. **Autenticação:** Usuário deve estar autenticado
2. **Tipo de usuário:** Deve ser um psicólogo
3. **Email único:** O email não pode estar cadastrado
4. **CPF único:** O CPF não pode estar cadastrado
5. **Senha:** Mínimo de 6 caracteres

### 📤 Response

#### Status 201 Created

Retorna os dados do paciente criado.

```json
{
  "id": "clx123abc",
  "name": "João Silva",
  "email": "joao.silva@email.com",
  "role": "PACIENTE"
}
```

#### Status 400 Bad Request

Erro de validação dos dados.

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

#### Status 403 Forbidden

Usuário não é um psicólogo.

```json
{
  "statusCode": 403,
  "message": "Usuário não é um psicólogo ou não foi encontrado."
}
```

#### Status 409 Conflict

Email ou CPF já cadastrado.

```json
{
  "statusCode": 409,
  "message": "Este endereço de email já está em uso."
}
```

ou

```json
{
  "statusCode": 409,
  "message": "Este CPF já está cadastrado."
}
```

### 📝 Exemplo de Uso

#### cURL

```bash
curl -X POST http://localhost:3001/users/patients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "password": "senha123",
    "cpf": "12345678900",
    "gender": "MASCULINO"
  }'
```

#### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3001/users/patients', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    password: 'senha123',
    cpf: '12345678900',
    gender: 'MASCULINO'
  })
});

const paciente = await response.json();
console.log(paciente);
```

### 📌 Observações Importantes

1. **Associação Automática:** O paciente é automaticamente associado ao psicólogo logado através do token JWT
2. **Criptografia:** Os dados sensíveis (nome, email, CPF) são criptografados antes de serem salvos no banco
3. **Hash:** O email e CPF são armazenados também como hash para verificação de duplicidade sem descriptografar
4. **Status Padrão:** O paciente é criado com status `ATIVO` por padrão

---

## Resumo das Rotas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/users/patients` | Listar pacientes do psicólogo logado | ✅ Sim |
| `POST` | `/users/patients` | Criar paciente associado ao psicólogo logado | ✅ Sim |

---

**Última atualização:** 2024


