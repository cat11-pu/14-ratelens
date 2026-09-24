const App = require("./app.js");
const spec = require("./sample/limits.json");

const legacy = App.loadConfig(spec.legacy);
const decisions = [];
const bucket = App.createBucket(App.loadConfig(spec));
for (const at of spec.requests) { decisions.push(App.allow(bucket, at)); }
console.log("桶模型判定序列 =", JSON.stringify(decisions));
console.log("通过数 =", decisions.filter(Boolean).length);
console.log("拒绝数 =", decisions.filter((d) => !d).length);
console.log("末次余量 =", Number(bucket.tokens.toFixed(4)));
console.log("漏桶出队时刻 =", JSON.stringify(App.leakyDrain(App.loadConfig(spec), spec.requests)));
console.log("旧配置（只有 rate）载入后的突发 =", legacy.burst);
console.log("旧配置的速率 =", legacy.rate);
