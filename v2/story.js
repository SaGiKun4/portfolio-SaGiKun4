// v2 전용 — 부록 되돌아가기 리모컨. 루트(원본) 페이지에는 싣지 않음. 공유 렌더러(../assets/doc.js)는 그대로.
// 본문 안의 부록 링크(예: [부록](#부록))를 누르면, 목차와 본문 사이 여백에 [읽던 곳으로]·[닫기] 리모컨이 페이드인으로 나타납니다.
// [읽던 곳으로]는 누른 링크가 있던 자리(화면 속 같은 높이)로 되돌아가며 사라지고, [닫기]는 그냥 사라집니다.
// 직접 스크롤해 읽던 곳 근처로 돌아와도 사라집니다.
(() => {
  const ready = () => new Promise((res) => {
    const ok = () => document.documentElement.dataset.docReady === '1' && document.getElementById('doc');
    if (ok()) return res();
    const t = setInterval(() => { if (ok()) { clearInterval(t); res(); } }, 200);
  });

  ready().then(() => {
    const doc = document.getElementById('doc');
    const appendix = [...doc.querySelectorAll('h2')].find((h) => h.textContent.trim().replace(/^\d+\.\s*/, '') === '부록');
    if (!appendix) return;

    // 부록 안(부록 제목이거나 그 뒤)에 있는 요소인가
    const inAppendix = (el) => el === appendix || !!(appendix.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const targetOf = (a) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#') || href.length < 2) return null;
      let id = href.slice(1);
      try { id = decodeURIComponent(id); } catch { /* 그대로 */ }
      return document.getElementById(id);
    };

    const box = document.createElement('div');
    box.className = 'pf-remote';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', '부록에서 되돌아가기');
    box.innerHTML = '<button type="button" class="pf-remote-back">↩ 읽던 곳으로</button><button type="button" class="pf-remote-close">닫기</button>';
    document.body.appendChild(box);

    let from = null, offset = 0, watch = null;
    const place = () => {
      const toc = document.querySelector('.doc-page > .toc');
      const intro = document.querySelector('.doc-intro') || doc;
      const tocR = toc && getComputedStyle(toc).display !== 'none' ? toc.getBoundingClientRect() : null;
      const left = intro.getBoundingClientRect().left;
      if (tocR && left - tocR.right >= box.offsetWidth + 16) {
        box.classList.remove('pf-remote--floating');
        box.style.left = `${Math.round((tocR.right + left - box.offsetWidth) / 2)}px`;
      } else {
        box.classList.add('pf-remote--floating');            // 목차가 없는 좁은 화면: 왼쪽 아래에 띄움
        box.style.left = '';
      }
    };
    const backTop = () => from.getBoundingClientRect().top + scrollY - offset;
    const hide = () => {
      box.classList.remove('is-on');
      if (watch) { removeEventListener('scroll', watch); watch = null; }
    };
    const show = () => {
      place();
      box.classList.add('is-on');
      // 직접 스크롤해 읽던 곳 근처(±120px)로 돌아오면 저절로 사라짐 — 부록으로 내려간 뒤에만 판단
      let left = false;
      watch = () => {
        const d = Math.abs(scrollY - backTop());
        if (d > 300) left = true;
        else if (left && d < 120) hide();
      };
      addEventListener('scroll', watch, { passive: true });
    };

    doc.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = targetOf(a);
      if (!target || !inAppendix(target) || inAppendix(a)) return;   // 부록으로 가는 본문 링크만
      from = a;
      offset = a.getBoundingClientRect().top;                         // 화면 속 높이를 기억해 같은 자리로 되돌림
      hide();
      setTimeout(show, 50);
    }, true);

    box.querySelector('.pf-remote-back').addEventListener('click', () => {
      if (!from) return hide();
      const top = backTop();
      hide();
      history.replaceState(null, '', location.pathname + location.search);   // 부록 주소(#부록)를 지워 다시 붙잡지 않게
      scrollTo({ top, behavior: 'smooth' });
      from.classList.add('pf-remote-arrive');
      setTimeout(() => from.classList.remove('pf-remote-arrive'), 1600);
    });
    box.querySelector('.pf-remote-close').addEventListener('click', hide);
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('is-on')) hide(); });
    addEventListener('resize', () => { if (box.classList.contains('is-on')) place(); });
  });
})();
