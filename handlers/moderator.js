import {
  getDatabase,
  getGroup,
  addGroup,
  setSetting
} from '../database.js';

function isGroup(ctx) {
  return ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
}

async function isAdmin(ctx) {
  if (!isGroup(ctx)) return false;

  try {
    const member = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );

    return ['administrator', 'creator'].includes(member.status);
  } catch {
    return false;
  }
}

async function requireAdmin(ctx) {
  if (!isGroup(ctx)) {
    await ctx.reply('❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.');
    return false;
  }

  if (!(await isAdmin(ctx))) {
    await ctx.reply('🚫 ᴀᴅᴍɪɴs ᴏɴʟʏ.');
    return false;
  }

  return true;
}

function targetUser(ctx) {
  const reply = ctx.message?.reply_to_message;

  if (reply?.from?.id) {
    return {
      id: reply.from.id,
      name:
        reply.from.first_name ||
        reply.from.username ||
        String(reply.from.id)
    };
  }

  const arg = ctx.message?.text?.split(/\s+/)[1];

  if (arg && /^\d+$/.test(arg)) {
    return {
      id: Number(arg),
      name: arg
    };
  }

  return null;
}

async function ensureGroup(ctx) {
  if (!isGroup(ctx)) return null;

  const id = String(ctx.chat.id);
  let group = getGroup(id);

  if (!group) {
    group = addGroup(id, {
      title: ctx.chat.title || 'Unknown Group',
      type: ctx.chat.type
    });
  }

  return group;
}

function groupSettings(ctx) {
  const db = getDatabase();
  const id = String(ctx.chat.id);

  if (!db.groups[id]) {
    db.groups[id] = {
      id: ctx.chat.id,
      title: ctx.chat.title || 'Unknown Group',
      settings: {}
    };
  }

  if (!db.groups[id].settings) {
    db.groups[id].settings = {};
  }

  return db.groups[id].settings;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REGISTER MODERATOR COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function registerModeratorCommands(bot) {

  bot.command('warn', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /warn.'
      );
    }

    const settings = groupSettings(ctx);

    if (!settings.warnings) settings.warnings = {};

    const id = String(target.id);

    settings.warnings[id] =
      (settings.warnings[id] || 0) + 1;

    const count = settings.warnings[id];

    setSetting(
      `group_${ctx.chat.id}`,
      groupSettings(ctx)
    );

    await ctx.reply(`
╭━━━〔 ⚠️ ᴡᴀʀɴɪɴɢ 〕━━━╮
┃
┃ 👤 Uѕᴇʀ: ${target.name}
┃ ⚠️ Wᴀʀɴs: ${count}
┃
╰━━━━━━━━━━━━━━━━━━╯
`);
  });

  bot.command('warnings', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /warnings.'
      );
    }

    const settings = groupSettings(ctx);
    const count =
      settings.warnings?.[String(target.id)] || 0;

    await ctx.reply(
      `⚠️ ${target.name} ʜᴀs ${count} ᴡᴀʀɴɪɴɢ(s).`
    );
  });

  bot.command('clearwarns', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /clearwarns.'
      );
    }

    const settings = groupSettings(ctx);

    if (settings.warnings) {
      delete settings.warnings[String(target.id)];
    }

    await ctx.reply(
      `✅ Wᴀʀɴɪɴɢs ᴄʟᴇᴀʀᴇᴅ ғᴏʀ ${target.name}.`
    );
  });

  bot.command('kick', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /kick.'
      );
    }

    try {
      await ctx.telegram.banChatMember(
        ctx.chat.id,
        target.id
      );

      await ctx.telegram.unbanChatMember(
        ctx.chat.id,
        target.id
      );

      await ctx.reply(
        `👢 ${target.name} ʜᴀs ʙᴇᴇɴ ᴋɪᴄᴋᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ I ᴄᴏᴜʟᴅɴ\'ᴛ ᴋɪᴄᴋ ᴛʜɪs ᴜsᴇʀ. Mᴀᴋᴇ sᴜʀᴇ ɪ ʜᴀᴠᴇ ᴛʜᴇ ʀɪɢʜᴛ ᴀᴅᴍɪɴ ᴘᴇʀᴍɪssɪᴏɴs.'
      );
    }
  });

  bot.command('ban', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /ban.'
      );
    }

    try {
      await ctx.telegram.banChatMember(
        ctx.chat.id,
        target.id
      );

      await ctx.reply(
        `🔨 ${target.name} ʜᴀs ʙᴇᴇɴ ʙᴀɴɴᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ I ᴄᴏᴜʟᴅɴ\'ᴛ ʙᴀɴ ᴛʜɪs ᴜsᴇʀ.'
      );
    }
  });

  bot.command('unban', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /unban.'
      );
    }

    try {
      await ctx.telegram.unbanChatMember(
        ctx.chat.id,
        target.id
      );

      await ctx.reply(
        `✅ ${target.name} ʜᴀs ʙᴇᴇɴ ᴜɴʙᴀɴɴᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴜɴʙᴀɴ ᴛʜɪs ᴜsᴇʀ.'
      );
    }
  });

  bot.command('mute', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /mute.'
      );
    }

    try {
      await ctx.telegram.restrictChatMember(
        ctx.chat.id,
        target.id,
        {
          permissions: {
            can_send_messages: false
          }
        }
      );

      await ctx.reply(
        `🔇 ${target.name} ʜᴀs ʙᴇᴇɴ ᴍᴜᴛᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴍᴜᴛᴇ ᴛʜɪs ᴜsᴇʀ.'
      );
    }
  });

  bot.command('unmute', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /unmute.'
      );
    }

    try {
      await ctx.telegram.restrictChatMember(
        ctx.chat.id,
        target.id,
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
        `🔊 ${target.name} ʜᴀs ʙᴇᴇɴ ᴜɴᴍᴜᴛᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴜɴᴍᴜᴛᴇ ᴛʜɪs ᴜsᴇʀ.'
      );
    }
  });

  bot.command('promote', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /promote.'
      );
    }

    try {
      await ctx.telegram.promoteChatMember(
        ctx.chat.id,
        target.id,
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
        `👑 ${target.name} ʜᴀs ʙᴇᴇɴ ᴘʀᴏᴍᴏᴛᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴘʀᴏᴍᴏᴛᴇ ᴛʜɪs ᴜsᴇʀ.'
      );
    }
  });

  bot.command('demote', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const target = targetUser(ctx);

    if (!target) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴡɪᴛʜ /demote.'
      );
    }

    try {
      await ctx.telegram.promoteChatMember(
        ctx.chat.id,
        target.id,
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
        `📤 ${target.name} ʜᴀs ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ.`
      );
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜɪs ᴜsᴇʀ.'
      );
    }
  });

  bot.command('del', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const reply = ctx.message?.reply_to_message;

    if (!reply) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴅᴇʟᴇᴛᴇ.'
      );
    }

    try {
      await ctx.telegram.deleteMessage(
        ctx.chat.id,
        reply.message_id
      );

      await ctx.deleteMessage().catch(() => {});
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴅᴇʟᴇᴛᴇ ᴛʜᴇ ᴍᴇssᴀɢᴇ.'
      );
    }
  });

  bot.command('pin', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const reply = ctx.message?.reply_to_message;

    if (!reply) {
      return ctx.reply(
        '⚠️ Rᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴘɪɴ.'
      );
    }

    try {
      await ctx.telegram.pinChatMessage(
        ctx.chat.id,
        reply.message_id,
        {
          disable_notification: false
        }
      );

      await ctx.reply('📌 Mᴇssᴀɢᴇ ᴘɪɴɴᴇᴅ.');
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴘɪɴ ᴛʜᴇ ᴍᴇssᴀɢᴇ.'
      );
    }
  });

  bot.command('unpin', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    try {
      await ctx.telegram.unpinChatMessage(ctx.chat.id);

      await ctx.reply('📌 Mᴇssᴀɢᴇ ᴜɴᴘɪɴɴᴇᴅ.');
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ᴜɴᴘɪɴ ᴛʜᴇ ᴍᴇssᴀɢᴇ.'
      );
    }
  });

  bot.command('groupinfo', async (ctx) => {
    if (!isGroup(ctx)) {
      return ctx.reply(
        '❌ Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.'
      );
    }

    await ensureGroup(ctx);

    let memberCount = 'Unknown';

    try {
      memberCount = await ctx.telegram.getChatMembersCount(
        ctx.chat.id
      );
    } catch {}

    await ctx.reply(`
╭━━━〔 🛡️ ɢʀᴏᴜᴘ ɪɴғᴏ 〕━━━╮
┃
┃ 🏠 Nᴀᴍᴇ: ${ctx.chat.title || 'Unknown'}
┃ 🆔 Iᴅ: ${ctx.chat.id}
┃ 👥 Mᴇᴍʙᴇʀs: ${memberCount}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`);
  });

  bot.command('admins', async (ctx) => {
    if (!isGroup(ctx)) {
      return ctx.reply(
        '❌ Tʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.'
      );
    }

    try {
      const admins =
        await ctx.telegram.getChatAdministrators(
          ctx.chat.id
        );

      const list = admins
        .map((admin, index) => {
          const name =
            admin.user.first_name ||
            admin.user.username ||
            admin.user.id;

          return `┃ ${index + 1}. 👑 ${name}`;
        })
        .join('\n');

      await ctx.reply(`
╭━━━〔 👑 ᴀᴅᴍɪɴs 〕━━━╮
┃
${list}
┃
╰━━━━━━━━━━━━━━━━━━╯
`);
    } catch {
      await ctx.reply(
        '❌ Cᴏᴜʟᴅɴ\'ᴛ ғᴇᴛᴄʜ ᴛʜᴇ ᴀᴅᴍɪɴ ʟɪsᴛ.'
      );
    }
  });

  bot.command('welcome', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const arg =
      ctx.message.text.split(/\s+/)[1]?.toLowerCase();

    if (!['on', 'off'].includes(arg)) {
      return ctx.reply(
        'ᴜsᴀɢᴇ: /welcome on\nᴏʀ /welcome off'
      );
    }

    const settings = groupSettings(ctx);
    settings.welcome = arg === 'on';

    await ctx.reply(
      arg === 'on'
        ? '✅ Wᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴇɴᴀʙʟᴇᴅ.'
        : '❌ Wᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴅɪsᴀʙʟᴇᴅ.'
    );
  });

  bot.command('goodbye', async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const arg =
      ctx.message.text.split(/\s+/)[1]?.toLowerCase();

    if (!['on', 'off'].includes(arg)) {
      return ctx.reply(
        'ᴜsᴀɢᴇ: /goodbye on\nᴏʀ /goodbye off'
      );
    }

    const settings = groupSettings(ctx);
    settings.goodbye = arg === 'on';

    await ctx.reply(
      arg === 'on'
        ? '✅ Gᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴇɴᴀʙʟᴇᴅ.'
        : '❌ Gᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴅɪsᴀʙʟᴇᴅ.'
    );
  });

  console.log('🛡️ Moderator commands loaded.');
}
