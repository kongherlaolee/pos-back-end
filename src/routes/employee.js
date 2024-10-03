const express = require("express");
const router = express.Router();
const db = require("./db"); // Assuming db.js handles MySQL connection setup

// Get all employees
router.get("/api/employees", (req, res) => {
  const query = "SELECT * FROM employees";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    res.json(results);
  });
});

// Add a new employee
router.post("/api/employees", (req, res) => {
  const { code, name, phone, department, position } = req.body;
  const query = "INSERT INTO employees (code, name, phone, department, position) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [code, name, phone, department, position], (err, result) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    res.status(201).json({ id: result.insertId, code, name, phone, department, position });
  });
});

// Update an employee
router.put("/api/employees/:id", (req, res) => {
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
router.delete("/api/employees/:id", (req, res) => {
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

module.exports = router;
