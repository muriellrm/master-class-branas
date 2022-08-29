export default class Parser {
    constructor() {
        this.commands = new Map();
        this.commands.set('createTable', /create table ([a-z]+) \((.+)\)/);
        this.commands.set('insert', /insert into ([a-z]+) \((.+)\) values \((.+)\)/);
        this.commands.set('select', /select (.+) from ([a-z]+)(?: where (.+))?/);
        this.commands.set('delete', /delete from ([a-z]+)(?: where (.+))?/);
    }

    parse(statement) {
        for (let [commandName, regex] of this.commands) {            
            const parsedStatement = statement.match(regex);
            if (parsedStatement) {
                return {
                    command: commandName,
                    parsedStatement
                }
            }
        }
    }
}