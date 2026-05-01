const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionsBitField 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

// AYARLAR
const prefix = "!"; 
const LIDER_ROL_ID = "1491995071896092912"; // Kendi yetkili rol ID'ni yaz

client.on('ready', () => {
    console.log(`${client.user.tag} | IzaKaya Sunucusu Aktif!`);
    client.user.setActivity('IzaKaya Sohbetini', { type: 3 }); // "Izakaya Sohbetini izliyor"
});

// --- KOMUTLAR ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. TICKET SISTEMI KURULUM
    if (command === 'ticket-kur') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 IzaKaya Destek')
            .setDescription('Sorun bildirmek veya yetkililerle görüşmek için butona tıkla!')
            .setColor('#5865F2')
            .setFooter({ text: 'IzaKaya Güvenlik Sistemi' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_ac')
                .setLabel('Talep Oluştur')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📩')
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }

    // 2. ÇEKİLİŞ SİSTEMİ (Basit)
    if (command === 'cekilis') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const odul = args.join(" ") || "Sürpriz Hediye";
        
        const cEmbed = new EmbedBuilder()
            .setTitle('🎉 ÇEKİLİŞ BAŞLADI 🎉')
            .setDescription(`Ödül: **${odul}**\nKatılmak için aşağıdaki butona basın!`)
            .setColor('#E74C3C')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cekilis_katil')
                .setLabel('Katıl!')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🎁')
        );

        message.channel.send({ embeds: [cEmbed], components: [row] });
    }

    // 3. SİL (MODERASYON)
    if (command === 'sil') {
        const sayi = parseInt(args[0]);
        if (!sayi || sayi > 100) return message.reply("1-100 arası bir sayı yaz kanka.");
        await message.channel.bulkDelete(sayi);
        message.channel.send(`${sayi} mesaj süpürüldü! 🧹`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 4. KULLANICI BİLGİ
    if (command === 'kb') {
        const user = message.mentions.users.first() || message.author;
        const kbEmbed = new EmbedBuilder()
            .setTitle(`Kullanıcı: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'ID', value: user.id },
                { name: 'Katılma Tarihi', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` }
            )
            .setColor('Random');
        message.channel.send({ embeds: [kbEmbed] });
    }

    // 5. BAN & KICK
    if (command === 'ban' || command === 'kick') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        const target = message.mentions.members.first();
        if (!target) return message.reply("Kimi uçuruyoruz?");
        
        if (command === 'ban') await target.ban(); else await target.kick();
        message.reply(`İşlem başarılı! 🚀`);
    }
});

// --- BUTON İŞLEMLERİ ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // TICKET AÇMA MANTIĞI
    if (interaction.customId === 'ticket_ac') {
        const kanal = await interaction.guild.channels.create({
            name: `destek-${interaction.user.username}`,
            type: 0,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });
        
        const bitirRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Kanalı Kapat').setStyle(ButtonStyle.Danger)
        );

        await kanal.send({ content: `Hoş geldin ${interaction.user}, yetkililer gelene kadar sorununu yazabilirsin.`, components: [bitirRow] });
        interaction.reply({ content: `Kanalın oluşturuldu: ${kanal}`, ephemeral: true });
    }

    if (interaction.customId === 'ticket_kapat') {
        await interaction.channel.delete();
    }

    // ÇEKİLİŞ KATILMA
    if (interaction.customId === 'cekilis_katil') {
        interaction.reply({ content: "Çekilişe kaydedildin! Bol şans. 🍀", ephemeral: true });
    }
});

// --- EKSTRA ÖZELLİKLER ---
// 6. Hoşgeldin Mesajı
client.on('guildMemberAdd', (member) => {
    const kanal = member.guild.systemChannel; 
    if (kanal) kanal.send(`Hoş geldin **${member.user.username}**! IzaKaya seninle daha güzel. 🍵`);
});

// 7. Oto Cevap & 8. Küfür Engelleyici
client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    if (msg.content.toLowerCase() === 'sa') msg.reply('Aleykümselam canım, hoş geldin.');
    
    const yasakli = ['küfür1', 'küfür2']; // Burayı doldur
    if (yasakli.some(kelime => msg.content.includes(kelime))) {
        msg.delete();
        msg.author.send('IzaKaya kurallarına uy, küfür etme!');
    }
});

// TOKEN BURAYA (Eğer GitHub'a atacaksan tırnak içini boş bırak, alttaki kalsın)
const TOKEN = process.env.TOKEN;
client.login(TOKEN || process.env.TOKEN);
