const db = require('../config/db'); // Import MySQL connection

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';

    try {
        const [rows] = await db.query(sql, [email, password]);
        if (rows.length > 0) {
            res.status(200).json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err });
    }
};

// Register User
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';

    try {
        await db.query(sql, [email, password]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err });
    }
};
