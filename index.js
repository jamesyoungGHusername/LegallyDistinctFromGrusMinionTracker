const inquirer = require("inquirer");
const mysql = require('mysql2');
const fs = require('fs');

const Employee = require("./lib/Employee");
const Department = require("./lib/Department");
const Role = require("./lib/Role");
const Question = require("./lib/Question");
var db = mysql.createConnection(
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

async function main(){
    displayMainMenu();
}

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
        let testRole=new Role(2,"minion","should unionize");
        let testDept = new Department(1,"Mailroom","The room for mail");
        switch (response.Options) {
            case "View All Departments":
                getAvailable("departments");
                break;
            case "View All Roles":
                getAvailable("roles");
                break;
            case "View All Employees":
                getAvailable("employees");
                break;
            case "Add a Department":
                
                // db.query('INSERT INTO departments (id,d_name,d_desc) VALUES ?',[[testDept.getArray()]],function (err, results) {
                //     if (err) throw err;  
                //     console.log(results);
                //   });
                break;
            case "Add a Role":
                
                // db.query('INSERT INTO roles (id,title,r_desc) VALUES ?',[[testRole.getArray()]],function (err, results) {
                //     if (err) throw err;  
                //     console.log(results);
                //   });
                break;
            case "Add an Employee":

                // db.query('INSERT INTO employees (id,name,roleTitle,deptName,managerID) VALUES ?',[[testEmployee.getArray()]],function (err, results) {
                //     if (err) throw err;  
                //     console.log(results);
                //   });
                break;
            case "Update Employee Role":
            
                break;
            default:
                break;
        }
    });
}

function returnToMainMenu(){
    let q = new Question(qTypes.confirm,"Return To Main Menu?","navConfirm");
    inquirer.prompt([q]).then((response)=>{
        if(response.navConfirm){
            displayMainMenu();
        }else{
            returnToMainMenu();
        }
    });

}

function getAvailable(table){
    db.query('SELECT * FROM '+table, function (err, results) {
        console.table(results);
        returnToMainMenu();
      });
}

function promptNewRole(){
    let q = [new Question(qTypes.input,"What is the new role's title?","roleTitle"),new Question(qTypes.input,"What is the role's description?","rollDesc")];
    inquirer.prompt(q).then((response)=>{
        if(response.roleTitle){
            let r = new Role()
            displayMainMenu();
        }else{
            returnToMainMenu();
        }
    });
}



function view(table){

}

main();