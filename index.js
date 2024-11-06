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
  app.post('/api/shopify', async (req, res) => {
    try {
        const content = req.body; // Captura el JSON recibido en el body

        // Inserta el JSON en la tabla `shopify`
        const result = await db.query(
            'INSERT INTO shopify (content) VALUES ($1) RETURNING *',
            [content]
        );

        console.log('JSON guardado en la base de datos:', result.rows[0]);

        // Responde con el registro insertado
        res.status(201).json({
            message: 'Contenido guardado en la base de datos',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al guardar el JSON en la base de datos:', error);
        res.status(500).json({ error: 'Error al guardar el contenido' });
    }
});
// Ruta para obtener un registro por ID
app.get('/api/shopify/:id', async (req, res) => {
  const { id } = req.params; // Extrae el ID de los parámetros de la URL

  try {
      // Consulta para obtener el registro por ID
      const result = await db.query('SELECT * FROM shopify WHERE id = $1', [id]);

      if (result.rows.length === 0) {
          // Si no se encuentra el registro, responde con un mensaje de error
          return res.status(404).json({ error: 'Registro no encontrado' });
      }

      // Retorna el registro encontrado
      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Error al obtener el registro:', error);
      res.status(500).json({ error: 'Error al obtener el registro' });
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
