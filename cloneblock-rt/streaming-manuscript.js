(() => {
  const nodes = [...document.querySelectorAll('[data-zh]')];
  const original = new Map(nodes.map(node => [node, node.innerHTML]));
  const button = document.getElementById('language');
  let chinese = /^zh/i.test(new URL(location.href).searchParams.get('lang') || '');
  function render(updateURL) {
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    nodes.forEach(node => { if (chinese) node.textContent = node.dataset.zh; else node.innerHTML = original.get(node); });
    button.textContent = chinese ? 'EN' : '中文';
    button.setAttribute('aria-label', chinese ? 'Switch to English' : '切换到中文');
    document.title = chinese ? 'CloneBlock-RT · 实时通话声音保护' : 'CloneBlock-RT · Streaming Voice Protection';
    document.querySelector('.home').href = chinese ? '../?lang=zh-CN' : '../';
    document.querySelector('[data-home-link]').href = chinese ? '../?lang=zh-CN#demos' : '../#demos';
    if (updateURL) { const url = new URL(location.href); url.searchParams.set('lang', chinese ? 'zh-CN' : 'en'); history.replaceState(null, '', url); }
  }
  button.addEventListener('click', () => { chinese = !chinese; render(true); });
  const newsVideo = document.getElementById('news-video');
  if (newsVideo) {
    const showVideoError = () => { document.getElementById('news-video-error').hidden = false; };
    newsVideo.addEventListener('error', showVideoError);
    newsVideo.querySelector('source').addEventListener('error', showVideoError);
  }
  render(false);
})();
