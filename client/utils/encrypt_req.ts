export const election_status = {
  pending: "x9bzj2fq",
  candidate_reg_start: "e4nmtygv",
  candidate_reg_end: "v2fdh1ko",
  voting_not_started: "a0scl3wj",
  voting_start: "a0sc73wq",
  voting_end: "m7kwq84d",
  finished: "f8pbr9uy",
};
export function getAllKeysByValue(value: string) {
  return Object.entries(election_status)
    .filter(([key, val]) => val === value)
    .map(([key]) => key);
}
export const reqSalt_keys = {
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
  },
  vote: {
    create: "#r7cjz6bp",
    getVoteCountByID: "#t4xqv8kz",
  },
  candidate: {
    createcandidate: "#t2xqv8kz",
    getcandidateByID: "#s5wzj1qf",
    approveAllNominations: "#n3bqk6xj",
    updateNomination: "#l8vty2qz",
    deleteNomination: "#p4xjv9kz",
    getAllApprovedNominations: "#d1mty5qv",
    getFilteredCandidatesByElectionAccess: "#f2xqv8kz",
  },
};

const rounds = 3;
const saltrounds = 10;

function generateKey(salt: string) {
  let key = "";
  for (let i = 0; i < rounds; i++) {
    key += salt;
  }
  return key;
}

export function xorEncrypt(input: string, salt: string) {
  let str = String(input);
  let key = generateKey(salt);

  for (let round = 0; round < saltrounds; round++) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    str = result;
  }

  // Base64 encode
  return btoa(str);
}

export function xorDecrypt(encrypted: string, salt: string) {
  let str = atob(encrypted); // Base64 decode
  let key = generateKey(salt);

  for (let round = 0; round < saltrounds; round++) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    str = result;
  }

  return str;
}

// Encrypt a single object
export function encryptObject(
  obj: Record<string, any>,
  salt: string
): Record<string, any> {
  const encryptedObj: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    encryptedObj[key] =
      value === null || value === undefined
        ? null
        : xorEncrypt(String(value), salt);
  }
  return encryptedObj;
}

// Decrypt a single object
export function decryptObject(
  obj: Record<string, any>,
  salt: string
): Record<string, any> {
  const decryptedObj: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    decryptedObj[key] =
      value === null || value === undefined
        ? null
        : xorDecrypt(String(value), salt);
  }
  return decryptedObj;
}

// Encrypt function
export function encryptArray(
  rows: Record<string, any>[],
  salt: string
): Record<string, any>[] {
  return rows.map((row) => {
    const encryptedRow: Record<string, any> = {};
    for (const key in row) {
      const value = row[key];
      encryptedRow[key] =
        value === null || value === undefined
          ? null
          : xorEncrypt(String(value), salt);
    }
    return encryptedRow;
  });
}

// Decrypt function
export function decryptArray(
  rows: Record<string, any>[],
  salt: string
): Record<string, any>[] {
  return rows.map((row) => {
    const decryptedRow: Record<string, any> = {};
    for (const key in row) {
      const value = row[key];
      decryptedRow[key] =
        value === null || value === undefined
          ? null
          : xorDecrypt(String(value), salt);
    }
    return decryptedRow;
  });
}
