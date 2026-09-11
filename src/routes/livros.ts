import { prisma } from "../../lib/prisma"
import { completarLivroComGemini } from "../../services/iaServices"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const livroSchema = z.object({
  titulo: z.string().min(2, { message: "Título deve possuir, no mínimo, 2 caracteres" }),
  autor: z.string().min(2, { message: "Autor deve possuir, no mínimo, 2 caracteres" }),
  quantidade: z.number().int({ message: "Quantidade deve ser um número inteiro" }),
  adminId: z.string().min(1, { message: "adminId é obrigatório" }),
  categoria: z.string().min(2, { message: "Categoria deve possuir, no mínimo, 2 caracteres" }),
  editora: z.string().min(2, { message: "Editora deve possuir, no mínimo, 2 caracteres" }).optional(),
  ano: z.number().int({ message: "Ano deve ser um número inteiro" }).optional(),
  sinopse: z.array(z.string().min(1)).optional(),
})

const livroUpdateSchema = livroSchema.partial()

router.get("/", async (req, res) => {
  try {
    const livros = await prisma.livro.findMany({
      include: {
        fotos: true,
        avaliacoes: true,
        admin: true,
        itensVendas: true,
      },
    })

    res.status(200).json(livros)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  try {
    const livros = await prisma.livro.findMany({
      where: {
        OR: [
          { titulo: { contains: termo, mode: "insensitive" } },
          { autor: { contains: termo, mode: "insensitive" } },
          { editora: { contains: termo, mode: "insensitive" } },
          { categoria: { contains: termo, mode: "insensitive" } },
        ],
      },
      include: {
        fotos: true,
        avaliacoes: true,
        admin: true,
        itensVendas: true,
      },
    })

    res.status(200).json(livros)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const livro = await prisma.livro.findUnique({
      where: { id: Number(id) },
      include: {
        fotos: true,
        avaliacoes: true,
        admin: true,
        itensVendas: true,
      },
    })

    res.status(200).json(livro)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = livroSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const complemento = await completarLivroComGemini(
      valida.data.titulo,
      valida.data.autor,
      valida.data.quantidade,
      valida.data.categoria,
      {
        editora: valida.data.editora,
        ano: valida.data.ano,
        sinopse: valida.data.sinopse,
      }
    )

    const livro = await prisma.livro.create({
      data: {
        titulo: valida.data.titulo,
        autor: valida.data.autor,
        quantidade: valida.data.quantidade,
        adminId: valida.data.adminId,
        categoria: valida.data.categoria,
        editora: complemento.editora,
        ano: complemento.ano,
        sinopse: complemento.sinopse,
      },
    })

    res.status(201).json(livro)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const valida = livroUpdateSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const livro = await prisma.livro.update({
      where: { id: Number(id) },
      data: valida.data,
    })

    res.status(200).json(livro)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const livro = await prisma.livro.delete({
      where: { id: Number(id) },
    })

    res.status(200).json(livro)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router