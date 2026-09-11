import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })


const schemaLivroComplemento = {
  type: "OBJECT",
  properties: {
    editora: {
      type: "STRING",
      description: "Nome da editora",
    },
    ano: {
      type: "INTEGER",
      description: "Ano de publicação",
    },
    sinopse: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Sinopse do livro em 3 a 5 frases curtas",
    },
  },
  required: ["editora", "ano", "sinopse"],
}



export async function completarLivroComGemini(
  titulo: string,
  autor: string,
  quantidade: number,
  categoria: string,
  extras: {
    editora?: string
    ano?: number
    sinopse?: string[]
  }
) {
  try {
    const resposta = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Complete apenas os campos em falta de um livro para cadastro com base nestas informações obrigatórias:

Título: ${titulo}
Autor: ${autor}
Quantidade: ${quantidade}
Categoria: ${categoria}

Campos já informados pelo usuário, quando existirem:
${extras.editora ? `Editora: ${extras.editora}` : "Editora: ausente"}
${extras.ano ? `Ano: ${extras.ano}` : "Ano: ausente"}
${extras.sinopse?.length ? `Sinopse base: ${extras.sinopse.join(" ")}` : "Sinopse: ausente"}

Regras:
- Não altere título, autor, quantidade nem categoria.
- Preencha somente editora, ano e sinopse quando estiverem ausentes.
- A sinopse deve ter 3 a 5 frases curtas.
- Retorne apenas JSON válido, sem texto extra.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schemaLivroComplemento,
      },
    })

    const dados = JSON.parse(resposta.text || "{}")

    return {
      editora: extras.editora ?? dados.editora ?? "Sem editora",
      ano: extras.ano ?? dados.ano ?? new Date().getFullYear(),
      sinopse: extras.sinopse?.length ? extras.sinopse : dados.sinopse ?? ["Sinopse não disponível."],
    }
  } catch (error) {
    return {
      editora: extras.editora ?? "Sem editora",
      ano: extras.ano ?? new Date().getFullYear(),
      sinopse: extras.sinopse?.length ? extras.sinopse : ["Sinopse não disponível."],
    }
  }
}