import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET ?? "reliro-admin-secret"

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ erro: "Token ausente ou inválido" })
    return
  }

  const token = authHeader.replace("Bearer ", "").trim()

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      tipo?: string
      sub?: string
      email?: string
      nome?: string
    }

    if (decoded.tipo !== "admin") {
      res.status(403).json({ erro: "Acesso restrito a administradores" })
      return
    }

    ;(req as any).admin = decoded
    next()
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" })
  }
}
