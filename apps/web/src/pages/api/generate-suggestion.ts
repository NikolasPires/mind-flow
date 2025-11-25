// apps/web/src/pages/api/generate-suggestion.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Tipos para a resposta
type ApiResponse = {
  suggestion?: string;
  error?: string;
};

// Pega a Chave de API do ambiente (seguro)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ==== CORREÇÃO AQUI ====
// O modelo 'gemini-1.5-flash' também não foi encontrado na v1beta.
// Vamos usar o alias mais recente e estável: 'gemini-1.5-pro-latest'
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
// =======================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Apenas aceitamos requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { transcript, notes } = req.body;

  if (!transcript && !notes) {
    return res.status(400).json({ error: 'É necessário fornecer a transcrição ou as anotações.' });
  }

  try {
    // Este é o "prompt" que você envia para a IA. Ajuste conforme sua necessidade.
   const prompt = `
Você é a **Malu**, assistente clínica do MindFlow.
Seu papel é **apoiar o psicólogo**, oferecendo uma segunda perspectiva preliminar baseada nos dados da sessão.
**Você nunca substitui o julgamento clínico do profissional.**

Analise os dados abaixo:

📝 Transcrição:
"${transcript || 'Não houve transcrição automática.'}"

✍️ Anotações do Terapeuta:
"${notes || 'Sem anotações.'}"

Diretrizes:
- Mantenha anonimato total: use apenas “o paciente” ou “a paciente”.
- Linguagem profissional, objetiva e acolhedora.
- Você pode levantar **hipóteses clínicas**, mas nunca apresentar conclusões.
- Use sempre termos como: “pode indicar”, “pode estar relacionado”, “pode sugerir”.
- Reforce explicitamente que **toda hipótese deve ser revisada, validada ou descartada apenas pelo psicólogo responsável**.
- Nunca prescreva tratamento ou diagnóstico fechado.

Gere uma resposta breve contendo:

✨ **Percepção Geral** — síntese das emoções ou temas predominantes.

🧩 **Hipóteses Possíveis** — 1 a 2 possibilidades clínicas, sempre usando linguagem condicional e reforçando que **a avaliação final é exclusivamente do psicólogo**.

💡 **Sugestão Clínica da Malu** — um único ponto prático que pode auxiliar na próxima sessão,
**desde que o psicólogo avalie sua pertinência antes de aplicar**.

Evite respostas longas. Não forneça diagnósticos fechados.

⚠️ **IMPORTANTE**: Você é uma IA de suporte. Sua análise é auxiliar e deve ser sempre revisada pelo psicólogo responsável.
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ suggestion: text });

  } catch (error) {
    console.error('Erro ao chamar a API do Gemini:', error);
    res.status(500).json({ error: 'Falha ao gerar sugestão da IA.' });
  }
}