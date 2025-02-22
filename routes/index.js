var express = require('express');
var router = express.Router();

const sql = require('mssql');
require('dotenv').config()

var os = require("os");
var hostname = os.hostname();

const server = process.env.DB_SERVER;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME;
const port = parseInt(process.env.DB_PORT);

const config = {
    user,
    password,
    server,
    port,
    database,
    options: {
      encrypt: true
    }
  }
const pool = new sql.ConnectionPool(config);

pool.connect().then(() => {
  console.log('Connected to Azure SQL Database');
}).catch(err => {
  console.error('Error connecting to Azure SQL Database:', err);
});

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const result = await pool.request().query(`SELECT pc.name as CategoryName,
    p.name as ElemName 
    FROM [dbo].[ElemKategoria] pc
    JOIN [dbo].[Elem] p ON pc.elemkategoriaid = p.elemkategoriaid
    ORDER BY ElemName`);
    //res.json(result.recordset);
    const data = result.recordset;
    res.render('index', { title: "Katalógus (Azure WebApp + SQL)", error: "", data, hostname: hostname });
    closeConnection();

  } catch (err) {
    console.error('Error executing SQL query:', err);
    //res.status(500).json({ error: 'Internal Server Error' });
    const data = [
      { ElemName: "", CategoryName: "" }
    ];
    res.render('index', { title: "Katalógus (Azure WebApp + SQL)", error: "Adatbázis hiba", data, hostname: hostname });
    closeConnection();
  }
  

});

module.exports = router;


function closeConnection(){
  process.on('SIGINT', () => {
    pool.close().then(() => {
      console.log('Connection pool closed');
      process.exit(0);
    });
  });
}
