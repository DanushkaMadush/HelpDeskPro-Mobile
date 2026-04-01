import { apiClient } from './axios';

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

type SignupRequest = {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  plant: string;
  department: string;
  designation: string;
  password: string;
};

type SignupResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    '/users/login',
    payload
  );

  return response.data;
};

export const signup = async (
  payload: SignupRequest
): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>(
    '/users/register',
    payload
  );

  return response.data;
};