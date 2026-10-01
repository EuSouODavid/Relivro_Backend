import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { requireAdmin } from "../middlewares/requireAdmin"
 
const router = Router()
 
const compraSchema = z.object({
    clienteId: z.string().min(1, { message: "clienteId é obrigatório" }),
    livroId: z.number().int({ message: "livroId deve ser um número inteiro" }),
    quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que zero" }),
    observacao: z.string().max(255).optional(),
})
 
// admin respondendo a uma proposta (aceitar/recusar, com justificativa opcional)
const respostaSchema = z.object({
    status: z.enum(["Aceita", "Recusada"]),
    resposta: z.string().max(255).optional(),
})
 
// cliente editando a própria proposta (só quantidade/observação)
const edicaoClienteSchema = z.object({
    clienteId: z.string().min(1, { message: "clienteId é obrigatório" }),
    quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que zero" }).optional(),
    observacao: z.string().max(255).optional(),
})
 
// cliente cancelando a própria proposta
const cancelamentoSchema = z.object({
    clienteId: z.string().min(1, { message: "clienteId é obrigatório" }),
})
 
const STATUS_VALIDOS = ["Pendente", "Aceita", "Recusada"] as const
 
// achata a Venda + o (único) itemVenda dela no formato que o front espera
function formataCompra(venda: any) {
    const item = venda.itensVendas[0]
    return {
        id: venda.id,
        clienteId: venda.clienteId,
        cliente: venda.cliente
            ? {
                id: venda.cliente.id,
                nome: venda.cliente.nome,
                email: venda.cliente.email,
                cidade: venda.cliente.cidade,
            }
            : undefined,
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
        const venda = await prisma.$transaction(async (tx) => {
 
            const livro = await tx.livro.findUnique({
                where: { id: livroId },
            })
 
            if (!livro) {
                throw new Error("Livro não encontrado")
            }
 
            if (livro.quantidade < quantidade) {
                throw new Error(
                    `Estoque insuficiente. Disponível: ${livro.quantidade}`
                )
            }
 
            const novaVenda = await tx.venda.create({
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
 
            await tx.livro.update({
                where: { id: livroId },
                data: {
                    quantidade: {
                        decrement: quantidade,
                    },
                },
            })
 
            return novaVenda
        })
 
        res.status(201).json(formataCompra(venda))
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})
 
// GET /compras — todas as propostas/vendas (visão do admin), com filtro
// opcional por status (usado pela tela Propostas: ?status=Pendente, e pela
// tela Vendas: ?status=Aceita).
router.get("/", requireAdmin, async (req, res) => {
    const statusQuery = req.query.status
    const status = STATUS_VALIDOS.includes(statusQuery as any)
        ? (statusQuery as (typeof STATUS_VALIDOS)[number])
        : undefined
 
    try {
        const vendas = await prisma.venda.findMany({
            where: status ? { status } : undefined,
            include: {
                cliente: true,
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
 
// PUT /compras/:id — admin aceita ou recusa uma proposta Pendente.
// Ao recusar, devolve pro estoque a quantidade que tinha sido reservada
// na hora da proposta (o POST já decrementa o estoque na criação).
router.put("/:id", requireAdmin, async (req, res) => {
    const { id } = req.params
 
    const valida = respostaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
 
    const { status, resposta } = valida.data
 
    try {
        const vendaAtualizada = await prisma.$transaction(async (tx) => {
            const venda = await tx.venda.findUnique({
                where: { id: Number(id) },
                include: { itensVendas: true },
            })
 
            if (!venda) {
                throw new Error("Proposta não encontrada")
            }
 
            if (venda.status !== "Pendente") {
                throw new Error("Essa proposta já foi respondida")
            }
 
            if (status === "Recusada") {
                for (const item of venda.itensVendas) {
                    await tx.livro.update({
                        where: { id: item.livroId },
                        data: { quantidade: { increment: item.quantidade } },
                    })
                }
            }
 
            return tx.venda.update({
                where: { id: Number(id) },
                data: { status, resposta },
                include: {
                    cliente: true,
                    itensVendas: {
                        include: { livro: { include: { fotos: true } } },
                    },
                },
            })
        })
 
        res.status(200).json(formataCompra(vendaAtualizada))
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})
 
// DELETE /compras/:id — exclui um registro (usado na tela Vendas, pra
// remover uma venda já Aceita). Não devolve estoque — é só remoção do
// registro, não um "cancelamento" de venda.
router.delete("/:id", async (req, res) => {
    const { id } = req.params
 
    try {
        await prisma.$transaction(async (tx) => {
            await tx.itemVenda.deleteMany({ where: { vendaId: Number(id) } })
            await tx.venda.delete({ where: { id: Number(id) } })
        })
 
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})
 
// PATCH /compras/:id — o próprio cliente edita a quantidade e/ou a
// observação da proposta, só enquanto ela está Pendente. Se a quantidade
// mudar, ajusta o estoque do livro pela diferença (e barra se não tiver
// estoque suficiente pra um aumento).
router.patch("/:id", async (req, res) => {
    const { id } = req.params
 
    const valida = edicaoClienteSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
 
    const { clienteId, quantidade, observacao } = valida.data
 
    try {
        const vendaAtualizada = await prisma.$transaction(async (tx) => {
            const venda = await tx.venda.findUnique({
                where: { id: Number(id) },
                include: { itensVendas: true },
            })
 
            if (!venda) {
                throw new Error("Proposta não encontrada")
            }
 
            if (venda.clienteId !== clienteId) {
                throw new Error("Essa proposta não pertence a esse cliente")
            }
 
            if (venda.status !== "Pendente") {
                throw new Error("Só é possível editar uma proposta pendente")
            }
 
            const item = venda.itensVendas[0]
 
            if (quantidade !== undefined && item && quantidade !== item.quantidade) {
                const diferenca = quantidade - item.quantidade // > 0 = precisa reservar mais estoque
 
                if (diferenca > 0) {
                    const livro = await tx.livro.findUnique({ where: { id: item.livroId } })
                    if (!livro || livro.quantidade < diferenca) {
                        throw new Error(`Estoque insuficiente. Disponível: ${livro?.quantidade ?? 0}`)
                    }
                }
 
                await tx.livro.update({
                    where: { id: item.livroId },
                    data: { quantidade: { decrement: diferenca } },
                })
 
                await tx.itemVenda.update({
                    where: { id: item.id },
                    data: { quantidade },
                })
            }
 
            return tx.venda.update({
                where: { id: Number(id) },
                data: { observacao },
                include: {
                    cliente: true,
                    itensVendas: {
                        include: { livro: { include: { fotos: true } } },
                    },
                },
            })
        })
 
        res.status(200).json(formataCompra(vendaAtualizada))
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})
 
// DELETE /compras/:id/cancelar — o próprio cliente cancela uma proposta
// Pendente. Diferente do DELETE /compras/:id (usado pelo admin pra
// remover uma venda já Aceita): aqui devolve pro estoque a quantidade que
// tinha sido reservada na criação da proposta.
router.delete("/:id/cancelar", async (req, res) => {
    const { id } = req.params
 
    const valida = cancelamentoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
 
    const { clienteId } = valida.data
 
    try {
        await prisma.$transaction(async (tx) => {
            const venda = await tx.venda.findUnique({
                where: { id: Number(id) },
                include: { itensVendas: true },
            })
 
            if (!venda) {
                throw new Error("Proposta não encontrada")
            }
 
            if (venda.clienteId !== clienteId) {
                throw new Error("Essa proposta não pertence a esse cliente")
            }
 
            if (venda.status !== "Pendente") {
                throw new Error("Só é possível cancelar uma proposta pendente")
            }
 
            for (const item of venda.itensVendas) {
                await tx.livro.update({
                    where: { id: item.livroId },
                    data: { quantidade: { increment: item.quantidade } },
                })
            }
 
            await tx.itemVenda.deleteMany({ where: { vendaId: Number(id) } })
            await tx.venda.delete({ where: { id: Number(id) } })
        })
 
        res.status(204).send()
    } catch (error: any) {
        res.status(400).json({ erro: error.message })
    }
})
 
export default router