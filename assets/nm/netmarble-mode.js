// 라이트/다크 모드. 포트폴리오 메인(index.html)·상세 문서·슬라이드·웹 플레이 페이지가 함께 씁니다.
//   고른 모드는 브라우저에 기억해 두고(localStorage 'nm-theme'), 처음에는 라이트(흰 바탕)입니다.
//   다크 색은 theme/theme.css의 :root[data-theme="dark"]에 있습니다.
//   <head>에서 NM.apply()를 먼저 불러 그리기 전에 모드를 정합니다(깜빡임 없게).
window.NM = (() => {
  const KEY = 'nm-theme';
  const get = () => { try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } };
  const set = (m) => { try { localStorage.setItem(KEY, m); } catch {} };
  const apply = (m = get()) => { document.documentElement.dataset.theme = m; return m; };
  // 모드 전환 버튼. onChange(새 모드)를 주지 않으면 바로 바꿔 칠하고, 주면 그 함수에 맡김(예: 다시 불러오기)
  const button = (cls = '', onChange) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (cls) b.className = cls;
    const paint = () => {
      const dark = get() === 'dark';
      b.textContent = dark ? '☀ 라이트' : '☾ 다크';
      b.setAttribute('aria-label', dark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기');
      b.setAttribute('aria-pressed', String(dark));
    };
    b.addEventListener('click', () => {
      const next = get() === 'dark' ? 'light' : 'dark';
      set(next);
      if (onChange) onChange(next); else apply(next);
      paint();
    });
    paint();
    return b;
  };
  // 렌더러가 그린 머리 막대(.head-nav: 상세 문서·웹 플레이) 또는 슬라이드 아래 막대(.pf-hud)에 전환 버튼을 붙임.
  //   reload: 다이어그램·강조색은 그릴 때 정해지므로 바꾸면 다시 불러옴(상세 문서·슬라이드). after: 바로 바꾼 뒤 할 일(웹 플레이)
  const mount = ({ reload = false, after } = {}) => {
    const add = () => {
      if (document.querySelector('.nm-mode')) return true;
      const host = document.querySelector('.head-nav') || document.querySelector('.pf-hud');
      if (!host) return false;
      const onChange = reload ? () => location.reload() : (m) => { apply(m); after?.(m); };
      host.appendChild(button(host.classList.contains('head-nav') ? 'btn nm-mode' : 'nm-mode', onChange));
      return true;
    };
    const start = () => {
      if (add()) return;
      const mo = new MutationObserver(() => { if (add()) mo.disconnect(); });
      mo.observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) start(); else addEventListener('DOMContentLoaded', start);
  };
  return { get, set, apply, button, mount };
})();
