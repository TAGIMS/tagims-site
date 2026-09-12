// Preserve source CSS; emit a scoped Business Center layer plus the native Hub bundle.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage();
 const styles=await page.evaluate(sources=>{
  function selectors(text){let depth=0,start=0,out=[];for(let i=0;i<text.length;i++){if('(['.includes(text[i]))depth++;if(')]'.includes(text[i]))depth--;if(text[i]===','&&!depth){out.push(text.slice(start,i));start=i+1;}}out.push(text.slice(start));return out;}
  function render(rules){return [...rules].map(rule=>{if(rule.type===CSSRule.STYLE_RULE){const scoped=selectors(rule.selectorText).filter(s=>s.includes('.ops-')||/data-content-type[^\]]*ops/.test(s));return scoped.length?scoped.join(',')+'{'+rule.style.cssText+'}':'';}if(rule.cssRules){const inner=render(rule.cssRules);return inner?rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+inner+'}':'';}return '';}).join('\n');}
  return sources.map(source=>{const sheet=new CSSStyleSheet();sheet.replaceSync(source);return render(sheet.cssRules);}).join('\n');
 },[read('business/operations.css'),read('business/photo-workspace.css'),read('business/command-details.css')]);
 fs.writeFileSync(path.join(root,'business/scoped.css'),'/* Generated from Business Center styles; native Hub selectors excluded. */\n'+styles);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

