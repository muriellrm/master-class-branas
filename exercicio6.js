const DatabaseError = function (statement, message) {
    this.statement = statement;
    this.message = message;
};
const database = {
    tables: {},
    createTable(statement) {
        const regexp = /create table ([a-z]+) \((.+)\)/;
        const parsedStatement = statement.match(regexp);
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
    },
    insert(statement) {
        const regexp = /insert into ([a-z]+) \((.+)\) values \((.+)\)/;
        const parsedStatement = statement.match(regexp);
        let [, tableName, columns, values] = parsedStatement;

        columns = columns.split(",");
        values = values.split(",");
        let row = {}
        for (var i = 0; i < columns.length; i++) {
            row[columns[i].trim()] = values[i].trim();
        }
        this.tables[tableName].data.push(row);
    },
    select(statement) {
        const regexp = /select (.+) from ([a-z]+)(?: where (.+))?/;

        const parsedStatement = statement.match(regexp);
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
    },
    execute(statement) {
        if (statement.startsWith("create table")) {
            return this.createTable(statement);
        } else if (statement.startsWith("insert into")) {
            return this.insert(statement);
        } else if (statement.startsWith("select")) {
            return this.select(statement);
        }
        const message = `Syntax error: "${statement}"`;
        throw new DatabaseError(statement, message);
    }
};
try {
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    console.log(JSON.stringify(database.execute("select name, age from author"), undefined, "  "));;
    console.log(JSON.stringify(database.execute("select name, age from author where id = 3"), undefined, "  "));;
} catch (e) {
    console.log(e.message);
}
