const App = require("./app.js");
const spec = require("./sample/limits.json");

const bucket = App.createBucket(App.loadConfig(spec));
const legacy = App.loadConfig(spec.legacy);
console.log("桶模型判定序列 =", JSON.stringify(spec.requests.map((at) => App.allow(App.createBucket(App.loadConfig(spec)), at))));
const fresh = App.createBucket(App.loadConfig(spec));
console.log("桶模型通过数 =", spec.requests.filter((at, i) => { const copy = App.createBucket(App.loadConfig(spec)); return false; }).length);
const decisions = [];
const b = App.createBucket(App.loadConfig(spec));
for (const at of spec.requests) { decisions.push(App.allow(b, at)); }
console.log("通过数 =", decisions.filter(Boolean).length);
console.log("拒绝数 =", decisions.filter((d) => !d).length);
console.log("末次余量 =", Number(b.tokens.toFixed(4)));
console.log("漏桶出队时刻 =", JSON.stringify(App.leakyDrain(App.loadConfig(spec), spec.requests)));
console.log("旧配置（只有 rate）载入后的突发 =", legacy.burst);
