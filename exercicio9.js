class DatabaseError {
    constructor(statement, message) {
        this.statement = statement;
        this.message = message;
    }
}

class Parser {
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

class Database {
    constructor(){
        this.tables = {};
        this.parser = new Parser();
    }

    createTable(parsedStatement) {
        let [, tableName, columns] = parsedStatement;
        this.tables[tableName] = {
            columns: {},
            data: []
        };
        columns = columns.split(",");
        for (let column of columns) {
            column = column.trim().split(" ");
            const [name, type] = column;
            this.tables[tableName].columns[name] = type;
        }
    }

    insert(parsedStatement) {
        let [, tableName, columns, values] = parsedStatement;

        columns = columns.split(",");
        values = values.split(",");
        let row = {}
        for (var i = 0; i < columns.length; i++) {
            row[columns[i].trim()] = values[i].trim();
        }
        this.tables[tableName].data.push(row);
    }

    select(parsedStatement) {
        let [, columns, tableName, whereClosures] = parsedStatement;
        let rows = this.tables[tableName].data;
        columns = columns.split(", ");

        if (whereClosures) {
            const [columnWhere, valueWhere] = whereClosures.split(" = ");
            rows = rows.filter(row => row[columnWhere] === valueWhere);
        }

        rows = rows.map(row => {
            let newRow = {};
            columns.forEach(column => newRow[column] = row[column]);
            return newRow;
        })

        return rows;
    }

    delete(parsedStatement) {
        let [, tableName, whereClosures] = parsedStatement;
        let rows = this.tables[tableName].data;

        if (whereClosures) {
            const [columnWhere, valueWhere] = whereClosures.split(" = ");
            rows = rows.filter(row => row[columnWhere] !== valueWhere);
            this.tables[tableName].data = rows;
        } else {
            this.tables[tableName].data = [];
        }

        return rows;
    }

    execute(statement) {        
        const { command, parsedStatement } = this.parser.parse(statement);
        if (!command) throw new DatabaseError(statement, `Syntax error: '${statement}'`);
        return this[command](parsedStatement);
    }
}

try {
    const database = new Database();
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    database.execute("delete from author where id = 2");
    console.log(JSON.stringify(database.execute("select name, age from author"), undefined, "  "));

} catch (e) {
    console.log(e.message);
}
