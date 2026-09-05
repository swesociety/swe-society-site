import CryptoJS from "crypto-js";

export const salt_keys = {
  election_key: "#2gugujqr",
  nomination_key: "#2fumSjqr",
  vote_key: "#2fgotjqr",
  standing_key: "#2fuaotqr",
  election_access: "#2fugotqr",
  monitor_voting: "#2fugotqr",
} as const;

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
  },
  vote: {
    post: "#r7cjz6bp",
  },
};

type SaltKeyType = keyof typeof salt_keys;

export function encryptId(id: number, type: SaltKeyType): string {
  if (!salt_keys[type]) {
    throw new Error("Invalid encryption type");
  }

  const ciphertext = CryptoJS.AES.encrypt(
    id.toString(),
    salt_keys[type]
  ).toString();
  return encodeURIComponent(ciphertext); // Encode for safe URL usage
}

export function decryptId(
  encryptedCode: string,
  type: SaltKeyType
): number | null {
  try {
    if (!salt_keys[type]) {
      throw new Error("Invalid decryption type");
    }

    const decodedCode = decodeURIComponent(encryptedCode);
    const bytes = CryptoJS.AES.decrypt(decodedCode, salt_keys[type]);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    return decryptedText ? parseInt(decryptedText, 10) : null;
  } catch (error) {
    return null;
  }
}
