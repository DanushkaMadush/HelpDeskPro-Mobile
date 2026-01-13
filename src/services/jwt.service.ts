import { jwtDecode } from 'jwt-decode';
import { getToken } from '../utils/tokenStorage';

export interface DecodedToken {
  sub: string; // email
  userId: string;
  plant: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  permission: string;
  exp: number;
  iss: string;
  aud: string;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
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
  return decoded?.sub || null;
};

export const getUsername = async (): Promise<string | null> => {
  const email = await getUserEmail();
  if (!email) return null;
  
  // Remove @ccl.lk part
  return email.replace('@ccl.lk', '');
};

export const getUserId = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.userId || null;
};

export const getUserRole = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
};

export const getUserPlant = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.plant || null;
};

export const getUserPermission = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.permission || null;
};

export const isTokenExpired = async (): Promise<boolean> => {
  const decoded = await getDecodedToken();
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};