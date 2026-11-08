/* Teach · i ritratti a due colori, composti a pezzi. Ogni allievo ha solo l'elenco dei pezzi scelti da Giorgia. */
const Ritratti=(()=>{
  const K="#1F2328",P="#EFE9DF";
  let n=0;
  const O={
    capelli:[["calvo","Nessuno"],["rasati","Rasati"],["corti","Corti"],["ciuffo","Ciuffo"],["mossi","Mossi"],["ricci","Ricci"],["afro","Afro"],["caschetto","Caschetto"],["lunghi","Lunghi"],["onde","Onde"],["codini","Codini"],["chignon","Chignon"],["berretto","Berretto"]],
    barba:[["no","Niente"],["baffi","Baffi"],["pizzetto","Pizzetto"],["piena","Barba"]],
    occhiali:[["no","Niente"],["tondi","Tondi"],["squadrati","Squadrati"],["scuri","Da sole"]],
    dettaglio:[["no","Niente"],["orecchini","Orecchini"],["cuffie","Cuffie"],["lentiggini","Lentiggini"]],
    maglia:[["nera","Tinta unita"],["righe","Righe"],["colletto","Colletto"],["dolcevita","Dolcevita"],["tracolla","Tracolla"]]
  };
  const c=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${K}"/>`;
  const f=d=>`<path d="${d}" fill="${K}"/>`;
  const frangia="M32 58c-2-24 12-40 28-40s30 16 28 40c-6-12-14-22-28-26-14 4-22 14-28 26z";
  const DIETRO={
    afro:c(60,48,46),
    lunghi:f("M25 60c-2-32 13-50 35-50s37 18 35 50c0 18 5 34 9 44-12 9-27 8-34 2V70H50v36c-7 6-22 7-34-2 4-10 9-26 9-44z"),
    onde:[[28,42,13],[23,60,13],[24,78,13],[20,94,12],[92,42,13],[97,60,13],[96,78,13],[100,94,12],[60,22,22],[40,26,15],[80,26,15]].map(a=>c(...a)).join(""),
    codini:`<ellipse cx="21" cy="74" rx="9" ry="23" fill="${K}"/><ellipse cx="99" cy="74" rx="9" ry="23" fill="${K}"/>`,
    chignon:c(60,12,14)
  };
  const SOPRA={
    rasati:f("M33 52c1-23 14-34 27-34s26 11 27 34c-8-11-17-15-27-15s-19 4-27 15z"),
    corti:f("M30 58c-4-28 12-44 32-44s34 15 29 44c-3-9-8-15-14-18-13 6-31 6-40 2-3 4-5 9-7 16z"),
    ciuffo:f("M31 58c-6-27 11-44 33-44 19 0 31 15 27 44-2-9-5-14-9-17-17 2-31-2-39-11-5 6-10 15-12 28z"),
    mossi:[[35,44,9],[40,31,10],[52,23,10],[66,22,10],[79,29,10],[85,42,9]].map(a=>c(...a)).join("")+f("M36 46c8-12 40-14 48 0-10-5-38-5-48 0z"),
    ricci:[[34,40,13],[42,26,13],[56,18,13],[71,20,13],[83,30,13],[89,44,13],[29,56,13],[92,58,13]].map(a=>c(...a)).join(""),
    afro:f("M34 50c5-14 15-20 26-20s21 6 26 20c-8-7-17-10-26-10s-18 3-26 10z"),
    caschetto:f("M60 14C30 14 20 36 22 62c1 15-7 25-4 33 11 6 20 2 25-3-7-13-9-27-7-38 13 0 27-6 34-17 6 11 15 15 24 17 2 12 0 25-7 38 5 5 14 9 25 3 3-8-5-18-4-33 2-26-10-48-48-48z"),
    lunghi:f(frangia),onde:f(frangia),codini:f("M32 58c-3-26 11-42 28-42s31 16 28 42c-5-10-13-16-28-18-15 2-23 8-28 18z"),
    chignon:f("M32 56c-2-24 12-38 28-38s30 14 28 38c-6-11-15-18-28-20-13 2-22 9-28 20z"),
    berretto:f("M29 50c0-24 14-37 31-37s31 13 31 37z")+`<rect x="27" y="44" width="66" height="11" rx="4" fill="${K}"/><path d="M29 49h62" stroke="${P}" stroke-width="1.6" stroke-dasharray="3 4"/>`
  };
  function corpo(m,id){
    const b="M14 132c3-26 22-38 46-38s43 12 46 38z";
    if(m==="righe")return`<clipPath id="r${id}"><path d="${b}"/></clipPath><path d="${b}" fill="${P}" stroke="${K}" stroke-width="2.5"/><g clip-path="url(#r${id})" stroke="${K}" stroke-width="4">${[104,112,120,128].map(y=>`<path d="M0 ${y}h120"/>`).join("")}</g>`;
    if(m==="colletto")return`<path d="${b}" fill="${P}" stroke="${K}" stroke-width="2.5"/><path d="M60 100c-6 4-12 8-18 8-1-5 1-10 7-13zM60 100c6 4 12 8 18 8 1-5-1-10-7-13z" fill="${P}" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if(m==="tracolla")return`<path d="${b}" fill="${K}"/><path d="M33 103l52 29" stroke="${P}" stroke-width="7"/><path d="M33 103l52 29" stroke="${K}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
    return`<path d="${b}" fill="${K}"/>`;
  }
  /* senza ritratto: sagoma scura con le iniziali, così si vede subito chi è ancora da comporre */
  function sagoma(nome){
    const i=(nome||"").split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase();
    return`<svg viewBox="0 0 120 132" aria-hidden="true"><path d="M14 132c3-26 22-38 46-38s43 12 46 38z" fill="${K}"/><rect x="51" y="78" width="18" height="24" fill="${K}"/><ellipse cx="60" cy="58" rx="29" ry="33" fill="${K}"/><text x="60" y="66" text-anchor="middle" font-family="Familjen Grotesk,sans-serif" font-size="23" font-weight="700" fill="${P}">${i}</text></svg>`;
  }
  function disegna(r,nome){
    if(!r)return sagoma(nome);
    const id=++n,cap=r.capelli||"calvo",ba=r.barba||"no",oc=r.occhiali||"no",de=r.dettaglio||"no",ma=r.maglia||"nera";
    const collo=ma==="dolcevita"?`<rect x="48" y="84" width="24" height="20" rx="5" fill="${K}"/>`:"";
    const barba=ba==="piena"?f("M31 64c1 20 12 33 29 33s28-13 29-33c-3 6-6 9-10 9-5-5-12-6-19-6s-14 1-19 6c-4 0-7-3-10-9z"):ba==="baffi"?f("M47 74c5-4 10-4 13-1 3-3 8-3 13 1-5 3-10 3-13 1-3 2-8 2-13-1z"):ba==="pizzetto"?f("M51 86c3 6 6 8 9 8s6-2 9-8c-3 2-6 3-9 3s-6-1-9-3z"):"";
    const occhi=oc==="scuri"?c(48,62,9)+c(72,62,9)+`<path d="M57 61h6" stroke="${K}" stroke-width="2.5"/>`:c(49,62,3)+c(71,62,3);
    const lenti=oc==="tondi"?`<g fill="none" stroke="${K}" stroke-width="2.3"><circle cx="48" cy="62" r="9"/><circle cx="72" cy="62" r="9"/><path d="M57 61h6"/></g>`:oc==="squadrati"?`<g fill="none" stroke="${K}" stroke-width="2.3"><rect x="38" y="55" width="19" height="14" rx="3"/><rect x="63" y="55" width="19" height="14" rx="3"/><path d="M57 61h6"/></g>`:"";
    const bocca=ba==="baffi"?"M53 81c4 3 10 3 14 0":"M51 78c5 5 13 5 18 0";
    const sopraBocca=ba==="piena"?P:K;
    const det=de==="orecchini"?c(31,74,3.2)+c(89,74,3.2):de==="lentiggini"?[[42,71],[47,74],[38,74],[78,71],[73,74],[82,74]].map(a=>c(a[0],a[1],1.2)).join(""):"";
    const cuffie=de==="cuffie"?`<path d="M26 62C26 26 94 26 94 62" fill="none" stroke="${K}" stroke-width="6"/><rect x="21" y="55" width="12" height="24" rx="5" fill="${K}"/><rect x="87" y="55" width="12" height="24" rx="5" fill="${K}"/>`:"";
    return`<svg viewBox="0 0 120 132" aria-hidden="true">${DIETRO[cap]||""}${corpo(ma,id)}<rect x="51" y="78" width="18" height="24" fill="${P}"/>${collo}<ellipse cx="60" cy="58" rx="29" ry="33" fill="${P}" stroke="${K}" stroke-width="2.5"/>${barba}${occhi}<path d="${bocca}" fill="none" stroke="${sopraBocca}" stroke-width="2.5" stroke-linecap="round"/>${lenti}${det}${SOPRA[cap]||""}${cuffie}</svg>`;
  }
  return {disegna,O};
})();
