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
        let testRole=new Role("minion","should unionize");
        let testDept = new Department("Mailroom","The room for mail");
        switch (response.Options) {
            case "View All Departments":
                showAvailable("departments");
                break;
            case "View All Roles":
                showAvailable("roles");
                break;
            case "View All Employees":
                showAvailable("employees");
                break;
            case "Add a Department":
                promptNewDept();

                break;
            case "Add a Role":
                promptNewRole();

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

//takes a prompt function as a param, and asks if the user would like to create another of that object. Returns to the main menu if they dont, and repeats the call if they do.
function another(funcToRepeat){
    let q = new Question(qTypes.confirm,"Create another?","navConfirm");
    inquirer.prompt([q]).then((response)=>{
        if(response.navConfirm){
            funcToRepeat();
        }else{
            displayMainMenu();
        }
    });
}


//takes a string containing the name of the table to be displayed.
function showAvailable(table){
    db.query('SELECT * FROM '+table, function (err, results) {
        console.table(results);
        displayMainMenu();
      });
}

//takes a function indicating where the prompt should exit to when complete.
function promptNewRole(exitTo){
    let q = [new Question(qTypes.input,"What is the new role's title?","roleTitle"),new Question(qTypes.input,"What is the role's description?","roleDesc")];
    inquirer.prompt(q).then((response)=>{
        if(response.roleTitle){
            let r = new Role(response.roleTitle,response.roleDesc);
            db.query('INSERT INTO roles (title,r_desc) VALUES ?',[[r.getArray()]],function (err, results) {
                if (err) throw err;  
                console.log(results);
                //if an exit destination is specified, use that, otherwise use the default.
                if(exitTo){
                    exitTo();
                }else{
                    another(()=>promptNewRole());
                }
            });
        }else{
            if(exitTo){
                exitTo();
            }else{
                another(()=>promptNewRole());
            }
        }
    });
}

takes
function promptNewDept(exitTo){
    let q = [new Question(qTypes.input,"What is the new department's name?","name"),new Question(qTypes.input,"What is the new deparment's description?","desc")];
    inquirer.prompt(q).then((response)=>{
        if(response.name){
            let d = new Department(response.name,response.desc);
            db.query('INSERT INTO departments (d_name,d_desc) VALUES ?',[[d.getArray()]],function (err, results) {
                if (err) throw err;  
                console.log(results);
                //if an exit destination is specified, use that, otherwise use the default.
                if(exitTo){
                    exitTo(results);
                }else{
                    another(()=>promptNewDept());
                }
                
            });
        }else{
            if(exitTo){
                exitTo();
            }else{
                another(()=>promptNewDept());
            }
        }
    });
}

//takes an optional name, role, and dept. Allows the function to call other functions (like to make a new role midway through) and then return to promptNewEmployee() without losing their progress.
function promptNewEmployee(startingName,startingDept,startingRole,){
    let d = availableDepartments();
    d.append("-Create New Department");
    let r = availableRoles();
    r.append("-Create New Role");
    let q = [new Question(qTypes.input,"What is this employee's name","name"),new Question(qTypes.list,"What is this employee's department?","dept",d),new Question(qTypes.list,"What is this employee's role.","role",r)];
    //inelegant. This sequence allows the the 
    if(startingName && startingRole && startingDept){
        
    }else if(startingName && startingDept){
        inquirer.prompt([q[2]]).then((response)=>{
            
        });
    }else if(startingName){
        inquirer.prompt([q[1],q[2]]).then((response)=>{
            if(response.dept=="-Create New Department"){

            }
        });
    }else{
        inquirer.prompt(q).then((response)=>{
            
        });
    }
}

//gets the available departments and returns an array of strings to give the user options when building an employee.
function availableDepartments(){

}
//gets the available roles and returns an array of strings to give the user options when building an employee.
function availableRoles(){

}



function view(table){

}

main();