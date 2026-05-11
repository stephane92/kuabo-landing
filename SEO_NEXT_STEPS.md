# 🎯 Kuabo.co — Actions SEO à faire par Stéphane

> Document généré le 2026-05-11 après le sprint SEO complet.
> Les fichiers techniques sont déjà en place (meta tags, Schema.org, og-image, robots.txt, sitemap.xml, security headers, manifest PWA).
> Il reste les actions **externes** que seul toi peux faire (besoin de tes comptes Google, etc.).

---

## ✅ 1. Google Search Console — Soumettre le sitemap (10 min)

### Pourquoi
Google Search Console = tableau de bord officiel Google pour voir comment ton site rank, quelles requêtes amènent du trafic, quels bugs Google détecte.
**Soumettre ton sitemap = Google indexe ton site 10x plus vite.**

### Étapes
1. Va sur https://search.google.com/search-console
2. Connecte-toi avec ton compte Google (le même qui gère tes autres trucs Kuabo)
3. **Add property** → choisis **URL prefix** → `https://kuabo.co`
4. Google va te demander de vérifier la propriété. Choisis **HTML tag** ou **DNS** :
   - **HTML tag** (le plus simple) : copie le tag `<meta name="google-site-verification" ...>` qu'il te donne, et envoie-le moi. Je l'ajouterai dans index.html, on push, Google vérifiera.
   - **DNS** : ajoute un enregistrement TXT dans tes DNS Vercel/Cloudflare/wherever
5. Une fois vérifié → menu **Sitemaps** (gauche) → entre `https://kuabo.co/sitemap.xml` → Submit
6. Attends 1-3 jours, Google va commencer à crawler ton site

### Bonus
Dans Search Console :
- **Performance** → voit quelles requêtes amènent du trafic (essentiel)
- **Coverage** → voit les erreurs d'indexation
- **Enhancements → Rich Results** → voit si ton Schema.org est bien lu

---

## ✅ 2. Bing Webmaster Tools (5 min, optionnel mais utile)

Bing = 3% du marché mais aussi DuckDuckGo + Yahoo qui utilisent l'index Bing. + **ChatGPT browse mode utilise Bing**.

1. Va sur https://www.bing.com/webmasters
2. Connecte-toi avec un compte Microsoft (ou crée-en un)
3. **Import from Google Search Console** (si tu as fait #1) → tout sera importé auto
4. Sinon, ajoute manuellement `https://kuabo.co` + verify + soumets le sitemap

---

## ✅ 3. Plausible Analytics setup (15 min, 9$/mois)

### Pourquoi Plausible plutôt que Google Analytics
- ✅ **Privacy-first** (GDPR compliant by design, pas de cookies)
- ✅ **Ultra léger** (~1 KB script vs ~50 KB GA)
- ✅ **Dashboard simple et beau** (pas le bordel de GA4)
- ✅ **Pas de bannière cookies obligatoire** = meilleure UX
- ❌ 9$/mois (vs gratuit pour GA4)

### Alternative gratuite : Google Analytics 4
Si tu veux gratuit, je peux installer GA4 à la place. Dis-moi.

### Étapes Plausible
1. Va sur https://plausible.io
2. Sign up (compte perso, 9$/mois pour jusqu'à 10K visites/mois)
3. Add site → entre `kuabo.co`
4. Copie le snippet `<script defer data-domain="kuabo.co" src="https://plausible.io/js/script.js"></script>`
5. Envoie-le moi → je l'ajoute dans index.html → push → installé

### À configurer dans Plausible
- **Goals** : crée un goal "Waitlist Signup" (custom event)
- **Funnel** : crée un funnel "Visit → Hero CTA click → Signup"
- **Outbound link tracking** : actif par défaut

---

## ✅ 4. Crunchbase profile (15 min)

### Pourquoi
- Backlink ultra-puissant (Crunchbase rank très haut sur Google)
- Visibilité investisseurs (essentiel pour ta levée Juin/Juillet)
- Quand on cherche "Kuabo company" sur Google → Crunchbase rank top 3

### Étapes
1. Va sur https://www.crunchbase.com/contributor
2. Sign up (gratuit)
3. **Add a new company** → Kuabo
4. Remplis :
   - Logo : utilise `/icon-512.png` du site
   - Description : copie-colle ta tagline "The #1 app to guide Global Movers..."
   - Founded : 2024
   - Founder : Stéphane Adannou (toi)
   - Headquarters : Maryland, USA
   - Categories : Mobile Apps, Travel, Community
   - Industry : Travel & Tourism, Apps
   - Website : https://kuabo.co
   - Social : tes Insta/TikTok
5. Submit → review Crunchbase (1-3 jours) → publié

---

## ✅ 5. LinkedIn Company Page (10 min)

### Pourquoi
- Profil pro = crédibilité
- Recrute future équipe (post-seed)
- Backlink LinkedIn = SEO + traffic

### Étapes
1. Va sur https://www.linkedin.com/company/setup/new/
2. **Create a company page**
3. Remplis :
   - Name : Kuabo
   - LinkedIn URL : kuabo
   - Website : https://kuabo.co
   - Industry : Mobile Computing Software
   - Company size : 1 (toi solo)
   - Company type : Privately held
   - Logo : `/icon-512.png`
   - Cover : `/og-image.jpg`
   - Tagline : "The #1 app for Global Movers 🌍"
   - About : description longue (je peux te rédiger)
4. Create page → invite tes contacts à follow

---

## ✅ 6. Product Hunt (préparation, pas launch encore)

### Pourquoi
- Le launch day Product Hunt peut amener 5-10K visiteurs
- Backlinks puissants
- Featured app = visibilité tech community

### Préparer maintenant (lancer le jour J de l'app)
1. Va sur https://www.producthunt.com/ship
2. Sign up
3. **Coming soon page** : crée une page "Kuabo coming soon"
4. Pré-collecte des subscribers (ils seront notifiés au launch)
5. **PAS LAUNCH ENCORE** — on attend Mai 2026 jour J

---

## ✅ 7. BetaList (5 min) 🚀 IMPORTANT POUR TA WAITLIST

### Pourquoi BetaList c'est BIG pour Kuabo
- BetaList = annuaire de produits en pré-launch
- Featured = peut amener **1,000-5,000 inscriptions waitlist** en quelques jours
- Beaucoup de startups SaaS ont fait leur waitlist initiale là-bas

### Étapes
1. Va sur https://betalist.com/submit
2. Submit Kuabo (formulaire simple)
3. Approval : ~2-7 jours
4. Si approuvé : tu es dans leur newsletter (50K+ early adopters), homepage

---

## ✅ 8. AngelList / Wellfound (10 min)

### Pourquoi
- Visibilité investisseurs
- Standard pour fundraising
- Recrutement (post-seed)

### Étapes
1. Va sur https://wellfound.com/company/new
2. Remplis profil Kuabo
3. Add founder profile (toi)

---

## 🎯 Ordre recommandé pour aujourd'hui/demain

**Priorité 1 (aujourd'hui, 30 min)** :
1. ✅ Google Search Console → soumets sitemap (10 min)
2. ✅ Crunchbase → crée profile (15 min)
3. ✅ BetaList → submit (5 min)

**Priorité 2 (cette semaine)** :
4. ✅ LinkedIn Company Page (10 min)
5. ✅ Plausible Analytics (15 min) — me revient avec le snippet
6. ✅ Bing Webmaster Tools (5 min)

**Priorité 3 (jour du launch)** :
7. ✅ Product Hunt launch (préparation maintenant, launch jour J)
8. ✅ AngelList / Wellfound (au moment de la levée)

---

## 📊 Ce qui sera fait automatiquement par Vercel

✅ Auto-deploy à chaque push sur main
✅ HTTPS auto (Let's Encrypt)
✅ Gzip/Brotli compression
✅ Edge network mondial (CDN)
✅ Cache headers automatiques

Tu n'as **rien à faire** côté Vercel — tout est managé.

---

## ❓ Questions à me poser quand tu reviens

- "Voici le tag Google Search Console" → je l'ajoute
- "Voici le snippet Plausible" → je l'ajoute
- "Aide-moi à rédiger la description Crunchbase" → on fait
- "Aide-moi à rédiger le LinkedIn About" → on fait
- "Génère-moi le copywriting Product Hunt" → on fait

---

*Document généré par Claude Code, sprint SEO 2026-05-11*
