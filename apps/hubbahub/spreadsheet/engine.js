/* Reusable, DOM-free sheet model and formula evaluator. No eval or executable expressions. */
(function (root) {
  'use strict';
  const MAX_ROWS = 500, MAX_COLS = 100;
  const fail = code => { throw new Error(code); };
  const clamp = (n, low, high, fallback) => Number.isFinite(+n) ? Math.max(low, Math.min(high, Math.round(+n))) : fallback;
  function column(index) {
    let name = '';
    for (index++; index; index = Math.floor((index - 1) / 26)) name = String.fromCharCode(65 + (index - 1) % 26) + name;
    return name;
  }
  const address = (r, c) => column(c) + (r + 1);
  function coordinates(ref) {
    const m = /^\$?([A-Z]+)\$?([1-9]\d*)$/i.exec(ref);
    if (!m) fail('#REF!');
    let c = 0;
    for (const ch of m[1].toUpperCase()) c = c * 26 + ch.charCodeAt(0) - 64;
    return [+m[2] - 1, c - 1];
  }
  function parse(source) {
    if (source.length > 2000) fail('#LIMIT!');
    const tokens = [];
    const re = /\s+|"(?:[^"]|"")*"|#REF!|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|\$?[A-Za-z]+\$?\d+|[A-Za-z]+|>=|<=|<>|[+\-*/^(),:=<>]/gy;
    let pos = 0;
    while (pos < source.length) {
      re.lastIndex = pos;
      const m = re.exec(source);
      if (!m) fail('#ERROR!');
      pos = re.lastIndex;
      if (!/^\s+$/.test(m[0])) tokens.push(m[0]);
    }
    let i = 0, depth = 0;
    const peek = () => tokens[i];
    const take = token => { if (tokens[i++] !== token) fail('#ERROR!'); };
    function atom() {
      if (++depth > 80) fail('#LIMIT!');
      let node, t = tokens[i++];
      if (t === '(') { node = comparison(); take(')'); }
      else if (t === '#REF!') node = {kind:'error'};
      else if (t?.startsWith('"')) node = {kind:'literal', value:t.slice(1,-1).replace(/""/g,'"')};
      else if (t && /^(?:\d|\.\d)/.test(t)) node = {kind:'literal',value:+t};
      else if (t && /^\$?[A-Za-z]+\$?\d+$/.test(t)) {
        node = {kind:'ref',ref:t};
        if (peek() === ':') { i++; const end = tokens[i++]; coordinates(end || ''); node = {kind:'range',start:t,end}; }
      } else if (t && /^[A-Za-z]+$/.test(t)) {
        t = t.toUpperCase();
        if (t === 'TRUE' || t === 'FALSE') node = {kind:'literal',value:t === 'TRUE'};
        else {
          if (peek() !== '(') fail('#NAME?');
          i++; const args = [];
          if (peek() !== ')') { do { args.push(comparison()); if (peek() !== ',') break; i++; } while (true); }
          take(')'); node = {kind:'call',name:t,args};
        }
      } else fail('#ERROR!');
      depth--; return node;
    }
    function unary() {
      if (peek() === '+' || peek() === '-') {
        if (++depth > 80) fail('#LIMIT!');
        const op = tokens[i++], value = unary(); depth--; return {kind:'unary',op,value};
      }
      return atom();
    }
    function power() { const left = unary(); if (peek() !== '^') return left; i++; if (++depth > 80) fail('#LIMIT!'); const right=power(); depth--; return {kind:'binary',op:'^',left,right}; }
    function binary(next, ops) { let left = next(); while (ops.includes(peek())) { const op=tokens[i++]; left={kind:'binary',op,left,right:next()}; } return left; }
    const product = () => binary(power,['*','/']);
    const sum = () => binary(product,['+','-']);
    const comparison = () => binary(sum,['=','<>','>','<','>=','<=']);
    const result = comparison();
    if (i !== tokens.length) fail('#ERROR!');
    return result;
  }
  function numeric(value) {
    if (Array.isArray(value)) fail('#VALUE!');
    if (value === '') return 0;
    if (typeof value === 'boolean') return +value;
    const n = Number(value);
    if (!Number.isFinite(n)) fail('#VALUE!');
    return n;
  }
  class Sheet {
    constructor(data = {}) {
      this.rows = clamp(data.rows,1,MAX_ROWS,20);
      this.cols = clamp(data.cols,1,MAX_COLS,6);
      this.cells = Object.create(null);
      this.styles = Object.create(null);
      for (const [key,value] of Object.entries(data.cells || {})) {
        try { const [r,c]=coordinates(key); if (r<this.rows && c<this.cols) this.cells[address(r,c)]=String(value).slice(0,2000); } catch (_) { /* Ignore malformed persisted keys. */ }
      }
      for(const [key,style] of Object.entries(data.styles || {})) {
        try { const [r,c]=coordinates(key);if(r<this.rows && c<this.cols)this.format({r1:r,r2:r,c1:c,c2:c},style); } catch (_) { /* Ignore invalid styles. */ }
      }
      this.widths = Array.from({length:this.cols},(_,c)=>clamp(data.widths?.[c],56,600,120));
      this.heights = Array.from({length:this.rows},(_,r)=>clamp(data.heights?.[r],24,300,32));
      this.recalculate();
    }
    raw(r,c) { return this.cells[address(r,c)] || ''; }
    set(r,c,value) {
      if (r<0 || c<0 || r>=this.rows || c>=this.cols) fail('#REF!');
      if (String(value).length>2000) fail('#LIMIT!');
      if (value === '') delete this.cells[address(r,c)]; else this.cells[address(r,c)] = String(value);
      this.recalculate();
    }
    addRow() { if (this.rows>=MAX_ROWS) return false; const r=this.rows++;for(let c=0;c<this.cols;c++){const style=this.styles[address(r-1,c)];if(style)this.styles[address(r,c)]={...style};}this.heights.push(32); this.recalculate(); return true; }
    addColumn() { if (this.cols>=MAX_COLS) return false; const c=this.cols++;for(let r=0;r<this.rows;r++){const style=this.styles[address(r,c-1)];if(style)this.styles[address(r,c)]={...style};}this.widths.push(120); this.recalculate(); return true; }
    resize(axis,index,size) { const list=axis==='column'?this.widths:this.heights; if(index<0||index>=list.length) return; list[index]=clamp(size,axis==='column'?56:24,axis==='column'?600:300,list[index]); }
    format(range,patch) {
      for(let r=Math.max(0,range.r1);r<=Math.min(this.rows-1,range.r2);r++)for(let c=Math.max(0,range.c1);c<=Math.min(this.cols-1,range.c2);c++) {
        const key=address(r,c),style={...this.styles[key]};
        for(const field of ['background','color']) {if(patch[field]===null)delete style[field];else if(/^#[0-9a-f]{6}$/i.test(patch[field]))style[field]=patch[field];}
        if(Object.keys(style).length)this.styles[key]=style;else delete this.styles[key];
      }
    }
    // Map old indices to new indices; references follow the original cells, including $ references.
    restructure(axis,order) {
      const count=axis==='row'?this.rows:this.cols,map=new Map(order.map((old,index)=>[old,index]));
      const remap=index=>index<count?(map.has(index)?map.get(index):null):index+order.length-count;
      const ref=(raw,r,c)=>{const m=/^(\$?)[A-Z]+(\$?)\d+$/i.exec(raw);return `${m[1]}${column(c)}${m[2]}${r+1}`;};
      const rewrite=raw=>{
        if(!raw.startsWith('='))return raw;
        return raw.replace(/"(?:[^"]|"")*"|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|\$?[A-Za-z]+\$?[1-9]\d*(?:\s*:\s*\$?[A-Za-z]+\$?[1-9]\d*)?/g,token=>{
          if(token.startsWith('"')||/^(?:\d|\.)/.test(token))return token;
          const ends=token.split(/\s*:\s*/),[r,c]=coordinates(ends[0]);
          if(ends.length===1){const next=remap(axis==='row'?r:c);return next===null?'#REF!':ref(token,axis==='row'?next:r,axis==='column'?next:c);}
          const [rr,cc]=coordinates(ends[1]),lo=axis==='row'?Math.min(r,rr):Math.min(c,cc),hi=axis==='row'?Math.max(r,rr):Math.max(c,cc);
          if(hi>=count)return token; // Already out-of-bounds ranges remain invalid.
          const indices=[];for(let i=lo;i<=hi;i++){const next=remap(i);if(next!==null)indices.push(next);}
          indices.sort((a,b)=>a-b);if(!indices.length)return '#REF!';
          const groups=[];for(const index of indices){const last=groups.at(-1);if(last&&index===last[1]+1)last[1]=index;else groups.push([index,index]);}
          const ranges=groups.map(([a,b])=>axis==='row'?`${ref(ends[0],a,Math.min(c,cc))}:${ref(ends[1],b,Math.max(c,cc))}`:`${ref(ends[0],Math.min(r,rr),a)}:${ref(ends[1],Math.max(r,rr),b)}`);
          return ranges.length===1?ranges[0]:`UNION(${ranges.join(',')})`;
        });
      };
      const cells=Object.create(null),styles=Object.create(null);
      for(const [key,raw] of Object.entries(this.cells)){let [r,c]=coordinates(key);const next=remap(axis==='row'?r:c);if(next===null)continue;if(axis==='row')r=next;else c=next;const value=rewrite(raw);if(value.length>2000)fail('#LIMIT!');cells[address(r,c)]=value;}
      for(const [key,style] of Object.entries(this.styles)){let [r,c]=coordinates(key);const next=remap(axis==='row'?r:c);if(next===null)continue;if(axis==='row')r=next;else c=next;styles[address(r,c)]={...style};}
      if(axis==='row'){this.heights=order.map(i=>this.heights[i]);this.rows=order.length;}else{this.widths=order.map(i=>this.widths[i]);this.cols=order.length;}
      this.cells=cells;this.styles=styles;this.recalculate();
    }
    deleteAxis(axis,start,end=start) {
      const count=axis==='row'?this.rows:this.cols;
      if(start<0||end>=count||end<start||end-start+1>=count)return false;
      this.restructure(axis,Array.from({length:count},(_,i)=>i).filter(i=>i<start||i>end));return true;
    }
    moveAxis(axis,from,to) {
      const count=axis==='row'?this.rows:this.cols;if(from<0||to<0||from>=count||to>=count||from===to)return false;
      const order=Array.from({length:count},(_,i)=>i);order.splice(to,0,order.splice(from,1)[0]);this.restructure(axis,order);return true;
    }
    snapshot() { return {version:2,rows:this.rows,cols:this.cols,cells:{...this.cells},styles:Object.fromEntries(Object.entries(this.styles).map(([key,value])=>[key,{...value}])),widths:[...this.widths],heights:[...this.heights]}; }
    recalculate() { this.cache = new Map(); }
    value(r,c) { try { return this.evaluate(address(r,c),new Set()); } catch(e) { return /^#/.test(e.message)?e.message:'#ERROR!'; } }
    evaluate(ref,visiting) {
      const [r,c]=coordinates(ref), key=address(r,c);
      if (r>=this.rows || c>=this.cols) fail('#REF!');
      if (visiting.has(key)) fail('#CYCLE!');
      if (visiting.size>200) fail('#LIMIT!');
      if (this.cache.has(key)) { const result=this.cache.get(key); if(result instanceof Error) throw result; return result; }
      visiting.add(key);
      try {
        const raw=this.raw(r,c);
        const result=raw.startsWith('=') ? this.compute(parse(raw.slice(1)),visiting) : (raw.trim()!=='' && Number.isFinite(Number(raw)) ? Number(raw) : raw);
        if (Array.isArray(result)) fail('#VALUE!');
        if (typeof result==='number' && !Number.isFinite(result)) fail('#NUM!');
        this.cache.set(key,result); return result;
      } catch(e) { this.cache.set(key,e); throw e; }
      finally { visiting.delete(key); }
    }
    compute(node,visiting) {
      const run = n => this.compute(n,visiting);
      if (node.kind==='error') fail('#REF!');
      if (node.kind==='literal') return node.value;
      if (node.kind==='ref') return this.evaluate(node.ref,visiting);
      if (node.kind==='range') {
        const [r1,c1]=coordinates(node.start),[r2,c2]=coordinates(node.end);
        if(Math.max(r1,r2)>=this.rows || Math.max(c1,c2)>=this.cols) fail('#REF!');
        const values=[];
        for(let r=Math.min(r1,r2);r<=Math.max(r1,r2);r++) for(let c=Math.min(c1,c2);c<=Math.max(c1,c2);c++) values.push(this.evaluate(address(r,c),visiting));
        return values;
      }
      if (node.kind==='unary') return (node.op==='-'?-1:1)*numeric(run(node.value));
      if (node.kind==='call') {
        if(node.name==='UNION') return node.args.flatMap(run);
        if(node.name==='IF') { if(node.args.length!==3) fail('#ERROR!'); const condition=run(node.args[0]); if(Array.isArray(condition)) fail('#VALUE!'); return run(node.args[condition?1:2]); }
        if(node.name==='SUM') return node.args.flatMap(run).reduce((sum,v)=>sum+(typeof v==='number'?v:0),0);
        fail('#NAME?');
      }
      const a=run(node.left),b=run(node.right);
      if(Array.isArray(a)||Array.isArray(b)) fail('#VALUE!');
      if(['=','<>','>','<','>=','<='].includes(node.op)) {
        const bothNumeric=(a===''||typeof a==='number'||typeof a==='boolean')&&(b===''||typeof b==='number'||typeof b==='boolean');
        const x=bothNumeric?numeric(a):String(a).toLowerCase(), y=bothNumeric?numeric(b):String(b).toLowerCase();
        return {'=':()=>x===y,'<>':()=>x!==y,'>':()=>x>y,'<':()=>x<y,'>=':()=>x>=y,'<=':()=>x<=y}[node.op]();
      }
      const x=numeric(a),y=numeric(b);
      if(node.op==='/' && y===0) fail('#DIV/0!');
      return {'+':()=>x+y,'-':()=>x-y,'*':()=>x*y,'/':()=>x/y,'^':()=>x**y}[node.op]();
    }
  }
  const api={Sheet,address,column,coordinates,MAX_ROWS,MAX_COLS};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.HubSpreadsheet=api;
})(typeof globalThis!=='undefined'?globalThis:this);
