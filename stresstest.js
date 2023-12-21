import http from 'k6/http';
import { check, sleep } from 'k6';
export let options = {
  stages: [
    { duration: '15s', target: 100 },
    { duration: '240s', target: 1000 },
    { duration: '15s', target: 0 },
  ],
};

export default function () {
  const httpOptions = {
    headers: {
      Authorization: `Bearer `,
    },
  };
  let res = http.get(
    'https://nonprod.ruleslawyer.geekway.com/api/legacy/org/1/con/1/checkouts/checkedOutLongest',
    httpOptions,
  );
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
