const Role = require("./Role");
const Department = require("./Department");

class Employee {
    constructor(name, id,role,department){
        this.name=name;
        this.id=id;
        this.role = new Role(role.id,role.title,role.desc);
        this.department=new Department(department.id,department.name,department.desc);
    }
    getName(){
        return this.name;
    }
    getID(){
        return this.id;
    }
    getRole(){
        return this.role;
    }
    getDepartment(){
        return this.department;
    }
    getArray(){
        return [this.id,this.name,this.role.title,this.department.name];
    }
}

module.exports = Employee;