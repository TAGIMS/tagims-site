const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../apps');
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/'){res.writeHead(302,{Location:'/apps/'}).end();return;}
  if(!url.pathname.startsWith('/apps/')){res.writeHead(404).end();return;}
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname.slice(5)));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');fs.createReadStream(file).pipe(res);
}).listen(8769,'127.0.0.1',()=>console.log('Hub app preview: http://127.0.0.1:8769/apps/'));
