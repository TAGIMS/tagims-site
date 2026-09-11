(function(root){
  const required=(v,label)=>{if(!String(v??'').trim())throw new Error(`${label} is required.`);return String(v).trim();};
  const money=value=>{if(!/^\d+(\.\d{1,2})?$/.test(String(value)))throw new Error('Enter an amount with at most two decimal places.');const [a,b='']=String(value).split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n)||n>999999999999)throw new Error('Amount is too large.');return n;};
  const total=items=>items.reduce((sum,i)=>{if(i.unit_price===null||i.quantity===null)throw new Error('Resolve TBD quantities and prices first.');const n=Math.round(money(i.unit_price)*money(i.quantity)/100);if(!Number.isSafeInteger(sum+n))throw new Error('Total is too large.');return sum+n;},0);
  const safeLink=value=>{const u=new URL(value);if(u.protocol!=='https:')throw new Error('Use an HTTPS document link.');return u.href;};
  const D={required,money,total,safeLink,display:n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100)};
  root.OpsDomain=D;if(typeof module!=='undefined')module.exports=D;
})(globalThis);
