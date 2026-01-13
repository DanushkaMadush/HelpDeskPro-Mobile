import { apiClient } from './axios';

export interface System {
  systemId: number;
  systemName: string;
}

export interface SystemByUser {
  sysDevId: number;
  systemId: number;
  userId: string;
  systemName: string;
}

export const getSystems = async (): Promise<System[]> => {
  try {
    const res = await apiClient.get<System[]>('/systems');
    return res.data;
  } catch (error: any) {
    console.error('Get systems error:', error);
    throw error;
  }
};

export const getSystemsByUser = async (userId: string): Promise<SystemByUser[]> => {
  try {
    const res = await apiClient.get<SystemByUser[]>(`/systems/by-user/${userId}`);
    return res.data;
  } catch (error: any) {
    console.error('Get systems by user error:', error);
    throw error;
  }
};