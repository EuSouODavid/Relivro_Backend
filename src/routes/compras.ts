import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const compraSchema = z.object({
    clienteId: z.string().min(1, { message: "clienteId é obrigatório" }),
    livroId: z.number().int({ message: "livroId deve ser um número inteiro" }),
    quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que zero" }),
    observacao: z.string().max(255).optional(),
})

// achata a Venda + o (único) itemVenda dela no formato que o front espera
function formataCompra(venda: any) {
    const item = venda.itensVendas[0]
    return {
        id: venda.id,
        clienteId: venda.clienteId,
        livroId: item?.livroId ?? null,
        livro: item?.livro ?? null,
        quantidade: item?.quantidade ?? null,
        valor: item?.valor ?? venda.valor,
        observacao: venda.observacao,
        resposta: venda.resposta,
        status: venda.status,
        createdAt: venda.dataVenda,
        updatedAt: null,
    }
}

router.post("/", async (req, res) => {
    const valida = compraSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { clienteId, livroId, quantidade, observacao } = valida.data

    try {
        const venda = await prisma.venda.create({
            data: {
                clienteId,
                observacao,
                itensVendas: {
                    create: [{ livroId, quantidade }],
                },
            },
            include: {
                itensVendas: {
                    include: { livro: { include: { fotos: true } } },
                },
            },
        })

        res.status(201).json(formataCompra(venda))
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.get("/:clienteId", async (req, res) => {
    const { clienteId } = req.params

    try {
        const vendas = await prisma.venda.findMany({
            where: { clienteId },
            include: {
                itensVendas: {
                    include: { livro: { include: { fotos: true } } },
                },
            },
            orderBy: { id: "desc" },
        })

        res.status(200).json(vendas.map(formataCompra))
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router