import { getJWT } from "@/data/cookies/getCookies";

export const headerConfig = () => {
    return {headers: {
        Authorization: `Bearer ${getJWT()}`,
    }}
}