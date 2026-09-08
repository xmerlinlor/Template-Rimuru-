import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

const DEFAULT_DATABASE = {
  users: {},
  groups: {},
  sudo: [],
  blocked: [],

  forceJoin: {
    enabled: false,
    channels: [],
    groups: [],
    bypass: []
  },

  settings: {
    maintenance: false,
    prefix: "/",
    botName: "ᴛᴇᴍᴘᴇsᴛ ʀɪᴍᴜʀᴜ",
    botBio: "",
    botAbout: "",
    autoRestart: false,
    debug: false
  },

  economy: {},
  games: {},
  pets: {},
  pokemon: {},
  empire: {}
};

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(DEFAULT_DATABASE, null, 2)
    );
  }
}

function loadDatabase() {
  ensureDatabase();

  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const data = JSON.parse(raw);

    return {
      ...DEFAULT_DATABASE,
      ...data,
      forceJoin: {
        ...DEFAULT_DATABASE.forceJoin,
        ...(data.forceJoin || {})
      },
      settings: {
        ...DEFAULT_DATABASE.settings,
        ...(data.settings || {})
      }
    };
  } catch (error) {
    console.error("❌ Database read error:", error.message);

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(DEFAULT_DATABASE, null, 2)
    );

    return structuredClone(DEFAULT_DATABASE);
  }
}

let db = loadDatabase();

export function getDatabase() {
  return db;
}

export function save() {
  ensureDatabase();

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(db, null, 2)
  );

  return true;
}

export function reload() {
  db = loadDatabase();
  return db;
}

/* ==========================================
   👤 USERS
========================================== */

export function addUser(userId, data = {}) {
  const id = String(userId);

  if (!db.users[id]) {
    db.users[id] = {
      id,
      username: data.username || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      joinedAt: Date.now(),
      ...data
    };

    save();
  }

  return db.users[id];
}

export function getUser(userId) {
  return db.users[String(userId)] || null;
}

export function getAllUsers() {
  return Object.values(db.users);
}

export function userCount() {
  return Object.keys(db.users).length;
}

/* ==========================================
   👥 GROUPS
========================================== */

export function addGroup(groupId, data = {}) {
  const id = String(groupId);

  if (!db.groups[id]) {
    db.groups[id] = {
      id,
      title: data.title || "",
      settings: {
        welcome: true,
        goodbye: true,
        rules: "",
        warnLimit: 3,
        antiLink: false,
        antiFlood: false,
        antiSpam: false,
        antiBot: false,
        antiRaid: false,
        antiMention: false,
        antiWord: false,
        antiChannel: false,
        antiForward: false,
        antiSticker: false,
        antiMedia: false,
        antiVoice: false,
        antiFile: false,
        locked: false,
        lockdown: false,
        slowmode: 0,
        ...data.settings
      },
      warnings: {},
      filters: {},
      rules: [],
      createdAt: Date.now(),
      ...data
    };

    save();
  }

  return db.groups[id];
}

export function getGroup(groupId) {
  return db.groups[String(groupId)] || null;
}

export function getAllGroups() {
  return Object.values(db.groups);
}

export function groupCount() {
  return Object.keys(db.groups).length;
}

/* ==========================================
   ⚙️ GROUP SETTINGS
========================================== */

export function getGroupSettings(groupId) {
  const group = addGroup(groupId);

  if (!group.settings) {
    group.settings = {};
    save();
  }

  return group.settings;
}

export function getGroupSetting(groupId, key, defaultValue = null) {
  const settings = getGroupSettings(groupId);

  if (settings[key] === undefined) {
    return defaultValue;
  }

  return settings[key];
}

export function setGroupSetting(groupId, key, value) {
  const group = addGroup(groupId);

  if (!group.settings) {
    group.settings = {};
  }

  group.settings[key] = value;

  save();

  return value;
}

export function updateGroupSettings(groupId, updates = {}) {
  const group = addGroup(groupId);

  if (!group.settings) {
    group.settings = {};
  }

  group.settings = {
    ...group.settings,
    ...updates
  };

  save();

  return group.settings;
}

/* ==========================================
   🛡️ SUDO
========================================== */

export function addSudo(userId) {
  const id = String(userId);

  if (!db.sudo.includes(id)) {
    db.sudo.push(id);
    save();
  }

  return true;
}

export function removeSudo(userId) {
  const id = String(userId);

  db.sudo = db.sudo.filter(user => user !== id);

  save();

  return true;
}

export function isSudo(userId) {
  return db.sudo.includes(String(userId));
}

export function getSudoUsers() {
  return db.sudo;
}

/* ==========================================
   🚫 BLOCKED USERS
========================================== */

export function blockUser(userId) {
  const id = String(userId);

  if (!db.blocked.includes(id)) {
    db.blocked.push(id);
    save();
  }

  return true;
}

export function unblockUser(userId) {
  const id = String(userId);

  db.blocked = db.blocked.filter(user => user !== id);

  save();

  return true;
}

export function isBlocked(userId) {
  return db.blocked.includes(String(userId));
}

export function getBlockedUsers() {
  return db.blocked;
}

/* ==========================================
   📢 FORCE JOIN
========================================== */

export function setForceJoin(enabled) {
  db.forceJoin.enabled = Boolean(enabled);
  save();

  return db.forceJoin.enabled;
}

export function isForceJoinEnabled() {
  return db.forceJoin.enabled;
}

export function addForceChannel(channel) {
  if (!db.forceJoin.channels.includes(channel)) {
    db.forceJoin.channels.push(channel);
    save();
  }

  return true;
}

export function removeForceChannel(channel) {
  db.forceJoin.channels =
    db.forceJoin.channels.filter(item => item !== channel);

  save();

  return true;
}

export function addForceGroup(group) {
  if (!db.forceJoin.groups.includes(group)) {
    db.forceJoin.groups.push(group);
    save();
  }

  return true;
}

export function removeForceGroup(group) {
  db.forceJoin.groups =
    db.forceJoin.groups.filter(item => item !== group);

  save();

  return true;
}

export function getForceJoin() {
  return db.forceJoin;
}

export function addForceBypass(userId) {
  const id = String(userId);

  if (!db.forceJoin.bypass.includes(id)) {
    db.forceJoin.bypass.push(id);
    save();
  }

  return true;
}

export function removeForceBypass(userId) {
  const id = String(userId);

  db.forceJoin.bypass =
    db.forceJoin.bypass.filter(user => user !== id);

  save();

  return true;
}

export function isForceBypassed(userId) {
  return db.forceJoin.bypass.includes(String(userId));
}

/* ==========================================
   ⚙️ GLOBAL SETTINGS
========================================== */

export function getSetting(key, defaultValue = null) {
  if (db.settings[key] === undefined) {
    return defaultValue;
  }

  return db.settings[key];
}

export function setSetting(key, value) {
  db.settings[key] = value;
  save();

  return value;
}

export function getSettings() {
  return db.settings;
}

/* ==========================================
   💰 ECONOMY
========================================== */

export function getEconomy(userId) {
  const id = String(userId);

  if (!db.economy[id]) {
    db.economy[id] = {
      wallet: 0,
      bank: 0,
      xp: 0,
      level: 1,
      streak: 0,
      inventory: []
    };

    save();
  }

  return db.economy[id];
}

export function updateEconomy(userId, updates = {}) {
  const economy = getEconomy(userId);

  db.economy[String(userId)] = {
    ...economy,
    ...updates
  };

  save();

  return db.economy[String(userId)];
}

/* ==========================================
   🎮 GAMES
========================================== */

export function getGameData(userId) {
  const id = String(userId);

  if (!db.games[id]) {
    db.games[id] = {
      xp: 0,
      level: 1,
      wins: 0,
      losses: 0,
      games: 0,
      streak: 0
    };

    save();
  }

  return db.games[id];
}

export function updateGameData(userId, updates = {}) {
  const game = getGameData(userId);

  db.games[String(userId)] = {
    ...game,
    ...updates
  };

  save();

  return db.games[String(userId)];
}

/* ==========================================
   🐾 PET
========================================== */

export function getPetData(userId) {
  const id = String(userId);

  if (!db.pets[id]) {
    db.pets[id] = {
      adopted: false,
      name: "",
      type: "",
      level: 1,
      xp: 0,
      health: 100,
      energy: 100,
      happiness: 100
    };

    save();
  }

  return db.pets[id];
}

/* ==========================================
   ⚡ POKÉMON
========================================== */

export function getPokemonData(userId) {
  const id = String(userId);

  if (!db.pokemon[id]) {
    db.pokemon[id] = {
      coins: 0,
      collection: [],
      party: [],
      badges: [],
      level: 1,
      xp: 0
    };

    save();
  }

  return db.pokemon[id];
}

/* ==========================================
   👑 EMPIRE
========================================== */

export function getEmpireData(userId) {
  const id = String(userId);

  if (!db.empire[id]) {
    db.empire[id] = {
      empire: null,
      role: "member",
      level: 1,
      xp: 0,
      resources: {
        gold: 0,
        wood: 0,
        stone: 0,
        food: 0
      },
      army: 0,
      territory: 1
    };

    save();
  }

  return db.empire[id];
}

/* ==========================================
   💾 BACKUP
========================================== */

export function createBackup() {
  ensureDatabase();

  const backupDir = path.join(DATA_DIR, "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(
    backupDir,
    `database-${Date.now()}.json`
  );

  fs.writeFileSync(
    backupFile,
    JSON.stringify(db, null, 2)
  );

  return backupFile;
}

export function databasePath() {
  return DB_FILE;
}

console.log("💾 Database system loaded.");
