// ratelens：限流模型对比（桶模型按浮点累加，漏桶模型匀速出队）
(function (root) {
  function createBucket(config) {
    return { rate: config.rate || 1, capacity: config.burst || config.capacity || 1, tokens: 0, last: 0 };
  }

  // 令牌桶：按实际经过的时间浮点累加，补充上限为 capacity；
  // 被拒绝的调用不提交本次补充，也不推进补充起点 last。
  function allow(bucket, now) {
    const elapsed = now - bucket.last;
    const tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.rate);
    if (tokens >= 1) {
      bucket.tokens = tokens - 1;
      bucket.last = now;
      return true;
    }
    return false;
  }

  // 漏桶：匀速出队，间隔 = 1/rate，从首个请求时刻开始。
  function leakyDrain(config, requests) {
    const rate = config.rate || 1;
    const interval = 1 / rate;
    const start = requests.length ? requests[0] : 0;
    return requests.map((_, i) => start + i * interval);
  }

  function loadConfig(raw) {
    return { rate: raw.rate || 1, burst: raw.burst || raw.capacity || 1 };
  }

  function report(spec) {
    const config = loadConfig(spec);
    const bucket = createBucket(config);
    const decisions = spec.requests.map((at) => allow(bucket, at));
    const passed = decisions.filter(Boolean).length;
    const drainTimes = leakyDrain(config, spec.requests);
    return {
      summary: "通过 " + passed,
      columns: ["at", "allowed"],
      rows: spec.requests.map((at, i) => [at, decisions[i]]),
      bucket: { passed: passed, rejected: decisions.length - passed, tokens: bucket.tokens },
      leaky: { drainTimes: drainTimes },
    };
  }

  const App = { createBucket, allow, leakyDrain, loadConfig, report };
  if (typeof module !== "undefined") { module.exports = App; }
  root.App = App;
})(typeof window !== "undefined" ? window : globalThis);
