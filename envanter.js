const esyaListesi = require('./esyaListesi');
const { saveDB, getUserData } = require('./db');

function esyaEkle(userId, esyaId) {
  const userData = getUserData(userId);
  if (!esyaListesi[esyaId]) return false;

  let esya = userData.envanter.find(e => e.id === esyaId);
  if (esya) {
    esya.adet++;
  } else {
    userData.envanter.push({ ...esyaListesi[esyaId], id: esyaId, adet: 1 });
  }
  saveDB();
  return true;
}

function envanteriListele(userId) {
  const userData = getUserData(userId);
  if (!userData.envanter.length) return "Envanterin boş.";
  return userData.envanter.map(e => `${e.isim} x${e.adet}`).join("\n");
}

function kullan(userId, esyaId) {
  const userData = getUserData(userId);
  const esya = userData.envanter.find(e => e.id === esyaId);
  if (!esya) return "Envanterinde böyle bir eşya yok.";
  if (esya.tur !== "tüketilebilir") return "Bu eşyayı kullanamazsın.";

  userData.can = Math.min(userData.canMax, (userData.can || userData.canMax) + esya.iyilesme);
  esya.adet--;
  if (esya.adet <= 0) {
    userData.envanter = userData.envanter.filter(e => e.id !== esyaId);
  }
  saveDB();
  return `${esya.isim} kullanıldı. Canın: ${userData.can}/${userData.canMax}`;
}

module.exports = { esyaEkle, envanteriListele, kullan };
