INSERT INTO department (name)
    VALUES ("Engineering"),
           ("Finance"),
           ("Legal"),
           ("Sales");

INSERT INTO role (title, salary, department_id)
    VALUES ("Sales Lead", 100000, 4),
           ("Salesperson", 80000, 4),
           ("Lead Engineer", 150000, 1),
           ("Software Engineer", 120000, 1),
           ("Account Manager", 160000, 2),
           ("Accountant", 125000, 2),
           ("Legal Team Lead", 250000, 3),
           ("Lawyer", 190000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ("Gary", "Almes", 3, null),
           ("Paul", "Cwik", 4, 1),
           ("Emily", "Vasquez", 5, null),
           ("Victor", "Kennedy", 6, 3),
           ("Stephen", "Elliot", 7, null),
           ("Vidal", "Tan", 8, 5),
           ("Eugene", "Ahn", 1, null),
           ("Andrew", "Anderson", 2, 7),
           ("Caitlin", "Stevenson", 4, 1);


        
