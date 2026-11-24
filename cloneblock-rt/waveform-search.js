(() => {
  'use strict';
  const root=document.getElementById('waveform-search');
  if(!root) return;
  const models={
    seedvc:{name:'Seed-VC',formula:'Cref(x) = {style vector, reference codes, reference Mel}',zh:'Cref(x) = {风格向量，参考码条件，参考 Mel}',focus:['R1 makes reference Mel A4 a candidate path to study. The same WAV also changes style and reference-code conditions; re-extract them together.','R1 让参考 Mel（A4）成为优先研究的候选路径。同一 WAV 也会改变风格与参考码条件，必须共同重提取。'],limit:['Source-content A3 is fixed. Generated Mel C5 is a downstream result, not a reference condition we can freely replace.','源内容 A3 保持固定。生成 Mel C5 是下游结果，不是可以自由替换的参考条件。']},
    f5:{name:'F5-TTS',formula:'Cref(x) = {reference Mel + native reference mask}',zh:'Cref(x) = {参考 Mel 及其原生参考区域组织}',focus:['F5 has no separate speaker vector. Its sensitive joint input B3 combines reference Mel with text and the current generation state.','F5 没有独立说话人向量。敏感的联合输入 B3 同时包含参考 Mel、文字和当前生成状态。'],limit:['Editing x changes the reference features; it does not grant independent control of text, the initial noise or the complete B3 tensor.','修改 x 可以改变参考特征，但不能独立控制文字、初始噪声或整个 B3 张量。']},
    qwen3:{name:'Qwen3-TTS',formula:'Cref(x) = {speaker g, reference codec Q + context}',zh:'Cref(x) = {说话人 g，参考 codec Q 及上下文}',focus:['Full ICL consumes both speaker and codec conditions. Re-read the same WAV for both, including the reference codes used in final decoding.','完整 ICL 同时使用说话人和 codec 条件。两者都要从同一 WAV 重读，最终解码所用参考码也须一致。'],limit:['The text projection stays fixed. Continuous changes before quantization do not guarantee changes in the actual reference tokens.','文本投影保持固定。量化前的连续变化，不保证实际参考 token 已发生变化。']},
    openvoice:{name:'OpenVoice',formula:'Cref(x) = {target speaker g: 256 values}',zh:'Cref(x) = {目标说话人 g：256 个数}',focus:['Target g enters the reverse Flow. In the fixed zero_g setting, its effect reaches the waveform generator through the converted latent.','目标 g 进入逆向 Flow。在固定 zero_g 设置下，它通过转换后的潜变量影响波形生成器。'],limit:['The other person’s source audio, source g and source posterior remain fixed. They are not editable through the target reference x.','另一人的源语音、源 g 与源后验保持固定，不能通过目标参考 x 直接修改。']},
    cosy3:{name:'CosyVoice 3',formula:'Cref(x) = {reference codes, normalized speaker condition, reference Mel}',zh:'Cref(x) = {参考码，归一化说话人条件，参考 Mel}',focus:['The LM and Flow consume different reference paths. Preserve the native normalization, masks and prompt organization when re-extracting the bundle.','LM 与 Flow 使用不同参考路径。重提取条件包时保留原生归一化、mask 与提示组织。'],limit:['R1 A4 perturbed the generated target region of the content condition. That region is downstream; it is not an independently editable reference input.','R1 的 A4 扰动的是内容条件中的目标生成区域。它属于下游响应，不是可独立编辑的参考输入。']},
    chatterbox:{name:'Chatterbox Turbo',formula:'Cref(x) = {T3 joint prefix, S3Gen speaker condition, reference Mel}',zh:'Cref(x) = {T3 联合前缀，S3Gen 说话人条件，参考 Mel}',focus:['T3 and S3Gen use different summaries of the same recording. A valid candidate must supply all of them through the normal WAV frontend.','T3 和 S3Gen 使用同一录音的不同摘要。合格候选必须经正常 WAV 前端同时产生这些条件。'],limit:['The joint prefix is not a pure speaker vector. R1 A4 changes the target content region; generated Mel and HiFT remain downstream.','联合前缀不是纯说话人向量。R1 的 A4 改变目标内容区域；生成 Mel 与 HiFT 都属于下游。']},
    voxcpm2:{name:'VoxCPM2',formula:'Cref(x) = {isolated-reference latents, continuation-reference latents}',zh:'Cref(x) = {独立参考潜变量，续写参考潜变量}',focus:['The same WAV forms two reference packages with different padding, masks and positions. They are coupled views of one recording.','同一 WAV 形成两份 padding、mask 和使用位置不同的参考包；它们是同一录音的耦合表示。'],limit:['Semantic/residual projections and local DiT are downstream responses. R1 retained only one seed, so no stable protection direction is established.','语义／残差投影和局部 DiT 都是下游响应。R1 只保留一个种子，尚未建立稳定保护方向。']},
    fish_s2:{name:'Fish Speech S2',formula:'Cref(x) = {actual discrete reference codes + native text context}',zh:'Cref(x) = {实际离散参考码及原生文字上下文}',focus:['A waveform change must survive the codec and its quantizer to alter the prompt actually consumed by the language model.','波形变化必须经过 codec 与量化器，才能改变语言模型实际读取的提示。'],limit:['Pre-quantization z is a proposal signal, not the consumed prompt itself. Fixed correct text cannot be changed to manufacture an effect.','量化前 z 是提案信号，不等于实际消费的提示。正确文字保持固定，不通过改文字制造效果。']},
    freevc:{name:'FreeVC',formula:'Cref(x) = {target speaker g: 256 values}',zh:'Cref(x) = {目标说话人 g：256 个数}',focus:['Static architecture: target g conditions both the reverse Flow and the waveform generator. Both branches must use the same re-read reference.','静态架构：目标 g 同时影响逆向 Flow 与波形生成器；两支路须使用同一份重读参考。'],limit:['R1 produced no FreeVC outputs. This describes a planned reference interface, not a measured sensitive path or a successful construction.','R1 没有生成 FreeVC 输出。这里描述计划中的参考接口，不是已测敏感路径或成功构造。']}
  };
  const stages=[
    {title:['Select a reference-controllable path.','选定参考录音可影响的路径。'],body:['Use the R1 map to nominate a path, then check effective condition changes through full generation. Keep the complete reference bundle Cref(x); do not turn every sensitive internal tensor into an editable input.','根据 R1 提名候选路径，再用完整生成校准哪些变化真正有效。保留完整参考条件包 Cref(x)，不把每个敏感中间张量都当成可编辑输入。'],lit:['condition']},
    {title:['Update the audio, not the model.','更新音频，不更新模型。'],body:['Search over δ while the original weights remain fixed. Gradient updates or structured directions can propose a waveform; amplitude and energy constraints limit engineering cost. Neither the optimizer nor the budget certifies normal listening.','模型权重保持固定，只搜索 δ。梯度更新或结构化方向可以提出波形候选；幅度与能量约束控制工程代价。优化器和数值预算都不能认证听感正常。'],lit:['wave']},
    {title:['Reload the real WAV and run the full cloner.','重读真实 WAV，运行完整克隆。'],body:['Save x′, reload it, and let the native frontend extract every reference condition again. Keep target text or source speech, seed and generation settings matched to the clean baseline. The final run does not inject replacement internal tensors.','保存并重读 x′，让原生前端重新提取全部参考条件。目标文字或源语音、种子和生成设置与正常基线匹配。最终验收不向内部注入替换张量。'],lit:['wave','condition','generator']},
    {title:['Accept only the complete input–output chain.','只按完整输入—输出链验收。'],body:['Check that x′ still sounds like the person, keeps the message and remains usable. First require a valid clean clone; then ask whether the protected clone really loses the target identity or shows a separately verified usability failure. Unheard candidates remain unknown.','检查 x′ 是否仍像本人、内容保持且正常可用。先确认正常克隆合格，再判断保护克隆是否真实失去目标身份，或出现单独验证的用途失败。未听候选保持未知。'],lit:['output']}
  ];
  let selected=new URLSearchParams(location.search).get('model')||'seedvc',step=0;
  if(!models[selected]) selected='seedvc';
  const el=id=>document.getElementById(id),zh=()=>document.documentElement.lang==='zh-CN';
  function render(){
    const isZh=zh(),m=models[selected],s=stages[step],i=isZh?1:0;
    el('wfs-model-name').textContent=m.name;
    el('wfs-condition-formula').textContent=isZh?m.zh:m.formula;
    el('wfs-model-focus').textContent=m.focus[i];el('wfs-path-limit').textContent=m.limit[i];
    el('wfs-step-number').textContent=String(step+1).padStart(2,'0');
    el('wfs-step-title').textContent=s.title[i];el('wfs-step-body').textContent=s.body[i];
    root.querySelectorAll('[data-wfs-stage]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.wfsStage)===step)));
    root.querySelectorAll('[data-wfs-node]').forEach(node=>node.dataset.lit=String(s.lit.includes(node.dataset.wfsNode)));
    el('wfs-next').textContent=step===3?(isZh?'回到选路径 ↻':'Back to the path ↻'):(isZh?'下一步 →':'Next step →');
  }
  root.querySelectorAll('[data-wfs-stage]').forEach(button=>button.addEventListener('click',()=>{step=Number(button.dataset.wfsStage);render();}));
  el('wfs-next').addEventListener('click',()=>{step=(step+1)%stages.length;render();});
  document.addEventListener('cloneblock:languagechange',render);
  document.addEventListener('cloneblock:modelchange',event=>{if(models[event.detail?.model]){selected=event.detail.model;render();}});
  render();
})();
