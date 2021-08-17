const _new = function (fn, ...rest) {
    const obj = {};
    fn.apply(obj, rest);
    Object.setPrototypeOf(obj, fn.prototype);
    return obj;
}

const Columns = function (id, name, age, city, state, country) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.city = city;
    this.state = state;
    this.country = country;
}

const regExp = /create table (\w+) \((.+)\)/;



const column = new Columns('number', 'string', 'number', 'string', 'string', 'string');

console.log(column);