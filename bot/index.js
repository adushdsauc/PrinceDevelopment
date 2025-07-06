import { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!list')) return;

  const title = 'Example Item';
  const amount = 5; // USD

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, userId: message.author.id })
    });

    const data = await response.json();
    if (!data.url) throw new Error('No checkout URL returned');

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`Price: $${amount}`);

    const button = new ButtonBuilder()
      .setLabel('Buy Now')
      .setStyle(ButtonStyle.Link)
      .setURL(data.url);

    const row = new ActionRowBuilder().addComponents(button);

    await message.reply({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error(err);
    await message.reply('Failed to create checkout session.');
  }
});

client.login(process.env.DISCORD_TOKEN);
