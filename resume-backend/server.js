const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

sequelize.sync()
  .then(() => {
    console.log('MySQL Connected & Tables Created');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));

app.use('/api/resume', require('./routes/resume'));  