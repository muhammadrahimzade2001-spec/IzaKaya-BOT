const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

const TOKEN = 'SENIN_BOT_TOKENIN';

client.on('ready', () => {
    console.log(`${client.user.tag} olarak IzaKaya için göreve hazırım!`);
});

// --- TICKET SISTEMI (BAŞLATMA) ---
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-kur' && message.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
            .setTitle('IzaKaya Destek Merkezi')
            .setDescription('Yardıma mı ihtiyacın var? Aşağıdaki butona basarak bir talep oluşturabilirsin.')
            .setColor('Blurple');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_olustur')
                .setLabel('Ticket Aç')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎫')
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

// --- BUTON ETKILEŞIMLERI (TICKET & ÇEKILIŞ) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'ticket_olustur') {
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0, // GuildText
            permissionOverwrites: [
                { id: interaction.guild.id, deny: ['ViewChannel'] },
                { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] }
            ]
        });

        interaction.reply({ content: `Kanalın açıldı: ${channel}`, ephemeral: true });
        channel.send(`Merhaba ${interaction.user}, yetkililer birazdan burada olacak. Kapatmak için yöneticiyi bekle.`);
    }
});

// --- HATA YAPTIN DEME MODU (DEBUG) ---
process.on('unhandledRejection', (reason, p) => {
    console.log('HATA YAPTIN: ', reason, p);
});

client.login(TOKEN);
