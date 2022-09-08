class Role{
    constructor(title,desc){
        this.title=title;
        this.desc=desc;
        this.id=0;
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
        return [this.title,this.desc];
    }
}

module.exports = Role;