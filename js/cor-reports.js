(function(){
'use strict';
const e=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const meaningful=r=>r && typeof r==='object' && Object.values(r).some(v=>String(v??'').trim() && !['0','0%','None','N/A'].includes(String(v).trim()));
function table(rows){
 rows=Array.isArray(rows)?rows:[];
 if(!rows.length)return '<div class="cor-empty">No reportable records in the current workbook.</div>';
 const keys=[...new Set(rows.flatMap(r=>Object.keys(r||{})))].filter(k=>rows.some(r=>String((r||{})[k]??'').trim())).slice(0,8);
 return `<div class="cor-table-wrap"><table class="cor-table"><thead><tr>${keys.map(k=>`<th>${e(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${keys.map(k=>`<td>${e((r||{})[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
window.renderCorReports=function(){
 const ds=window.data||window.PMIS_DATA||{};
 const d=(ds.corReports && typeof ds.corReports==='object')?ds.corReports:{meta:{},sections:[],actions:[],decisions:[]};
 const m=d.meta||{};
 const host=document.getElementById('corReportsContent');
 if(!host) throw new Error('COR Reports content container not found.');
 const prior=(document.getElementById('corBuildingFilter')||{}).value||'ALL';
 const match=r=>prior==='ALL'||String((r||{}).Building||(r||{})['Building / Area']||'').replace(/^B/i,'').padStart(2,'0')===String(prior).replace(/^B/i,'').padStart(2,'0');
 const sections=(Array.isArray(d.sections)?d.sections:[]).map(s=>{
   const rows=(Array.isArray(s.rows)?s.rows:[]).filter(match).filter(meaningful);
   const op=(Array.isArray(s.operational)?s.operational:[]).filter(meaningful);
   return `<section class="cor-section"><div class="cor-section-head"><span>${e(s.id)}</span><div><h3>${e(s.title)}</h3><small>${rows.length+op.length} reportable items</small></div></div>${table(rows)}${op.length?table(op):''}${s.lookAhead?`<div class="cor-lookahead">${e(s.lookAhead)}</div>`:''}</section>`;
 }).join('');
 const stats=ds.stats||{}, buildings=Array.isArray(ds.buildings)?ds.buildings:[];
 const avg=Number(stats.avgReadiness||0); const avgPct=avg>1?avg:avg*100;
 host.innerHTML=`<div class="cor-controls"><label>Building <select id="corBuildingFilter"><option value="ALL">Campus-wide</option>${buildings.map(b=>`<option value="${e(b.Building)}">Building ${e(b.Building)}</option>`).join('')}</select></label><div class="cor-meta">${e(m.reportType||'Weekly')} · ${e(m.projectPhase||'Project Status')} · Schedule: ${e(m.contractorSchedule||'Pending')}</div></div><div class="cor-kpis"><div><span>Buildings</span><strong>${stats.total||buildings.length||0}</strong></div><div><span>Readiness</span><strong>${Math.round(avgPct)}%</strong></div><div><span>Open Risks</span><strong>${stats.risks||0}</strong></div><div><span>Open Questions</span><strong>${stats.questions||0}</strong></div><div><span>COR Decisions</span><strong>${(Array.isArray(d.decisions)?d.decisions:[]).filter(meaningful).length}</strong></div></div><section class="cor-summary"><h3>Executive Summary</h3><p>${e(m.executiveSummary||'No executive summary is available.')}</p></section>${sections||'<div class="cor-empty">The COR report data did not load. Reload the Excel workbook or refresh the page.</div>'}`;
 const sel=document.getElementById('corBuildingFilter'); if(sel){sel.value=prior;sel.addEventListener('change',window.renderCorReports);}
};
// Opening and closing are owned by app-main.js so the report cannot render inline.
window.copyCorDigest=async function(){const d=((window.data||window.PMIS_DATA||{}).corReports)||{},m=d.meta||{};const txt=[`COR Project Status Report — 518-22-700`,m.executiveSummary||'',...(Array.isArray(d.sections)?d.sections:[]).map(s=>`\n${s.id}. ${s.title}\n${(Array.isArray(s.rows)?s.rows:[]).filter(meaningful).slice(0,12).map(r=>Object.entries(r).filter(x=>String(x[1]??'').trim()).map(x=>`${x[0]}: ${x[1]}`).join(' | ')).join('\n')}`)].join('\n');try{await navigator.clipboard.writeText(txt);}catch(_){}};
window.printCorReport=function(){window.print();};
})();
