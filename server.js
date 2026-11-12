const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/images', express.static('public/images'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'ecommerce'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

app.post('/products', upload.single('image'), (req, res) => {
  const { name, price, category } = req.body;

  const image = req.file ? req.file.filename : '';

  const sql =
    'INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)';

  db.query(sql, [name, price, image, category], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: 'Product added',
      id: result.insertId,
    });
  });
});

app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.put('/products/:id', (req, res) => {
  const { name, price } = req.body;
  const id = req.params.id;
  const sql = 'UPDATE products SET name=?, price=? WHERE id=?';
  db.query(sql, [name, price, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Product updated' });
  });
});

app.delete('/products/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM products WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Product deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

