// ratelens：限流模型对比（基线：只算整令牌，两种模型不分家）
(function (root) {
  function createBucket(config) {
    return { rate: config.rate || 1, capacity: config.burst || config.capacity || 1, tokens: 0, last: 0 };
  }

  function allow(bucket, now) {
    const elapsed = Math.floor(now - bucket.last);
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.rate);
    bucket.last = now;
    if (bucket.tokens >= 1) { bucket.tokens -= 1; return true; }
    return false;
  }

  function leakyDrain(config, requests) {
    return requests.slice();
  }

  function loadConfig(raw) {
    return { rate: raw.rate || 1, burst: raw.burst || raw.capacity || 1 };
  }

  function report(spec) {
    const bucket = createBucket(spec);
    const decisions = spec.requests.map((at) => allow(bucket, at));
    return { summary: "通过 " + decisions.filter(Boolean).length, columns: ["at", "allowed"], rows: spec.requests.map((at, i) => [at, decisions[i]]) };
  }

  const App = { createBucket, allow, leakyDrain, loadConfig, report };
  if (typeof module !== "undefined") { module.exports = App; }
  root.App = App;
})(typeof window !== "undefined" ? window : globalThis);
