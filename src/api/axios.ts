import axios from 'axios';
import { API_CONFIG } from './config';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});
