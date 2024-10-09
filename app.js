const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing
const dotenv = require('dotenv'); // For environment variables

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
    },
});
const upload = multer({ storage });

// Route: User Login with password hashing
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }

        if (results.length > 0) {
            // Compare the entered password with the stored hashed password
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Error comparing passwords' });
                }

                if (isMatch) {
                    res.status(200).json({ message: 'Login successful', user: results[0] });
                } else {
                    res.status(400).json({ message: 'Invalid email or password' });
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    });
});

// Route: Register User with password hashing
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    // Hash the password before storing
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }
        const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(sql, [email, hash], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
});

// Route: Get all employees
app.get('/api/employees', (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            res.status(500).send('Internal server error');
        } else {
            res.json(results);
        }
    });
});

// Route: Add a new employee
app.post('/api/employees', (req, res) => {
    const { code, name, phone, department, position } = req.body;

    if (!code || !name || !phone || !department || !position) {
        return res.status(400).send('Please provide all required fields');
    }

    const sql = 'INSERT INTO employees (code, name, phone, department, position) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [code, name, phone, department, position], (err, result) => {
        if (err) {
            console.error('Error inserting employee:', err);
            res.status(500).send('Internal server error');
        } else {
            res.status(201).send('Employee added successfully');
        }
    });
});

// Route: Update an employee
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { code, name, phone, department, position } = req.body;
    const query = 'UPDATE employees SET code = ?, name = ?, phone = ?, department = ?, position = ? WHERE id = ?';

    db.query(query, [code, name, phone, department, position, id], (err, result) => {
        if (err) {
            return res.status(500).send('Server Error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully', id, code, name, phone, department, position });
    });
});

// Route: Delete an employee
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM employees WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).send('Server Error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    });
});

// Route: Get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

// Route: Get a product by ID
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// Route: Add a new product
app.post('/api/products', (req, res) => {
    const { code, name, price, quantity, status } = req.body;
    if (!code || !name || !price || !quantity || !status) {
        return res.status(400).send('Please provide all required fields');
    }

    db.query(
        'INSERT INTO products (code, name, price, quantity, status) VALUES (?, ?, ?, ?, ?)',
        [code, name, price, quantity, status],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.status(201).json({ message: 'Product added successfully', productId: results.insertId });
        }
    );
});

// Route: Update a product
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { code, name, price, quantity, status } = req.body;
    db.query(
        'UPDATE products SET code = ?, name = ?, price = ?, quantity = ?, status = ? WHERE id = ?',
        [code, name, price, quantity, status, id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json({ message: 'Product updated successfully' });
        }
    );
});

// Route: Delete a product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
