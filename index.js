require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField } = require("discord.js");
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

client.on("ready", () => {
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
  const args = msg.content.slice(1).split(" ");
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
    const rolesToRemove = msg.member.roles.cache.filter(r => r.name.toLowerCase().match(/kralı|padişahı|hanı|imparatoru|şahı|krallık|komutan|madenci|demirci|çiftçi|balıkçı|terzi|fırıncı|tüccar|simyacı|şifacı|avcısı/));
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

function randomColor() {
  return Math.floor(Math.random()*16777215).toString(16);
}
// --- PART 2 KOMUTLARI ---

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
  const args = msg.content.slice(1).split(" ");
  const cmd = args.shift().toLowerCase();
  const userID = msg.author.id;
  const userData = getUser(userID);

  // /çalış komutu
  if (cmd === "çalış") {
    if (!userData.meslek || !meslekUretim[userData.meslek]) {
      return msg.reply("Mesleğin yok ya da üretim desteklenmiyor.");
    }

    const kazanc = meslekUretim[userData.meslek];
    const üretilen = [];
    for (let item in kazanc) {
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

  // /envanterim komutu
  if (cmd === "envanterim") {
    const envanter = userData.envanter;
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

  // /sat <eşya> <adet>
  if (cmd === "sat") {
    const item = args[0];
    const miktar = parseInt(args[1]);

    if (!item || isNaN(miktar)) return msg.reply("Kullanım: `/sat <eşya> <adet>`");
    if (!userData.envanter[item] || userData.envanter[item] < miktar) {
      return msg.reply("Bu kadar eşyan yok.");
    }

    const fiyat = esyaFiyatlari[item];
    if (!fiyat) return msg.reply("Bu eşya satılamaz.");

    userData.envanter[item] -= miktar;
    if (userData.envanter[item] <= 0) delete userData.envanter[item];
    userData.altin += fiyat * miktar;
    saveDB();

    msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("💸 Satış Yapıldı")
          .setDescription(`• ${item} x${miktar} satıldı.\n• Kazanç: ${fiyat * miktar} altın.`)
          .setColor(randomColor())
      ]
    });
  }

  // /ticaretyap @kullanıcı <eşya> <adet> <fiyat>
  if (cmd === "ticaretyap") {
    const target = msg.mentions.users.first();
    const item = args[1];
    const miktar = parseInt(args[2]);
    const fiyat = parseInt(args[3]);

    if (!target || !item || isNaN(miktar) || isNaN(fiyat)) {
      return msg.reply("Kullanım: `/ticaretyap @kullanıcı <eşya> <adet> <fiyat>`");
    }
    if (!userData.envanter[item] || userData.envanter[item] < miktar) {
      return msg.reply("Bu kadar eşyan yok.");
    }

    const teklifEmbed = new EmbedBuilder()
      .setTitle("🤝 Ticaret Teklifi")
      .setDescription(`${msg.author} sana ${miktar}x **${item}** satmak istiyor.\nFiyat: ${fiyat} altın`)
      .setFooter({ text: "Kabul etmek için: ✅ | Reddetmek için: ❌" })
      .setColor(randomColor());

    const ticaretMsg = await msg.channel.send({ content: `${target}`, embeds: [teklifEmbed] });
    await ticaretMsg.react("✅");
    await ticaretMsg.react("❌");

    const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === target.id;
    ticaretMsg.awaitReactions({ filter, max: 1, time: 30000 }).then(collected => {
      const reaction = collected.first();
      const buyerData = getUser(target.id);

      if (reaction.emoji.name === "✅") {
        if (buyerData.altin < fiyat) {
          return msg.channel.send(`${target} yeterli altının yok!`);
        }
        // işlem
        userData.envanter[item] -= miktar;
        if (userData.envanter[item] <= 0) delete userData.envanter[item];

        if (!buyerData.envanter[item]) buyerData.envanter[item] = 0;
        buyerData.envanter[item] += miktar;

        userData.altin += fiyat;
        buyerData.altin -= fiyat;

        saveDB();
        msg.channel.send(`✅ Ticaret başarıyla tamamlandı.`);
      } else {
        msg.channel.send("❌ Ticaret reddedildi.");
      }
    }).catch(() => {
      msg.channel.send("⏱️ Süre doldu, ticaret iptal edildi.");
    });
  }

});
// --- PART 3: Asker, Krallık, Savaş ---

// /askeroluştur <tür> <adet>
if (cmd === "askeroluştur") {
  const tip = args[0];
  const adet = parseInt(args[1]);

  if (!askerTipleri[tip]) return msg.reply("Geçersiz asker türü. (kılıç, okçu, atlı)");
  if (isNaN(adet) || adet <= 0) return msg.reply("Geçerli bir adet gir.");

  const toplamMaliyet = askerTipleri[tip].maliyet * adet;
  if (userData.altin < toplamMaliyet) return msg.reply("Yeterli altının yok.");

  userData.altin -= toplamMaliyet;
  if (!userData.ordu) userData.ordu = {};
  userData.ordu[tip] = (userData.ordu[tip] || 0) + adet;
  saveDB();

  msg.reply(`✅ ${adet} adet ${tip} askeri oluşturuldu.`);
}

// /ordum
if (cmd === "ordum") {
  const ordu = userData.ordu || {};
  const liste = Object.entries(ordu).map(([k, v]) => `• ${k}: ${v}`).join("\n") || "Ordun yok.";

  msg.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🛡️ Ordun")
        .setDescription(liste)
        .setColor(randomColor())
    ]
  });
}

// /savaş @kullanıcı
if (cmd === "savaş") {
  const target = msg.mentions.users.first();
  if (!target) return msg.reply("Bir kullanıcı etiketle.");
  if (target.id === userID) return msg.reply("Kendinle savaşamazsın.");

  const savasci = getUser(userID);
  const hedef = getUser(target.id);

  const savasGucu = (user) => {
    return Object.entries(user.ordu || {})
      .reduce((toplam, [tip, adet]) => toplam + (adet * askerTipleri[tip].güç), 0);
  };

  const seninGuc = savasGucu(savasci);
  const hedefGuc = savasGucu(hedef);

  let sonuc = "";
  if (seninGuc > hedefGuc) {
    const ganimet = Math.floor(hedef.altin * 0.2);
    savasci.altin += ganimet;
    hedef.altin -= ganimet;
    sonuc = `${msg.author} savaşı kazandı! 💰 ${ganimet} altın yağmalandı.`;
  } else if (seninGuc < hedefGuc) {
    const ganimet = Math.floor(savasci.altin * 0.2);
    hedef.altin += ganimet;
    savasci.altin -= ganimet;
    sonuc = `${target} savaşı kazandı! 💰 ${ganimet} altın yağmalandı.`;
  } else {
    sonuc = "⚔️ Savaş berabere bitti. Kimse üstünlük kuramadı.";
  }

  saveDB();
  msg.channel.send(`🪖 **Savaş Raporu**\n${sonuc}`);
}

// /krallıkoluştur <isim>
if (cmd === "krallıkoluştur") {
  const isim = args.join(" ");
  if (!isim) return msg.reply("Krallık ismini gir.");
  if (userData.krallik) return msg.reply("Zaten bir krallığa bağlısın.");

  userData.krallik = isim;
  userData.krallikRol = "kral";
  saveDB();
  msg.reply(`👑 ${isim} adlı krallık kuruldu. Tebrikler kral!`);
}

// /krallığım
if (cmd === "krallığım") {
  if (!userData.krallik) return msg.reply("Bir krallığa bağlı değilsin.");
  msg.reply(`🏰 Krallık: ${userData.krallik}\n👑 Rol: ${userData.krallikRol || "vatandaş"}`);
}

// /vergiayarla <oran>
if (cmd === "vergiayarla") {
  const oran = parseFloat(args[0]);
  if (userData.krallikRol !== "kral") return msg.reply("Sadece kral vergiyi ayarlayabilir.");
  if (isNaN(oran) || oran < 0 || oran > 1) return msg.reply("0 ile 1 arasında bir oran gir (örn: 0.2)");

  userData.vergi = oran;
  saveDB();
  msg.reply(`📊 Vergi oranı %${oran * 100} olarak ayarlandı.`);
}

// /isyanyap
if (cmd === "isyanyap") {
  if (!userData.krallik || userData.krallikRol === "kral") return msg.reply("İsyan edemezsin.");
  const sans = Math.random();
  if (sans > 0.5) {
    userData.krallik = null;
    userData.krallikRol = null;
    saveDB();
    msg.reply("🔥 İsyan başarılı! Artık özgürsün.");
  } else {
    msg.reply("❌ İsyan başarısız oldu. Krallık seni bastırdı.");
  }
}
const gorevler = [
  { id: 1, aciklama: "10 altın kazan", kontrol: (u) => u.altin >= 10, ödül: 20 },
  { id: 2, aciklama: "5 asker oluştur", kontrol: (u) => {
    const o = u.ordu || {};
    return Object.values(o).reduce((t, a) => t + a, 0) >= 5;
  }, ödül: 30 },
  { id: 3, aciklama: "Bir savaş kazan", kontrol: (u) => u.gorev_kazandi, ödül: 50 },
];
// /görev
if (cmd === "görev") {
  const tamamlanan = userData.tamamlananGorevler || [];
  const liste = gorevler.map(g => {
    const durum = tamamlanan.includes(g.id) ? "✅" : "🕒";
    return `${durum} [${g.id}] ${g.aciklama} → Ödül: ${g.ödül} altın`;
  }).join("\n");

  msg.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("📜 Günlük Görevler")
        .setDescription(liste)
        .setColor(randomColor())
    ]
  });
}

// /göreval <id>
if (cmd === "göreval") {
  const id = parseInt(args[0]);
  const gorev = gorevler.find(g => g.id === id);
  if (!gorev) return msg.reply("Geçersiz görev ID.");
  
  if (!gorev.kontrol(userData)) return msg.reply("Görev şartları henüz sağlanmadı.");
  userData.tamamlananGorevler = userData.tamamlananGorevler || [];
  if (userData.tamamlananGorevler.includes(id)) return msg.reply("Bu görevi zaten tamamladın.");

  userData.altin += gorev.ödül;
  userData.tamamlananGorevler.push(id);
  saveDB();

  msg.reply(`🎉 Görev tamamlandı! ${gorev.ödül} altın kazandın.`);
}
const siniflar = {
  "şövalye": { bonus: "asker", açıklama: "Ordun %10 daha güçlü." },
  "büyücü": { bonus: "gelir", açıklama: "Gelirlerin %15 artar." },
  "hırsız": { bonus: "yağma", açıklama: "Savaşta %20 daha fazla altın çalarsın." }
};
// /sınıfseç <sınıf>
if (cmd === "sınıfseç") {
  const sinif = args[0]?.toLowerCase();
  if (!siniflar[sinif]) return msg.reply("Geçersiz sınıf. (şövalye, büyücü, hırsız)");
  if (userData.sinif) return msg.reply("Sınıfın zaten seçilmiş, değiştirilemez.");

  userData.sinif = sinif;
  saveDB();
  msg.reply(`🧬 ${sinif.toUpperCase()} sınıfına katıldın. ${siniflar[sinif].açıklama}`);
}

// /sınıfım
if (cmd === "sınıfım") {
  const s = userData.sinif;
  if (!s) return msg.reply("Henüz bir sınıf seçmedin.");
  msg.reply(`🧪 Sınıfın: ${s.toUpperCase()} → ${siniflar[s].açıklama}`);
}
let ganimet = Math.floor(hedef.altin * 0.2);
if (savasci.sinif === "hırsız") ganimet = Math.floor(ganimet * 1.2);
let gelir = Math.floor(...);
if (userData.sinif === "büyücü") gelir = Math.floor(gelir * 1.15);
const savasGucu = (user) => {
  let toplam = Object.entries(user.ordu || {})
    .reduce((t, [tip, adet]) => t + (adet * askerTipleri[tip].güç), 0);
  if (user.sinif === "şövalye") toplam = Math.floor(toplam * 1.1);
  return toplam;
};
const bolgeler = [
  { id: 1, ad: "Yeşilova", gelir: 10 },
  { id: 2, ad: "Karakış", gelir: 15 },
  { id: 3, ad: "Altındere", gelir: 20 },
  { id: 4, ad: "Kızıltepe", gelir: 25 },
  { id: 5, ad: "Buzyayla", gelir: 30 },
];
if (cmd === "bölgem") {
  const sahip = userData.bolgeler || [];
  if (sahip.length === 0) return msg.reply("Hiç bölgen yok.");
  
  const liste = sahip.map(id => {
    const b = bolgeler.find(x => x.id === id);
    return `🏞️ ${b.ad} → +${b.gelir} altın/gelir`;
  }).join("\n");

  msg.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("📍 Sahip Olduğun Bölgeler")
        .setDescription(liste)
        .setColor(randomColor())
    ]
  });
}
if (cmd === "fethet") {
  const id = parseInt(args[0]);
  const bolge = bolgeler.find(b => b.id === id);
  if (!bolge) return msg.reply("Böyle bir bölge yok.");

  userData.bolgeler = userData.bolgeler || [];
  if (userData.bolgeler.includes(id)) return msg.reply("Bu bölge zaten senin.");

  const ordun = Object.entries(userData.ordu || {}).reduce((t, [tip, adet]) => t + adet, 0);
  if (ordun < 5) return msg.reply("En az 5 asker gerekli.");

  const sans = Math.random();
  if (sans < 0.6) {
    return msg.reply("❌ Fetih başarısız oldu. Daha güçlü bir ordu ile tekrar dene.");
  }

  userDat
let gelir = 0;
if (userData.bolgeler?.length) {
  for (const id of userData.bolgeler) {
    const bolge = bolgeler.find(b => b.id === id);
    gelir += bolge.gelir;
  }
}

if (userData.sinif === "büyücü") gelir = Math.floor(gelir * 1.15);
userData.altin += gelir;
userData.ittifak = userData.ittifak || null; // ittifak adı
userData.bolgeler = userData.bolgeler || [];
if (cmd === "ittifak-kur") {
  const ad = args.join(" ");
  if (!ad) return msg.reply("İttifak ismi belirt.");
  if (userData.ittifak) return msg.reply("Zaten bir ittifaka aitsin.");

  const mevcut = db.filter(u => u.ittifak === ad);
  if (mevcut.length > 0) return msg.reply("Bu isimde bir ittifak zaten var.");

  userData.ittifak = ad;
  saveDB();
  msg.reply(`✅ "${ad}" adında bir ittifak kurdun.`);
}
if (cmd === "ittifak-katıl") {
  const hedef = msg.mentions.users.first();
  if (!hedef) return msg.reply("Birini etiketlemelisin.");

  const hedefData = db[hedef.id];
  if (!hedefData?.ittifak) return msg.reply("Bu oyuncunun bir ittifakı yok.");
  if (userData.ittifak) return msg.reply("Zaten bir ittifaktasın.");

  userData.ittifak = hedefData.ittifak;
  saveDB();
  msg.reply(`✅ "${hedefData.ittifak}" ittifakına katıldın.`);
}
userData.savaslar = userData.savaslar || []; // aktifle savaşta olunan oyuncuların ID'leri
if (cmd === "savaş") {
  const hedef = msg.mentions.users.first();
  if (!hedef || hedef.id === msg.author.id) return msg.reply("Geçerli bir hedef belirt.");
  
  const hedefData = db[hedef.id];
  if (!hedefData) return msg.reply("Bu kullanıcı kayıtlı değil.");

  if (userData.savaslar?.includes(hedef.id)) return msg.reply("Zaten savaş halindesiniz.");

  userData.savaslar = userData.savaslar || [];
  hedefData.savaslar = hedefData.savaslar || [];

  userData.savaslar.push(hedef.id);
  hedefData.savaslar.push(msg.author.id);
  saveDB();

  msg.reply(`⚔️ ${hedef.username} ile savaşa girdin!`);
}
if (cmd === "barış") {
  const hedef = msg.mentions.users.first();
  if (!hedef) return msg.reply("Birini etiketle.");

  const hedefData = db[hedef.id];
  if (!hedefData?.savaslar?.includes(msg.author.id)) return msg.reply("Bu kişiyle savaşta değilsiniz.");

  userData.savaslar = userData.savaslar.filter(id => id !== hedef.id);
  hedefData.savaslar = hedefData.savaslar.filter(id => id !== msg.author.id);
  saveDB();

  msg.reply(`🤝 ${hedef.username} ile barış yaptınız.`);
}
// Kullanıcı verisine ekle
userData.envanter = userData.envanter || []; 
// Örnek envanter: [{id: 'kılıç', isim: 'Demir Kılıç', hasar: 10, adet: 1}]
const esyaListesi = {
  kilic: { isim: "Demir Kılıç", tur: "silah", hasar: 10 },
  yari: { isim: "Uzun Yarı", tur: "silah", hasar: 15 },
  zırh: { isim: "Derin Zırh", tur: "zirh", dayanıklilik: 20 },
  sifaIksiri: { isim: "Şifa İksiri", tur: "tüketilebilir", iyilesme: 50 }
};
if (cmd === "esya-ekle") {
  const esyaId = args[0];
  if (!esyaListesi[esyaId]) return msg.reply("Böyle bir eşya yok.");

  let esya = userData.envanter.find(e => e.id === esyaId);
  if (esya) {
    esya.adet++;
  } else {
    userData.envanter.push({ ...esyaListesi[esyaId], id: esyaId, adet: 1 });
  }
  saveDB();
  msg.reply(`${esyaListesi[esyaId].isim} envanterine eklendi!`);
}
if (cmd === "envanter") {
  if (!userData.envanter.length) return msg.reply("Envanterin boş.");
  let liste = userData.envanter.map(e => `${e.isim} x${e.adet}`).join("\n");
  msg.reply(`👜 Envanterin:\n${liste}`);
}
userData.ekipman = userData.ekipman || { silah: null, zirh: null };
if (cmd === "tak") {
  const esyaId = args[0];
  const esya = userData.envanter.find(e => e.id === esyaId);
  if (!esya) return msg.reply("Envanterinde böyle bir eşya yok.");
  if (esya.tur !== "silah" && esya.tur !== "zirh") return msg.reply("Bu eşyayı takamazsın.");

  userData.ekipman[esya.tur] = esyaId;
  saveDB();
  msg.reply(`${esya.isim} takıldı.`);
}
if (cmd === "ekipman") {
  const silahId = userData.ekipman.silah;
  const zirhId = userData.ekipman.zirh;

  const silah = silahId ? esyaListesi[silahId]?.isim : "Takılı silah yok";
  const zirh = zirhId ? esyaListesi[zirhId]?.isim : "Takılı zırh yok";

  msg.reply(`🎯 Ekipmanın:\nSilah: ${silah}\nZırh: ${zirh}`);
}
if (cmd === "kullan") {
  const esyaId = args[0];
  const esya = userData.envanter.find(e => e.id === esyaId);
  if (!esya) return msg.reply("Envanterinde böyle bir eşya yok.");
  if (esya.tur !== "tüketilebilir") return msg.reply("Bu eşyayı kullanamazsın.");

  // Canı arttır (örnek, oyuncunun canı olabilir)
  userData.can = Math.min(userData.canMax, (userData.can || userData.canMax) + esya.iyilesme);

  esya.adet--;
  if (esya.adet <= 0) userData.envanter = userData.envanter.filter(e => e.id !== esyaId);
  
  saveDB();
  msg.reply(`${esya.isim} kullanıldı. Canın: ${userData.can}/${userData.canMax}`);
}

client.login(process.env.TOKEN);
