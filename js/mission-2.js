(function(){
'use strict';
const VERSION='2.0.0';
const $=id=>document.getElementById(id);
const esc2=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Number(v)||0;
const hasWorkbook=()=>Array.isArray(window.data?.buildings)&&window.data.buildings.length>0;
const buildingKey=b=>String(b?.Building??'').trim();
const selectedB=()=>typeof window.selectedBuilding==='function'?window.selectedBuilding():(window.data?.buildings||[])[0]||{};
function updateShellState(){
  document.body.classList.toggle('no-workbook',!hasWorkbook());
  const status=$('productGateStatus');
  if(status) status.textContent=hasWorkbook()?'Workbook loaded. Preparing workspace…':'No workbook loaded. Your data stays on this computer.';
  const source=$('sourceStatus');
  if(source&&!hasWorkbook()) source.textContent='No workbook loaded.';
  renderProductHealth();
}
function openPicker(){ $('workbookInput')?.click(); }
window.openMissionWorkbookPicker=openPicker;
function addGate(){
  const gate=document.createElement('div');gate.id='productGate';gate.className='product-gate';gate.innerHTML=`<div class="product-gate-card"><img class="product-gate-logo" src="assets/mission_pmis_icon.png" alt="Mission PMIS"><div class="product-badge">Owner Project Management Information System</div><h1>Mission PMIS</h1><p class="tagline">Open a project workbook to begin.</p><button class="load-primary" type="button" onclick="openMissionWorkbookPicker()">Load Project Workbook</button><div id="productDrop" class="drop-message">Drag a compatible Excel PMIS workbook here</div><div id="productGateStatus" class="gate-error"></div><div class="product-meta"><span>Version ${VERSION}</span><span>Local browser processing</span><span>Excel remains source of truth</span></div></div>`;
  document.body.appendChild(gate);
  ['dragenter','dragover'].forEach(ev=>gate.addEventListener(ev,e=>{e.preventDefault();gate.querySelector('.product-gate-card').style.borderColor='#55b8d9'}));
  gate.addEventListener('dragleave',()=>gate.querySelector('.product-gate-card').style.borderColor='');
  gate.addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f&&typeof window.loadWorkbookFile==='function')window.loadWorkbookFile(f);});
}
function addSearch(){
  const hero=document.querySelector('.hero');if(!hero)return;
  const box=document.createElement('div');box.className='global-command';box.innerHTML='<input id="globalSearch" placeholder="Search buildings, rooms, records, shutdowns…" aria-label="Global search"><button type="button" id="globalSearchButton">Search</button>';
  hero.insertBefore(box,hero.querySelector('.selector-card'));
  const pop=document.createElement('div');pop.id='globalSearchResults';pop.className='search-results-popover';document.body.appendChild(pop);
  $('globalSearchButton').onclick=runGlobalSearch;$('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')runGlobalSearch();if(e.key==='Escape')pop.classList.remove('show')});
}
function searchCorpus(q){
  q=q.toLowerCase().trim();if(!q)return[];const out=[];
  (window.data?.buildings||[]).forEach(b=>{const hay=Object.values(b).join(' ').toLowerCase();if(hay.includes(q))out.push({type:'Building',title:`Building ${buildingKey(b)}`,sub:`${b['Overall Status']||'Status not set'} · ${Math.round(num(b.readinessPct)*100)}% ready`,building:buildingKey(b)})});
  (window.data?.projectRegister||[]).forEach(r=>{const hay=Object.values(r).join(' ').toLowerCase();if(hay.includes(q))out.push({type:r['Record Type']||'Project Record',title:r.Title||r['Record ID']||'Project record',sub:`${r.Building||'All buildings'} · ${r.Status||'Status not set'} · ${r['Assigned To']||''}`,building:String(r.Building||'')})});
  (window.data?.shutdowns||[]).forEach(r=>{const hay=Object.values(r).join(' ').toLowerCase();if(hay.includes(q))out.push({type:'Shutdown',title:r.Title||r.Description||r['Shutdown ID']||'Shutdown',sub:`${r.Building||'Campus'} · ${r.Status||'Status not set'}`,building:String(r.Building||'')})});
  return out.slice(0,40);
}
function runGlobalSearch(){
  const q=$('globalSearch')?.value||'';const results=searchCorpus(q);const pop=$('globalSearchResults');if(!pop)return;
  pop.innerHTML=`<div class="search-results-head"><b>${results.length} result${results.length===1?'':'s'} for “${esc2(q)}”</b><button onclick="document.getElementById('globalSearchResults').classList.remove('show')">×</button></div>`+(results.length?results.map((r,i)=>`<button class="search-result" data-search-index="${i}"><strong>${esc2(r.type)} · ${esc2(r.title)}</strong><span>${esc2(r.sub)}</span></button>`).join(''):'<div class="search-empty">No matching project information was found.</div>');
  pop.classList.add('show');pop.querySelectorAll('[data-search-index]').forEach(btn=>btn.onclick=()=>openSearchResult(results[Number(btn.dataset.searchIndex)]));
}
function openSearchResult(r){
  $('globalSearchResults')?.classList.remove('show');if(r.building&&r.building!=='ALL'){const select=$('buildingSelect');if(select){const opt=[...select.options].find(o=>String(o.value)===String(r.building));if(opt){select.value=opt.value;select.dispatchEvent(new Event('change'));}}}
  openBuildingWorkspace(r.type==='Shutdown'?'shutdowns':r.type==='Building'?'overview':'project');
}
function healthState(value,good,watch){return value<=good?['Good','health-good']:value<=watch?['Watch','health-watch']:['Attention','health-critical']}
function renderProductHealth(){
  const host=$('productHealth');if(!host||!hasWorkbook()){if(host)host.innerHTML='';return}
  const s=window.data.stats||{};const reg=window.data.projectRegister||[];const shuts=window.data.shutdowns||[];
  const openReg=reg.filter(r=>!['complete','closed'].includes(String(r.Status||'').toLowerCase()));
  const overdue=openReg.filter(r=>r['Days to Due']!==''&&num(r['Days to Due'])<0).length;
  const openShutdowns=shuts.filter(r=>!['complete','closed','cancelled'].includes(String(r.Status||'').toLowerCase())).length;
  const items=[
    ['Quality',num(s.risks),...healthState(num(s.risks),0,5),`${Math.round(num(s.risks))} open risk(s)`],
    ['Schedule',overdue,...healthState(overdue,0,3),`${overdue} overdue management item(s)`],
    ['Documentation',openReg.length,...healthState(openReg.length,5,15),`${openReg.length} active register item(s)`],
    ['Shutdown Coordination',openShutdowns,...healthState(openShutdowns,0,4),`${openShutdowns} active shutdown(s)`],
    ['Questions',num(s.questions),...healthState(num(s.questions),0,8),`${Math.round(num(s.questions))} open question(s)`],
    ['Readiness',100-Math.round(num(s.avgReadiness)*100),Math.round(num(s.avgReadiness)*100)>=80?'Good':'Watch',Math.round(num(s.avgReadiness)*100)>=80?'health-good':'health-watch',`${Math.round(num(s.avgReadiness)*100)}% campus readiness`],
    ['Commissioning',reg.filter(r=>String(r['Record Type']).toLowerCase().includes('commission')).length,'Monitor','health-neutral','Based on Project Register'],
    ['Cost',reg.filter(r=>String(r['Cost Impact']).toLowerCase()==='confirmed').length,'Monitor','health-neutral','Confirmed impacts from Project Register']
  ];
  host.innerHTML=`<div class="health-head"><div><div class="product-badge">Owner's View</div><h2>Project Health</h2></div><span class="mini">Select an area to review supporting information</span></div><div class="health-grid">${items.map(x=>`<div class="health-card" onclick="openHealthArea('${esc2(x[0])}')"><div class="health-name">${esc2(x[0])}</div><div class="health-status"><i class="health-dot ${x[3]}"></i>${esc2(x[2])}</div><div class="health-evidence">${esc2(x[4])}</div></div>`).join('')}</div>`;
}
window.openHealthArea=function(name){if(name==='Shutdown Coordination')openBuildingWorkspace('shutdowns');else if(['Documentation','Schedule','Commissioning','Cost'].includes(name))openBuildingWorkspace('project');else if(name==='Questions'&&typeof window.navigateToSection==='function')window.navigateToSection('questions');else openBuildingWorkspace('overview')};
function addProductHealth(){const section=document.createElement('section');section.id='productHealth';section.className='product-health';const layout=document.querySelector('.layout');layout?.parentNode.insertBefore(section,layout)}
function matchingBuilding(v,b){const x=String(v||'').replace(/^B/i,'').replace(/^0+/,'');const y=String(buildingKey(b)||'').replace(/^B/i,'').replace(/^0+/,'');return !v||v==='ALL'||x===y}
function table(records,cols){if(!records.length)return'<div class="workspace-empty">No matching records are currently reported.</div>';return `<table class="workspace-table"><thead><tr>${cols.map(c=>`<th>${esc2(c[0])}</th>`).join('')}</tr></thead><tbody>${records.map(r=>`<tr>${cols.map(c=>`<td>${esc2(typeof c[1]==='function'?c[1](r):r[c[1]])}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function renderWorkspace(tab){
  const b=selectedB(),key=buildingKey(b),reg=(window.data.projectRegister||[]).filter(r=>matchingBuilding(r.Building,b)),sh=(window.data.shutdowns||[]).filter(r=>matchingBuilding(r.Building,b));const body=$('workspaceBody');if(!body)return;
  const overview=`<div class="workspace-summary"><div class="workspace-stat"><span>Readiness</span><b>${Math.round(num(b.readinessPct)*100)}%</b></div><div class="workspace-stat"><span>Open Risks</span><b>${num(b['Open Risks'])}</b></div><div class="workspace-stat"><span>Open Questions</span><b>${num(b['Open Questions'])}</b></div><div class="workspace-stat"><span>Shutdowns</span><b>${sh.length}</b></div></div><div class="workspace-card"><h3>Building Status</h3><p>${esc2(b['Overall Status']||b['Dashboard Signal']||'No overall status has been entered.')}</p><p><b>Next action:</b> ${esc2(b['Next Action']||b['Major Blocker']||'Continue assessment and coordination.')}</p></div>`;
  const project=table(reg,[['ID','Record ID'],['Type','Record Type'],['Title','Title'],['Owner','Assigned To'],['Priority','Priority'],['Status','Status'],['Due','Due Date']]);
  const shutdowns=table(sh,[['ID',r=>r['Shutdown ID']||r.ID],['Title',r=>r.Title||r.Description],['Building','Building'],['Status','Status'],['Date',r=>r['Scheduled Date']||r.Date],['Operational Impact',r=>r['Operational Impact']||r.Impact]]);
  const assessment=`<div class="workspace-card"><h3>Assessment Summary</h3><p>Source sheet: ${esc2(b.Sheet||'Not identified')}</p><p>Construction ready: <b>${esc2(b['Construction Ready']||'Not reported')}</b></p><p>Acceptance: <b>${esc2(b['Acceptance Status']||'Not reported')}</b></p></div>`;
  const notes=window.data.tradeNotes?.[key]||{};const systems=Object.entries(notes).filter(([,v])=>v).map(([k,v])=>`<div class="workspace-card"><h3>${esc2(k)}</h3><p>${esc2(v)}</p></div>`).join('')||'<div class="workspace-empty">No trade notes are currently reported for this building.</div>';
  const map={overview,assessment,project:`<div class="workspace-card"><h3>Project Register</h3>${project}</div>`,shutdowns:`<div class="workspace-card"><h3>Shutdown Coordination</h3>${shutdowns}</div>`,systems,documents:'<div class="workspace-empty">Document workspace will display linked Document Register records when document-level mapping is included in the loaded workbook.</div>',photos:'<div class="workspace-empty">Photo workspace will display linked evidence when photo paths are included in the loaded workbook.</div>'};body.innerHTML=map[tab]||overview;
}
function addWorkspace(){
  const el=document.createElement('div');el.id='buildingWorkspace';el.className='workspace-overlay';el.innerHTML=`<div class="workspace-board"><div class="workspace-top"><div><div class="product-badge">Building Workspace</div><h2 id="workspaceTitle">Selected Building</h2><p>One coordinated view of assessment, management, and operational records.</p></div><button class="workspace-close" onclick="closeBuildingWorkspace()">Close</button></div><div class="workspace-tabs">${[['overview','Overview'],['assessment','Assessment'],['systems','Systems'],['project','Project Register'],['shutdowns','Shutdowns'],['documents','Documents'],['photos','Photos']].map(x=>`<button class="workspace-tab" data-workspace-tab="${x[0]}">${x[1]}</button>`).join('')}</div><div id="workspaceBody" class="workspace-body"></div></div>`;document.body.appendChild(el);el.querySelectorAll('[data-workspace-tab]').forEach(btn=>btn.onclick=()=>{el.querySelectorAll('.workspace-tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderWorkspace(btn.dataset.workspaceTab)});el.addEventListener('click',e=>{if(e.target===el)closeBuildingWorkspace()});
}
window.openBuildingWorkspace=function(tab='overview'){if(!hasWorkbook())return;const el=$('buildingWorkspace');$('workspaceTitle').textContent=`Building ${buildingKey(selectedB())||'Workspace'}`;el.classList.add('show');const btn=el.querySelector(`[data-workspace-tab="${tab}"]`)||el.querySelector('[data-workspace-tab="overview"]');btn.click()};window.closeBuildingWorkspace=()=>$('buildingWorkspace')?.classList.remove('show');
function enhanceReports(){
  if(typeof window.renderReportsMode!=='function')return;const old=window.renderReportsMode;window.renderReportsMode=function(){old();const host=$('reportsContent');if(!host||host.querySelector('.report-launch-grid'))return;const cards=document.createElement('div');cards.className='report-launch-grid';cards.innerHTML=`<div class="report-launch-card"><strong>Executive Brief</strong><span>Leadership-level status, health, and decisions.</span><button onclick="setReportType('executive');renderReportsMode()">Preview</button></div><div class="report-launch-card"><strong>COR Report</strong><span>Accordion briefing generated from source registers.</span><button onclick="closeReportsMode();openCorReports()">Open</button></div><div class="report-launch-card"><strong>CM/PM Operations</strong><span>Management actions, schedule, shutdowns, and delivery.</span><button onclick="setReportType('daily');renderReportsMode()">Preview</button></div><div class="report-launch-card"><strong>Building Report</strong><span>Selected-building readiness and owner action.</span><button onclick="openBuildingWorkspace('overview')">Open Workspace</button></div><div class="report-launch-card"><strong>Shutdown Report</strong><span>Operational shutdown coordination records.</span><button onclick="openBuildingWorkspace('shutdowns')">Open Workspace</button></div><div class="report-launch-card"><strong>All Buildings</strong><span>Campus-wide readiness and management attention.</span><button onclick="printAllBuildingsReport()">Print / PDF</button></div>`;host.prepend(cards)};
}
function addWorkspaceButton(){const detail=document.querySelector('.detail-panel');if(!detail)return;const btn=document.createElement('button');btn.type='button';btn.className='brief-btn';btn.style.cssText='margin:12px;width:calc(100% - 24px)';btn.textContent='Open Building Workspace';btn.onclick=()=>openBuildingWorkspace('overview');detail.prepend(btn)}
function neutralizeBranding(){document.querySelector('.hero .eyebrow').textContent='OWNER PROJECT MANAGEMENT INFORMATION SYSTEM';const launch=$('launchOverlay');if(launch)launch.style.display='none';const about=document.querySelector('#aboutOverlay .about-grid');if(about)about.innerHTML=`<div class="about-item"><span>Version</span><strong>${VERSION}</strong></div><div class="about-item"><span>Product</span><strong>Mission PMIS</strong></div><div class="about-item"><span>Backend</span><strong>Excel project workbook</strong></div><div class="about-item"><span>Processing</span><strong>Local browser mode</strong></div>`}
function installHooks(){
  const oldRender=window.renderAll;if(typeof oldRender==='function')window.renderAll=function(reset=true){oldRender(reset);updateShellState()};
  const input=$('workbookInput');input?.addEventListener('change',()=>setTimeout(updateShellState,500));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('globalSearchResults')?.classList.remove('show');closeBuildingWorkspace()}});
}
function init(){addGate();addSearch();addProductHealth();addWorkspace();addWorkspaceButton();neutralizeBranding();enhanceReports();installHooks();updateShellState()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
