import Cookies from "js-cookie";
import { dpurl, jwt, userrole, uid, username, userregno } from "./cookiesName";

export const getJWT = () => {
  return Cookies.get(jwt);
};
export const getUserName = () => {
  return Cookies.get(username);
};
export const getUserReg = () => {
  return Cookies.get(userregno);
};
export const getUserDP = () => {
  return Cookies.get(dpurl);
};
export const getUserID = () => {
  return Cookies.get(uid);
};
export const getUserRole = () => {
  return Cookies.get(userrole);
};
