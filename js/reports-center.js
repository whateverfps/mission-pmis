let activeReportType='daily';
function reportBuildingLabel(value){
  const raw = (value && typeof value === 'object') ? value.Building : value;
  const v = String(raw ?? '').trim();
  if(!v) return 'B--';
  if(/^B\d/i.test(v)) return v.toUpperCase();
  if(/^\d+$/.test(v)) return 'B' + v.padStart(2,'0');
  return v.toUpperCase();
}
function reportTopRows(field,label,count=5){
  return topBuildingsBy(field,count).map(b=>`<div class="report-row"><b>${esc(reportBuildingLabel(b))}</b><span>${esc(b['Overall Status']||b['Dashboard Signal']||'Monitor')} · ${pct(b.readinessPct||0)}% ready</span><strong class="report-chip">${esc(b[field]||0)} ${label}</strong></div>`).join('');
}
function readyBuildings(){return [...data.buildings].filter(b=>statusClass(b)==='ready').length;}
function watchBuildings(){return [...data.buildings].filter(b=>statusClass(b)==='warn').length;}
function criticalBuildings(){return [...data.buildings].filter(b=>statusClass(b)==='critical').length;}
function allBuildingsReportText(){
  const s=data.stats||{};
  const lines=[];
  lines.push('Mission PMIS All Buildings Report');
  lines.push('Bedford VA Medical Center');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push(`Campus Readiness: ${pct(s.avgReadiness||0)}%`);
  lines.push(`Buildings Tracked: ${s.total||0}`);
  lines.push(`Ready: ${readyBuildings()} | Watch: ${watchBuildings()} | Critical: ${criticalBuildings()}`);
  lines.push(`Open Risks: ${Math.round(s.risks||0)} | Open Questions: ${Math.round(s.questions||0)}`);
  lines.push('');
  lines.push('BUILDING ROLLUP');
  lines.push('Building | Readiness | Status | Risks | Questions | Shutdowns | Construction Ready | Acceptance');
  lines.push('---------|-----------|--------|-------|-----------|-----------|--------------------|-----------');
  [...data.buildings].sort((a,b)=>String(a.Building).localeCompare(String(b.Building),undefined,{numeric:true})).forEach(b=>{
    lines.push(`${reportBuildingLabel(b)} | ${pct(b.readinessPct||0)}% | ${b['Overall Status']||b['Dashboard Signal']||'Monitor'} | ${b['Open Risks']||0} | ${b['Open Questions']||0} | ${b.Shutdowns||0} | ${b['Construction Ready']||'No'} | ${b['Acceptance Status']||'Monitor'}`);
  });
  lines.push('');
  lines.push('TOP RISK BUILDINGS');
  topBuildingsBy('Open Risks',8).forEach(b=>lines.push(`${reportBuildingLabel(b)}: ${b['Open Risks']||0} risks · ${pct(b.readinessPct||0)}% ready · ${b['Overall Status']||'Monitor'}`));
  lines.push('');
  lines.push('TOP QUESTION BUILDINGS');
  topBuildingsBy('Open Questions',8).forEach(b=>lines.push(`${reportBuildingLabel(b)}: ${b['Open Questions']||0} questions · ${pct(b.readinessPct||0)}% ready · ${b['Overall Status']||'Monitor'}`));
  return lines.join('\n');
}
function reportText(type=activeReportType){
  if(type==='all') return allBuildingsReportText();
  const s=data.stats||{}; const b=selectedBuilding()||{};
  const label=type==='executive'?'Executive':type==='field'?'Field':'Daily';
  const action=b['Next Action']||b['Major Blocker']||'Maintain monitoring and verify during next field walk.';
  const base=`Mission PMIS ${label} Report\nBedford VA Medical Center\nGenerated: ${new Date().toLocaleString()}\n\nCampus Readiness: ${pct(s.avgReadiness||0)}%\nBuildings Tracked: ${s.total||0}\nReady: ${readyBuildings()}\nWatch: ${watchBuildings()}\nCritical: ${criticalBuildings()}\nOpen Risks: ${Math.round(s.risks||0)}\nOpen Questions: ${Math.round(s.questions||0)}\n\nSelected Building: ${reportBuildingLabel(b)}\nReadiness: ${pct(b.readinessPct||0)}%\nStatus: ${b['Overall Status']||b['Dashboard Signal']||'Monitor'}\nConstruction Ready: ${b['Construction Ready']||'No'}\nAcceptance: ${b['Acceptance Status']||'Monitor'}\nRisks: ${b['Open Risks']||0}\nQuestions: ${b['Open Questions']||0}\nShutdowns: ${b.Shutdowns||0}\n\nPrimary Action: ${action}`;
  if(type==='executive') return base+`\n\nExecutive Focus:\n- Confirm buildings with critical risk posture.\n- Drive closure of high-risk open questions.\n- Use selected building status for meeting talking points.`;
  if(type==='field') return base+`\n\nField Walk Focus:\n- Verify readiness conditions in the selected building.\n- Capture photos for open conditions.\n- Update risk/question status in the Excel assessment source sheet.`;
  return base+`\n\nDaily Focus:\n- Review campus readiness.\n- Walk the selected building.\n- Close or update open risks/questions before end of day.`;
}
function setReportType(type){activeReportType=type;renderReportsMode();}
function reportBuildingRows(limit=null){
  const rows = [...data.buildings].sort((a,b)=>String(a.Building).localeCompare(String(b.Building),undefined,{numeric:true}));
  return (limit ? rows.slice(0,limit) : rows)
    .map(b=>{
      const cls=statusClass(b);
      return `<tr><td><span class="report-health-dot ${cls}"></span><b>${esc(reportBuildingLabel(b))}</b></td><td>${pct(b.readinessPct||0)}%</td><td>${esc(b['Overall Status']||b['Dashboard Signal']||'Monitor')}</td><td>${esc(b['Open Risks']||0)}</td><td>${esc(b['Open Questions']||0)}</td><td>${esc(b.Shutdowns||0)}</td></tr>`;
    }).join('');
}
function renderReportsMode(){
  const s=data.stats||{}; const b=selectedBuilding()||{}; const el=document.getElementById('reportsContent'); if(!el) return;
  const action=b['Next Action']||b['Major Blocker']||'Continue field verification and update assessment source sheet.';
  const selectedNote=`${esc(reportBuildingLabel(b))} is ${pct(b.readinessPct||0)}% ready with ${esc(b['Open Risks']||0)} risks and ${esc(b['Open Questions']||0)} open questions. Current focus: ${esc(action)}`;
  el.innerHTML=`
    <div class="report-workspace">
      <aside class="report-side">
        <div class="report-side-title">Report Type</div>
        <div class="report-type-grid">
          <div class="report-type ${activeReportType==='daily'?'active':''}" onclick="setReportType('daily')"><strong>Daily Command Report</strong><span>Morning sync, PMIS posture, and selected building action.</span></div>
          <div class="report-type ${activeReportType==='executive'?'active':''}" onclick="setReportType('executive')"><strong>Executive Summary</strong><span>Leadership-ready campus posture and decision focus.</span></div>
          <div class="report-type ${activeReportType==='field'?'active':''}" onclick="setReportType('field')"><strong>Field Walk Brief</strong><span>Site-walk oriented inspection notes and action checklist.</span></div>
          <div class="report-type ${activeReportType==='all'?'active':''}" onclick="setReportType('all')"><strong>All Buildings Report</strong><span>Campus-wide building rollup for printing or PDF export.</span></div>
        </div>
        <div class="report-print-note">Use <b>Print All Buildings</b> for the full campus report. In the print dialog, choose “Save as PDF” if you want a shareable file.</div>
      </aside>
      <main>
        <div class="report-kpis">
          <div class="report-kpi"><span>Readiness</span><strong>${pct(s.avgReadiness||0)}%</strong></div>
          <div class="report-kpi"><span>Ready</span><strong>${readyBuildings()}</strong></div>
          <div class="report-kpi"><span>Risks</span><strong>${Math.round(s.risks||0)}</strong></div>
          <div class="report-kpi"><span>Questions</span><strong>${Math.round(s.questions||0)}</strong></div>
        </div>
        <div class="report-grid">
          <div class="report-card"><h3>${activeReportType==='all'?'All Buildings Report Preview':'Current Report Preview'}</h3><div class="report-preview">${esc(reportText(activeReportType))}</div></div>
          <div class="report-card"><h3>Selected Building Talking Point</h3><div class="report-note">${selectedNote}</div><h3 style="margin-top:16px">Campus Building Rollup</h3><table class="report-building-table"><thead><tr><th>Building</th><th>Ready</th><th>Status</th><th>Risks</th><th>Q's</th><th>SD</th></tr></thead><tbody>${reportBuildingRows(activeReportType==='all'?null:12)}</tbody></table></div>
        </div>
      </main>
    </div>`;
}
function openReportsMode(){renderReportsMode();document.getElementById('reportOverlay')?.classList.add('show');}
function closeReportsMode(){document.getElementById('reportOverlay')?.classList.remove('show');}

function printHtmlDocument(title, bodyHtml, options={}){
  const w=window.open('', '_blank');
  if(!w){ alert('Your browser blocked the report window. Allow popups for this site, then select Print again.'); return; }
  const reportType=options.reportType||title;
  const preparedBy=options.preparedBy||'GCC Owner QA/QC Team';
  const generated=new Date().toLocaleString();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    @page{size:letter portrait;margin:18mm 14mm 18mm 14mm}
    *{box-sizing:border-box}html,body{background:#fff;color:#172033}body{font-family:Arial,Helvetica,sans-serif;margin:0;line-height:1.42;font-size:10.5pt}
    .print-shell{max-width:100%;margin:0 auto}.print-header{border-bottom:3px solid #17365d;padding:0 0 10px;margin:0 0 16px;display:flex;justify-content:space-between;gap:18px;align-items:flex-end}
    .brand{font-size:9pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2f75b5}.print-header h1{font-size:20pt;line-height:1.08;margin:3px 0 2px;color:#17365d}.subtitle{font-size:10pt;color:#53657a}.header-meta{text-align:right;font-size:8.5pt;color:#53657a;white-space:nowrap}
    h2{font-size:13pt;color:#17365d;margin:20px 0 8px;border-bottom:1px solid #aebdcb;padding-bottom:4px;break-after:avoid-page}h3{font-size:11pt;margin:14px 0 6px;break-after:avoid-page}
    p,li{orphans:3;widows:3}.friendly-note{background:#f3f7fb;border-left:4px solid #2f75b5;padding:10px 12px;margin:10px 0 14px;border-radius:0 6px 6px 0}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0 18px}.kpi{border:1px solid #b8c5d2;padding:9px 10px;border-radius:7px;background:#f8fafc;break-inside:avoid}.kpi span{display:block;font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#65788e}.kpi b{display:block;font-size:17pt;color:#17365d;margin-top:2px}
    table{width:100%;border-collapse:collapse;font-size:8.4pt;margin:6px 0 14px;table-layout:auto}thead{display:table-header-group}tr{break-inside:avoid-page}th,td{border:1px solid #cfd8e2;padding:5px 6px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#eaf0f6;color:#17365d;font-size:7.4pt;text-transform:uppercase;letter-spacing:.04em}.section{break-inside:auto}.section.page-break{break-before:page}.avoid-break{break-inside:avoid-page}
    .empty{color:#68798b;font-style:italic;padding:8px 0}.status-line{font-size:9pt;color:#53657a;margin:0 0 10px}.report-pre{white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:10pt;margin:0}
    .print-footer{position:fixed;bottom:-12mm;left:0;right:0;border-top:1px solid #aebdcb;padding-top:4px;font-size:7.5pt;color:#65788e;display:flex;justify-content:space-between}.screen-only{display:none!important}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-shell{width:100%}.print-header{margin-top:0}.no-print{display:none!important}}
  </style></head><body><div class="print-shell"><header class="print-header"><div><div class="brand">Mission PMIS</div><h1>${esc(reportType)}</h1><div class="subtitle">VA Bedford EHRM · Project 518-22-700</div></div><div class="header-meta">Generated: ${esc(generated)}<br>Prepared by: ${esc(preparedBy)}</div></header>${bodyHtml}<footer class="print-footer"><span>Mission PMIS · Owner Project Management Information System</span><span>Version 1.3.7</span></footer></div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));<\/script></body></html>`);
  w.document.close();
}
function printSelectedReport(){
  if(activeReportType==='all'){ printAllBuildingsReport(); return; }
  const b=selectedBuilding()||{};
  const typeLabel=activeReportType==='executive'?'Executive Summary':activeReportType==='field'?'Field Walk Brief':'Daily Command Report';
  const txt=reportText(activeReportType);
  const action=b['Next Action']||b['Major Blocker']||'Continue verification and update the source assessment as conditions develop.';
  const body=`<div class="friendly-note"><b>Current focus:</b> ${esc(action)}</div><section class="section"><h2>Report Narrative</h2><pre class="report-pre">${esc(txt)}</pre></section>`;
  printHtmlDocument(`Mission PMIS ${typeLabel}`,body,{reportType:typeLabel});
}
function printAllBuildingsReport(){
  const s=data.stats||{};
  const buildings=[...data.buildings].sort((a,b)=>String(a.Building).localeCompare(String(b.Building),undefined,{numeric:true}));
  const rows=buildings.map(b=>`<tr><td><b>${esc(reportBuildingLabel(b))}</b></td><td>${pct(b.readinessPct||0)}%</td><td>${esc(b['Overall Status']||b['Dashboard Signal']||'Monitor')}</td><td>${esc(b['Open Risks']||0)}</td><td>${esc(b['Open Questions']||0)}</td><td>${esc(b.Shutdowns||0)}</td><td>${esc(b['Construction Ready']||'No')}</td><td>${esc(b['Acceptance Status']||'Monitor')}</td><td>${esc(b['Next Action']||b['Major Blocker']||'Continue monitoring.')}</td></tr>`).join('');
  const topRisks=topBuildingsBy('Open Risks',8).filter(b=>Number(b['Open Risks']||0)>0).map(b=>`<li><b>${esc(reportBuildingLabel(b))}</b> — ${esc(b['Open Risks']||0)} open risk${Number(b['Open Risks']||0)===1?'':'s'}; ${pct(b.readinessPct||0)}% ready.</li>`).join('')||'<li>No open building risks are currently reported.</li>';
  const topQs=topBuildingsBy('Open Questions',8).filter(b=>Number(b['Open Questions']||0)>0).map(b=>`<li><b>${esc(reportBuildingLabel(b))}</b> — ${esc(b['Open Questions']||0)} open question${Number(b['Open Questions']||0)===1?'':'s'}; ${pct(b.readinessPct||0)}% ready.</li>`).join('')||'<li>No open building questions are currently reported.</li>';
  const body=`<div class="friendly-note">This report provides a campus-wide operational snapshot. Detailed conditions remain controlled by the building assessment sheets and supporting registers.</div><div class="kpis"><div class="kpi"><span>Campus Readiness</span><b>${pct(s.avgReadiness||0)}%</b></div><div class="kpi"><span>Buildings Tracked</span><b>${s.total||buildings.length||0}</b></div><div class="kpi"><span>Open Risks</span><b>${Math.round(s.risks||0)}</b></div><div class="kpi"><span>Open Questions</span><b>${Math.round(s.questions||0)}</b></div></div><section class="section"><h2>Building Readiness Rollup</h2><table><thead><tr><th>Building</th><th>Ready</th><th>Status</th><th>Risks</th><th>Questions</th><th>Shutdowns</th><th>Construction Ready</th><th>Acceptance</th><th>Primary Action</th></tr></thead><tbody>${rows}</tbody></table></section><section class="section page-break"><h2>Management Attention</h2><h3>Highest Open Risk Counts</h3><ol>${topRisks}</ol><h3>Highest Open Question Counts</h3><ol>${topQs}</ol></section>`;
  printHtmlDocument('Mission PMIS All Buildings Report', body,{reportType:'All Buildings Status Report'});
}

window.printHtmlDocument=printHtmlDocument;

async function copyReportsBrief(){
  const txt=reportText(activeReportType);
  try{await navigator.clipboard.writeText(txt);}catch(e){const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
  const c=document.getElementById('reportsCopyStatus'); if(c){c.style.display='block'; setTimeout(()=>c.style.display='none',1800);}
}
const reportOverlay=document.getElementById('reportOverlay'); if(reportOverlay) reportOverlay.addEventListener('click',e=>{if(e.target===reportOverlay) closeReportsMode();});
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeReportsMode();});
const renderAll_107 = renderAll;
renderAll = function(reset=true){renderAll_107(reset); if(document.getElementById('reportOverlay')?.classList.contains('show')) renderReportsMode();};

// 1.0.8 overlay cleanup: click outside a board closes the active mode without touching workbook logic.
['meetingOverlay','engineeringOverlay','reportOverlay'].forEach(id=>{
  const el=document.getElementById(id);
  if(el){ el.addEventListener('click', ev=>{ if(ev.target===el){ el.classList.remove('show'); } }); }
});
