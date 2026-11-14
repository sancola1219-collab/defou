const $ = id => document.getElementById(id);
const pick = a => a[Math.floor(Math.random() * a.length)];

// 进场
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
$('year').textContent = new Date().getFullYear();

// 小音效（直接合成，不用档案）
let ac;
const audio = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
function blip(freqs, type = 'sine', vol = .16, len = .4, gap = .1) {
  try {
    const a = audio();
    freqs.forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * gap;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.001, t + len);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + len + .05);
    });
  } catch (e) {}
}
function thwack(strong) {
  try {
    const a = audio(), t = a.currentTime, n = Math.floor(a.sampleRate * .09), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.frequency.value = strong ? 700 : 1300; g.gain.value = .7; s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start(t);
    const o = a.createOscillator(), g2 = a.createGain();
    o.frequency.setValueAtTime(strong ? 210 : 260, t); o.frequency.exponentialRampToValueAtTime(60, t + .14);
    g2.gain.setValueAtTime(.3, t); g2.gain.exponentialRampToValueAtTime(.001, t + .16); o.connect(g2).connect(a.destination); o.start(t); o.stop(t + .18);
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate(strong ? 30 : 15);
}

// 跳舞：点动作她就跳
const dancer = $('dancer');
let combo = 0, moveTimer;
const MOVE_MS = { wave: 1150, spin: 1000, jump: 1100, shake: 1150 };
const MOVE_NOTE = { wave: [523, 659], spin: [659, 784, 988], jump: [392, 784], shake: [440, 440, 554] };
$('moves').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const m = b.dataset.m;
  dancer.classList.remove('wave', 'spin', 'jump', 'shake'); void dancer.getBoundingClientRect(); dancer.classList.add(m);
  clearTimeout(moveTimer); moveTimer = setTimeout(() => dancer.classList.remove(m), MOVE_MS[m]);
  combo++; blip(MOVE_NOTE[m], 'triangle', .14, .25, .09);
  $('combo').textContent = `连跳 ${combo} 下` + (combo >= 30 ? '，舞后就是你！' : combo >= 15 ? '，停不下来了！' : combo >= 6 ? '，越跳越嗨！' : '');
};

// 给自己的一句话
const QUOTES = [
  '认真的人，运气不会太差。', '把自己的事做好，就是最好的回击。', '不必讨所有人喜欢，喜欢我的人够多了。', '今天也要抬头挺胸地去上班。',
  '书读进去的，谁也拿不走。', '我不惹事，也不怕事。', '跳一支舞，烦恼就少一半。', '嘴长在别人脸上，路走在自己脚下。',
  '慢慢来，比较快。', '心里有光，就不怕背后有人。', '努力不会骗人，时间会替我说话。', '今天的我，比昨天又厉害了一点点。',
];
let lastQ = '';
$('quote-btn').onclick = () => {
  let q; do { q = pick(QUOTES); } while (q === lastQ); lastQ = q;
  const el = $('quote-text'); el.textContent = q; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  blip([660, 880], 'sine', .12, .3);
};

// 背景音乐：一进站先试着播；被浏览器挡下来的话，第一次点或碰画面就开始
const bgm = $('bgm'), mbtn = $('music');
let fade, musicTouched = false;
const ramp = (to, done) => {
  clearInterval(fade);
  let ticks = 0;
  fade = setInterval(() => {
    const v = bgm.volume + (to > bgm.volume ? .04 : -.06);
    if (++ticks > 25 || (to > bgm.volume && v >= to) || (to <= bgm.volume && v <= to)) { bgm.volume = to; clearInterval(fade); done && done(); }
    else bgm.volume = Math.max(0, Math.min(1, v));
  }, 80);
};
const setMusic = on => {
  mbtn.classList.toggle('on', on); mbtn.setAttribute('aria-pressed', on);
  if (on) { bgm.volume = 0; bgm.play().then(() => ramp(.45)).catch(() => setMusic(false)); }
  else ramp(0, () => bgm.pause());
};
mbtn.onclick = e => { e.stopPropagation(); musicTouched = true; setMusic(bgm.paused || !mbtn.classList.contains('on')); };
mbtn.addEventListener('pointerdown', () => { musicTouched = true; }, true);
const autoStart = () => {
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => removeEventListener(ev, autoStart, true));
  if (!musicTouched && bgm.paused) setMusic(true);
};
['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, autoStart, true));
bgm.volume = 0;
bgm.play().then(() => { if (!musicTouched) { mbtn.classList.add('on'); mbtn.setAttribute('aria-pressed', true); ramp(.45); } }).catch(() => {});
