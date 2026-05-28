import fs from "node:fs";
const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
if (!pkg.dependencies?.next && !pkg.devDependencies?.next) {
  console.error("Next.js dependency is missing from package.json. Check Vercel Root Directory.");
  process.exit(1);
}
console.log(`Velmère preflight OK · next ${pkg.dependencies?.next ?? pkg.devDependencies?.next}`);
