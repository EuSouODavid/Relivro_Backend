import { prisma } from "../../lib/prisma"
import { Router } from "express"
import bcrypt from 'bcrypt'
import { z } from 'zod'

const router = Router()

const clienteSchema = z.object({
  nome: z.string().min(10, {
    message: "Nome do cliente deve possuir, no mínimo, 10 caracteres"
  }),
  email: z.string().email({ message: "Informe um e-mail válido" }),
  senha: z.string(),
  cidade: z.string(),
  telefone: z.string().length(13, {
    message: "Telefone deve estar no formato (99)999999999"
  }),
})

function validaSenha(senha: string) {
  const mensa: string[] = []

  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  for (const letra of senha) {
    if ((/[a-z]/).test(letra)) {
      pequenas++
    } else if ((/[A-Z]/).test(letra)) {
      grandes++
    } else if ((/[0-9]/).test(letra)) {
      numeros++
    } else {
      simbolos++
    }
  }

  if (pequenas == 0) mensa.push("Erro... senha deve possuir letra(s) minúscula(s)")
  if (grandes == 0) mensa.push("Erro... senha deve possuir letra(s) maiúscula(s)")
  if (numeros == 0) mensa.push("Erro... senha deve possuir número(s)")
  if (simbolos == 0) mensa.push("Erro... senha deve possuir símbolo(s)")

  return mensa
}

// campos que podem ser expostos com segurança (nunca a senha)
const clienteSelect = {
  id: true,
  nome: true,
  email: true,
  cidade: true,
  telefone: true,
  createdAt: true,
}

router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({ select: clienteSelect })
    res.status(200).json(clientes)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", async (req, res) => {
  const valida = clienteSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const verificaCliente = await prisma.cliente.findUnique({
    where: { email: valida.data.email }
  })
  if (verificaCliente) {
    res.status(409).json({ erro: "E-mail já cadastrado" })
    return
  }

  const erros = validaSenha(valida.data.senha)
  if (erros.length > 0) {
    res.status(400).json({ erro: erros.join("; ") })
    return
  }

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(valida.data.senha, salt)

  const { nome, email, cidade, telefone } = valida.data

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email, senha: hash, cidade, telefone },
      select: clienteSelect,
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: clienteSelect,
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json(error)
  }
})
router.put("/:id", async (req, res) => {
  const { id } = req.params

  const clienteUpdateSchema = clienteSchema.partial()
  const valida = clienteUpdateSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const dados = { ...valida.data }

  // se o cliente estiver trocando a senha, gera um novo hash;
  // caso contrário, remove o campo pra não sobrescrever com undefined
  if (dados.senha) {
    const erros = validaSenha(dados.senha)
    if (erros.length > 0) {
      res.status(400).json({ erro: erros.join("; ") })
      return
    }
    const salt = bcrypt.genSaltSync(12)
    dados.senha = bcrypt.hashSync(dados.senha, salt)
  } else {
    delete dados.senha
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: dados,
      select: clienteSelect,
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const cliente = await prisma.cliente.delete({
      where: { id },
      select: clienteSelect,
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})
export default router