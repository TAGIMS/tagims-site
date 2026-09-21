(function(root){
  'use strict';
  const clean=value=>String(value??'').replace(/[^\x20-\x7e]/g,' ').replace(/([()\\])/g,'\\$1');
  function create(title,lines=[]){
    const rows=[title,...lines].slice(0,42),commands=rows.map((line,index)=>`BT /F1 ${index?10:16} Tf 54 ${750-index*16} Td (${clean(line).slice(0,105)}) Tj ET`).join('\n');
    const objects=[
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ];
    let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${object}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf],{type:'application/pdf'});
  }
  root.ClientPortalPDF={create};
})(globalThis);
