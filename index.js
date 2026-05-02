const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('IzaKaya Sohbet Botu Aktif! 🌸'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => {
    console.log(`🌸 ${client.user.tag} IzaKaya kapılarını açtı!`);
    client.user.setActivity("IzaKaya'da Sohbeti", { type: 3 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🏮 SELAMLAMA
    if (command === "sa") {
        return message.reply("Okaerinasai (Hoş geldin) Senpai! IzaKaya'nın en güzel masası senin için hazır. 🍵");
    }

    // 🧼 TEMİZLİK (SİL)
    if (command === "temizle") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]);
        if (!miktar || miktar < 1 || miktar > 100) return message.reply("Kaç mesajı süpüreyim desu? (1-100)");
        await message.channel.bulkDelete(miktar, true);
        return message.channel.send(`✨ **${miktar}** adet tozlu mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 📢 ANIME DUYURU
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const metin = args.join(" ");
        const embed = new EmbedBuilder()
            .setTitle("🏮 IZAKAYA'DAN HABERLER")
            .setDescription(metin)
            .setColor("#ffb7c5") // Sakura pembesi
            .setThumbnail("https://i.imgur.com/wSTFkxr.png") // Buraya anime profil fotosu koyabilirsin
            .setFooter({ text: "Sohbetin tadını çıkar kun!" });
        message.channel.send({ content: "@everyone", embeds: [embed] });
        message.delete();
    }

    // 🌸 SUNUCU BİLGİ
    if (command === "izakaya") {
        const embed = new EmbedBuilder()
            .setTitle("🌸 IzaKaya Sohbet Merkezi")
            .setDescription("Burası herkesin huzur bulduğu, anime tartıştığı ve dostluklar kurduğu bir mekan!")
            .addFields(
                { name: '⛩️ Kurallar', value: 'Saygılı ol, spam yapma!', inline: true },
                { name: '🎎 Roller', value: 'Seviye atladıkça yeni ünvanlar alırsın.', inline: true }
            )
            .setColor("#ffb7c5");
        message.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
