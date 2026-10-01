import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const avaliacaoSchema = z.object({
  clienteId: z.string().min(1, { message: "clienteId é obrigatório" }),
  livroId: z.number().int({ message: "livroId deve ser um número inteiro" }).positive({ message: "livroId deve ser maior que zero" }),
  nota: z.number().int({ message: "Nota deve ser um número inteiro" }).min(1, { message: "Nota mínima é 1" }).max(5, { message: "Nota máxima é 5" }),
  comentario: z.string().max(255, { message: "Comentário deve ter no máximo 255 caracteres" }).optional(),
})

router.post("/avaliacoes", async (req, res) => {
  const valida = avaliacaoSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { clienteId, livroId, nota, comentario } = valida.data
  const comentarioFormatado = comentario?.trim() || undefined

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    })

    if (!cliente) {
      res.status(404).json({ erro: "Cliente não encontrado" })
      return
    }

    const livro = await prisma.livro.findUnique({
      where: { id: livroId },
    })

    if (!livro) {
      res.status(404).json({ erro: "Livro não encontrado" })
      return
    }

    const avaliacaoExistente = await prisma.avaliacao.findFirst({
      where: {
        clienteId,
        livroId,
      },
    })

    if (avaliacaoExistente) {
      res.status(409).json({ erro: "Este cliente já avaliou este livro" })
      return
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        clienteId,
        livroId,
        nota,
        comentario: comentarioFormatado ?? "",
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        livro: {
          select: {
            id: true,
            titulo: true,
            autor: true,
          },
        },
      },
    })

    res.status(201).json(avaliacao)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.get("/livros/:id/avaliacoes", async (req, res) => {
  const { id } = req.params
  const livroId = Number(id)

  if (!Number.isInteger(livroId)) {
    res.status(400).json({ erro: "ID do livro inválido" })
    return
  }

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { livroId },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json(avaliacoes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/clientes/:id/avaliacoes", async (req, res) => {
  const { id } = req.params

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { clienteId: id },
      include: {
        livro: {
          select: {
            id: true,
            titulo: true,
            autor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json(avaliacoes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.delete("/avaliacoes/:id", async (req, res) => {
  const { id } = req.params
  const avaliacaoId = Number(id)

  if (!Number.isInteger(avaliacaoId)) {
    res.status(400).json({ erro: "ID da avaliação inválido" })
    return
  }

  try {
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
    })

    if (!avaliacaoExistente) {
      res.status(404).json({ erro: "Avaliação não encontrada" })
      return
    }

    const avaliacaoRemovida = await prisma.avaliacao.delete({
      where: { id: avaliacaoId },
    })

    res.status(200).json({
      mensagem: "Avaliação removida com sucesso",
      avaliacao: avaliacaoRemovida,
    })
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router
