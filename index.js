const express = require('express');
const authController = require('./controllers/authController');
const cors = require('cors');
const verifyToken = require('./middleware/verifyToken'); // Importar el middleware
const db = require('./db'); // Importar la conexión a la base de datos
require('dotenv').config();

const app = express();
const corsOptions = {
  origin:  '*', // Permite solicitudes solo desde esta URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

// Aplicar CORS con las opciones especificadas
app.use(cors(corsOptions));
app.use(express.json());

// Ruta de registro
app.post('/api/register', authController.register);


// Ruta de login
app.post('/api/login', authController.login);



app.get('/api/users', authController.getAllUsers);

app.get('/env', (req, res) => {
    res.send(`
      <h1>Variables de Entorno</h1>
      <ul>
        <li>POSTGRES_USER: ${process.env.POSTGRES_USER}</li>
        <li>POSTGRES_HOST: ${process.env.POSTGRES_HOST}</li>
        <li>POSTGRES_DATABASE: ${process.env.POSTGRES_DATABASE}</li>
        <li>POSTGRES_PASSWORD: ${process.env.POSTGRES_PASSWORD}</li>
        <li>DATABASE_URL: ${process.env.DATABASE_URL}</li>
        <li>JWT_SECRET: ${process.env.JWT_SECRET}</li>
      </ul>
    `);
  });
app.get('/', async (req, res) => {
    try {
      // Realizar una consulta simple a la base de datos
      const result = await db.query('SELECT NOW()');  // Consultar la hora actual en PostgreSQL
      res.send(`Conexión exitosa a la base de datos PostgreSQL. Hora actual: ${result.rows[0].now}`);
    } catch (error) {
      console.error('Error al conectarse a la base de datos:', error);
      res.status(500).send('Error al conectarse a la base de datos');
    }
  });
  app.post('/api/shopify', (req, res) => {
    console.log('Body recibido:', req.body); // Loguea el contenido del body en la consola
    res.status(200).send('Webhook recibido');
});
// Ruta protegida: solo se accede si el token es válido
app.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Acceso permitido', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
