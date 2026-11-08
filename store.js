/* Teach · il ponte tra l'app e i dati (stessa logica delle gemelle).
   Ogni modifica si applica subito alla copia locale e parte verso Supabase appena c'è rete.
   Tre modi: ?demo = allievi finti; ?locale = dati reali solo su questo computer; altrimenti Supabase.
   In questo file non ci sono mai nomi di allievi. */
const Store=(()=>{
  const SB_URL="https://eiwftkfjivgkxbilhlmr.supabase.co";   /* progetto Supabase dedicato a Teach */
  const SB_KEY="sb_publishable_vaO2BhpW83ttaN_0S_QXsg_0VCqPJ5Q";   /* chiave pubblica: da sola non apre nulla, i dati li protegge la regola "solo giorgia" */
  const COLS=["allievi","lezioni","fili","cose","programma"];
  const Q=new URLSearchParams(location.search);
  const DEMO=Q.has("demo"), LOCALE=Q.has("locale");
  const OFF=DEMO||LOCALE;
  const CONFIG=!!(SB_URL&&SB_KEY);
  const P=DEMO?"teach-demo-":LOCALE?"teach-locale-":"teach-";
  const K_CACHE=P+"cache-v1", K_OUT=P+"outbox-v1", K_PULLED=P+"pulled";
  const sb=(!OFF&&CONFIG)?supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;

  const load=k=>{try{return JSON.parse(localStorage.getItem(k)||"null");}catch(e){return null;}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.warn("Teach: memoria locale piena",e);}};
  const empty=()=>Object.fromEntries(COLS.map(c=>[c,{}]));
  let cache=Object.assign(empty(),load(K_CACHE)||{});
  let outbox=load(K_OUT)||[];
  let lastError=null;
  let pulled=!!load(K_PULLED);
  const subs=Object.fromEntries(COLS.map(c=>[c,[]])), statusSubs=[], pulledSubs=[];

  function emit(col){const s=cache[col];subs[col].forEach(cb=>cb(s));}
  function status(){const st={pending:outbox.length,online:navigator.onLine,error:lastError,demo:DEMO,locale:LOCALE};statusSubs.forEach(cb=>cb(st));}
  function persist(){save(K_CACHE,cache);save(K_OUT,outbox);status();}

  /* un'operazione per documento: l'ultima vince, perché porta sempre il documento intero */
  function queue(op){
    if(OFF){persist();return;}
    outbox=outbox.filter(o=>!(o.col===op.col&&o.id===op.id));outbox.push(op);persist();flush();
  }

  let flushing=null;
  function flush(){
    if(OFF||!sb)return Promise.resolve();
    if(flushing)return flushing;
    flushing=(async()=>{
      if(!outbox.length||!navigator.onLine)return;
      const {data:{session}}=await sb.auth.getSession();if(!session)return;
      try{
        while(outbox.length){
          const o=outbox[0];
          const r=o.op==="set"
            ?await sb.from(o.col).upsert({id:o.id,data:o.data,updated_at:new Date().toISOString()})
            :await sb.from(o.col).delete().eq("id",o.id);
          if(r.error)throw r.error;
          outbox.shift();lastError=null;persist();
        }
      }catch(e){lastError=e.message||String(e);console.warn("Teach: invio rimandato",e);status();}
    })().finally(()=>{flushing=null;});
    return flushing;
  }

  function done(){pulled=true;save(K_PULLED,true);persist();COLS.forEach(emit);pulledSubs.forEach(cb=>cb());}

  async function pull(){
    if(OFF){
      if(!pulled){
        try{
          const seed=DEMO?window.DEMO_SEED:await fetch("/privato/seed.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("seed "+r.status);return r.json();});
          cache=Object.assign(empty(),JSON.parse(JSON.stringify(seed)));
        }catch(e){lastError="Dati locali non trovati: avvia l'app con il file di avvio.";status();return;}
      }
      done();return;
    }
    if(!sb||!navigator.onLine)return;
    await flush();
    const fresh={};
    for(const col of COLS){
      const r=await sb.from(col).select("id,data").limit(10000);
      if(r.error){lastError=r.error.message;status();return;}
      fresh[col]=Object.fromEntries(r.data.map(x=>[x.id,x.data]));
    }
    /* quello che non è ancora partito resta valido sopra i dati del server */
    for(const o of outbox){if(o.op==="set")fresh[o.col][o.id]=o.data;else delete fresh[o.col][o.id];}
    cache=fresh;lastError=null;done();
  }

  function set(col,id,data){cache[col][id]=data;emit(col);queue({op:"set",col,id,data});}
  function patch(col,id,p){const cur=cache[col][id];if(!cur)return;set(col,id,{...cur,...p});}
  function add(col,data){const id=crypto.randomUUID();set(col,id,data);return id;}
  function del(col,id){delete cache[col][id];emit(col);queue({op:"del",col,id});}
  function subscribe(col,cb){subs[col].push(cb);if(pulled)cb(cache[col]);}

  /* importa solo ciò che non c'è ancora: un aggiornamento non può mai cancellare o sovrascrivere il tuo lavoro */
  function importa(obj){
    const n={};
    for(const col of COLS){
      n[col]=0;
      for(const [id,data] of Object.entries(obj[col]||{})){
        if(cache[col][id])continue;
        cache[col][id]=data;queue({op:"set",col,id,data});n[col]++;
      }
      emit(col);
    }
    return n;
  }
  const esporta=()=>JSON.parse(JSON.stringify(cache));

  async function session(){if(OFF)return {locale:true};if(!sb)return null;const {data:{session}}=await sb.auth.getSession();return session;}
  async function signIn(email,password){const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;}
  async function signOut(){if(sb)await sb.auth.signOut();cache=empty();outbox=[];pulled=false;save(K_PULLED,false);persist();}

  let started=false;
  function start(){
    if(started)return;started=true;
    pull();
    if(OFF)return;
    window.addEventListener("online",()=>{status();pull();});
    window.addEventListener("offline",status);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")pull();});
    setInterval(()=>{if(document.visibilityState==="visible")pull();},5*60*1000);
  }

  return {set,patch,add,del,subscribe,importa,esporta,session,signIn,signOut,start,pull,DEMO,LOCALE,OFF,CONFIG,onStatus:cb=>{statusSubs.push(cb);status();},onPulled:cb=>{pulledSubs.push(cb);}};
})();
