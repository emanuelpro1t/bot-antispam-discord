const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const MAPA_COOLDOWN = new Map();
const LIMITE_MENSAJES = 5; 
const TIEMPO_SPAM = 3000;   

client.once('ready', () => {
    console.log(`¡Bot Anti-Spam conectado como ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const usuarioId = message.author.id;
    const tiempoActual = Date.now();

    if (!MAPA_COOLDOWN.has(usuarioId)) {
        MAPA_COOLDOWN.set(usuarioId, []);
    }

    const historialMensajes = MAPA_COOLDOWN.get(usuarioId);
    historialMensajes.push(tiempoActual);

    const mensajesRecientes = historialMensajes.filter(tiempo => (tiempoActual - tiempo) < TIEMPO_SPAM);
    MAPA_COOLDOWN.set(usuarioId, mensajesRecientes);

    if (mensajesRecientes.length > LIMITE_MENSAJES) {
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
            return console.log("Error: No tengo permisos de administración de mensajes.");
        }

        try {
            await message.delete();
            const advertencia = await message.channel.send(`⚠️ **${message.author}**, detén el spam o serás sancionado.`);
            setTimeout(() => advertencia.delete().catch(() => null), 5000); 
        } catch (error) {
            console.error("No se pudo borrar el mensaje:", error);
        }
    }
});

// Railway leerá automáticamente el Token desde las variables de entorno
client.login(process.env.DISCORD_TOKEN);
