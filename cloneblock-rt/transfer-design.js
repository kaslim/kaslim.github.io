(() => {
  'use strict';
  const root=document.getElementById('transfer-design');
  if(!root) return;
  const c=Math.sqrt(3)/2;
  const examples={
    aligned:{a:[c,-.5],b:[c,.5],receiver:[c,.1],direction:[1,0],gain:c,receiverGain:c,title:['A shared direction exists locally.','局部存在共同有利方向。'],body:['Both source-task responses have a rightward component. The same input step improves both linear scores. A receiver inside their convex hull inherits that linear margin in this idealized example.','两个源任务的有利响应都有向右分量。同一个输入步长能同时提高两者的线性分数。在这个理想示例中，位于源响应凸包内的接收模型也保留这份线性余量。']},
    conflict:{a:[1,0],b:[-1,0],receiver:null,direction:[0,0],gain:0,receiverGain:null,title:['Each source is sensitive; their directions conflict.','各自敏感，但有利方向相反。'],body:['One source improves to the right; the other improves to the left. The origin lies in their convex hull, so the best common linear gain is zero in this ball. This does not prove the nonlinear problem has no solution.','一个源任务向右改善，另一个向左改善。原点落在两者的凸包中，因此这个球内的最优共同线性收益为零。这不证明非线性问题不存在解。']},
    uncovered:{a:[c,-.5],b:[c,.5],receiver:[-.5,c],direction:[1,0],gain:c,receiverGain:-.5,title:['The sources agree; the receiver is not covered.','源侧一致，接收模型仍可能反向。'],body:['The source-optimal step still points right, but this receiver improves in a different direction. Its linear score falls. More source models alone do not guarantee coverage; the receiver relationship must be tested.','源侧最优步长仍向右，但接收模型的有利方向不同，其线性分数反而下降。仅增加源模型数量不保证覆盖，需要检验接收关系。']}
  };
  let selected='aligned';
  const el=id=>document.getElementById(id),zh=()=>document.documentElement.lang==='zh-CN';
  const point=v=>[270+v[0]*145,205-v[1]*145];
  function vector(id,value,labelId,label){
    const line=el(id),text=el(labelId);
    if(!value){line.setAttribute('visibility','hidden');text.setAttribute('visibility','hidden');return;}
    const [x,y]=point(value);line.setAttribute('visibility','visible');line.setAttribute('x2',x);line.setAttribute('y2',y);
    text.setAttribute('visibility','visible');text.textContent=label;
    const left=value[0]<-.2;text.setAttribute('text-anchor',left?'end':'start');text.setAttribute('x',x+(left?-12:12));
    text.setAttribute('y',y+(value[1]>.25?-10:20));
  }
  function render(){
    const e=examples[selected],i=zh()?1:0;
    root.querySelectorAll('[data-td-case]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tdCase===selected)));
    vector('td-source-a',e.a,'td-label-a',i?'源任务 1':'Source task 1');
    vector('td-source-b',e.b,'td-label-b',i?'源任务 2':'Source task 2');
    vector('td-receiver-vector',e.receiver,'td-label-receiver',i?'接收模型':'Receiver');
    vector('td-selected-step',selected==='conflict'?null:e.direction,'td-label-step',i?'共同步长 d':'Common step d');
    if(selected!=='conflict'){el('td-label-step').setAttribute('x','385');el('td-label-step').setAttribute('y','239');el('td-label-step').setAttribute('text-anchor','middle');}
    if(selected==='aligned'){el('td-label-receiver').setAttribute('y','180');}
    if(selected==='conflict'){el('td-label-a').setAttribute('y','185');el('td-label-b').setAttribute('y','185');}
    const p=point(e.a),q=point(e.b),hull=el('td-source-hull');hull.setAttribute('x1',p[0]);hull.setAttribute('y1',p[1]);hull.setAttribute('x2',q[0]);hull.setAttribute('y2',q[1]);
    el('td-case-title').textContent=e.title[i];el('td-case-body').textContent=e.body[i];
    el('td-common-value').textContent=e.gain.toFixed(3);
    el('td-receiver-value').textContent=e.receiverGain===null?'—':e.receiverGain.toFixed(3);
    el('td-receiver-value').className=e.receiverGain<0?'td-negative':'td-positive';
    el('td-geometry-description').textContent=e.title[i]+' '+e.body[i];
  }
  root.querySelectorAll('[data-td-case]').forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.tdCase;render();}));
  document.addEventListener('cloneblock:languagechange',render);
  render();
})();
