import express from 'express'
import cors from 'cors'

import routesLivros from './routes/livros'
import routesClientes from './routes/clientes'   
import routesLogin from './routes/login'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.use("/livros", routesLivros)
app.use("/clientes", routesClientes)  
app.use("/clientes/login", routesLogin) 

app.get('/', (req, res) => {
  res.send('API: ReLivro')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})