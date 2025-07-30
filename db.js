const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'db.json');

let data = {};

function loadDB() {
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath));
  }
  return data;
}

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getUserData(userId) {
  data[userId] = data[userId] || { envanter: [], ekipman: { silah: null, zirh: null }, can: 100, canMax: 100 };
  return data[userId];
}

module.exports = { loadDB, saveDB, getUserData };
