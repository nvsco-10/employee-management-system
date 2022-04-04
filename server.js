const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'pineapple',
        database: 'employee_db'
    },
    console.log('Connected to the employee_db database.')
);

// db.query('SELECT * FROM employee', (err, results) => {
//     console.log(results);
// })

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  