(() => {
  'use strict';
  const bilingual = [...document.querySelectorAll('[data-zh]')].map(node => ({node,en:node.innerHTML,zh:node.dataset.zh}));
  let language = new URLSearchParams(location.search).get('lang') === 'zh-CN' ? 'zh-CN' : 'en';
  const languageButton = document.getElementById('language');
  let refreshControls = () => {};
  function applyLanguage() {
    const isZh = language === 'zh-CN';
    for (const {node,en,zh} of bilingual) node.innerHTML = isZh ? zh : en;
    document.documentElement.lang = language;
    document.title = isZh ? '从人耳感知重新思考声音克隆保护 · 刘宇轩' : 'Voice Cloning Protection Through Human Perception · Yuxuan Liu';
    languageButton.textContent = isZh ? 'EN' : '中文';
    languageButton.setAttribute('aria-label',isZh ? 'Switch to English' : '切换到中文');
    const url = new URL(location.href);
    if(isZh) url.searchParams.set('lang','zh-CN'); else url.searchParams.delete('lang');
    history.replaceState(null,'',url);
    document.querySelectorAll('[data-home],[data-home-projects]').forEach(a => {
      const target = new URL(a.hasAttribute('data-home-projects') ? '../#demos' : '../',location.href);
      if(isZh) target.searchParams.set('lang','zh-CN');
      a.href = target.href;
    });
    refreshControls();
    document.dispatchEvent(new CustomEvent('cloneblock:languagechange',{detail:{language}}));
  }
  languageButton.addEventListener('click',()=>{language=language==='en'?'zh-CN':'en';applyLanguage();});
  document.querySelectorAll('audio,video').forEach(media => {
    media.addEventListener('play',()=>document.querySelectorAll('audio,video').forEach(other=>{if(other!==media) other.pause();}));
    media.addEventListener('error',()=>{
      if(media.parentNode.querySelector('.media-error')) return;
      const p=document.createElement('p');p.className='media-error';
      const a=document.createElement('a');a.href=media.querySelector('source')?.src||media.src;
      a.textContent=language==='zh-CN'?'打开原始媒体文件':'Open the media file';p.append(a);media.after(p);
    });
  });
  document.querySelectorAll('input[name="condition-state"]').forEach(radio=>radio.addEventListener('change',()=>{
    if(!radio.checked) return;
    for(const model of ['openvoice','freevc']) {
      const img=document.getElementById(`condition-${model}`);
      img.src=`assets/perception/figures/${model}_${radio.value}_256.png`;
      img.alt=`${model==='openvoice'?'OpenVoice':'FreeVC'} ${radio.value} condition, 256 numerical values`;
    }
  }));
  applyLanguage();
  const holder=document.getElementById('six-controls'),canvas=document.getElementById('mixture-wave'),reset=document.getElementById('reset-weights');
  fetch('assets/perception/smalldata.json').then(response=>{if(!response.ok) throw new Error('Visual data unavailable');return response.json();}).then(data=>{
    const basis=data.basis_columns,saved=data.coefficients;
    if(basis?.length!==6||saved?.length!==6||basis.some(col=>col.length!==data.time_s.length)) throw new Error('Invalid visual data');
    const weights=[...saved],labels=['OV low','OV mid','OV high','FVC low','FVC mid','FVC high'],chinese=['OV 低频','OV 中频','OV 高频','FVC 低频','FVC 中频','FVC 高频'];
    const inputs=[],outputs=[],names=[],radius=Number(data.radius);
    const maxScale=Math.max(...data.time_s.map((_,n)=>basis.reduce((sum,col)=>sum+Math.abs(col[n])*radius*2,0)),1e-12);
    function draw(){
      const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(150*dpr);
      const ctx=canvas.getContext('2d');if(!ctx) return;ctx.scale(dpr,dpr);
      const width=rect.width,left=8,right=width-8,top=24,bottom=122,center=(top+bottom)/2;
      ctx.clearRect(0,0,width,150);ctx.strokeStyle='#ccd8d4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,center);ctx.lineTo(right,center);ctx.stroke();
      ctx.strokeStyle='#087c82';ctx.lineWidth=1.5;ctx.beginPath();
      data.time_s.forEach((_,n)=>{
        const value=basis.reduce((sum,col,j)=>sum+weights[j]*col[n],0)*radius;
        const x=left+(right-left)*n/(data.time_s.length-1),y=center-value/maxScale*(bottom-top)/2;
        if(n===0) ctx.moveTo(x,y);else ctx.lineTo(x,y);
      });ctx.stroke();ctx.font='11px Arial';ctx.fillStyle='#50616d';
      ctx.fillText(language==='zh-CN'?'扰动组合预览（固定纵轴）':'Perturbation mixture (fixed scale)',left,15);
      ctx.fillText('0 s',left,144);ctx.textAlign='right';ctx.fillText(`${data.original_duration_s.toFixed(2)} s`,right,144);ctx.textAlign='left';
    }
    saved.forEach((value,j)=>{
      const wrap=document.createElement('div');wrap.className='weight-control';
      const label=document.createElement('label');label.htmlFor=`weight-${j}`;
      const name=document.createElement('span'),output=document.createElement('output');output.htmlFor=`weight-${j}`;output.textContent=value.toFixed(2);label.append(name,output);
      const input=document.createElement('input');input.type='range';input.id=`weight-${j}`;input.min=String(Math.min(-2,Math.floor(value)));input.max=String(Math.max(2,Math.ceil(value)));input.step='0.01';input.value=String(value);
      input.addEventListener('input',()=>{weights[j]=Number(input.value);output.textContent=weights[j].toFixed(2);draw();});
      wrap.append(label,input);holder.append(wrap);inputs.push(input);outputs.push(output);names.push(name);
    });
    refreshControls=()=>{names.forEach((node,j)=>{node.textContent=language==='zh-CN'?chinese[j]:labels[j];});draw();};
    reset.addEventListener('click',()=>{saved.forEach((value,j)=>{weights[j]=value;inputs[j].value=String(value);outputs[j].textContent=value.toFixed(2);});draw();});
    window.addEventListener('resize',draw);refreshControls();
  }).catch(()=>{
    holder.className='knob-error';holder.textContent=language==='zh-CN'?'交互数据未能加载。下方试听不受影响。':'Interactive data could not load. The listening examples remain available.';
    canvas.hidden=true;reset.hidden=true;
  });
})();
