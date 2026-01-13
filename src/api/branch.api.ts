import { apiClient } from './axios';

export interface Branch {
  branchId: number;
  branchName: string;
  address: string;
}

export const getBranches = async (): Promise<Branch[]> => {
  try {
    const res = await apiClient.get<Branch[]>('/branches');
    return res.data;
  } catch (error: any) {
    console.error('Get branches error:', error);
    throw error;
  }
};