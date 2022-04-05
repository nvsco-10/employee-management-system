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
            addDepartment();
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

// TO DO : ADD EMPLOYEE FUNCTION

async function updateRole() {
    
    const employeeResults = await db.promise().query('SELECT id, first_name, last_name FROM employee');
    const employees = employeeResults[0].map(({ id, first_name, last_name }) => ({ value: id, name: `${first_name} ${last_name}` }))
    console.log(employees);

    const rolesResults = await db.promise().query('SELECT id, title FROM role');
    const roles = rolesResults[0].map(({ id, title }) => ({ value: id, name: title }))
    console.log(roles);


    const result = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee's role do you want to update?",
            choices: employees
        },
        {
            type: 'list',
            name: 'role',
            message: "Which role do you want to assign the selected employee?",
            choices: roles
        },

    ])

    const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
    db.query(query, [result.role, result.employee], (err, results) => {
        if(err) {
            throw err;
        } else {
            console.log('Successfully updated role.');
            viewEmployees();
        }
    })
}

async function addRole() {
    const result = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the name of the role you would like to add?",
            validate: title => {
                if (title) {
                    return true;
                } else {
                    return 'Please enter a role.';
                }
            }
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary for this role?",
            validate: salary => {
                if (isNaN(salary)) {
                    return 'Please enter an amount';
                } else {
                    return true;
                }
            }
        }
    ]);

    const searchDept = 'SELECT * FROM department'
    const searchResults = await db.promise().query(searchDept);
    const departments = searchResults[0].map(({ id, name }) => ({value: id, name: name}));
    console.log(departments);

    const askDept = await inquirer.prompt([
        {
            type: 'list',
            name: 'dept',
            message: "Which department does this role belong to?",
            choices: departments
        }
    ])

    const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
    db.query(query, [result.title, result.salary, askDept.dept], (err, results) => {
        if(err) {
            throw err;
        } else {
            console.log(`Successfully added new role: ${result.title}.`);
            viewRoles();
        }
    })
}

async function addDepartment() {
    const result = await inquirer.prompt([
        {
            type: "input",
            name: "dept",
            message: "What department would you like to add?",
            validate: dept => {
                if (dept) {
                    return true;
                } else {
                    return 'Please enter a department name';
                }
            }
        }
    ]);

    const query = 'INSERT INTO department (name) VALUES (?)';
    db.query(query, result.dept, (err, results) => {
        if(err) {
            throw err;
        } else {
            console.log(`Successfully added new department: ${result.dept}.`);
            viewDepartments();
        }
    })

}

function viewEmployees() {
    //TO DO: SHOW MANAGER NAME INSTEAD OF ID!!
    const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title AS title, department.name AS department, role.salary, employee.manager_id AS manager FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id';

    db.query(query, (err, results) => {
        console.table(results);
    })
}

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
  