var noble = require('noble');


// // const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
// var Sequelize = require('sequelize');

// const sequelize = new Sequelize('db', 'root', 'root', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });


// //to create the table
// const Sensor = sequelize.define('sensor', {
//   accelx: {
//     type: Sequelize.REAL
//   },
//   accely: {
//     type: Sequelize.REAL
//   },
//   accelz: {
//     type: Sequelize.REAL
//   },
//   gyrox: {
//     type: Sequelize.REAL
//   },
//   gyroy: {
//     type: Sequelize.REAL
//   },
//   gyroz: {
//     type: Sequelize.REAL
//   }
// });

// // force: true will drop the table if it already exists
// Sensor.sync({force: true}).then(() => {
//   // Table created
//   return Sensor.create({
//     accelx: 0,
//     accely: -1,
//     accelz: 0,
//     gyrox: 0,
//     gyroy: -1,
//     gyroz: 0
//   });
// });

// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['2947ac9efc3811e586aa5e5517507c66'];

var IMU_SERVICE_UUID = '2947ac9efc3811e586aa5e5517507c66';
var AX_CHAR_UUID =  '2947af14fc3811e586aa5e5517507c66';
var AY_CHAR_UUID = '2947b090fc3811e586aa5e5517507c66';
var AZ_CHAR_UUID = '2947b180fc3811e586aa5e5517507c66';
var GX_CHAR_UUID = '2947b252fc3811e586aa5e5517507c66';
var GY_CHAR_UUID = '2947b5aefc3811e586aa5e5517507c66';
var GZ_CHAR_UUID = '2947b694fc3811e586aa5e5517507c66';

var i=1;

var uid_array = ['2947af14fc3811e586aa5e5517507c66','2947b090fc3811e586aa5e5517507c66','2947b180fc3811e586aa5e5517507c66','2947b252fc3811e586aa5e5517507c66','2947b5aefc3811e586aa5e5517507c66','2947b694fc3811e586aa5e5517507c66']
// start scanning when bluetooth is powered on
noble.on('stateChange', function(state) {
  if(state === 'poweredOn') {
    console.log('Start BLE scan...')
    noble.startScanning([IMU_SERVICE_UUID], false);
  }
  else {
    console.log('Cannot scan... state is not poweredOn')
    noble.stopScanning();
  }
});

// Discover the peripheral's IMU service and corresponding characteristics
// Then, emit each data point on the socket stream
noble.on('discover', function(peripheral) {
console.log("peripheral :" + peripheral);
  peripheral.connect(function(error) {
    console.log('Connected to peripheral: ' + peripheral.uuid);
    peripheral.discoverServices([IMU_SERVICE_UUID], function(error, services) {
      var imuService = services[0];
      console.log('Discovered IMU service');
	console.log("imuService : " + imuService);
	
      imuService.discoverCharacteristics(uid_array, function(error, characteristics) {
	console.log("chracteristics : " + characteristics)
        characteristics.forEach(function(characteristic) {
          emitSensorData(characteristic);
        });
      });
    });
  });
});


function getSocketLabel(uuid) {
  var label = null;

  if(uuid == AX_CHAR_UUID) {
    label = 'ax:rasp';
  }
  else if(uuid == AY_CHAR_UUID) {
    label = 'ay:rasp';
  }
  else if(uuid == AZ_CHAR_UUID) {
    label = 'az:rasp';
  }
  else if(uuid == GX_CHAR_UUID) {
    label = 'gx:rasp';
  }
  else if(uuid == GY_CHAR_UUID) {
    label = 'gy:rasp';
  }
  else if(uuid == GZ_CHAR_UUID) {
    label = 'gz:rasp';
  }

  return label;
}

var ax = 0;
var ay = 0;
var az = 0;
var gx = 0;
var gy = 0;
var gz = 0;

function emitSensorData(characteristic) {
console.log("call to emit")
  var socketLabel = getSocketLabel(characteristic.uuid);
  //console.log(socketLabel);

  if(i<7) {
    characteristic.on('read', function(data) {
      console.log(socketLabel + "--" + data.readInt32LE(0));

      if(i == 1) {
        ax = data.readInt32LE(0);
      } else if(i == 2) {
        ay = data.readInt32LE(0);
      } else if(i == 3) {
        az = data.readInt32LE(0);
      } else if(i == 4) {
        gx = data.readInt32LE(0);
      } else if(i == 5) {
        gy = data.readInt32LE(0);
      } else if(i == 6) {
        gz = data.readInt32LE(0);

        console.log(ax + " : " + ay + " : " + az + " : " + gx + " : " + gy + " : " + gz);
        i == 0;
      } 
    });
    i++;

    
  } 
  console.log("My i : " + i);
  characteristic.notify('true', function(error) { if (error) throw error; });
}
