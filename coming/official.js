// official.js — site officiel Kuabo (/coming)

// ---- Langue (partagée avec le reste du site via kuabo_lang) ----
function setL(lang){
  try{ localStorage.setItem('kuabo_lang', lang); }catch(e){}
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang]').forEach(function(el){
    el.classList.toggle('show', el.dataset.lang === lang);
  });
  document.querySelectorAll('.lb').forEach(function(b){ b.classList.remove('on'); });
  var btn = document.getElementById('lb-' + lang);
  if (btn) btn.classList.add('on');
  document.title = ({
    en:'Kuabo — The #1 app for Global Movers',
    fr:'Kuabo — L’app #1 pour les Global Movers',
    es:'Kuabo — La app #1 para Global Movers'
  })[lang];
}
window.setL = setL;

(function initLang(){
  var stored;
  try{ stored = localStorage.getItem('kuabo_lang'); }catch(e){}
  var browser = (navigator.language || 'en').slice(0,2).toLowerCase();
  setL(stored || (['fr','es','en'].indexOf(browser) !== -1 ? browser : 'en'));
})();

// ---- Reveal au scroll ----
(function reveal(){
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function(el){ io.observe(el); });
})();
