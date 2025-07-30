import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Komut tanımları (tam liste, tüm komutlar burada)
const commands = [
  new SlashCommandBuilder().setName('yardim').setDescription('Tüm komutları listeler'),
  new SlashCommandBuilder().setName('kayıt').setDescription('Meslek rolü ve opsiyonel krallık verir').addStringOption(o => o.setName('meslek').setDescription('Meslek rolü').setRequired(true)).addStringOption(o => o.setName('krallık').setDescription('Krallık rolü')),
  new SlashCommandBuilder().setName('terket').setDescription('Krallıktan ayrılır'),
  new SlashCommandBuilder().setName('altınım').setDescription('Altın miktarını gösterir'),
  new SlashCommandBuilder().setName('esyalistesi').setDescription('Meslek eşyalarını listeler'),
  new SlashCommandBuilder().setName('altınekle').setDescription('Altın ekler').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true)),
  new SlashCommandBuilder().setName('altınsil').setDescription('Altın siler').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true)),
  new SlashCommandBuilder().setName('rolver').setDescription('Rol verir').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  new SlashCommandBuilder().setName('krallıkaltını').setDescription('Krallık altınını gösterir').addStringOption(o => o.setName('krallık').setDescription('Krallık')),
  new SlashCommandBuilder().setName('krallıktanat').setDescription('Krallıktan atar').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(true)),
  new SlashCommandBuilder().setName('savaşbaşlat').setDescription('Genel savaş başlatır'),
  new SlashCommandBuilder().setName('savaşbitir').setDescription('Genel savaşı bitirir'),
  new SlashCommandBuilder().setName('meslekal').setDescription('Meslek rolü alır').addStringOption(o => o.setName('meslek').setDescription('Meslek').setRequired(true)),
  new SlashCommandBuilder().setName('mesleğim').setDescription('Mesleğini gösterir'),
  new SlashCommandBuilder().setName('çalış').setDescription('Mesleğe göre çalışır'),
  new SlashCommandBuilder().setName('ticaretyap').setDescription('Ticaret isteği gönderir').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addStringOption(o => o.setName('eşya_kodu').setDescription('Eşya Kodu').setRequired(true)).addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true)).addIntegerOption(o => o.setName('fiyat').setDescription('Fiyat').setRequired(true)),
  new SlashCommandBuilder().setName('envanterim').setDescription('Envanteri gösterir'),
  new SlashCommandBuilder().setName('askeroluştur').setDescription('Asker oluşturur'),
  new SlashCommandBuilder().setName('baskın').setDescription('Baskın düzenler').addStringOption(o => o.setName('krallık').setDescription('Krallık').setRequired(true)).addIntegerOption(o => o.setName('asker_sayısı').setDescription('Asker Sayısı').setRequired(true)).addIntegerOption(o => o.setName('bölüm').setDescription('Bölüm').setRequired(true)),
  new SlashCommandBuilder().setName('saldır').setDescription('Saldırı yapar').addStringOption(o => o.setName('krallık').setDescription('Krallık').setRequired(true)).addIntegerOption(o => o.setName('asker_sayısı').setDescription('Asker Sayısı').setRequired(true)).addIntegerOption(o => o.setName('bölüm').setDescription('Bölüm').setRequired(true)),
  new SlashCommandBuilder().setName('isyançıkar').setDescription('İsyan başlatır').addStringOption(o => o.setName('krallık').setDescription('Krallık').setRequired(true)).addIntegerOption(o => o.setName('asker_sayısı').setDescription('Asker Sayısı').setRequired(true)),
  new SlashCommandBuilder().setName('topraklar').setDescription('Tüm krallıkların toprak sayısını gösterir'),
  new SlashCommandBuilder().setName('veliahtdevret').setDescription('Veliaht devri'),
  new SlashCommandBuilder().setName('ban').setDescription('Banlar').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(true)),
  new SlashCommandBuilder().setName('unban').setDescription('Ban kaldırır').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Zaman aşımı uygular').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addStringOption(o => o.setName('süre').setDescription('Saat:Dakika formatında').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('Zaman aşımı kaldırır').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)),
  new SlashCommandBuilder().setName('dm').setDescription('DM atar').addUserOption(o => o.setName('kişi').setDescription('Kişi').setRequired(true)).addStringOption(o => o.setName('mesaj').setDescription('Mesaj').setRequired(true)),
];

// Komutları REST API'ye kayıt etme
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Komutlar yükleniyor...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('Komutlar yüklendi.');
  } catch (error) {
    console.error(error);
  }
})();

// Kullanıcıların altın, roller, meslek, krallık vb bilgilerini saklamak için basit bellek tabanlı yapı (gerçek uygulamada DB kullanmalısın)
const users = new Map();
const krallikAltin = new Map(); // krallık => altın
const aktifSavas = { aktif: false };

function embedMesaj(description, color = 0x00ff00) {
  return new EmbedBuilder()
    .setDescription(description)
    .setColor(color);
}

// Yetki kontrol fonksiyonu örneği
function yetkiKontrol(interaction, roller) {
  if (!roller.some(r => interaction.member.roles.cache.some(role => role.name === r))) {
    interaction.reply({ embeds: [embedMesaj('Bu komutu kullanmak için yetkiniz yok.', 0xff0000)], ephemeral: true });
    return false;
  }
  return true;
}

client.on('ready', () => {
  console.log(`${client.user.tag} aktif!`);
  client.user.setActivity('Feth edilmek için hazır!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'yardim':
        {
          const embed = new EmbedBuilder()
            .setTitle('🌟 Güncel Komutlar & Kullanıcılar')
            .setColor(0x3498db)
            .setDescription(
              '`/yardim` - Tüm komutları gösterir\n' +
              '`/kayıt (@Meslek) (Krallık)` - Meslek ve krallık rolü verir\n' +
              '`/terket` - Krallıktan ayrılır\n' +
              '`/altınım` - Altın miktarını gösterir\n' +
              '`/esyalistesi` - Meslek eşyalarını listeler\n' +
              '`/altınekle (@kişi) (miktar)` - Altın ekler\n' +
              '`/altınsil (@kişi) (miktar)` - Altın siler\n' +
              '`/rolver (@kişi) (@rol)` - Rol verir\n' +
              '`/krallıkaltını` - Krallık altınını gösterir\n' +
              '`/krallıktanat (@kişi) (sebep)` - Krallıktan atar\n' +
              '`/savaşbaşlat` - Genel savaş başlatır\n' +
              '`/savaşbitir` - Genel savaşı bitirir\n' +
              '`/meslekal (@meslek)` - Meslek rolü alır\n' +
              '`/mesleğim` - Mesleğini gösterir\n' +
              '`/çalış` - Mesleğe göre çalışır\n' +
              '`/ticaretyap (@kişi) (eşya kodu) (miktar) (fiyat)` - Ticaret isteği gönderir\n' +
              '`/envanterim` - Envanteri gösterir\n' +
              '`/askeroluştur` - Asker oluşturur\n' +
              '`/baskın (@krallık) (asker sayısı) (bölüm)` - Baskın düzenler\n' +
              '`/saldır (@krallık) (asker sayısı) (bölüm)` - Saldırı yapar\n' +
              '`/isyançıkar (@krallık) (asker sayısı)` - İsyan başlatır\n' +
              '`/topraklar` - Tüm krallıkların toprak sayısını gösterir\n' +
              '`/veliahtdevret` - Veliaht devri\n' +
              '`/ban (@kişi) (sebep)` - Banlar\n' +
              '`/unban (@kişi)` - Ban kaldırır\n' +
              '`/mute (@kişi) (saat:dakika)` - Zaman aşımı uygular\n' +
              '`/unmute (@kişi)` - Zaman aşımı kaldırır\n' +
              '`/dm (@kişi) (mesaj)` - DM atar\n'
            )
            .setFooter({ text: 'Bot tarafından sağlanmıştır.' });
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        break;

      case 'kayıt': {
        if (!yetkiKontrol(interaction, ['Kayıt Sorumlusu', 'Admin', 'Founder'])) return;

        const meslek = interaction.options.getString('meslek');
        const krallik = interaction.options.getString('krallık');
        const member = interaction.member;

        try {
          if (meslek) {
            const meslekRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === meslek.toLowerCase());
            if (meslekRole) await member.roles.add(meslekRole);
            else return interaction.reply({ content: 'Meslek rolü bulunamadı.', ephemeral: true });
          }

          if (krallik) {
            const krallikRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === krallik.toLowerCase());
            if (krallikRole) await member.roles.add(krallikRole);
            else return interaction.reply({ content: 'Krallık rolü bulunamadı.', ephemeral: true });
          }

          await interaction.reply({ content: `Başarıyla kayıt yapıldı!`, ephemeral: true });
        } catch (err) {
          await interaction.reply({ content: `Bir hata oluştu: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'terket': {
        const member = interaction.member;
        // Krallık rolleri örnek, isimlere göre filtrele
        const krallikRolleri = member.roles.cache.filter(r => r.name.includes('Krallık') || r.name.includes('krallık'));
        try {
          await member.roles.remove(krallikRolleri);
          await interaction.reply({ content: 'Krallıktan ayrıldınız.', ephemeral: true });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'altınım': {
        const userId = interaction.user.id;
        const userData = users.get(userId) || { altin: 0 };
        await interaction.reply({ embeds: [embedMesaj(`Altın miktarınız: ${userData.altin}`)] });
        break;
      }

      case 'esyalistesi': {
        // Sabit eşyalar
        const esyalar = [
          { isim: 'Kılıç', kod: 'kılıc' },
          { isim: 'Zırh', kod: 'zirh' },
          { isim: 'Kalkan', kod: 'kalkan' },
          { isim: 'Ok', kod: 'ok' },
          { isim: 'Balta', kod: 'balta' },
        ];

        const liste = esyalar.map(e => `**${e.isim}** - Kod: \`${e.kod}\``).join('\n');

        await interaction.reply({ embeds: [embedMesaj(`Meslek Eşyaları ve Kodları:\n${liste}`)] });
        break;
      }

      case 'altınekle': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getUser('kişi');
        const miktar = interaction.options.getInteger('miktar');

        if (!kisi || miktar <= 0) return interaction.reply({ content: 'Geçerli kullanıcı ve miktar giriniz.', ephemeral: true });

        const userData = users.get(kisi.id) || { altin: 0 };
        userData.altin += miktar;
        users.set(kisi.id, userData);

        await interaction.reply({ embeds: [embedMesaj(`${kisi.tag} kullanıcısına ${miktar} altın eklendi.`)] });
        break;
      }

      case 'altınsil': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getUser('kişi');
        const miktar = interaction.options.getInteger('miktar');

        if (!kisi || miktar <= 0) return interaction.reply({ content: 'Geçerli kullanıcı ve miktar giriniz.', ephemeral: true });

        const userData = users.get(kisi.id) || { altin: 0 };
        userData.altin -= miktar;
        if (userData.altin < 0) userData.altin = 0;
        users.set(kisi.id, userData);

        await interaction.reply({ embeds: [embedMesaj(`${kisi.tag} kullanıcısından ${miktar} altın silindi.`)] });
        break;
      }

      case 'rolver': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getMember('kişi');
        const rol = interaction.options.getRole('rol');

        if (!kisi || !rol) return interaction.reply({ content: 'Kullanıcı veya rol bulunamadı.', ephemeral: true });

        if (kisi.roles.cache.size >= 5) {
          return interaction.reply({ content: 'Bir kullanıcı en fazla 5 role sahip olabilir.', ephemeral: true });
        }

        try {
          await kisi.roles.add(rol);
          await interaction.reply({ embeds: [embedMesaj(`${kisi.user.tag} kullanıcısına ${rol.name} rolü verildi.`)] });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'krallıkaltını': {
        let krallik = interaction.options.getString('krallık');

        if (!krallik) {
          // Kullanıcının krallığı
          const memberRoles = interaction.member.roles.cache;
          const krallikRole = memberRoles.find(r => r.name.toLowerCase().includes('krallık'));
          krallik = krallikRole ? krallikRole.name : null;
        }

        if (!krallik) return interaction.reply({ content: 'Krallık belirtilmedi ve krallık rolü bulunamadı.', ephemeral: true });

        const altin = krallikAltin.get(krallik) || 0;

        await interaction.reply({ embeds: [embedMesaj(`${krallik} krallığının altını: ${altin}`)] });
        break;
      }

      case 'krallıktanat': {
        if (!yetkiKontrol(interaction, ['Kral'])) return;

        const kisi = interaction.options.getUser('kişi');
        const sebep = interaction.options.getString('sebep');

        if (!kisi) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });

        const member = await interaction.guild.members.fetch(kisi.id);
        // Krallık rollerini kaldır
        const krallikRolleri = member.roles.cache.filter(r => r.name.toLowerCase().includes('krallık'));
        try {
          await member.roles.remove(krallikRolleri);
          await interaction.reply({ content: `${kisi.tag} krallıktan atıldı. Sebep: ${sebep}` });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'savaşbaşlat': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        if (aktifSavas.aktif) return interaction.reply({ content: 'Zaten aktif bir savaş var.', ephemeral: true });

        aktifSavas.aktif = true;
        await interaction.reply({ content: 'Genel savaş başlatıldı!' });
        break;
      }

      case 'savaşbitir': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        if (!aktifSavas.aktif) return interaction.reply({ content: 'Aktif savaş yok.', ephemeral: true });

        aktifSavas.aktif = false;
        await interaction.reply({ content: 'Genel savaş sona erdi!' });
        break;
      }

      case 'meslekal': {
        const meslek = interaction.options.getString('meslek');
        const member = interaction.member;
        const meslekRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === meslek.toLowerCase());

        if (!meslekRole) return interaction.reply({ content: 'Meslek rolü bulunamadı.', ephemeral: true });

        try {
          await member.roles.add(meslekRole);
          await interaction.reply({ content: `Başarıyla ${meslekRole.name} rolü alındı.` });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'mesleğim': {
        const memberRoles = interaction.member.roles.cache;
        const meslekRole = memberRoles.find(r => ['Çiftçi', 'Madenci', 'Demirci', 'Kasap'].some(m => r.name.toLowerCase() === m.toLowerCase()));

        if (!meslekRole) return interaction.reply({ content: 'Meslek rolünüz bulunamadı.', ephemeral: true });

        await interaction.reply({ content: `Mesleğiniz: ${meslekRole.name}` });
        break;
      }

      case 'çalış': {
        const userId = interaction.user.id;
        const userData = users.get(userId) || { altin: 0, calismaSayisi: 0 };

        const meslekRole = interaction.member.roles.cache.find(r => ['Çiftçi', 'Madenci', 'Demirci', 'Kasap'].includes(r.name));

        if (!meslekRole) return interaction.reply({ content: 'Önce meslek rolü almalısınız.', ephemeral: true });

        // Basit çalışma simülasyonu
        const kazanilanAltin = Math.floor(Math.random() * 50) + 10;
        userData.altin += kazanilanAltin;
        userData.calismaSayisi = (userData.calismaSayisi || 0) + 1;
        users.set(userId, userData);

        await interaction.reply({ content: `${meslekRole.name} olarak çalıştınız ve ${kazanilanAltin} altın kazandınız!` });
        break;
      }

      case 'ticaretyap': {
        const kisi = interaction.options.getUser('kişi');
        const esyaKodu = interaction.options.getString('eşya_kodu').toLowerCase();
        const miktar = interaction.options.getInteger('miktar');
        const fiyat = interaction.options.getInteger('fiyat');

        if (!kisi || miktar <= 0 || fiyat <= 0) return interaction.reply({ content: 'Geçerli kullanıcı, miktar ve fiyat giriniz.', ephemeral: true });

        // Basit örnek: ticaret isteği DM olarak gönderiliyor
        try {
          await kisi.send(`Bir ticaret isteği aldınız: ${interaction.user.tag} size ${miktar} adet ${esyaKodu} karşılığı ${fiyat} altın teklif ediyor.`);
          await interaction.reply({ content: 'Ticaret isteği gönderildi.' });
        } catch {
          await interaction.reply({ content: 'Kullanıcı DM kapalı olabilir.', ephemeral: true });
        }
        break;
      }

      case 'envanterim': {
        // Kullanıcının envanteri
        await interaction.reply({ content: 'Bu özellik yakında eklenecek.', ephemeral: true });
        break;
      }

      case 'askeroluştur': {
        // Asker oluşturma örneği (rol verme)
        const member = interaction.member;
        const askerRol = interaction.guild.roles.cache.find(r => r.name === 'Asker');
        if (!askerRol) return interaction.reply({ content: 'Asker rolü bulunamadı.', ephemeral: true });

        try {
          await member.roles.add(askerRol);
          await interaction.reply({ content: 'Asker rolü verildi.' });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'baskın': {
        const krallik = interaction.options.getString('krallık');
        const askerSayisi = interaction.options.getInteger('asker_sayısı');
        const bolum = interaction.options.getInteger('bölüm');

        if (!aktifSavas.aktif) return interaction.reply({ content: 'Şu anda savaş aktif değil.', ephemeral: true });

        await interaction.reply({ content: `${krallik} krallığına ${askerSayisi} askerle baskın düzenlendi (Bölüm: ${bolum}).` });
        break;
      }

      case 'saldır': {
        const krallik = interaction.options.getString('krallık');
        const askerSayisi = interaction.options.getInteger('asker_sayısı');
        const bolum = interaction.options.getInteger('bölüm');

        if (!aktifSavas.aktif) return interaction.reply({ content: 'Şu anda savaş aktif değil.', ephemeral: true });

        await interaction.reply({ content: `${krallik} krallığına ${askerSayisi} askerle saldırı yapıldı (Bölüm: ${bolum}).` });
        break;
      }

      case 'isyançıkar': {
        const krallik = interaction.options.getString('krallık');
        const askerSayisi = interaction.options.getInteger('asker_sayısı');

        if (!aktifSavas.aktif) return interaction.reply({ content: 'Şu anda savaş aktif değil.', ephemeral: true });

        await interaction.reply({ content: `${krallik} krallığında ${askerSayisi} askerle isyan çıkarıldı.` });
        break;
      }

      case 'topraklar': {
        // Örnek verilerle gösterim
        const kralliklar = ['Krallık A', 'Krallık B', 'Krallık C'];
        const toprakSayilari = [10, 15, 7];
        let metin = '';
        kralliklar.forEach((k, i) => {
          metin += `${k}: ${toprakSayilari[i]} toprak\n`;
        });

        await interaction.reply({ content: metin });
        break;
      }

      case 'veliahtdevret': {
        await interaction.reply({ content: 'Veliaht devri komutu aktif değil.', ephemeral: true });
        break;
      }

      case 'ban': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getUser('kişi');
        const sebep = interaction.options.getString('sebep');

        if (!kisi) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });

        try {
          const member = await interaction.guild.members.fetch(kisi.id);
          await member.ban({ reason: sebep });
          await interaction.reply({ content: `${kisi.tag} banlandı. Sebep: ${sebep}` });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'unban': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getUser('kişi');
        if (!kisi) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });

        try {
          await interaction.guild.bans.remove(kisi.id);
          await interaction.reply({ content: `${kisi.tag} banı kaldırıldı.` });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'mute': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getMember('kişi');
        const sure = interaction.options.getString('süre');

        // Süre formatı HH:MM
        const match = sure.match(/^(\d{1,2}):(\d{1,2})$/);
        if (!match) return interaction.reply({ content: 'Süre formatı hatalı. (Saat:Dakika)', ephemeral: true });

        const saat = parseInt(match[1]);
        const dakika = parseInt(match[2]);

        if (isNaN(saat) || isNaN(dakika)) return interaction.reply({ content: 'Süre geçersiz.', ephemeral: true });

        const süreMs = (saat * 60 + dakika) * 60000;

        try {
          await kisi.timeout(süreMs, 'Mute komutu ile zaman aşımı.');
          await interaction.reply({ content: `${kisi.user.tag} kullanıcıya ${sure} süreyle mute uygulandı.` });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'unmute': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getMember('kişi');

        try {
          await kisi.timeout(null);
          await interaction.reply({ content: `${kisi.user.tag} kullanıcıdan mute kaldırıldı.` });
        } catch (err) {
          await interaction.reply({ content: `Hata: ${err.message}`, ephemeral: true });
        }
        break;
      }

      case 'dm': {
        if (!yetkiKontrol(interaction, ['Admin', 'Founder'])) return;

        const kisi = interaction.options.getUser('kişi');
        const mesaj = interaction.options.getString('mesaj');

        try {
          await kisi.send(mesaj);
          await interaction.reply({ content: `Mesaj ${kisi.tag} kullanıcısına gönderildi.` });
        } catch {
          await interaction.reply({ content: 'DM gönderilemedi, kullanıcı DM kapalı olabilir.', ephemeral: true });
        }
        break;
      }

      default:
        await interaction.reply({ content: 'Bilinmeyen komut.', ephemeral: true });
        break;
    }
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Komut işlenirken hata oluştu.', ephemeral: true });
    }
  }
});

client.login(TOKEN);
