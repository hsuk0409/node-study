const mysql = require("mysql2/promise")
const moment = require("moment-timezone")
const poolPromise = mysql.createPool({
    host: "nubeat-rds-test.cnx5p8iqk0qi.ap-northeast-2.rds.amazonaws.com",
    port: 3306,
    database: "nubeat",
    user: "nubeatadmin",
    password: "Koreanuskin.C0m",
    charset: "utf8mb4",
    multipleStatements: false,
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0,
    typeCast: function (field, next) {
        if (field.type == 'VAR_STRING') {
            return field.string();
        }
        return next();
    },
})

module.exports = {
    queryExec: async (query, ...info) => {
        let error = null, result, fields;
        let DBconn
        let DBError = null
        const pool = poolPromise;
        console.log(`Connection Pool info: ${JSON.stringify(pool)}`)
        try {
            DBconn = await pool.getConnection();
            console.log(`> Pool connection`);
            console.log(`> LCL : ${moment.utc(new Date().toISOString()).tz("Asia/Seoul").format()}`);
            console.time(`> Query ${query} ${info} executetime : `);
            try {
                [result, fields] = await DBconn.query(query, info) || null
                console.log(`Query result: ${result}, fields: ${fields}`)
                DBconn.release();
            } catch (err) {
                console.log(`> err on query ${query}: ${err}`)
                error = { code: (err.code || 100), name: err.name, message: (err.message || `Unexpacted Query Exec`) }
                return { DBError: err, RS: result }
            }
        } catch (err) {
            console.dir(err);
            console.log(`> err on connection ${query}: ${err}`)
            error = { code: (err.code || 100), name: err.name, message: (err.message || `Unexpacted DB Connection`) }
            DBconn.rollback(() => {
            })
        } finally {
            console.timeEnd(`> Query ${query} ${info} executetime : `);
            console.log(`> Pool release`);
            // console.log(result);
            return { DBError: error, RS: result }
        }
    }
}