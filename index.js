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

db.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
  } else {
    console.log('Conectado a MySQL en Railway');
    db.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        contrasena VARCHAR(100) NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error al crear tabla:', err);
      else console.log('Tabla "sesiones" lista');
    });
  }
});

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

app.get('/sesiones', (req, res) => {
  db.query('SELECT * FROM sesiones', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.put('/sesiones/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, contrasena } = req.body;
  db.query(
    'UPDATE sesiones SET nombre = ?, contrasena = ? WHERE id = ?',
    [nombre, contrasena, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Sesión actualizada' });
    }
  );
});

app.delete('/sesiones/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM sesiones WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Sesión eliminada' });
  });
});

let sesionActiva = null;

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM sesiones WHERE nombre = ? AND contrasena = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ mensaje: 'Error en el servidor' });
      if (results.length === 0) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }
      sesionActiva = results[0];
      res.json({ mensaje: 'Inicio de sesión exitoso' });
    }
  );
});

app.get('/perfil', (req, res) => {
  if (!sesionActiva) {
    return res.status(401).json({ mensaje: 'No hay sesión activa' });
  }
  res.json({
    usuario: sesionActiva.nombre,
    sesion_activa: true
  });
});

app.post('/logout', (req, res) => {
  if (!sesionActiva) {
    return res.status(400).json({ mensaje: 'No hay sesión para cerrar' });
  }
  sesionActiva = null;
  res.json({ mensaje: 'Sesión cerrada correctamente' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

