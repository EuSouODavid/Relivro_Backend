import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET ?? "reliro-admin-secret"

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string
        email: string
        nome: string
        tipo: string
      }
    }
  }
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token ausente ou inválido" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      sub?: string
      email?: string
      nome?: string
      tipo?: string
    }

    if (!decoded || decoded.tipo !== "admin") {
      return res.status(403).json({ erro: "Acesso restrito ao administrador" })
    }

    req.admin = {
      id: decoded.sub ?? "",
      email: decoded.email ?? "",
      nome: decoded.nome ?? "",
      tipo: decoded.tipo ?? "admin",
    }

    return next()
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado" })
  }
}

export default adminAuth
