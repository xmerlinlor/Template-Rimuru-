import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import commands from './commands.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = String(process.env.OWNER_ID || '');

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing from environment variables.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

const categories = {
  moderator: {
    name: '🛡️ ᴍᴏᴅᴇʀᴀᴛᴏʀ',
    emoji: '🛡️'
  },
  games: {
    name: '🎮 ɢᴀᴍᴇs',
    emoji: '🎮'
  },
  social: {
    name: '🎀 sᴏᴄɪᴀʟ',
    emoji: '🎀'
  },
  tools: {
    name: '🛠️ ᴛᴏᴏʟs',
    emoji: '🛠️'
  },
  pet: {
    name: '🐾 ᴀᴅᴏᴘᴛ ᴘᴇᴛ',
    emoji: '🐾'
  },
  anime: {
    name: '🌸 ᴀɴɪᴍᴇ',
    emoji: '🌸'
  },
  pokemon: {
    name: '⚡ ᴘᴏᴋᴇ́ᴍᴏɴ ɢʀᴀᴍ',
    emoji: '⚡'
  },
  music: {
    name: '🎵 ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴜsɪᴄ',
    emoji: '🎵'
  },
  economy: {
    name: '💰 ᴇᴄᴏɴᴏᴍʏ',
    emoji: '💰'
  },
  shop: {
    name: '🛒 sʜᴏᴘ',
    emoji: '🛒'
  },
  war: {
    name: '💀 ᴋɪʟʟ & ᴡᴀʀ',
    emoji: '💀'
  },
  empire: {
    name: '🏰 ᴇᴍᴘɪʀᴇ',
    emoji: '🏰'
  },
  general: {
    name: '⚙️ ɢᴇɴᴇʀᴀʟ',
    emoji: '⚙️'
  },
  ai: {
    name: '🧠 ᴀɪ',
    emoji: '🧠'
  },
  owner: {
    name: '👑 ᴏᴡɴᴇʀ',
    emoji: '👑'
  }
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function isOwner(ctx) {
  return OWNER_ID && String(ctx.from?.id) === OWNER_ID;
}

function uptime() {
  const seconds = Math.floor((Date.now() - START_TIME) / 1000);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function getCommands(category) {
  const data = commands?.[category];

  if (!data) return [];

  return Array.isArray(data) ? data : [];
}

function commandText(category) {
  const list = getCommands(category);

  if (!list.length) {
    return '╰─➤ 🚫 ɴᴏ ᴄᴏᴍᴍᴀɴᴅs ᴀᴠᴀɪʟᴀʙʟᴇ.';
  }

  return list
    .map((cmd) => {
      if (typeof cmd === 'string') {
        return `│ ▸ /${cmd}`;
      }

      if (typeof cmd === 'object') {
        const name = cmd.command || cmd.name || '';
        const description = cmd.description || '';

        return description
          ? `│ ▸ /${name} — ${description}`
          : `│ ▸ /${name}`;
      }

      return null;
    })
    .filter(Boolean)
    .join('\n');
}

function menuKeyboard(isUserOwner = false) {
  const rows = [];

  const entries = Object.entries(categories);

  for (let i = 0; i < entries.length; i += 2) {
    const row = [];

    for (let j = i; j < i + 2 && j < entries.length; j++) {
      const [key, category] = entries[j];

      if (key === 'owner' && !isUserOwner) continue;

      row.push(
        Markup.button.callback(
          category.name,
          `category:${key}`
        )
      );
    }

    if (row.length) rows.push(row);
  }

  return Markup.inlineKeyboard(rows);
}

function backButton() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        '⬅️ ʙᴀᴄᴋ ᴛᴏ ᴍᴇɴᴜ',
        'menu:home'
      )
    ]
  ]);
}

function menuMessage() {
  return `
╭━━━〔 ⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ 〕━━━╮
┃
┃  👋 ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ
┃
┃  🛡️ ᴍᴏᴅᴇʀᴀᴛɪᴏɴ
┃  🎮 ɢᴀᴍᴇs
┃  💰 ᴇᴄᴏɴᴏᴍʏ
┃  🌸 ᴀɴɪᴍᴇ
┃  ⚡ ᴘᴏᴋᴇ́ᴍᴏɴ
┃  🧠 ᴀʀᴛɪғɪᴄɪᴀʟ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ
┃  🏰 ᴇᴍᴘɪʀᴇ
┃  💀 ᴡᴀʀ ɢᴀᴍᴇs
┃
┃  ⬇️ sᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅᴀʀᴋ ᴋɪɴɢ ᴅᴇᴠ
`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.start(async (ctx) => {
  const firstName = ctx.from?.first_name || 'User';

  const text = `
╭━━━〔 ⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ 〕━━━╮
┃
┃ 👋 ʜᴇʟʟᴏ, ${firstName}
┃
┃ ⚡ ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ
┃
┃ 🛡️ ᴍᴏᴅᴇʀᴀᴛɪᴏɴ
┃ 🎮 ɢᴀᴍᴇs
┃ 💰 ᴇᴄᴏɴᴏᴍʏ
┃ 🌸 ᴀɴɪᴍᴇ
┃ ⚡ ᴘᴏᴋᴇ́ᴍᴏɴ
┃ 🐾 ᴘᴇᴛs
┃ 🧠 ᴀɪ
┃ 🎵 ᴍᴜsɪᴄ
┃ 🏰 ᴇᴍᴘɪʀᴇ
┃
┃ 📚 ᴜsᴇ /ʜᴇʟᴘ
┃ 📂 ᴜsᴇ /ᴍᴇɴᴜ
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅᴀʀᴋ ᴋɪɴɢ ᴅᴇᴠ
`;

  await ctx.reply(
    text,
    menuKeyboard(isOwner(ctx))
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.command('help', async (ctx) => {
  const text = `
╭━━━〔 📚 ʜᴇʟᴘ ᴄᴇɴᴛᴇʀ 〕━━━╮
┃
┃ ⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ
┃
┃ ᴜsᴇ ᴛʜᴇ ᴍᴇɴᴜ ʙᴇʟᴏᴡ ᴛᴏ
┃ ᴠɪᴇᴡ ᴇᴠᴇʀʏ ᴄᴏᴍᴍᴀɴᴅ.
┃
┃ 📂 /menu
┃
┃ 🛡️ ᴍᴏᴅᴇʀᴀᴛᴏʀ
┃ 🎮 ɢᴀᴍᴇs
┃ 🎀 sᴏᴄɪᴀʟ
┃ 🛠️ ᴛᴏᴏʟs
┃ 🐾 ᴀᴅᴏᴘᴛ ᴘᴇᴛ
┃ 🌸 ᴀɴɪᴍᴇ
┃ ⚡ ᴘᴏᴋᴇ́ᴍᴏɴ
┃ 🎵 ᴍᴜsɪᴄ
┃ 💰 ᴇᴄᴏɴᴏᴍʏ
┃ 🛒 sʜᴏᴘ
┃ 💀 ᴡᴀʀ
┃ 🏰 ᴇᴍᴘɪʀᴇ
┃ 🧠 ᴀɪ
┃ 👑 ᴏᴡɴᴇʀ
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

  await ctx.reply(text, menuKeyboard(isOwner(ctx)));
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.command('menu', async (ctx) => {
  await ctx.reply(
    menuMessage(),
    menuKeyboard(isOwner(ctx))
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BASIC COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.command('ping', async (ctx) => {
  const start = Date.now();

  const message = await ctx.reply('🏓 ᴘɪɴɢɪɴɢ...');

  const latency = Date.now() - start;

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    message.message_id,
    undefined,
    `
╭━━━〔 🏓 ᴘᴏɴɢ 〕━━━╮
┃
┃ ⚡ ʟᴀᴛᴇɴᴄʏ: ${latency}ms
┃ 🚀 sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ
┃
╰━━━━━━━━━━━━━━━━━━╯
`
  );
});

bot.command('id', async (ctx) => {
  await ctx.reply(`
╭━━━〔 🆔 ᴜsᴇʀ ɪɴғᴏ 〕━━━╮
┃
┃ 👤 ɪᴅ: ${ctx.from.id}
┃ 💬 ᴄʜᴀᴛ ɪᴅ: ${ctx.chat.id}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`);
});

bot.command('status', async (ctx) => {
  await ctx.reply(`
╭━━━〔 ⚡ sʏsᴛᴇᴍ sᴛᴀᴛᴜs 〕━━━╮
┃
┃ 🤖 ʙᴏᴛ: ᴏɴʟɪɴᴇ
┃ ⚡ ᴜᴘᴛɪᴍᴇ: ${uptime()}
┃ 🟢 sᴛᴀᴛᴜs: ʜᴇᴀʟᴛʜʏ
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`);
});

bot.command('owner', async (ctx) => {
  await ctx.reply(`
╭━━━〔 👑 ᴏᴡɴᴇʀ 〕━━━╮
┃
┃ 👑 ᴍʀ ᴅᴀʀᴋ ᴋɪɴɢ ᴅᴇᴠ
┃
┃ ⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ
┃
╰━━━━━━━━━━━━━━━━━━╯
`);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENU CALLBACKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.action('menu:home', async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    menuMessage(),
    menuKeyboard(isOwner(ctx))
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CATEGORY CALLBACKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.action(/^category:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const category = ctx.match[1];

  if (!categories[category]) {
    return ctx.answerCbQuery('❌ ᴜɴᴋɴᴏᴡɴ ᴄᴀᴛᴇɢᴏʀʏ');
  }

  if (category === 'owner' && !isOwner(ctx)) {
    return ctx.answerCbQuery(
      '🚫 ᴏᴡɴᴇʀ ᴏɴʟʏ',
      { show_alert: true }
    );
  }

  const info = categories[category];

  const text = `
╭━━━〔 ${info.emoji} ${info.name.replace(info.emoji, '').trim()} 〕━━━╮
┃
${commandText(category)}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ
`;

  await ctx.editMessageText(text, backButton());
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UNKNOWN COMMAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  if (!text.startsWith('/')) return;

  await ctx.reply(`
❌ ᴄᴏᴍᴍᴀɴᴅ ɴᴏᴛ ғᴏᴜɴᴅ.

📚 ᴜsᴇ /help
📂 ᴜsᴇ /menu

⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ
`);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ERROR HANDLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.catch((error, ctx) => {
  console.error(
    `❌ Bot error for ${ctx.updateType}:`,
    error
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EXPRESS HEALTH SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

app.get('/', (req, res) => {
  res.json({
    bot: 'Tempest Rimuru',
    status: 'online',
    uptime: uptime()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   START BOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

bot.launch()
  .then(() => {
    console.log('');
    console.log('╔══════════════════════════════════╗');
    console.log('║      ⚡ TEMPEST RIMURU BOT       ║');
    console.log('║                                  ║');
    console.log('║        🟢 BOT IS ONLINE          ║');
    console.log('║                                  ║');
    console.log('║   👑 MR DARK KING DEV            ║');
    console.log('╚══════════════════════════════════╝');
    console.log('');
  })
  .catch((error) => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  });

process.once('SIGINT', () => {
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});
