const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;


const boilerCode = errorWrapper(
    async (req, res) => {
      const {
        input1,
        input2,        
      } = req.body;
  
      const { rows } = await pool.query(
        `query
        VALUES 
          ($1, $2, ) 
        RETURNING *`,
        [
            input1,
            input2,
          
        ]
      );
  
      res.status(201).json(rows[0]);
    },
    { statusCode: 500, message: `Couldn't create x` }
  );


  const testing_election_table = errorWrapper(
    async (req, res) => {              
      const { rows } = await pool.query(
        `SELECT schemaname
FROM pg_tables
WHERE tablename = 'Elections';
`
      );

      res.status(200).json({ result: rows });
    },
    { statusCode: 500, message: `Couldn't get result` }
);



const removing_att = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query(
      `SELECT schemaname
FROM pg_tables
WHERE tablename = 'Elections'`
    );

    res.status(200).json({ result: rows });
  },
  { statusCode: 500, message: `Couldn't get result` }
);





  module.exports = {
    testing_election_table,removing_att
  }