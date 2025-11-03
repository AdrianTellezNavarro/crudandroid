const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'hopper.proxy.rlwy.net',
  user: 'root',
  password: 'yzHkxMSnvLivABaPqzQyQcFqCzpSbYXE',
  database: 'railway',
  port: 12592
});

// 🔧 BLOQUE TEMPORAL: Crear tabla si no existe
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL en Railway');

    db.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        contrasena VARCHAR(100) NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error al crear la tabla:', err);
      } else {
        console.log('Tabla "sesiones" creada o ya existe');
      }
    });
  }
});

// 📥 Endpoint para guardar sesión
app.post('/sesiones', (req, res) => {
  const { nombre, contrasena } = req.body;
  db.query(
    'INSERT INTO sesiones (nombre, contrasena) VALUES (?, ?)',
    [nombre, contrasena],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Sesión guardada', id: result.insertId });
    }
  );
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
