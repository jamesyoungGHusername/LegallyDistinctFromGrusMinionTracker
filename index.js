const inquirer = require("inquirer");
const mysql = require('mysql2');
const fs = require('fs');

const Employee = require("./lib/Employee");
const Department = require("./lib/Department");
const Role = require("./lib/Role");
const Question = require("./lib/Question");
const { deprecate } = require("util");
var draftEmployee = new Employee();

var db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
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
    draftEmployee=new Employee();
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
                promptName();
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


function promptNewDept(exitTo){
    let q = [new Question(qTypes.input,"What is the new department's name?","name"),new Question(qTypes.input,"What is the new deparment's description?","desc")];
    inquirer.prompt(q).then((response)=>{
        if(response.name){
            let d = new Department(response.name,response.desc);
            db.query('INSERT INTO departments (d_name,d_desc) VALUES ?',[[d.getArray()]],function (err, results) {
                if (err) throw err;  
                //if an exit destination is specified, use that, otherwise use the default.
                if(exitTo){
                    exitTo();
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

async function promptName(){
    let q = new Question(qTypes.input,"What is this employee's name","name");
    draftEmployee.setName(await inquirer.prompt([q]).then((response)=>{
        return (response.name);
    }));
    promptDept();
}

async function promptDept(){
    let ad = await availableDepartments();
    console.table(ad);
    let d_list = [];
    for(const item of ad){
        d_list.push(item.d_name);
    }
    d_list.push("-Create New Department");
    let q = new Question(qTypes.list,"What is this employee's department?","dept",d_list);
    let response = await inquirer.prompt([q]).then((response)=>{
        if(response.dept == "-Create New Department"){
            promptNewDept(()=>promptDept());
        }else{
            return response.dept;
        }
    });
    let deptQuery = await new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM departments WHERE d_name = ?',response, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
    console.log(deptQuery[0].id);
    let loadedDept = new Department(deptQuery[0].d_name,deptQuery[0].d_desc);
    loadedDept.set(deptQuery[0].id);
    console.log(loadedDept);
    draftEmployee.setDept(loadedDept);
    promptRole();
}

async function promptRole(){
    let ar = await availableRoles();
    let r_list = [];
    console.table(ar);
    for(const item of ar){
        r_list.push(item.title);
    }
    r_list.push("-Create New Role");
    let q = new Question(qTypes.list,"What is this employee's role?","role",r_list);
    let response = await inquirer.prompt([q]).then((response)=>{
        if(response.role == "-Create New Role"){
            promptNewRole(()=>promptRole())
        }else{
            return response.role;
            
        }
    });
    let roleQuery = await new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM roles WHERE title = ?',response, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
    console.log(roleQuery);
    let loadedRole = new Role(roleQuery[0].title,roleQuery[0].r_desc);
    loadedRole.set(roleQuery[0].id);
    draftEmployee.setRole(loadedRole);
    assignManager();
}

async function assignManager(exitTo){
    let am = await availableManagers();
    let id_list=[];
    let m_list = [];
    if(am){
        for(const item of am){
            m_list.push(item.name);
        }
    }
    m_list.push("-No Manager");
    let q = new Question(qTypes.list,"Who is this employee's manager?","manager",m_list);
    inquirer.prompt([q]).then((response)=>{
        //matches the response to the selected manager's id, and assigns that manager id to the new employee.
        if(response.manager!="-No Manager"){
            for(const manager of am){
                if(response.manager==manager.name){
                    draftEmployee.set(manager.id);
                    break;
                }
            }
        }
        console.log(draftEmployee);
        console.log(draftEmployee.getArray());
        db.query('INSERT INTO employees (name,roleID,roleTitle,deptID,deptName,managerID) VALUES ?',[[draftEmployee.getArray()]],function (err, results) {
            if (err) throw err;  
            console.log(results);
            //if an exit destination is specified, use that, otherwise use the default.
            if(exitTo){
                exitTo();
            }else{
                another(()=>promptNewRole());
            }
        });
    });
}
//To Do: refactor into one function 
//gets the available departments and returns an array of strings to give the user options when building an employee.
function availableDepartments(){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM departments', ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}
//gets the available roles and returns an array of strings to give the user options when building an employee.
function availableRoles(){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM roles', ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}

function availableManagers(){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM employees WHERE roleTitle = manager', ( err, rows ) => {
            if ( err ) return resolve([]);
            resolve( rows );
        } );
    } );
}


main();