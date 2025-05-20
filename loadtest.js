import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
        { duration: '30s', target: 5 },
        { duration: '30s', target: 10 },
        { duration: '30s', target: 15 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 25 },
        { duration: '30s', target: 30 },
        { duration: '30s', target: 35 },
        { duration: '30s', target: 40 },
        { duration: '30s', target: 45 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 0 },
      ],
};

export default function () {
  // Генерируем "плохие" учетные данные
  const badCredentials = {
    username: `user${Math.floor(Math.random() * 1000)}`,
    password: 'invalid_password'
  };

  const res = http.post(
    'http://backend:80/api/auth/login',
    JSON.stringify(badCredentials),
    { headers: { 'Content-Type': 'application/json' } }
  );

  // Проверяем, что сервер возвращает ожидаемую ошибку
  check(res, {
    'status is 400/401': (r) => [400, 401].includes(r.status),
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}