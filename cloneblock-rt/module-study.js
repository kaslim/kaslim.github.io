(() => {
  'use strict';
  const root=document.getElementById('module-attribution');
  if(!root) return;
  const base='assets/module-attribution-r1/';
  let dataset,selected='seedvc',metric='A';
  const validIds=[...root.querySelectorAll('[data-r1-model]')].map(b=>b.dataset.r1Model);
  const requested=new URLSearchParams(location.search).get('model');
  if(validIds.includes(requested)) selected=requested;
  const el=id=>document.getElementById(id);
  const isZh=()=>document.documentElement.lang==='zh-CN';
  const unknown=()=>isZh()?'未知':'Unknown';
  const range=(v)=>!v||v[0]===null?unknown():(v[0]===v[1]?String(v[0]):v[0]+'–'+v[1]);
  const cautionsZh={
    f5:'DiT 联合输入和主干输出均注入 32 次；不与单次参考条件或 Vocos 作贡献排名。40 格中 16 格的 A 方向在两编码器间相反。',
    qwen3:'Talker 实际注入 36–53 次，Subtalker 为 540–690 次。相同逐次强度不等于相同累计剂量；解码首层还包含参考前缀。',
    openvoice:'48 格中 24 格的 A 方向相反。54 个逻辑生成对应 50 份不同 PCM；源条件与目标条件不能混称同一身份模块。',
    cosy3:'生成 Mel / HiFT 的响应可能混入重建失真。当前运行未独立记录完整 ODE 步数及原生初态哈希，不能把该响应解释为纯身份贡献。',
    chatterbox:'T3 的 A1 是说话人投影与 173 行参考码嵌入组成的联合前缀。参考 Mel 的 8/8 格在两评价器中方向相反；重建变化也可能包含音质变化。',
    seedvc:'生成 Mel 有 1 格未通过内容门（WER 4/11），保留原点但均值仅用 7 格。当前未活跃的 narrow / AR 风格转换分支没有被测试。',
    voxcpm2:'第一种子的正常重复未复现，24 格探针被阻断，原因未知。结果仅来自第二种子，24 格中 16 格的 A 方向相反。C6 实际是首个 64→64 逐通道卷积。',
    fish_s2:'第一种子的正常重复未复现，24 格探针被阻断，原因未知。参考码嵌入在 10 张码本中分别扰动，组合后的总强度未知；快 LM 调用数也不等于被采样消费次数。',
    freevc:'加载阶段先后缺 torchvision 与 webrtcvad，没有生成任何克隆。这里展示已核对的架构与计划位置，所有模块效应均未知，不是零贡献。'
  };
  function buildTable(model){
    const body=el('r1-results-body');body.replaceChildren();
    model.sites.forEach(site=>{
      const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';
      const code=document.createElement('code');code.textContent=site.number;th.append(code,document.createTextNode(isZh()?site.name_zh:site.name_en));tr.append(th);
      const n=document.createElement('td');n.textContent=site.eligible_cells+' / '+site.planned_cells;tr.append(n);
      const calls=document.createElement('td');calls.textContent=range(site.actual_calls_range);tr.append(calls);
      ['D','A'].forEach(key=>{
        const td=document.createElement('td');
        ['ECAPA','Resemblyzer'].forEach(enc=>{
          const span=document.createElement('span'),value=site.metrics[enc][key].mean;
          span.textContent=value===null?unknown():value.toFixed(5);span.title=enc;
          if(value===null) span.className='r1-unknown';td.append(span);
        });tr.append(td);
      });body.append(tr);
    });
  }
  function render(){
    if(!dataset) return;
    const model=dataset.models.find(m=>m.id===selected),zh=isZh();
    root.querySelectorAll('input[name=r1-metric]').forEach(input=>{input.checked=input.value===metric;input.disabled=false;});
    root.querySelector('.r1-explorer').setAttribute('aria-busy','false');
    root.querySelectorAll('[data-r1-model]').forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed',String(b.dataset.r1Model===selected));});
    el('r1-model-name').textContent=model.name;
    const kind=model.kind==='VC'?'VC':(zh?'参考条件 TTS':'Reference-conditioned TTS');
    el('r1-model-status').textContent=zh?`${kind} · 实际生成 ${model.generation_actual}/${model.generation_planned} · 自动合格扰动 ${model.eligible_perturbations}/${model.planned_perturbations}`:`${kind} · ${model.generation_actual}/${model.generation_planned} generated · ${model.eligible_perturbations}/${model.planned_perturbations} automatically eligible`;
    el('r1-model-insight').textContent=zh?model.takeaway_zh:model.takeaway_en;
    el('r1-model-caution').textContent=zh?cautionsZh[selected]:model.caution_en;
    const architecture=base+'architectures/'+selected+'.svg';
    el('r1-architecture-link').href=architecture;el('r1-architecture-image').src=architecture;
    el('r1-architecture-image').alt=zh?model.name+' 原生架构与 R1 干预边界':model.name+' native architecture and R1 probe boundaries';
    const chart=base+'charts/'+selected+'-'+metric.toLowerCase()+'.svg';
    el('r1-chart-link').href=chart;el('r1-chart-image').src=chart;
    el('r1-chart-image').alt=model.name+(metric==='A'?' target-similarity drop A':' voice movement D')+' under ECAPA and Resemblyzer; eligible means, executed points and observed ranges';
    buildTable(model);
    const pages=model.report_pages;
    el('r1-data-status').textContent=zh?`来源：R1 完整实验报告，第 ${pages.results}–${pages.architecture} 页，2026-11-21。此轮未做人耳 / MOS；并非下方旧 OpenVoice 试听的同一实验。`:`Source: R1 complete report, pp. ${pages.results}–${pages.architecture}, 21 Nov 2026. No listening or MOS in this study; separate from the earlier OpenVoice audio below.`;
  }
  root.querySelectorAll('[data-r1-model]').forEach(button=>button.addEventListener('click',()=>{
    selected=button.dataset.r1Model;render();
    const url=new URL(location.href);url.searchParams.set('model',selected);history.replaceState(null,'',url);
  }));
  root.querySelectorAll('input[name=r1-metric]').forEach(input=>input.addEventListener('change',()=>{if(input.checked){metric=input.value;render();}}));
  document.addEventListener('cloneblock:languagechange',render);
  el('r1-data-status').textContent=isZh()?'正在载入已核对的数据…':'Loading verified data…';
  fetch(base+'results.json').then(response=>{if(!response.ok)throw new Error('Results unavailable');return response.json();}).then(data=>{
    if(data.schema!=='cloneblock_module_sensitivity_R1_public_v1'||data.models.length!==9)throw new Error('Invalid results');
    dataset=data;render();
  }).catch(()=>{
    root.querySelector('.r1-explorer').setAttribute('aria-busy','false');
    el('r1-data-status').textContent=isZh()?'交互数据暂未加载；可使用上方“全部九份架构与图表”查看完整静态结果。':'Interactive data could not load. Use “All nine architectures and charts” above for the complete static results.';
  });
})();
