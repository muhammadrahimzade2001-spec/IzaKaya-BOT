const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, ActivityType, StringSelectMenuBuilder } = require('discord.js');
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
    client.user.setActivity("IzaKaya'da Sohbeti", { type: ActivityType.Watching });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🛡️ YETKİ KONTROLÜ
    const hasAuthority = message.member.roles.cache.some(role => role.name === '🛡️ Castivol') || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // 🏮 SELAMLAMA
    if (command === "sa") {
        return message.reply("Okaerinasai (Hoş geldin) Senpai! IzaKaya'nın en güzel masası senin için hazır. 🍵");
    }

    // 🧼 TEMİZLİK (SİL)
    if (command === "temizle" || command === "sil") {
        if (!hasAuthority) return;
        const miktar = parseInt(args[0]) || 50;
        await message.channel.bulkDelete(miktar > 100 ? 100 : miktar, true).catch(() => {});
        return message.channel.send(`✨ **${miktar}** adet tozlu mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 📢 DUYURU
    if (command === "duyuru") {
        if (!hasAuthority) return;
        const metin = args.join(" ");
        if (!metin) return;
        const embed = new EmbedBuilder()
            .setTitle("🏮 IZAKAYA'DAN HABERLER")
            .setDescription(metin)
            .setColor("#ffb7c5")
            .setFooter({ text: "Sohbetin tadını çıkar kun!" });
        message.channel.send({ content: "@everyone", embeds: [embed] });
        message.delete();
    }

    // 🎫 TICKET-KUR (GÜNCEL KATEGORİLER)
    if (command === "ticket-kur") {
        if (!hasAuthority) return message.reply("❌ Yetkin yok Senpai!");

        const ticketEmbed = new EmbedBuilder()
            .setAuthor({ name: "IzaKaya Resepsiyon", iconURL: client.user.displayAvatarURL() })
            .setTitle("🎋 Destek ve Başvuru Merkezi")
            .setDescription("Lütfen işlem yapmak istediğiniz kategoriyi aşağıdan seçin.")
            .setColor("#ffb7c5")
            .addFields(
                { name: "📑 | Bilgilendirme", value: "• Boş talepler kapatılır.\n• Yetkili alımları için form doldurmanız gerekebilir.\n• Önerileriniz bizim için değerlidir." }
            )
            .setFooter({ text: "IzaKaya Management" });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('izakaya_ticket_menu')
                .setPlaceholder('Bir işlem kategorisi seçin...')
                .addOptions([
                    { label: 'Merge (Birleşme)', value: 'merge', emoji: '🤝', description: 'Sunucu birleşme talepleri.' },
                    { label: 'Partnerlik', value: 'partnerlik', emoji: '💎', description: 'Partnerlik başvuruları.' },
                    { label: 'Yetkili Alımı', value: 'yetkili_alim', emoji: '👔', description: 'Ekibimize katılmak için.' },
                    { label: 'Öneri', value: 'oneri', emoji: '💡', description: 'Sunucu hakkındaki fikirleriniz.' }
                ])
        );

        return message.channel.send({ embeds: [ticketEmbed], components: [menu] });
    }
});

// --- ETKİLEŞİMLER ---
client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'izakaya_ticket_menu') {
        const category = interaction.values[0];
        
        const ticketChannel = await interaction.guild.channels.create({
            name: `${category}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ]
        });

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🌸 ${category.toUpperCase()} Talebi`)
            .setDescription(`Selam ${interaction.user}, talebin açıldı. Lütfen detayları buraya yaz.\n\n**Kategori:** ${category}`)
            .setColor("#ffb7c5");

        await ticketChannel.send({ content: `${interaction.user} Hoş geldin!`, embeds: [welcomeEmbed], components: [closeBtn] });
        return interaction.reply({ content: `✅ Talebin oluşturuldu: <#${ticketChannel.id}>`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply("🔒 Kanal siliniyor...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
