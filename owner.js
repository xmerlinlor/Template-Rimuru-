import { Markup } from 'telegraf';

const ownerOnly = (ctx) => {
  const ownerId = String(process.env.OWNER_ID || '');
  return ownerId && String(ctx.from?.id) === ownerId;
};

const ownerDenied = async (ctx) => {
  await ctx.reply('🚫 ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ.\n\n👑 ᴏᴡɴᴇʀ ᴏɴʟʏ.');
};

export function registerOwnerCommands(bot) {

  // /ownerhelp
  bot.command('ownerhelp', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(`
╭━━━〔 👑 ᴏᴡɴᴇʀ ᴄᴇɴᴛᴇʀ 〕━━━╮
┃
┃ 📢 ʙʀᴏᴀᴅᴄᴀsᴛ
┃ /broadcast
┃ /gbroadcast
┃
┃ 👤 ᴜsᴇʀ ᴄᴏɴᴛʀᴏʟ
┃ /banuser
┃ /unbanuser
┃ /block
┃ /unblock
┃ /blocklist
┃
┃ 🛡️ sᴜᴅᴏ
┃ /addsudo
┃ /delsudo
┃ /sudolist
┃
┃ 🚪 ғᴏʀᴄᴇ ᴊᴏɪɴ
┃ /forcejoin
┃ /setforcechannel
┃ /setforcegroup
┃ /addforce
┃ /delforce
┃ /forcelist
┃ /forceinfo
┃ /forcebypass
┃ /removebypass
┃ /bypasslist
┃
┃ ⚙️ ʙᴏᴛ ᴄᴏɴᴛʀᴏʟ
┃ /maintenance
┃ /restart
┃ /shutdown
┃ /autorestart
┃ /debug
┃
┃ 📊 sᴛᴀᴛɪsᴛɪᴄs
┃ /logs
┃ /stats
┃ /users
┃ /groups
┃ /database
┃
┃ 💾 ᴅᴀᴛᴀ
┃ /backup
┃ /restore
┃
┃ ⚙️ sᴇᴛᴛɪɴɢs
┃ /setprefix
┃ /setname
┃ /setbio
┃ /setabout
┃ /setphoto
┃
┃ 🧪 ᴀᴅᴠᴀɴᴄᴇᴅ
┃ /eval
┃ /exec
┃ /shell
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`);
  });

  // /stats
  bot.command('stats', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(`
╭━━━〔 📊 ʙᴏᴛ sᴛᴀᴛs 〕━━━╮
┃
┃ 🤖 sᴛᴀᴛᴜs: 🟢 ᴏɴʟɪɴᴇ
┃
┃ 💬 ᴄᴜʀʀᴇɴᴛ ᴄʜᴀᴛ: ${ctx.chat.id}
┃ 👤 ʏᴏᴜʀ ɪᴅ: ${ctx.from.id}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`);
  });

  // /users
  bot.command('users', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(
      '👥 ᴜsᴇʀ ᴅᴀᴛᴀʙᴀsᴇ ᴡɪʟʟ ʙᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ ɪɴ ᴛʜᴇ ɴᴇxᴛ sᴛᴇᴘ.'
    );
  });

  // /groups
  bot.command('groups', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(
      '👥 ɢʀᴏᴜᴘ ᴅᴀᴛᴀʙᴀsᴇ ᴡɪʟʟ ʙᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ ɪɴ ᴛʜᴇ ɴᴇxᴛ sᴛᴇᴘ.'
    );
  });

  // /maintenance
  bot.command('maintenance', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();

    if (!['on', 'off'].includes(arg)) {
      return ctx.reply(
        '⚙️ ᴜsᴀɢᴇ:\n/maintenance on\n/maintenance off'
      );
    }

    await ctx.reply(
      arg === 'on'
        ? '🔴 ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ ᴍᴏᴅᴇ ᴇɴᴀʙʟᴇᴅ.'
        : '🟢 ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ ᴍᴏᴅᴇ ᴅɪsᴀʙʟᴇᴅ.'
    );
  });

  // /forcejoin
  bot.command('forcejoin', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    const arg = ctx.message.text.split(' ')[1]?.toLowerCase();

    if (!['on', 'off'].includes(arg)) {
      return ctx.reply(
        '🚪 ᴜsᴀɢᴇ:\n/forcejoin on\n/forcejoin off'
      );
    }

    await ctx.reply(
      arg === 'on'
        ? '🟢 ғᴏʀᴄᴇ ᴊᴏɪɴ ᴇɴᴀʙʟᴇᴅ.'
        : '🔴 ғᴏʀᴄᴇ ᴊᴏɪɴ ᴅɪsᴀʙʟᴇᴅ.'
    );
  });

  // /setforcechannel
  bot.command('setforcechannel', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    const value = ctx.message.text.split(' ').slice(1).join(' ');

    if (!value) {
      return ctx.reply(
        '📢 ᴜsᴀɢᴇ:\n/setforcechannel @channel'
      );
    }

    await ctx.reply(
      `✅ ғᴏʀᴄᴇ ᴊᴏɪɴ ᴄʜᴀɴɴᴇʟ sᴇᴛ ᴛᴏ:\n${value}`
    );
  });

  // /setforcegroup
  bot.command('setforcegroup', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    const value = ctx.message.text.split(' ').slice(1).join(' ');

    if (!value) {
      return ctx.reply(
        '👥 ᴜsᴀɢᴇ:\n/setforcegroup @group'
      );
    }

    await ctx.reply(
      `✅ ғᴏʀᴄᴇ ᴊᴏɪɴ ɢʀᴏᴜᴘ sᴇᴛ ᴛᴏ:\n${value}`
    );
  });

  // /addsudo
  bot.command('addsudo', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(
      '🛡️ sᴜᴅᴏ sʏsᴛᴇᴍ ʀᴇᴀᴅʏ.\n\nᴘᴇʀsɪsᴛᴇɴᴛ sᴜᴅᴏ sᴛᴏʀᴀɢᴇ ᴡɪʟʟ ʙᴇ ᴀᴅᴅᴇᴅ ɴᴇxᴛ.'
    );
  });

  // /delsudo
  bot.command('delsudo', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(
      '🛡️ ᴜsᴇʀ sᴜᴅᴏ ʀᴇᴍᴏᴠᴀʟ ᴡɪʟʟ ʙᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴛᴏ ᴅᴀᴛᴀʙᴀsᴇ.'
    );
  });

  // /sudolist
  bot.command('sudolist', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    await ctx.reply(
      '🛡️ sᴜᴅᴏ ʟɪsᴛ ɪs ᴇᴍᴘᴛʏ ᴜɴᴛɪʟ ᴅᴀᴛᴀʙᴀsᴇ ɪs ᴀᴅᴅᴇᴅ.'
    );
  });

  // /broadcast
  bot.command('broadcast', async (ctx) => {
    if (!ownerOnly(ctx)) return ownerDenied(ctx);

    const message = ctx.message.text
      .replace('/broadcast', '')
      .trim();

    if (!message) {
      return ctx.reply(
        '📢 ᴜsᴀɢᴇ:\n/broadcast your message'
      );
    }

    await ctx.reply(
      `📢 ʙʀᴏᴀᴅᴄᴀsᴛ ʀᴇᴀᴅʏ.\n\nᴍᴇssᴀɢᴇ:\n${message}\n\n⚠️ ᴜsᴇʀ ᴅᴀᴛᴀʙᴀsᴇ ɪɴᴛᴇɢʀᴀᴛɪᴏɴ ɪs ᴛʜᴇ ɴᴇxᴛ sᴛᴇᴘ.`
    );
  });

  // /contactowner
  bot.command('contactowner', async (ctx) => {
    await ctx.reply(`
╭━━━〔 👑 ᴏᴡɴᴇʀ 〕━━━╮
┃
┃ ⚡ ᴍʀ ᴅᴀʀᴋ ᴋɪɴɢ ᴅᴇᴠ
┃
┃ 📩 ᴘʟᴇᴀsᴇ ᴄᴏɴᴛᴀᴄᴛ ᴛʜᴇ
┃ ᴏᴡɴᴇʀ ᴛʜʀᴏᴜɢʜ ᴛʜᴇ ᴏғғɪᴄɪᴀʟ
┃ sᴜᴘᴘᴏʀᴛ ᴄʜᴀɴɴᴇʟ.
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`);
  });
}
