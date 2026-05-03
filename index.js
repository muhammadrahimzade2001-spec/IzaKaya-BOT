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
    const hasAuthority = message.member.roles.cache.some(role => role.name === '🛡️ Castivol') || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // 🏮 SELAMLAMA
    if (command === "sa") return message.reply("Okaerinasai (Hoş geldin) Senpai! 🍵");

    // 🧼 TEMİZLE
    if (command === "temizle" || command === "sil") {
        if (!hasAuthority) return;
        const miktar = parseInt(args[0]) || 50;
        await message.channel.bulkDelete(miktar > 100 ? 100 : miktar, true).catch(() => {});
        return message.channel.send(`✨ **${miktar}** adet mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 📖 YARDIM MENÜSÜ (GELİŞMİŞ)
    if (command === "yardım") {
        const helpEmbed = new EmbedBuilder()
            .setAuthor({ name: "IzaKaya Yardım Menüsü", iconURL: client.user.displayAvatarURL() })
            .setTitle("🌸 IzaKaya'da Nasıl Gezinilir?")
            .setDescription("Merhaba Senpai! Aşağıdaki menüden yardım almak istediğin kategoriyi seçebilirsin.")
            .setColor("#ffb7c5")
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: "IzaKaya Management • Huzurlu Sohbetler" });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('Kategori seçmek için tıkla...')
                .addOptions([
                    { label: 'Yönetim Komutları', value: 'help_admin', emoji: '🛡️', description: 'Yetkililere özel araçlar.' },
                    { label: 'Kullanıcı Komutları', value: 'help_user', emoji: '👥', description: 'Herkesin kullanabileceği komutlar.' },
                    { label: 'Sistem Bilgisi', value: 'help_system', emoji: '⚙️', description: 'Bot ve sunucu hakkında.' }
                ])
        );

        return message.channel.send({ embeds: [helpEmbed], components: [row] });
    }

    // 🎫 TICKET-KUR
    if (command === "ticket-kur") {
        if (!hasAuthority) return message.reply("❌ Yetkin yok Senpai!");
        const ticketEmbed = new EmbedBuilder()
            .setAuthor({ name: "IzaKaya Resepsiyon", iconURL: client.user.displayAvatarURL() })
            .setTitle("🎋 Destek ve Başvuru Merkezi")
            .setDescription("Lütfen işlem yapmak istediğiniz kategoriyi aşağıdan seçin.")
            .setColor("#ffb7c5");

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('izakaya_ticket_menu')
                .setPlaceholder('Bir işlem kategorisi seçin...')
                .addOptions([
                    { label: 'Merge (Birleşme)', value: 'merge', emoji: '🤝' },
                    { label: 'Partnerlik', value: 'partnerlik', emoji: '💎' },
                    { label: 'Yetkili Alımı', value: 'yetkili_alim', emoji: '👔' },
                    { label: 'Öneri', value: 'oneri', emoji: '💡' }
                ])
        );
        return message.channel.send({ embeds: [ticketEmbed], components: [menu] });
    }
});

// --- ETKİLEŞİMLER ---
client.on('interactionCreate', async (i) => {
    
    // YARDIM MENÜSÜ ETKİLEŞİMİ
    if (i.isStringSelectMenu() && i.customId === 'help_menu') {
        let title, desc, fields = [];
        if (i.values[0] === 'help_admin') {
            title = "🛡️ Yönetim Komutları";
            desc = "`!sil`, `!duyuru`, `!ticket-kur`, `!ban`, `!kick`";
        } else if (i.values[0] === 'help_user') {
            title = "👥 Kullanıcı Komutları";
            desc = "`!sa`, `!izakaya`, `!profil`, `!yardım`, `!yazıtura`";
        } else {
            title = "⚙️ Sistem Bilgisi";
            desc = "IzaKaya Bot v15.0 - Konsept Sohbet Sistemi";
        }

        const editEmbed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor("#ffb7c5");
        return i.update({ embeds: [editEmbed] });
    }

    // TICKET MENÜSÜ VE OTOMATİK FORM
    if (i.isStringSelectMenu() && i.customId === 'izakaya_ticket_menu') {
        const cat = i.values[0];
        const ticketChannel = await i.guild.channels.create({
            name: `${cat}-${i.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ]
        });

        const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Kapat').setStyle(ButtonStyle.Danger));
        const welcomeEmbed = new EmbedBuilder().setTitle(`🌸 ${cat.toUpperCase()} Talebi`).setColor("#ffb7c5");

        await ticketChannel.send({ content: `${i.user} Hoş geldin!`, embeds: [welcomeEmbed], components: [closeBtn] });

        // EĞER YETKİLİ ALIMI İSE FORMU OTOMATİK AT
        if (cat === 'yetkili_alim') {
            const formText = "🏮 **YETKİLİ BAŞVURU FORMU**\n1. Ad/Yaş:\n2. Aktiflik Süren:\n3. Deneyimlerin:\n4. Neden Biz?\n\nLütfen bu soruları yanıtla kun! 🌸";
            await ticketChannel.send(formText);
        }

        return i.reply({ content: `✅ Talebin oluşturuldu: <#${ticketChannel.id}>`, ephemeral: true });
    }

    if (i.isButton() && i.customId === 'close_ticket') {
        await i.reply("🔒 Kapatılıyor...");
        setTimeout(() => i.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
