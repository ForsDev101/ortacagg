const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder().setName('yardim').setDescription('Komut listesini gösterir'),
  new SlashCommandBuilder().setName('krallıkkur').setDescription('Krallık kurar').addStringOption(option => option.setName('isim').setDescription('Krallık adı').setRequired(true)),
  new SlashCommandBuilder().setName('krallıkat').setDescription('Krallıktan atar').addUserOption(option => option.setName('kisi').setDescription('Atılacak kişi').setRequired(true)).addStringOption(option => option.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('savaşbaşlat').setDescription('Savaşı başlatır'),
  new SlashCommandBuilder().setName('savaşbitir').setDescription('Savaşı bitirir'),
  new SlashCommandBuilder().setName('meslekal').setDescription('Meslek alır').addStringOption(option => option.setName('meslek').setDescription('Meslek adı').setRequired(true)),
  new SlashCommandBuilder().setName('mesleğim').setDescription('Mesleğini gösterir'),
  new SlashCommandBuilder().setName('çalış').setDescription('Çalışır ve altın kazanır'),
  new SlashCommandBuilder().setName('ticaretyap').setDescription('Ticaret yapar')
    .addUserOption(option => option.setName('kişi').setDescription('Ticaret yapılacak kişi').setRequired(true))
    .addStringOption(option => option.setName('eşya_kodu').setDescription('Eşya kodu').setRequired(true))
    .addIntegerOption(option => option.setName('miktar').setDescription('Miktar').setRequired(true))
    .addIntegerOption(option => option.setName('fiyat').setDescription('Fiyat').setRequired(true)),
  new SlashCommandBuilder().setName('envanterim').setDescription('Envanterini gösterir'),
  new SlashCommandBuilder().setName('askeroluştur').setDescription('Asker rolü alır'),
  new SlashCommandBuilder().setName('baskın').setDescription('Baskın düzenler')
    .addStringOption(option => option.setName('krallık').setDescription('Hedef krallık').setRequired(true))
    .addIntegerOption(option => option.setName('asker_sayısı').setDescription('Asker sayısı').setRequired(true))
    .addIntegerOption(option => option.setName('bölüm').setDescription('Bölüm').setRequired(true)),
  new SlashCommandBuilder().setName('saldır').setDescription('Saldırı yapar')
    .addStringOption(option => option.setName('krallık').setDescription('Hedef krallık').setRequired(true))
    .addIntegerOption(option => option.setName('asker_sayısı').setDescription('Asker sayısı').setRequired(true))
    .addIntegerOption(option => option.setName('bölüm').setDescription('Bölüm').setRequired(true)),
  new SlashCommandBuilder().setName('isyançıkar').setDescription('İsyan çıkarır')
    .addStringOption(option => option.setName('krallık').setDescription('Hedef krallık').setRequired(true))
    .addIntegerOption(option => option.setName('asker_sayısı').setDescription('Asker sayısı').setRequired(true)),
  new SlashCommandBuilder().setName('topraklar').setDescription('Toprak durumlarını gösterir'),
  new SlashCommandBuilder().setName('veliahtdevret').setDescription('Veliaht devreder'),
  new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı banlar')
    .addUserOption(option => option.setName('kişi').setDescription('Banlanacak kişi').setRequired(true))
    .addStringOption(option => option.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('unban').setDescription('Ban kaldırır')
    .addUserOption(option => option.setName('kişi').setDescription('Ban kaldırılacak kişi').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Kullanıcıyı mute eder')
    .addUserOption(option => option.setName('kişi').setDescription('Mute edilecek kişi').setRequired(true))
    .addStringOption(option => option.setName('süre').setDescription('Süre (HH:MM)').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('Mute kaldırır')
    .addUserOption(option => option.setName('kişi').setDescription('Mute kaldırılacak kişi').setRequired(true)),
  new SlashCommandBuilder().setName('dm').setDescription('DM atar')
    .addUserOption(option => option.setName('kişi').setDescription('Mesaj atılacak kişi').setRequired(true))
    .addStringOption(option => option.setName('mesaj').setDescription('Mesaj içeriği').setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Slash komutları Discord\'a yükleniyor...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Slash komutları başarıyla yüklendi!');
  } catch (error) {
    console.error(error);
  }
})();
