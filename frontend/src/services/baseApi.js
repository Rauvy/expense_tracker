import axios from 'axios';
import { getBaseURL } from '../config/apiConfig';

const baseApi = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default baseApi;
