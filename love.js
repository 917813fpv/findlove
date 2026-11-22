(function () {
  var API = 'https://create.yzbjfpv.com/api/findlove';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var GENDERS = ['男', '女', '其他', '双性', '男同', '女同', '沃尔玛购物袋'];
  var AGE_MIN = -99, AGE_MAX = 200;
  var state = { bubbles: [], gender: '其他', age: 18, tokens: [], current: null };

  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(function () { t.hidden = true; }, 2200); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* splash */
  var splash = $('#splash');
  function endSplash() { splash.classList.add('out'); setTimeout(function () { splash.remove(); }, 600); }
  setTimeout(endSplash, 2500);
  splash.addEventListener('click', endSplash);

  /* genders */
  var gw = $('#genders');
  GENDERS.forEach(function (g) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = g; b.dataset.g = g;
    if (g === state.gender) b.className = 'on';
    b.addEventListener('click', function () { state.gender = g; $$('#genders button').forEach(function (x) { x.classList.toggle('on', x === b); }); });
    gw.appendChild(b);
  });

  /* age wheel */
  var wheel = $('#wheel'), knob = $('#knob'), ageBig = $('#ageBig'), ageOut = $('#ageOut');
  var ticks = $('#ticks');
  for (var i = 0; i < 48; i++) { var t = document.createElement('i'); t.style.transform = 'rotate(' + (i * 7.5) + 'deg) translateY(-108px)'; ticks.appendChild(t); }
  function setAge(v) {
    state.age = Math.max(AGE_MIN, Math.min(AGE_MAX, Math.round(v)));
    var frac = (state.age - AGE_MIN) / (AGE_MAX - AGE_MIN);
    var deg = -120 + frac * 240;
    knob.style.transform = 'rotate(' + deg + 'deg) translateY(-98px)';
    ageBig.textContent = state.age; ageOut.textContent = state.age;
    wheel.setAttribute('aria-valuenow', state.age);
  }
  setAge(18);
  var dragging = false;
  function angleToAge(clientX, clientY) {
    var r = wheel.getBoundingClientRect();
    var dx = clientX - (r.left + r.width / 2), dy = clientY - (r.top + r.height / 2);
    var a = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (a > 180) a -= 360;
    a = Math.max(-120, Math.min(120, a));
    return AGE_MIN + ((a + 120) / 240) * (AGE_MAX - AGE_MIN);
  }
  wheel.addEventListener('pointerdown', function (e) { dragging = true; wheel.setPointerCapture(e.pointerId); setAge(angleToAge(e.clientX, e.clientY)); });
  wheel.addEventListener('pointermove', function (e) { if (dragging) setAge(angleToAge(e.clientX, e.clientY)); });
  wheel.addEventListener('pointerup', function () { dragging = false; });
  wheel.addEventListener('wheel', function (e) { e.preventDefault(); setAge(state.age + (e.deltaY > 0 ? -1 : 1)); }, { passive: false });

  /* cloud */
  var SLOTS = [[8,14],[70,11],[36,40],[90,44],[15,66],[56,68],[80,80],[28,84],[50,18],[6,42],[64,44],[44,88]];
  function bubbleStyle(b, i) {
    var h = hash(b.id || String(i));
    var slot = SLOTS[i % SLOTS.length];
    var jx = ((h >> 3) % 3) - 1, jy = ((h >> 5) % 3) - 1;
    var size = 148 + Math.min(64, String(b.text || '').length * 2 + (h % 22));
    var left = Math.max(1, Math.min(84, slot[0] + jx * 1.2));
    var top = Math.max(2, Math.min(80, slot[1] + jy * 1.5));
    return 'left:' + left + '%;top:' + top + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:-' + (h % 9) + 's';
  }
  function renderCloud() {
    var cloud = $('#cloud');
    cloud.innerHTML = '';
    state.bubbles.forEach(function (b, i) {
      var el = document.createElement('button');
      el.type = 'button'; el.className = 'bubble g-' + b.gender;
      el.style.cssText = bubbleStyle(b, i);
      el.innerHTML = '<span class="bn">' + esc(b.nickname) + '</span><span class="bm">' + esc(b.gender) + ' · ' + b.age + ' 岁</span><span class="bt">' + esc(b.text) + '</span>' + (b.replies ? '<i class="badge"></i>' : '');
      el.addEventListener('click', function () { openPanel(b); });
      cloud.appendChild(el);
    });
    $('#count').textContent = state.bubbles.length + ' 个气泡在飘';
    $('#empty').hidden = state.bubbles.length > 0;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function loadCloud() {
    fetch(API + '/cloud', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.success) { state.bubbles = j.data.bubbles || []; renderCloud(); }
    }).catch(function () {});
  }
  loadCloud();
  setInterval(loadCloud, 20000);

  /* compose */
  function openModal(id) { $(id).hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(el) { el.hidden = true; document.body.style.overflow = ''; }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.hasAttribute('data-close')) closeModal(m); });
  });
  function openCompose() { $('#err').textContent = ''; openModal('#compose'); $('#nick').focus(); }
  $('#postBtn').addEventListener('click', openCompose);
  $('#emptyPost').addEventListener('click', openCompose);

  $('#send').addEventListener('click', function () {
    var btn = this, nick = $('#nick').value.trim() || '匿名', text = $('#text').value.trim();
    if (text.length < 2) { $('#err').textContent = '写点什么再发'; return; }
    btn.disabled = true;
    fetch(API + '/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: nick, gender: state.gender, age: state.age, text: text }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        btn.disabled = false;
        if (!j.success) { $('#err').textContent = j.error || '发失败了'; return; }
        state.tokens = load('fl_tokens', []); state.tokens.push({ id: j.data.id, token: j.data.token }); save('fl_tokens', state.tokens);
        save('fl_name', nick);
        $('#text').value = ''; closeModal($('#compose')); toast('已经放上云了'); loadCloud();
      }).catch(function () { btn.disabled = false; $('#err').textContent = '网络不太好，再试一次'; });
  });

  /* panel + reply */
  function openPanel(b) {
    state.current = b;
    var body = $('#panelBody');
    body.innerHTML = '<div class="panel-head"><div class="panel-avatar">' + esc(b.nickname.slice(0, 1)) + '</div><div class="panel-name"><b>' + esc(b.nickname) + '</b><span>' + esc(b.gender) + ' · ' + b.age + ' 岁 · ' + timeAgo(b.ts) + '</span></div></div>' +
      '<p class="panel-text">' + esc(b.text) + '</p>' +
      '<div class="reply-row"><input id="replyText" maxlength="120" placeholder="回 TA 一句，只有 TA 能看到"><button id="replySend" type="button">回复</button></div>' +
      '<p class="reply-note">回复是私密的，会进对方右上角的「回复」里。</p>';
    openModal('#panelModal');
    $('#replySend').addEventListener('click', sendReply);
    $('#replyText').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendReply(); });
    $('#replyText').focus();
  }
  function sendReply() {
    var text = $('#replyText').value.trim();
    if (!text) return;
    var from = load('fl_name', '') || '有人';
    fetch(API + '/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toId: state.current.id, fromName: from, text: text }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.success) { toast(j.error || '回复失败'); return; }
        closeModal($('#panelModal')); toast('回复送到了');
      }).catch(function () { toast('网络不太好'); });
  }

  /* inbox */
  function refreshInbox(silent) {
    var tokens = load('fl_tokens', []);
    if (!tokens.length) { $('#unread').textContent = '0'; return; }
    Promise.all(tokens.map(function (t) { return fetch(API + '/inbox?token=' + encodeURIComponent(t.token), { cache: 'no-store' }).then(function (r) { return r.json(); }).catch(function () { return null; }); }))
      .then(function (res) {
        var items = [];
        res.forEach(function (j) { if (j && j.success) items = items.concat(j.data.items || []); });
        items.sort(function (a, b) { return b.ts - a.ts; });
        state.inbox = items;
        var unread = items.filter(function (x) { return !x.read; }).length;
        $('#unread').textContent = unread;
        if (!silent && unread) toast('有人回了你 ' + unread + ' 条');
      });
  }
  refreshInbox(true);
  setInterval(function () { refreshInbox(true); }, 15000);

  $('#inboxBtn').addEventListener('click', function () {
    var list = $('#inboxList'), items = state.inbox || [];
    if (!items.length) list.innerHTML = '<p class="inbox-empty">还没有人回你。多发几个气泡，或者去回别人。</p>';
    else list.innerHTML = items.map(function (x) {
      return '<div class="inbox-item"><b>' + esc(x.from) + '</b><p>' + esc(x.text) + '</p><span>回你的「' + esc(x.bubbleText.slice(0, 24)) + '」 · ' + timeAgo(x.ts) + '</span></div>';
    }).join('');
    openModal('#inboxModal');
    var tokens = load('fl_tokens', []);
    tokens.forEach(function (t) { fetch(API + '/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: t.token }) }).catch(function () {}); });
    $('#unread').textContent = '0';
    items.forEach(function (x) { x.read = true; });
  });

  function timeAgo(ts) {
    var d = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (d < 60) return d + ' 秒前';
    if (d < 3600) return Math.round(d / 60) + ' 分钟前';
    if (d < 86400) return Math.round(d / 3600) + ' 小时前';
    return Math.round(d / 86400) + ' 天前';
  }

  var savedName = load('fl_name', ''); if (savedName) $('#nick').value = savedName;
})();
