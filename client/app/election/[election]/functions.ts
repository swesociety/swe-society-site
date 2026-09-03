import { APIENDPOINTS } from "@/data/urls";
import {
  decryptObject,
  election_status,
  reqSalt_keys,
  xorEncrypt,
} from "@/utils/encrypt_req";
import axios from "axios";
export const timeZone = "Asia/Dhaka";

export const fetchElection = async (
  nth: number,
  type: "nomination" | "vote"
): Promise<{ info: any; status: "pending" | "running" | "over" | "" }> => {
  try {
    const res = await axios.get(
      `${APIENDPOINTS.election.getElectionbyID}/${xorEncrypt(
        nth.toString(),
        reqSalt_keys.election.getElectionbyID
      )}`
    );

    const decryptedData = decryptObject(
      res.data,
      reqSalt_keys.election.getElectionbyID
    );

    let status: "pending" | "running" | "over" = "over";

    if (type === "nomination") {
      console.log("pending : ", election_status.pending);
      console.log("election_status : ", decryptedData.election_status);
      console.log(decryptedData.election_status === election_status.pending);

      switch (decryptedData.election_status) {
        case election_status.pending:
          status = "pending";
          break;
        case election_status.candidate_reg_start:
          status = "running";
          break;
        case election_status.candidate_reg_end:
          status = "over";
          break;
        default:
          status = "over";
          break;
      }
    }
    if (type === "vote") {
      switch (decryptedData.election_status) {
        case election_status.voting_not_started:
          status = "pending";
          break;
        case election_status.voting_start:
          console.log("voting_start xd");
          status = "running";
          break;
        case election_status.voting_end:
          status = "over";
          break;
        case election_status.finished:
          status = "over";
          break;
        case election_status.pending:
          status = "pending";
          break;
        case election_status.candidate_reg_start:
          status = "pending";
          break;
        case election_status.candidate_reg_end:
          status = "pending";
          break;

        default:
          status = "over";
          break;
      }
    }

    return {
      info: decryptedData,
      status,
    };
  } catch (error) {
    console.error("Error fetching election:", error);
    return {
      info: null,
      status: "",
    };
  }
};
