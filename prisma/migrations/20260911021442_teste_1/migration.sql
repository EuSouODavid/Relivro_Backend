-- CreateEnum
CREATE TYPE "status" AS ENUM ('Pendente', 'Vendido');

-- CreateTable
CREATE TABLE "fotos" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "livroId" INTEGER NOT NULL,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livros" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(45) NOT NULL,
    "autor" VARCHAR(45) NOT NULL,
    "editora" VARCHAR(45) NOT NULL,
    "ano" INTEGER NOT NULL,
    "categoria" VARCHAR(30) NOT NULL,
    "sinopse" TEXT[],
    "quantidade" INTEGER NOT NULL,
    "adminId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Livros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" VARCHAR(36) NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "senha" VARCHAR(60) NOT NULL,
    "telefone" CHAR(13) NOT NULL,
    "cidade" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" SERIAL NOT NULL,
    "clienteId" VARCHAR(36) NOT NULL,
    "livroId" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" VARCHAR(36) NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "senha" VARCHAR(60) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" SERIAL NOT NULL,
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "status" NOT NULL DEFAULT 'Pendente',
    "clienteId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itemVenda" (
    "id" SERIAL NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "livroId" INTEGER NOT NULL,

    CONSTRAINT "itemVenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livros" ADD CONSTRAINT "Livros_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemVenda" ADD CONSTRAINT "itemVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemVenda" ADD CONSTRAINT "itemVenda_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
