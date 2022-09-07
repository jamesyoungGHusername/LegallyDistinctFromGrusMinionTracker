const inquirer = require("inquirer");
const mysql = require('mysql2');
const fs = require('fs');

const Employee = require("./lib/Employee");
const Department = require("./lib/Department");
const Role = require("./lib/Role");
const Question = require("./lib/Question");
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: '',
      database: 'minionTracker_db'
    },
    console.log(`Connected to the minionTracker_db database.`)
  );


const qTypes = {
    input: "input",
    number: "number",
    confirm: "confirm",
    list: "list",
    rawlist: "rawlist",
    expand: "expand",
    checkbox: "checkbox",
    password: "password",
    editor: "editor"
}

function displayMainMenu(){
    let q = new Question(qTypes.list,"\n","Options",["View All Departments","View All Roles","View All Employees","Add a Department","Add a Role","Add an Employee","Update Employee Role"]);
    inquirer.prompt([q]).then((response)=>{
        switch (response.Options) {
            case "View All Departments":
                db.query('SELECT * FROM departments', function (err, results) {
                    console.log(results);
                  });
                break;
            case "View All Roles":
                db.query('SELECT * FROM roles', function (err, results) {
                    console.log(results);
                  });
                break;
            case "View All Employees":
                db.query('SELECT * FROM employees', function (err, results) {
                    console.log(results);
                  });
                break;
            case "Add a Department":
                let testDept = new Department(1,"Mailroom","The room for mail");
                db.query('INSERT INTO departments (id,d_name,d_desc) VALUES ?',[[testDept.getArray()]],function (err, results) {
                    if (err) throw err;  
                    console.log(results);
                  });
                break;
            case "Add a Role":
                let testRole=new Role(1,"boss","He's the boss");
                db.query('INSERT INTO roles (id,title,r_desc) VALUES ?',[[testRole.getArray()]],function (err, results) {
                    if (err) throw err;  
                    console.log(results);
                  });
                break;
            case "Add an Employee":
               
                break;
            case "Update Employee Role":
            
                break;
            default:
                break;
        }
    });
}

function view(table){

}

displayMainMenu();