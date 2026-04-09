import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/tokenStorage";

export interface DecodedToken {
  sub: string;
  userId: string;
  email: string;
  plant: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
    | string
    | string[];
  permission: string | string[];
  exp: number;
  iss: string;
  aud: string;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  return await getToken();
};

export const getDecodedToken = async (): Promise<DecodedToken | null> => {
  const token = await getStoredToken();
  if (!token) return null;
  return decodeToken(token);
};

export const getUserEmail = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  console.log("DECODED TOKEN:", decoded);
  if (!decoded) return null;
  return (
    decoded.email ||
    (decoded as any)[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ||
    null
  );
};

export const getUsername = async (): Promise<string | null> => {
  const email = await getUserEmail();
  if (!email || typeof email !== "string") return null;

  // Remove @ccl.lk part
  return email.replace("@ccl.lk", "");
};

export const getUserId = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.userId || null;
};

export const getUserRole = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();

  const rawRole =
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (!rawRole) return null;

  return Array.isArray(rawRole)
    ? rawRole[0]?.toLowerCase()
    : rawRole.toLowerCase();
};

export const getUserPlant = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.plant || null;
};

export const getUserPermission = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  const permission = decoded?.permission;

  if (!permission) return null;

  return Array.isArray(permission) ? permission[0] : permission;
};

export const isTokenExpired = async (): Promise<boolean> => {
  const decoded = await getDecodedToken();
  if (!decoded) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};
