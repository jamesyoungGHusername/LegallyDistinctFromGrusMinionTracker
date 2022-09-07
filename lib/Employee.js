const Role = require("./Role");
const Department = require("./Department");

class Employee {
    constructor(name, id,role,department){
        this.name=name;
        this.id=id;
        this.role = new Role(role.id,role.title,role.desc);
        this.department=new Department(department.id,department.name,department.desc);
        this.managerID=0;
    }
    set(managerID){
        this.managerID=managerID;
    }
    getManagerID(){
        let r = null;
        if(this.managerID){
            r=this.managerID;
        }
        return r;
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
 
        return [this.name,this.role.title,this.department.name,this.getManagerID()];
    }
}

module.exports = Employee;