import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { requireAdmin } from "../middlewares/requireAdmin"

const router = Router()

router.get("/", requireAdmin, async (req, res) => {
    try {
        const [totalClientes, totalLivros, totalPropostas, porStatus, livros, itensVendaAceitos] = await Promise.all([
            prisma.cliente.count(),
            prisma.livro.count(),
            prisma.venda.count(),
            prisma.venda.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
            prisma.livro.findMany({
                select: { categoria: true, autor: true },
            }),
            prisma.itemVenda.findMany({
                where: { venda: { status: "Aceita" } },
                select: { quantidade: true, livro: { select: { categoria: true } } },
            }),
        ])

        // livros por categoria
        const livrosPorCategoriaMapa = new Map<string, number>()
        for (const livro of livros) {
            livrosPorCategoriaMapa.set(livro.categoria, (livrosPorCategoriaMapa.get(livro.categoria) ?? 0) + 1)
        }
        const livrosPorCategoria = Array.from(livrosPorCategoriaMapa, ([categoria, quantidade]) => ({ categoria, quantidade }))

        // livros por autor (ordenado do maior pro menor)
        const livrosPorAutorMapa = new Map<string, number>()
        for (const livro of livros) {
            livrosPorAutorMapa.set(livro.autor, (livrosPorAutorMapa.get(livro.autor) ?? 0) + 1)
        }
        const livrosPorAutor = Array.from(livrosPorAutorMapa, ([autor, quantidade]) => ({ autor, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade)

        // livros mais comprados por categoria (soma a quantidade só das propostas Aceitas)
        const maisCompradosPorCategoriaMapa = new Map<string, number>()
        for (const item of itensVendaAceitos) {
            const categoria = item.livro.categoria
            maisCompradosPorCategoriaMapa.set(categoria, (maisCompradosPorCategoriaMapa.get(categoria) ?? 0) + item.quantidade)
        }
        const maisCompradosPorCategoria = Array.from(maisCompradosPorCategoriaMapa, ([categoria, quantidade]) => ({ categoria, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade)

        // propostas por status (Pendente / Aceita / Recusada)
        const propostasPorStatus: Record<string, number> = { Pendente: 0, Aceita: 0, Recusada: 0 }
        for (const grupo of porStatus) {
            propostasPorStatus[grupo.status] = grupo._count._all
        }

        res.status(200).json({
            totais: {
                clientes: totalClientes,
                livros: totalLivros,
                propostas: totalPropostas,
            },
            propostasPorStatus,
            livrosPorCategoria,
            livrosPorAutor,
            maisCompradosPorCategoria,
        })
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router