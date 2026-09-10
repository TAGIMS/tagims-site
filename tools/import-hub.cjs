// One-time mechanical import; originals stay untouched. Usage: node tools/import-hub.cjs <reference>
const fs = require('node:fs'), path = require('node:path');
const from = path.resolve(process.argv[2]);
const to = path.resolve(__dirname, '../apps/_hub');
fs.mkdirSync(path.join(to,'src'), {recursive:true});
for(const n of ['shell','layout','widgets','telemetry','widget-controls','interactions','background']) {
  let source = fs.readFileSync(path.join(from,'src',n+'.js'),'utf8');
  source = source.replaceAll("'assets/images/app-icons.png'", "'/apps/_hub/assets/app-icons.png'");
  if(n==='background') source=source.replace("indexedDB.open('command-hub', 1)","indexedDB.open('tagims-app-background-' + window.OpsPage, 1)");
  fs.writeFileSync(path.join(to,'src',n+'.js'),source);
}
fs.cpSync(path.join(from,'css'),path.join(to,'css'),{recursive:true});
fs.copyFileSync(path.join(from,'HUB_16.0.html'),path.join(to,'shell.html'));
console.log('Imported original Hub source compartments.');
