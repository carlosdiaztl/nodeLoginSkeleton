const express = require('express');
const authController = require('./controllers/authController');
const verifyToken = require('./middleware/verifyToken'); // Importar el middleware
const db = require('./db'); // Importar la conexión a la base de datos
require('dotenv').config();

const app = express();
app.use(express.json());

// Ruta de registro
app.post('/api/register', authController.register);


// Ruta de login
app.post('/api/login', authController.login);

app.get('/api/users', authController.getAllUsers);

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

// Ruta protegida: solo se accede si el token es válido
app.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Acceso permitido', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
