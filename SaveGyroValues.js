// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
var Sequelize = require('sequelize');

const sequelize = new Sequelize('db', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


//to create the table
const Sensor = sequelize.define('sensor', {
  accelx: {
    type: Sequelize.REAL
  },
  accely: {
    type: Sequelize.REAL
  },
  accelz: {
    type: Sequelize.REAL
  },
  gyrox: {
    type: Sequelize.REAL
  },
  gyroy: {
    type: Sequelize.REAL
  },
  gyroz: {
    type: Sequelize.REAL
  }
});

// force: true will drop the table if it already exists
Sensor.sync({force: true}).then(() => {
  // Table created
  return Sensor.create({
    accelx: 0,
    accely: -1,
    accelz: 0,
    gyrox: 0,
    gyroy: -1,
    gyroz: 0
  });
});