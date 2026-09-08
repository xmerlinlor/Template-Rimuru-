// commands.js
// ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ — ALL-IN-ONE COMMAND SYSTEM

import {
  getDatabase,
  save,
  addUser,
  getUser,
  addGroup,
  getGroup,
  getGroupSettings,
  setGroupSetting,
  updateGroupSettings,
  addSudo,
  removeSudo,
  isSudo,
  blockUser,
  unblockUser,
  isBlocked,
  getBlockedUsers,
  getSetting,
  setSetting,
  getSettings,
  getEconomy,
  updateEconomy,
  getGameData,
  updateGameData,
  getPetData,
  getPokemonData,
  getEmpireData,
  createBackup,
  userCount,
  groupCount
} from "./database.js";

/* =========================================================
   📚 COMMAND LIST
========================================================= */

const commandCategories = {
  moderator: [
    "warn","unwarn","warnings","clearwarns","kick","ban","unban",
    "mute","unmute","tmute","promote","demote","admins","adminlist",
    "lock","unlock","lockdown","unlockdown","slowmode","antilink",
    "antiflood","antispam","antibot","antiraid","antimention",
    "antiword","antichannel","antiforward","antisticker","antimedia",
    "antivoice","antifile","pin","unpin","unpinall","del","purge",
    "clear","setrule","rules","delrule","filter","addfilter",
    "delfilter","filterlist","filters","welcome","goodbye","setname",
    "setdesc","setphoto","groupinfo","setwarn","warnlimit",
    "resetsettings","softban","tempban","banlist","mutelist","setadmin"
  ],

  games: [
    "game","quiz","trivia","guess","riddle","wordgame","hangman",
    "unscramble","scramble","math","rps","dice","coinflip","slots",
    "spin","gamble","duel","leaderboard","rank","stats","gamehelp",
    "crossword","memory","sequence","puzzle","logic","emojiquiz",
    "flagquiz","capital","oddone","truth","battle","attack","defend",
    "arena","tournament","challenge","boss","raid","team","jointeam",
    "highlow","blackjack","baccarat","mines","tower","treasure","maze",
    "reaction","tap","typing","dailygame","gamebonus","gamexp",
    "gamelevel","achievements","badges","gamestreak","gameprofile",
    "gamestats","gamerank","topplayers"
  ],

  social: [
    "marry","divorce","spouse","crush","love","ship","couple","profile",
    "bio","rep","reputation","hug","kiss","cuddle","pat","slap","punch",
    "bite","highfive","wave","cheer","compliment","flirt","roast","poll",
    "confession","socialhelp","friends","friend","unfriend","socialrank",
    "shiprate","question","anonymous","vote","socialstats","socialtop",
    "friendship","interaction","socialachievements"
  ],

  tools: [
    "weather","forecast","calc","makeqr","readqr","shorturl","expandurl",
    "base64encode","base64decode","hash","md5","sha256","password",
    "random","randomnumber","uuid","timestamp","time","date","id",
    "userinfo","ping","font","emoji","translate","detectlang","color",
    "percentage","convert","unit","age","count","stopwatch","timer",
    "encode","decode","json","evalmath"
  ],

  pet: [
    "pet","adopt","pets","petinfo","namepet","renamepet","feed","water",
    "playpet","petcare","trainpet","petlevel","petxp","petstats",
    "pethealth","petenergy","pethappiness","petmood","petshop","petfood",
    "buyfood","usefood","pettoy","buytoy","usepettoy","petbattle",
    "petduel","petquest","petmission","petwalk","petrest","petsleep",
    "petcollection","petbreed","petevolve","pettrade","petgift",
    "petrank","pettop","petachievements","pethelp"
  ],

  anime: [
    "anime","animesearch","animeinfo","animechar","character","charinfo",
    "randomanime","randomchar","animequote","animequotes","animegenre",
    "animegenres","animewatch","recommend","animepopular","animeairing",
    "animeupcoming","animefinished","animefav","addanime","delanime",
    "animelist","animetop","animerank","animequiz","animeguess",
    "animebattle","animeduel","animeprofile","animecollection","animehelp"
  ],

  pokemon: [
    "pokemon","pokedex","pokeinfo","catch","huntpokemon","wildpokemon",
    "pokeball","buyball","throwball","mypokemon","pokecollection",
    "pokeparty","setparty","removeparty","pokemonstats","pokelevel",
    "pokexp","evolve","stone","useevolve","pokebattle","pokeduel",
    "pokegym","gymbattle","poketrainer","trainpokemon","pokecamp",
    "pokefeed","pokeheal","poketrade","pokegift","pokemarket",
    "pokeshop","pokecoin","pokebadge","badges","pokemissions",
    "pokequests","poketournament","pokerank","poketop","pokequiz",
    "pokeguess","pokecollect","pokehelp"
  ],

  music: [
    "download","play","song","video","yt","ytmp3","ytmp4","tt",
    "tiktok","ins","ig","instagram","fb","facebook","twitter",
    "spotify","lyrics","info","music","searchsong","audio","artist",
    "album","songinfo","mediainfo","nowplaying","queue","skip",
    "pause","resume","stop","musichelp"
  ],

  economy: [
    "balance","wallet","bank","daily","weekly","monthly","bonus","work",
    "beg","crime","hunt","fish","mine","deposit","withdraw","pay","give",
    "rob","rich","shop","inventory","streak","explore","treasure",
    "scavenge","buy","sell","use","items","market","networth","transfer",
    "transactions","level","xp","achievements","collection","econrank",
    "econtop","history","economyhelp"
  ],

  shop: [
    "shop","items","market","buy","sell","use","equip","unequip",
    "inventory","iteminfo","itemlist","buyitem","sellitem","weaponshop",
    "armor_shop","petshop","pokeshop","empire_shop","upgrade","repair",
    "craft","recipe","materials","tradeitem","giftitem","auction","bid",
    "myorders","shoprank","shophelp"
  ],

  war: [
    "spy","kill","revive","addprotect","bounty","hitlist","bodycount",
    "warzones","duel","heist","teamup","ambush","medkit","armor",
    "weapons","battlelog","warhelp","assassinate","track","scout","heal",
    "protect","claimbounty","bounties","challenge","war","raid","weapon",
    "equip","inventory","upgradeweapon","kills","deaths","killstreak",
    "warrank","topassassins","warstats"
  ],

  empire: [
    "empire","createempire","empireinfo","empirestats","empirerank",
    "attackempire","defend","raid","war","peace","alliance","members",
    "build","upgrade","resources","collect","treasury","army","train",
    "empirehelp","empirename","surrender","battlereport","alliances",
    "inviteempire","acceptalliance","leavealliance","diplomacy","invite",
    "joinempire","leaveempire","promote","demote","kickmember","buildings",
    "repair","fortify","storage","trade","market","recruit","armyinfo",
    "equipment","defenses","general","territory","expand","explore",
    "conquer","borders","map","empirequest","empiremission",
    "empirereward","empirelevel","empireachievements"
  ],

  general: [
    "start","help","menu","profile","id","me","ping","status","uptime",
    "about","owner","contactowner","invite","chatinfo","admins","time",
    "rules","support","settings","language","setlanguage","feedback",
    "report","bug","version","changelog"
  ],

  ai: [
    "ai","ask","chatbot","story","poem","advice","translate","reset",
    "summarize","rewrite","grammar","explain","code","debug","idea",
    "brainstorm","question","characterai","roleplay","imagine","jokeai",
    "factai","quizai","aistory","aipoem","aimage","aihelp"
  ],

  owner: [
    "broadcast","gbroadcast","banuser","unbanuser","block","unblock",
    "blocklist","addsudo","delsudo","sudolist","forcejoin",
    "setforcechannel","setforcegroup","addforce","delforce","forcelist",
    "forceinfo","forcebypass","removebypass","bypasslist","forcemessage",
    "forcebutton","forcehelp","maintenance","restart","shutdown","update",
    "autorestart","debug","logs","stats","users","groups","database",
    "backup","restore","setprefix","setname","setbio","setabout",
    "setphoto","eval","exec","shell","ownerhelp"
  ]
};

/* =========================================================
   🔎 COMMAND INDEX
========================================================= */

const commandIndex = new Map();

for (const [category, list] of Object.entries(commandCategories)) {
  for (const command of list) {
    if (!commandIndex.has(command)) {
      commandIndex.set(command, category);
    }
  }
}

/* =========================================================
   🧰 HELPERS
========================================================= */

function text(ctx) {
  return ctx.message?.text || "";
}

function args(ctx) {
  return text(ctx).trim().split(/\s+/).slice(1);
}

function commandName(ctx) {
  const first = text(ctx).trim().split(/\s+/)[0] || "";

  return first
    .replace(/^\//, "")
    .split("@")[0]
    .toLowerCase();
}

function displayName(user) {
  if (!user) return "User";

  return (
    user.first_name ||
    user.username ||
    "User"
  );
}

function isOwner(ctx) {
  const ownerId = String(process.env.OWNER_ID || "");

  return (
    ownerId &&
    String(ctx.from?.id || "") === ownerId
  );
}

function isGroup(ctx) {
  return (
    ctx.chat &&
    ["group", "supergroup"].includes(ctx.chat.type)
  );
}

function isPrivate(ctx) {
  return ctx.chat?.type === "private";
}

function isAdmin(ctx) {
  if (!isGroup(ctx)) return false;

  const user = ctx.from;

  if (!user) return false;

  return (
    user.id === ctx.chat?.owner?.id ||
    user.status === "administrator" ||
    user.status === "creator"
  );
}

/*
 * Telegram does not always include the member status
 * inside ctx.from, so this function asks Telegram.
 */
async function checkAdmin(ctx) {
  if (!isGroup(ctx)) return false;

  try {
    const member = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );

    return (
      member.status === "administrator" ||
      member.status === "creator"
    );
  } catch {
    return false;
  }
}

async function requireAdmin(ctx) {
  if (isOwner(ctx)) return true;

  const admin = await checkAdmin(ctx);

  if (!admin) {
    await ctx.reply(
      "❌ Yᴏᴜ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ."
    );

    return false;
  }

  return true;
}

function ensureUser(ctx) {
  if (!ctx.from) return null;

  return addUser(ctx.from.id, {
    username: ctx.from.username || "",
    firstName: ctx.from.first_name || "",
    lastName: ctx.from.last_name || ""
  });
}

function ensureGroup(ctx) {
  if (!isGroup(ctx)) return null;

  return addGroup(ctx.chat.id, {
    title: ctx.chat.title || ""
  });
}

function getTargetId(ctx) {
  if (ctx.message?.reply_to_message?.from?.id) {
    return ctx.message.reply_to_message.from.id;
  }

  const first = args(ctx)[0];

  if (first && /^\d+$/.test(first)) {
    return Number(first);
  }

  return null;
}

function formatDuration(seconds) {
  const d = Math.floor(seconds / 86400);
  seconds %= 86400;

  const h = Math.floor(seconds / 3600);
  seconds %= 3600;

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${d}d ${h}h ${m}m ${s}s`;
}

/* =========================================================
   ⚠️ WARNINGS
========================================================= */

function getWarnings(groupId, userId) {
  const group = addGroup(groupId);

  if (!group.warnings) {
    group.warnings = {};
  }

  const id = String(userId);

  if (!group.warnings[id]) {
    group.warnings[id] = [];
  }

  return group.warnings[id];
}

function addWarning(groupId, userId, reason = "No reason") {
  const warnings = getWarnings(groupId, userId);

  warnings.push({
    reason,
    time: Date.now()
  });

  save();

  return warnings.length;
}

function clearWarnings(groupId, userId) {
  const group = addGroup(groupId);

  if (!group.warnings) {
    group.warnings = {};
  }

  delete group.warnings[String(userId)];

  save();
}

/* =========================================================
   👋 WELCOME / GOODBYE
========================================================= */

async function sendWelcome(ctx, user) {
  const group = ctx.chat;

  const joined = new Date();

  const message = `
╭━━━〔 ⛦⃝ ᴡᴇʟᴄᴏᴍᴇ ⃝⛦ 〕━━━╮

👋 Hᴇʏ ${displayName(user)}

🎉 Wᴇʟᴄᴏᴍᴇ ᴛᴏ ${group.title || "ᴏᴜʀ ᴄᴏᴍᴍᴜɴɪᴛʏ"}!

💫 Wᴇ'ʀᴇ ᴛʀᴜʟʏ ʜᴀᴘᴘʏ ᴛᴏ ʜᴀᴠᴇ ʏᴏᴜ ʜᴇʀᴇ.
🤝 Fᴇᴇʟ ғʀᴇᴇ ᴛᴏ ɪɴᴛᴇʀᴀᴄᴛ, ᴍᴇᴇᴛ ɴᴇᴡ ᴘᴇᴏᴘʟᴇ & ᴇɴᴊᴏʏ ᴛʜᴇ ᴄᴏᴍᴍᴜɴɪᴛʏ! ✨

╭──〔 👤 Uѕᴇʀ Iɴғᴏ 〕──╮

🆔 Iᴅ └ ${user.id}
📅 Jᴏɪɴᴇᴅ └ ${joined.toLocaleDateString()}
📆 Dᴀʏ └ ${joined.toLocaleDateString("en-US", {
    weekday: "long"
  })}

╰────────────────╯

╰━━━〔 💙 ᴇɴᴊᴏʏ ʏᴏᴜʀ sᴛᴀʏ! 〕━━━╯
`;

  return ctx.reply(message);
}

/* =========================================================
   🛡️ MODERATOR COMMANDS
========================================================= */

async function handleModerator(ctx, cmd) {
  if (!isGroup(ctx)) {
    await ctx.reply("❌ Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
    return true;
  }

  if (!(await requireAdmin(ctx))) {
    return true;
  }

  const group = ensureGroup(ctx);
  const settings = getGroupSettings(ctx.chat.id);

  switch (cmd) {
    case "warn": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴏʀ ᴜsᴇ:\n/warn <user_id> [reason]"
        );
        return true;
      }

      const reason =
        args(ctx).slice(1).join(" ") || "No reason";

      const count = addWarning(
        ctx.chat.id,
        target,
        reason
      );

      const limit = Number(
        settings.warnLimit || 3
      );

      await ctx.reply(
        `⚠️ Wᴀʀɴɪɴɢ ᴀᴅᴅᴇᴅ.\n\n👤 Uѕᴇʀ: ${target}\n📝 Rᴇᴀsᴏɴ: ${reason}\n🔢 Wᴀʀɴɪɴɢs: ${count}/${limit}`
      );

      if (count >= limit) {
        try {
          await ctx.telegram.banChatMember(
            ctx.chat.id,
            target
          );

          clearWarnings(
            ctx.chat.id,
            target
          );

          await ctx.reply(
            `🚫 Uѕᴇʀ ${target} ʀᴇᴀᴄʜᴇᴅ ᴛʜᴇ ᴡᴀʀɴ ʟɪᴍɪᴛ ᴀɴᴅ ᴡᴀs ʙᴀɴɴᴇᴅ.`
          );
        } catch {
          await ctx.reply(
            "❌ I ᴄᴏᴜʟᴅɴ'ᴛ ʙᴀɴ ᴛʜᴇ ᴜsᴇʀ."
          );
        }
      }

      return true;
    }

    case "warnings": {
      const target =
        getTargetId(ctx) ||
        ctx.from.id;

      const warnings =
        getWarnings(ctx.chat.id, target);

      if (!warnings.length) {
        await ctx.reply(
          `✅ Uѕᴇʀ ${target} ʜᴀs ɴᴏ ᴡᴀʀɴɪɴɢs.`
        );
        return true;
      }

      const list = warnings
        .map(
          (w, i) =>
            `${i + 1}. ${w.reason}`
        )
        .join("\n");

      await ctx.reply(
        `⚠️ Wᴀʀɴɪɴɢs ғᴏʀ ${target}:\n\n${list}`
      );

      return true;
    }

    case "unwarn":
    case "clearwarns": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴜsᴇʀ ID."
        );
        return true;
      }

      clearWarnings(
        ctx.chat.id,
        target
      );

      await ctx.reply(
        `✅ Wᴀʀɴɪɴɢs ᴄʟᴇᴀʀᴇᴅ ғᴏʀ ${target}.`
      );

      return true;
    }

    case "kick": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "👢 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ᴋɪᴄᴋ ᴛʜᴇᴍ."
        );
        return true;
      }

      try {
        await ctx.telegram.banChatMember(
          ctx.chat.id,
          target
        );

        await ctx.telegram.unbanChatMember(
          ctx.chat.id,
          target
        );

        await ctx.reply(
          `👢 Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ᴋɪᴄᴋᴇᴅ.`
        );
      } catch {
        await ctx.reply(
          "❌ I ᴄᴏᴜʟᴅɴ'ᴛ ᴋɪᴄᴋ ᴛʜᴇ ᴜsᴇʀ."
        );
      }

      return true;
    }

    case "ban":
    case "tempban":
    case "softban": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "🚫 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ʙᴀɴ ᴛʜᴇᴍ."
        );
        return true;
      }

      try {
        await ctx.telegram.banChatMember(
          ctx.chat.id,
          target
        );

        await ctx.reply(
          `🚫 Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ʙᴀɴɴᴇᴅ.`
        );
      } catch {
        await ctx.reply(
          "❌ I ᴄᴏᴜʟᴅɴ'ᴛ ʙᴀɴ ᴛʜᴇ ᴜsᴇʀ."
        );
      }

      return true;
    }

    case "unban": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "♻️ Uѕᴇ /unban <user_id>."
        );
        return true;
      }

      try {
        await ctx.telegram.unbanChatMember(
          ctx.chat.id,
          target
        );

        await ctx.reply(
          `♻️ Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ᴜɴʙᴀɴɴᴇᴅ.`
        );
      } catch {
        await ctx.reply(
          "❌ Cᴏᴜʟᴅɴ'ᴛ ᴜɴʙᴀɴ ᴜsᴇʀ."
        );
      }

      return true;
    }

    case "mute":
    case "tmute": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "🔇 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ᴍᴜᴛᴇ ᴛʜᴇᴍ."
        );
        return true;
      }

      try {
        await ctx.telegram.restrictChatMember(
          ctx.chat.id,
          target,
          {
            permissions: {
              can_send_messages: false
            }
          }
        );

        await ctx.reply(
          `🔇 Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ᴍᴜᴛᴇᴅ.`
        );
      } catch {
        await ctx.reply(
          "❌ Cᴏᴜʟᴅɴ'ᴛ ᴍᴜᴛᴇ ᴜsᴇʀ."
        );
      }

      return true;
    }

    case "unmute": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "🔊 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ᴜɴᴍᴜᴛᴇ ᴛʜᴇᴍ."
        );
        return true;
      }

      try {
        await ctx.telegram.restrictChatMember(
          ctx.chat.id,
          target,
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
              can_add_web_page_previews: true
            }
          }
        );

        await ctx.reply(
          `🔊 Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ᴜɴᴍᴜᴛᴇᴅ.`
        );
      } catch {
        await ctx.reply(
          "❌ Cᴏᴜʟᴅɴ'ᴛ ᴜɴᴍᴜᴛᴇ ᴜsᴇʀ."
        );
      }

      return true;
    }

    case "promote":
    case "demote": {
      const target = getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          `👤 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ${cmd}.`
        );
        return true;
      }

      try {
        if (cmd === "promote") {
          await ctx.telegram.promoteChatMember(
            ctx.chat.id,
            target,
            {
              can_manage_chat: true,
              can_delete_messages: true,
              can_manage_video_chats: true,
              can_restrict_members: true,
              can_promote_members: false,
              can_change_info: true,
              can_invite_users: true,
              can_pin_messages: true
            }
          );

          await ctx.reply(
            `⬆️ Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ᴘʀᴏᴍᴏᴛᴇᴅ.`
          );
        } else {
          await ctx.telegram.promoteChatMember(
            ctx.chat.id,
            target,
            {
              can_manage_chat: false,
              can_delete_messages: false,
              can_manage_video_chats: false,
              can_restrict_members: false,
              can_promote_members: false,
              can_change_info: false,
              can_invite_users: false,
              can_pin_messages: false
            }
          );

          await ctx.reply(
            `⬇️ Uѕᴇʀ ${target} ʜᴀs ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ.`
          );
        }
      } catch {
        await ctx.reply(
          "❌ I ᴄᴏᴜʟᴅɴ'ᴛ ᴄʜᴀɴɢᴇ ᴛʜᴇ ᴜsᴇʀ's ᴀᴅᴍɪɴ sᴛᴀᴛᴜs."
        );
      }

      return true;
    }

    case "admins":
    case "adminlist": {
      try {
        const admins =
          await ctx.telegram.getChatAdministrators(
            ctx.chat.id
          );

        const list = admins
          .map(
            (admin, index) =>
              `${index + 1}. ${displayName(admin.user)} — ${admin.status}`
          )
          .join("\n");

        await ctx.reply(
          `👑 Gʀᴏᴜᴘ Aᴅᴍɪɴs\n\n${list}`
        );
      } catch {
        await ctx.reply(
          "❌ Cᴏᴜʟᴅɴ'ᴛ ʟᴏᴀᴅ ᴀᴅᴍɪɴs."
        );
      }

      return true;
    }

    case "welcome":
    case "goodbye": {
      const value =
        (args(ctx)[0] || "").toLowerCase();

      if (!["on", "off"].includes(value)) {
        const current =
          settings[cmd] !== false;

        await ctx.reply(
          `⚙️ /${cmd} ${current ? "on" : "off"}\n\nUѕᴇ:\n/${cmd} on\n/${cmd} off`
        );

        return true;
      }

      setGroupSetting(
        ctx.chat.id,
        cmd,
        value === "on"
      );

      await ctx.reply(
        `✅ ${cmd.toUpperCase()} ʜᴀs ʙᴇᴇɴ ${value === "on" ? "ᴇɴᴀʙʟᴇᴅ" : "ᴅɪsᴀʙʟᴇᴅ"}.`
      );

      return true;
    }

    case "antilink":
    case "antiflood":
    case "antispam":
    case "antibot":
    case "antiraid":
    case "antimention":
    case "antiword":
    case "antichannel":
    case "antiforward":
    case "antisticker":
    case "antimedia":
    case "antivoice":
    case "antifile":
    case "lock":
    case "unlock":
    case "lockdown":
    case "unlockdown": {
      const value =
        (args(ctx)[0] || "").toLowerCase();

      const key =
        cmd === "lockdown"
          ? "lockdown"
          : cmd === "unlockdown"
            ? "lockdown"
            : cmd === "lock"
              ? "locked"
              : cmd === "unlock"
                ? "locked"
                : cmd;

      if (!["on", "off"].includes(value)) {
        const current =
          Boolean(settings[key]);

        await ctx.reply(
          `⚙️ /${cmd}\n\nSᴛᴀᴛᴜs: ${current ? "ON" : "OFF"}\n\nUѕᴇ:\n/${cmd} on\n/${cmd} off`
        );

        return true;
      }

      const enabled =
        ["lock", "lockdown"].includes(cmd)
          ? value === "on"
          : ["unlock", "unlockdown"].includes(cmd)
            ? false
            : value === "on";

      setGroupSetting(
        ctx.chat.id,
        key,
        enabled
      );

      await ctx.reply(
        `✅ ${cmd} ʜᴀs ʙᴇᴇɴ ${value.toUpperCase()}.`
      );

      return true;
    }

    case "slowmode": {
      const amount =
        Number(args(ctx)[0]);

      if (!Number.isFinite(amount)) {
        await ctx.reply(
          "⏱️ Uѕᴇ /slowmode <seconds>"
        );
        return true;
      }

      try {
        await ctx.telegram.setChatPermissions(
          ctx.chat.id,
          {
            can_send_messages: true,
            can_send_audios: true,
            can_send_documents: true,
            can_send_photos: true,
            can_send_videos: true,
            can_send_video_notes: true,
            can_send_voice_notes: true,
            can_send_polls: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
          }
        );

        setGroupSetting(
          ctx.chat.id,
          "slowmode",
          amount
        );

        await ctx.reply(
          `⏱️ Sʟᴏᴡᴍᴏᴅᴇ sᴇᴛ ᴛᴏ ${amount} sᴇᴄᴏɴᴅs.`
        );
      } catch {
        await ctx.reply(
          "❌ Cᴏᴜʟᴅɴ'ᴛ sᴇᴛ sʟᴏᴡᴍᴏᴅᴇ."
        );
      }

      return true;
    }

    case "setrule": {
      const rule = args(ctx).join(" ");

      if (!rule) {
        await ctx.reply(
          "📜 Uѕᴇ /setrule <rule>"
        );
        return true;
      }

      group.rules = group.rules || [];
      group.rules.push(rule);

      save();

      await ctx.reply(
        `✅ Rᴜʟᴇ ᴀᴅᴅᴇᴅ:\n\n${rule}`
      );

      return true;
    }

    case "rules": {
      const rules = group.rules || [];

      if (!rules.length) {
        await ctx.reply(
          "📜 Nᴏ ʀᴜʟᴇs ʜᴀᴠᴇ ʙᴇᴇɴ sᴇᴛ."
        );
        return true;
      }

      await ctx.reply(
        `📜 Gʀᴏᴜᴘ Rᴜʟᴇs\n\n${rules
          .map((r, i) => `${i + 1}. ${r}`)
          .join("\n")}`
      );

      return true;
    }

    case "delrule": {
      const number =
        Number(args(ctx)[0]);

      if (!number) {
        await ctx.reply(
          "📜 Uѕᴇ /delrule <number>"
        );
        return true;
      }

      group.rules = group.rules || [];

      if (!group.rules[number - 1]) {
        await ctx.reply(
          "❌ Rᴜʟᴇ ɴᴏᴛ ғᴏᴜɴᴅ."
        );
        return true;
      }

      const removed =
        group.rules.splice(
          number - 1,
          1
        );

      save();

      await ctx.reply(
        `🗑️ Rᴇᴍᴏᴠᴇᴅ:\n${removed[0]}`
      );

      return true;
    }

    case "groupinfo": {
      await ctx.reply(
        `╭━━〔 👥 Gʀᴏᴜᴘ Iɴғᴏ 〕━━╮

🏷️ Nᴀᴍᴇ: ${ctx.chat.title || "Unknown"}
🆔 Iᴅ: ${ctx.chat.id}
👤 Yᴏᴜ: ${ctx.from.id}

⚙️ Wᴇʟᴄᴏᴍᴇ: ${settings.welcome ? "ON" : "OFF"}
⚙️ Gᴏᴏᴅʙʏᴇ: ${settings.goodbye ? "ON" : "OFF"}
⚠️ Wᴀʀɴ Lɪᴍɪᴛ: ${settings.warnLimit}

╰━━━━━━━━━━━━━━━━━━╯`
      );

      return true;
    }

    case "setwarn":
    case "warnlimit": {
      const limit =
        Number(args(ctx)[0]);

      if (!Number.isInteger(limit) || limit < 1) {
        await ctx.reply(
          `⚠️ Uѕᴇ /${cmd} <number>`
        );
        return true;
      }

      setGroupSetting(
        ctx.chat.id,
        "warnLimit",
        limit
      );

      await ctx.reply(
        `✅ Wᴀʀɴ ʟɪᴍɪᴛ sᴇᴛ ᴛᴏ ${limit}.`
      );

      return true;
    }

    case "resetsettings": {
      updateGroupSettings(
        ctx.chat.id,
        {
          welcome: true,
          goodbye: true,
          warnLimit: 3,
          locked: false,
          lockdown: false,
          slowmode: 0,
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
          antifile: false
        }
      );

      await ctx.reply(
        "♻️ Gʀᴏᴜᴘ sᴇᴛᴛɪɴɢs ʀᴇsᴇᴛ."
      );

      return true;
    }

    case "banlist": {
      await ctx.reply(
        "🚫 Tʜᴇ ᴄᴜʀʀᴇɴᴛ ʙᴀɴ ʟɪsᴛ ɪs ᴍᴀɴᴀɢᴇᴅ ʙʏ Tᴇʟᴇɢʀᴀᴍ."
      );

      return true;
    }

    case "mutelist": {
      await ctx.reply(
        "🔇 Mᴜᴛᴇ ʟɪsᴛ ᴛʀᴀᴄᴋɪɴɢ ᴡɪʟʟ ʙᴇ ᴇɴʜᴀɴᴄᴇᴅ ɪɴ ᴛʜᴇ ɴᴇxᴛ ᴍᴏᴅᴜʟᴇ."
      );

      return true;
    }

    default:
      await ctx.reply(
        `🛡️ /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ, ʙᴜᴛ ɪᴛs ᴀᴅᴠᴀɴᴄᴇᴅ ᴍᴏᴅᴇʀᴀᴛɪᴏɴ ᴍᴏᴅᴜʟᴇ ɪs ɴᴏᴛ ᴀᴄᴛɪᴠᴇ ʏᴇᴛ.`
      );

      return true;
  }
}

/* =========================================================
   💰 ECONOMY
========================================================= */

async function handleEconomy(ctx, cmd) {
  const user = ensureUser(ctx);
  const economy = getEconomy(ctx.from.id);

  switch (cmd) {
    case "balance":
    case "wallet":
      await ctx.reply(
        `💰 Wᴀʟʟᴇᴛ: ${economy.wallet}\n🏦 Bᴀɴᴋ: ${economy.bank}\n💎 Tᴏᴛᴀʟ: ${economy.wallet + economy.bank}`
      );
      return true;

    case "daily": {
      const now = Date.now();
      const last = economy.lastDaily || 0;
      const day = 86400000;

      if (now - last < day) {
        const remaining =
          day - (now - last);

        await ctx.reply(
          `⏳ Cᴏᴍᴇ ʙᴀᴄᴋ ɪɴ ${Math.ceil(remaining / 3600000)} ʜᴏᴜʀ(s).`
        );
        return true;
      }

      const reward = 500;

      updateEconomy(
        ctx.from.id,
        {
          wallet: economy.wallet + reward,
          lastDaily: now,
          streak: (economy.streak || 0) + 1
        }
      );

      await ctx.reply(
        `🎁 Dᴀɪʟʏ ʀᴇᴡᴀʀᴅ: +${reward} 💰\n🔥 Sᴛʀᴇᴀᴋ: ${(economy.streak || 0) + 1}`
      );

      return true;
    }

    case "work": {
      const reward =
        Math.floor(Math.random() * 401) + 100;

      updateEconomy(
        ctx.from.id,
        {
          wallet: economy.wallet + reward
        }
      );

      await ctx.reply(
        `💼 Yᴏᴜ ᴡᴏʀᴋᴇᴅ ᴀɴᴅ ᴇᴀʀɴᴇᴅ ${reward} 💰.`
      );

      return true;
    }

    case "deposit": {
      const amount =
        Number(args(ctx)[0]);

      if (!Number.isFinite(amount) || amount <= 0) {
        await ctx.reply(
          "🏦 Uѕᴇ /deposit <amount>"
        );
        return true;
      }

      if (amount > economy.wallet) {
        await ctx.reply(
          "❌ Nᴏᴛ ᴇɴᴏᴜɢʜ ᴍᴏɴᴇʏ."
        );
        return true;
      }

      updateEconomy(
        ctx.from.id,
        {
          wallet: economy.wallet - amount,
          bank: economy.bank + amount
        }
      );

      await ctx.reply(
        `🏦 Dᴇᴘᴏsɪᴛᴇᴅ ${amount} 💰.`
      );

      return true;
    }

    case "withdraw": {
      const amount =
        Number(args(ctx)[0]);

      if (!Number.isFinite(amount) || amount <= 0) {
        await ctx.reply(
          "🏦 Uѕᴇ /withdraw <amount>"
        );
        return true;
      }

      if (amount > economy.bank) {
        await ctx.reply(
          "❌ Nᴏᴛ ᴇɴᴏᴜɢʜ ᴍᴏɴᴇʏ ɪɴ ʙᴀɴᴋ."
        );
        return true;
      }

      updateEconomy(
        ctx.from.id,
        {
          wallet: economy.wallet + amount,
          bank: economy.bank - amount
        }
      );

      await ctx.reply(
        `🏦 Wɪᴛʜᴅʀᴇᴡ ${amount} 💰.`
      );

      return true;
    }

    case "level":
    case "xp": {
      await ctx.reply(
        `⭐ Lᴇᴠᴇʟ: ${economy.level}\n✨ XP: ${economy.xp}`
      );

      return true;
    }

    default:
      await ctx.reply(
        `💰 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ ᴇᴄᴏɴᴏᴍʏ sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   🎮 GAMES
========================================================= */

async function handleGames(ctx, cmd) {
  const game = getGameData(ctx.from.id);

  switch (cmd) {
    case "dice": {
      const roll =
        Math.floor(Math.random() * 6) + 1;

      await ctx.reply(
        `🎲 Yᴏᴜ ʀᴏʟʟᴇᴅ: ${roll}`
      );

      return true;
    }

    case "coinflip": {
      const result =
        Math.random() < 0.5
          ? "Hᴇᴀᴅs"
          : "Tᴀɪʟs";

      await ctx.reply(
        `🪙 Cᴏɪɴ ғʟɪᴘ: ${result}`
      );

      return true;
    }

    case "rps": {
      const choices = [
        "rock",
        "paper",
        "scissors"
      ];

      const userChoice =
        (args(ctx)[0] || "").toLowerCase();

      if (!choices.includes(userChoice)) {
        await ctx.reply(
          "✊ Uѕᴇ /rps rock\n📄 /rps paper\n✂️ /rps scissors"
        );
        return true;
      }

      const botChoice =
        choices[
          Math.floor(
            Math.random() * choices.length
          )
        ];

      let result = "🤝 Dʀᴀᴡ!";

      if (
        (userChoice === "rock" &&
          botChoice === "scissors") ||
        (userChoice === "paper" &&
          botChoice === "rock") ||
        (userChoice === "scissors" &&
          botChoice === "paper")
      ) {
        result = "🎉 Yᴏᴜ ᴡɪɴ!";
        updateGameData(
          ctx.from.id,
          {
            wins: game.wins + 1,
            games: game.games + 1
          }
        );
      } else if (userChoice !== botChoice) {
        result = "😈 I ᴡɪɴ!";
        updateGameData(
          ctx.from.id,
          {
            losses: game.losses + 1,
            games: game.games + 1
          }
        );
      }

      await ctx.reply(
        `🎮 Yᴏᴜ: ${userChoice}\n🤖 Bᴏᴛ: ${botChoice}\n\n${result}`
      );

      return true;
    }

    case "rank":
    case "gamerank":
    case "gamestats":
      await ctx.reply(
        `🎮 Gᴀᴍᴇ Sᴛᴀᴛs\n\n⭐ Lᴇᴠᴇʟ: ${game.level}\n✨ XP: ${game.xp}\n🏆 Wɪɴs: ${game.wins}\n💀 Lᴏssᴇs: ${game.losses}\n🎮 Gᴀᴍᴇs: ${game.games}`
      );

      return true;

    default:
      await ctx.reply(
        `🎮 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ ɢᴀᴍᴇs sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   🐾 PET
========================================================= */

async function handlePet(ctx, cmd) {
  const pet = getPetData(ctx.from.id);

  switch (cmd) {
    case "adopt": {
      if (pet.adopted) {
        await ctx.reply(
          `🐾 Yᴏᴜ ᴀʟʀᴇᴀᴅʏ ʜᴀᴠᴇ ᴀ ${pet.type || "pet"}.`
        );
        return true;
      }

      const type =
        args(ctx)[0] || "cat";

      const db =
        getDatabase();

      db.pets[String(ctx.from.id)] = {
        ...pet,
        adopted: true,
        type,
        name: `${type} ᴘᴇᴛ`,
        level: 1,
        xp: 0,
        health: 100,
        energy: 100,
        happiness: 100
      };

      save();

      await ctx.reply(
        `🐾 Cᴏɴɢʀᴀᴛs! Yᴏᴜ ᴀᴅᴏᴘᴛᴇᴅ ᴀ ${type}.`
      );

      return true;
    }

    case "pet":
    case "petinfo": {
      if (!pet.adopted) {
        await ctx.reply(
          "🐾 Yᴏᴜ ᴅᴏɴ'ᴛ ʜᴀᴠᴇ ᴀ ᴘᴇᴛ. Uѕᴇ /adopt."
        );
        return true;
      }

      await ctx.reply(
        `╭━━〔 🐾 Pᴇᴛ 〕━━╮\n\n` +
        `🏷️ Nᴀᴍᴇ: ${pet.name}\n` +
        `🐾 Tʏᴘᴇ: ${pet.type}\n` +
        `⭐ Lᴇᴠᴇʟ: ${pet.level}\n` +
        `❤️ Hᴇᴀʟᴛʜ: ${pet.health}\n` +
        `⚡ Eɴᴇʀɢʏ: ${pet.energy}\n` +
        `😊 Hᴀᴘᴘɪɴᴇss: ${pet.happiness}\n\n` +
        `╰━━━━━━━━━━━━╯`
      );

      return true;
    }

    case "feed": {
      if (!pet.adopted) {
        await ctx.reply(
          "🐾 Aᴅᴏᴘᴛ ᴀ ᴘᴇᴛ ғɪʀsᴛ."
        );
        return true;
      }

      const db =
        getDatabase();

      db.pets[String(ctx.from.id)] = {
        ...pet,
        health: Math.min(
          100,
          pet.health + 10
        ),
        happiness: Math.min(
          100,
          pet.happiness + 5
        )
      };

      save();

      await ctx.reply(
        "🍖 Yᴏᴜ ғᴇᴅ ʏᴏᴜʀ ᴘᴇᴛ."
      );

      return true;
    }

    default:
      await ctx.reply(
        `🐾 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ ᴘᴇᴛ sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   ⚡ POKÉMON
========================================================= */

async function handlePokemon(ctx, cmd) {
  const pokemon = getPokemonData(ctx.from.id);

  switch (cmd) {
    case "pokemon":
    case "pokedex": {
      await ctx.reply(
        `⚡ Pᴏᴋéᴍᴏɴ Sʏsᴛᴇᴍ\n\n💰 PᴏᴋᴇCᴏɪɴs: ${pokemon.coins}\n🎒 Cᴏʟʟᴇᴄᴛɪᴏɴ: ${pokemon.collection.length}\n⭐ Lᴇᴠᴇʟ: ${pokemon.level}\n✨ XP: ${pokemon.xp}`
      );

      return true;
    }

    case "mypokemon":
    case "pokecollection": {
      if (!pokemon.collection.length) {
        await ctx.reply(
          "⚡ Yᴏᴜʀ Pᴏᴋéᴍᴏɴ ᴄᴏʟʟᴇᴄᴛɪᴏɴ ɪs ᴇᴍᴘᴛʏ."
        );
        return true;
      }

      await ctx.reply(
        `⚡ Yᴏᴜʀ Pᴏᴋéᴍᴏɴ:\n\n${pokemon.collection
          .map(
            (p, i) =>
              `${i + 1}. ${p}`
          )
          .join("\n")}`
      );

      return true;
    }

    case "catch": {
      const names = [
        "Pikachu",
        "Charmander",
        "Bulbasaur",
        "Squirtle",
        "Eevee",
        "Snorlax"
      ];

      const caught =
        names[
          Math.floor(
            Math.random() * names.length
          )
        ];

      const db =
        getDatabase();

      if (!db.pokemon[String(ctx.from.id)]) {
        db.pokemon[String(ctx.from.id)] =
          pokemon;
      }

      db.pokemon[
        String(ctx.from.id)
      ].collection.push(caught);

      save();

      await ctx.reply(
        `🎯 Yᴏᴜ ᴄᴀᴜɢʜᴛ **${caught}**!`,
        {
          parse_mode: "Markdown"
        }
      );

      return true;
    }

    default:
      await ctx.reply(
        `⚡ /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ Pᴏᴋéᴍᴏɴ sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   👑 EMPIRE
========================================================= */

async function handleEmpire(ctx, cmd) {
  const empire =
    getEmpireData(ctx.from.id);

  switch (cmd) {
    case "empire":
    case "empireinfo":
      await ctx.reply(
        `👑 Eᴍᴘɪʀᴇ Sʏsᴛᴇᴍ\n\n🏰 Eᴍᴘɪʀᴇ: ${empire.empire || "Nᴏɴᴇ"}\n⭐ Lᴇᴠᴇʟ: ${empire.level}\n✨ XP: ${empire.xp}\n⚔️ Aʀᴍʏ: ${empire.army}\n🌍 Tᴇʀʀɪᴛᴏʀʏ: ${empire.territory}`
      );

      return true;

    case "createempire": {
      const name =
        args(ctx).join(" ");

      if (!name) {
        await ctx.reply(
          "👑 Uѕᴇ /createempire <name>"
        );
        return true;
      }

      if (empire.empire) {
        await ctx.reply(
          "❌ Yᴏᴜ ᴀʟʀᴇᴀᴅʏ ʜᴀᴠᴇ ᴀɴ ᴇᴍᴘɪʀᴇ."
        );
        return true;
      }

      const db =
        getDatabase();

      db.empire[
        String(ctx.from.id)
      ] = {
        ...empire,
        empire: name,
        role: "leader"
      };

      save();

      await ctx.reply(
        `👑 Eᴍᴘɪʀᴇ **${name}** ᴄʀᴇᴀᴛᴇᴅ!`,
        {
          parse_mode: "Markdown"
        }
      );

      return true;
    }

    default:
      await ctx.reply(
        `👑 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ Eᴍᴘɪʀᴇ sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   👑 OWNER COMMANDS
========================================================= */

async function handleOwner(ctx, cmd) {
  if (!isOwner(ctx)) {
    await ctx.reply(
      "❌ Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ᴛʜᴇ ᴏᴡɴᴇʀ ᴏɴʟʏ."
    );

    return true;
  }

  const argumentsList =
    args(ctx);

  switch (cmd) {
    case "stats": {
      await ctx.reply(
        `📊 Bᴏᴛ Sᴛᴀᴛɪs\n\n👤 Uѕᴇʀs: ${userCount()}\n👥 Gʀᴏᴜᴘs: ${groupCount()}\n🛡️ Sᴜᴅᴏ: ${getDatabase().sudo.length}\n🚫 Bʟᴏᴄᴋᴇᴅ: ${getBlockedUsers().length}`
      );

      return true;
    }

    case "users":
      await ctx.reply(
        `👤 Tᴏᴛᴀʟ Uѕᴇʀs: ${userCount()}`
      );
      return true;

    case "groups":
      await ctx.reply(
        `👥 Tᴏᴛᴀʟ Gʀᴏᴜᴘs: ${groupCount()}`
      );
      return true;

    case "database":
      await ctx.reply(
        `💾 Dᴀᴛᴀʙᴀsᴇ\n\nUѕᴇʀs: ${userCount()}\nGʀᴏᴜᴘs: ${groupCount()}`
      );
      return true;

    case "backup": {
      const file =
        createBackup();

      await ctx.reply(
        `💾 Bᴀᴄᴋᴜᴘ ᴄʀᴇᴀᴛᴇᴅ.\n\n${file}`
      );

      return true;
    }

    case "maintenance": {
      const value =
        (argumentsList[0] || "").toLowerCase();

      if (!["on", "off"].includes(value)) {
        await ctx.reply(
          `⚙️ Mᴀɪɴᴛᴇɴᴀɴᴄᴇ: ${
            getSetting("maintenance")
              ? "ON"
              : "OFF"
          }\n\nUѕᴇ /maintenance on|off`
        );

        return true;
      }

      setSetting(
        "maintenance",
        value === "on"
      );

      await ctx.reply(
        `⚙️ Mᴀɪɴᴛᴇɴᴀɴᴄᴇ ${value.toUpperCase()}.`
      );

      return true;
    }

    case "autorestart": {
      const value =
        (argumentsList[0] || "").toLowerCase();

      if (!["on", "off"].includes(value)) {
        await ctx.reply(
          "Uѕᴇ /autorestart on|off"
        );
        return true;
      }

      setSetting(
        "autoRestart",
        value === "on"
      );

      await ctx.reply(
        `♻️ Aᴜᴛᴏʀᴇsᴛᴀʀᴛ ${value.toUpperCase()}.`
      );

      return true;
    }

    case "debug": {
      const value =
        (argumentsList[0] || "").toLowerCase();

      if (!["on", "off"].includes(value)) {
        await ctx.reply(
          `🐞 Dᴇʙᴜɢ: ${
            getSetting("debug")
              ? "ON"
              : "OFF"
          }`
        );
        return true;
      }

      setSetting(
        "debug",
        value === "on"
      );

      await ctx.reply(
        `🐞 Dᴇʙᴜɢ ${value.toUpperCase()}.`
      );

      return true;
    }

    case "setprefix": {
      const prefix =
        argumentsList[0];

      if (!prefix) {
        await ctx.reply(
          "⚙️ Uѕᴇ /setprefix <prefix>"
        );
        return true;
      }

      setSetting(
        "prefix",
        prefix
      );

      await ctx.reply(
        `✅ Pʀᴇғɪx sᴇᴛ ᴛᴏ: ${prefix}`
      );

      return true;
    }

    case "setname": {
      const name =
        argumentsList.join(" ");

      if (!name) {
        await ctx.reply(
          "⚙️ Uѕᴇ /setname <name>"
        );
        return true;
      }

      setSetting(
        "botName",
        name
      );

      await ctx.reply(
        `✅ Bᴏᴛ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:\n${name}`
      );

      return true;
    }

    case "setbio": {
      const bio =
        argumentsList.join(" ");

      setSetting(
        "botBio",
        bio
      );

      await ctx.reply(
        "✅ Bᴏᴛ ʙɪᴏ ᴜᴘᴅᴀᴛᴇᴅ."
      );

      return true;
    }

    case "setabout": {
      const about =
        argumentsList.join(" ");

      setSetting(
        "botAbout",
        about
      );

      await ctx.reply(
        "✅ Bᴏᴛ ᴀʙᴏᴜᴛ ᴜᴘᴅᴀᴛᴇᴅ."
      );

      return true;
    }

    case "addsudo": {
      const target =
        getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "🛡️ Uѕᴇ /addsudo <user_id> ᴏʀ ʀᴇᴘʟʏ."
        );
        return true;
      }

      addSudo(target);

      await ctx.reply(
        `🛡️ ${target} ᴀᴅᴅᴇᴅ ᴛᴏ Sᴜᴅᴏ.`
      );

      return true;
    }

    case "delsudo": {
      const target =
        getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "🛡️ Uѕᴇ /delsudo <user_id> ᴏʀ ʀᴇᴘʟʏ."
        );
        return true;
      }

      removeSudo(target);

      await ctx.reply(
        `🗑️ ${target} ʀᴇᴍᴏᴠᴇᴅ ғʀᴏᴍ Sᴜᴅᴏ.`
      );

      return true;
    }

    case "sudolist":
      await ctx.reply(
        `🛡️ Sᴜᴅᴏ Uѕᴇʀs:\n\n${
          getDatabase().sudo.length
            ? getDatabase().sudo.join("\n")
            : "Nᴏ Sᴜᴅᴏ Uѕᴇʀs"
        }`
      );
      return true;

    case "block": {
      const target =
        getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "🚫 Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴏʀ ᴜsᴇ /block <id>."
        );
        return true;
      }

      blockUser(target);

      await ctx.reply(
        `🚫 Uѕᴇʀ ${target} ʙʟᴏᴄᴋᴇᴅ.`
      );

      return true;
    }

    case "unblock": {
      const target =
        getTargetId(ctx);

      if (!target) {
        await ctx.reply(
          "♻️ Uѕᴇ /unblock <id>."
        );
        return true;
      }

      unblockUser(target);

      await ctx.reply(
        `♻️ Uѕᴇʀ ${target} ᴜɴʙʟᴏᴄᴋᴇᴅ.`
      );

      return true;
    }

    case "blocklist":
      await ctx.reply(
        `🚫 Bʟᴏᴄᴋᴇᴅ Uѕᴇʀs:\n\n${
          getBlockedUsers().length
            ? getBlockedUsers().join("\n")
            : "Nᴏ ʙʟᴏᴄᴋᴇᴅ ᴜsᴇʀs"
        }`
      );
      return true;

    /*
     * NEVER execute arbitrary JavaScript from Telegram.
     */
    case "eval":
    case "exec":
    case "shell":
      await ctx.reply(
        "🚫 Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴅɪsᴀʙʟᴇᴅ ғᴏʀ sᴇʀᴠᴇʀ sᴀғᴇᴛʏ."
      );
      return true;

    default:
      await ctx.reply(
        `👑 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ᴀs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.`
      );

      return true;
  }
}

/* =========================================================
   🛠️ GENERAL / TOOLS
========================================================= */

async function handleGeneral(ctx, cmd) {
  switch (cmd) {
    case "id":
    case "me": {
      await ctx.reply(
        `👤 Uѕᴇʀ Iɴғᴏ\n\n🆔 Iᴅ: ${ctx.from.id}\n👤 Nᴀᴍᴇ: ${displayName(ctx.from)}\n🔗 Uѕᴇʀɴᴀᴍᴇ: ${
          ctx.from.username
            ? "@" + ctx.from.username
            : "Nᴏɴᴇ"
        }`
      );

      return true;
    }

    case "ping": {
      const start =
        Date.now();

      const message =
        await ctx.reply("🏓 Pɪɴɢɪɴɢ...");

      const latency =
        Date.now() - start;

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        `🏓 Pᴏɴɢ!\n\n⚡ Lᴀᴛᴇɴᴄʏ: ${latency}ms`
      );

      return true;
    }

    case "status": {
      await ctx.reply(
        `🟢 Bᴏᴛ Sᴛᴀᴛᴜs: Oɴʟɪɴᴇ\n\n🤖 ${getSetting("botName")}\n👤 Uѕᴇʀs: ${userCount()}\n👥 Gʀᴏᴜᴘs: ${groupCount()}`
      );

      return true;
    }

    case "settings":
      await ctx.reply(
        `⚙️ Bᴏᴛ Sᴇᴛᴛɪɴɢs\n\n🤖 Nᴀᴍᴇ: ${getSetting("botName")}\n⌨️ Pʀᴇғɪx: ${getSetting("prefix")}\n🔧 Mᴀɪɴᴛᴇɴᴀɴᴄᴇ: ${getSetting("maintenance") ? "ON" : "OFF"}`
      );
      return true;

    case "time":
      await ctx.reply(
        `🕐 Tɪᴍᴇ: ${new Date().toLocaleString()}`
      );
      return true;

    case "about":
      await ctx.reply(
        `🤖 ${getSetting("botName")}\n\n${getSetting("botAbout") || "Tᴇʟᴇɢʀᴀᴍ Mᴜʟᴛɪ-Fᴇᴀᴛᴜʀᴇ Bᴏᴛ"}`
      );
      return true;

    case "owner":
    case "contactowner":
      await ctx.reply(
        `👑 Oᴡɴᴇʀ: ${process.env.OWNER_ID || "Nᴏᴛ sᴇᴛ"}`
      );
      return true;

    default:
      await ctx.reply(
        `⚙️ /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ ɢᴇɴᴇʀᴀʟ sʏsᴛᴇᴍ.`
      );
      return true;
  }
}

/* =========================================================
   🐾 SOCIAL
========================================================= */

async function handleSocial(ctx, cmd) {
  switch (cmd) {
    case "profile":
    case "bio":
      await ctx.reply(
        `👤 Pʀᴏғɪʟᴇ\n\n🏷️ Nᴀᴍᴇ: ${displayName(ctx.from)}\n🆔 Iᴅ: ${ctx.from.id}\n🔗 Uѕᴇʀɴᴀᴍᴇ: ${
          ctx.from.username
            ? "@" + ctx.from.username
            : "Nᴏɴᴇ"
        }`
      );
      return true;

    case "ship":
    case "shiprate": {
      const percentage =
        Math.floor(Math.random() * 101);

      await ctx.reply(
        `💕 Lᴏᴠᴇ Mᴀᴛᴄʜ: ${percentage}%`
      );

      return true;
    }

    case "hug":
    case "kiss":
    case "pat":
    case "wave":
    case "highfive":
    case "cheer":
    case "compliment":
    case "flirt":
    case "roast": {
      const target =
        ctx.message?.reply_to_message?.from;

      await ctx.reply(
        `✨ ${displayName(ctx.from)} ${cmd} ${
          target
            ? displayName(target)
            : "everyone"
        }!`
      );

      return true;
    }

    default:
      await ctx.reply(
        `💕 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ sᴏᴄɪᴀʟ sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   🧰 TOOLS
========================================================= */

async function handleTools(ctx, cmd) {
  const input =
    args(ctx).join(" ");

  switch (cmd) {
    case "calc":
    case "evalmath": {
      if (!input) {
        await ctx.reply(
          "🧮 Uѕᴇ /calc 2 + 2"
        );
        return true;
      }

      /*
       * Safe basic arithmetic parser.
       * No eval().
       */
      if (!/^[0-9+\-*/().%\s]+$/.test(input)) {
        await ctx.reply(
          "❌ Oɴʟʏ ʙᴀsɪᴄ ᴀʀɪᴛʜᴍᴇᴛɪᴄ ɪs ᴀʟʟᴏᴡᴇᴅ."
        );
        return true;
      }

      try {
        const sanitized =
          input.replace(/%/g, "/100");

        const result =
          Function(
            `"use strict"; return (${sanitized})`
          )();

        if (
          typeof result !== "number" ||
          !Number.isFinite(result)
        ) {
          throw new Error("Invalid");
        }

        await ctx.reply(
          `🧮 Rᴇsᴜʟᴛ: ${result}`
        );
      } catch {
        await ctx.reply(
          "❌ Iɴᴠᴀʟɪᴅ ᴄᴀʟᴄᴜʟᴀᴛɪᴏɴ."
        );
      }

      return true;
    }

    case "random":
    case "randomnumber": {
      const min =
        Number(args(ctx)[0] || 1);

      const max =
        Number(args(ctx)[1] || 100);

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        min > max
      ) {
        await ctx.reply(
          "🎲 Uѕᴇ /randomnumber <min> <max>"
        );
        return true;
      }

      const result =
        Math.floor(
          Math.random() *
            (max - min + 1)
        ) + min;

      await ctx.reply(
        `🎲 Rᴀɴᴅᴏᴍ: ${result}`
      );

      return true;
    }

    case "uuid": {
      const crypto =
        await import("crypto");

      await ctx.reply(
        `🆔 UUID:\n${crypto.randomUUID()}`
      );

      return true;
    }

    case "timestamp":
      await ctx.reply(
        `⏱️ Tɪᴍᴇsᴛᴀᴍᴘ: ${Date.now()}`
      );
      return true;

    case "date":
      await ctx.reply(
        `📅 ${new Date().toLocaleDateString()}`
      );
      return true;

    default:
      await ctx.reply(
        `🛠️ /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ ᴛᴏᴏʟs sʏsᴛᴇᴍ.`
      );

      return true;
  }
}

/* =========================================================
   🤖 AI
========================================================= */

async function handleAI(ctx, cmd) {
  const input =
    args(ctx).join(" ");

  switch (cmd) {
    case "ai":
    case "ask":
    case "chatbot":
      if (!input) {
        await ctx.reply(
          "🤖 Tᴇʟʟ ᴍᴇ ᴡʜᴀᴛ ʏᴏᴜ ᴡᴀɴᴛ ᴍᴇ ᴛᴏ ᴅᴏ.\n\nExᴀᴍᴘʟᴇ:\n/ai explain JavaScript"
        );
        return true;
      }

      await ctx.reply(
        `🤖 Aɪ ʀᴇǫᴜᴇsᴛ ʀᴇᴄᴇɪᴠᴇᴅ:\n\n${input}\n\n⚙️ Aɪ API ɪɴᴛᴇɢʀᴀᴛɪᴏɴ ɪs ʀᴇᴀᴅʏ ᴛᴏ ʙᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ.`
      );

      return true;

    case "jokeai":
      await ctx.reply(
        "😂 Wʜʏ ᴅɪᴅ ᴛʜᴇ ᴘʀᴏɢʀᴀᴍᴍᴇʀ ᴅᴏɴ'ᴛ ᴜsᴇ ᴛʜᴇ ᴏᴜᴛᴅᴏᴏʀs?\n\nBᴇᴄᴀᴜsᴇ ᴛʜᴇʏ ᴅɪᴅɴ'ᴛ ʜᴀᴠᴇ ᴇɴᴏᴜɢʜ ʙᴀɴᴅᴡɪᴅᴛʜ! 😭"
      );
      return true;

    default:
      await ctx.reply(
        `🤖 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ Aɪ sʏsᴛᴇᴍ.`
      );
      return true;
  }
}

/* =========================================================
   🎵 MUSIC
========================================================= */

async function handleMusic(ctx, cmd) {
  const input =
    args(ctx).join(" ");

  if (
    ["play", "song", "music", "download"].includes(cmd) &&
    !input
  ) {
    await ctx.reply(
      `🎵 Uѕᴇ /${cmd} <song name or URL>`
    );

    return true;
  }

  await ctx.reply(
    `🎵 /${cmd}\n\n🔎 Rᴇǫᴜᴇsᴛ: ${input || "Nᴏɴᴇ"}\n\n⚙️ Mᴜsɪᴄ API ɪɴᴛᴇɢʀᴀᴛɪᴏɴ ɪs ʀᴇᴀᴅʏ ᴛᴏ ʙᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ.`
  );

  return true;
}

/* =========================================================
   🛒 SHOP
========================================================= */

async function handleShop(ctx, cmd) {
  switch (cmd) {
    case "shop":
    case "items":
    case "market":
      await ctx.reply(
        `🛒 Sʜᴏᴘ\n\n1️⃣ 🍎 Aᴘᴘʟᴇ — 50\n2️⃣ 🍖 Pᴇᴛ Fᴏᴏᴅ — 100\n3️⃣ 💎 Gᴇᴍ — 500\n\nUѕᴇ /buy <item>`
      );
      return true;

    default:
      await ctx.reply(
        `🛒 /${cmd} ɪs ʀᴇɢɪsᴛᴇʀᴇᴅ ɪɴ ᴛʜᴇ sʜᴏᴘ sʏsᴛᴇᴍ.`
      );
      return true;
  }
}

/* =========================================================
   ⚔️ WAR
========================================================= */

async function handleWar(ctx, cmd) {
  await ctx.reply(
    `⚔️ /${cmd}\n\n🔥 Wᴀʀ sʏsᴛᴇᴍ ʀᴇɢɪsᴛᴇʀᴇᴅ.\n⚙️ Aᴅᴠᴀɴᴄᴇᴅ ᴡᴀʀ ᴍᴏᴅᴜʟᴇ ɪs ʀᴇᴀᴅʏ ᴛᴏ ʙᴇ ᴇxᴘᴀɴᴅᴇᴅ.`
  );

  return true;
}

/* =========================================================
   📖 HELP
========================================================= */

export function getCommands() {
  return commandCategories;
}

export function getCommandCategory(command) {
  return commandIndex.get(
    command.toLowerCase()
  );
}

export function getAllCommands() {
  return [
    ...new Set(
      Object.values(commandCategories)
        .flat()
    )
  ];
}

export function getCategoryCommands(category) {
  return commandCategories[category] || [];
}

/* =========================================================
   📋 COMMAND MENU TEXT
========================================================= */

export function commandText(category) {
  const list =
    commandCategories[category] || [];

  return list
    .map(
      command => `/${command}`
    )
    .join("\n");
}

export function getMenuText() {
  const lines = [
    "╭━━━〔 ⚡ ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ 〕━━━╮",
    "",
    "🌐 Mᴀɪɴ Cᴏᴍᴍᴀɴᴅs",
    ""
  ];

  for (
    const [category, list]
    of Object.entries(commandCategories)
  ) {
    lines.push(
      `📂 ${category.toUpperCase()} — ${list.length} commands`
    );
  }

  lines.push(
    "",
    "💡 Uѕᴇ /help <category>",
    "",
    "╰━━━━━━━━━━━━━━━━━━━━╯"
  );

  return lines.join("\n");
}

/* =========================================================
   🚀 MAIN COMMAND HANDLER
========================================================= */

export async function handleCommand(ctx) {
  try {
    const cmd =
      commandName(ctx);

    if (!cmd) {
      return false;
    }

    if (!commandIndex.has(cmd)) {
      return false;
    }

    /* Register user */
    ensureUser();

    /* Register group */
    if (isGroup(ctx)) {
      ensureGroup(ctx);
    }

    /* Blocked user protection */
    if (
      ctx.from &&
      isBlocked(ctx.from.id) &&
      !isOwner(ctx)
    ) {
      await ctx.reply(
        "🚫 Yᴏᴜ ᴀʀᴇ ʙʟᴏᴄᴋᴇᴅ ғʀᴏᴍ ᴜsɪɴɢ ᴛʜɪs ʙᴏᴛ."
      );

      return true;
    }

    /* Maintenance */
    if (
      getSetting("maintenance") &&
      !isOwner(ctx) &&
      !isSudo(ctx.from.id)
    ) {
      await ctx.reply(
        "🛠️ Bᴏᴛ ɪs ᴄᴜʀʀᴇɴᴛʟʏ ɪɴ ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ."
      );

      return true;
    }

    const category =
      commandIndex.get(cmd);

    switch (category) {
      case "moderator":
        return await handleModerator(
          ctx,
          cmd
        );

      case "owner":
        return await handleOwner(
          ctx,
          cmd
        );

      case "economy":
        return await handleEconomy(
          ctx,
          cmd
        );

      case "games":
        return await handleGames(
          ctx,
          cmd
        );

      case "pet":
        return await handlePet(
          ctx,
          cmd
        );

      case "pokemon":
        return await handlePokemon(
          ctx,
          cmd
        );

      case "empire":
        return await handleEmpire(
          ctx,
          cmd
        );

      case "social":
        return await handleSocial(
          ctx,
          cmd
        );

      case "tools":
        return await handleTools(
          ctx,
          cmd
        );

      case "ai":
        return await handleAI(
          ctx,
          cmd
        );

      case "music":
        return await handleMusic(
          ctx,
          cmd
        );

      case "shop":
        return await handleShop(
          ctx,
          cmd
        );

      case "war":
        return await handleWar(
          ctx,
          cmd
        );

      case "general":
        return await handleGeneral(
          ctx,
          cmd
        );

      default:
        await ctx.reply(
          `❌ Cᴏᴍᴍᴀɴᴅ /${cmd} ʜᴀs ɴᴏ ʜᴀɴᴅʟᴇʀ.`
        );

        return true;
    }
  } catch (error) {
    console.error(
      `❌ Command error:`,
      error
    );

    try {
      await ctx.reply(
        "❌ Aɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴇxᴇᴄᴜᴛɪɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ."
      );
    } catch {}

    return true;
  }
}

/* =========================================================
   🔌 REGISTER ALL COMMANDS
========================================================= */

export function registerCommands(bot) {
  /*
   * One central text handler.
   *
   * It catches every registered /command.
   */
  bot.on("text", async ctx => {
    const message =
      ctx.message?.text || "";

    if (!message.startsWith("/")) {
      return;
    }

    await handleCommand(ctx);
  });

  /*
   * New members
   */
  bot.on("new_chat_members", async ctx => {
    const settings =
      getGroupSettings(ctx.chat.id);

    if (!settings.welcome) {
      return;
    }

    for (
      const member
      of ctx.message.new_chat_members
    ) {
      try {
        await sendWelcome(
          ctx,
          member
        );
      } catch (error) {
        console.error(
          "Welcome error:",
          error.message
        );
      }
    }
  });

  /*
   * Members leaving
   */
  bot.on("left_chat_member", async ctx => {
    const settings =
      getGroupSettings(ctx.chat.id);

    if (!settings.goodbye) {
      return;
    }

    const member =
      ctx.message.left_chat_member;

    await ctx.reply(
      `👋 Gᴏᴏᴅʙʏᴇ ${displayName(member)}.\n\n💙 Wᴇ'ʟʟ ᴍɪss ʏᴏᴜ!`
    );
  });

  console.log(
    `⚡ Command system loaded: ${getAllCommands().length} commands`
  );
}

/* =========================================================
   📤 DEFAULT EXPORT
========================================================= */

export default commandCategories;
