(function () {
  var $ = function (s) { return document.querySelector(s); };
  var form = $('#form'), result = $('#result'), ring = $('#ring'), scoreEl = $('#score'), verdict = $('#verdict'), pair = $('#pair'), hint = $('#hint');

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  var lines = [
    [90, '天生一对，建议直接领证。'],
    [75, '很合拍，吵架也能很快和好。'],
    [60, '有点火花，多聊几句看看。'],
    [45, '普通朋友偏上，别急。'],
    [25, '缘分有点害羞，再相处试试。'],
    [0, '玄学说不合适，但玄学不算数。']
  ];
  function run() {
    var a = $('#a').value.trim(), b = $('#b').value.trim();
    if (!a || !b) { hint.textContent = '两个名字都要填。'; return; }
    hint.textContent = '';
    var s = 30 + (hash(a.toLowerCase() + '|' + b.toLowerCase()) % 71);
    var text = '缘分这事，先当个玩笑。';
    for (var i = 0; i < lines.length; i++) { if (s >= lines[i][0]) { text = lines[i][1]; break; } }
    result.hidden = false;
    form.style.display = 'none';
    pair.textContent = a + ' × ' + b;
    verdict.textContent = text;
    var cur = 0;
    var timer = setInterval(function () {
      cur += Math.max(1, Math.round((s - cur) / 8));
      if (cur >= s) { cur = s; clearInterval(timer); }
      scoreEl.textContent = cur;
      ring.style.setProperty('--p', cur);
    }, 16);
    scoreEl.textContent = '0';
    ring.style.setProperty('--p', 0);
    setTimeout(function () { scoreEl.textContent = s; ring.style.setProperty('--p', s); }, 40);
  }
  $('#go').addEventListener('click', run);
  $('#a').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#b').focus(); });
  $('#b').addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  $('#again').addEventListener('click', function () { result.hidden = true; form.style.display = 'block'; $('#a').focus(); });
  $('#copy').addEventListener('click', function () {
    var text = pair.textContent + '，缘分指数 ' + scoreEl.textContent + '% —— ' + verdict.textContent + '（findlove）';
    var btn = this;
    var done = function () { btn.textContent = '已复制'; setTimeout(function () { btn.textContent = '复制结果'; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    else { fallback(text); done(); }
    function fallback(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
  });
})();
