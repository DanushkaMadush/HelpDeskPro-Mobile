import { apiClient } from './axios';

export interface Department {
  departmentId: number;
  departmentName: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const res = await apiClient.get<Department[]>('/departments');
    return res.data;
  } catch (error: any) {
    console.error('Get departments error:', error);
    throw error;
  }
};