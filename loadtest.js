import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    requests_per_second: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50, 
      maxVUs: 100,
      stages: [
        { target: 4, duration: '30s',  },

        { target: 8, duration: '45s',  },

        { target: 12, duration: '45s',  },

        { target: 15, duration: '45s',  },

        { target: 0, duration: '30s' }, // Плавный спад
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'],
  }
};

export default function () {
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
    'status is 500 (expected)': (r) => r.status === 500, // Проверяем на 500, так как это ожидаемо
    'response time < 1500ms': (r) => r.timings.duration < 1500,
  });
}