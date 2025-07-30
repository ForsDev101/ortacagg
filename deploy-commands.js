import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';  // .env dosyasından TOKEN, CLIENT_ID, GUILD_ID alınacak

const commands = [];
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// commands klasöründeki tüm komutların data kısmını JSON olarak topla
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(filePath);
  if ('data' in command) {
    commands.push(command.data.toJSON());
  }
}

// Discord REST API client'ı oluştur
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (slash) commands.`);

    // Sunucuya özel komutlar için GUILD_ID girilir. 
    // Global komutlar için CLIENT_ID kullanılır.
    // İstersen ikisini de yapabilirsin.
    
    // 1) Sunucuya özel komut deploy:
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    /*
    // 2) Global komut deploy (tüm sunucular için, deploy sonrası 1 saate kadar sürer):
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    */

    console.log('Successfully reloaded application (slash) commands.');
  } catch (error) {
    console.error(error);
  }
})();
