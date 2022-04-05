const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

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
            "View employees by department",
            "View department budget",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Delete department",
            "Delete role",
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
        case "View employees by department":
            viewByDept();
            break;
        case "View department budget":
            viewBudget();
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
        case "Delete department":
            deleteDept();
            break;
        case "Delete role":
            deleteRole();
            break;
        case "Exit":
            exitDb(); 
    }
}

async function deleteRole() {
    const rolesResults = await db.promise().query('SELECT id, title FROM role');
    const roles = rolesResults[0].map(({ id, title }) => ({ value: id, name: title }));

    const result = await inquirer.prompt([
        {
            type: "list",
            name: "role",
            message: "Which role would you like to delete?",
            choices: roles
        }
    ])

    const query = 'DELETE FROM role WHERE id = ?';

    db.query(query, result.role, (err,results) => {
        if(err) throw err;

        console.log("Successfully deleted role!")
        viewRoles();
    })
}

async function deleteDept() {
    const deptResults = await db.promise().query('SELECT id, name FROM department');
    const departments = deptResults[0].map(({ id, name }) => ({ value: id, name: name }));

    const result = await inquirer.prompt([
        {
            type: "list",
            name: "dept",
            message: "Which department would you like to delete?",
            choices: departments
        }
    ])

    const query = 'DELETE FROM department WHERE id = ?';

    db.query(query, result.dept, (err,results) => {
        if(err) throw err;

        console.log("Successfully deleted department!")
        viewDepartments();
    })
}

async function viewByDept() {
    const deptResults = await db.promise().query('SELECT id, name FROM department');
    const departments = deptResults[0].map(({ id, name }) => ({ value: id, name: name }))

    const result = await inquirer.prompt([
        {
            type: "list",
            name: "dept",
            message: "Which department would you like to view?",
            choices: departments
        }
    ])

    const query = 'SELECT CONCAT(employee.first_name, " ", employee.last_name) AS employee, title AS role FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.id = ?';

    db.query(query, result.dept, (err,results) => {
        if(err) throw err;

        console.table(results);
        loadTasks();
    })
}

function viewBudget() {
    const query = 'SELECT name as department, COUNT(employee.role_id) AS employees, SUM(salary) AS "total utilized budget" FROM department JOIN role ON department.id = role.department_id JOIN employee ON employee.role_id = role.id GROUP by name'

    db.query(query, (err,results) => {
        if (err) throw err;

        console.table(results);
        loadTasks();
    })
}

async function updateRole() {
    
    const employeeResults = await db.promise().query('SELECT id, first_name, last_name FROM employee');
    const employees = employeeResults[0].map(({ id, first_name, last_name }) => ({ value: id, name: `${first_name} ${last_name}` }))

    const rolesResults = await db.promise().query('SELECT id, title FROM role');
    const roles = rolesResults[0].map(({ id, title }) => ({ value: id, name: title }))


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

        if(err) throw err;
       
        console.log('Successfully updated role!');
        viewEmployees();
        
    })
}

async function addEmployee() {
    const result = await inquirer.prompt([
        {
            type: "input",
            name: "first",
            message: "What is the employee's first name?",
            validate: first => first ? true : 'Please enter a first name'
        },
        {
            type: "input",
            name: "last",
            message: "What is the employee's last name?",
            validate: last => last ? true : 'Please enter a last name'
        }
    ])

    const rolesResults = await db.promise().query('SELECT id, title FROM role');
    const roles = rolesResults[0].map(({ id, title }) => ({ value: id, name: title }))

    const askRole = await inquirer.prompt([
        {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roles
        }
    ])

    const managerResults = await db.promise().query('SELECT first_name, last_name, manager_id FROM employee');
    const managers = managerResults[0].map(({ first_name, last_name, manager_id }) => ({ value: manager_id, name: `${first_name} ${last_name}` }))

    // Add the option to select no manager, will return null
    managers.push({value: null, name: 'None'})

    const askManager = await inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: "Who is the employee's manager?",
            choices: managers
        }
    ])

    const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';

    db.query(query, [result.first, result.last, askRole.role, askManager.manager], (err, results) => {

        if(err) throw err;
  
        console.log(`Successfully added new employee: ${result.first} ${result.last}.`);
        viewEmployees();
        
    })

}

async function addRole() {

    const result = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the name of the role you would like to add?",
            validate: title => title ? true : 'Please enter a role.' 
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary for this role?",
            validate: salary => isNaN(salary) || !(salary) ? 'Please enter an amount' : true
        }
    ]);

    const searchDept = 'SELECT id, name FROM department'
    const searchResults = await db.promise().query(searchDept);
    const departments = searchResults[0].map(({ id, name }) => ({value: id, name: name}));

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

        if(err) throw err;

        console.log(`Successfully added new role: ${result.title}.`);
        viewRoles();
        
    })
}

async function addDepartment() {
    const result = await inquirer.prompt([
        {
            type: "input",
            name: "dept",
            message: "What department would you like to add?",
            validate: dept => dept ? true : 'Please enter a department name'   
        }
    ]);

    const query = 'INSERT INTO department (name) VALUES (?)';

    db.query(query, result.dept, (err, results) => {

        if(err) throw err;
        
        console.log(`Successfully added new department: ${result.dept}.`);
        viewDepartments();
        
    })

}

function viewEmployees() {

    const query = `SELECT employee.id,
                          employee.first_name, 
                          employee.last_name, 
                          role.title AS title, 
                          department.name AS department, 
                          role.salary, 
                          CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee 
                          INNER JOIN role ON employee.role_id = role.id 
                          INNER JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    db.query(query, (err, results) => {

        if(err) throw err;

        console.table(results);
        loadTasks();
    })
}

function viewRoles() {
    const query = 'SELECT role.id, role.title, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id = department.id';

    db.query(query, (err, results) => {

        if(err) throw err;

        console.table(results);
        loadTasks();
    })
}

function viewDepartments() {
    db.query('SELECT id, name FROM department', (err, results) => {

        if(err) throw err;
        
        console.table(results);
        loadTasks();
    })
}

// ends database connection
function exitDb() {
    db.end();
    console.log("Exited Employee Database.")
}

// start application
function init() {
  console.log('|=================================|');
  console.log('|                                 |');
  console.log('|        EMPLOYEE DATABASE        |');
  console.log('|                                 |');
  console.log('|=================================|');

  loadTasks();
}

init();

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
  