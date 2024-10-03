const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // For file uploads
const path = require('path');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update if there's a password
    database: 'pos-back-end',
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Route: User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }

        if (results.length > 0) {
            res.status(200).json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(400).json({ message: 'Invalid email or passwordm' });
        }
    });
});
//register
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
  
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, password], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  });
  // Get all employees
app.get("/api/employees", (req, res) => {
    db.query("SELECT * FROM employees", (err, results) => {
      if (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send("Internal server error");
      } else {
        res.json(results);
      }
    });
  });

// Add a new employee
app.post("/api/employees", (req, res) => {
    const { code, name, phone, department, position } = req.body;
  
    if (!code || !name || !phone || !department || !position) {
      return res.status(400).send("Please provide all required fields");
    }
  
    const sql = "INSERT INTO employees (code, name, phone, department, position) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [code, name, phone, department, position], (err, result) => {
      if (err) {
        console.error("Error inserting employee:", err);
        res.status(500).send("Internal server error");
      } else {
        res.status(201).send("Employee added successfully");
      }
    });
  });

  // Update an employee
app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const { code, name, phone, department, position } = req.body;
  const query = "UPDATE employees SET code = ?, name = ?, phone = ?, department = ?, position = ? WHERE id = ?";
  db.query(query, [code, name, phone, department, position, id], (err, result) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ id, code, name, phone, department, position });
  });
});

// Delete an employee
app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM employees WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted" });
  });
});

 

// Route: File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const sql = 'INSERT INTO uploads (filename, filepath) VALUES (?, ?)';
    db.query(sql, [req.file.originalname, filePath], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.status(200).json({ message: 'File uploaded successfully', filePath });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
