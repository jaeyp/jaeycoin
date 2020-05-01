// function
const sayHi = (name:string, age:number, gender?:string):void => {
    console.log(`Hello ${name}, your are ${age}, you are a ${gender}`)
}

// interface
interface iHuman {
    name: string
    age: number
    gender: string
}
const person = {
    name: "Ben",
    age: 18,
    gender: "male"
}
const sayHi2 = (person: iHuman): void => {
    console.log(`Hello ${person.name}, your are ${person.age}, you are a ${person.gender}`)
}

// class
class Human {
    public name: string;
    public age: number;
    public gender: string;
    constructor(name: string, age: number, gender: string){
        this.name = name;
        this.age = age;
        this.gender = gender;
    }
}
const ben = new Human("Ben", 18, "male")
const sayHi3 = (person: Human): void => {
    console.log(`Hello ${person.name}, your are ${person.age}, you are a ${person.gender}`)
}

sayHi("Ben", 18, "male")
sayHi2(person)
sayHi3(ben)

export {}