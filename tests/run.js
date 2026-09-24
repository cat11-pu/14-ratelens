const assert = require("assert");
const App = require("../app.js");

const cases = [
  ["桶初始为空", () => {
    const bucket = App.createBucket({ rate: 1, burst: 1 });
    assert.strictEqual(bucket.tokens, 0);
  }],
  ["长时间后放行", () => {
    const bucket = App.createBucket({ rate: 1, burst: 2 });
    App.allow(bucket, 0);
    assert.strictEqual(App.allow(bucket, 10), true);
  }],
  ["配置载入默认值", () => {
    const config = App.loadConfig({});
    assert.strictEqual(config.rate, 1);
  }],
  ["漏桶返回同长度序列", () => {
    assert.strictEqual(App.leakyDrain({ rate: 1 }, [0, 1]).length, 2);
  }],
  ["report 结构稳定", () => {
    const out = App.report({ rate: 1, burst: 1, requests: [0] });
    assert.ok(Array.isArray(out.rows) && Array.isArray(out.columns));
  }],

];

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log("ok   " + name); }
  catch (error) { failed += 1; console.log("FAIL " + name + " -> " + error.message); }
}
console.log(cases.length + " cases, " + failed + " failed");
process.exit(failed ? 1 : 0);
