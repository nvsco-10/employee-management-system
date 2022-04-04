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

async function loadTasks() {
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

loadTasks();

function viewRoles() {
    const query = 'SELECT role.id, role.title, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id = department.id';

    db.query(query, (err, results) => {
        console.table(results);
    })
}

function viewDepartments() {
    db.query('SELECT id, name FROM department', (err, results) => {
        console.table(results);
    })

    loadTasks();
}

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'pineapple',
        database: 'employee_db'
    },
    console.log('Connected to the employee_db database.')
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  