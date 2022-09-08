class Department{
    constructor(name,desc){
        this.name=name;
        this.desc=desc;
        this.id=0;
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
    getArray(){
        return [this.name,this.desc];
    }
}

module.exports = Department;