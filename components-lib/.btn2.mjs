import { chromium } from 'playwright-core'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const root='/Users/niravbhatt/Observe-Ops-Code/UI/design-system/components-lib/site/dist'
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'}
const srv=http.createServer((q,s)=>{let f=path.join(root,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';let bf=null;try{bf=fs.readFileSync(f)}catch(e){}if(bf){s.writeHead(200,{'content-type':types[path.extname(f)]||'text/plain'});s.end(bf)}else{s.writeHead(404);s.end()}})
await new Promise(r=>srv.listen(8847,r))
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
const p=await b.newPage({viewport:{width:1300,height:1100}})
const D=process.env.CLAUDE_JOB_DIR+'/tmp/'
await p.goto('http://localhost:8847/button.html',{waitUntil:'networkidle'});await p.waitForTimeout(400)
await p.getByText('Examples',{exact:true}).first().click();await p.waitForTimeout(500)
const box=await p.evaluate(()=>{const g=[...document.querySelectorAll('.g-group')].find(x=>/Icon \+ text/i.test(x.querySelector('h3')?.textContent||'')); const r=g.getBoundingClientRect(); const last=[...document.querySelectorAll('.g-group')].find(x=>/Icon-only/i.test(x.querySelector('h3')?.textContent||'')); const r2=last.getBoundingClientRect(); return {x:0,y:Math.round(r.top)-10,width:900,height:Math.round(r2.bottom-r.top)+30}})
await p.screenshot({path:D+'btn-realicons.png', clip:box})
await b.close(); srv.close()
