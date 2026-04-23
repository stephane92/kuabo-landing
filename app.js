// ─────────────────────────────────────────────────────────────
// app.js — Kuabo.co
// Firebase + Gamification + Traductions + Modals
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, collection, doc,
  setDoc, getDoc, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyAfyqpqdUBixIz1_TmXzZsuoiatXfGLStQ",
  authDomain: "kuabo-42d9c.firebaseapp.com",
  projectId: "kuabo-42d9c",
  storageBucket: "kuabo-42d9c.firebasestorage.app",
  messagingSenderId: "774805697",
  appId: "1:774805697:web:1fa1a94076fd8e7c8f5c40"
}));

// ═══════════════════════════════════════════════════════════
// FIREBASE — WAITLIST + CODES PROMO
// ═══════════════════════════════════════════════════════════

async function loadCount() {
  try {
    const snap = await getCountFromServer(collection(db, "waitlist"));
    const n = snap.data().count || 0;
    if (n > 0) {
      document.querySelectorAll(".cnum").forEach(el => {
        let c = 0;
        const s = Math.max(1, Math.ceil(n / 60));
        const t = setInterval(() => {
          c = Math.min(c + s, n);
          el.textContent = c.toLocaleString();
          if (c >= n) clearInterval(t);
        }, 28);
      });
      document.querySelectorAll(".cline").forEach(el => el.classList.remove("hidden"));
    }
  } catch(e) {}
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KUABO-";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

window.kuaboSubmit = async function(id) {
  const inp = document.getElementById("ei-" + id);
  const btn = document.getElementById("eb-" + id);
  const msg = document.getElementById("em-" + id);
  const email = (inp?.value || "").trim().toLowerCase();
  const lang  = document.documentElement.lang || "en";

  const T = {
    en: { empty:"Enter your email", bad:"Invalid email", ok:"🎉 You're in! Your secret gift is ready ↓", err:"Error. Try again.", wait:"⏳" },
    fr: { empty:"Entre ton email", bad:"Email invalide", ok:"🎉 Tu es sur la liste ! Ton cadeau secret est prêt ↓", err:"Erreur. Réessaie.", wait:"⏳" },
    es: { empty:"Ingresa tu email", bad:"Email inválido", ok:"🎉 ¡Estás! Tu regalo secreto está listo ↓", err:"Error.", wait:"⏳" }
  };
  const t = T[lang] || T.en;

  if (!email) { flash(msg, t.empty, 0); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { flash(msg, t.bad, 0); return; }
  if (btn) { btn.disabled = true; btn.textContent = t.wait; }

  try {
    const emailKey = email.replace(/\./g, "_dot_").replace(/@/, "_at_");
    const waitRef  = doc(db, "waitlist", emailKey);
    const snap     = await getDoc(waitRef);
    let promoCode, isNew = false;

    if (snap.exists()) {
      const data = snap.data();
      if (data.promoCode) {
        promoCode = data.promoCode;
      } else {
        promoCode = genCode();
        isNew = true;
        await setDoc(waitRef, { promoCode, promoAt: new Date().toISOString() }, { merge: true });
        await setDoc(doc(db, "promo_codes", promoCode), {
          email, createdAt: new Date().toISOString(), used: false, reward: 70, source: "retro"
        });
      }
    } else {
      isNew = true;
      promoCode = genCode();
      await setDoc(waitRef, { email, lang, at: new Date().toISOString(), promoCode, promoAt: new Date().toISOString() });
      await setDoc(doc(db, "promo_codes", promoCode), {
        email, createdAt: new Date().toISOString(), used: false, reward: 70, source: "waitlist"
      });
    }

    if (inp) inp.value = "";
    flash(msg, t.ok, 1);
    launchConfetti();
    showGiftModal(promoCode, isNew, lang);

  } catch(e) {
    console.error(e);
    flash(msg, t.err, 0);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = lang === "fr" ? "Me notifier 🚀" : lang === "es" ? "Notificarme 🚀" : "Get notified 🚀";
  }
};

function flash(el, text, ok) {
  if (el) { el.textContent = text; el.style.color = ok ? "#22c55e" : "#ef4444"; }
}

// ═══════════════════════════════════════════════════════════
// MODAL CADEAU — ANIMATION PLEIN ÉCRAN
// ═══════════════════════════════════════════════════════════

function showGiftModal(code, isNew, lang) {
  document.getElementById("kuabo-gift-modal")?.remove();

  const T = {
    en: {
      title:  isNew ? "🎁 Your secret launch gift!" : "🎁 Welcome back!",
      sub:    isNew
        ? "You are among the very first Kuabo members! Enter this code in the app at launch to instantly receive your 70 Kuaboins."
        : "You already registered! Here is your code — it's still valid and waiting for you.",
      lbl:    "Your exclusive code",
      reward: "+70 🪙 Kuaboins instantly at launch",
      tip1:   "📸 Screenshot this to keep your code safe!",
      tip2:   "🔐 This code is unique and linked to your email.",
      copy:   "📋 Copy my code", copied: "✅ Copied!",
      share:  "📤 Share my code",
      close:  "Got it — keeping it safe! 🔐"
    },
    fr: {
      title:  isNew ? "🎁 Ton cadeau secret de lancement !" : "🎁 Content de te revoir !",
      sub:    isNew
        ? "Tu fais partie des tout premiers membres Kuabo ! Entre ce code dans l'app au lancement pour recevoir instantanément tes 70 Kuaboins."
        : "Tu t'étais déjà inscrit ! Voici ton code — il est toujours valide et t'attend.",
      lbl:    "Ton code exclusif",
      reward: "+70 🪙 Kuaboins instantanément au lancement",
      tip1:   "📸 Fais une capture d'écran pour garder ton code !",
      tip2:   "🔐 Ce code est unique et lié à ton email.",
      copy:   "📋 Copier mon code", copied: "✅ Copié !",
      share:  "📤 Partager mon code",
      close:  "Compris — je le garde précieusement ! 🔐"
    },
    es: {
      title:  isNew ? "🎁 ¡Tu regalo secreto de lanzamiento!" : "🎁 ¡Bienvenido de vuelta!",
      sub:    isNew
        ? "¡Eres uno de los primeros miembros de Kuabo! Ingresa este código en la app al lanzamiento para recibir instantáneamente tus 70 Kuaboins."
        : "¡Ya te registraste! Aquí está tu código — sigue siendo válido.",
      lbl:    "Tu código exclusivo",
      reward: "+70 🪙 Kuaboins instantáneamente al lanzamiento",
      tip1:   "📸 ¡Toma una captura de pantalla para guardar tu código!",
      tip2:   "🔐 Este código es único y está vinculado a tu email.",
      copy:   "📋 Copiar mi código", copied: "✅ ¡Copiado!",
      share:  "📤 Compartir mi código",
      close:  "¡Entendido — lo guardo bien! 🔐"
    }
  };
  const tx = T[lang] || T.fr;

  const overlay = document.createElement("div");
  overlay.id = "kuabo-gift-modal";
  overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(11,21,38,.95);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .3s ease;overflow-y:auto;";

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:28px;padding:36px 28px 28px;max-width:440px;width:100%;text-align:center;position:relative;animation:popIn .4s cubic-bezier(.34,1.56,.64,1);box-shadow:0 40px 100px rgba(0,0,0,.6);border:3px solid rgba(232,184,75,.5);margin:auto;">
      <div id="gift-inner-conf" style="position:absolute;inset:0;overflow:hidden;border-radius:28px;pointer-events:none;"></div>
      <div style="font-size:80px;margin-bottom:12px;animation:mascotBounce 1.5s ease-in-out infinite;line-height:1;">${isNew ? "🎁" : "🎊"}</div>
      <div style="font-family:'Nunito',sans-serif;font-size:22px;font-weight:900;color:#0b1526;margin-bottom:10px;line-height:1.2;">${tx.title}</div>
      <p style="font-size:13px;color:#64748b;line-height:1.65;margin-bottom:20px;font-weight:600;">${tx.sub}</p>
      <div style="background:linear-gradient(135deg,rgba(232,184,75,.13),rgba(232,184,75,.05));border:3px solid rgba(232,184,75,.65);border-radius:20px;padding:20px 24px;margin-bottom:16px;box-shadow:0 6px 0 rgba(232,184,75,.18);">
        <div style="font-size:11px;font-weight:800;color:#c9952a;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;">${tx.lbl}</div>
        <div style="font-family:'Nunito',sans-serif;font-size:32px;font-weight:900;color:#0b1526;letter-spacing:5px;margin-bottom:8px;">${code}</div>
        <div style="font-size:12px;color:#22c55e;font-weight:700;">${tx.reward}</div>
      </div>
      <div style="background:#f8fafc;border-radius:14px;padding:14px 16px;margin-bottom:18px;border:1.5px solid #e2e8f0;text-align:left;">
        <div style="font-size:13px;color:#1e293b;font-weight:700;margin-bottom:6px;">${tx.tip1}</div>
        <div style="font-size:12px;color:#64748b;font-weight:600;">${tx.tip2}</div>
      </div>
      <button id="kuabo-copy-btn" style="width:100%;padding:15px;border:2.5px solid rgba(232,184,75,.45);border-radius:14px;background:rgba(232,184,75,.09);font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;color:#c9952a;cursor:pointer;margin-bottom:10px;transition:all .2s;">${tx.copy}</button>
      <button id="kuabo-share-btn" style="width:100%;padding:15px;border:2.5px solid rgba(34,197,94,.35);border-radius:14px;background:rgba(34,197,94,.07);font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;color:#16a34a;cursor:pointer;margin-bottom:10px;transition:all .2s;">${tx.share}</button>
      <button id="kuabo-close-btn" style="width:100%;padding:15px;border:none;border-radius:14px;background:#0b1526;font-family:'Nunito',sans-serif;font-size:15px;font-weight:900;color:#e8b84b;cursor:pointer;border-bottom:4px solid #000;">${tx.close}</button>
    </div>`;

  document.body.appendChild(overlay);

  // Copier
  overlay.querySelector("#kuabo-copy-btn").addEventListener("click", function() {
    const done = () => {
      this.textContent = tx.copied; this.style.background = "#22c55e"; this.style.color = "#fff";
      setTimeout(() => { this.textContent = tx.copy; this.style.background = "rgba(232,184,75,.09)"; this.style.color = "#c9952a"; }, 2500);
    };
    navigator.clipboard ? navigator.clipboard.writeText(code).then(done).catch(() => { fallbackCopy(code); done(); }) : (fallbackCopy(code), done());
  });

  // Partager
  overlay.querySelector("#kuabo-share-btn").addEventListener("click", function() {
    const msg = lang === "fr"
      ? `J'ai mon code Kuabo exclusif : ${code} 🎁\nEntre-le dans l'app au lancement pour +70 Kuaboins ! → kuabo.co`
      : lang === "es"
      ? `¡Tengo mi código Kuabo: ${code} 🎁\n¡Ingrésalo en la app para +70 Kuaboins! → kuabo.co`
      : `I got my Kuabo code: ${code} 🎁\nEnter it in the app for +70 Kuaboins! → kuabo.co`;
    if (navigator.share) {
      navigator.share({ title: "Kuabo", text: msg }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(msg);
      this.textContent = "✅ " + (lang === "fr" ? "Copié !" : "Copied!");
      setTimeout(() => { this.textContent = tx.share; }, 2000);
    }
  });

  overlay.querySelector("#kuabo-close-btn").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

  // Confettis
  const cc = overlay.querySelector("#gift-inner-conf");
  ["#e8b84b","#2dd4bf","#22c55e","#f97316","#a78bfa","#3b82f6","#ec4899"].forEach(color => {
    for (let i = 0; i < 6; i++) {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;left:${5+Math.random()*90}%;top:-10px;width:${7+Math.random()*7}px;height:${7+Math.random()*7}px;border-radius:${Math.random()>.5?"50%":"3px"};background:${color};animation:cfall ${1.6+Math.random()*.9}s ease-in ${Math.random()*.5}s forwards;`;
      cc.appendChild(el);
    }
  });
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text; document.body.appendChild(ta); ta.select();
  document.execCommand("copy"); ta.remove();
}

// ═══════════════════════════════════════════════════════════
// CONFETTI GLOBAL
// ═══════════════════════════════════════════════════════════

function launchConfetti() {
  const cs = ['#e8b84b','#2dd4bf','#22c55e','#f97316','#a78bfa','#3b82f6'];
  const ct = document.getElementById('cc');
  for (let i = 0; i < 44; i++) {
    const el = document.createElement('div');
    el.className = 'cf';
    el.style.cssText = `left:${Math.random()*100}%;top:-10px;background:${cs[i%6]};width:${7+Math.random()*9}px;height:${7+Math.random()*9}px;border-radius:${Math.random()>.5?'50%':'3px'};animation-delay:${Math.random()*.6}s;animation-duration:${1.4+Math.random()*.9}s;`;
    ct.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}
window.launchConfetti = launchConfetti;

// ═══════════════════════════════════════════════════════════
// NAVIGATION — PROGRESS BAR + PHONE SLIDES
// ═══════════════════════════════════════════════════════════

window.addEventListener('scroll', function() {
  const d = document.documentElement;
  document.getElementById('pbar').style.width = (d.scrollTop / (d.scrollHeight - d.clientHeight) * 100) + '%';
});

(function() {
  const ss = document.querySelectorAll('.phone-screen .slide'), i = { v: 0 };
  if (!ss.length) return;
  setInterval(() => {
    ss[i.v].classList.remove('active');
    i.v = (i.v + 1) % ss.length;
    ss[i.v].classList.add('active');
  }, 2500);
})();

// ═══════════════════════════════════════════════════════════
// MASCOT BUBBLE
// ═══════════════════════════════════════════════════════════

const bubbles = {
  en: ["Hey! I'm Kuabi 👋","Follow @kuabo_app 📱","Free forever! 🎉","3 languages! 🌍","Worldwide! 🌐"],
  fr: ["Salut! Je suis Kuabi 👋","Suis @kuabo_app 📱","100% gratuit! 🎉","3 langues! 🌍","Partout! 🌐"],
  es: ["¡Hola! Soy Kuabi 👋","Síguenos @kuabo_app 📱","¡Gratis! 🎉","3 idiomas! 🌍","¡Mundial! 🌐"]
};
let bi = 0;
setInterval(() => {
  const el = document.getElementById('mascotBubble');
  if (!el) return;
  const l = document.documentElement.lang || 'en';
  const bb = bubbles[l] || bubbles.en;
  el.style.opacity = '0';
  setTimeout(() => { bi = (bi + 1) % bb.length; el.textContent = bb[bi]; el.style.opacity = '1'; }, 300);
}, 3000);

// ═══════════════════════════════════════════════════════════
// DEMO MODAL
// ═══════════════════════════════════════════════════════════

let ds = 0;
window.openDemo = function() { ds = 0; showDs(0); document.getElementById('dmo').classList.add('on'); document.body.style.overflow = 'hidden'; };
window.closeDemo = function() { document.getElementById('dmo').classList.remove('on'); document.body.style.overflow = ''; };
window.demoNext = function() { ds = Math.min(ds + 1, 3); showDs(ds); };
function showDs(n) {
  document.querySelectorAll('.dmstep').forEach((s, i) => s.classList.toggle('on', i === n));
  document.querySelectorAll('.dmdot').forEach((d, i) => d.classList.toggle('on', i === n));
}

// ═══════════════════════════════════════════════════════════
// STORE MODAL
// ═══════════════════════════════════════════════════════════

window.openStore = function() { document.getElementById('stmo').classList.add('on'); document.body.style.overflow = 'hidden'; };
window.closeStore = function() { document.getElementById('stmo').classList.remove('on'); document.body.style.overflow = ''; };

// ═══════════════════════════════════════════════════════════
// EMAIL MODAL
// ═══════════════════════════════════════════════════════════

let currentEmailTarget = null;
window.openEmail = function(targetId) {
  currentEmailTarget = targetId || 'hero';
  const modal = document.getElementById('emo');
  const inp   = document.getElementById('ei-modal');
  const msg   = document.getElementById('em-modal');
  if (msg) msg.textContent = '';
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { if (inp) inp.focus(); }, 250);
};
window.closeEmail = function() { document.getElementById('emo').classList.remove('on'); document.body.style.overflow = ''; };

window.submitEmailModal = async function() {
  const inp  = document.getElementById('ei-modal');
  const btn  = document.getElementById('eb-modal');
  const msg  = document.getElementById('em-modal');
  const email = (inp?.value || '').trim();
  const lang  = document.documentElement.lang || 'en';
  const T = {
    en: { empty:'Enter your email', bad:'Invalid email', ok:"🎉 You're in!", err:'Error.', wait:'...' },
    fr: { empty:'Entre ton email', bad:'Email invalide', ok:"🎉 Tu es sur la liste !", err:'Erreur.', wait:'...' },
    es: { empty:'Ingresa tu email', bad:'Email inválido', ok:"🎉 ¡Estás!", err:'Error.', wait:'...' }
  };
  const t = T[lang] || T.en;
  if (!email) { msg.textContent = t.empty; msg.style.color = '#ef4444'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = t.bad; msg.style.color = '#ef4444'; return; }
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = t.wait;
  const targetKey = currentEmailTarget || 'hero';
  const targetInput = document.getElementById('ei-' + targetKey);
  if (targetInput) { targetInput.removeAttribute('readonly'); targetInput.value = email; }
  try {
    if (window.kuaboSubmit) await window.kuaboSubmit(targetKey);
    msg.textContent = t.ok; msg.style.color = '#22c55e';
    if (inp) inp.value = '';
    launchConfetti();
    setTimeout(window.closeEmail, 1600);
  } catch(err) { msg.textContent = t.err; msg.style.color = '#ef4444'; }
  btn.disabled = false; btn.textContent = origText;
  if (targetInput) targetInput.setAttribute('readonly', 'readonly');
};

function attachEmailTriggers() {
  ['ei-hero','ei-cta'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('readonly', 'readonly');
    el.addEventListener('click', e => { e.preventDefault(); window.openEmail(id.replace('ei-','')); });
    el.addEventListener('focus', e => { e.preventDefault(); e.target.blur(); window.openEmail(id.replace('ei-','')); });
  });
  ['eb-hero','eb-cta'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.onclick = e => { e.preventDefault(); window.openEmail(id.replace('eb-','')); };
  });
}
document.addEventListener('DOMContentLoaded', attachEmailTriggers);
if (document.readyState !== 'loading') attachEmailTriggers();

// ═══════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════

const obs = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
}, { threshold: .08 });
document.querySelectorAll('.rev').forEach(el => obs.observe(el));

// ═══════════════════════════════════════════════════════════
// GAMIFICATION — DÉMO INTERACTIVE (pas de Firebase)
// ═══════════════════════════════════════════════════════════

(function() {
  let gXP = 150, gCoins = 32, gStreak = 2, gGift = false, gCI = false, gPC = 3;
  const NAMES = ['Nouveau','Explorer','Builder','Fondateur','Légende'];

  window.showGTab = function(n) {
    document.querySelectorAll('.gametab-c').forEach((e, i) => e.style.display = i === n ? 'block' : 'none');
    document.querySelectorAll('.gametab').forEach((b, i) => b.classList.toggle('on', i === n));
  };

  function gToast(msg) {
    let t = document.getElementById('g-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'g-toast';
      t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120px);background:#22c55e;color:#fff;font-family:'Nunito',sans-serif;font-weight:900;font-size:14px;padding:12px 24px;border-radius:20px;display:flex;align-items:center;gap:8px;transition:transform .4s cubic-bezier(.4,0,.2,1);z-index:9999;white-space:nowrap;box-shadow:0 6px 20px rgba(34,197,94,.35);pointer-events:none;";
      t.innerHTML = '<span id="g-toast-msg"></span>';
      document.body.appendChild(t);
    }
    document.getElementById('g-toast-msg').textContent = msg;
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(120px)'; }, 2400);
  }

  function gAddXP(xp, c) {
    gXP += xp; gCoins += c;
    let e;
    e = document.getElementById('g-xp'); if (e) e.textContent = gXP;
    e = document.getElementById('g-coins'); if (e) e.textContent = gCoins;
    const pct = Math.min(((gXP % 150) / 150) * 100, 100);
    e = document.getElementById('g-xpbar'); if (e) e.style.width = pct + '%';
    e = document.getElementById('g-xplbl'); if (e) e.textContent = gXP + ' / 300 → Niv.3';
    const lvl = gXP >= 300 ? 3 : gXP >= 150 ? 2 : 1;
    e = document.getElementById('g-lvl'); if (e) e.textContent = lvl;
    e = document.getElementById('g-name'); if (e) e.textContent = NAMES[Math.min(lvl, 4)];
    gConf();
  }

  function gConf() {
    const cs = ['#e8b84b','#2dd4bf','#22c55e','#f97316','#a78bfa'];
    const ct = document.getElementById('cc');
    if (!ct) return;
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'cf';
      el.style.cssText = `left:${Math.random()*100}%;top:-8px;background:${cs[i%5]};width:${6+Math.random()*7}px;height:${6+Math.random()*7}px;border-radius:${Math.random()>.5?'50%':'2px'};animation-delay:${Math.random()*.3}s;animation-duration:${1.1+Math.random()*.7}s;`;
      ct.appendChild(el);
      setTimeout(() => { if (el.parentNode) el.remove(); }, 2200);
    }
  }

  window.gCheckin = function() {
    if (gCI) { gToast("Déjà fait aujourd'hui !"); return; }
    gCI = true; gStreak++;
    const p = document.getElementById('g-ci-pill'); if (p) p.textContent = '✅ Fait aujourd\'hui';
    const em = document.getElementById('g-ci-em'); if (em) em.textContent = '✅';
    const ds2 = document.querySelectorAll('.gday'); if (ds2[gStreak-1]) ds2[gStreak-1].classList.add('on');
    const sl = document.getElementById('g-streak'); if (sl) sl.textContent = gStreak + ' jours de suite';
    gAddXP(10, 3); gToast('+10 XP · Streak ×' + gStreak + ' 🔥');
  };
  window.gCards = function() { gAddXP(50, 12); gToast('🃏 Carte débloquée ! +50 XP'); };
  window.gChallenge = function() { gAddXP(100, 25); gToast('⚔️ Défi complété ! +100 XP 🎉'); };
  window.gLeader = function() { gToast('🏆 Tu es #47 mondial !'); };
  window.gOpenGift = function() {
    if (gGift) { gToast('Cadeau déjà réclamé !'); return; }
    const m = document.getElementById('g-gift-modal');
    if (m) { m.style.display = 'flex'; m.style.alignItems = 'center'; m.style.justifyContent = 'center'; }
  };
  window.gGiftAction = function() {
    const btn = document.getElementById('g-modal-btn');
    if (btn && !btn.dataset.opened) {
      btn.dataset.opened = '1';
      document.getElementById('g-modal-emoji').textContent = '🎉';
      document.getElementById('g-modal-title').textContent = 'Incroyable !';
      document.getElementById('g-modal-sub').textContent = 'Prochain cadeau demain';
      const r = document.getElementById('g-modal-rwds'); if (r) r.style.display = 'flex';
      btn.textContent = 'Fermer ✕';
      gGift = true;
      const gi = document.getElementById('g-gift-icon'); if (gi) gi.textContent = '✅';
      gAddXP(25, 10); gConf();
    } else {
      const m = document.getElementById('g-gift-modal'); if (m) m.style.display = 'none';
    }
  };
  window.gAddFlag = function(flag, name) {
    const row = document.getElementById('g-flags');
    if (!row) return;
    const d = document.createElement('div');
    d.className = 'gflag'; d.style.animation = 'flagIn .4s ease both';
    d.innerHTML = `<span style="font-size:24px;">${flag}</span><span style="font-size:8px;font-weight:700;color:var(--navy);">${name}</span>`;
    row.appendChild(d); gPC++;
    let e;
    e = document.getElementById('g-pc'); if (e) e.textContent = gPC;
    e = document.getElementById('g-pc2'); if (e) e.textContent = gPC;
    e = document.getElementById('g-xpt'); if (e) e.textContent = parseInt(e.textContent) + 50;
    e = document.getElementById('g-gps'); if (e) e.textContent = parseInt(e.textContent) + 1;
    gAddXP(50, 10); gToast('📍 ' + name + ' ajouté ! +50 XP');
  };

  document.addEventListener('click', e => {
    const m = document.getElementById('g-gift-modal');
    if (m && e.target === m) m.style.display = 'none';
  });
})();

// ═══════════════════════════════════════════════════════════
// TRADUCTIONS — FR / EN / ES
// ═══════════════════════════════════════════════════════════

const TX = {
  en:{et:"🌍 Worldwide — Not just the USA",h1:"The #1 app to guide your<br/><span class=\"highlight\">travel & settlement</span>",hs:"Move to the USA, Canada, France or anywhere in the world — Kuabo guides you step by step after your visa. Documents, housing, jobs, community. Free.",chips:["World Cup 2026","DV Lottery","Tourism","Work visa","US Army","Student"],clt:"people already waiting",nvcta:"Get started",s1:"Settlement phases",s2:"Languages — FR·EN·ES",s3:"Kuabo AI",s4:"Free forever",ftag:"Inside Kuabo",fh2:"Everything you need, every day",fsub:"Built for real Global Movers — documents, deadlines, AI, community.",c1t:"⏱ Smart Deadlines",c1d:"Kuabo auto-calculates every deadline from your arrival date. SSN in 10 days, bank in 14, taxes in 90.",c2t:"⭐ Score & Badges",c2d:"Every step earns points and unlocks badges. Your Global Mover journey becomes a personal challenge.",c3t:"💰 Budget & Stores",c3d:"Monthly budget by state/country + store guide. Everything to spend smart from day one.",c4t:"🤖 Kuabo AI",c4d:"Ask anything, get an instant answer. SSN, bank, housing, taxes — 24/7 in 3 languages.",c5t:"🎖 US Army Guide",c5d:"For DV holders thinking about the Army — naturalization in 1 year, base finder, ASVAB guide.",c6t:"📍 Services Map",c6d:"SSA, DMV, USCIS, banks, clinics — all near you in real time. Worldwide coverage.",posh2:"#1 App to guide your travel & settlement",possub:"From stressed and lost — to guided, confident, and settled.",btag:"Kuabo Badges",bh2:"Unlock badges as you settle",bsub:"Every step you complete earns points and unlocks a badge.",bdl:"How badges unlock",bdprog:"PROGRESS",bdstep:"3/4 steps done",bds:["Book SSA appointment","Gather documents","Visit SSA office"],bstep4:"Receive SSN card → Badge unlocks! 🎉",gtag:"Kuabo Play",gh2:"Your journey becomes<br/><span style=\"color:var(--gold);\">a game</span>",gsub:"XP, badges, challenges, world passport — every step rewarded. Free forever.",wtag:"Not just the USA",wh2:"Kuabo goes wherever you go",wsub:"From New York to Paris, from Toronto to Mexico City — Kuabo is your guide worldwide.",rftag:"Red Flags",rfh2:"Are you making these mistakes?",rfsub:"Global Movers who don't use Kuabo often struggle with these.",rf:["No SSN after 2 weeks in the USA","Still using your home country SIM card","Paying in cash — no US bank account","Not following @Kuabo.co on social media","Having a Global Mover friend without Kuabo","Arriving with no plan, no guide, no Kuabo"],nltag:"Important",nlh2:"Kuabo is NOT a visa lottery app.",nlsub:"Kuabo starts where your visa ends.",cnoh:"Kuabo does NOT",cn:["Enter the DV Lottery for you","File your visa application","Handle settlement legal cases","Replace an immigration lawyer"],cyesh:"Kuabo DOES",cy:["Guide you step by step after your visa","Track deadlines — SSN, bank, taxes, ID","AI assistant in your language 24/7","Services map, budget, community, Army"],whotag:"For everyone",whoh2:"For all Global Movers,<br/>whatever your situation",whosub:"DV Lottery, work visa, family, Army, Dream Chaser — Kuabo adapts to you worldwide.",who:[["DV Lottery","Diversity Visa — full guide from day one"],["Work visa","H-1B, L-1, O-1, TN — pro integration"],["Family","I-130, Fiancé(e) — join your loved ones"],["US Army","Soldiers & DV — naturalization in 1 year"],["Students","F-1, OPT, STEM — student life abroad"],["Dream Chasers","New Arrivals starting fresh anywhere"]],howtag:"How it works",howh2:"3 steps, everything becomes simple",st:["Create your profile","Your roadmap activates","You advance guided"],sd:["Visa type, arrival date, country. Kuabo calculates everything automatically.","Steps organized by priority. Check them off and earn badges.","AI, services map, community — you're never alone, wherever you settle."],wct:"World Cup 2026 — Kuabo is ready",wcd:"USA, Canada, Mexico — Kuabo prepares your trip, visa, hotels, tickets.",soctag:"Community",soctit:"Follow us, stay informed",socsub:"News, settlement tips, launch date — all on our socials.",ctah:"Don't miss the launch",ctas:"Join the first Global Movers to get Kuabo. We'll email you the moment the app goes live worldwide.",ctacl:"people already waiting",stot:"Coming soon worldwide!",stod:"Kuabo is coming very soon to App Store and Google Play. Sign up to be the first!",fpriv:"Privacy",fterm:"Terms",ftag2:"For people brave enough to move. 🌍",dt:["Your roadmap","Smart deadlines","Badges & Score","That's just the beginning!"],ddt:["5 phases from arrival to citizenship.","Kuabo auto-calculates every deadline.","Every completed step unlocks a badge.","AI, community, Army guide, services map — worldwide. Free."],di:["SSN appointment booked","Bank account opened","Driver's license"],dis:"⭐ Score 450 · Explorer",dl:["Urgent deadline","Social Security #","days left","Done ✅","Guide 📖"],db:["SSN Master","+200 points — Relief! 😌"]},
  fr:{et:"🌍 Partout dans le monde — Pas que les USA",h1:"L'app #1 pour guider ton<br/><span class=\"highlight\">voyage & installation</span>",hs:"Que tu t'installes aux USA, au Canada, en France ou ailleurs — Kuabo te guide étape par étape après ton visa. Documents, logement, emploi, communauté. Gratuit.",chips:["Coupe du Monde 2026","DV Lottery","Tourisme","Visa travail","US Army","Étudiant"],clt:"personnes en attente",nvcta:"Commencer",s1:"Phases d'installation",s2:"Langues — FR·EN·ES",s3:"Kuabo AI",s4:"100% gratuit",ftag:"Dans Kuabo",fh2:"Tout ce dont tu as besoin, chaque jour",fsub:"Fait pour de vrais Global Movers — documents, deadlines, IA, communauté.",c1t:"⏱ Deadlines intelligentes",c1d:"Kuabo calcule automatiquement chaque deadline depuis ta date d'arrivée. SSN dans 10 jours, banque dans 14.",c2t:"⭐ Score & Badges",c2d:"Chaque étape rapporte des points et débloque des badges. Ton parcours devient un défi personnel.",c3t:"💰 Budget & Magasins",c3d:"Budget mensuel par état/pays + guide des magasins. Tout pour dépenser intelligemment dès le premier jour.",c4t:"🤖 Kuabo AI",c4d:"Pose n'importe quelle question. SSN, banque, logement, taxes — 24h/24 en 3 langues.",c5t:"🎖 Guide US Army",c5d:"Pour les détenteurs DV qui pensent à l'Army — naturalisation en 1 an.",c6t:"📍 Carte des Services",c6d:"SSA, DMV, USCIS, banques, cliniques — localisés près de toi en temps réel.",posh2:"L'app #1 pour guider ton voyage & installation",possub:"De stressé et perdu — à guidé, confiant et installé. C'est ce que fait Kuabo.",btag:"Badges Kuabo",bh2:"Débloque des badges en t'installant",bsub:"Chaque étape complétée rapporte des points et débloque un badge.",bdl:"Comment les badges se débloquent",bdprog:"PROGRESSION",bdstep:"3/4 étapes faites",bds:["Prendre RDV à la SSA","Rassembler les documents","Se rendre à la SSA"],bstep4:"Recevoir la carte SSN → Badge débloqué! 🎉",gtag:"Kuabo Play",gh2:"Ton parcours devient<br/><span style=\"color:var(--gold);\">un jeu</span>",gsub:"XP, badges, défis, passeport mondial — chaque étape récompensée. Gratuit pour toujours.",wtag:"Pas que les USA",wh2:"Kuabo va là où tu vas",wsub:"De New York à Paris, de Toronto à Mexico — Kuabo est ton guide d'installation partout.",rftag:"Red Flags",rfh2:"Tu fais ces erreurs ?",rfsub:"Les Global Movers sans Kuabo galèrent souvent avec ça.",rf:["Pas de SSN après 2 semaines aux USA","Encore ta SIM de ton pays d'origine","Payer tout en cash — pas de compte US","Pas abonné à @Kuabo.co sur les réseaux","Un ami Global Mover sans Kuabo","Arriver sans plan, sans guide, sans Kuabo"],nltag:"Important",nlh2:"Kuabo n'est PAS une app de loterie.",nlsub:"Kuabo commence là où ton visa s'arrête.",cnoh:"Kuabo ne fait PAS",cn:["Participer à la DV Lottery","Déposer ta candidature visa","Gérer des dossiers légaux","Remplacer un avocat"],cyesh:"Kuabo fait",cy:["Te guider après l'obtention du visa","Suivre les deadlines — SSN, banque, taxes","IA dans ta langue 24h/24","Carte services, budget, communauté, Army"],whotag:"Pour qui",whoh2:"Pour tous les Global Movers,<br/>quelle que soit ta situation",whosub:"DV Lottery, visa travail, famille, Army, Dream Chaser — Kuabo s'adapte à toi partout.",who:[["DV Lottery","Diversity Visa — guide complet dès le premier jour"],["Visa travail","H-1B, L-1, O-1, TN — intégration pro"],["Famille","I-130, Fiancé(e) — rejoindre tes proches"],["US Army","Soldats & DV — naturalisation en 1 an"],["Etudiants","F-1, OPT, STEM — vie étudiante à l'étranger"],["Dream Chasers","New Arrivals qui recommencent n'importe où"]],howtag:"Comment ça marche",howh2:"3 étapes, tout devient simple",st:["Tu crées ton profil","Ton parcours s'active","Tu avances guidé"],sd:["Visa, date d'arrivée, pays. Kuabo calcule tout automatiquement.","Etapes par priorité. Tu coches et tu gagnes des badges.","IA, carte des services, communauté — plus jamais seul, où que tu sois."],wct:"Coupe du Monde 2026 — Kuabo est là",wcd:"USA, Canada, Mexique — Kuabo prépare ton voyage, visa, hôtels, billets.",soctag:"Communauté",soctit:"Suis-nous, reste informé",socsub:"Actualités, conseils installation, date de lancement — tout sur nos réseaux.",ctah:"Ne rate pas le lancement",ctas:"Rejoins les premiers Global Movers à recevoir Kuabo. On t'envoie un email dès que l'app est disponible partout.",ctacl:"personnes en attente",stot:"Bientôt disponible partout!",stod:"L'app Kuabo arrive très prochainement. Inscris-toi!",fpriv:"Confidentialité",fterm:"Conditions",ftag2:"Pour ceux qui osent bouger. 🌍",dt:["Ta feuille de route","Deadlines intelligentes","Badges & Score","C'est juste le début!"],ddt:["5 phases de l'atterrissage à la citoyenneté.","Kuabo calcule automatiquement chaque deadline.","Chaque étape débloque un badge. Score 0 à 1000!","IA, communauté, guide Army, carte services — partout. Gratuit."],di:["RDV SSA réservé","Compte bancaire ouvert","Permis de conduire"],dis:"⭐ Score 450 · Explorer",dl:["Deadline urgente","Sécurité Sociale","jours restants","Fait ✅","Guide 📖"],db:["SSN Master","+200 points — Soulagement! 😌"]},
  es:{et:"🌍 En todo el mundo — No solo EE.UU.",h1:"La app #1 para guiar tu<br/><span class=\"highlight\">viaje & instalación</span>",hs:"Múdate a EE.UU., Canadá, Francia o cualquier parte — Kuabo te guía paso a paso después de tu visa. Documentos, vivienda, empleo, comunidad. Gratis.",chips:["Copa del Mundo 2026","Lotería DV","Turismo","Visa trabajo","US Army","Estudiante"],clt:"personas esperando",nvcta:"Empezar",s1:"Fases de instalación",s2:"Idiomas — FR·EN·ES",s3:"Kuabo AI",s4:"100% gratuito",ftag:"Dentro de Kuabo",fh2:"Todo lo que necesitas, cada día",fsub:"Hecho para Global Movers reales — documentos, plazos, IA, comunidad.",c1t:"⏱ Plazos Inteligentes",c1d:"Kuabo calcula automáticamente cada plazo desde tu fecha de llegada.",c2t:"⭐ Score & Insignias",c2d:"Cada paso gana puntos y desbloquea insignias. Tu camino se convierte en un reto personal.",c3t:"💰 Presupuesto & Tiendas",c3d:"Presupuesto mensual por estado/país + guía de tiendas.",c4t:"🤖 Kuabo AI",c4d:"Pregunta lo que sea. SSN, banco, vivienda, impuestos — disponible 24/7 en 3 idiomas.",c5t:"🎖 Guía US Army",c5d:"Para titulares de DV que piensan en el Army — naturalización en 1 año.",c6t:"📍 Mapa de Servicios",c6d:"SSA, DMV, USCIS, bancos, clínicas — todos cerca de ti en tiempo real.",posh2:"La app #1 para guiar tu viaje & instalación",possub:"De estresado y perdido — a guiado, confiado e instalado.",btag:"Insignias Kuabo",bh2:"Desbloquea insignias mientras te instalas",bsub:"Cada paso que completas gana puntos y desbloquea una insignia.",bdl:"Cómo se desbloquean las insignias",bdprog:"PROGRESO",bdstep:"3/4 pasos hechos",bds:["Reservar cita en SSA","Reunir documentos","Visitar la oficina SSA"],bstep4:"Recibir tarjeta SSN → ¡Insignia desbloqueada! 🎉",gtag:"Kuabo Play",gh2:"Tu camino se convierte<br/><span style=\"color:var(--gold);\">en un juego</span>",gsub:"XP, insignias, retos, pasaporte mundial — cada paso recompensado. Gratis.",wtag:"No solo EE.UU.",wh2:"Kuabo va donde tú vas",wsub:"De Nueva York a París, de Toronto a Ciudad de México — Kuabo es tu guía.",rftag:"Red Flags",rfh2:"¿Estás cometiendo estos errores?",rfsub:"Los Global Movers sin Kuabo suelen tener problemas con esto.",rf:["Sin SSN después de 2 semanas en EE.UU.","Todavía usando tu SIM de tu país","Pagando en efectivo — sin cuenta bancaria","Sin seguir a @Kuabo.co en redes","Un amigo Global Mover sin Kuabo","Llegar sin plan, sin guía, sin Kuabo"],nltag:"Importante",nlh2:"Kuabo NO es una app de lotería.",nlsub:"Kuabo empieza donde termina tu visa.",cnoh:"Kuabo NO hace",cn:["Participar en la Lotería DV","Presentar tu solicitud de visa","Gestionar casos legales","Reemplazar a un abogado"],cyesh:"Kuabo HACE",cy:["Guiarte paso a paso después de tu visa","Seguir plazos — SSN, banco, impuestos","IA en tu idioma 24/7","Mapa servicios, presupuesto, comunidad, Army"],whotag:"Para quién",whoh2:"Para todos los Global Movers,<br/>sin importar tu situación",whosub:"Lotería DV, visa trabajo, familia, Army, Dream Chaser — Kuabo se adapta a ti.",who:[["Lotería DV","Diversity Visa — guía completa desde el primer día"],["Visa trabajo","H-1B, L-1, O-1, TN — integración profesional"],["Familia","I-130, Prometido(a) — reunirte con tus seres queridos"],["US Army","Soldados & DV — naturalización en 1 año"],["Estudiantes","F-1, OPT, STEM — vida estudiantil en el extranjero"],["Dream Chasers","New Arrivals comenzando de cero en cualquier lugar"]],howtag:"Cómo funciona",howh2:"3 pasos, todo se vuelve simple",st:["Crea tu perfil","Tu hoja de ruta se activa","Avanzas con orientación"],sd:["Visa, fecha de llegada, país. Kuabo lo calcula todo automáticamente.","Pasos por prioridad. Márcalos y gana insignias.","IA, mapa de servicios, comunidad — nunca más solo, donde sea."],wct:"Copa del Mundo 2026 — Kuabo está listo",wcd:"EE.UU., Canadá, México — Kuabo prepara tu viaje, visa, hoteles, entradas.",soctag:"Comunidad",soctit:"Síguenos, mantente informado",socsub:"Noticias, consejos de instalación, fecha de lanzamiento — todo en nuestras redes.",ctah:"No te pierdas el lanzamiento",ctas:"Únete a los primeros Global Movers en recibir Kuabo.",ctacl:"personas esperando",stot:"¡Próximamente en todo el mundo!",stod:"La app Kuabo llega muy pronto. ¡Regístrate!",fpriv:"Privacidad",fterm:"Términos",ftag2:"Para los valientes que se atreven a moverse. 🌍",dt:["Tu hoja de ruta","Plazos inteligentes","Insignias & Score","¡Eso es solo el comienzo!"],ddt:["5 fases del aterrizaje a la ciudadanía.","Kuabo calcula automáticamente cada plazo.","Cada paso desbloquea una insignia.","IA, comunidad, guía Army, mapa servicios — mundial. Gratis."],di:["Cita SSA reservada","Cuenta bancaria abierta","Licencia de conducir"],dis:"⭐ Score 450 · Explorer",dl:["Plazo urgente","Seguridad Social","días restantes","Hecho ✅","Guía 📖"],db:["SSN Master","+200 puntos — ¡Alivio! 😌"]}
};

function s(id, v, html) { const el = document.getElementById(id); if (el) { if (html) el.innerHTML = v; else el.textContent = v; } }

window.setL = function(l) {
  document.documentElement.lang = l;
  document.querySelectorAll('.lb').forEach(b => b.classList.toggle('on', b.textContent.includes(l==='en'?'EN':l==='fr'?'FR':'ES')));
  const t = TX[l];
  s('etxt',t.et,true); s('h1',t.h1,true); s('hsub',t.hs);
  ['.c-wc','.c-dv','.c-to','.c-wk','.c-ar','.c-st'].forEach((k,i) => document.querySelectorAll(k).forEach(e => e.textContent = t.chips[i]));
  s('clt',t.clt);
  const nc = document.getElementById('nav-cta'); if (nc) nc.textContent = t.nvcta;
  s('s1',t.s1); s('s2',t.s2); s('s3',t.s3); s('s4',t.s4);
  ['s1l','s2l','s3l','s4l'].forEach(id => s(id, t.s1l || 'Coming soon on'));
  s('ftag',t.ftag); s('fh2',t.fh2); s('fsub',t.fsub);
  for (let i = 1; i <= 6; i++) { s('c'+i+'t',t['c'+i+'t'],true); s('c'+i+'d',t['c'+i+'d']); }
  if (document.getElementById('pos-h2')) { s('pos-h2',t.posh2); s('pos-sub',t.possub); }
  s('btag',t.btag); s('bh2',t.bh2); s('bsub',t.bsub);
  s('bdemo-lbl',t.bdl); s('bdemo-prog',t.bdprog); s('bdemo-step',t.bdstep);
  if (t.bds) { s('bst1',t.bds[0]); s('bst2',t.bds[1]); s('bst3',t.bds[2]); }
  if (document.getElementById('bst4')) document.getElementById('bst4').innerHTML = t.bstep4;
  if (t.gtag) { s('gtag',t.gtag); s('gh2',t.gh2,true); s('gsub',t.gsub); }
  s('wtag',t.wtag); s('wh2',t.wh2); s('wsub',t.wsub);
  s('rftag',t.rftag); s('rfh2',t.rfh2); s('rfsub',t.rfsub);
  t.rf.forEach((v,i) => s('rf'+(i+1),v));
  s('nltag',t.nltag); s('nlh2',t.nlh2); s('nlsub',t.nlsub);
  s('cnoh',t.cnoh); t.cn.forEach((v,i) => s('cn'+(i+1),v));
  s('cyesh',t.cyesh); t.cy.forEach((v,i) => s('cy'+(i+1),v));
  s('whotag',t.whotag); s('whoh2',t.whoh2,true); s('whosub',t.whosub);
  t.who.forEach((v,i) => { s('w'+(i+1)+'t',v[0]); s('w'+(i+1)+'d',v[1]); });
  s('howtag',t.howtag); s('howh2',t.howh2);
  t.st.forEach((v,i) => { s('st'+(i+1),v); s('sd'+(i+1),t.sd[i]); });
  s('wct',t.wct); s('wcd',t.wcd); s('soctag',t.soctag); s('soctit',t.soctit); s('socsub',t.socsub);
  s('ctah',t.ctah); s('ctas',t.ctas); s('ctacl',t.ctacl);
  s('stot',t.stot); s('stod',t.stod); s('fpriv',t.fpriv); s('fterm',t.fterm); s('ftag',t.ftag2,true);
  t.dt.forEach((v,i) => { s('dt'+i,v); s('dd'+i+'t',t.ddt[i]); });
  t.di.forEach((v,i) => s('di'+i,v)); s('di3',t.dis,true);
  t.dl.forEach((v,i) => s('dl'+i,v,true));
  t.db.forEach((v,i) => s('db'+i,v));
  document.querySelectorAll('input[type=email]').forEach(inp => {
    inp.placeholder = l==='fr'?'Ton adresse email':l==='es'?'Tu dirección de email':'Your email address';
  });
  const emt = document.getElementById('emtitle');
  if (emt) emt.textContent = l==='fr'?'Accès anticipé 🚀':l==='es'?'Acceso anticipado 🚀':'Get early access 🚀';
  const emd = document.getElementById('emdesc');
  if (emd) emd.textContent = l==='fr'?"Entre ton email et on te notifie au moment où Kuabo sort partout.":l==='es'?"Ingresa tu email y te notificaremos en cuanto Kuabo se lance.":"Enter your email and we'll notify you the moment Kuabo launches worldwide.";
  const emi = document.getElementById('ei-modal');
  if (emi) emi.placeholder = l==='fr'?'ton@email.com':l==='es'?'tu@email.com':'your@email.com';
  const ems = document.getElementById('eb-modal');
  if (ems) ems.innerHTML = (l==='fr'?'Me notifier ':l==='es'?'Notificarme ':'Get notified ') + '🚀';
  const btnTxt = l==='fr'?'Me notifier 🚀':l==='es'?'Notificarme 🚀':'Get notified 🚀';
  ['eb-hero','eb-cta','eb-demo'].forEach(id => { const b = document.getElementById(id); if (b) b.textContent = btnTxt; });
  const sb = document.getElementById('eb-store');
  if (sb) sb.textContent = l==='fr'?'Notifie-moi 🚀':l==='es'?'Avisarme 🚀':'Notify me 🚀';
  const loginBtn = document.querySelector('.nav-btn-outline');
  if (loginBtn) loginBtn.textContent = l==='fr'?'Connexion':l==='es'?'Iniciar sesión':'Log in';
  document.querySelectorAll('.dmskip').forEach(b => b.textContent = l==='fr'?'Passer':l==='es'?'Saltar':'Skip');
};

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
window.addEventListener("load", loadCount);
