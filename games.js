// ===== 打小人专区：拖鞋伺候、飞鞋命中、戳破坏话 =====
// 用到 main.js 的 $、pick、blip、thwack。小人是画出来的卡通角色，不是任何真人。

// stage：0 得意 1 慌了 2 哭了 3 晕了
function villain(stage = 0) {
  const eyes = stage >= 3 ? '<path d="M35 50l10 10m0-10l-10 10M55 50l10 10m0-10l-10 10" stroke="#20143a" stroke-width="4" stroke-linecap="round"/>'
    : stage === 0 ? '<path d="M33 56q6-8 12 0M55 56q6-8 12 0" stroke="#20143a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M31 46l14 4M69 46l-14 4" stroke="#20143a" stroke-width="3.5" stroke-linecap="round"/>'
    : '<circle cx="39" cy="55" r="4.5" fill="#20143a"/><circle cx="61" cy="55" r="4.5" fill="#20143a"/><path d="M31 49l14-4M69 49l-14-4" stroke="#20143a" stroke-width="3.5" stroke-linecap="round"/>';
  const mouth = stage === 0 ? '<path d="M40 70q12 9 22-3" stroke="#20143a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : stage === 1 ? '<ellipse cx="50" cy="72" rx="6" ry="7" fill="#20143a"/>'
    : stage === 2 ? '<path d="M40 76q10-9 20 0" stroke="#20143a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : '<path d="M38 74q4-5 8 0t8 0t8 0" stroke="#20143a" stroke-width="4" fill="none" stroke-linecap="round"/>';
  const extra = (stage === 1 ? '<path d="M80 44q5 9 0 13q-5-4 0-13z" fill="#7fd3f5"/>' : '')
    + (stage === 2 ? '<path d="M36 62q-3 10 0 14M64 62q3 10 0 14" stroke="#7fd3f5" stroke-width="5" stroke-linecap="round"/>' : '')
    + (stage >= 2 ? '<circle cx="66" cy="24" r="8" fill="#ff9db8" stroke="#20143a" stroke-width="3"/>' : '')
    + (stage >= 3 ? '<text x="6" y="26" font-size="17" fill="#ffb300">★</text><text x="82" y="22" font-size="13" fill="#ffb300">★</text>' : '');
  return `<svg viewBox="0 0 100 150" aria-hidden="true">
    <path d="M30 96q20-10 40 0l14 44q-34 12-68 0z" fill="#a98cff" stroke="#20143a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M34 100L14 118M66 100l20 18" stroke="#20143a" stroke-width="9" stroke-linecap="round"/>
    <path d="M18 60q-6 34 6 52q4-30 0-52zM82 60q6 34-6 52q-4-30 0-52z" fill="#5a3a2a" stroke="#20143a" stroke-width="3"/>
    <circle cx="50" cy="18" r="13" fill="#5a3a2a" stroke="#20143a" stroke-width="4"/>
    <circle cx="50" cy="58" r="33" fill="#ffe2cf" stroke="#20143a" stroke-width="4"/>
    <path d="M17 54q2-34 33-34t33 34q-16-16-33-14q-18-2-33 14z" fill="#5a3a2a" stroke="#20143a" stroke-width="3" stroke-linejoin="round"/>
    ${eyes}${mouth}${extra}</svg>`;
}
function word(parent, x, y, text) { const w = document.createElement('span'); w.className = 'word'; w.textContent = text; w.style.left = x + 'px'; w.style.top = y + 'px'; parent.appendChild(w); setTimeout(() => w.remove(), 760); }
const best = (k, v) => { let b = v; try { b = Math.max(v, +(localStorage.getItem(k) || 0)); localStorage.setItem(k, b); } catch (e) {} return b; };

// ---------- 一、拖鞋伺候 ----------
const SLAP_GOAL = 40;
const CHANT = ['打你个小人头，坏话没人听！', '打你个小人手，功劳抢不走！', '打你个小人嘴，是非到此为止！', '打你个小人脚，绊不倒我半步！', '打你个小人心，算计全落空！', '再打一下，好运来我家！'];
const slap = { n: 0, done: false };
const slapArena = $('slap-arena'), slapDoll = $('slap-doll');
function slapDraw() {
  slapDoll.innerHTML = villain(slap.n >= 30 ? 3 : slap.n >= 18 ? 2 : slap.n >= 7 ? 1 : 0);
  $('slap-n').textContent = slap.n; $('slap-bar').style.width = Math.min(100, slap.n / SLAP_GOAL * 100) + '%';
}
function slapNew() { slap.n = 0; slap.done = false; slapDoll.className = 'doll'; slapDraw(); $('slap-msg').textContent = '点小人，用拖鞋打她！打满 40 下就退散。'; }
slapArena.addEventListener('pointerdown', e => {
  e.preventDefault(); if (slap.done) return;
  const r = slapArena.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  slap.n++; thwack(slap.n % 5 === 0);
  const s = document.createElement('i'); s.className = 'slipper'; s.style.left = x + 'px'; s.style.top = y + 'px'; slapArena.appendChild(s); setTimeout(() => s.remove(), 300);
  slapDoll.style.setProperty('--tilt', (Math.random() * 20 - 10).toFixed(0) + 'deg'); slapDoll.classList.remove('hit'); void slapDoll.offsetWidth; slapDoll.classList.add('hit');
  word(slapArena, x, y - 20, slap.n % 5 === 0 ? pick(['啪！', '走开！', '退散！', '哼！']) : '啪');
  if (slap.n % 6 === 0 && slap.n < SLAP_GOAL) $('slap-msg').textContent = CHANT[(slap.n / 6 - 1) % CHANT.length];
  slapDraw();
  if (slap.n >= SLAP_GOAL) { slap.done = true; slapDoll.classList.add('gone'); $('slap-msg').textContent = '小人已退散！从今天起，她的算计都落空。'; blip([784, 988, 1175, 1568], 'sine', .16, .6); }
});
$('slap-reset').onclick = slapNew; slapNew();

// ---------- 二、飞鞋命中 ----------
const thr = { on: false, n: 0, t: 20, x: 0, dir: 1, speed: 150, last: 0, flying: false, clock: null };
const thrArena = $('throw-arena'), thrDoll = $('throw-doll'), shoe = $('throw-shoe');
thrDoll.innerHTML = villain(0);
function thrFrame(ts) {
  if (!thr.on) return;
  const w = thrArena.clientWidth - thrDoll.offsetWidth, dt = Math.min(.05, (ts - (thr.last || ts)) / 1000); thr.last = ts;
  thr.x += thr.dir * thr.speed * dt;
  if (thr.x <= 0) { thr.x = 0; thr.dir = 1; } else if (thr.x >= w) { thr.x = w; thr.dir = -1; }
  if (Math.random() < .006) thr.dir = -thr.dir;      // 偶尔耍诈掉头
  thrDoll.style.transform = `translateX(${thr.x.toFixed(1)}px)`;
  requestAnimationFrame(thrFrame);
}
function thrEnd() {
  thr.on = false; clearInterval(thr.clock);
  const b = best('df-throw', thr.n);
  $('throw-msg').textContent = (thr.n >= 16 ? '神射手！小人见到你就绕路走。' : thr.n >= 9 ? '准头不错，她已经不敢靠近了。' : thr.n >= 4 ? '打中几下也够她受的，再来一局更准。' : '她跑得快，你再瞄准一点！') + `（最高命中 ${b} 次）`;
  $('throw-go').textContent = '再丢一局'; $('throw-go').disabled = false; thrDoll.innerHTML = villain(thr.n >= 9 ? 3 : 2);
  blip([784, 988, 1319], 'sine', .16, .6);
}
$('throw-go').onclick = () => {
  if (thr.on) return;
  Object.assign(thr, { on: true, n: 0, t: 20, x: 0, dir: 1, speed: 150, last: 0, flying: false });
  $('throw-n').textContent = 0; $('throw-t').textContent = 20; $('throw-msg').textContent = '点她的位置丢拖鞋！拖鞋要飞一下，记得抓提前量。'; $('throw-go').disabled = true; thrDoll.innerHTML = villain(0);
  thr.clock = setInterval(() => { thr.t--; thr.speed += 9; $('throw-t').textContent = thr.t; if (thr.t <= 0) thrEnd(); }, 1000);
  requestAnimationFrame(thrFrame);
};
thrArena.addEventListener('pointerdown', e => {
  e.preventDefault(); if (!thr.on || thr.flying) return;
  const r = thrArena.getBoundingClientRect(), x = e.clientX - r.left;
  thr.flying = true; shoe.style.left = x + 'px'; shoe.classList.remove('fly'); void shoe.offsetWidth; shoe.classList.add('fly');
  setTimeout(() => {
    shoe.classList.remove('fly'); thr.flying = false; if (!thr.on) return;
    const center = thr.x + thrDoll.offsetWidth / 2;
    if (Math.abs(center - x) < thrDoll.offsetWidth * .5) {
      thr.n++; $('throw-n').textContent = thr.n; thwack(true); word(thrArena, x, 70, pick(['中！', '哎哟！', '正中脑门！', '别丢了！']));
      thrDoll.innerHTML = villain(3); setTimeout(() => { if (thr.on) thrDoll.innerHTML = villain(1); }, 380);
    } else { word(thrArena, x, 70, '没中'); blip([240], 'sine', .08, .15); }
  }, 340);
});

// ---------- 三、戳破坏话 ----------
const LIES = ['背后说坏话', '抢功劳', '打小报告', '装无辜', '挑拨离间', '甩锅', '阴阳怪气', '假装关心', '到处传话', '当面一套', '背后一套', '偷偷告状'];
const pop = { on: false, n: 0, miss: 0, t: 25, spawn: null, clock: null };
const popArena = $('pop-arena');
$('pop-doll').innerHTML = villain(0);
function popSpawn() {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bub'; b.textContent = pick(LIES);
  b.style.left = (18 + Math.random() * 64) + '%'; b.style.animationDuration = (2.6 + Math.random() * 1.6 - (25 - pop.t) * .03).toFixed(2) + 's';
  b.addEventListener('animationend', ev => { if (ev.animationName !== 'rise') return; b.remove(); if (pop.on) { pop.miss++; $('pop-miss').textContent = pop.miss; } });
  popArena.appendChild(b);
}
function popEnd() {
  pop.on = false; clearInterval(pop.spawn); clearInterval(pop.clock); popArena.querySelectorAll('.bub').forEach(b => b.remove());
  const b = best('df-pop', pop.n);
  $('pop-msg').textContent = (pop.miss === 0 ? '一句都没传出去，滴水不漏！' : pop.n >= pop.miss * 4 ? `戳破 ${pop.n} 句，只漏了 ${pop.miss} 句，她白忙一场。` : `戳破 ${pop.n} 句，漏了 ${pop.miss} 句。没关系，清者自清。`) + `（最高戳破 ${b} 句）`;
  $('pop-go').textContent = '再戳一局'; $('pop-go').disabled = false; $('pop-doll').innerHTML = villain(pop.n >= pop.miss * 3 ? 2 : 0);
  blip([784, 988, 1319], 'sine', .16, .6);
}
$('pop-go').onclick = () => {
  if (pop.on) return;
  Object.assign(pop, { on: true, n: 0, miss: 0, t: 25 });
  $('pop-n').textContent = 0; $('pop-miss').textContent = 0; $('pop-t').textContent = 25; $('pop-msg').textContent = '坏话飘上来了，快戳！'; $('pop-go').disabled = true; $('pop-doll').innerHTML = villain(0);
  popSpawn(); pop.spawn = setInterval(popSpawn, 620);
  pop.clock = setInterval(() => { pop.t--; $('pop-t').textContent = pop.t; if (pop.t <= 0) popEnd(); }, 1000);
};
popArena.addEventListener('pointerdown', e => {
  const b = e.target.closest('.bub'); if (!b || !pop.on || b.classList.contains('burst')) return;
  e.preventDefault(); b.classList.add('burst'); setTimeout(() => b.remove(), 230);
  pop.n++; $('pop-n').textContent = pop.n; blip([900 + Math.random() * 500], 'triangle', .14, .12);
  if (navigator.vibrate) navigator.vibrate(10);
});
