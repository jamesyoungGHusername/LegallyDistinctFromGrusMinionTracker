//A question class to make it easier to build inquirer questions.
class Question{
    constructor(type,message,name,choices){
        this.type=type;
        this.message=message
        if(choices){
            this.choices=choices;
        }
        this.name=name;
        
    }
}

module.exports=Question;