import { prisma } from "../lib/prisma";
import { type Prisma } from "../generated/prisma/client";

const admins: Prisma.AdminCreateManyInput[] = [
    {
        nome: "Admin Relivro",
        email: "admin@relivro.com",
        senha: "admin123",
    },
];

const clientes: Prisma.ClienteCreateManyInput[] = [
    {
        nome: "Ana Souza",
        email: "ana.souza@exemplo.com",
        senha: "cliente123",
        telefone: "11999990001",
        cidade: "São Paulo",
    },
    {
        nome: "Bruno Lima",
        email: "bruno.lima@exemplo.com",
        senha: "cliente123",
        telefone: "11999990002",
        cidade: "Campinas",
    },
];

async function main() {
    try {
        await prisma.itemVenda.deleteMany();
        await prisma.venda.deleteMany();
        await prisma.avaliacao.deleteMany();
        await prisma.foto.deleteMany();
        await prisma.livro.deleteMany();
        await prisma.cliente.deleteMany();
        await prisma.admin.deleteMany();

        const adminsCadastrados = await prisma.admin.createManyAndReturn({
            data: admins,
        });
        console.log(`${adminsCadastrados.length} Admin(s) cadastrados...`);

        const clientesCadastrados = await prisma.cliente.createManyAndReturn({
            data: clientes,
        });
        console.log(`${clientesCadastrados.length} Cliente(s) cadastrados...`);

        const livros = await prisma.livro.createManyAndReturn({
            data: [
                {
                    titulo: "O Alquimista",
                    autor: "Paulo Coelho",
                    editora: "Rocco",
                    ano: 1988,
                    categoria: "Ficção",
                    sinopse: [
                        "Um pastor andaluz viaja em busca de um tesouro escondido.",
                        "No caminho, descobre sinais, escolhas e o valor de seguir o próprio sonho.",
                    ],
                    quantidade: 8,
                    adminId: adminsCadastrados[0].id,
                },
                {
                    titulo: "Dom Casmurro",
                    autor: "Machado de Assis",
                    editora: "Garnier",
                    ano: 1899,
                    categoria: "Clássico",
                    sinopse: [
                        "Bentinho revisita sua juventude e o relacionamento com Capitu.",
                        "A narrativa explora memória, ciúme e ambiguidade.",
                    ],
                    quantidade: 5,
                    adminId: adminsCadastrados[0].id,
                },
                {
                    titulo: "1984",
                    autor: "George Orwell",
                    editora: "Secker & Warburg",
                    ano: 1949,
                    categoria: "Distopia",
                    sinopse: [
                        "Um mundo dominado pela vigilância e pelo controle absoluto.",
                        "Winston tenta preservar a liberdade de pensamento em meio à opressão.",
                    ],
                    quantidade: 10,
                    adminId: adminsCadastrados[0].id,
                },
                {
                    titulo: "Extraordinário",
                    autor: "R. J. Palacio",
                    editora: "Intrínseca",
                    ano: 2012,
                    categoria: "Juvenil",
                    sinopse: [
                        "A história de August, um garoto que enfrenta o desafio de ser aceito na escola.",
                        "O livro destaca empatia, amizade e convivência.",
                    ],
                    quantidade: 12,
                    adminId: adminsCadastrados[0].id,
                },
            ],
        });
        console.log(`${livros.length} Livro(s) cadastrados...`);

        await prisma.foto.createMany({
            data: [
                {
                    url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80",
                    livroId: livros[0].id,
                },
                {
                    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
                    livroId: livros[1].id,
                },
                {
                    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
                    livroId: livros[2].id,
                },
                {
                    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
                    livroId: livros[3].id,
                },
            ],
        });
        console.log("Fotos cadastradas...");

        await prisma.avaliacao.createMany({
            data: [
                {
                    clienteId: clientesCadastrados[0].id,
                    livroId: livros[0].id,
                    nota: 5,
                    comentario: "Leitura rápida e envolvente.",
                },
                {
                    clienteId: clientesCadastrados[1].id,
                    livroId: livros[2].id,
                    nota: 4,
                    comentario: "Muito atual e provocativo.",
                },
            ],
        });
        console.log("Avaliações cadastradas...");

        const venda = await prisma.venda.create({
            data: {
                clienteId: clientesCadastrados[0].id,
                valor: 104.9,
                status: "Pendente",
            },
        });

        await prisma.itemVenda.createMany({
            data: [
                {
                    vendaId: venda.id,
                    livroId: livros[0].id,
                    quantidade: 1,
                    valor: 54.9,
                },
                {
                    vendaId: venda.id,
                    livroId: livros[3].id,
                    quantidade: 1,
                    valor: 50,
                },
            ],
        });
        console.log("Venda e itens cadastrados...");
    } catch (error) {
        console.error("Erro nas inclusões (seeds):", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

await main();
