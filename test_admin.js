const fs = require("fs");
const html = fs.readFileSync(__dirname + "/admin.html", "utf8");
const code = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];

eval(code.match(/function parseCSV\(text\)\{[\s\S]*?\n\}\n/)[0]);
eval(code.match(/function rowsToObjects\(rows\)\{[\s\S]*?\n\}\n/)[0]);
const escLine = code.match(/const esc = [^\n]+\n/)[0];
eval(escLine.replace("const esc", "var esc"));

const csv1 = 'word,meaning,category\ngregarious,"ชอบเข้าสังคม, ชอบอยู่เป็นกลุ่ม",D\n';
const r1 = rowsToObjects(parseCSV(csv1));
console.assert(r1[0].meaning === "ชอบเข้าสังคม, ชอบอยู่เป็นกลุ่ม", "CSV quoted comma parse");
console.log("parseCSV test:", JSON.stringify(r1));

const dangerous = "<script>alert(1)</script>&\"'";
const escaped = esc(dangerous);
console.log("esc output:", escaped);
console.assert(!escaped.includes("<script>"), "esc must neutralize script tags");
console.assert(escaped.includes("&lt;"), "esc must encode <");
console.assert(esc(null) === "", "esc(null) should be empty string");
console.assert(esc(undefined) === "", "esc(undefined) should be empty string");
console.assert(esc(123) === "123", "esc(number) should stringify");

function escCsv(v){
  const s = String(v == null ? "" : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
}
console.assert(escCsv("hello, world") === '"hello, world"', "escCsv comma wrap");
console.assert(escCsv('say "hi"') === '"say ""hi"""', "escCsv quote escaping");
console.assert(escCsv("plain") === "plain", "escCsv no-op for plain text");
console.assert(escCsv(undefined) === "", "escCsv undefined -> empty");
console.log("escCsv tests: ok");

function fmtDate(v){
  if(!v) return "-";
  const d = new Date(v);
  if(isNaN(d)) return String(v);
  return d.toLocaleString("th-TH", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
}
console.log("fmtDate(iso):", fmtDate("2026-07-19T10:30:00.000Z"));
console.log("fmtDate(null):", fmtDate(null));
console.log("fmtDate(garbage):", fmtDate("not-a-date"));
console.assert(fmtDate(null) === "-", "fmtDate null");

console.log("ALL ASSERTIONS RAN - check above for any AssertionError (none = all passed)");
