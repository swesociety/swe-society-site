const reqSalt_keys = {
  election: {
    createElection: "#x9bzj2fq",
    getAllElection: "#e4nmtygv",
    updateElection: "#v2fdh1ko",
    deleteElection: "#a0scl3wj",
    getElectionbyID: "#m7kwq84d",
    createPosition: "#f8pbr9uy",
    getAllPosition: "#z3ntojcy",
    getPositionbyID: "#u9lmgd7h",
    deletePosition: "#k5ybd1re",
    getAllMembers: "#q2xjv6kz",
    getCandidatesFilteredByElectionAccess : "#t3xqv8kz",
  },
  vote: {
    create: "#r7cjz6bp",
    getVoteCountByID: "#t4xqv8kz",
  },
  candidate: {
    createcandidate: "#t2xqv8kz",
    getcandidateByID: "#s5wzj1qf",
    approveAllNominations : "#n3bqk6xj",
    updateNomination : "#l8vty2qz",
    deleteNomination: "#p4xjv9kz",
    getAllApprovedNominations: "#d1mty5qv",
    getCandidatesFilteredByElectionAccess : "#f2xqv8kz",
  },
  user:{
    password : "#a3bqk6xj",
  }
}

const rounds = 3;
const saltRounds = 10;

function generateKey(salt) {
  let key = '';
  for (let i = 0; i < rounds; i++) {
    key += salt;
  }
  return key;
}

function xorEncrypt(input, salt) {
  let str = String(input);
  let key = generateKey(salt, saltRounds);

  for (let round = 0; round < saltRounds; round++) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    str = result;
  }

  // Base64 encode
  return btoa(str);
}

function xorDecrypt(encrypted, salt) {
  try {
    let str = atob(encrypted); // Base64 decode
    let key = generateKey(salt, saltRounds);

    for (let round = 0; round < saltRounds; round++) {
      let result = '';
      for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      str = result;
    }

    return str;
  } catch (err) {
    return null;
  }
}




// Encrypt a single object
function encryptObject(obj, salt) {
  const encryptedObj = {};
  for (const key in obj) {
    const value = obj[key];
    encryptedObj[key] = value === null || value === undefined
      ? null
      : xorEncrypt(String(value), salt);
  }
  return encryptedObj;
}

// Decrypt a single object
function decryptObject(obj, salt) {
  const decryptedObj = {};
  for (const key in obj) {
    const value = obj[key];
    decryptedObj[key] = value === null || value === undefined
      ? null
      : xorDecrypt(String(value), salt);
  }
  return decryptedObj;
}

function encryptArray(rows, salt) {
  return rows.map((row) => {
    const encryptedRow = {};
    for (const key in row) {
      const value = row[key];
      encryptedRow[key] = value === null || value === undefined
        ? null
        : xorEncrypt(String(value), salt);
    }
    return encryptedRow;
  });
}

// Decrypt function
function decryptArray(rows, salt) {
  return rows.map((row) => {
    const decryptedRow = {};
    for (const key in row) {
      const value = row[key];
      decryptedRow[key] = value === null || value === undefined
        ? null
        : xorDecrypt(String(value), salt);
    }
    return decryptedRow;
  });
}

// Convert date strings to ISO 8601 format for PostgreSQL compatibility
function toISODateString(dateStr) {
      if (!dateStr) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr; // fallback if invalid
      // Keep timezone offset
      const tzOffset = -d.getTimezoneOffset();
      const diff = tzOffset >= 0 ? '+' : '-';
      const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
      const hours = pad(tzOffset / 60);
      const minutes = pad(tzOffset % 60);
      return d.toISOString().replace('Z', `${diff}${hours}:${minutes}`);
    }

module.exports = {
  reqSalt_keys,
  xorEncrypt,
  xorDecrypt,
  encryptObject,
  decryptObject,
  encryptArray,
  decryptArray,
  toISODateString
};