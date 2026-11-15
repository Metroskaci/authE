/* Aurora RP — ავტორიზაცია (CEF)
 * გაგზავნილი ივენთები (JS -> Pawn):
 *   auth:name     -> OnPlayerRequestName   (ნიკის მოთხოვნა)
 *   pwd:auth      -> OnLoginAttempt        (პაროლი)
 *   OnExitButtonClick -> OnExitButtonClick (გასვლა)
 * მიღებული ივენთები (Pawn -> JS):
 *   auth:name  (nick)   — ნიკნეიმი
 *   auth:error (msg)    — არასწორი პაროლი და ა.შ.
 *   login:on   (0/1)    — გვერდის დამალვა / ჩვენება
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const card = $('card'), pass = $('pass'),
        hint = $('hint'), btn = $('submit'), toast = $('toast');
  let busy = false, toastT, busyT;

  const hasCef = typeof window.cef !== 'undefined';
  const send = (ev, data) => {
    if (!hasCef) return console.log('[emit]', ev, data);
    data === undefined ? cef.emit(ev) : cef.emit(ev, data);
  };

  function notify(msg, ok) {
    toast.textContent = msg; toast.className = 'show' + (ok ? ' ok' : '');
    clearTimeout(toastT); toastT = setTimeout(() => toast.className = '', 3500);
  }
  function setBusy(v) {
    busy = v; btn.classList.toggle('busy', v); clearTimeout(busyT);
    if (v) busyT = setTimeout(() => setBusy(false), 8000);
  }
  function bad(el) { el.classList.add('err'); setTimeout(() => el.classList.remove('err'), 500); }

  function submit() {
    if (busy) return;
    const p = pass.value;
    if (p.length < 6 || p.length > 20) { bad(pass); return notify('პაროლი უნდა შედგებოდეს 6–20 სიმბოლოსგან'); }
    if (/[^\x21-\x7E]/.test(p)) { bad(pass); return notify('პაროლი: მხოლოდ ლათინური ასოები, ციფრები და სიმბოლოები'); }
    setBusy(true);
    send('pwd:auth', p);
  }

  btn.addEventListener('click', submit);
  $('exit').addEventListener('click', () => send('OnExitButtonClick'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  $('eye').addEventListener('click', () => { pass.type = pass.type === 'password' ? 'text' : 'password'; });

  // ვძებნით ინპუტს უნივერსალურად
  const getNickInput = () => document.getElementById('nick') || document.querySelector('input[type="text"]');

  if (hasCef) {
    cef.on("auth:name", (name) => {
    let nickInput = document.getElementById("nick");
    if (nickInput) {
        nickInput.value = name;
    }
});

    cef.on('auth:error', (msg) => {
      setBusy(false); notify(String(msg)); bad(pass); pass.value = ''; pass.focus();
      hint.textContent = '';
    });

    cef.on('login:on', (v) => {
      if (+v === 0) { setBusy(false); card.classList.add('hidden'); notify('წარმატებით შეხვედით!', true); }
      else card.classList.remove('hidden');
    });

    // ყოველ 1 წამში მოითხოვს ნიკს, სანამ ინპუტი არ შეივსება
    const interval = setInterval(() => {
        const nickInput = getNickInput();
        if (nickInput && !nickInput.value) {
            send('auth:name');
        } else if (nickInput && nickInput.value) {
            clearInterval(interval);
        }
    }, 1000);

  } else {
    /* ბრაუზერში სანახავად */
    const nickInput = getNickInput();
    if (nickInput) nickInput.value = 'Emiliano_Himura';
  }

  window.addEventListener('load', () => setTimeout(() => { card.classList.remove('hidden'); pass.focus(); }, 120));
})();