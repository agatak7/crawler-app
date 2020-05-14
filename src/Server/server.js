const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3360;

var connection = mysql.createConnection({
  //properties..
  host: 'projects-db.ewi.tudelft.nl',
  user: 'pu_in4artDB',
  password: 'df0TzaxgPscY',
  database: 'projects_in4artDB'
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/db/phrases', (req, res) => {
  connection.query("SELECT * FROM phrases", function(error, rows, fields) {
    if(!!error) {
      console.log("error  in query");
    } else {
      res.send(rows);
  }
  });
});

app.post('/db/phrases/insert', (req, res) => {
  // about mysql
  connection.query("INSERT INTO phrases (phrase) VALUES ('"+req.body.post+"')", function(error, rows, fields) {
    if(!!error) {
      console.log("error  in query");
    } else {
      res.send(`You inserted into phrases: ${req.body.post}`);
    }
  });

});

app.post('/db/phrases/delete', (req, res) => {
  // about mysql
  console.log(req.body.post);
  connection.query('DELETE FROM phrases WHERE phrase = "'+req.body.post+'"', function(error, rows, fields) {
    if(!!error) {
      console.log("error  in query");
    } else {
      res.send(`You deleted from phrases: ${req.body.post}`);
    }
  });
});


app.listen(port, () => console.log(`Listening on port ${port}`));
