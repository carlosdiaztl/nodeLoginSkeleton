const express = require('express');
const authController = require('./controllers/authController');
const verifyToken = require('./middleware/verifyToken'); // Importar el middleware
require('dotenv').config();

const app = express();
app.use(express.json());

// Ruta de registro
app.post('/api/register', authController.register);


// Ruta de login
app.post('/api/login', authController.login);

app.get('/api/users', authController.getAllUsers);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Ruta protegida: solo se accede si el token es válido
app.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Acceso permitido', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
