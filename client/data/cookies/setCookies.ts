import Cookies from "js-cookie";
import { dpurl, jwt, uid, username, userregno, userrole } from "./cookiesName";

export const setLoginCookies = (
  token: string,
  duration: number,
  fullname: string,
  profile_picture: string,
  regno: string,
  userid: string,
  role: string
) => {
  Cookies.set(jwt, token, { expires: duration });
  Cookies.set(username, fullname, { expires: duration });
  Cookies.set(userregno, regno, { expires: duration });
  Cookies.set(dpurl, profile_picture, { expires: duration });
  Cookies.set(uid, userid, { expires: duration });
  Cookies.set(userrole, role, { expires: duration });
};

export const updateProfileCookies = (
  fullname: string,
  profile_picture: string
) => {
  Cookies.set(username, fullname);
  Cookies.set(dpurl, profile_picture);
};
