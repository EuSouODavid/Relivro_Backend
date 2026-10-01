import { prisma } from "../../lib/prisma"
import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET ?? "reliro-admin-secret"

router.post("/", async (req, res) => {
  const { email, senha } = req.body
  const mensagemPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensagemPadrao })
    return
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: { email },
    })

    if (!admin) {
      res.status(401).json({ erro: mensagemPadrao })
      return
    }

    const senhaValida = bcrypt.compareSync(senha, admin.senha)

    if (!senhaValida) {
      res.status(401).json({ erro: mensagemPadrao })
      return
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        nome: admin.nome,
        tipo: "admin",
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    )

    res.status(200).json({
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
      },
    })
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
