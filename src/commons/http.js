import axios from 'axios';
import qs from 'qs';
import { BASE_URL } from './config';
import { message } from 'antd';
// import { hashHistory } from 'react-router';

axios.defaults.timeout = 30 * 1000; // 30s

axios.interceptors.request.use((config) => {
  let token = window.localStorage.getItem('token');
  if (token) {
    config.headers.authorization = token;
  }
  return config;
});

export const get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BASE_URL}${url}`, { params })
      .then(
        (response) => {
          resolve(response.data);
        },
        (error) => {
          if (error.response?.status === 401) {
            message.error('登录已过期,请重新登录...');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
            return;
          }
          reject(error);
        }
      )
      .catch((error) => {
        reject(error);
      });
  });
};

export const post = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${BASE_URL}${url}`, qs.stringify({ ...data }))
      .then(
        (response) => {
          resolve(response.data);
        },
        (error) => {
          if (error.response?.status === 401) {
            message.error('登录已过期,请重新登录...');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
            return;
          }
          reject(error);
        }
      )
      .catch((error) => {
        reject(error);
      });
  });
};
