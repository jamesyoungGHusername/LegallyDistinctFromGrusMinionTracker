const Role = require("./Role");
const Department = require("./Department");

class Employee {
    constructor(name,role,department){
        if(name){
            this.name=name;
        }else{
            this.name=null;
        }
        if(role){
            this.role=role;
        }else{
            this.role = null;
        }
        if(department){
            this.department=department;
        }else{
            this.department= null;
        }
        this.managerID=null;
    }
    set(managerID){
        this.managerID=managerID;
    }
    setRole(role){
        this.role=new Role(role.title,role.desc);
    }
    setDept(department){
        this.department=new Department(department.name,department.desc);
    }
    setName(name){
        this.name=name;
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