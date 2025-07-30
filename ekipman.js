const esyaListesi = require('./esyaListesi');
const { saveDB, getUserData } = require('./db');

function tak(userId, esyaId) {
  const userData = getUserData(userId);
  const esya = userData.envanter.find(e => e.id === esyaId);
  if (!esya) return "Envanterinde böyle bir eşya yok.";
  if (esya.tur !== "silah" && esya.tur !== "zirh") return "Bu eşyayı takamazsın.";

  userData.ekipman[esya.tur] = esyaId;
  saveDB();
  return `${esya.isim} takıldı.`;
}

function ekipmaniGoster(userId) {
  const userData = getUserData(userId);
  const silahId = userData.ekipman.silah;
  const zirhId = userData.ekipman.zirh;

  const silah = silahId ? esyaListesi[silahId]?.isim : "Takılı silah yok";
  const zirh = zirhId ? esyaListesi[zirhId]?.isim : "Takılı zırh yok";

  return `🎯 Ekipmanın:\nSilah: ${silah}\nZırh: ${zirh}`;
}

module.exports = { tak, ekipmaniGoster };
