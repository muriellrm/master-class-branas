import Parser from "./parser.mjs";
import DatabaseError from "./databaseerror.mjs";

export default class Database {
    constructor() {
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
        for (let i = 0; i < columns.length; i++) {
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
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const { command, parsedStatement } = this.parser.parse(statement);                
                if (!command) {
                    reject(new DatabaseError(statement, `Syntax error: '${statement}'`));
                }
                return resolve(this[command](parsedStatement));
            }, 1000)
        });
    }
}