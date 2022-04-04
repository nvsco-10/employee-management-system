const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const questions = [
    {
        type: "list",
        name: "task",
        message: "What would you like to do?",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Exit"
        ]
    }
];

async function loadDb() {
    const result = await inquirer.prompt(questions);

    switch(result.task) {
        case "View all departments":
            viewDepartments();
            break;
        case "View all roles":
            viewRoles();
            break;
        case "View all employees":
            viewEmployees();
            break;      
        case "Add a department":
            addDepertment();
            break;     
        case "Add a role":
            addRole();
            break;  
        case "Add an employee":
            addEmployee();
            break;  
        case "Update an employee role":
            updateRole();
            break;
        case "Exit":
            return '';
            break;    
    }
}

loadDb();

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
  