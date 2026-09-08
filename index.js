import "dotenv/config";
import express from "express";
import { Telegraf, Markup } from "telegraf";
import crypto from "crypto";

import commands from "./commands.js";
import {
  getDatabase,
  save,
  getUser,
  addUser,
  getGroup,
  addGroup,
  isSudo,
  isBlocked,
  getSudoUsers,
  getBlockedUsers,
  userCount,
  groupCount,
} from "./database.js";

// ============================================================
// CONFIG
// ============================================================

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = String(process.env.OWNER_ID || "");
const PORT = Number(process.env.PORT || 3000);

const BOT_NAME = "ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ";
const OWNER_NAME = "ᴍʀ ᴅᴀʀᴋ ᴋɪɴɢ ᴅᴇᴠ";

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing from environment variables.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

const START_TIME = Date.now();

app.use(express.json());

// ============================================================
// COMMAND MAP
// ============================================================

const commandCategory = {};

for (const [category, list] of Object.entries(commands)) {
  for (const command of list) {
    commandCategory[String(command).toLowerCase()] = category;
  }
}

const ALL_COMMANDS = [
  ...new Set(
    Object.values(commands)
      .flat()
      .map((x) => String(x).toLowerCase()),
  ),
];

// ============================================================
// HELPERS
// ============================================================

function db() {
  return getDatabase();
}

function isOwner(ctx) {
  return Boolean(
    ctx.from && OWNER_ID && String(ctx.from.id) === OWNER_ID,
  );
}

function isUserSudo(ctx) {
  if (!ctx.from) return false;

  try {
    return isSudo(String(ctx.from.id));
  } catch {
    return false;
  }
}

function isOwnerOrSudo(ctx) {
  return isOwner(ctx) || isUserSudo(ctx);
}

function isGroup(ctx) {
  return ["group", "supergroup"].includes(ctx.chat?.type);
}

async function isAdmin(ctx, userId = null) {
  if (!isGroup(ctx)) return false;

  const id = userId || ctx.from?.id;

  if (!id) return false;

  if (isOwner(ctx)) return true;

  try {
    const member = await ctx.telegram.getChatMember(
      ctx.chat.id,
      id,
    );

    return ["creator", "administrator"].includes(member.status);
  } catch {
    return false;
  }
}

async function requireAdmin(ctx) {
  if (!isGroup(ctx)) {
    await ctx.reply("❌ Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    return false;
  }

  if (!(await isAdmin(ctx))) {
    await ctx.reply("❌ Aᴅᴍɪɴ ᴘᴇʀᴍɪssɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ.");
    return false;
  }

  return true;
}

async function requireOwner(ctx) {
  if (!isOwnerOrSudo(ctx)) {
    await ctx.reply("❌ Oᴡɴᴇʀ/Sᴜᴅᴏ ᴘᴇʀᴍɪssɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ.");
    return false;
  }

  return true;
}

function argsFrom(ctx) {
  const text = ctx.message?.text || "";

  return text
    .trim()
    .split(/\s+/)
    .slice(1);
}

function uptime() {
  let seconds = Math.floor(
    (Date.now() - START_TIME) / 1000,
  );

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1),
  ) + min;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function userName(ctx) {
  return (
    ctx.from?.first_name ||
    ctx.from?.username ||
    "User"
  );
}

function targetUser(ctx) {
  const replyUser =
    ctx.message?.reply_to_message?.from;

  if (replyUser) {
    return {
      id: String(replyUser.id),
      name:
        replyUser.first_name ||
        replyUser.username ||
        "User",
      username: replyUser.username || "",
    };
  }

  const args = argsFrom(ctx);

  if (args[0] && /^\d+$/.test(args[0])) {
    return {
      id: String(args[0]),
      name: args[0],
      username: "",
    };
  }

  return null;
}

function ensureUser(ctx) {
  if (!ctx.from) return null;

  const id = String(ctx.from.id);

  let user = null;

  try {
    user = getUser(id);
  } catch {
    user = null;
  }

  if (!user) {
    user = {
      id,
      firstName: ctx.from.first_name || "",
      lastName: ctx.from.last_name || "",
      username: ctx.from.username || "",
      joinedAt: new Date().toISOString(),

      balance: 0,
      xp: 0,
      level: 1,

      warnings: 0,

      dailyClaimed: null,
      weeklyClaimed: null,
      monthlyClaimed: null,

      inventory: [],
      pets: [],
      pokemon: [],
    };

    addUser(id, user);
  }

  return getUser(id);
}

function ensureGroup(ctx) {
  if (!isGroup(ctx)) return null;

  const id = String(ctx.chat.id);

  let group = null;

  try {
    group = getGroup(id);
  } catch {
    group = null;
  }

  if (!group) {
    group = {
      id,
      title: ctx.chat.title || "",
      type: ctx.chat.type,
      createdAt: new Date().toISOString(),

      settings: {
        welcome: false,
        goodbye: false,
        antilink: false,
        antiflood: false,
        antispam: false,
        antibot: false,
        antiraid: false,
        antimention: false,
        antiword: false,
        antichannel: false,
        antiforward: false,
        antisticker: false,
        antimedia: false,
        antivoice: false,
        antifile: false,

        lock: false,
        lockdown: false,
        slowmode: false,

        rules: "",
        filters: {},
      },
    };

    addGroup(id, group);
  }

  return getGroup(id);
}

function saveDatabase() {
  try {
    save();
  } catch (error) {
    console.error("Database save error:", error.message);
  }
}

// ============================================================
// CATEGORY NAMES
// ============================================================

const categoryNames = {
  moderator: "🛡️ Mᴏᴅᴇʀᴀᴛᴏʀ",
  games: "🎮 Gᴀᴍᴇs",
  social: "💕 Sᴏᴄɪᴀʟ",
  tools: "🛠️ Tᴏᴏʟs",
  pet: "🐾 Pᴇᴛ",
  anime: "🎌 Aɴɪᴍᴇ",
  pokemon: "⚡ Pᴏᴋᴇ́ᴍᴏɴ",
  music: "🎵 Mᴜsɪᴄ",
  economy: "💰 Eᴄᴏɴᴏᴍʏ",
  shop: "🛒 Sʜᴏᴘ",
  war: "⚔️ Wᴀʀ",
  empire: "👑 Eᴍᴘɪʀᴇ",
  general: "⚙️ Gᴇɴᴇʀᴀʟ",
  ai: "🤖 Aɪ",
  owner: "👑 Oᴡɴᴇʀ",
};

// ============================================================
// MENU
// ============================================================

function mainKeyboard() {
  const rows = [];

  const categories = Object.keys(commands);

  for (let i = 0; i < categories.length; i += 2) {
    const row = [];

    const first = categories[i];
    const second = categories[i + 1];

    row.push(
      Markup.button.callback(
        categoryNames[first] || first,
        `category:${first}`,
      ),
    );

    if (second) {
      row.push(
        Markup.button.callback(
          categoryNames[second] || second,
          `category:${second}`,
        ),
      );
    }

    rows.push(row);
  }

  rows.push([
    Markup.button.callback(
      "📚 Aʟʟ Cᴏᴍᴍᴀɴᴅs",
      "allcommands",
    ),
  ]);

  return Markup.inlineKeyboard(rows);
}

function menuText() {
  return `
╭━━━〔 ⛦⃝ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ ⃝⛦ 〕━━━╮

👋 Wᴇʟᴄᴏᴍᴇ ᴛᴏ ${BOT_NAME}

⚡ Mᴜʟᴛɪ-Fᴇᴀᴛᴜʀᴇ
Tᴇʟᴇɢʀᴀᴍ Bᴏᴛ

╭──〔 📚 Cᴀᴛᴇɢᴏʀɪᴇs 〕──╮

🛡️ Mᴏᴅᴇʀᴀᴛᴏʀ
🎮 Gᴀᴍᴇs
💕 Sᴏᴄɪᴀʟ
🛠️ Tᴏᴏʟs
🐾 Pᴇᴛ
🎌 Aɴɪᴍᴇ
⚡ Pᴏᴋᴇ́ᴍᴏɴ
🎵 Mᴜsɪᴄ
💰 Eᴄᴏɴᴏᴍʏ
🛒 Sʜᴏᴘ
⚔️ Wᴀʀ
👑 Eᴍᴘɪʀᴇ
🤖 Aɪ

╰────────────────╯

📦 Tᴏᴛᴀʟ Cᴏᴍᴍᴀɴᴅs:
${ALL_COMMANDS.length}

⚡ Cʜᴏᴏsᴇ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ʙᴇʟᴏᴡ.
`;
}

function commandList(list) {
  return list
    .map(
      (cmd, index) =>
        `${String(index + 1).padStart(2, "0")} ━━ /${cmd}`,
    )
    .join("\n");
}

// ============================================================
// /START
// ============================================================

bot.start(async (ctx) => {
  ensureUser(ctx);
  ensureGroup(ctx);

  const name = escapeHtml(userName(ctx));

  await ctx.reply(
    `
╭━━━〔 ⛦⃝ ᴡᴇʟᴄᴏᴍᴇ ⃝⛦ 〕━━━╮

👋 Hᴇʏ ${name}

💙 Wᴇʟᴄᴏᴍᴇ ᴛᴏ
${BOT_NAME}

🤖 Yᴏᴜʀ ᴍᴜʟᴛɪ-ғᴇᴀᴛᴜʀᴇ
Tᴇʟᴇɢʀᴀᴍ Bᴏᴛ

🛡️ Mᴏᴅᴇʀᴀᴛɪᴏɴ
🎮 Gᴀᴍᴇs
💕 Sᴏᴄɪᴀʟ
🎵 Mᴜsɪᴄ
💰 Eᴄᴏɴᴏᴍʏ
🐾 Pᴇᴛs
🎌 Aɴɪᴍᴇ
⚡ Pᴏᴋᴇ́ᴍᴏɴ
🤖 Aɪ
👑 Eᴍᴘɪʀᴇ

╰━━━〔 ⚡ Eɴᴊᴏʏ ʏᴏᴜʀ sᴛᴀʏ! 〕━━━╯
`,
    mainKeyboard(),
  );
});

// ============================================================
// /HELP
// ============================================================

bot.command("help", async (ctx) => {
  ensureUser(ctx);

  await ctx.reply(`
╭━━━〔 📚 Hᴇʟᴘ 〕━━━╮

🤖 ${BOT_NAME}

📦 Tᴏᴛᴀʟ Cᴏᴍᴍᴀɴᴅs:
${ALL_COMMANDS.length}

Uѕᴇ:

/menu
/ping
/status
/profile
/id
/about
/owner

Oʀ ᴏᴘᴇɴ /menu
ᴛᴏ ᴠɪᴇᴡ ᴀʟʟ ᴄᴀᴛᴇɢᴏʀɪᴇs.

╰━━━━━━━━━━━━━━╯
`);
});

// ============================================================
// /MENU
// ============================================================

bot.command("menu", async (ctx) => {
  ensureUser(ctx);
  ensureGroup(ctx);

  await ctx.reply(
    menuText(),
    mainKeyboard(),
  );
});

// ============================================================
// /PING
// ============================================================

bot.command("ping", async (ctx) => {
  const started = Date.now();

  const message = await ctx.reply(
    "🏓 Pɪɴɢɪɴɢ...",
  );

  const latency = Date.now() - started;

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    message.message_id,
    undefined,
    `
╭━━━〔 🏓 Pᴏɴɢ 〕━━━╮

⚡ Lᴀᴛᴇɴᴄʏ:
${latency}ms

🤖 Bᴏᴛ:
Oɴʟɪɴᴇ

💚 Sᴛᴀᴛᴜs:
Hᴇᴀʟᴛʜʏ

╰━━━━━━━━━━━━━━╯
`,
  );
});

// ============================================================
// /ID
// ============================================================

bot.command("id", async (ctx) => {
  await ctx.reply(`
╭━━━〔 🆔 Iᴅ Iɴғᴏ 〕━━━╮

👤 Uѕᴇʀ Iᴅ:
${ctx.from.id}

💬 Cʜᴀᴛ Iᴅ:
${ctx.chat.id}

${ctx.chat.title ? `👥 Gʀᴏᴜᴘ:\n${escapeHtml(ctx.chat.title)}` : ""}

╰━━━━━━━━━━━━━━╯
`);
});

// ============================================================
// /PROFILE
// ============================================================

bot.command("profile", async (ctx) => {
  const user = ensureUser(ctx);

  await ctx.reply(`
╭━━━〔 👤 Pʀᴏғɪʟᴇ 〕━━━╮

👤 Nᴀᴍᴇ:
${escapeHtml(userName(ctx))}

🔗 Uѕᴇʀɴᴀᴍᴇ:
${ctx.from.username ? "@" + ctx.from.username : "N/A"}

🆔 Iᴅ:
${ctx.from.id}

💰 Bᴀʟᴀɴᴄᴇ:
${user?.balance || 0}

⭐ Xᴘ:
${user?.xp || 0}

🏆 Lᴇᴠᴇʟ:
${user?.level || 1}

╰━━━━━━━━━━━━━━╯
`);
});

// ============================================================
// /STATUS
// ============================================================

bot.command("status", async (ctx) => {
  await ctx.reply(`
╭━━━〔 📊 Sᴛᴀᴛᴜs 〕━━━╮

🤖 Bᴏᴛ:
Oɴʟɪɴᴇ

⏱️ Uᴘᴛɪᴍᴇ:
${uptime()}

👤 Uѕᴇʀѕ:
${userCount()}

👥 Gʀᴏᴜᴘѕ:
${groupCount()}

📚 Cᴏᴍᴍᴀɴᴅs:
${ALL_COMMANDS.length}

╰━━━━━━━━━━━━━━╯
`);
});

// ============================================================
// /ABOUT
// ============================================================

bot.command("about", async (ctx) => {
  await ctx.reply(`
╭━━━〔 ⚡ Aʙᴏᴜᴛ 〕━━━╮

🤖 Bᴏᴛ:
${BOT_NAME}

👑 Dᴇᴠᴇʟᴏᴘᴇʀ:
${OWNER_NAME}

📦 Vᴇʀsɪᴏɴ:
2.0.0

📚 Cᴏᴍᴍᴀɴᴅs:
${ALL_COMMANDS.length}+

⏱️ Uᴘᴛɪᴍᴇ:
${uptime()}

╰━━━━━━━━━━━━━━╯
`);
});

// ============================================================
// /OWNER
// ============================================================

bot.command("owner", async (ctx) => {
  await ctx.reply(`
╭━━━〔 👑 Oᴡɴᴇʀ 〕━━━╮

👑 ${OWNER_NAME}

🆔 Oᴡɴᴇʀ Iᴅ:
${OWNER_ID || "Nᴏᴛ sᴇᴛ"}

╰━━━━━━━━━━━━━━╯
`);
});

// ============================================================
// MENU CALLBACKS
// ============================================================

bot.action(/^category:(.+)$/, async (ctx) => {
  const category = ctx.match[1];

  if (!commands[category]) {
    await ctx.answerCbQuery(
      "Category not found.",
    );
    return;
  }

  await ctx.answerCbQuery();

  const title =
    categoryNames[category] || category;

  const list = commands[category];

  await ctx.editMessageText(
    `
╭━━━〔 ${title} 〕━━━╮

${commandList(list)}

╰━━━━━━━━━━━━━━╯
`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "⬅️ Bᴀᴄᴋ",
          "mainmenu",
        ),
      ],
    ]),
  );
});

bot.action("mainmenu", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    menuText(),
    mainKeyboard(),
  );
});

bot.action("allcommands", async (ctx) => {
  await ctx.answerCbQuery();

  const firstCommands =
    ALL_COMMANDS.slice(0, 100);

  await ctx.editMessageText(
    `
╭━━━〔 📚 Aʟʟ Cᴏᴍᴍᴀɴᴅs 〕━━━╮

📦 Tᴏᴛᴀʟ:
${ALL_COMMANDS.length}

${commandList(firstCommands)}

${ALL_COMMANDS.length > 100
      ? `\n➕ ${ALL_COMMANDS.length - 100} ᴍᴏʀᴇ ᴄᴏᴍᴍᴀɴᴅs ᴀᴠᴀɪʟᴀʙʟᴇ.`
      : ""}

╰━━━━━━━━━━━━━━╯
`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "⬅️ Bᴀᴄᴋ",
          "mainmenu",
        ),
      ],
    ]),
  );
});

// ============================================================
// MODERATOR COMMANDS
// ============================================================

async function moderatorCommand(ctx, cmd, args) {
  if (!(await requireAdmin(ctx))) return true;

  const group = ensureGroup(ctx);

  // ---------------- WARN ----------------

  if (cmd === "warn") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴛʜᴇɪʀ ᴜsᴇʀ Iᴅ.",
      );
      return true;
    }

    const user = getUser(target.id) || {
      id: target.id,
      warnings: 0,
    };

    user.warnings =
      Number(user.warnings || 0) + 1;

    addUser(target.id, user);
    saveDatabase();

    await ctx.reply(`
⚠️ Wᴀʀɴɪɴɢ Aᴅᴅᴇᴅ

👤 Uѕᴇʀ:
${escapeHtml(target.name)}

⚠️ Wᴀʀɴɪɴɢs:
${user.warnings}
`);

    return true;
  }

  // ---------------- UNWARN ----------------

  if (cmd === "unwarn") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ.",
      );
      return true;
    }

    const user = getUser(target.id);

    if (user) {
      user.warnings = Math.max(
        0,
        Number(user.warnings || 0) - 1,
      );

      addUser(target.id, user);
      saveDatabase();
    }

    await ctx.reply(
      "✅ Wᴀʀɴɪɴɢ ʀᴇᴍᴏᴠᴇᴅ.",
    );

    return true;
  }

  // ---------------- WARNINGS ----------------

  if (
    cmd === "warnings" ||
    cmd === "clearwarns"
  ) {
    const target =
      targetUser(ctx) || {
        id: String(ctx.from.id),
        name: userName(ctx),
      };

    const user =
      getUser(target.id) || {};

    if (cmd === "clearwarns") {
      user.warnings = 0;

      addUser(target.id, user);
      saveDatabase();

      await ctx.reply(
        "✅ Wᴀʀɴɪɴɢs ᴄʟᴇᴀʀᴇᴅ.",
      );

      return true;
    }

    await ctx.reply(`
⚠️ Wᴀʀɴɪɴɢs

👤 ${escapeHtml(target.name)}

⚠️ Tᴏᴛᴀʟ:
${user.warnings || 0}
`);

    return true;
  }

  // ---------------- KICK ----------------

  if (cmd === "kick") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "👤 Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴜsᴇʀ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴋɪᴄᴋ.",
      );
      return true;
    }

    try {
      await ctx.telegram.banChatMember(
        ctx.chat.id,
        Number(target.id),
      );

      await ctx.telegram.unbanChatMember(
        ctx.chat.id,
        Number(target.id),
      );

      await ctx.reply(`
👢 Kɪᴄᴋᴇᴅ

👤 ${escapeHtml(target.name)}
`);
    } catch {
      await ctx.reply(
        "❌ I ᴄᴏᴜʟᴅɴ'ᴛ ᴋɪᴄᴋ ᴛʜɪs ᴜsᴇʀ.",
      );
    }

    return true;
  }

  // ---------------- BAN ----------------

  if (
    cmd === "ban" ||
    cmd === "softban" ||
    cmd === "tempban"
  ) {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "👤 Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴜsᴇʀ.",
      );
      return true;
    }

    try {
      await ctx.telegram.banChatMember(
        ctx.chat.id,
        Number(target.id),
      );

      await ctx.reply(`
🔨 Bᴀɴɴᴇᴅ

👤 ${escapeHtml(target.name)}
`);
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ʙᴀɴ ᴜsᴇʀ.",
      );
    }

    return true;
  }

  // ---------------- UNBAN ----------------

  if (cmd === "unban") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "👤 Pʀᴏᴠɪᴅᴇ ᴜsᴇʀ Iᴅ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇᴍ.",
      );
      return true;
    }

    try {
      await ctx.telegram.unbanChatMember(
        ctx.chat.id,
        Number(target.id),
      );

      await ctx.reply(
        "✅ Uѕᴇʀ ᴜɴʙᴀɴɴᴇᴅ.",
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴜɴʙᴀɴ.",
      );
    }

    return true;
  }

  // ---------------- MUTE ----------------

  if (
    cmd === "mute" ||
    cmd === "tmute"
  ) {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "🔇 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ.",
      );
      return true;
    }

    try {
      await ctx.telegram.restrictChatMember(
        ctx.chat.id,
        Number(target.id),
        {
          permissions: {
            can_send_messages: false,
            can_send_audios: false,
            can_send_documents: false,
            can_send_photos: false,
            can_send_videos: false,
            can_send_video_notes: false,
            can_send_voice_notes: false,
            can_send_polls: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
            can_change_info: false,
            can_invite_users: false,
            can_pin_messages: false,
          },
        },
      );

      await ctx.reply(
        `🔇 Mᴜᴛᴇᴅ ${escapeHtml(target.name)}`,
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴍᴜᴛᴇ ᴜsᴇʀ.",
      );
    }

    return true;
  }

  // ---------------- UNMUTE ----------------

  if (cmd === "unmute") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "🔊 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ.",
      );
      return true;
    }

    try {
      await ctx.telegram.restrictChatMember(
        ctx.chat.id,
        Number(target.id),
        {
          permissions: {
            can_send_messages: true,
            can_send_audios: true,
            can_send_documents: true,
            can_send_photos: true,
            can_send_videos: true,
            can_send_video_notes: true,
            can_send_voice_notes: true,
            can_send_polls: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true,
            can_invite_users: true,
          },
        },
      );

      await ctx.reply(
        `🔊 Uɴᴍᴜᴛᴇᴅ ${escapeHtml(target.name)}`,
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴜɴᴍᴜᴛᴇ.",
      );
    }

    return true;
  }

  // ---------------- PROMOTE ----------------

  if (cmd === "promote") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "👤 Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴜsᴇʀ.",
      );
      return true;
    }

    try {
      await ctx.telegram.promoteChatMember(
        ctx.chat.id,
        Number(target.id),
        {
          can_manage_chat: true,
          can_delete_messages: true,
          can_manage_video_chats: true,
          can_restrict_members: true,
          can_promote_members: false,
          can_change_info: true,
          can_invite_users: true,
          can_pin_messages: true,
        },
      );

      await ctx.reply(
        `⬆️ ${escapeHtml(target.name)} ɪs ɴᴏᴡ ᴀɴ ᴀᴅᴍɪɴ.`,
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ.",
      );
    }

    return true;
  }

  // ---------------- DEMOTE ----------------

  if (cmd === "demote") {
    const target = targetUser(ctx);

    if (!target) {
      await ctx.reply(
        "👤 Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴜsᴇʀ.",
      );
      return true;
    }

    try {
      await ctx.telegram.promoteChatMember(
        ctx.chat.id,
        Number(target.id),
        {
          can_manage_chat: false,
          can_delete_messages: false,
          can_manage_video_chats: false,
          can_restrict_members: false,
          can_promote_members: false,
          can_change_info: false,
          can_invite_users: false,
          can_pin_messages: false,
        },
      );

      await ctx.reply(
        `⬇️ ${escapeHtml(target.name)} ʜᴀs ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ.`,
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴇᴍᴏᴛᴇ.",
      );
    }

    return true;
  }

  // ---------------- DELETE ----------------

  if (
    cmd === "del" ||
    cmd === "clear"
  ) {
    if (!ctx.message?.reply_to_message) {
      await ctx.reply(
        "🗑️ Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ᴛᴏ ᴅᴇʟᴇᴛᴇ.",
      );
      return true;
    }

    try {
      await ctx.deleteMessage();

      await ctx.telegram.deleteMessage(
        ctx.chat.id,
        ctx.message.reply_to_message.message_id,
      );
    } catch {
      await ctx.reply(
        "❌ Cᴏᴜʟᴅ ɴᴏᴛ ᴅᴇʟᴇᴛᴇ ᴛʜᴇ ᴍᴇssᴀɢᴇ.",
      );
    }

    return true;
  }

  // ---------------- PIN ----------------

  if (cmd === "pin") {
    if (!ctx.message?.reply_to_message) {
      await ctx.reply(
        "📌 Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴘɪɴ.",
      );
      return true;
    }

    try {
      await ctx.telegram.pinChatMessage(
        ctx.chat.id,
        ctx.message.reply_to_message.message_id,
      );

      await ctx.reply(
        "📌 Mᴇssᴀɢᴇ ᴘɪɴɴᴇᴅ.",
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴘɪɴ.",
      );
    }

    return true;
  }

  // ---------------- UNPIN ----------------

  if (cmd === "unpin") {
    try {
      await ctx.telegram.unpinChatMessage(
        ctx.chat.id,
      );

      await ctx.reply(
        "📌 Mᴇssᴀɢᴇ ᴜɴᴘɪɴɴᴇᴅ.",
      );
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴜɴᴘɪɴ.",
      );
    }

    return true;
  }

  // ---------------- GROUP INFO ----------------

  if (cmd === "groupinfo") {
    await ctx.reply(`
╭━━━〔 👥 Gʀᴏᴜᴘ Iɴғᴏ 〕━━━╮

🏷️ Nᴀᴍᴇ:
${escapeHtml(ctx.chat.title || "Unknown")}

🆔 Iᴅ:
${ctx.chat.id}

📦 Tʏᴘᴇ:
${ctx.chat.type}

╰━━━━━━━━━━━━━━╯
`);

    return true;
  }

  // ---------------- ADMINS ----------------

  if (
    cmd === "admins" ||
    cmd === "adminlist"
  ) {
    try {
      const admins =
        await ctx.telegram.getChatAdministrators(
          ctx.chat.id,
        );

      const text = admins
        .map((admin, index) => {
          const name =
            admin.user.first_name ||
            admin.user.username ||
            "Unknown";

          return `${index + 1}. ${escapeHtml(name)}`;
        })
        .join("\n");

      await ctx.reply(`
╭━━━〔 👑 Aᴅᴍɪɴs 〕━━━╮

${text}

╰━━━━━━━━━━━━━━╯
`);
    } catch {
      await ctx.reply(
        "❌ Fᴀɪʟᴇᴅ ᴛᴏ ɢᴇᴛ ᴀᴅᴍɪɴs.",
      );
    }

    return true;
  }

  // ---------------- WELCOME / GOODBYE ----------------

  if (
    cmd === "welcome" ||
    cmd === "goodbye"
  ) {
    const value =
      String(args[0] || "").toLowerCase();

    if (!["on", "off"].includes(value)) {
      await ctx.reply(
        `Uѕᴀɢᴇ: /${cmd} on ᴏʀ /${cmd} off`,
      );
      return true;
    }

    if (!group.settings) {
      group.settings = {};
    }

    group.settings[cmd] =
      value === "on";

    saveDatabase();

    await ctx.reply(
      `${value === "on" ? "✅" : "❌"} ${cmd.toUpperCase()} ${value === "on" ? "Eɴᴀʙʟᴇᴅ" : "Dɪsᴀʙʟᴇᴅ"}.`,
    );

    return true;
  }

  // ---------------- SECURITY TOGGLES ----------------

  const toggleCommands = [
    "antilink",
    "antiflood",
    "antispam",
    "antibot",
    "antiraid",
    "antimention",
    "antiword",
    "antichannel",
    "antiforward",
    "antisticker",
    "antimedia",
    "antivoice",
    "antifile",
    "lock",
    "lockdown",
    "slowmode",
  ];

  if (toggleCommands.includes(cmd)) {
    const value =
      String(args[0] || "").toLowerCase();

    if (!["on", "off"].includes(value)) {
      await ctx.reply(
        `Uѕᴀɢᴇ: /${cmd} on ᴏʀ /${cmd} off`,
      );
      return true;
    }

    if (!group.settings) {
      group.settings = {};
    }

    group.settings[cmd] =
      value === "on";

    saveDatabase();

    await ctx.reply(
      `${value === "on" ? "✅" : "❌"} ${cmd} ${value === "on" ? "ᴇɴᴀʙʟᴇᴅ" : "ᴅɪsᴀʙʟᴇᴅ"}.`,
    );

    return true;
  }

  // ---------------- RULES ----------------

  if (cmd === "setrule") {
    const text = args.join(" ");

    if (!text) {
      await ctx.reply(
        "📜 Uѕᴀɢᴇ: /setrule Your group rules",
      );
      return true;
    }

    group.settings =
      group.settings || {};

    group.settings.rules = text;

    saveDatabase();

    await ctx.reply(
      "✅ Gʀᴏᴜᴘ ʀᴜʟᴇs sᴀᴠᴇᴅ.",
    );

    return true;
  }

  if (cmd === "rules") {
    const rules =
      group.settings?.rules ||
      "📜 Nᴏ ʀᴜʟᴇs ʜᴀᴠᴇ ʙᴇᴇɴ sᴇᴛ.";

    await ctx.reply(`
╭━━━〔 📜 Gʀᴏᴜᴘ Rᴜʟᴇs 〕━━━╮

${escapeHtml(rules)}

╰━━━━━━━━━━━━━━╯
`);

    return true;
  }

  // ---------------- GENERIC MODERATOR ----------------

  await ctx.reply(
    `🛡️ /${cmd}\n\n⚙️ Tʜɪs ᴍᴏᴅᴇʀᴀᴛᴏʀ ғᴇᴀᴛᴜʀᴇ ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ᴀɴᴅ ʀᴏᴜᴛᴇᴅ ᴛʜʀᴏᴜɢʜ ᴛʜᴇ ᴄᴇɴᴛʀᴀʟ ᴄᴏᴍᴍᴀɴᴅ sʏsᴛᴇᴍ.`,
  );

  return true;
}

// ============================================================
// ECONOMY
// ============================================================

async function economyCommand(ctx, cmd, args) {
  const user = ensureUser(ctx);

  if (!user) return true;

  if (cmd === "balance" || cmd === "wallet") {
    await ctx.reply(`
╭━━━〔 💰 Bᴀʟᴀɴᴄᴇ 〕━━━╮

👤 ${escapeHtml(userName(ctx))}

💰 Cᴏɪɴs:
${user.balance || 0}

╰━━━━━━━━━━━━━━╯
`);

    return true;
  }

  if (cmd === "bank") {
    await ctx.reply(
      `🏦 Bᴀɴᴋ Bᴀʟᴀɴᴄᴇ: ${user.balance || 0}`,
    );

    return true;
  }

  if (
    cmd === "daily" ||
    cmd === "weekly" ||
    cmd === "monthly"
  ) {
    const now = new Date();
    const key = `${cmd}Claimed`;

    const last = user[key]
      ? new Date(user[key])
      : null;

    let cooldown;

    if (cmd === "daily") {
      cooldown = 86400000;
    } else if (cmd === "weekly") {
      cooldown = 604800000;
    } else {
      cooldown = 2592000000;
    }

    if (
      last &&
      Date.now() - last.getTime() < cooldown
    ) {
      const remaining = Math.ceil(
        (cooldown -
          (Date.now() - last.getTime())) /
          3600000,
      );

      await ctx.reply(
        `⏳ Yᴏᴜ ᴄᴀɴ ᴄʟᴀɪᴍ /${cmd} ᴀɢᴀɪɴ ɪɴ ᴀʙᴏᴜᴛ ${remaining}ʜ.`,
      );

      return true;
    }

    const reward =
      cmd === "daily"
        ? 500
        : cmd === "weekly"
          ? 3500
          : 15000;

    user.balance =
      Number(user.balance || 0) +
      reward;

    user[key] =
      new Date().toISOString();

    addUser(String(ctx.from.id), user);
    saveDatabase();

    await ctx.reply(
      `🎁 ${cmd.toUpperCase()} Rᴇᴡᴀʀᴅ\n\n💰 +${reward} ᴄᴏɪɴs`,
    );

    return true;
  }

  if (cmd === "work") {
    const reward = random(100, 1000);

    user.balance =
      Number(user.balance || 0) +
      reward;

    addUser(String(ctx.from.id), user);
    saveDatabase();

    await ctx.reply(
      `💼 Yᴏᴜ ᴡᴏʀᴋᴇᴅ ᴀɴᴅ ᴇᴀʀɴᴇᴅ 💰 ${reward} ᴄᴏɪɴs.`,
    );

    return true;
  }

  if (cmd === "beg") {
    const reward = random(10, 300);

    user.balance =
      Number(user.balance || 0) +
      reward;

    addUser(String(ctx.from.id), user);
    saveDatabase();

    await ctx.reply(
      `🥺 Sᴏᴍᴇᴏɴᴇ ɢᴀᴠᴇ ʏᴏᴜ 💰 ${reward} ᴄᴏɪɴs.`,
    );

    return true;
  }

  if (cmd === "pay" || cmd === "give") {
    const target = targetUser(ctx);

    const amount = Number(
      args[args.length - 1],
    );

    if (!target || !Number.isFinite(amount)) {
      await ctx.reply(
        `Uѕᴀɢᴇ: /${cmd} <reply/user_id> <amount>`,
      );
      return true;
    }

    if (amount <= 0) {
      await ctx.reply(
        "❌ Iɴᴠᴀʟɪᴅ ᴀᴍᴏᴜɴᴛ.",
      );
      return true;
    }

    if (
      Number(user.balance || 0) <
      amount
    ) {
      await ctx.reply(
        "❌ Yᴏᴜ ᴅᴏɴ'ᴛ ʜᴀᴠᴇ ᴇɴᴏᴜɢʜ ᴄᴏɪɴs.",
      );
      return true;
    }

    const receiver =
      getUser(target.id) || {
        id: target.id,
        balance: 0,
      };

    user.balance -= amount;
    receiver.balance =
      Number(receiver.balance || 0) +
      amount;

    addUser(String(ctx.from.id), user);
    addUser(target.id, receiver);

    saveDatabase();

    await ctx.reply(
      `💸 Tʀᴀɴsғᴇʀʀᴇᴅ 💰 ${amount} ᴄᴏɪɴs.`,
    );

    return true;
  }

  if (
    cmd === "rich" ||
    cmd === "econtop" ||
    cmd === "econrank"
  ) {
    const database = db();

    const users = Object.values(
      database.users || {},
    )
      .sort(
        (a, b) =>
          Number(b.balance || 0) -
          Number(a.balance || 0),
      )
      .slice(0, 10);

    const text = users
      .map(
        (u, i) =>
          `${i + 1}. ${u.firstName || u.username || u.id} — 💰 ${u.balance || 0}`,
      )
      .join("\n");

    await ctx.reply(`
╭━━━〔 💰 Rɪᴄʜ Tᴏᴘ 10 〕━━━╮

${text || "Nᴏ ᴜsᴇʀs ʏᴇᴛ."}

╰━━━━━━━━━━━━━━╯
`);

    return true;
  }

  // Economy commands that don't need special logic yet.
  await ctx.reply(
    `💰 /${cmd}\n\n⚡ Cᴏᴍᴍᴀɴᴅ ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ ᴇᴄᴏɴᴏᴍʏ sʏsᴛᴇᴍ.`,
  );

  return true;
}

// ============================================================
// GAMES
// ============================================================

async function gameCommand(ctx, cmd, args) {
  if (cmd === "coinflip") {
    const result =
      Math.random() < 0.5
        ? "🪙 Hᴇᴀᴅs"
        : "🪙 Tᴀɪʟs";

    await ctx.reply(
      `🪙 Cᴏɪɴғʟɪᴘ\n\n${result}`,
    );

    return true;
  }

  if (cmd === "dice") {
    const result = random(1, 6);

    await ctx.reply(
      `🎲 Yᴏᴜ ʀᴏʟʟᴇᴅ: ${result}`,
    );

    return true;
  }

  if (cmd === "rps") {
    const choices = [
      "🪨 Rᴏᴄᴋ",
      "📄 Pᴀᴘᴇʀ",
      "✂️ Sᴄɪssᴏʀs",
    ];

    await ctx.reply(
      `🎮 Rᴘs\n\n🤖 Bᴏᴛ: ${
        choices[random(0, 2)]
      }\n\nUѕᴇ /rps <rock|paper|scissors>`,
    );

    return true;
  }

  if (
    cmd === "guess" ||
    cmd === "math" ||
    cmd === "quiz" ||
    cmd === "trivia" ||
    cmd === "riddle"
  ) {
    const number = random(1, 10);

    await ctx.reply(
      `🎮 ${cmd.toUpperCase()}\n\n🔢 Gᴜᴇss ᴀ ɴᴜᴍʙᴇʀ ʙᴇᴛᴡᴇᴇɴ 1 ᴀɴᴅ 10.\n\n💡 Tʜɪs ʀᴏᴜɴᴅ: ${number}`,
    );

    return true;
  }

  if (
    cmd === "slots" ||
    cmd === "spin"
  ) {
    const symbols = [
      "🍒",
      "🍋",
      "🍇",
      "⭐",
      "💎",
    ];

    const result = [
      symbols[random(0, symbols.length - 1)],
      symbols[random(0, symbols.length - 1)],
      symbols[random(0, symbols.length - 1)],
    ];

    await ctx.reply(`
🎰 Sʟᴏᴛs

[ ${result.join(" | ")} ]

${result[0] === result[1] &&
result[1] === result[2]
      ? "🎉 Jᴀᴄᴋᴘᴏᴛ!"
      : "😅 Tʀʏ ᴀɢᴀɪɴ!"}
`);

    return true;
  }

  if (
    cmd === "gamble" ||
    cmd === "blackjack" ||
    cmd === "baccarat" ||
    cmd === "mines"
  ) {
    await ctx.reply(
      `🎮 /${cmd}\n\n⚠️ Tʜɪs ɪs ᴀ ᴠɪʀᴛᴜᴀʟ ɪɴ-ʙᴏᴛ ɢᴀᴍᴇ. Nᴏ ʀᴇᴀʟ ᴍᴏɴᴇʏ ɪs ᴜsᴇᴅ.`,
    );

    return true;
  }

  await ctx.reply(
    `🎮 /${cmd}\n\n⚡ Gᴀᴍᴇ ᴄᴏᴍᴍᴀɴᴅ ʀᴏᴜᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ.`,
  );

  return true;
}

// ============================================================
// SOCIAL
// ============================================================

async function socialCommand(ctx, cmd) {
  const target = targetUser(ctx);

  if (
    [
      "hug",
      "kiss",
      "cuddle",
      "pat",
      "slap",
      "punch",
      "bite",
      "highfive",
      "wave",
      "cheer",
      "compliment",
      "flirt",
      "roast",
    ].includes(cmd)
  ) {
    const targetName =
      target?.name || "sᴏᴍᴇᴏɴᴇ";

    await ctx.reply(
      `💕 ${userName(ctx)} ${cmd} ${targetName}!`,
    );

    return true;
  }

  if (
    cmd === "ship" ||
    cmd === "shiprate"
  ) {
    const rate = random(0, 100);

    await ctx.reply(`
💕 Sʜɪᴘ Rᴀᴛᴇ

💘 Cᴏᴍᴘᴀᴛɪʙɪʟɪᴛʏ:
${rate}%

${rate >= 80
        ? "💍 Pᴏᴡᴇʀ Cᴏᴜᴘʟᴇ!"
        : rate >= 50
          ? "💕 Nᴏᴛ Bᴀᴅ!"
          : "😂 Tʀʏ Aɢᴀɪɴ!"}
`);

    return true;
  }

  if (
    cmd === "love" ||
    cmd === "crush"
  ) {
    await ctx.reply(
      `💕 Lᴏᴠᴇ Sᴛᴀᴛᴜs: ${random(1, 100)}%`,
    );

    return true;
  }

  await ctx.reply(
    `💕 /${cmd}\n\n⚡ Sᴏᴄɪᴀʟ ғᴇᴀᴛᴜʀᴇ ʀᴇɢɪsᴛᴇʀᴇᴅ.`,
  );

  return true;
}

// ============================================================
// TOOLS
// ============================================================

async function toolsCommand(ctx, cmd, args) {
  if (cmd === "calc" || cmd === "evalmath") {
    const expression = args.join(" ");

    if (!expression) {
      await ctx.reply(
        "🧮 Uѕᴀɢᴇ: /calc 10 + 20",
      );
      return true;
    }

    // Safe basic calculator.
    if (
      !/^[0-9+\-*/().%\s]+$/.test(
        expression,
      )
    ) {
      await ctx.reply(
        "❌ Oɴʟʏ ʙᴀsɪᴄ ᴍᴀᴛʜ ᴇxᴘʀᴇssɪᴏɴs ᴀʀᴇ ᴀʟʟᴏᴡᴇᴅ.",
      );
      return true;
    }

    try {
      const result = Function(
        `"use strict"; return (${expression})`,
      )();

      await ctx.reply(
        `🧮 Rᴇsᴜʟᴛ: ${result}`,
      );
    } catch {
      await ctx.reply(
        "❌ Iɴᴠᴀʟɪᴅ ᴇxᴘʀᴇssɪᴏɴ.",
      );
    }

    return true;
  }

  if (cmd === "random") {
    await ctx.reply(
      `🎲 Rᴀɴᴅᴏᴍ: ${random(1, 100)}`,
    );

    return true;
  }

  if (cmd === "randomnumber") {
    const min = Number(args[0] || 1);
    const max = Number(args[1] || 100);

    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min > max
    ) {
      await ctx.reply(
        "❌ Uѕᴀɢᴇ: /randomnumber 1 100",
      );
      return true;
    }

    await ctx.reply(
      `🎲 Rᴀɴᴅᴏᴍ Nᴜᴍʙᴇʀ: ${random(
        min,
        max,
      )}`,
    );

    return true;
  }

  if (cmd === "uuid") {
    const uuid = crypto.randomUUID();

    await ctx.reply(
      `🔐 UUID:\n${uuid}`,
    );

    return true;
  }

  if (cmd === "base64encode") {
    const text = args.join(" ");

    if (!text) {
      await ctx.reply(
        "Uѕᴀɢᴇ: /base64encode text",
      );
      return true;
    }

    await ctx.reply(
      Buffer.from(text).toString("base64"),
    );

    return true;
  }

  if (cmd === "base64decode") {
    const text = args.join(" ");

    if (!text) {
      await ctx.reply(
        "Uѕᴀɢᴇ: /base64decode encoded_text",
      );
      return true;
    }

    try {
      await ctx.reply(
        Buffer.from(
          text,
          "base64",
        ).toString("utf8"),
      );
    } catch {
      await ctx.reply(
        "❌ Iɴᴠᴀʟɪᴅ Bᴀsᴇ64.",
      );
    }

    return true;
  }

  if (cmd === "timestamp") {
    await ctx.reply(
      `⏱️ ${Date.now()}`,
    );

    return true;
  }

  if (cmd === "time") {
    await ctx.reply(
      `🕐 ${new Date().toUTCString()}`,
    );

    return true;
  }

  if (cmd === "date") {
    await ctx.reply(
      `📅 ${new Date().toLocaleDateString()}`,
    );

    return true;
  }

  if (cmd === "percentage") {
    const a = Number(args[0]);
    const b = Number(args[1]);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      await ctx.reply(
        "Uѕᴀɢᴇ: /percentage 25 100",
      );
      return true;
    }

    await ctx.reply(
      `📊 ${((a / b) * 100).toFixed(2)}%`,
    );

    return true;
  }

  if (cmd === "age") {
    const year = Number(args[0]);

    if (
      !Number.isInteger(year) ||
      year < 1900
    ) {
      await ctx.reply(
        "Uѕᴀɢᴇ: /age 2000",
      );
      return true;
    }

    await ctx.reply(
      `🎂 Aɢᴇ: ${new Date().getFullYear() - year}`,
    );

    return true;
  }

  if (cmd === "password") {
    const length = Math.min(
      Math.max(
        Number(args[0] || 16),
        4,
      ),
      128,
    );

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    let password = "";

    for (let i = 0; i < length; i++) {
      password +=
        chars[
          random(0, chars.length - 1)
        ];
    }

    await ctx.reply(
      `🔐 Gᴇɴᴇʀᴀᴛᴇᴅ Pᴀssᴡᴏʀᴅ:\n\n${password}`,
    );

    return true;
  }

  if (
    cmd === "eval" ||
    cmd === "exec" ||
    cmd === "shell"
  ) {
    await ctx.reply(
      "🔒 Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴅɪsᴀʙʟᴇᴅ ғᴏʀ sᴇᴄᴜʀɪᴛʏ.",
    );

    return true;
  }

  await ctx.reply(
    `🛠️ /${cmd}\n\n⚡ Tᴏᴏʟ ʀᴏᴜᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ.`,
  );

  return true;
}

// ============================================================
// PET SYSTEM
// ============================================================

async function petCommand(ctx, cmd, args) {
  const user = ensureUser(ctx);

  user.pets =
    Array.isArray(user.pets)
      ? user.pets
      : [];

  if (cmd === "pet") {
    if (user.pets.length === 0) {
      user.pets.push({
        id: crypto.randomUUID(),
        name: "Rimuru",
        type: "Slime",
        level: 1,
        xp: 0,
        health: 100,
        happiness: 100,
      });

      addUser(
        String(ctx.from.id),
        user,
      );

      saveDatabase();

      await ctx.reply(
        "🐾 Yᴏᴜ ᴀᴅᴏᴘᴛᴇᴅ ᴀ Sʟɪᴍᴇ ᴘᴇᴛ ɴᴀᴍᴇᴅ Rɪᴍᴜʀᴜ!",
      );

      return true;
    }

    await ctx.reply(
      `🐾 Yᴏᴜʀ Pᴇᴛ: ${user.pets[0].name}`,
    );

    return true;
  }

  if (
    cmd === "pets" ||
    cmd === "petinfo"
  ) {
    const pet = user.pets[0];

    if (!pet) {
      await ctx.reply(
        "🐾 Yᴏᴜ ᴅᴏɴ'ᴛ ʜᴀᴠᴇ ᴀ ᴘᴇᴛ. Uѕᴇ /pet.",
      );
      return true;
    }

    await ctx.reply(`
╭━━━〔 🐾 Pᴇᴛ 〕━━━╮

🐾 Nᴀᴍᴇ:
${pet.name}

🧬 Tʏᴘᴇ:
${pet.type}

⭐ Lᴇᴠᴇʟ:
${pet.level}

❤️ Hᴇᴀʟᴛʜ:
${pet.health}

😊 Hᴀᴘᴘɪɴᴇss:
${pet.happiness}

╰━━━━━━━━━━━━━━╯
`);

    return true;
  }

  if (
    cmd === "feed" ||
    cmd === "water" ||
    cmd === "playpet"
  ) {
    const pet = user.pets[0];

    if (!pet) {
      await ctx.reply(
        "🐾 Uѕᴇ /pet ғɪʀsᴛ.",
      );
      return true;
    }

    if (cmd === "feed") {
      pet.health = Math.min(
        100,
        Number(pet.health || 0) + 10,
      );
    }

    if (cmd === "water") {
      pet.health = Math.min(
        100,
        Number(pet.health || 0) + 5,
      );
    }

    if (cmd === "playpet") {
      pet.happiness = Math.min(
        100,
        Number(pet.happiness || 0) + 10,
      );

      pet.xp =
        Number(pet.xp || 0) + 10;
    }

    addUser(
      String(ctx.from.id),
      user,
    );

    saveDatabase();

    await ctx.reply(
      `🐾 Yᴏᴜ ᴜsᴇᴅ /${
