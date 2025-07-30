require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const dataPath = "./data.json";
let db = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {};

function saveDB() {
  fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
}

function getUser(id) {
  if (!db[id]) db[id] = { altin: 0, envanter: {}, meslek: null, krallik: null };
  return db[id];
}

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

client.once("ready", () => {
  console.log(`Bot hazır: ${client.user.tag}`);
});

client.on("guildMemberAdd", member => {
  const rol = member.guild.roles.cache.find(r => r.name.includes("Köylü"));
  if (rol) member.roles.add(rol).catch(console.error);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const lower = msg.content.toLowerCase();
  if (["sa", "slm", "selam"].includes(lower)) {
    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Aleyküm selam hoşgeldin!")
          .setDescription("Feth edilmeye hazır ol! ⚔️")
          .setColor(randomColor())
      ]
    });
  }

  if (!msg.content.startsWith("/")) return;

  const args = msg.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const authorID = msg.author.id;
  const userData = getUser(authorID);

  if (cmd === "yardim") {
    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Yardım Menüsü")
          .setDescription("Komutlar kategorili olarak listelendi. Diğer partlarda devamı gelecek.")
          .addFields(
            { name: "Genel", value: "`/yardim`, `/altınım`, `/envanterim`, `/mesleğim`" },
            { name: "Kayıt", value: "`/kayıt @Meslek [Krallık]`, `/terket`" }
          )
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "altınım") {
    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("💰 Altın Bilgisi")
          .setDescription(`Cebindeki altın miktarı: **${userData.altin}**`)
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "kayıt") {
    const meslekRol = msg.mentions.roles.first();
    const krallik = args[1] || null;

    if (!meslekRol) {
      return msg.reply({ content: "Lütfen bir meslek rolü etiketleyin!" });
    }

    await msg.member.roles.add(meslekRol).catch(console.error);
    if (krallik) {
      const krRol = msg.guild.roles.cache.find(r => r.name.toLowerCase().includes(krallik.toLowerCase()));
      if (krRol) {
        await msg.member.roles.add(krRol).catch(console.error);
        userData.krallik = krallik;
      }
    }
    userData.meslek = meslekRol.name;
    saveDB();
    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Kayıt Tamamlandı")
          .setDescription(`Mesleğin: ${meslekRol.name}${krallik ? `\nKrallık: ${krallik}` : ""}`)
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "terket") {
    const rolesToRemove = msg.member.roles.cache.filter(r =>
      /kralı|padişahı|hanı|imparatoru|şahı|krallık|komutan|madenci|demirci|çiftçi|balıkçı|terzi|fırıncı|tüccar|simyacı|şifacı|avcısı/i.test(r.name)
    );
    msg.member.roles.remove(rolesToRemove).catch(console.error);
    userData.krallik = null;
    saveDB();
    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📤 Krallıktan Ayrıldın")
          .setDescription("Krallık rollerin alındı, sadece meslek rolün kaldı.")
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "esyalistesi") {
    const liste = [
      "Ekmek - Aqhw123",
      "Kılıç - Hydh546",
      "Zırh - ZRHG78",
      "Et - MEAT99",
      "İksir - ALCH32"
    ];
    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📦 Eşya Listesi")
          .setDescription(liste.map(e => `• ${e}`).join("\n"))
          .setColor(randomColor())
      ]
    });
  }

});
module.exports = { client, getUser, saveDB, randomColor };
const { client, getUser, saveDB, randomColor } = require("./part1");
const { EmbedBuilder } = require("discord.js");

const meslekUretim = {
  "Çiftçi": { "Buğday": 2 },
  "Madenci": { "Demir": 1 },
  "Balıkçı": { "Balık": 3 },
  "Fırıncı": { "Ekmek": 1 },
  "Avcı": { "Et": 2 },
  "Terzi": { "Kumaş": 1 },
  "Tüccar": {}, // pasif üretim yapmaz
  "Simyacı": { "İksir": 1 }
};

const esyaFiyatlari = {
  "Buğday": 5,
  "Demir": 10,
  "Balık": 4,
  "Ekmek": 7,
  "Et": 6,
  "Kumaş": 8,
  "İksir": 15
};

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("/")) return;
  const args = msg.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const userID = msg.author.id;
  const userData = getUser(userID);

  if (cmd === "çalış") {
    if (!userData.meslek || !meslekUretim[userData.meslek]) {
      return msg.reply("Mesleğin yok ya da üretim desteklenmiyor.");
    }

    const kazanc = meslekUretim[userData.meslek];
    const üretilen = [];
    for (const item in kazanc) {
      if (!userData.envanter[item]) userData.envanter[item] = 0;
      userData.envanter[item] += kazanc[item];
      üretilen.push(`+${kazanc[item]} ${item}`);
    }
    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚒️ Üretim Tamamlandı")
          .setDescription(üretilen.join("\n"))
          .setFooter({ text: `Meslek: ${userData.meslek}` })
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "envanterim") {
    const envanter = userData.envanter || {};
    const liste = Object.keys(envanter).length
      ? Object.entries(envanter).map(([k, v]) => `• ${k}: ${v}`).join("\n")
      : "Envanterin boş.";

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎒 Envanterin")
          .setDescription(liste)
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "sat") {
    const item = args[0];
    const miktar = parseInt(args[1]);

    if (!item || isNaN(miktar)) return msg.reply("Kullanım: `/sat <eşya> <miktar>`");
    if (!userData.envanter[item] || userData.envanter[item] < miktar) {
      return msg.reply("Yeterli eşyan yok.");
    }
    if (!esyaFiyatlari[item]) return msg.reply("Bu eşya satılamaz.");

    const fiyat = esyaFiyatlari[item] * miktar;
    userData.envanter[item] -= miktar;
    userData.altin += fiyat;
    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("💰 Satış Başarılı")
          .setDescription(`${miktar} ${item} sattın ve ${fiyat} altın kazandın.`)
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "ticaret") {
    const partner = msg.mentions.members.first();
    if (!partner) return msg.reply("Lütfen ticaret yapacağın kişiyi etiketle.");
    const item = args[1];
    const miktar = parseInt(args[2]);

    if (!item || isNaN(miktar)) return msg.reply("Kullanım: `/ticaret @kullanıcı <eşya> <miktar>`");

    const userEnvanter = userData.envanter || {};
    if (!userEnvanter[item] || userEnvanter[item] < miktar) return msg.reply("Yeterli eşyan yok.");

    const partnerData = getUser(partner.id);
    if (!partnerData.envanter[item]) partnerData.envanter[item] = 0;

    userEnvanter[item] -= miktar;
    partnerData.envanter[item] += miktar;
    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🤝 Ticaret Başarılı")
          .setDescription(`${miktar} ${item} ${partner.user.tag}'a gönderildi.`)
          .setColor(randomColor())
      ]
    });
  }
});
const { client, getUser, saveDB, randomColor } = require("./part1");
const { EmbedBuilder } = require("discord.js");

// Asker tipleri ve özellikleri
const askerTipleri = {
  kılıç: { güç: 5, maliyet: 10 },
  okçu: { güç: 3, maliyet: 8 },
  atlı: { güç: 7, maliyet: 15 }
};

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("/")) return;

  const args = msg.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const userID = msg.author.id;
  const userData = getUser(userID);

  if (cmd === "askeral") {
    const tip = args[0];
    const miktar = parseInt(args[1]);
    if (!tip || !askerTipleri[tip]) return msg.reply("Geçerli asker tipi giriniz (kılıç, okçu, atlı).");
    if (isNaN(miktar) || miktar < 1) return msg.reply("Geçerli miktar giriniz.");

    const toplamMaliyet = askerTipleri[tip].maliyet * miktar;
    if (userData.altin < toplamMaliyet) return msg.reply("Yeterli altının yok.");

    if (!userData.envanter) userData.envanter = {};
    if (!userData.envanter[tip]) userData.envanter[tip] = 0;

    userData.envanter[tip] += miktar;
    userData.altin -= toplamMaliyet;
    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🛡️ Asker Alındı")
          .setDescription(`${miktar} adet ${tip} askeri satın aldın.`)
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "savaş") {
    const hedef = msg.mentions.members.first();
    if (!hedef) return msg.reply("Savaşmak için birisini etiketle.");

    if (hedef.user.bot) return msg.reply("Botlara savaş açamazsın.");
    if (hedef.id === userID) return msg.reply("Kendinle savaşamazsın.");

    const rakipData = getUser(hedef.id);

    // Kullanıcının asker gücü
    const kullaniciAsker = userData.envanter || {};
    const rakipAsker = rakipData.envanter || {};

    let kullaniciGuc = 0;
    let rakipGuc = 0;

    for (const tip in askerTipleri) {
      kullaniciGuc += (kullaniciAsker[tip] || 0) * askerTipleri[tip].güç;
      rakipGuc += (rakipAsker[tip] || 0) * askerTipleri[tip].güç;
    }

    if (kullaniciGuc === 0) return msg.reply("Senin askerlerin yok.");
    if (rakipGuc === 0) return msg.reply("Rakibin askerleri yok.");

    // Basit savaş sonucu
    let kazanan, kaybeden;
    if (kullaniciGuc > rakipGuc) {
      kazanan = msg.author;
      kaybeden = hedef.user;
    } else if (rakipGuc > kullaniciGuc) {
      kazanan = hedef.user;
      kaybeden = msg.author;
    } else {
      return msg.reply("Savaş berabere bitti!");
    }

    // Kaybedenin askerlerinin %50'si yok olur
    for (const tip in askerTipleri) {
      if (kaybeden.id === userID) {
        userData.envanter[tip] = Math.max(0, (userData.envanter[tip] || 0) - Math.floor((userData.envanter[tip] || 0) * 0.5));
      } else if (kaybeden.id === hedef.id) {
        rakipData.envanter[tip] = Math.max(0, (rakipData.envanter[tip] || 0) - Math.floor((rakipData.envanter[tip] || 0) * 0.5));
      }
    }

    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚔️ Savaş Sonucu")
          .setDescription(`${kazanan.tag} savaşı kazandı!\n${kaybeden.tag} askerlerinin yarısı kayboldu.`)
          .setColor(randomColor())
      ]
    });
  }

  if (cmd === "ittifak") {
    const isim = args.join(" ");
    if (!isim) return msg.reply("Lütfen ittifak ismi girin.");
    userData.ittifak = isim;
    saveDB();
    msg.reply(`İttifakın başarıyla '${isim}' olarak ayarlandı.`);
  }

  if (cmd === "günlük") {
    if (!userData.sonGünlük) userData.sonGünlük = 0;
    const now = Date.now();
    if (now - userData.sonGünlük < 24 * 60 * 60 * 1000) {
      return msg.reply("Günlük ödülünü zaten aldın, 24 saat bekle.");
    }
    const gelir = Math.floor(Math.random() * 50) + 50;
    userData.altin += gelir;
    userData.sonGünlük = now;
    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎁 Günlük Ödül")
          .setDescription(`Bugünkü altın ödülünü aldın: **${gelir}**`)
          .setColor(randomColor())
      ]
    });
  }
});
client.login(process.env.TOKEN)
