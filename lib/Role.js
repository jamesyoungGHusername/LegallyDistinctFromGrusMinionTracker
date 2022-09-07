class Role{
    constructor(id,title,desc){
        this.id=id;
        this.title=title;
        this.desc=desc;
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
        return [this.id,this.title,this.desc];
    }
}

module.exports = Role;