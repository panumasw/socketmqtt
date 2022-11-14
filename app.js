const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const mqtt = require('mqtt');

const MQTT_SERVER = '203.172.41.44';
const MQTT_PORT = '1883';
//if your server don't have username and password let blank.
const MQTT_USER = 'wiikdev';
const MQTT_PASSWORD = 'Peplin63';

// set the view engine to ejs
app.set('view engine', 'ejs');

//Midedle ware
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Connect MQTT
var client = mqtt.connect({
  host: MQTT_SERVER,
  port: MQTT_PORT,
  username: MQTT_USER,
  password: MQTT_PASSWORD,
});

//Integration socket io
io.on('connection', (socket) => {
  socket.broadcast.emit('chat message', 'มีผู้เชื่อมต่อคนใหม่');
  io.emit('newlog', 'new connect');
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit('chat message', msg);
    client.publish('chatmsg', msg);
  });
});

client.on('connect', function () {
  // Subscribe any topic
  console.log('MQTT Connect');
  // สำหรับกำหนดว่าจะ Subscibe อะไรบ้าง
  client.subscribe('checksign', function (err) {
    if (err) {
      console.log(err);
    }
  });
});

//สำหรับการแสดงผลกรณีที่ต้องรับข้อความจาก Subscribe MQTT
client.on('message', function (topic, message) {
  // message is Buffer
  let msg = message.toString();
  io.emit('chat message', msg);
  console.log(msg);
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});
