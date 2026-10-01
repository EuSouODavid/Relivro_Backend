import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { type Prisma } from "../generated/prisma/client";

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hashSenha(senha: string) {
    return bcrypt.hashSync(senha, 12);
}

function gerarTelefone() {
    const ddd = randomInt(11, 99);
    const numero = String(randomInt(100000000, 999999999));
    return `(${ddd})${numero}`;
}

function pick<T>(lista: T[]): T {
    return lista[randomInt(0, lista.length - 1)];
}

function pickStatus(): "Pendente" | "Aceita" | "Recusada" {
    const sorteio = Math.random();
    if (sorteio < 0.35) return "Pendente";
    if (sorteio < 0.75) return "Aceita";
    return "Recusada";
}

const admins: Prisma.AdminCreateManyInput[] = [
    {
        nome: "Admin Relivro",
        email: "admin@relivro.com",
        senha: hashSenha("Admin@123"),
    },
];

const nomesClientes = [
    "Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Farias", "Elisa Rocha",
    "Fábio Nunes", "Gabriela Torres", "Henrique Alves", "Isabela Ramos", "João Pedro Silva",
    "Karina Duarte", "Lucas Martins", "Mariana Costa", "Nicolas Barros", "Olívia Pereira",
    "Paulo Ricardo", "Quésia Santos", "Rafael Vieira", "Sandra Oliveira", "Thiago Cardoso",
]

const cidades = [
    "São Paulo", "Campinas", "Pelotas", "Porto Alegre", "Rio de Janeiro",
    "Curitiba", "Florianópolis", "Belo Horizonte", "Canoas", "Caxias do Sul",
]

const clientes: Prisma.ClienteCreateManyInput[] = nomesClientes.map((nome) => {
    const partes = nome.toLowerCase().split(" ")
    const emailBase = `${partes[0]}.${partes[partes.length - 1]}`
    return {
        nome,
        email: `${emailBase}@exemplo.com`,
        senha: hashSenha("Cliente@123"),
        telefone: gerarTelefone(),
        cidade: pick(cidades),
    }
})

const livrosBase: Omit<Prisma.LivroCreateManyInput, "adminId">[] = [
    { titulo: "O Alquimista", autor: "Paulo Coelho", editora: "Rocco", ano: 1988, categoria: "Ficção", quantidade: randomInt(15, 40), sinopse: ["Um pastor andaluz viaja em busca de um tesouro escondido.", "No caminho, descobre sinais, escolhas e o valor de seguir o próprio sonho."] },
    { titulo: "Brida", autor: "Paulo Coelho", editora: "Rocco", ano: 1990, categoria: "Ficção", quantidade: randomInt(15, 40), sinopse: ["Uma jovem irlandesa busca conhecimento sobre magia e seu propósito de vida."] },
    { titulo: "Dom Casmurro", autor: "Machado de Assis", editora: "Garnier", ano: 1899, categoria: "Clássico", quantidade: randomInt(15, 40), sinopse: ["Bentinho revisita sua juventude e o relacionamento com Capitu.", "A narrativa explora memória, ciúme e ambiguidade."] },
    { titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", editora: "Garnier", ano: 1881, categoria: "Clássico", quantidade: randomInt(15, 40), sinopse: ["Um defunto narra sua própria vida com ironia e melancolia."] },
    { titulo: "Quincas Borba", autor: "Machado de Assis", editora: "Garnier", ano: 1891, categoria: "Clássico", quantidade: randomInt(15, 40), sinopse: ["A trajetória de Rubião, herdeiro de uma fortuna e de uma filosofia peculiar."] },
    { titulo: "1984", autor: "George Orwell", editora: "Secker & Warburg", ano: 1949, categoria: "Distopia", quantidade: randomInt(15, 40), sinopse: ["Um mundo dominado pela vigilância e pelo controle absoluto.", "Winston tenta preservar a liberdade de pensamento em meio à opressão."] },
    { titulo: "A Revolução dos Bichos", autor: "George Orwell", editora: "Secker & Warburg", ano: 1945, categoria: "Distopia", quantidade: randomInt(15, 40), sinopse: ["Animais de uma fazenda se rebelam contra os humanos e criam seu próprio governo."] },
    { titulo: "Admirável Mundo Novo", autor: "Aldous Huxley", editora: "Chatto & Windus", ano: 1932, categoria: "Distopia", quantidade: randomInt(15, 40), sinopse: ["Uma sociedade futura organizada por castas genéticas e controle emocional."] },
    { titulo: "Extraordinário", autor: "R. J. Palacio", editora: "Intrínseca", ano: 2012, categoria: "Juvenil", quantidade: randomInt(15, 40), sinopse: ["A história de August, um garoto que enfrenta o desafio de ser aceito na escola.", "O livro destaca empatia, amizade e convivência."] },
    { titulo: "O Diário de Anne Frank", autor: "Anne Frank", editora: "Contact Publishing", ano: 1947, categoria: "Juvenil", quantidade: randomInt(15, 40), sinopse: ["O relato de uma adolescente escondida durante a Segunda Guerra Mundial."] },
    { titulo: "Percy Jackson e o Ladrão de Raios", autor: "Rick Riordan", editora: "Miramax Books", ano: 2005, categoria: "Fantasia", quantidade: randomInt(15, 40), sinopse: ["Um garoto descobre ser filho de um deus grego e enfrenta uma jornada mitológica."] },
    { titulo: "O Hobbit", autor: "J. R. R. Tolkien", editora: "George Allen & Unwin", ano: 1937, categoria: "Fantasia", quantidade: randomInt(15, 40), sinopse: ["Bilbo Bolseiro embarca numa aventura inesperada rumo à Montanha Solitária."] },
    { titulo: "Harry Potter e a Pedra Filosofal", autor: "J. K. Rowling", editora: "Bloomsbury", ano: 1997, categoria: "Fantasia", quantidade: randomInt(15, 40), sinopse: ["Um garoto descobre ser bruxo e ingressa na Escola de Hogwarts."] },
    { titulo: "Orgulho e Preconceito", autor: "Jane Austen", editora: "T. Egerton", ano: 1813, categoria: "Romance", quantidade: randomInt(15, 40), sinopse: ["Elizabeth Bennet e o Sr. Darcy superam preconceitos em busca do amor."] },
    { titulo: "Razão e Sensibilidade", autor: "Jane Austen", editora: "T. Egerton", ano: 1811, categoria: "Romance", quantidade: randomInt(15, 40), sinopse: ["Duas irmãs enfrentam desilusões amorosas com temperamentos opostos."] },
    { titulo: "A Culpa é das Estrelas", autor: "John Green", editora: "Dutton Books", ano: 2012, categoria: "Romance", quantidade: randomInt(15, 40), sinopse: ["Dois jovens com câncer vivem uma história de amor intensa e breve."] },
    { titulo: "Sapiens: Uma Breve História da Humanidade", autor: "Yuval Noah Harari", editora: "Dvir", ano: 2011, categoria: "Não-ficção", quantidade: randomInt(15, 40), sinopse: ["Uma análise da evolução humana, da era da pedra à revolução digital."] },
    { titulo: "O Poder do Hábito", autor: "Charles Duhigg", editora: "Random House", ano: 2012, categoria: "Não-ficção", quantidade: randomInt(15, 40), sinopse: ["Como hábitos se formam e podem ser transformados, na vida pessoal e nas empresas."] },
    { titulo: "Meditações", autor: "Marco Aurélio", editora: "Domínio Público", ano: 180, categoria: "Não-ficção", quantidade: randomInt(15, 40), sinopse: ["Reflexões estoicas de um imperador romano sobre virtude e autocontrole."] },
    { titulo: "O Iluminado", autor: "Stephen King", editora: "Doubleday", ano: 1977, categoria: "Terror", quantidade: randomInt(15, 40), sinopse: ["Uma família isolada num hotel enfrenta forças sobrenaturais e a loucura."] },
    { titulo: "It: A Coisa", autor: "Stephen King", editora: "Viking Press", ano: 1986, categoria: "Terror", quantidade: randomInt(15, 40), sinopse: ["Um grupo de amigos enfrenta uma entidade maligna que assombra sua cidade."] },
    { titulo: "Drácula", autor: "Bram Stoker", editora: "Archibald Constable", ano: 1897, categoria: "Terror", quantidade: randomInt(15, 40), sinopse: ["O conde Drácula deixa a Transilvânia rumo à Inglaterra, espalhando terror."] },
    { titulo: "A Metamorfose", autor: "Franz Kafka", editora: "Kurt Wolff Verlag", ano: 1915, categoria: "Clássico", quantidade: randomInt(15, 40), sinopse: ["Gregor Samsa acorda transformado num inseto e enfrenta o estranhamento da própria família."] },
    { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", editora: "Reynal & Hitchcock", ano: 1943, categoria: "Juvenil", quantidade: randomInt(15, 40), sinopse: ["Um piloto perdido no deserto encontra um pequeno príncipe vindo de outro planeta."] },
]

const fotosPool = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
]

const comentariosAvaliacao = [
    "Leitura rápida e envolvente.",
    "Muito atual e provocativo.",
    "Recomendo, mudou minha forma de pensar.",
    "Achei um pouco lento no meio, mas o final compensa.",
    "Um dos melhores livros que já li.",
    "Edição bonita, chegou em ótimo estado.",
]

const observacoesProposta = [
    "Tenho interesse nesse livro, aceito combinar a retirada.",
    "Posso pagar via Pix, pode ser?",
    "Gostaria de saber se tem outras edições disponíveis.",
    "É pra presente, preciso até o fim do mês.",
    "Primeira vez comprando aqui, vi a recomendação de um amigo.",
    undefined,
]

const respostasAceita = [
    "Proposta aceita! Entraremos em contato para combinar a entrega.",
    "Aceito, obrigado pelo interesse!",
    "Confirmado, aguarde o contato para retirada.",
]

const respostasRecusada = [
    "Infelizmente não temos mais estoque suficiente no momento.",
    "Proposta recusada, valor abaixo do praticado.",
    "No momento não conseguimos atender essa solicitação.",
]

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
            data: livrosBase.map((livro) => ({
                ...livro,
                adminId: adminsCadastrados[0].id,
            })),
        });
        console.log(`${livros.length} Livro(s) cadastrados...`);

        await prisma.foto.createMany({
            data: livros.map((livro, indice) => ({
                url: fotosPool[indice % fotosPool.length],
                livroId: livro.id,
            })),
        });
        console.log("Fotos cadastradas...");

        const avaliacoes: Prisma.AvaliacaoCreateManyInput[] = Array.from({ length: 20 }, () => ({
            clienteId: pick(clientesCadastrados).id,
            livroId: pick(livros).id,
            nota: randomInt(3, 5),
            comentario: pick(comentariosAvaliacao),
        }));

        await prisma.avaliacao.createMany({ data: avaliacoes });
        console.log(`${avaliacoes.length} Avaliações cadastradas...`);

        let totalVendas = 0;
        for (let i = 0; i < 70; i++) {
            const cliente = pick(clientesCadastrados);
            const livro = pick(livros);
            const status = pickStatus();
            const quantidade = randomInt(1, 3);

            const resposta =
                status === "Aceita" ? pick(respostasAceita) :
                    status === "Recusada" ? pick(respostasRecusada) :
                        null;

            await prisma.venda.create({
                data: {
                    clienteId: cliente.id,
                    observacao: pick(observacoesProposta),
                    resposta,
                    status,
                    itensVendas: {
                        create: [{ livroId: livro.id, quantidade }],
                    },
                },
            });
            totalVendas++;
        }
        console.log(`${totalVendas} Proposta(s) de compra cadastradas...`);
    } catch (error) {
        console.error("Erro nas inclusões (seeds):", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

await main();