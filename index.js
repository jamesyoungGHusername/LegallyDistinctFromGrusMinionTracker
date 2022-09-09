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

//the main menu. The entire thing is recursive, with functions allowed to speficy exit points.
//this means you can call the new department function from the main menu and return to the main menu when you're done, 
//or you can call it midway through making a new employee and once you're done it'll exit right back to where you left off with the employee.
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
                promptFirstName();
                break;
            case "Update Employee Role":
                updateRole();
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
async function promptNewRole(exitTo){
    let ad = await availableDepartments();
    console.table(await availableRoles());
    let d_list = [];
    for(const item of ad){
        d_list.push(item.d_name);
    }
    d_list.push("-Create New Department");
    let q = [new Question(qTypes.input,"What is the new role's title?","roleTitle"),new Question(qTypes.input,"What is the role's description?","roleDesc"),new Question(qTypes.list,"To which department does this role belong?","roleDept",d_list),new Question(qTypes.input,"What is the salary of this role?","salary")];
    
    let response = await inquirer.prompt(q).then((response)=>{
        if(response.roleTitle){
            
                return response;
        }else{
            if(exitTo){
                exitTo();
            }else{
                another(()=>promptNewRole());
            }
        }
    });
    if(response.roleDept == "-Create New Department"){
        await promptNewDept(()=>promptNewRole());
        console.log("New role added");
        return;
    }

    //query to get dept object
    let deptQuery = await queryDeptFrom(response.roleDept);
    let loadedDept = new Department(deptQuery[0].d_name,deptQuery[0].d_desc);
    loadedDept.set(deptQuery[0].id);
    let r = new Role(response.roleTitle,response.roleDesc,loadedDept,response.salary);
    db.query('INSERT INTO roles (deptID,deptName,title,r_desc,salary) VALUES ?',[[r.getArray()]],function (err, results) {
        if (err) throw err;  
        //if an exit destination is specified, use that, otherwise use the default.
        if(exitTo){
            exitTo();
        }else{
            another(()=>promptNewRole());
        }
    });
}


async function promptNewDept(exitTo){
    let q = [new Question(qTypes.input,"What is the new department's name?","name"),new Question(qTypes.input,"What is the new deparment's description?","desc")];
    await inquirer.prompt(q).then((response)=>{
        if(response.name){
            let d = new Department(response.name,response.desc);
            db.query('INSERT INTO departments (d_name,d_desc) VALUES ?',[[d.getArray()]],function (err, results) {
                if (err) throw err;  
                //if an exit destination is specified, use that, otherwise use the default.
                if(exitTo){
                    exitTo();
                }else{
                    //instructs another to exit to the new department prompt. (to make another dept) the other option in another() is to navigate to the main menu.
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

async function promptFirstName(){
    let q = new Question(qTypes.input,"What is this employee's first name","name");
    draftEmployee.setFName(await inquirer.prompt([q]).then((response)=>{
        return (response.name);
    }));
    promptLastName();
}
async function promptLastName(){
    let q = new Question(qTypes.input,"What is this employee's last name","name");
    draftEmployee.setLName(await inquirer.prompt([q]).then((response)=>{
        return (response.name);
    }));
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
        return response;
    });
    if(response.role == "-Create New Role"){
        promptNewRole(()=>promptRole());
        return;
    }
    let roleQuery = await queryRoleFrom(response.role);
    let deptQuery = await (queryRoleDept(roleQuery[0].deptID));
    let loadedDept = new Department(deptQuery[0].d_name,deptQuery[0].d_desc);
    
    loadedDept.set(deptQuery[0].id);
    let loadedRole = new Role(roleQuery[0].title,roleQuery[0].r_desc,roleQuery[0].deptName,roleQuery[0].salary);
    loadedRole.set(roleQuery[0].id);
    draftEmployee.setRole(loadedRole);
    draftEmployee.setDept(loadedDept);
    assignManager();
}
async function queryRoleDept(role){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM departments WHERE id = ?',role, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}
async function queryRoleFrom(title){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM roles WHERE title = ?',title, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}
async function queryDeptFrom(name){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM departments WHERE d_name = ?',name, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
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
        db.query('INSERT INTO employees (firstName,lastName,roleID,roleTitle,salary,deptID,deptName,managerID) VALUES ?',[[draftEmployee.getArray()]],function (err, results) {
            if (err) throw err;  
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

function availableEmployees(){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM employees', ( err, rows ) => {
            if ( err ) return resolve([]);
            resolve( rows );
        } );
    } );
}

async function updateRole(){
    let allEmployees = await availableEmployees();
    console.table(allEmployees);
    let e_list = [];
    if(allEmployees){
        for(const item of allEmployees){
            e_list.push(item.id+" "+item.firstName+" "+item.lastName);
        }
    }else{
        console.log("No employees currently saved. Returning to main menu.");
        displayMainMenu();
        return;
    }
    let q = new Question(qTypes.list,"Which employee would you like to modify?","choice",e_list);
    let response = await inquirer.prompt([q]).then((response)=>{
        return response;
    });
    let empQuery = await queryEmployeeFrom(response.choice);
    let currentDept = empQuery[0].deptID;
    console.log("current department id: "+currentDept);
    let ar = await availableRolesInDept(currentDept);
    let r_list = [];
    for(const item of ar){
        r_list.push(item.id+" "+item.title);
    }
    let rq = new Question(qTypes.list,"What is this employee's new role?","role",r_list);
    let roleResponse = await inquirer.prompt([rq]).then((response)=>{
        return response;
    });
    let roleSplit = roleResponse.role.split(" ");
    let newRole = await queryRole(roleSplit[0]);
    let modify = await updateEmployeeRole(newRole[0].id,newRole[0].title,newRole[0].salary,empQuery[0].id);

    displayMainMenu();
    return;
  
}
async function updateEmployeeRole(roleID,roleTitle,salary,id){
    return new Promise(( resolve, reject ) => {
        db.query('UPDATE employees SET roleID = ?, roleTitle = ?, salary = ? WHERE id = ?',[roleID,roleTitle,salary,id], ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows )
        } );
    });
}

async function queryRole(id){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM roles WHERE id = ?',id, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}
async function queryEmployeeFrom(idFirstAndLast){
    let splitName = idFirstAndLast.split(" ");
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM employees WHERE id = ?',splitName[0], ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}

function availableRolesInDept(deptID){
    return new Promise( ( resolve, reject ) => {
        db.query('SELECT * FROM roles WHERE deptID = ?',deptID, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
    } );
}

main();