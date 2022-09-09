class Role{
    constructor(title,desc,dept,salary){
        this.title=title;
        this.desc=desc;
        this.id=0;
        this.dept=dept;
        this.salary=salary;
    }
    set(id){
        this.id=id;
    }
    getTitle(){
        return this.title;
    }
    getID(){
        return this.id;
    }
    getDesc(){
        return this.desc;
    }
    getArray(){
        return [this.dept.id,this.dept.name,this.title,this.desc,this.salary];
    }
}

module.exports = Role;