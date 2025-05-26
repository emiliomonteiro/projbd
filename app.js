const express = require('express');
const cors = require('cors');

const comentariosRoute = require('./routes/comentarios');
const dashboardRoute = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use('/comentarios', comentariosRoute);
app.use('/dashboard', dashboardRoute);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
