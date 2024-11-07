const express = require("express");
const authController = require("./controllers/authController");
const cors = require("cors");
const verifyToken = require("./middleware/verifyToken"); // Importar el middleware
const db = require("./db"); // Importar la conexión a la base de datos
require("dotenv").config();

const app = express();
const corsOptions = {
  origin: "*", // Permite solicitudes solo desde esta URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
};

// Aplicar CORS con las opciones especificadas
app.use(cors(corsOptions));
app.use(express.json());

// Ruta de registro
app.post("/api/register", authController.register);

// Ruta de login
app.post("/api/login", authController.login);

app.get("/api/users", authController.getAllUsers);

app.get("/env", (req, res) => {
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
app.get("/", async (req, res) => {
  try {
    // Realizar una consulta simple a la base de datos
    const result = await db.query("SELECT NOW()"); // Consultar la hora actual en PostgreSQL
    res.send(
      `Conexión exitosa a la base de datos PostgreSQL. Hora actual: ${result.rows[0].now}`
    );
  } catch (error) {
    console.error("Error al conectarse a la base de datos:", error);
    res.status(500).send("Error al conectarse a la base de datos");
  }
});
app.post("/api/shopify", async (req, res) => {
  try {
    const content = req.body; // Capture the incoming JSON

    // Insert the JSON into the shopify_orders table and return the inserted row
    const [result] = await db("shopify").insert({ content }).returning("*");

    console.log("Order saved to the database:", result);

    // Respond with the inserted data
    res.status(201).json({
      message: "Content saved to the database",
      data: result,
    });
  } catch (error) {
    console.error("Error saving content to the database:", error);
    res.status(500).json({ error: "Error saving content" });
  }
});

// Route to get a Shopify order by ID
app.get("/api/shopify/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the URL parameters

  try {
    // Using Knex to query the shopify table by ID
    const result = await db("shopify").where({ id }).first();

    if (!result) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Return the record found
    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving the record:", error);
    res.status(500).json({ error: "Error retrieving the record" });
  }
});


// insertar en tabla shopify orders 

app.post('/api/shopify/orders/:store', async (req, res) => {
  const store = req.params.store;
  const data = req.body; // Body of the request (Shopify order data)

  try {
      // Iterate over each line item in the order
      for (let item of data.line_items) {
          // Insert order details into the shopify_orders table, including all product, customer, and address information
          await  db('shopify_orders').insert({
              order_id: data.id,
              email: data.email,
              order_number: data.order_number,
              total_price: data.total_price,
              subtotal_price: data.subtotal_price,
              total_weight: data.total_weight,
              currency: data.currency,
              financial_status: data.financial_status,
              fulfillment_status: data.fulfillment_status??"sin llenar",
              store: store,
              created_at: data.created_at,
              updated_at: data.updated_at,
              customer_id: data.customer?.id || null,
              customer_first_name: data.customer?.first_name || null,
              customer_last_name: data.customer?.last_name || null,
              customer_email: data.customer?.email || null,
              customer_phone: data.customer?.phone || null,
              shipping_address: data.shipping_address?.address1 || null,
              shipping_city: data.shipping_address?.city || null,
              shipping_zip: data.shipping_address?.zip || null,
              shipping_country: data.shipping_address?.country || null,
              billing_address: data.billing_address?.address1 || null,
              billing_city: data.billing_address?.city || null,
              billing_zip: data.billing_address?.zip || null,
              billing_country: data.billing_address?.country || null,
              product_id: item.id,
              product_title: item.title,
              product_quantity: item.quantity,
              product_price: item.price,
              product_weight: item.weight||data.total_weight
          });

          // Log if the order was saved successfully
          console.log(`Order ${data.id} saved to the database`);
          
      }

      // Send a success response
      res.status(200).json({
          message: 'Webhook received successfully',
          store: store,
          order: data.id, // Return the last processed order ID
      });
  } catch (error) {
    console.log(error);
    
      res.status(500).json({ error: 'Error saving the order' });
  }
});

// Ruta protegida: solo se accede si el token es válido
app.get("/api/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "Acceso permitido", user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
