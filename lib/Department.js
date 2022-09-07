class Department{
    constructor(id,name,desc){
        this.id=id;
        this.name=name;
        this.desc=desc;
    }
    getName(){
        return this.name;
    }
    getID(){
        return this.id;
    }
    getDesc(){
        return this.desc;
    }
}

module.exports = Department;