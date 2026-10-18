/* ══════════════════════════════════════════════════════

   PARTICLES

══════════════════════════════════════════════════════ */

(function(){

  const canvas=document.getElementById('particle-canvas');

  const ctx=canvas.getContext('2d');

  let W,H,particles=[];

  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}

  resize();window.addEventListener('resize',resize);

  function createParticle(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*2+.5,alpha:Math.random()*.4+.1};}

  for(let i=0;i<90;i++)particles.push(createParticle());

  function draw(){

    ctx.clearRect(0,0,W,H);

    particles.forEach(p=>{

      p.x+=p.vx;p.y+=p.vy;

      if(p.x<0)p.x=W;if(p.x>W)p.x=0;

      if(p.y<0)p.y=H;if(p.y>H)p.y=0;

      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);

      ctx.fillStyle=`rgba(6,182,212,${p.alpha})`;ctx.fill();

    });

    // Lines between close particles

    for(let i=0;i<particles.length;i++){

      for(let j=i+1;j<particles.length;j++){

        const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;

        const d=Math.sqrt(dx*dx+dy*dy);

        if(d<120){ctx.beginPath();ctx.strokeStyle=`rgba(6,182,212,${.06*(1-d/120)})`;ctx.lineWidth=.5;ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}

      }

    }

    requestAnimationFrame(draw);

  }

  draw();

})();



/* ══════════════════════════════════════════════════════

   LANDING NAV SCROLL

══════════════════════════════════════════════════════ */

window.addEventListener('scroll',()=>{

  document.getElementById('nav')?.classList.toggle('scrolled',window.scrollY>30);

});

document.getElementById('footer-year').textContent='© '+new Date().getFullYear();



/* ══════════════════════════════════════════════════════

   PAGE SWITCHING — enterLab is defined later in auth section

══════════════════════════════════════════════════════ */

function enterLab(){launchLabAfterAuth&&launchLabAfterAuth();}

function exitLab(){

  document.getElementById('landing').style.display='block';

  document.getElementById('lab-page').classList.remove('active');

  document.getElementById('particle-canvas').style.display='block';

}



/* ══════════════════════════════════════════════════════

   DARK / LIGHT MODE TOGGLE

══════════════════════════════════════════════════════ */

function toggleMobileNavMenu(){
  const nl=document.querySelector('.nav-links');
  if(nl)nl.classList.toggle('mobile-open');
}
document.addEventListener('click',function(e){
  const nl=document.querySelector('.nav-links');
  if(!nl||!nl.classList.contains('mobile-open'))return;
  if(e.target.closest('.nav-links')||e.target.closest('#nav-hamburger'))return;
  nl.classList.remove('mobile-open');
});
document.addEventListener('click',function(e){
  if(e.target.closest('.nav-links a'))document.querySelector('.nav-links')?.classList.remove('mobile-open');
});

let _lightMode = localStorage.getItem('scilab-theme') !== 'dark';

function applyTheme(mode, notify=false){
  _lightMode = mode === 'light';
  document.body.classList.toggle('light-mode', _lightMode);
  localStorage.setItem('scilab-theme', _lightMode ? 'light' : 'dark');

  const icon = _lightMode ? 'fas fa-moon' : 'fas fa-sun';
  const label = _lightMode ? 'Dark' : 'Light';
  ['theme-icon-nav','theme-icon-lab'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.className=icon;
  });
  ['theme-label-nav','theme-label-lab'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.textContent=label;
  });
  document.documentElement.style.colorScheme = _lightMode ? 'light' : 'dark';
  if(notify && typeof showToast==='function') showToast(_lightMode?'☀️ Light Mode':'🌙 Dark Mode');
}

function toggleTheme(){
  applyTheme(_lightMode ? 'dark' : 'light', true);
  initScrollAnimations(true);
}

// Apply saved theme immediately so the page never flashes the wrong palette.
applyTheme(_lightMode ? 'light' : 'dark', false);


/* ══════════════════════════════════════════════════════
   GSAP SCROLL EXPERIENCE
   - Uses ScrollTrigger when available
   - Respects prefers-reduced-motion
   - Safe to call again after theme changes / page switches
══════════════════════════════════════════════════════ */
let _scrollAnimationsReady = false;

function initScrollAnimations(force=false){
  if(!window.gsap || !window.ScrollTrigger) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(_scrollAnimationsReady && !force) return;

  gsap.registerPlugin(ScrollTrigger);
  _scrollAnimationsReady = true;

  const q = (selector) => Array.from(document.querySelectorAll(selector));
  const animateIn = (elements, options={}) => {
    elements.forEach((el, i) => {
      if(el.dataset.gsapReady === '1' && !force) return;
      el.dataset.gsapReady = '1';
      gsap.fromTo(el,
        { opacity: 0, y: options.y ?? 34, scale: options.scale ?? 1 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options.duration ?? .75,
          delay: Math.min(i * (options.stagger ?? .08), .42),
          ease: options.ease ?? 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: options.start ?? 'top 86%',
            once: true
          }
        }
      );
    });
  };

  animateIn(q('#features .feat-card, .feat-card'), { y: 28, stagger: .08 });
  animateIn(q('#reactions-section .rxn-pill, .rxn-pill'), { y: 22, scale: .96, stagger: .045 });
  animateIn(q('#how-section .step-box, .step-box'), { y: 30, stagger: .1 });
  animateIn(q('.section-label, .section-title, .section-sub'), { y: 20, stagger: .05 });
  animateIn(q('#cta-band .cta-inner, .cta-inner'), { y: 30, scale: .98 });

  // Hero reveal — immediate rather than waiting for the first scroll.
  const heroParts = q('.hero-badge, .hero-title, .hero-sub, .hero-btns, .hero-stats');
  if(heroParts.length && !document.body.dataset.heroAnimated){
    document.body.dataset.heroAnimated = '1';
    gsap.from(heroParts, { opacity:0, y:24, duration:.8, stagger:.11, ease:'power3.out' });
  }

  // Gentle floating motion for decorative orbs / science visual.
  q('.orb, .hero-visual, .science-orb, .hero-art').forEach((el, i)=>{
    if(el.dataset.floatReady==='1') return;
    el.dataset.floatReady='1';
    gsap.to(el, { y: i%2 ? -10 : 10, duration: 2.8+i*.35, repeat:-1, yoyo:true, ease:'sine.inOut' });
  });

  // Parallax on the hero background when the pointer moves.
  const hero = document.querySelector('#hero');
  if(hero && !hero.dataset.parallaxReady){
    hero.dataset.parallaxReady='1';
    hero.addEventListener('pointermove', (e)=>{
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      gsap.to(hero.querySelectorAll('.hero-visual, .orb'), { x:x*12, y:y*8, duration:.5, overwrite:'auto', ease:'power2.out' });
    });
    hero.addEventListener('pointerleave', ()=>{
      gsap.to(hero.querySelectorAll('.hero-visual, .orb'), { x:0, y:0, duration:.7, ease:'power3.out' });
    });
  }

  ScrollTrigger.refresh();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>setTimeout(()=>initScrollAnimations(), 80), {once:true});
}else{
  setTimeout(initScrollAnimations, 80);
}

let labInited=false;



/* ══════════════════════════════════════════════════════

   REACTIONS DATABASE

══════════════════════════════════════════════════════ */

const REACTIONS={

  acid_base:{

    name:"Acid–Base Titration",icon:"⚗️",category:"Basic",

    hardware:"titration",

    chemicals:[

      {id:"hcl",name:"HCl",conc:"0.1M",color:"rgba(220,220,220,0.15)",label:"HCl",unit:"0.1M",desc:"Hydrochloric acid — strong acid, colorless"},

      {id:"naoh",name:"NaOH",conc:"0.1M",color:"rgba(59,130,246,0.25)",label:"NaOH",unit:"0.1M",desc:"Sodium hydroxide — strong base"},

      {id:"phenol",name:"Phenolphthalein",conc:"Ind.",color:"rgba(236,72,153,0.6)",label:"Ph.Ph.",unit:"Ind.",desc:"Pink in base, colorless in acid"},

      {id:"distilled",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Distilled water — diluent"}

    ],

    steps:[

      {title:"Fill Burette",desc:"Fill burette with HCl (0.1M). Remove air bubbles. Record initial reading.",action:"Select HCl"},

      {title:"Add NaOH",desc:"Pipette 25 mL NaOH into conical flask.",action:"Select NaOH"},

      {title:"Add Indicator",desc:"Add 2–3 drops phenolphthalein. Solution turns pink.",action:"Select Phenolphthalein"},

      {title:"Titrate",desc:"Run HCl dropwise until pink → colorless (endpoint).",action:"Click Run Reaction"}

    ],

    prediction:"HCl neutralizes NaOH. Phenolphthalein turns pink in base, colorless at endpoint.",

    expectedResult:"Pink → Colorless at pH 7",

    equation:"HCl + NaOH → NaCl + H₂O",

    observation:"Pink color of phenolphthalein disappears at endpoint. Solution turns colorless at pH ≈ 7.",

    finalPH:7.0,finalColor:"Colorless",finalColorCSS:"rgba(220,220,220,0.1)",

    liquidStart:"rgba(236,72,153,0.55)",liquidEnd:"rgba(220,220,220,0.12)",

    conclusion:"Strong acid + strong base neutralization. Endpoint detected by indicator color change.",

    observations:["Color Change","pH Neutral","Endpoint","Neutralization"],

    finalTemp:25.5,bubbles:false,precipitate:false,heat:false,showBurette:true,showElectrodes:false

  },

  redox:{

    name:"Redox: KMnO₄ + FeSO₄",icon:"⚡",category:"Basic",

    hardware:"titration",

    chemicals:[

      {id:"kmno4",name:"KMnO₄",conc:"0.02M",color:"rgba(139,92,246,0.7)",label:"KMnO₄",unit:"0.02M",desc:"Potassium permanganate — intense purple (goes in burette)"},

      {id:"feso4",name:"FeSO₄",conc:"0.5M",color:"rgba(180,200,100,0.5)",label:"FeSO₄",unit:"0.5M",desc:"Ferrous sulphate — light green (in conical flask)"},

      {id:"h2so4",name:"H₂SO₄",conc:"Dil.",color:"rgba(245,158,11,0.2)",label:"H₂SO₄",unit:"Dil.",desc:"Dilute sulphuric acid — acidic medium"},

      {id:"water_r",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Water for dilution"}

    ],

    steps:[

      {title:"Prepare KMnO₄",desc:"Take purple KMnO₄ solution (0.02M) in burette.",action:"Select KMnO₄"},

      {title:"Add FeSO₄",desc:"Add FeSO₄ (0.5M) in conical flask with H₂SO₄.",action:"Select FeSO₄"},

      {title:"Add H₂SO₄",desc:"Add dilute H₂SO₄ for acidic medium. Solution stays green.",action:"Select H₂SO₄"},

      {title:"Titrate",desc:"Add KMnO₄ dropwise — it decolorizes. Endpoint: first permanent pink.",action:"Click Run Reaction"}

    ],

    prediction:"KMnO₄ oxidizes Fe²⁺ → Fe³⁺. Purple KMnO₄ → decolorized Mn²⁺ as it gets reduced.",

    expectedResult:"Purple → Colorless → First permanent pink",

    equation:"KMnO₄ + FeSO₄ + H₂SO₄ → MnSO₄ + Fe₂(SO₄)₃ + K₂SO₄ + H₂O",

    observation:"Deep purple KMnO₄ decolorizes as Fe²⁺ reduces Mn⁷⁺ to Mn²⁺. Endpoint: faint pink.",

    finalPH:2.1,finalColor:"Faint Pink (endpoint)",finalColorCSS:"rgba(236,72,153,0.25)",

    liquidStart:"rgba(139,92,246,0.7)",liquidEnd:"rgba(236,72,153,0.25)",

    conclusion:"KMnO₄ is a self-indicating oxidizing agent. Acts as oxidizing agent in acidic medium.",

    observations:["Decolorization","Oxidation","Reduction","Self-Indicating"],

    finalTemp:26.0,bubbles:false,precipitate:false,heat:false,showBurette:true,showElectrodes:false

  },

  precipitation:{

    name:"Precipitation: PbI₂",icon:"🌧️",category:"Basic",

    hardware:"conical_flask",

    chemicals:[

      {id:"pb_no3",name:"Pb(NO₃)₂",conc:"0.1M",color:"rgba(220,220,220,0.2)",label:"Pb(NO₃)₂",unit:"0.1M",desc:"Lead nitrate — colorless"},

      {id:"ki",name:"KI",conc:"0.1M",color:"rgba(220,220,220,0.25)",label:"KI",unit:"0.1M",desc:"Potassium iodide — colorless"},

      {id:"hno3",name:"HNO₃",conc:"Dil.",color:"rgba(220,220,220,0.18)",label:"HNO₃",unit:"Dil.",desc:"Dilute nitric acid"},

      {id:"water_p",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Solvent"}

    ],

    steps:[

      {title:"Add Pb(NO₃)₂",desc:"Take 20 mL of 0.1M Pb(NO₃)₂ in beaker. Clear solution.",action:"Select Pb(NO₃)₂"},

      {title:"Add KI",desc:"Slowly add KI solution. Bright yellow precipitate forms immediately.",action:"Select KI"},

      {title:"Observe",desc:"Yellow PbI₂ precipitate — heavier particles sink. Confirm with Ksp.",action:"Observe yellow precipitate"},

      {title:"Filter",desc:"Filter precipitate. Confirm golden yellow crystals.",action:"Click Run Reaction"}

    ],

    prediction:"Pb²⁺ + 2I⁻ → PbI₂↓ (golden yellow). Driven by very low Ksp (9.8×10⁻⁹).",

    expectedResult:"Golden yellow PbI₂ precipitate",

    equation:"Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃",

    observation:"Bright golden-yellow precipitate of PbI₂ forms immediately upon mixing. 'Golden rain' effect.",

    finalPH:5.5,finalColor:"Golden Yellow Precipitate",finalColorCSS:"rgba(234,179,8,0.7)",

    liquidStart:"rgba(220,220,220,0.2)",liquidEnd:"rgba(234,179,8,0.65)",

    conclusion:"Classic precipitation. PbI₂ has very low Ksp — ions exceed solubility product immediately.",

    observations:["Yellow Precipitate","Golden Rain","Low Ksp","Ion Exchange"],

    finalTemp:25.0,bubbles:false,precipitate:true,heat:false,showBurette:false,showElectrodes:false

  },

  combination:{

    name:"Combination: Mg + O₂",icon:"🔗",category:"Basic",

    hardware:"heating",

    chemicals:[

      {id:"mg",name:"Mg Ribbon",conc:"Solid",color:"rgba(200,200,200,0.5)",label:"Mg",unit:"Solid",desc:"Magnesium ribbon — burns brilliantly"},

      {id:"o2",name:"O₂ (air)",conc:"Gas",color:"rgba(200,220,255,0.15)",label:"O₂",unit:"Air",desc:"Oxygen from air — oxidant"},

      {id:"sand",name:"Sand (safety)",conc:"Solid",color:"rgba(210,180,140,0.5)",label:"Sand",unit:"Safety",desc:"Sand tray to catch burning Mg"},

      {id:"goggles",name:"Safety Goggles",conc:"PPE",color:"rgba(59,130,246,0.2)",label:"PPE",unit:"Required",desc:"NEVER look at burning Mg directly!"}

    ],

    steps:[

      {title:"Safety First",desc:"Wear safety goggles. NEVER look directly at burning Mg — UV/visible light danger.",action:"Select Safety Goggles"},

      {title:"Hold Mg",desc:"Hold Mg ribbon with tongs over sand tray.",action:"Select Mg Ribbon"},

      {title:"Ignite",desc:"Hold near Bunsen burner flame. Mg ignites with brilliant white light.",action:"Select O₂"},

      {title:"Observe",desc:"White MgO powder forms. Record observations.",action:"Click Run Reaction"}

    ],

    prediction:"Mg burns in O₂ with intense white light (UV emission). Product: white MgO powder.",

    expectedResult:"Intense white flame → white MgO ash",

    equation:"2Mg + O₂ → 2MgO",

    observation:"Brilliant white flame. White MgO powder deposits. Temperature rises sharply. UV light emitted.",

    finalPH:10.5,finalColor:"White Ash (MgO)",finalColorCSS:"rgba(255,255,255,0.7)",

    liquidStart:"rgba(200,200,200,0.4)",liquidEnd:"rgba(255,255,255,0.65)",

    conclusion:"Highly exothermic combination reaction. ΔH = −601 kJ/mol. MgO is basic oxide.",

    observations:["White Flame","MgO Formation","Exothermic","UV Emission"],

    finalTemp:45.0,bubbles:false,precipitate:true,heat:true,showBurette:false,showElectrodes:false

  },

  decomposition:{

    name:"Decomposition: H₂O₂",icon:"💥",category:"Basic",

    hardware:"heating",

    chemicals:[

      {id:"h2o2",name:"H₂O₂",conc:"30%",color:"rgba(200,230,255,0.2)",label:"H₂O₂",unit:"30%",desc:"Hydrogen peroxide — decomposes to O₂"},

      {id:"mno2",name:"MnO₂",conc:"Catalyst",color:"rgba(100,80,60,0.6)",label:"MnO₂",unit:"cat.",desc:"Manganese dioxide — heterogeneous catalyst"},

      {id:"water_d",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Product of decomposition"},

      {id:"splint",name:"Glowing Splint",conc:"Test",color:"rgba(245,158,11,0.4)",label:"Splint",unit:"Test",desc:"Relights in O₂ — positive test"}

    ],

    steps:[

      {title:"Add H₂O₂",desc:"Add 30% H₂O₂ to conical flask in fume hood.",action:"Select H₂O₂"},

      {title:"Add MnO₂",desc:"Add a spatula of MnO₂. Vigorous bubbling begins immediately.",action:"Select MnO₂"},

      {title:"Glowing Splint",desc:"Insert glowing splint into gas — it relights. Confirms O₂ evolution.",action:"Select Glowing Splint"},

      {title:"Record",desc:"Record O₂ evolution rate, temperature change.",action:"Click Run Reaction"}

    ],

    prediction:"MnO₂ catalyzes H₂O₂ decomposition. Vigorous O₂ bubbles + relights glowing splint.",

    expectedResult:"Vigorous bubbling → O₂ gas evolved",

    equation:"2H₂O₂ →(MnO₂) 2H₂O + O₂↑",

    observation:"Vigorous effervescence (O₂ bubbles). Glowing splint relights. Solution becomes warm.",

    finalPH:7.0,finalColor:"Colorless (O₂ evolved)",finalColorCSS:"rgba(200,230,255,0.2)",

    liquidStart:"rgba(200,230,255,0.25)",liquidEnd:"rgba(200,230,255,0.12)",

    conclusion:"Catalytic decomposition — MnO₂ lowers Ea. Positive glowing splint test confirms O₂.",

    observations:["O₂ Bubbles","Catalyst Used","Glowing Splint","Effervescence"],

    finalTemp:34.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },

  single_displacement:{

    name:"Single Displacement: Zn + CuSO₄",icon:"🔄",category:"Basic",

    hardware:"conical_flask",

    chemicals:[

      {id:"cuso4",name:"CuSO₄",conc:"0.5M",color:"rgba(6,182,212,0.55)",label:"CuSO₄",unit:"0.5M",desc:"Copper sulphate — characteristic blue"},

      {id:"zn",name:"Zn strip",conc:"Solid",color:"rgba(200,200,200,0.5)",label:"Zn",unit:"Solid",desc:"Zinc strip — more reactive than Cu"},

      {id:"h2so4_d",name:"H₂SO₄ (dil.)",conc:"Dil.",color:"rgba(245,158,11,0.2)",label:"H₂SO₄",unit:"Dil.",desc:"Dilute sulphuric acid — prevent hydrolysis"},

      {id:"water_s",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Solvent"}

    ],

    steps:[

      {title:"Prepare CuSO₄",desc:"Add blue CuSO₄ solution to beaker. Record color.",action:"Select CuSO₄"},

      {title:"Add Zn strip",desc:"Place Zn strip in solution. Reddish Cu deposits on Zn.",action:"Select Zn strip"},

      {title:"Observe",desc:"Blue fades as Cu²⁺ is reduced; Zn is oxidized. Solution pales.",action:"Observe color change"},

      {title:"Record",desc:"Solution becomes colorless ZnSO₄. Cu metal visible on Zn strip.",action:"Click Run Reaction"}

    ],

    prediction:"More reactive Zn displaces less reactive Cu from CuSO₄. Blue color fades.",

    expectedResult:"Blue → Colorless; Cu deposits on Zn",

    equation:"Zn + CuSO₄ → ZnSO₄ + Cu↓",

    observation:"Blue CuSO₄ fades to colorless ZnSO₄. Reddish-brown Cu deposits on zinc strip.",

    finalPH:6.2,finalColor:"Colorless (Cu deposits)",finalColorCSS:"rgba(230,230,230,0.15)",

    liquidStart:"rgba(6,182,212,0.55)",liquidEnd:"rgba(230,230,230,0.15)",

    conclusion:"More reactive metal (Zn) displaces less reactive metal (Cu) — activity series.",

    observations:["Color Fading","Cu Deposition","Activity Series","Redox"],

    finalTemp:26.5,bubbles:false,precipitate:true,heat:false,showBurette:false,showElectrodes:false

  },

  double_displacement:{

    name:"Double Displacement: BaSO₄",icon:"🔁",category:"Basic",

    hardware:"conical_flask",

    chemicals:[

      {id:"bacl2",name:"BaCl₂",conc:"0.1M",color:"rgba(220,220,220,0.25)",label:"BaCl₂",unit:"0.1M",desc:"Barium chloride — clear solution"},

      {id:"na2so4",name:"Na₂SO₄",conc:"0.1M",color:"rgba(220,220,220,0.2)",label:"Na₂SO₄",unit:"0.1M",desc:"Sodium sulfate — clear solution"},

      {id:"agno3",name:"AgNO₃",conc:"0.1M",color:"rgba(220,220,220,0.25)",label:"AgNO₃",unit:"0.1M",desc:"Silver nitrate — forms white ppt"},

      {id:"nacl_d",name:"NaCl",conc:"0.1M",color:"rgba(220,220,220,0.2)",label:"NaCl",unit:"0.1M",desc:"Sodium chloride"}

    ],

    steps:[

      {title:"Add BaCl₂",desc:"Add 20 mL BaCl₂ to beaker. Clear solution.",action:"Select BaCl₂"},

      {title:"Add Na₂SO₄",desc:"Slowly add Na₂SO₄. White precipitate forms instantly.",action:"Select Na₂SO₄"},

      {title:"Observe",desc:"White milky BaSO₄ precipitate. Ksp = 1.1×10⁻¹⁰.",action:"Observe white precipitate"},

      {title:"Filter",desc:"Filter BaSO₄ precipitate. Dry and weigh.",action:"Click Run Reaction"}

    ],

    prediction:"Mixing BaCl₂ and Na₂SO₄ immediately produces white BaSO₄ (very low Ksp).",

    expectedResult:"White BaSO₄ precipitate instantly",

    equation:"BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl",

    observation:"White precipitate of BaSO₄ forms immediately. Solution becomes milky white.",

    finalPH:7.0,finalColor:"White Precipitate",finalColorCSS:"rgba(255,255,255,0.55)",

    liquidStart:"rgba(220,220,220,0.2)",liquidEnd:"rgba(255,255,255,0.5)",

    conclusion:"Ion exchange between two electrolytes. Low Ksp drives reaction to completion.",

    observations:["White Precipitate","Ion Exchange","Double Displacement","BaSO₄"],

    finalTemp:25.2,bubbles:false,precipitate:true,heat:false,showBurette:false,showElectrodes:false

  },

  organic_addition:{

    name:"Electrophilic Addition (Br₂)",icon:"🧪",category:"Organic",

    hardware:"beaker",

    chemicals:[

      {id:"ethylene",name:"Ethylene C₂H₄",conc:"Gas",color:"rgba(16,185,129,0.3)",label:"C₂H₄",unit:"Gas",desc:"Ethylene — unsaturated alkene"},

      {id:"br2",name:"Br₂/CCl₄",conc:"0.1M",color:"rgba(210,100,20,0.55)",label:"Br₂",unit:"CCl₄",desc:"Bromine solution — orange-brown"},

      {id:"hbr",name:"HBr Gas",conc:"Gas",color:"rgba(245,158,11,0.3)",label:"HBr",unit:"Gas",desc:"Hydrogen bromide"},

      {id:"h2_cat",name:"H₂ (Ni cat.)",conc:"Gas",color:"rgba(220,220,220,0.2)",label:"H₂",unit:"Ni cat.",desc:"Hydrogen — hydrogenation"}

    ],

    steps:[

      {title:"Prepare Br₂",desc:"Take orange-brown bromine water in test tube.",action:"Select Br₂/CCl₄"},

      {title:"Add Ethylene",desc:"Bubble C₂H₄ gas through bromine water.",action:"Select Ethylene C₂H₄"},

      {title:"Observe",desc:"Orange-brown color fades as Br₂ adds across C=C bond.",action:"Observe decolorization"},

      {title:"Confirm",desc:"Colorless 1,2-dibromoethane confirms alkene.",action:"Click Run Reaction"}

    ],

    prediction:"Br₂ adds across the C=C double bond by electrophilic addition, forming 1,2-dibromoethane.",

    expectedResult:"Orange-brown Br₂ → Colorless",

    equation:"CH₂=CH₂ + Br₂ → CH₂Br–CH₂Br",

    observation:"Orange-brown bromine water decolorizes completely. Confirms C=C double bond.",

    finalPH:5.2,finalColor:"Colorless",finalColorCSS:"rgba(255,255,255,0.1)",

    liquidStart:"rgba(210,100,20,0.55)",liquidEnd:"rgba(255,255,255,0.12)",

    conclusion:"Electrophilic addition of Br₂ to C=C. Standard alkene test. Product: 1,2-dibromoethane.",

    observations:["Decolorization","Electrophilic Addition","C=C Confirmed","Br₂ Consumed"],

    finalTemp:25.8,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },

  esterification:{

    name:"Fischer Esterification",icon:"🧴",category:"Organic",

    hardware:"round_flask",

    chemicals:[

      {id:"ethanol",name:"Ethanol",conc:"Pure",color:"rgba(200,220,255,0.2)",label:"C₂H₅OH",unit:"Pure",desc:"Ethyl alcohol — alcohol reactant"},

      {id:"acetic",name:"Acetic Acid",conc:"Glacial",color:"rgba(200,200,180,0.3)",label:"CH₃COOH",unit:"Glacial",desc:"Glacial acetic acid — carboxylic acid"},

      {id:"h2so4_e",name:"H₂SO₄",conc:"Conc.",color:"rgba(245,158,11,0.25)",label:"H₂SO₄",unit:"conc.",desc:"Concentrated acid — catalyst + dehydrating agent"},

      {id:"na2co3",name:"Na₂CO₃ (sat.)",conc:"Sat.",color:"rgba(220,220,220,0.2)",label:"Na₂CO₃",unit:"Sat.",desc:"Removes excess acid from ester layer"}

    ],

    steps:[

      {title:"Add Ethanol",desc:"Add 5 mL ethanol to round bottom flask.",action:"Select Ethanol"},

      {title:"Add Acetic Acid",desc:"Add 5 mL glacial acetic acid carefully.",action:"Select Acetic Acid"},

      {title:"Add H₂SO₄",desc:"Add few drops conc. H₂SO₄ — acid catalyst. Heat gently under reflux.",action:"Select H₂SO₄"},

      {title:"Isolate Ester",desc:"Pour into Na₂CO₃. Ester floats as fruit-smelling layer.",action:"Click Run Reaction"}

    ],

    prediction:"Nucleophilic acyl substitution. H⁺ catalyzes reaction. Equilibrium shifted by removing water.",

    expectedResult:"Sweet-smelling ethyl acetate layer",

    equation:"CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O",

    observation:"Sweet fruity smell (ethyl acetate). Two-phase system — ester floats above Na₂CO₃.",

    finalPH:6.0,finalColor:"Colorless (ester layer)",finalColorCSS:"rgba(200,220,255,0.15)",

    liquidStart:"rgba(200,220,255,0.2)",liquidEnd:"rgba(200,220,255,0.12)",

    conclusion:"Fischer esterification: equilibrium reaction, reversible. Yield improved by LeChatelier shifts.",

    observations:["Fruity Smell","Two Layers","Ester Formed","Equilibrium"],

    finalTemp:78.0,bubbles:true,precipitate:false,heat:true,showBurette:false,showElectrodes:false

  },

  saponification:{

    name:"Saponification (Soap Making)",icon:"🫧",category:"Organic",

    hardware:"round_flask",

    chemicals:[

      {id:"oil",name:"Coconut Oil",conc:"Pure",color:"rgba(245,230,150,0.4)",label:"Oil",unit:"Pure",desc:"Triglyceride — fat for saponification"},

      {id:"naoh_s",name:"NaOH",conc:"40%",color:"rgba(59,130,246,0.35)",label:"NaOH",unit:"40%",desc:"Concentrated sodium hydroxide"},

      {id:"nacl_s",name:"NaCl (sat.)",conc:"Sat.",color:"rgba(200,200,200,0.2)",label:"NaCl",unit:"Sat.",desc:"Salting out — precipitates soap"},

      {id:"water_sa",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Reaction medium"}

    ],

    steps:[

      {title:"Add Oil",desc:"Add 20 mL coconut oil to beaker. Yellow oily liquid.",action:"Select Coconut Oil"},

      {title:"Add NaOH",desc:"Add 40% NaOH solution slowly with stirring.",action:"Select NaOH"},

      {title:"Heat & Stir",desc:"Heat at 70–80°C with constant stirring for 30 min.",action:"Select H₂O"},

      {title:"Salt Out",desc:"Add saturated NaCl to precipitate soap. White solid floats.",action:"Click Run Reaction"}

    ],

    prediction:"NaOH hydrolyzes ester bonds in triglyceride → glycerol + 3 fatty acid salts (soap).",

    expectedResult:"White soap floats on glycerol layer",

    equation:"Triglyceride + 3NaOH → Glycerol + 3 RCOONa (Soap)",

    observation:"White soap (sodium palmitate/stearate) precipitates. Glycerol stays in solution.",

    finalPH:10.0,finalColor:"White Soap Precipitate",finalColorCSS:"rgba(245,245,245,0.6)",

    liquidStart:"rgba(245,230,150,0.4)",liquidEnd:"rgba(245,245,245,0.55)",

    conclusion:"Saponification is irreversible alkaline hydrolysis. Produces soap (emulsifier) + glycerol.",

    observations:["White Soap","Glycerol Byproduct","Alkaline Hydrolysis","Salting Out"],

    finalTemp:75.0,bubbles:true,precipitate:true,heat:true,showBurette:false,showElectrodes:false

  },

  electrolysis_water:{

    name:"Electrolysis of Water",icon:"⚡",category:"Electrochem",

    hardware:"electrolysis",

    chemicals:[

      {id:"h2so4_el",name:"H₂SO₄",conc:"1M",color:"rgba(245,158,11,0.2)",label:"H₂SO₄",unit:"1M",desc:"Sulfuric acid — electrolyte to improve conductivity"},

      {id:"water_el",name:"Distilled H₂O",conc:"Pure",color:"rgba(200,230,255,0.15)",label:"H₂O",unit:"Pure",desc:"Water — the reactant being split"},

      {id:"dc_power",name:"DC Power (9V)",conc:"9V DC",color:"rgba(245,158,11,0.4)",label:"9V DC",unit:"Battery",desc:"Direct current source for electrolysis"},

      {id:"electrodes",name:"Pt Electrodes",conc:"Inert",color:"rgba(200,200,200,0.5)",label:"Pt",unit:"Inert",desc:"Platinum electrodes — inert, don't react"}

    ],

    steps:[

      {title:"Setup",desc:"Set up Hofmann voltameter with Pt electrodes in H₂SO₄ solution.",action:"Select Pt Electrodes"},

      {title:"Add Electrolyte",desc:"Add H₂SO₄ (1M) to improve conductivity.",action:"Select H₂SO₄"},

      {title:"Power On",desc:"Connect 9V DC. Observe bubbles at both electrodes.",action:"Select DC Power"},

      {title:"Collect",desc:"H₂:O₂ ratio = 2:1 by volume. Glowing splint confirms O₂; pop test confirms H₂.",action:"Click Run Reaction"}

    ],

    prediction:"Electric current decomposes water into H₂ and O₂. H₂:O₂ = 2:1 (by volume).",

    expectedResult:"H₂ at cathode (2:1), O₂ at anode",

    equation:"2H₂O →(electrolysis) 2H₂↑ + O₂↑",

    observation:"Vigorous H₂ bubbles at cathode (−), O₂ bubbles at anode (+). Ratio 2:1 by volume.",

    finalPH:1.0,finalColor:"Colorless with bubbles",finalColorCSS:"rgba(200,230,255,0.15)",

    liquidStart:"rgba(200,230,255,0.2)",liquidEnd:"rgba(200,230,255,0.15)",

    conclusion:"Electrolysis splits water. Faraday's laws govern amount of gas evolved.",

    observations:["H₂ at Cathode","O₂ at Anode","2:1 Ratio","Faraday's Law"],

    finalTemp:27.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:true

  },

  electroplating:{

    name:"Electroplating (Cu on Fe)",icon:"🪙",category:"Electrochem",

    hardware:"electrolysis",

    chemicals:[

      {id:"cuso4_ep",name:"CuSO₄",conc:"1M",color:"rgba(6,182,212,0.55)",label:"CuSO₄",unit:"1M",desc:"Electrolyte — provides Cu²⁺ ions"},

      {id:"h2so4_ep",name:"H₂SO₄",conc:"0.5M",color:"rgba(245,158,11,0.15)",label:"H₂SO₄",unit:"0.5M",desc:"Acidifying agent for better conductivity"},

      {id:"cu_anode",name:"Cu Anode",conc:"Solid",color:"rgba(200,120,50,0.6)",label:"Cu(+)",unit:"Anode",desc:"Copper anode — dissolves during plating"},

      {id:"fe_cathode",name:"Fe Cathode",conc:"Solid",color:"rgba(140,140,140,0.6)",label:"Fe(−)",unit:"Cathode",desc:"Iron cathode — object to be plated"}

    ],

    steps:[

      {title:"Prepare Solution",desc:"Make CuSO₄ + H₂SO₄ electrolyte in beaker.",action:"Select CuSO₄"},

      {title:"Setup Electrodes",desc:"Cu anode (+), Fe cathode (−). Connect DC source.",action:"Select Cu Anode"},

      {title:"Electrolysis",desc:"Current flows. Cu²⁺ deposited on Fe. Anode dissolves.",action:"Select Fe Cathode"},

      {title:"Inspect",desc:"Remove Fe cathode — shiny Cu layer visible. Weigh before/after.",action:"Click Run Reaction"}

    ],

    prediction:"Cu²⁺ ions migrate to cathode and deposit as Cu metal. Cu anode replenishes solution.",

    expectedResult:"Shiny copper coating on iron",

    equation:"Cu²⁺ + 2e⁻ → Cu (cathode); Cu → Cu²⁺ + 2e⁻ (anode)",

    observation:"Reddish copper deposits on iron cathode. Blue solution color maintained. Anode thins.",

    finalPH:2.5,finalColor:"Blue (CuSO₄ maintained)",finalColorCSS:"rgba(6,182,212,0.45)",

    liquidStart:"rgba(6,182,212,0.55)",liquidEnd:"rgba(6,182,212,0.45)",

    conclusion:"Electroplating uses Faraday's law. Anode dissolves, cathode gains mass. Cu concentration stable.",

    observations:["Cu Deposition","Anode Dissolution","Faraday's 2nd Law","Blue Color Maintained"],

    finalTemp:26.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:true

  },

  haber:{

    name:"Haber Process (NH₃)",icon:"🏭",category:"Industrial",

    hardware:"round_flask",

    chemicals:[

      {id:"n2",name:"N₂ Gas",conc:"Gas",color:"rgba(200,220,240,0.2)",label:"N₂",unit:"High P",desc:"Nitrogen from fractional distillation of air"},

      {id:"h2",name:"H₂ Gas",conc:"Gas",color:"rgba(220,220,220,0.2)",label:"H₂",unit:"High P",desc:"Hydrogen from steam reforming"},

      {id:"fe_cat",name:"Fe Catalyst",conc:"Catalyst",color:"rgba(100,80,60,0.5)",label:"Fe",unit:"Promoted",desc:"Iron catalyst with K₂O/Al₂O₃ promoters"},

      {id:"nh3",name:"NH₃ Absorption",conc:"Product",color:"rgba(200,200,220,0.25)",label:"NH₃",unit:"Cooled",desc:"Ammonia liquefied and collected"}

    ],

    steps:[

      {title:"Mix Gases",desc:"Feed N₂:H₂ in 1:3 ratio into reactor at 200 atm.",action:"Select N₂ Gas"},

      {title:"Compress",desc:"Compress to 200 atm. High pressure favors fewer moles (product side).",action:"Select H₂ Gas"},

      {title:"Catalyst",desc:"Pass over Fe catalyst at 450°C. Compromise temperature — fast rate but good yield.",action:"Select Fe Catalyst"},

      {title:"Collect",desc:"Cool reactor — NH₃ liquefies and is collected. Unreacted gases recycled.",action:"Click Run Reaction"}

    ],

    prediction:"N₂ + 3H₂ ⇌ 2NH₃. Equilibrium: high P + moderate T + Fe catalyst = 15% yield.",

    expectedResult:"Ammonia gas (15% yield)",

    equation:"N₂ + 3H₂ ⇌ 2NH₃  (450°C, 200 atm, Fe cat.)",

    observation:"Colorless pungent ammonia gas produced. 15% conversion per pass. Recycled unreacted gases.",

    finalPH:11.5,finalColor:"Colorless NH₃ (pungent)",finalColorCSS:"rgba(200,200,220,0.15)",

    liquidStart:"rgba(200,220,240,0.25)",liquidEnd:"rgba(200,200,220,0.15)",

    conclusion:"LeChatelier compromise — 450°C balances rate vs yield. 200 atm drives equilibrium to NH₃.",

    observations:["Pungent Gas","15% Yield","High Pressure","Fe Catalyst"],

    finalTemp:450.0,bubbles:true,precipitate:false,heat:true,showBurette:false,showElectrodes:false

  },

  polymerization:{

    name:"Addition Polymerization (PE)",icon:"🔗",category:"Polymer",

    hardware:"round_flask",

    chemicals:[

      {id:"ethylene_p",name:"Ethylene",conc:"Gas",color:"rgba(200,230,200,0.3)",label:"C₂H₄",unit:"Gas",desc:"Ethylene monomer — C=C double bond"},

      {id:"bpo",name:"BPO Initiator",conc:"Radical",color:"rgba(245,158,11,0.4)",label:"BPO",unit:"Radical",desc:"Benzoyl peroxide — free radical initiator"},

      {id:"heat_p",name:"Heat (Δ)",conc:"80°C",color:"rgba(239,68,68,0.3)",label:"Δ",unit:"80°C",desc:"Heat to decompose BPO → radicals"},

      {id:"inhibitor",name:"Inhibitor",conc:"Trace",color:"rgba(139,92,246,0.3)",label:"Inhib.",unit:"Trace",desc:"Added to control chain length"}

    ],

    steps:[

      {title:"Initiation",desc:"BPO decomposes at 80°C → free radicals (R•).",action:"Select BPO Initiator"},

      {title:"Propagation",desc:"R• adds to CH₂=CH₂ → chain grows rapidly.",action:"Select Ethylene"},

      {title:"Heat",desc:"Heat drives initiation. Each addition opens C=C bond.",action:"Select Heat"},

      {title:"Termination",desc:"Chains terminate → polyethylene (MW 10⁵–10⁶). White waxy solid forms.",action:"Click Run Reaction"}

    ],

    prediction:"Free radical chain mechanism. Initiation→Propagation→Termination. Product: polyethylene.",

    expectedResult:"White waxy polyethylene solid",

    equation:"n(CH₂=CH₂) →(BPO, Δ) −(CH₂−CH₂)ₙ− (Polyethylene)",

    observation:"Ethylene converts to white waxy polyethylene. High molecular weight polymer.",

    finalPH:7.0,finalColor:"White Waxy Solid",finalColorCSS:"rgba(255,255,255,0.6)",

    liquidStart:"rgba(200,230,200,0.3)",liquidEnd:"rgba(255,255,255,0.55)",

    conclusion:"Chain growth polymerization via free radicals. PE: most widely produced plastic.",

    observations:["Chain Growth","Free Radical","High MW Polymer","White Solid"],

    finalTemp:45.0,bubbles:false,precipitate:true,heat:true,showBurette:false,showElectrodes:false

  },

  nylon:{

    name:"Condensation Polymer: Nylon-6,6",icon:"🧵",category:"Polymer",

    hardware:"conical_flask",

    chemicals:[

      {id:"adipic",name:"Adipic Acid",conc:"0.5M",color:"rgba(220,200,180,0.4)",label:"Adipic Acid",unit:"0.5M",desc:"Dicarboxylic acid monomer"},

      {id:"hexamine",name:"Hexamethylenediamine",conc:"0.5M",color:"rgba(180,200,220,0.4)",label:"HMDA",unit:"0.5M",desc:"Diamine monomer — forms amide bonds"},

      {id:"nacl_ny",name:"NaCl (sat.)",conc:"Sat.",color:"rgba(200,200,200,0.2)",label:"NaCl",unit:"Sat.",desc:"Lowers organic phase density"},

      {id:"naoh_ny",name:"NaOH",conc:"0.5M",color:"rgba(59,130,246,0.3)",label:"NaOH",unit:"0.5M",desc:"Neutralizes HCl byproduct"}

    ],

    steps:[

      {title:"Aqueous Phase",desc:"Dissolve adipic acid in NaOH/NaCl water — lower phase.",action:"Select Adipic Acid"},

      {title:"Organic Phase",desc:"Dissolve HMDA in organic solvent — upper phase.",action:"Select Hexamethylenediamine"},

      {title:"Interface",desc:"Nylon film forms instantly at the interface between the two phases.",action:"Observe white film"},

      {title:"Pull Thread",desc:"Continuously draw nylon thread from interface. Strong flexible fiber.",action:"Click Run Reaction"}

    ],

    prediction:"Nylon-6,6 forms by condensation at the interface of two immiscible solutions.",

    expectedResult:"Continuous nylon thread at interface",

    equation:"n[HOOC(CH₂)₄COOH] + n[H₂N(CH₂)₆NH₂] → Nylon-6,6 + 2nH₂O",

    observation:"White nylon thread forms at liquid interface. Can be continuously drawn. Strong and flexible.",

    finalPH:6.5,finalColor:"White Thread/Film",finalColorCSS:"rgba(255,255,255,0.7)",

    liquidStart:"rgba(220,200,180,0.35)",liquidEnd:"rgba(255,255,255,0.65)",

    conclusion:"Step-growth condensation. Amide bonds form at interface, releasing water. High H-bonding → strength.",

    observations:["Amide Bond","Step Growth","White Thread","Interfacial Synthesis"],

    finalTemp:30.0,bubbles:false,precipitate:true,heat:false,showBurette:false,showElectrodes:false

  },



  photosynthesis:{

    name:"Photosynthesis Reaction",icon:"🌿",category:"Biochemistry",

    hardware:"round_flask",

    chemicals:[

      {id:"co2_ps",name:"CO₂ (dissolved)",conc:"0.04%",color:"rgba(200,220,240,0.18)",label:"CO₂",unit:"Dissolved",desc:"Carbon dioxide — the carbon source, dissolved in water"},

      {id:"h2o_ps",name:"H₂O",conc:"Pure",color:"rgba(180,220,255,0.22)",label:"H₂O",unit:"Solvent",desc:"Water — hydrogen donor, oxidized to O₂ in light reactions"},

      {id:"chlorophyll",name:"Chlorophyll (Spinach)",conc:"Extract",color:"rgba(34,197,94,0.65)",label:"Chl",unit:"Extract",desc:"Chlorophyll a/b — light-harvesting pigments in thylakoids"},

      {id:"light_ps",name:"Light (700 nm)",conc:"Photons",color:"rgba(253,224,71,0.5)",label:"hν",unit:"Photons",desc:"Red light ~700 nm — optimal wavelength for chlorophyll absorption"}

    ],

    steps:[

      {title:"Add CO₂ + H₂O",desc:"Dissolve CO₂ in water (bicarbonate buffer simulates dissolved CO₂ in stroma). Solution is slightly acidic.",action:"Select CO₂ & H₂O"},

      {title:"Add Chlorophyll",desc:"Add chlorophyll extract from spinach. Solution turns bright green — pigments ready to absorb photons.",action:"Select Chlorophyll"},

      {title:"Illuminate",desc:"Expose to 700 nm red light. Light reactions split H₂O → O₂ + 2H⁺ + 2e⁻ (photolysis). ATP & NADPH generated.",action:"Select Light (700 nm)"},

      {title:"Calvin Cycle",desc:"Dark reactions (Calvin cycle) use ATP + NADPH to fix CO₂ → G3P → glucose (C₆H₁₂O₆). O₂ released as byproduct.",action:"Click Run Reaction"}

    ],

    prediction:"6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Chlorophyll absorbs red light, splits water, drives carbon fixation via Calvin cycle.",

    expectedResult:"O₂ gas evolution + glucose (C₆H₁₂O₆) synthesis; solution brightens green",

    equation:"6CO₂ + 6H₂O →(chlorophyll, hν) C₆H₁₂O₆ + 6O₂",

    observation:"Solution turns vivid green as chlorophyll activates. O₂ bubbles form (photolysis). pH rises slightly as CO₂ is consumed. Light energy converted to chemical energy.",

    finalPH:7.4,finalColor:"Vivid Green (O₂ evolved)",finalColorCSS:"rgba(34,197,94,0.60)",

    liquidStart:"rgba(180,220,255,0.22)",liquidEnd:"rgba(34,197,94,0.58)",

    conclusion:"Photosynthesis converts light energy into chemical energy. Two stages: light reactions (thylakoid) and Calvin cycle (stroma). Net: CO₂ + H₂O → glucose + O₂.",

    observations:["O₂ Evolution","Vivid Green Color","pH Rise","Glucose Synthesis"],

    finalTemp:28.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  elephant_toothpaste:{

    name:"Elephant Toothpaste",icon:"🐘",category:"Spectacular",

    hardware:"conical_flask",

    chemicals:[

      {id:"h2o2_et",name:"H₂O₂",conc:"30%",color:"rgba(220,240,255,0.25)",label:"H₂O₂",unit:"30%",desc:"Hydrogen peroxide — concentrated oxidant, unstable"},

      {id:"ki_et",name:"KI",conc:"Catalyst",color:"rgba(200,220,200,0.3)",label:"KI",unit:"Cat.",desc:"Potassium iodide — lowers activation energy, catalyzes decomposition"},

      {id:"soap_et",name:"Dish Soap",conc:"Liq.",color:"rgba(16,185,129,0.35)",label:"Soap",unit:"Liq.",desc:"Traps oxygen bubbles — creates thick foam"},

      {id:"dye_et",name:"Food Dye",conc:"Few drops",color:"rgba(239,68,68,0.5)",label:"Dye",unit:"Drops",desc:"Food coloring for visual effect"}

    ],

    steps:[

      {title:"Add H₂O₂",desc:"Pour 30% hydrogen peroxide into the cylinder. It slowly decomposes: 2H₂O₂ → 2H₂O + O₂.",action:"Select H₂O₂"},

      {title:"Add Soap",desc:"Add liquid dish soap. It will trap oxygen bubbles forming foam when gas is released rapidly.",action:"Select Dish Soap"},

      {title:"Add Dye",desc:"Optional: add food coloring for a colorful foam display.",action:"Select Food Dye"},

      {title:"Add Catalyst (KI)",desc:"Add KI — the catalyst lowers activation energy dramatically. Oxygen releases instantly. Foam expands explosively!",action:"Click Run Reaction"}

    ],

    prediction:"KI catalyzes rapid H₂O₂ decomposition. Oxygen trapped by soap forms a huge foam column.",

    expectedResult:"Giant rapidly expanding foam column (Elephant Toothpaste!)",

    equation:"2H₂O₂ →(KI catalyst) 2H₂O + O₂↑ [Soap traps O₂ → massive foam]",

    observation:"Foam erupts rapidly and expands to many times the original volume. Warm to the touch — exothermic. Steam may be visible.",

    finalPH:7.0,finalColor:"Bright Colored Foam",finalColorCSS:"rgba(239,68,68,0.55)",

    liquidStart:"rgba(220,240,255,0.25)",liquidEnd:"rgba(239,68,68,0.55)",

    conclusion:"KI catalyzes H₂O₂ decomposition. Soap traps O₂ gas. Exothermic — foam is warm. Demonstrates catalysis and gas pressure.",

    observations:["Foam Eruption","O₂ Release","Exothermic","Catalysis"],

    finalTemp:55.0,bubbles:true,precipitate:false,heat:true,showBurette:false,showElectrodes:false

  },



  ferrofluid:{

    name:"Ferrofluid Magnetic Reaction",icon:"🧲",category:"Spectacular",

    hardware:"beaker",

    chemicals:[

      {id:"fecl3_ff",name:"FeCl₃",conc:"0.5M",color:"rgba(180,80,20,0.55)",label:"FeCl₃",unit:"0.5M",desc:"Iron(III) chloride — source of Fe³⁺ ions for nanoparticle synthesis"},

      {id:"fecl2_ff",name:"FeCl₂",conc:"0.25M",color:"rgba(160,100,40,0.5)",label:"FeCl₂",unit:"0.25M",desc:"Iron(II) chloride — provides Fe²⁺ ions"},

      {id:"naoh_ff",name:"NH₃ (aq)",conc:"Conc.",color:"rgba(200,230,255,0.2)",label:"NH₃",unit:"Conc.",desc:"Ammonia — precipitates magnetite Fe₃O₄ nanoparticles"},

      {id:"oleic_ff",name:"Oleic Acid",conc:"Surfactant",color:"rgba(245,210,100,0.4)",label:"Oleic Acid",unit:"Surf.",desc:"Coats nanoparticles, keeps them suspended — forms true ferrofluid"}

    ],

    steps:[

      {title:"Mix Iron Salts",desc:"Combine FeCl₃ and FeCl₂ (2:1 ratio). Fe²⁺ and Fe³⁺ ions present in solution.",action:"Select FeCl₃ & FeCl₂"},

      {title:"Precipitate Fe₃O₄",desc:"Add concentrated ammonia. Black magnetite (Fe₃O₄) nanoparticles precipitate: Fe²⁺ + 2Fe³⁺ + 8OH⁻ → Fe₃O₄↓ + 4H₂O",action:"Select NH₃"},

      {title:"Add Surfactant",desc:"Add oleic acid — it coats each nanoparticle, preventing clumping. Particles stay dispersed in carrier fluid.",action:"Select Oleic Acid"},

      {title:"Apply Magnet",desc:"Bring magnet near — particles align along field lines instantly. Dramatic spike patterns appear (normal-field instability).",action:"Click Run Reaction"}

    ],

    prediction:"Magnetite nanoparticles align along magnetic field lines creating distinctive spike patterns.",

    expectedResult:"Black ferrofluid forms spikes and responds to magnetic field",

    equation:"Fe²⁺ + 2Fe³⁺ + 8OH⁻ → Fe₃O₄↓ + 4H₂O [Oleic acid → stable colloid]",

    observation:"Black liquid forms sharp spike patterns when magnet is applied. Without magnet — behaves like liquid. Magnetic dipole alignment visible.",

    finalPH:9.5,finalColor:"Black Magnetic Liquid",finalColorCSS:"rgba(20,20,30,0.85)",

    liquidStart:"rgba(180,80,20,0.55)",liquidEnd:"rgba(20,20,30,0.85)",

    conclusion:"Ferrofluid = Fe₃O₄ nanoparticles + surfactant + carrier. Particles align with B-field. Rosensweig instability creates spikes.",

    observations:["Spike Patterns","Magnetic Alignment","Nanoparticles","Colloid"],

    finalTemp:28.0,bubbles:false,precipitate:true,heat:false,showBurette:false,showElectrodes:false

  },



  luminol:{

    name:"Luminol Chemiluminescence",icon:"💙",category:"Spectacular",

    hardware:"conical_flask",

    chemicals:[

      {id:"luminol_lm",name:"Luminol",conc:"0.1M",color:"rgba(220,220,240,0.2)",label:"Luminol",unit:"0.1M",desc:"3-aminophthalhydrazide — chemiluminescent compound"},

      {id:"h2o2_lm",name:"H₂O₂",conc:"3%",color:"rgba(200,230,255,0.2)",label:"H₂O₂",unit:"3%",desc:"Hydrogen peroxide — oxidant for luminol"},

      {id:"naoh_lm",name:"NaOH",conc:"0.1M",color:"rgba(59,130,246,0.25)",label:"NaOH",unit:"0.1M",desc:"Alkaline medium required for luminol oxidation"},

      {id:"k3fe_lm",name:"K₃[Fe(CN)₆]",conc:"Trace",color:"rgba(245,200,50,0.45)",label:"K₃Fe(CN)₆",unit:"Trace",desc:"Iron catalyst — accelerates electron transfer for light emission"}

    ],

    steps:[

      {title:"Alkaline Solution",desc:"Dissolve luminol in NaOH solution. Alkaline conditions deprotonate luminol for reactivity.",action:"Select Luminol + NaOH"},

      {title:"Add Catalyst",desc:"Add trace K₃[Fe(CN)₆]. Iron(III) ions act as electron-transfer catalyst.",action:"Select K₃Fe(CN)₆"},

      {title:"Add H₂O₂",desc:"Add H₂O₂. Oxidizes luminol — electrons jump to excited state: Luminol + H₂O₂ → excited 3-APA* + N₂",action:"Select H₂O₂"},

      {title:"Observe Glow",desc:"Excited electrons return to ground state → emit blue photons (λ≈425 nm). Chemical energy → light!",action:"Click Run Reaction"}

    ],

    prediction:"Luminol oxidation raises electrons to excited state. Return to ground state emits blue light (chemiluminescence).",

    expectedResult:"Bright blue glowing light in the dark — chemiluminescence",

    equation:"Luminol + H₂O₂ →(OH⁻, Fe³⁺) 3-APA* + N₂ → 3-APA + hν (blue, 425 nm)",

    observation:"Solution glows bright blue in darkness. No heat needed. Light intensity fades as luminol is consumed. Blue glow lasts 30–60 seconds.",

    finalPH:12.0,finalColor:"Glowing Blue Light",finalColorCSS:"rgba(59,130,246,0.7)",

    liquidStart:"rgba(220,220,240,0.2)",liquidEnd:"rgba(59,130,246,0.7)",

    conclusion:"Chemiluminescence: chemical energy directly converts to light. No heat required. Used in forensic blood detection.",

    observations:["Blue Glow","Chemiluminescence","Electron Excitation","No Heat"],

    finalTemp:25.0,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  dry_ice:{

    name:"Dry Ice Sublimation",icon:"❄️",category:"Spectacular",

    hardware:"beaker",

    chemicals:[

      {id:"dryice_di",name:"Dry Ice",conc:"Solid CO₂",color:"rgba(200,240,255,0.35)",label:"CO₂(s)",unit:"Solid",desc:"Solid CO₂ at −78.5°C — sublimes directly to gas at room pressure"},

      {id:"water_di",name:"Warm Water",conc:"~60°C",color:"rgba(59,130,246,0.3)",label:"H₂O",unit:"Warm",desc:"Warm water provides heat energy — accelerates sublimation dramatically"},

      {id:"soap_di",name:"Dish Soap",conc:"Few drops",color:"rgba(16,185,129,0.3)",label:"Soap",unit:"Drops",desc:"Creates CO₂ bubbles — smoky bubble effect"},

      {id:"dye_di",name:"Food Dye",conc:"Optional",color:"rgba(139,92,246,0.45)",label:"Dye",unit:"Opt.",desc:"Colors the smoke bubble for visual effect"}

    ],

    steps:[

      {title:"Add Dry Ice",desc:"Place dry ice (solid CO₂, −78.5°C) in beaker. CO₂ molecules gain kinetic energy from ambient heat. Sublimation begins: CO₂(s) → CO₂(g)",action:"Select Dry Ice"},

      {title:"Add Warm Water",desc:"Pour warm water over dry ice. Rapid heat transfer accelerates sublimation. Dense white fog (CO₂ + water vapor) forms and spills over.",action:"Select Warm Water"},

      {title:"Add Soap",desc:"Add dish soap. CO₂ gas creates soap bubbles filled with fog. Bubbles contain cold CO₂ fog and burst dramatically.",action:"Select Dish Soap"},

      {title:"Observe Sublimation",desc:"Watch fog cascade over the beaker. CO₂ goes solid→gas with no liquid phase. Triple point of CO₂ is at 5.2 atm — at 1 atm, liquid CO₂ cannot exist.",action:"Click Run Reaction"}

    ],

    prediction:"Dry ice sublimes directly solid→gas at 1 atm. Warm water accelerates this. Fog = CO₂ + condensed water vapor.",

    expectedResult:"Dense white fog cascading down + fog-filled soap bubbles",

    equation:"CO₂(s) → CO₂(g) [ΔH_sub = +25.2 kJ/mol, T = −78.5°C at 1 atm]",

    observation:"Dense white fog pours over the beaker edges. Temperature drops sharply near fog. Soapy bubbles contain white fog and burst with a cold puff.",

    finalPH:4.5,finalColor:"White Fog / Mist",finalColorCSS:"rgba(200,240,255,0.75)",

    liquidStart:"rgba(200,240,255,0.35)",liquidEnd:"rgba(200,240,255,0.75)",

    conclusion:"Sublimation: CO₂ triple point at 5.2 atm means no liquid at ambient pressure. Fog = CO₂ gas + condensed water vapour.",

    observations:["Sublimation","Dense Fog","No Liquid Phase","Rapid Cooling"],

    finalTemp:-10.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  liquid_nitrogen:{

    name:"Liquid Nitrogen Freezing",icon:"🌡️",category:"Spectacular",

    hardware:"beaker",

    chemicals:[

      {id:"ln2_ln",name:"Liquid N₂",conc:"−196°C",color:"rgba(180,220,255,0.35)",label:"LN₂",unit:"−196°C",desc:"Liquid nitrogen — cryogenic liquid at −196°C (77 K), rapid heat absorber"},

      {id:"water_ln",name:"Water",conc:"Room temp",color:"rgba(59,130,246,0.3)",label:"H₂O",unit:"25°C",desc:"Water molecules lose kinetic energy — form ice crystal lattice instantly"},

      {id:"flower_ln",name:"Flower / Object",conc:"Biological",color:"rgba(236,72,153,0.45)",label:"Object",unit:"Solid",desc:"Flower or rubber — becomes extremely brittle when flash-frozen"},

      {id:"soap_ln",name:"Soapy Water",conc:"Thin layer",color:"rgba(16,185,129,0.3)",label:"Soap H₂O",unit:"Thin",desc:"Creates frozen soap bubble — dramatic cryogenic effect"}

    ],

    steps:[

      {title:"Prepare LN₂",desc:"Pour liquid nitrogen (−196°C) into dewar/beaker carefully. It immediately boils from ambient heat: N₂(l) → N₂(g). Leidenfrost effect visible.",action:"Select Liquid N₂"},

      {title:"Add Water / Object",desc:"Place object/water near LN₂. Heat transfers rapidly: ΔQ = mcΔT. Water molecules lose kinetic energy → fixed in crystal lattice. Flash freezing in <1 second.",action:"Select Object / Water"},

      {title:"Soapy Bubble",desc:"Blow soapy water bubble onto LN₂ surface. The bubble freezes in mid-air — ice crystal lattice forms in the soap membrane.",action:"Select Soapy Water"},

      {title:"Observe Cryo-Freezing",desc:"Frozen objects shatter like glass. Ice forms instantly. N₂ boils continuously. Leidenfrost vapor layer insulates liquid from container.",action:"Click Run Reaction"}

    ],

    prediction:"LN₂ at −196°C rapidly removes heat from objects. Water crystallizes instantly. Organic materials become brittle.",

    expectedResult:"Instant freezing, objects shatter, frozen soap bubbles, boiling nitrogen",

    equation:"N₂(l) → N₂(g) + heat [Bp = −196°C]; H₂O(l) → H₂O(s) [ΔH_fus = −6.01 kJ/mol]",

    observation:"Objects freeze and shatter. Soap bubble freezes mid-air. Dense white nitrogen fog. Leidenfrost droplets skitter on surface.",

    finalPH:7.0,finalColor:"Ice Crystal / Frozen White",finalColorCSS:"rgba(200,235,255,0.8)",

    liquidStart:"rgba(180,220,255,0.35)",liquidEnd:"rgba(200,235,255,0.8)",

    conclusion:"Cryogenic freezing: rapid ΔT = −221°C removes thermal energy. Molecules fixed in crystal lattice. Leidenfrost effect insulates N₂ from boiling away instantly.",

    observations:["Flash Freezing","Crystal Lattice","Leidenfrost Effect","Brittle Fracture"],

    finalTemp:-196.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  iodine_clock:{

    name:"Iodine Clock Reaction",icon:"⏱️",category:"Spectacular",

    hardware:"beaker",

    chemicals:[

      {id:"h2o2_ic",name:"H₂O₂",conc:"3%",color:"rgba(200,230,255,0.18)",label:"H₂O₂",unit:"3%",desc:"Hydrogen peroxide — oxidises I⁻ to I₂. Acts as the clock's primary oxidant."},

      {id:"ki_ic",name:"KI (potassium iodide)",conc:"0.1M",color:"rgba(210,210,180,0.2)",label:"KI",unit:"0.1M",desc:"Provides I⁻ ions — rapidly oxidised to I₂ by H₂O₂, then immediately reduced back by thiosulfate."},

      {id:"na2s2o3_ic",name:"Na₂S₂O₃",conc:"0.01M",color:"rgba(220,220,220,0.15)",label:"Na₂S₂O₃",unit:"0.01M",desc:"Sodium thiosulfate — the 'clock hand'. Instantly reduces I₂ back to I⁻. Reaction turns dark only when it is fully consumed."},

      {id:"starch_ic",name:"Starch Solution",conc:"1%",color:"rgba(245,245,240,0.25)",label:"Starch",unit:"1%",desc:"Indicator — forms intensely dark blue-black complex with free I₂. The sudden colour change signals thiosulfate exhaustion."}

    ],

    steps:[

      {title:"Prepare Solution A",desc:"Mix KI (0.1M), Na₂S₂O₃ (0.01M) and 1% starch solution in beaker A. This is the 'reducing/indicator' solution — colourless and clear.",action:"Select KI + Na₂S₂O₃ + Starch"},

      {title:"Prepare Solution B",desc:"Add H₂O₂ (3%) to beaker B. This is the oxidant. H₂O₂ will continuously oxidise I⁻ → I₂.",action:"Select H₂O₂"},

      {title:"Mix A into B",desc:"Pour Solution A into Solution B rapidly. The clock starts! H₂O₂ oxidises I⁻ → I₂, but Na₂S₂O₃ instantly reduces I₂ → I⁻ again — so no colour appears.",action:"Click Run Reaction"},

      {title:"Sudden Colour Change",desc:"When all Na₂S₂O₃ is exhausted, free I₂ suddenly accumulates → starch turns the solution intensely dark blue-black in under 1 second. Timing depends on concentrations and temperature.","action":"Observe sudden colour change"}

    ],

    prediction:"No visible change until Na₂S₂O₃ is fully consumed, then sudden dramatic blue-black appearance. Classic oscillating/clock kinetics demonstration.",

    expectedResult:"Colourless solution suddenly turns deep blue-black",

    equation:"Reaction 1 (fast): H₂O₂ + 2I⁻ + 2H⁺ → I₂ + 2H₂O\nReaction 2 (fast scavenger): I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻\nWhen [S₂O₃²⁻] = 0: I₂ accumulates → Starch·I₂ complex (deep blue-black)",

    observation:"Solution remains perfectly clear for a defined induction period (typically 5–60 s depending on concentrations and temperature). At the exact moment Na₂S₂O₃ is consumed, solution turns intensely dark blue-black in < 1 second.",

    finalPH:4.5,finalColor:"Deep Blue-Black",finalColorCSS:"rgba(10,5,40,0.92)",

    liquidStart:"rgba(200,230,255,0.18)",liquidEnd:"rgba(10,5,40,0.92)",

    conclusion:"The Iodine Clock is a masterclass in reaction kinetics: two competing reactions run simultaneously. The thiosulfate acts as a precise chemical timer. When it is exhausted, the I₂/starch complex forms explosively. Rate ∝ [H₂O₂][I⁻][H⁺]. Arrhenius: raising temperature shortens induction time. Used in industry to study reaction kinetics and enzyme activity.",

    observations:["Sudden Colour Change","Induction Period","Clock Kinetics","Starch Indicator","Competing Reactions","Rate Dependency"],

    finalTemp:25.0,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  belousov_zhabotinsky:{

    name:"Belousov–Zhabotinsky Reaction",icon:"🌀",category:"Master's Level",

    hardware:"petri_dish",

    chemicals:[

      {id:"kbro3_bz",name:"KBrO₃",conc:"0.3M",color:"rgba(245,158,11,0.25)",label:"KBrO₃",unit:"0.3M",desc:"Potassium bromate — primary oxidant. Provides bromate ions BrO₃⁻ that drive the autocatalytic cycle. Controls the overall oscillation frequency."},

      {id:"malonic_bz",name:"Malonic Acid",conc:"0.2M",color:"rgba(220,220,200,0.3)",label:"CH₂(COOH)₂",unit:"0.2M",desc:"Malonic acid — the organic substrate. Gets brominated and oxidised continuously by Ce⁴⁺, reducing it back to Ce³⁺ to restart the cycle. Fuel for the oscillation."},

      {id:"ferroin_bz",name:"Ferroin Indicator",conc:"0.005M",color:"rgba(220,50,30,0.7)",label:"Ferroin",unit:"0.005M",desc:"Ferroin [Fe(phen)₃²⁺] — redox indicator. Red in reduced Fe²⁺ state, blue in oxidised Fe³⁺ state. Makes oscillations visually spectacular as spiral waves."},

      {id:"h2so4_bz",name:"H₂SO₄",conc:"0.3M",color:"rgba(245,158,11,0.2)",label:"H₂SO₄",unit:"0.3M",desc:"Sulfuric acid — provides acidic medium. Protons H⁺ are essential for the bromate reduction steps. Controls wave propagation speed."}

    ],

    steps:[

      {title:"Prepare Acid Medium",desc:"Add 0.3M H₂SO₄ to a wide Petri dish. Acidic medium (H⁺) is essential — it participates directly in the bromate oxidation step: BrO₃⁻ + Br⁻ + 2H⁺ → HBrO₂ + HOBr. Use glass Petri dish for clear observation of waves.",action:"Select H₂SO₄"},

      {title:"Dissolve KBrO₃",desc:"Dissolve KBrO₃ in the acidic solution. BrO₃⁻ ions are the primary oxidant. Stir gently until clear. The bromate concentration controls oscillation period — higher [BrO₃⁻] = faster cycling.",action:"Select KBrO₃"},

      {title:"Add Malonic Acid",desc:"Add malonic acid — the organic reductant. It gets brominated (Br₂ + CH₂(COOH)₂ → BrCH(COOH)₂ + HBr), then oxidised by Ce⁴⁺, regenerating Ce³⁺ catalyst. This is the 'reset' mechanism of the chemical clock.",action:"Select Malonic Acid"},

      {title:"Add Ferroin & Observe Spirals",desc:"Add ferroin indicator. Solution starts red (Fe²⁺). Gently tilt dish — do NOT stir. Within 60–90 seconds, blue oxidation waves (Fe³⁺) begin forming. Spiral and target patterns (Turing patterns) self-organize. Red ↔ Blue oscillations repeat every 60–120 seconds.",action:"Click Run Reaction"}

    ],

    prediction:"Autocatalytic BrO₂• production drives oscillation. HBrO₂ autocatalytically activates Ce³⁺→Ce⁴⁺ (blue). Malonic acid reduction resets to Ce³⁺ (red). Reaction-diffusion produces spiral Turing patterns.",

    expectedResult:"Red ↔ Blue oscillating spiral waves repeating every 60–120 s",

    equation:"Step 1 — Bromate oxidation: BrO₃⁻ + Br⁻ + 2H⁺ → HBrO₂ + HOBr\nStep 2 — Autocatalytic: HBrO₂ + Ce³⁺ + H⁺ → Ce⁴⁺ + ½ BrO₃⁻ + H₂O\nStep 3 — Organic reduction: Ce⁴⁺ + CH₂(COOH)₂ → Ce³⁺ + BrCH(COOH)₂\n[Ferroin: Fe²⁺(red) ⇌ Fe³⁺(blue)]",

    observation:"Solution oscillates between vivid red (Fe²⁺, reduced) and blue (Fe³⁺, oxidised) with self-organising spiral waves propagating across Petri dish surface. Oscillations continue for 20–40 minutes with period of 60–120 seconds.",

    finalPH:1.2,finalColor:"Red ↔ Blue Oscillating",finalColorCSS:"rgba(180,30,30,0.75)",

    liquidStart:"rgba(220,50,30,0.6)",liquidEnd:"rgba(30,80,200,0.7)",

    conclusion:"The BZ reaction is the gold-standard example of a non-equilibrium dissipative structure. It demonstrates reaction-diffusion systems, autocatalysis, self-organisation, and mathematical chaos. The Field-Körös-Noyes (FKN) mechanism explains the oscillations. Spiral wave formation is governed by the same PDEs (reaction-diffusion equations) that describe cardiac arrhythmias and predator-prey cycles.",

    observations:["Red↔Blue Oscillation","Spiral Waves","Autocatalysis","Turing Patterns","Self-Organization","Reaction-Diffusion"],

    finalTemp:25.0,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  grignard_reaction:{

    name:"Grignard Reaction",icon:"🔗",category:"Advanced Organic",

    hardware:"round_flask",

    chemicals:[

      {id:"rmgx",name:"Methylmagnesium Bromide (CH₃MgBr)",conc:"1.0M in Et₂O",color:"rgba(180,140,255,0.45)",label:"CH₃MgBr",unit:"1.0M/Et₂O",desc:"Grignard reagent — CH₃MgBr in anhydrous diethyl ether. Prepared from Mg turnings and CH₃Br under nitrogen. The C–Mg bond is highly polar: C⁻–Mg²⁺. Carbon acts as a nucleophile (carbanion equivalent). Extremely air- and moisture-sensitive — water destroys it instantly (RMgX + H₂O → RH + Mg(OH)X)."},

      {id:"benzaldehyde",name:"Benzaldehyde (PhCHO)",conc:"Pure",color:"rgba(255,220,100,0.45)",label:"PhCHO",unit:"Pure",desc:"Electrophilic carbonyl substrate. The carbonyl carbon (C=O) is electron-deficient (δ+) due to oxygen's electronegativity. Target for nucleophilic attack by the Grignard carbanion. Dry and freshly distilled — any moisture quenches the Grignard reagent before reaction occurs."},

      {id:"dry_ether",name:"Anhydrous Diethyl Ether (Et₂O)",conc:"Dry",color:"rgba(200,240,255,0.22)",label:"Et₂O (dry)",unit:"Anhydrous",desc:"Solvent AND Grignard stabiliser. Ether oxygen lone pairs coordinate to Mg²⁺, forming a stable solvate complex R–Mg(OEt₂)₂X. This solvation is essential — Grignard reagents do NOT form in non-coordinating solvents. Highly flammable (bp 35°C) — no open flames. Dried over Na wire or molecular sieves."},

      {id:"nh4cl_aq",name:"NH₄Cl (aq) — Hydrolysis",conc:"Saturated",color:"rgba(200,230,200,0.35)",label:"NH₄Cl(aq)",unit:"Saturated",desc:"Aqueous workup reagent. Saturated NH₄Cl gently protonates the magnesium alkoxide intermediate RCH(O⁻MgBr)R′ → RCH(OH)R′ alcohol product. Mild acid prevents emulsions during liquid-liquid extraction. After workup, the organic layer contains the secondary alcohol product."}

    ],

    steps:[

      {title:"Prepare Dry Flask Under N₂",desc:"Flame-dry a 3-neck round-bottom flask fitted with a reflux condenser, pressure-equalising dropping funnel, and nitrogen inlet. Flush with dry N₂ for 5 minutes. Place a magnetic stirrer bar inside. CRITICAL: all glassware, solvents and reagents must be rigorously dry — a single drop of water destroys the Grignard reagent (RMgX + H₂O → RH + Mg(OH)X). Moisture = failed reaction.",action:"Select Et₂O (dry)"},

      {title:"Add Grignard Reagent in Ether",desc:"Via dropping funnel, slowly add 1.0M CH₃MgBr in anhydrous Et₂O to the flask under N₂ flow. The solution turns pale grey-yellow. Note exothermic warming. Stir gently. The Grignard is now the nucleophile — carbanion carbon (δ⁻) is ready to attack the electrophilic carbonyl carbon (δ+) of benzaldehyde.",action:"Select CH₃MgBr"},

      {title:"Add Benzaldehyde (Dropwise, 0°C)",desc:"Cool flask to 0°C using ice-salt bath. Add dry benzaldehyde dropwise via dropping funnel with constant stirring. EXOTHERMIC — controlled addition prevents violent reaction. The nucleophilic carbon of CH₃MgBr attacks the electrophilic carbonyl carbon (C=O, δ+) of PhCHO. Intermediate formed: PhCH(O⁻MgBr)CH₃ — a magnesium alkoxide chelated by ether.",action:"Select PhCHO"},

      {title:"Aqueous Workup — Hydrolyse Alkoxide",desc:"Transfer mixture to separating funnel. Add saturated NH₄Cl(aq) solution slowly. Vigorous mixing protonates the alkoxide: Ph–CH(O⁻MgBr)–CH₃ + NH₄⁺ → Ph–CH(OH)–CH₃ + Mg²⁺ + Br⁻. Two layers form — organic (ether, product) on top. Separate, dry over MgSO₄, filter, and evaporate ether under reduced pressure to isolate 1-phenylethanol.",action:"Click Run Reaction"}

    ],

    prediction:"Nucleophilic carbanion (CH₃⁻ equivalent) attacks electrophilic carbonyl carbon of PhCHO → tetrahedral alkoxide intermediate → hydrolysis gives secondary alcohol 1-phenylethanol (PhCH(OH)CH₃). Exothermic addition. Moisture = failure.",

    expectedResult:"Colourless oily 1-phenylethanol (secondary alcohol) isolated after aqueous workup",

    equation:"Step 1 — Nucleophilic attack: CH₃MgBr + PhCHO → Ph–CH(O⁻MgBr)–CH₃ (alkoxide)\nStep 2 — Hydrolysis: Ph–CH(O⁻MgBr)–CH₃ + NH₄Cl(aq) → Ph–CH(OH)–CH₃ + MgBrCl\nOverall: RMgX + R′CHO → R′CH(OH)R (secondary alcohol)\nHere: CH₃MgBr + PhCHO → 1-phenylethanol (C₆H₅CH(OH)CH₃)",

    observation:"Exothermic heat evolution upon benzaldehyde addition. Solution turns opaque grey-yellow. After NH₄Cl workup, two liquid layers separate. Organic layer (ether) contains 1-phenylethanol. Ether evaporation yields colourless, sweet-smelling secondary alcohol. Bp of product: 203°C. GC-MS confirms 1-phenylethanol.",

    finalPH:7.2,finalColor:"Colourless / Pale Yellow",finalColorCSS:"rgba(255,240,160,0.45)",

    liquidStart:"rgba(180,140,255,0.45)",liquidEnd:"rgba(255,240,160,0.45)",

    conclusion:"The Grignard reaction is one of the most powerful C–C bond-forming reactions in organic synthesis. The polar C–Mg bond makes carbon nucleophilic — a 'carbanion equivalent'. Strict anhydrous conditions are essential: water instantly proteolyses RMgX to RH. The reaction generates a tetrahedral alkoxide intermediate, hydrolysed to a primary, secondary, or tertiary alcohol depending on the carbonyl substrate (HCHO → 1°, RCHO → 2°, R₂CO → 3°). Victor Grignard received the Nobel Prize in Chemistry in 1912 for this discovery.",

    observations:["Exothermic Reaction","C–C Bond Formation","Carbanion Nucleophile","Alkoxide Intermediate","Secondary Alcohol Product","Air-Sensitive Chemistry"],

    finalTemp:0.0,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  nylon_rope_trick:{

    name:"Nylon Rope Trick",icon:"🧵",category:"Polymer Chemistry",

    hardware:"beaker",

    chemicals:[

      {id:"hexamethylenediamine",name:"Hexamethylenediamine (HMD)",conc:"0.5M in NaOH(aq)",color:"rgba(180,230,255,0.40)",label:"H₂N(CH₂)₆NH₂",unit:"0.5M aq",desc:"Hexamethylenediamine — bifunctional diamine (two –NH₂ groups). Dissolved in 0.5M NaOH aqueous solution. NaOH neutralises the HCl produced during polymerisation, driving the equilibrium towards polymer formation and preventing chain termination by HCl. Each molecule provides one monomer unit contributing two amide bonds to the growing chain."},

      {id:"sebacoyl_chloride",name:"Sebacoyl Chloride",conc:"0.5M in cyclohexane",color:"rgba(255,200,80,0.40)",label:"ClOC(CH₂)₈COCl",unit:"0.5M/cyclohex",desc:"Sebacoyl chloride — bifunctional acid chloride (two –COCl groups). Dissolved in non-polar cyclohexane (organic layer). Acid chlorides are far more reactive than carboxylic acids — the C=O is highly electrophilic due to the electron-withdrawing Cl. Immiscible with the aqueous HMD layer → polymerisation occurs only at the interface between the two liquid layers."},

      {id:"naoh_aq",name:"NaOH Solution",conc:"0.5M",color:"rgba(200,220,200,0.30)",label:"NaOH(aq)",unit:"0.5M",desc:"Sodium hydroxide — base added to the aqueous HMD phase. Neutralises HCl byproduct: NaOH + HCl → NaCl + H₂O. Without NaOH, HCl accumulates and protonates the amine (–NH₂ + HCl → –NH₃⁺Cl⁻), deactivating the nucleophile and stopping polymerisation. The base keeps the amine nucleophilic throughout chain growth."},

      {id:"cyclohexane_s",name:"Cyclohexane (Solvent)",conc:"Pure",color:"rgba(255,240,200,0.20)",label:"Cyclohexane",unit:"Solvent",desc:"Non-polar organic solvent for sebacoyl chloride. Completely immiscible with the aqueous HMD layer — this immiscibility is ESSENTIAL. It creates a sharp, stable liquid-liquid interface where polymerisation occurs. The two monomers meet only at this boundary, forming the nylon film that can be drawn out as a continuous rope."}

    ],

    steps:[

      {title:"Prepare Aqueous Phase (Bottom Layer)",desc:"In a 250 mL beaker, dissolve hexamethylenediamine (HMD) in 0.5M NaOH aqueous solution. This forms the lower aqueous layer. NaOH is essential — it neutralises HCl produced during amide bond formation (–NH₂ + ClCO– → –NHCO– + HCl; NaOH + HCl → NaCl + H₂O), preventing amine protonation which would halt the reaction.",action:"Select H₂N(CH₂)₆NH₂"},

      {title:"Carefully Layer Organic Phase on Top",desc:"Slowly pour the sebacoyl chloride / cyclohexane solution down the inside wall of the beaker using a glass rod so it FLOATS on top of the aqueous layer without mixing. Cyclohexane (density 0.78 g/mL) is less dense than water — it sits on top forming a clear interface. DO NOT STIR — the interface must remain sharp. Polymerisation starts immediately at the boundary.",action:"Select Sebacoyl Chloride"},

      {title:"Observe Nylon Film Formation",desc:"Within seconds, a white solid nylon film forms at the liquid-liquid interface. The amine groups (–NH₂) of HMD nucleophilically attack the carbonyl carbon (C=O) of sebacoyl chloride's acid chloride (–COCl) groups. Tetrahedral intermediate forms, Cl⁻ is eliminated, and an amide bond (–CO–NH–) is created. This step-growth polycondensation propagates along the entire interface.",action:"Select NaOH(aq)"},

      {title:"Pull the Nylon Rope",desc:"Using forceps or a glass rod, grab the white film at the centre of the interface and pull SLOWLY upward in a continuous thread. As you pull, fresh monomers diffuse to the depleted interface — new polymer forms continuously, enabling an unbroken nylon rope to be wound onto a glass rod. Each monomer unit: –NH(CH₂)₆NHCO(CH₂)₈CO– (nylon-6,10 repeat unit). Pull gently and steadily for longest thread.",action:"Click Run Reaction"}

    ],

    prediction:"Interfacial polycondensation: nucleophilic –NH₂ attacks electrophilic –COCl at the aqueous/organic interface. HCl eliminated per amide bond formed, neutralised by NaOH. Continuous nylon-6,10 thread drawn from interface as monomers replenish from both phases.",

    expectedResult:"Continuous white nylon-6,10 rope drawn from the liquid interface",

    equation:"n H₂N(CH₂)₆NH₂ + n ClOC(CH₂)₈COCl →\n[–NH(CH₂)₆NHCO(CH₂)₈CO–]ₙ + 2n HCl\nHCl neutralised by NaOH: HCl + NaOH → NaCl + H₂O\nRepeat unit MW: 282 g/mol (nylon-6,10)\nAmide bond: –CO–NH– (planar, partial double bond character due to resonance)",

    observation:"Instant white film at the organic-aqueous interface upon layering. Continuous white nylon thread can be drawn upward indefinitely as long as monomers are present. Rope is pliable, slightly translucent, and strengthens on washing (removes NaCl/HCl). Typical molecular weight: 10,000–30,000 g/mol. Thread becomes increasingly opaque as water and salt are removed.",

    finalPH:8.5,finalColor:"White Polymer Thread",finalColorCSS:"rgba(240,245,255,0.92)",

    liquidStart:"rgba(180,230,255,0.40)",liquidEnd:"rgba(240,245,255,0.92)",

    conclusion:"The Nylon Rope Trick is the definitive demonstration of interfacial step-growth polycondensation. Two bifunctional monomers (diamine + diacid chloride) react only at the liquid-liquid boundary, forming a polyamide (nylon-6,10) with repeat amide bonds –CO–NH–. Each amide bond involves: (1) nucleophilic attack of –NH₂ on C=O of –COCl; (2) tetrahedral intermediate; (3) HCl elimination. The thread's mechanical strength arises from inter-chain hydrogen bonding between amide N–H···O=C groups. Nylon revolutionised textiles (stockings, 1939), replaced silk in parachutes (WWII), and remains a major engineering polymer. Step-growth kinetics: Mw increases slowly until high conversion.",

    observations:["Interfacial Polymerisation","Amide Bond Formation","Step-Growth Kinetics","HCl Eliminated","Continuous Nylon Thread","H-Bonding in Polymer"],

    finalTemp:25.0,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  tollens_silver_mirror:{

    name:"Tollens’ Silver Mirror Reaction",icon:"🪞",category:"Advanced Organic",

    hardware:"test_tube_waterbath",

    chemicals:[

      {id:"agno3_tol",name:"AgNO₃ Solution",conc:"0.1M",color:"rgba(220,230,245,0.30)",label:"AgNO₃",unit:"0.1M",desc:"Silver nitrate — source of Ag⁺ ions. In Tollens’ reagent, Ag⁺ is complexed with ammonia as [Ag(NH₃)₂]⁺ (diamminesilver(I) ion). This complex is a mild, selective oxidant — it oxidises aldehydes but NOT ketones. CAUTION: AgNO₃ stains skin and clothing black (photoreduction to Ag⁰). Freshly prepare Tollens’ reagent just before use — old reagent may form explosive silver nitride (Ag₃N). Never store in a closed container after preparation."},

      {id:"naoh_tol",name:"NaOH Solution",conc:"1M",color:"rgba(200,230,200,0.28)",label:"NaOH",unit:"1M",desc:"Sodium hydroxide — first step of Tollens’ reagent preparation. Added to AgNO₃ to precipitate Ag₂O (brown precipitate): 2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O. The Ag₂O precipitate is then dissolved by ammonia to give the clear [Ag(NH₃)₂]⁺ complex. NaOH ensures alkaline conditions (pH > 12) required for the oxidation half-reaction: RCHO + 3OH⁻ → RCOO⁻ + 2H₂O + 2e⁻."},

      {id:"nh3_tol",name:"Ammonia Solution (NH₃)",conc:"2M",color:"rgba(220,245,210,0.28)",label:"NH₃(aq)",unit:"2M",desc:"Ammonium hydroxide — dissolves the Ag₂O precipitate to form the active [Ag(NH₃)₂]⁺ Tollens’ complex: Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻. This complex is the mild oxidising species. Add NH₃ dropwise until the brown precipitate just dissolves — excess ammonia weakens the reagent. The resulting clear, colourless solution is Tollens’ reagent, ready to test for aldehydes."},

      {id:"glucose_tol",name:"Glucose (Aldehyde test substrate)",conc:"1% aq",color:"rgba(255,235,180,0.32)",label:"Glucose",unit:"1% aq",desc:"D-Glucose — the test aldehyde substrate. Glucose is an aldehyde sugar (open-chain form has –CHO group). It is oxidised by Tollens’ reagent: RCHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → RCOO⁻ + 2Ag↓ + 4NH₃ + 2H₂O. The Ag⁰ deposits as a brilliant silver mirror on the clean inner glass surface of the test tube. Glucose is the classic positive control — ketones (fructose open chain) give a negative result with Tollens’ reagent."}

    ],

    steps:[

      {title:"Clean Test Tube Thoroughly",desc:"Rinse the test tube with 10% NaOH, then distilled water, then dilute HNO₃ (to remove grease), then thoroughly with distilled water again. The test tube MUST be scrupulously clean and grease-free — any contamination prevents a uniform silver mirror and instead produces a black precipitate. Clamp the test tube vertically using a retort stand and clamp inside a 600 mL beaker that will serve as the water bath.",action:"Select AgNO₃"},

      {title:"Prepare Tollens’ Reagent — Step 1",desc:"Add 2 mL of 0.1M AgNO₃ to the clean test tube. Add 2–3 drops of 1M NaOH — a brown precipitate of Ag₂O forms immediately: 2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O. This confirms Ag⁺ is present. The Ag₂O must now be dissolved with ammonia to form the active [Ag(NH₃)₂]⁺ complex. Do NOT add excess NaOH.",action:"Select NaOH → brown Ag₂O precipitate forms"},

      {title:"Prepare Tollens’ Reagent — Step 2 (Dissolve with NH₃)",desc:"Add 2M NH₃(aq) dropwise to the brown Ag₂O precipitate, swirling gently after each drop. The brown precipitate dissolves: Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻. Add NH₃ only until the precipitate just dissolves — the solution should be clear and colourless. This is the freshly prepared Tollens’ reagent. Use immediately — DO NOT store, as the complex may form explosive Ag₃N on prolonged standing.",action:"Select NH₃ → clear [Ag(NH₃)₂]⁺ solution"},

      {title:"Add Glucose & Heat in Water Bath at 60°C",desc:"Add 1 mL of 1% glucose solution to the Tollens’ reagent in the test tube. Swirl gently to mix. Place the test tube in the water bath (600 mL beaker with water on hot plate) pre-heated to 60°C — do NOT boil. Heat at 60°C for 3–5 minutes WITHOUT shaking. Glucose (–CHO group) reduces [Ag(NH₃)₂]⁺: RCHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → RCOO⁻ + 2Ag↓ + 4NH₃ + 2H₂O. Ag⁰ deposits on the glass wall forming a brilliant silver mirror. Monitor temperature with thermometer — above 80°C gives black Ag precipitate instead of mirror.",action:"Click Run Reaction"}

    ],

    prediction:"[Ag(NH₃)₂]⁺ (mild oxidant) oxidises the aldehyde group (–CHO) of glucose. Ag⁺ is reduced to Ag⁰, which deposits as a bright, reflective silver mirror on the inner glass walls. Alkaline conditions (OH⁻) are essential. Ketones give NO reaction — Tollens’ test is a selective diagnostic test for aldehydes.",

    expectedResult:"Bright silver mirror coating on inner test tube wall; solution turns colourless",

    equation:"Reagent prep: 2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O\nDissolution: Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻\nOxidation half: RCHO + 3OH⁻ → RCOO⁻ + 2H₂O + 2e⁻\nReduction half: 2Ag⁺ + 2e⁻ → 2Ag↓\nOverall: RCHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → RCOO⁻ + 2Ag↓ + 4NH₃ + 2H₂O",

    observation:"On gentle heating at 60°C for 3–5 minutes: brilliant silver mirror forms on the inner wall of the test tube. The liquid above the mirror becomes colourless as Ag⁺ is consumed. The silver deposit is reflective, smooth, and adheres to clean glass. Positive result: silver mirror. Negative result (ketone): no mirror, solution remains clear.",

    finalPH:11.5,finalColor:"Silver Mirror on Glass",finalColorCSS:"rgba(192,200,210,0.75)",

    liquidStart:"rgba(220,230,245,0.30)",liquidEnd:"rgba(192,200,210,0.70)",

    conclusion:"Tollens’ test is the gold-standard qualitative test for aldehydes. The [Ag(NH₃)₂]⁺ complex selectively oxidises aldehydes (RCHO → RCOO⁻) but NOT ketones. The Ag⁰ mirror forms only on clean glass. This is a redox reaction: the aldehyde is the reducing agent (oxidised to carboxylate), and Ag⁺ is the oxidising agent (reduced to metallic Ag⁰). Tollens’ test distinguishes aldehydes (positive — silver mirror) from ketones (negative — no mirror). Glucose (aldehyde sugar) is positive; fructose (ketone sugar in open chain) is negative. Bernard Tollens developed this test in 1882. Industrially, this same reaction is used to silver-coat mirrors and thermos flasks.",

    observations:["Silver Mirror Formation","Aldehyde Oxidation","Ag⁺ Reduced to Ag⁰","Coordination Chemistry","Selective Aldehyde Test","Redox Reaction"],

    finalTemp:60.0,bubbles:false,precipitate:true,heat:true,showBurette:false,showElectrodes:false

  },



  briggs_rauscher:{

    name:"Briggs–Rauscher Oscillating Reaction",icon:"🌈",category:"Master's Level",

    hardware:"beaker",

    chemicals:[

      {id:"h2o2_br",name:"H₂O₂",conc:"30%",color:"rgba(200,230,255,0.25)",label:"H₂O₂",unit:"30%",desc:"Hydrogen peroxide — dual-role oxidant. In the radical pathway, H₂O₂ decomposes to generate hydroxyl radicals (•OH) that drive the oxidative branch. In the ionic pathway, H₂O₂ oxidises I⁻ back to IO₃⁻ completing the cycle. CAUTION: 30% H₂O₂ is a strong oxidant and corrosive — handle with gloves and eye protection. Never use concentrated H₂O₂ without a fume hood."},

      {id:"kio3_br",name:"KIO₃ (Potassium Iodate)",conc:"0.067M",color:"rgba(230,220,255,0.30)",label:"KIO₃",unit:"0.067M",desc:"Potassium iodate — source of iodate ions IO₃⁻. In acidic conditions with I⁻, iodate drives the Dushman reaction: IO₃⁻ + 5I⁻ + 6H⁺ → 3I₂ + 3H₂O. The I₂ produced then forms the blue starch complex. KIO₃ concentration directly controls the oscillation frequency — higher [IO₃⁻] = faster cycling."},

      {id:"malonic_br",name:"Malonic Acid",conc:"0.04M",color:"rgba(245,240,210,0.30)",label:"CH₂(COOH)₂",unit:"0.04M",desc:"Malonic acid — the organic substrate and iodine consumer. Reacts with I₂ to form iodomalonic acid: I₂ + CH₂(COOH)₂ → ICH(COOH)₂ + HI. This consumption of I₂ prevents permanent blue starch complex, enabling repeated oscillation. Also provides the carbanion that reacts with radicals in the radical pathway. Acts as the reset mechanism analogous to its role in the BZ reaction."},

      {id:"mnso4_br",name:"MnSO₄ Catalyst",conc:"0.005M",color:"rgba(255,180,180,0.35)",label:"MnSO₄",unit:"0.005M",desc:"Manganese(II) sulfate — the redox catalyst. Mn²⁺ is oxidised to Mn³⁺ by IO₃⁻ and reduced back by I⁻ and malonic acid. This Mn²⁺/Mn³⁺ redox cycling is the central switching mechanism that couples the radical and ionic branches. Without Mn²⁺, oscillations do not occur — only a slow, non-oscillating reaction takes place."},

      {id:"starch_br",name:"Starch Indicator",conc:"0.2%",color:"rgba(250,250,240,0.30)",label:"Starch",unit:"0.2%",desc:"Starch solution — colour indicator. Forms an intensely dark blue-black complex with I₂ (I₃⁻ intercalates into the amylose helix). When [I₂] is high → deep blue. When malonic acid consumes I₂ → colourless. When radical pathway produces amber I₂/HIO intermediate species → amber phase. The three-phase oscillation (colourless → amber → blue) is visible only because of starch."},

      {id:"h2so4_br",name:"H₂SO₄",conc:"0.08M",color:"rgba(255,230,100,0.22)",label:"H₂SO₄",unit:"0.08M",desc:"Sulfuric acid — provides the acidic medium (H⁺) essential for the Dushman reaction (IO₃⁻ + 5I⁻ + 6H⁺ → 3I₂ + 3H₂O). H⁺ concentration controls both the rate and the oscillation period. Too much acid suppresses oscillation; too little prevents the iodate reduction pathway. Dilute H₂SO₄ at 0.08M gives optimal oscillation conditions at room temperature."}

    ],

    steps:[

      {title:"Prepare Acidic Iodate Solution",desc:"Dissolve KIO₃ (0.067M) in dilute H₂SO₄ (0.08M) in a clean 400 mL beaker. Stir until fully dissolved — clear colourless solution. The acidic iodate solution is the oxidant reservoir. H⁺ is essential for the Dushman step: IO₃⁻ + 5I⁻ + 6H⁺ → 3I₂ + 3H₂O. Use a magnetic stirrer plate at medium speed — continuous stirring is required to maintain the spatial homogeneity necessary for global (bulk) oscillation.",action:"Select KIO₃ + H₂SO₄"},

      {title:"Add MnSO₄ Catalyst",desc:"Add MnSO₄ solution (0.005M) to the iodate mixture. The Mn²⁺ ions are the redox switch of the BR reaction. They are oxidised by IO₃⁻ (Mn²⁺ → Mn³⁺, the 'ox' state = amber colour) and reduced by I⁻ and malonic acid (Mn³⁺ → Mn²⁺, the 'red' state). This Mn²⁺⇌Mn³⁺ cycling couples the two competing pathways and produces the bistability that drives oscillation. Solution remains clear at this stage.",action:"Select MnSO₄"},

      {title:"Add Malonic Acid + Starch",desc:"Add malonic acid (0.04M) and starch indicator (0.2%) to the beaker with stirring. Malonic acid is the organic fuel — it reacts with I₂ to form iodomalonic acid, consuming iodine and resetting the cycle. Starch makes the oscillations visible: deep blue when I₂ accumulates (starch–I₃⁻ complex), colourless when I₂ is consumed. Keep stirring at a steady medium speed throughout.",action:"Select Malonic Acid + Starch"},

      {title:"Add H₂O₂ — Oscillations Begin",desc:"Pour 30% H₂O₂ (carefully, using a measuring cylinder) into the stirred mixture. H₂O₂ immediately activates both competing pathways simultaneously. Within 20–60 seconds the first colour change occurs. Observe three repeating phases: (1) COLOURLESS — low [I₂], malonic acid has consumed iodine, Mn in Mn²⁺ state; (2) AMBER — Mn³⁺ accumulates, HIO and I₂ intermediates build up, radical pathway dominates; (3) DEEP BLUE — [I₂] spikes, starch–I₃⁻ complex forms, then malonic acid resets the cycle. Oscillations repeat every 15–30 seconds for 5–15 minutes.",action:"Click Run Reaction"}

    ],

    prediction:"Competing radical (H₂O₂ → •OH) and ionic (IO₃⁻ + I⁻ → I₂) pathways coupled by Mn²⁺/Mn³⁺ redox switching and malonic acid iodine consumption produce nonlinear feedback oscillations. Three visible phases: colourless → amber → deep blue, repeating every 15–30 seconds.",

    expectedResult:"Repeated colourless → amber → deep blue → colourless colour oscillations for 5–15 minutes",

    equation:"Radical pathway: H₂O₂ → 2•OH (Mn²⁺ catalyst)\nIonic pathway (Dushman): IO₃⁻ + 5I⁻ + 6H⁺ → 3I₂ + 3H₂O\nStarch indicator: I₂ + starch → blue complex (I₃⁻ in amylose helix)\nMalonic acid reset: I₂ + CH₂(COOH)₂ → ICH(COOH)₂ + HI\nNet (Mn-catalysed): 2IO₃⁻ + 2H₂O₂ + CH₂(COOH)₂ + H⁺ → oscillating intermediates\nOscillation: [I⁻] alternates between high (colourless) and low (blue/amber) states",

    observation:"After ~30 seconds induction period: solution begins cycling colourless → amber (Mn³⁺/HIO intermediates) → deep blue-black (starch-I₂ complex) → back to colourless. Each cycle takes 15–30 seconds. Oscillations continue for 5–15 minutes before reactants are exhausted and the solution settles to a final blue-black or amber colour. Stirring speed affects oscillation period — faster stirring = shorter period.",

    finalPH:3.5,finalColor:"Deep Blue (oscillating)",finalColorCSS:"rgba(20,20,120,0.85)",

    liquidStart:"rgba(200,230,255,0.25)",liquidEnd:"rgba(20,20,120,0.85)",

    conclusion:"The Briggs–Rauscher reaction is the most visually spectacular example of a homogeneous oscillating chemical reaction. Unlike the BZ reaction (which requires spatial heterogeneity for spiral waves), BR oscillates uniformly throughout the bulk solution. The mechanism involves two competing pathways — a radical pathway (H₂O₂ → •OH) and an ionic pathway (IO₃⁻ + I⁻ → I₂) — coupled by Mn²⁺/Mn³⁺ redox switching. The key insight is that I⁻ is continuously generated (by malonic acid reducing I₂) and consumed (by IO₃⁻ oxidising I⁻), creating a bistable switch. When [I⁻] exceeds a threshold, the system flips; malonic acid resets it. This nonlinear feedback is the hallmark of chaos chemistry and systems chemistry. BR was discovered by Thomas Briggs and Warren Rauscher in 1973.",

    observations:["Colourless → Amber → Blue Oscillation","Radical & Ionic Competing Pathways","Mn²⁺/Mn³⁺ Redox Switch","Starch-Iodine Indicator","Nonlinear Dynamics","Chemical Clock"],

    finalTemp:25.0,bubbles:false,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  thermite:{

    name:"Thermite Reaction (Energetic Metallurgy)",icon:"🔥",category:"Redox",

    hardware:"thermite_setup",

    chemicals:[

      {id:"fe2o3",name:"Iron(III) Oxide Fe₂O₃",conc:"Powder",color:"rgba(180,60,10,0.70)",label:"Fe₂O₃",unit:"Powder",desc:"Iron(III) oxide — rust powder (reddish-brown). Provides Fe³⁺ ions that will be reduced to molten iron. The oxidising agent in the thermite reaction. Reduction half: Fe³⁺ + 3e⁻ → Fe. Must be finely powdered for maximum surface contact with Al."},

      {id:"al_powder",name:"Aluminum Powder",conc:"Fine",color:"rgba(210,220,230,0.65)",label:"Al",unit:"Fine powder",desc:"Aluminium powder — the reducing agent and fuel. Al is higher in the activity series than Fe, so it displaces Fe³⁺ and gets oxidised to Al³⁺. Oxidation half: Al → Al³⁺ + 3e⁻. Fine powder has enormous surface area — critical for reaction rate. Al₂O₃ (corundum) slag forms as byproduct. CAUTION: Al powder is highly flammable and can ignite spontaneously when very finely divided. Handle away from open flame."},

      {id:"igniter_mg",name:"Magnesium Ribbon (Igniter)",conc:"Igniter",color:"rgba(220,230,240,0.50)",label:"Mg ribbon",unit:"Igniter",desc:"Magnesium ribbon used as the ignition source. Thermite has a very high activation energy — cannot be ignited with a match. Mg burns at ~650°C and produces enough heat to initiate the thermite reaction which then sustains itself. Once started, thermite cannot be extinguished with water — CO₂ or sand must be used."},

      {id:"sand_crucible",name:"Sand / Clay Crucible",conc:"Container",color:"rgba(200,185,140,0.55)",label:"Crucible",unit:"Sand",desc:"Sand or clay crucible to contain the reaction. Thermite burns at over 2500°C — hotter than the melting point of iron (1538°C). Regular glass or metal containers would melt. Sand or ceramic absorbs heat and directs molten iron downward. The molten iron pool at the bottom is the spectacular product."}

    ],

    steps:[

      {title:"Prepare Thermite Mixture",desc:"Mix Fe₂O₃ (iron oxide, red powder) and Al powder in 1:2 molar ratio (approximately 3:1 by weight). Both must be finely powdered to maximise contact area. Pour into a clay or ceramic crucible with a small hole at the bottom to allow molten iron to drip out. Place crucible on a heat-resistant sand bed.",action:"Select Fe₂O₃ + Al powder"},

      {title:"Safety Setup",desc:"Set up outdoors on sand or concrete. No water nearby — water reacts explosively with thermite and molten iron. Wear a welding shield or dark goggles — thermite produces intense white light. 3–4 metres minimum safe distance once ignited. Never lean over the crucible.",action:"Select Sand/Crucible"},

      {title:"Insert Magnesium Igniter",desc:"Push one end of the magnesium ribbon into the top of the thermite mixture. Mg provides the ~650°C ignition temperature needed to start the reaction. Thermite itself cannot be lit by a match. Extend the ribbon several cm away from the mixture to allow time to retreat.",action:"Select Mg Ribbon"},

      {title:"Ignite & Observe",desc:"Light the free end of the Mg ribbon and immediately step back 4+ metres. Reaction begins at ~1500°C and immediately accelerates: 2Al + Fe₂O₃ → Al₂O₃ + 2Fe + Δ (ΔH = −851 kJ/mol). Molten iron (white sparks, >2500°C) pours from crucible. White Al₂O₃ slag forms above the iron. Reaction lasts 2–10 seconds.",action:"Click Run Reaction"}

    ],

    prediction:"Al reduces Fe₂O₃ via electron transfer (Al→Al³⁺+3e⁻; Fe³⁺+3e⁻→Fe). Highly exothermic (ΔH=−851 kJ/mol). Reaction self-sustains above 1500°C. Produces molten iron (>2500°C) and white Al₂O₃ slag.",

    expectedResult:"Intense white-orange flash, molten iron sparks, white Al₂O₃ slag above iron pool",

    equation:"Fe₂O₃ + 2Al → 2Fe + Al₂O₃  ΔH = −851 kJ/mol\nOx: Al → Al³⁺ + 3e⁻  (×2)\nRed: Fe³⁺ + 3e⁻ → Fe  (×2)\nTemp >2500°C — above Fe melting point (1538°C)",

    observation:"Intense white-orange blinding flash lasting 2–10 seconds. Temperature exceeds 2500°C. White sparks (molten iron droplets) fly from crucible. Brilliant white Al₂O₃ (corundum) slag forms on top. Molten iron (silver-orange liquid) pools at the bottom and drips out. Smoke is thick white Al₂O₃ fume.",

    finalPH:7.0,finalColor:"Molten Iron + White Slag",finalColorCSS:"rgba(255,140,20,0.90)",

    liquidStart:"rgba(180,60,10,0.70)",liquidEnd:"rgba(255,160,20,0.90)",

    conclusion:"Thermite is a quintessential redox reaction driven by the activity series. Al³⁺/Al (E°=−1.66V) vs Fe³⁺/Fe (E°=−0.04V) gives ΔE°=1.62V, ΔG°=−nFΔE=−936 kJ/mol. The reaction is thermodynamically spontaneous and produces massive heat. Applications: rail welding (Goldschmidt process), incendiary devices, metallurgy, and space propulsion.",

    observations:["Highly Exothermic (>2500°C)","Electron Transfer Redox","Molten Iron Product","White Al₂O₃ Slag","White Sparks","Activity Series"],

    finalTemp:2500.0,bubbles:false,precipitate:true,heat:true,showBurette:false,showElectrodes:false

  },



  radiolysis_water:{

    name:"Radioactive Radiolysis of Water (Nuclear Chemistry)",icon:"☢️",category:"Nuclear",

    hardware:"radiolysis_setup",

    chemicals:[

      {id:"water_rad",name:"Distilled H₂O",conc:"Pure",color:"rgba(180,220,255,0.22)",label:"H₂O",unit:"Pure",desc:"Pure water — the target molecule. Radiolysis produces H₂, O₂, H₂O₂, and radicals (•OH, •H, e⁻ₐq). In nuclear reactors, water radiolysis is a major concern — H₂ and O₂ accumulation is explosive, and radicals corrode metal surfaces. Coolant water in BWRs undergoes continuous radiolysis."},

      {id:"gamma_source",name:"Gamma Radiation (γ)",conc:"High energy",color:"rgba(80,255,80,0.55)",label:"γ-rays",unit:"MeV",desc:"Gamma radiation — high-energy photons (typically 0.1–10 MeV). Ionises water by photoelectric effect or Compton scattering: H₂O + γ → H₂O⁺ + e⁻. Most penetrating radiation — requires lead or thick concrete shielding. Primary cause of radiolysis in nuclear reactors. Sources: Co-60, Cs-137, nuclear fission products."},

      {id:"alpha_source",name:"Alpha Emitter (α)",conc:"High LET",color:"rgba(255,200,50,0.55)",label:"α particles",unit:"He-4 nuclei",desc:"Alpha particles (⁴He nuclei, charge +2) — high Linear Energy Transfer (LET ~100 keV/µm). Create dense ionisation tracks in water. Extremely efficient at radiolysis compared to γ. Stopped by a sheet of paper — don't penetrate far, but create intense radical density locally. Sources: Pu-239, U-238, Ra-226, Am-241."},

      {id:"beta_source",name:"Beta Emitter (β⁻)",conc:"Medium LET",color:"rgba(100,200,255,0.50)",label:"β particles",unit:"electrons",desc:"Beta particles (high-energy electrons, β⁻). Intermediate LET (~0.2 keV/µm). Ionise water, creating e⁻ₐq (solvated electrons) which are extremely reactive: e⁻ₐq + H₂O → •H + OH⁻. Sources: H-3 (tritium), Sr-90, Cs-137, fission products. Tritium (H-3) β-decay produces radiolysis inside reactor coolant water — a key safety concern in PWRs."}

    ],

    steps:[

      {title:"Set Up Irradiation Vessel",desc:"Fill a radiation-safe quartz vessel (quartz is radiation-resistant; glass browns under high dose) with pure degassed distilled water. Degas with inert gas (N₂ or Ar) to remove dissolved O₂ — this isolates radiolysis products. Instrument with Geiger-Müller counter, H₂ detector, and UV-Vis spectrophotometer for radical detection (DMPO spin trap).",action:"Select Distilled H₂O"},

      {title:"Apply Gamma Radiation",desc:"Expose water to γ-radiation source (simulated Co-60, 1.25 MeV). Ionisation: H₂O + γ → H₂O⁺ + e⁻. Primary radical formation: H₂O⁺ → OH• + H⁺ and e⁻ + H₂O → •H + OH⁻. Geiger counter clicks intensify. Radiation glow (Cherenkov radiation) visible as faint blue glow if dose rate is high enough. Solvated electrons (e⁻ₐq) appear as blue-green colour.",action:"Select γ-rays"},

      {title:"Add Alpha and Beta Sources",desc:"Introduce alpha emitter (high LET) and beta source (medium LET) to increase radical yield. Alpha particles create dense radical tracks — HO• and H• concentrations are highest along α-particle path. Beta particles produce more diffuse radical distribution. Each radiation type has a distinct G-value (radicals per 100 eV absorbed).",action:"Select α + β sources"},

      {title:"Observe Radiolysis Products",desc:"Analyse accumulated products: H₂ gas (G(H₂) ≈ 0.45 molecules/100eV γ), O₂ gas, H₂O₂ (G(H₂O₂) ≈ 0.7/100eV), hydroxyl radical •OH (G ≈ 2.7/100eV). Geiger counter clicks continuously. UV-Vis shows H₂O₂ at 240nm. Observe Cherenkov glow. H₂/O₂ accumulation is explosive — venting system essential.",action:"Click Run Reaction"}

    ],

    prediction:"High-energy radiation ionises water molecules (H₂O + γ → H₂O⁺ + e⁻). Radical cascade: •OH, •H, e⁻ₐq. Recombination: 2•H → H₂; 2•OH → H₂O₂; •H + •OH → H₂O; 2e⁻ₐq → H₂ + 2OH⁻. Net: 2H₂O → 2H₂ + O₂ (with radicals as intermediates).",

    expectedResult:"H₂ + O₂ gas evolution, H₂O₂ formation, •OH radicals, Cherenkov glow, Geiger clicks",

    equation:"Ionisation:  H₂O + γ → H₂O⁺ + e⁻\nRadicals:    H₂O⁺ → •OH + H⁺\n             e⁻ + H₂O → •H + OH⁻\nRecombination: 2•H → H₂;  2•OH → H₂O₂\nNet (overall): 2H₂O → 2H₂ + O₂  (with radical intermediates)",

    observation:"⚠️ SIMULATED — Cherenkov radiation blue glow in water. Geiger-Müller counter rapid clicking. H₂ and O₂ gas bubbles form (explosive mixture if unvented). H₂O₂ detected by UV-Vis spectroscopy (240nm peak). Hydroxyl radical •OH detected via DMPO spin trap EPR. pH decreases slightly (H⁺ formation). Temperature of water rises due to radiation energy absorption.",

    finalPH:6.1,finalColor:"Cherenkov Blue Glow",finalColorCSS:"rgba(60,140,255,0.72)",

    liquidStart:"rgba(180,220,255,0.22)",liquidEnd:"rgba(60,140,255,0.72)",

    conclusion:"Radiolysis of water is a critical process in nuclear reactors — it generates H₂ (explosion risk), O₂, and corrosive radicals (•OH corrodes pipes). Radiation chemistry is used in food sterilization, medical device sterilization, and polymer synthesis. The primary species and their G-values: •OH (2.7), e⁻ₐq (2.6), •H (0.55), H₂ (0.45), H₂O₂ (0.7) per 100 eV (γ-radiation). Alpha particles have ~5× higher G-values per unit LET.",

    observations:["⚠️ Radioactive","Cherenkov Glow","H₂ + O₂ Gas Evolution","•OH Radicals","H₂O₂ Formation","Geiger Counter"],

    finalTemp:35.0,bubbles:true,precipitate:false,heat:false,showBurette:false,showElectrodes:false

  },



  uranium_fission:{

    name:"Uranium-235 Fission (Nuclear)",icon:"☢️",category:"Nuclear",

    hardware:"nuclear_chamber",

    chemicals:[

      {id:"u235",name:"U-235",conc:"Enriched",color:"rgba(50,220,80,0.65)",label:"²³⁵U",unit:"Enriched",desc:"Uranium-235 — fissile isotope. Radioactive (α emitter, t₁/₂ = 703.8 Ma). Glows characteristic green due to uranium fluorescence. Only 0.72% of natural uranium — must be enriched to >3% for reactor use, >90% for weapons."},

      {id:"neutron_thermal",name:"Thermal Neutron",conc:"Slow",color:"rgba(200,240,200,0.35)",label:"¹n (slow)",unit:"Thermal",desc:"Thermal (slow) neutron — kinetic energy ~0.025 eV. Slow neutrons are far more efficient at inducing fission than fast ones. Moderated by graphite or heavy water in a reactor to reduce speed."},

      {id:"moderator",name:"Graphite Moderator",conc:"Solid",color:"rgba(80,80,80,0.7)",label:"Graphite",unit:"Solid",desc:"Graphite (C) blocks — slow down fast neutrons via elastic collisions to thermal energies. Used in Chernobyl-type RBMK reactors. Each neutron collision transfers momentum, reducing kinetic energy from MeV to 0.025 eV range."},

      {id:"control_rod",name:"Control Rods (B₄C)",conc:"Neutron absorber",color:"rgba(60,60,80,0.8)",label:"B₄C",unit:"Absorber",desc:"Boron carbide control rods — absorb excess neutrons via ¹⁰B + n → ⁷Li + ⁴He. Inserted/withdrawn to control fission rate. Fully inserted = shutdown. Partially = controlled criticality. Critical safety component."}

    ],

    steps:[

      {title:"Load Fissile Material",desc:"Place enriched U-235 in the nuclear chamber (reactor core). U-235 is naturally radioactive — emits α particles (⁴He nuclei) and γ radiation continuously. Characteristic green-yellow fluorescence visible. CAUTION: Radioactive material — remote handling via robotic arms. Radiation shielding essential.",action:"Select U-235"},

      {title:"Insert Moderator",desc:"Surround U-235 fuel with graphite moderator blocks. Fast neutrons (2 MeV) produced by fission must be slowed to thermal energies (0.025 eV) to efficiently trigger further fission. Graphite nuclei absorb kinetic energy through elastic collisions: nfast → nthermal. This is the moderation process.",action:"Select Graphite Moderator"},

      {title:"Initiate with Thermal Neutron",desc:"Fire a single thermal neutron (¹n) at U-235 nucleus. Neutron is absorbed: U-235 + n → U-236* (excited, unstable compound nucleus). U-236* exists for ~10⁻¹⁴ seconds before splitting. The nucleus deforms like a liquid drop until electrostatic repulsion overcomes nuclear strong force — fission occurs.",action:"Select Thermal Neutron"},

      {title:"Observe Chain Reaction",desc:"U-236* splits: ²³⁵U + ¹n → ¹⁴¹Ba + ⁹²Kr + 3¹n + 200 MeV energy. The 3 new neutrons each trigger further fissions → exponential chain reaction. Massive energy release (200 MeV/fission vs ~4 eV for chemical reactions = 50 MILLION× more energy). Control rods regulate neutron population to maintain controlled criticality (k=1).",action:"Click Run Reaction"}

    ],

    prediction:"Neutron absorption creates unstable U-236* which undergoes liquid-drop deformation and splits. Mass defect Δm = 0.186 u converted to energy E=Δmc² = 173 MeV prompt energy + 27 MeV delayed. Chain reaction multiplies if k≥1.",

    expectedResult:"Massive energy burst + neutron multiplication + fission fragments (Ba + Kr) + γ radiation",

    equation:"²³⁵₉₂U + ¹₀n → ²³⁶₉₂U* → ¹⁴¹₅₆Ba + ⁹²₃₆Kr + 3¹₀n + ~200 MeV\nMass Defect: Δm = m(U-235) + m(n) − [m(Ba-141) + m(Kr-92) + 3m(n)] = 0.186 u\nE = Δmc² = 0.186 × 931.5 MeV = 173 MeV (+ ~27 MeV delayed γ/β)",

    observation:"⚠️ SIMULATED: Intense radiation burst (γ-rays, β particles, α from U-235). Massive energy release — 200 MeV per fission event. Fission fragments Ba-141 and Kr-92 recoil at ~3% speed of light. Neutron burst triggers secondary fissions. Characteristic green radioactive glow of uranium fluorescence. Geiger counter spikes. Heat generation in core.",

    finalPH:7.0,finalColor:"Radioactive Green Glow",finalColorCSS:"rgba(50,255,80,0.75)",

    liquidStart:"rgba(50,220,80,0.65)",liquidEnd:"rgba(120,255,100,0.85)",

    conclusion:"Nuclear fission releases energy via Einstein's E=mc². Mass defect of 0.186 atomic mass units converts to 173 MeV — 50 million times more energy per event than chemical reactions. Chain reaction: each fission releases 3 neutrons → controlled at k=1 (critical) in reactors, k>>1 in weapons. Binding energy per nucleon peaks at Fe-56 — fission of heavy nuclei and fusion of light ones both release energy. Products Ba-141 and Kr-92 are themselves radioactive, creating nuclear waste.",

    observations:["⚠️ Radioactive","Massive Energy (200 MeV)","Neutron Chain Reaction","Fission Fragments","Gamma Radiation","Mass Defect E=mc²"],

    finalTemp:5000.0,bubbles:true,precipitate:false,heat:true,showBurette:false,showElectrodes:false

  }

};



/* Hardware SVG templates */

const HARDWARE = {

  titration:`

    <svg viewBox="0 0 480 460" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="flaskGrad" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stop-color="rgba(210,240,255,0.22)"/>

          <stop offset="100%" stop-color="rgba(140,200,255,0.12)"/>

        </linearGradient>

        <linearGradient id="buretteBodyGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(180,220,255,0.16)"/>

          <stop offset="40%" stop-color="rgba(220,245,255,0.32)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.12)"/>

        </linearGradient>

        <linearGradient id="standGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="#8a9bb0"/>

          <stop offset="50%" stop-color="#c8d8e8"/>

          <stop offset="100%" stop-color="#7a8b9a"/>

        </linearGradient>

        <linearGradient id="cylGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(180,220,255,0.16)"/>

          <stop offset="40%" stop-color="rgba(220,245,255,0.28)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.12)"/>

        </linearGradient>

        <!-- Flask clip: body from y=310 to y=420, neck from y=262 to y=310 -->

        <clipPath id="flaskClip">

          <path d="M218 310 L185 375 Q170 408 200 418 L310 418 Q340 408 325 375 L292 310 Z"/>

        </clipPath>

        <!-- Burette clip: body x=261..277, y=12..210 (shifted left 22px) -->

        <clipPath id="buretteClip">

          <rect x="261" y="12" width="16" height="200"/>

        </clipPath>

        <clipPath id="cylClip">

          <rect x="112" y="65" width="36" height="290"/>

        </clipPath>

        <filter id="glassBlur"><feGaussianBlur stdDeviation="1.2"/></filter>

        <filter id="dropShadow">

          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(6,182,212,0.5)"/>

        </filter>

        <radialGradient id="liquidGlow" cx="50%" cy="30%">

          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>

          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>

        </radialGradient>

      </defs>



      <!-- ══ RETORT STAND — vertical rod on far right ══ -->

      <rect x="380" y="418" width="90" height="12" rx="3" fill="url(#standGrad)" stroke="rgba(100,130,160,.5)" stroke-width="1"/>

      <rect x="388" y="422" width="74" height="4" rx="1" fill="rgba(255,255,255,.12)"/>

      <rect x="420" y="10" width="8" height="410" rx="3" fill="url(#standGrad)" stroke="rgba(100,130,160,.4)" stroke-width="1"/>

      <rect x="422" y="10" width="3" height="410" fill="rgba(255,255,255,.15)" rx="1"/>

      <!-- Upper clamp holding burette (y≈18, shifted left) -->

      <rect x="263" y="18" width="138" height="11" rx="3" fill="#8a9bb0" stroke="rgba(100,130,160,.5)" stroke-width="1"/>

      <rect x="266" y="21" width="132" height="4" rx="1" fill="rgba(255,255,255,.2)"/>

      <!-- Lower clamp holding flask neck area (y≈308) -->

      <rect x="263" y="308" width="138" height="10" rx="3" fill="#8a9bb0" stroke="rgba(100,130,160,.5)" stroke-width="1"/>

      <rect x="266" y="311" width="132" height="4" rx="1" fill="rgba(255,255,255,.15)"/>



      <!-- ══ BURETTE — shifted left 22px for better visual balance ══ -->

      <!-- Burette body: top y=22, height=200, bottom at y=222; center x=270 -->

      <rect x="259" y="22" width="22" height="200" rx="3" fill="url(#buretteBodyGrad)" stroke="rgba(180,220,255,0.55)" stroke-width="1.5"/>

      <g clip-path="url(#buretteClip)">

        <rect id="burette-liquid" x="261" y="12" width="16" height="180" fill="rgba(220,220,220,.65)" opacity=".9"/>

      </g>

      <!-- Burette shine -->

      <rect x="261" y="22" width="4" height="197" rx="1" fill="rgba(255,255,255,.20)"/>

      <!-- Burette top cap -->

      <ellipse cx="270" cy="22" rx="12" ry="3.5" fill="rgba(200,235,255,.35)" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <!-- Graduation marks on left side of burette -->

      <line x1="259" y1="52"  x2="248" y2="52"  stroke="rgba(180,220,255,.7)" stroke-width="1.2"/>

      <line x1="259" y1="92"  x2="248" y2="92"  stroke="rgba(180,220,255,.7)" stroke-width="1.2"/>

      <line x1="259" y1="132" x2="248" y2="132" stroke="rgba(180,220,255,.7)" stroke-width="1.2"/>

      <line x1="259" y1="172" x2="248" y2="172" stroke="rgba(180,220,255,.7)" stroke-width="1.2"/>

      <line x1="259" y1="212" x2="248" y2="212" stroke="rgba(180,220,255,.7)" stroke-width="1.2"/>

      <line x1="259" y1="72"  x2="253" y2="72"  stroke="rgba(180,220,255,.4)" stroke-width="1"/>

      <line x1="259" y1="112" x2="253" y2="112" stroke="rgba(180,220,255,.4)" stroke-width="1"/>

      <line x1="259" y1="152" x2="253" y2="152" stroke="rgba(180,220,255,.4)" stroke-width="1"/>

      <line x1="259" y1="192" x2="253" y2="192" stroke="rgba(180,220,255,.4)" stroke-width="1"/>

      <text x="245" y="55"  class="hw-label" text-anchor="end" font-size="8">0</text>

      <text x="245" y="95"  class="hw-label" text-anchor="end" font-size="8">10</text>

      <text x="245" y="135" class="hw-label" text-anchor="end" font-size="8">20</text>

      <text x="245" y="175" class="hw-label" text-anchor="end" font-size="8">30</text>

      <text x="245" y="215" class="hw-label" text-anchor="end" font-size="8">40</text>

      <text x="270" y="11" class="hw-label" text-anchor="middle" font-size="7.5" fill="rgba(180,220,255,.75)">BURETTE 50mL</text>

      <!-- Stopcock body (horizontal handle) -->

      <rect x="250" y="220" width="42" height="11" rx="3" fill="rgba(60,90,120,.88)" stroke="rgba(120,160,200,.5)" stroke-width="1"/>

      <rect x="253" y="222" width="36" height="4" rx="1" fill="rgba(255,255,255,.15)"/>

      <!-- Stopcock handle (perpendicular) -->

      <rect x="292" y="222" width="18" height="7" rx="2" fill="rgba(45,75,105,.92)" stroke="rgba(100,140,180,.5)" stroke-width="1"/>

      <!-- Burette tip — narrow nozzle, tip bottom at y=251; center x=270 -->

      <path d="M266 230 L265 244 Q265 249 270 251 Q275 249 275 244 L274 230 Z"

            fill="rgba(160,210,255,0.55)" stroke="rgba(180,220,255,0.6)" stroke-width="1"/>



      <!-- Drop from burette tip (center x=270, starts at cy=255) -->

      <ellipse id="burette-drop" cx="270" cy="255" rx="3.5" ry="5"

               fill="rgba(220,220,220,.9)" opacity="0" filter="url(#dropShadow)"/>



      <!-- ENHANCED WAVY STREAM: multi-strand sinusoidal pour from tip(270,251) to flask mouth(255,262) -->

      <path id="pour-wave-stream"

        d="M270 251 C267 255 273 258 270 262"

        stroke="rgba(220,220,220,0)" stroke-width="5"

        fill="none" stroke-linecap="round" opacity="0"/>

      <!-- Secondary thinner stream for realism -->

      <path id="pour-wave-stream2"

        d="M270 251 C273 254 267 257 270 262"

        stroke="rgba(220,220,220,0)" stroke-width="2"

        fill="none" stroke-linecap="round" opacity="0"/>

      <!-- Ripple ring at flask mouth (appears when drop hits) -->

      <ellipse id="flask-mouth-ripple" cx="255" cy="262" rx="0" ry="0"

               fill="none" stroke="rgba(6,182,212,0)" stroke-width="1.5" opacity="0"/>



      <!-- In-flask wall-bounce wavy splash (visible during drop animation) -->

      <path id="flask-splash-wave"

        d="M200 380 Q230 370 255 380 Q280 390 310 375"

        stroke="rgba(6,182,212,0)" stroke-width="2.5"

        fill="none" stroke-linecap="round" opacity="0"/>

      <!-- Secondary splash ripple inside flask -->

      <ellipse id="flask-inner-ripple" cx="255" cy="380" rx="0" ry="0"

               fill="none" stroke="rgba(6,182,212,0)" stroke-width="2" opacity="0"/>



      <!-- ══ MEASURING CYLINDER (right side) ══ -->

      <text x="130" y="14" class="hw-label" text-anchor="middle" font-size="8" fill="rgba(180,220,255,.7)">MEASURING CYL.</text>

      <ellipse cx="130" cy="366" rx="26" ry="6" fill="rgba(180,210,240,.18)" stroke="rgba(200,235,255,.4)" stroke-width="1.5"/>

      <rect x="112" y="65" width="36" height="300" rx="5" fill="url(#cylGrad)" stroke="rgba(200,235,255,.55)" stroke-width="1.5"/>

      <ellipse cx="130" cy="65" rx="22" ry="6" fill="rgba(200,235,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1.5"/>

      <ellipse cx="130" cy="65" rx="17" ry="4" fill="rgba(255,255,255,.1)"/>

      <path d="M112 70 Q103 64 101 54 Q104 48 112 50 L112 62" fill="rgba(200,235,255,.1)" stroke="rgba(200,235,255,.4)" stroke-width="1.2"/>

      <g clip-path="url(#cylClip)">

        <rect id="cyl-liquid" x="113" y="220" width="34" height="145" fill="rgba(59,130,246,.32)" opacity=".9"/>

        <path d="M113 220 Q122 215 130 220 Q138 225 147 220 L147 225 Q138 221 130 225 Q122 229 113 225 Z" fill="rgba(59,130,246,.48)"/>

      </g>

      <rect x="141" y="68" width="5" height="294" rx="2" fill="rgba(255,255,255,.18)"/>

      <line x1="112" y1="100" x2="104" y2="100" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="112" y1="145" x2="104" y2="145" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="112" y1="190" x2="104" y2="190" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="112" y1="235" x2="104" y2="235" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="112" y1="280" x2="104" y2="280" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="112" y1="325" x2="104" y2="325" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="112" y1="122" x2="108" y2="122" stroke="rgba(200,235,255,.4)" stroke-width="1"/>

      <line x1="112" y1="167" x2="108" y2="167" stroke="rgba(200,235,255,.4)" stroke-width="1"/>

      <line x1="112" y1="212" x2="108" y2="212" stroke="rgba(200,235,255,.4)" stroke-width="1"/>

      <line x1="112" y1="257" x2="108" y2="257" stroke="rgba(200,235,255,.4)" stroke-width="1"/>

      <line x1="112" y1="302" x2="108" y2="302" stroke="rgba(200,235,255,.4)" stroke-width="1"/>

      <text x="100" y="103" class="hw-label" text-anchor="end" font-size="8">100</text>

      <text x="100" y="148" class="hw-label" text-anchor="end" font-size="8">80</text>

      <text x="100" y="193" class="hw-label" text-anchor="end" font-size="8">60</text>

      <text x="100" y="238" class="hw-label" text-anchor="end" font-size="8">40</text>

      <text x="100" y="283" class="hw-label" text-anchor="end" font-size="8">20</text>

      <text x="100" y="328" class="hw-label" text-anchor="end" font-size="8">5</text>



      <!-- ══ CONICAL FLASK (Erlenmeyer) ══ -->

      <!-- Neck bottom at y=310, neck top (opening) at y=262 — burette tip at y=251 sits 11px above opening -->

      <!-- Flask body -->

      <path d="M218 310 L185 375 Q170 408 200 418 L310 418 Q340 408 325 375 L292 310 Z"

            fill="url(#flaskGrad)" stroke="rgba(200,235,255,.60)" stroke-width="2"/>

      <path d="M218 310 L185 375 Q170 408 200 418 L310 418 Q340 408 325 375 L292 310 Z"

            fill="rgba(150,205,255,0.04)" stroke="rgba(180,220,255,.2)" stroke-width="1"/>

      <!-- Neck (x: 233..277, y: 262..310) -->

      <rect x="233" y="262" width="44" height="50" rx="3"

            fill="rgba(190,225,255,.14)" stroke="rgba(200,235,255,.5)" stroke-width="1.5"/>

      <!-- Neck opening rim (the mouth of the flask, where drop falls into) -->

      <ellipse cx="255" cy="262" rx="25" ry="5.5"

               fill="rgba(190,225,255,.22)" stroke="rgba(200,235,255,.65)" stroke-width="1.5"/>

      <ellipse cx="255" cy="262" rx="20" ry="4" fill="rgba(255,255,255,.1)"/>

      <!-- Shoulder lines -->

      <path d="M233 310 Q200 322 184 360" stroke="rgba(200,235,255,.4)" stroke-width="1.5" fill="none"/>

      <path d="M277 310 Q310 322 326 360" stroke="rgba(200,235,255,.35)" stroke-width="1.5" fill="none"/>

      <!-- Volume marks on flask right side -->

      <line x1="308" y1="340" x2="320" y2="340" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="320" y1="370" x2="332" y2="370" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="312" y1="400" x2="324" y2="400" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <text x="323" y="343" class="hw-label" font-size="8">200</text>

      <text x="335" y="373" class="hw-label" font-size="8">100</text>

      <text x="327" y="403" class="hw-label" font-size="8">50</text>

      <!-- Flask shadow -->

      <ellipse cx="255" cy="428" rx="68" ry="6" fill="rgba(6,182,212,.07)" filter="url(#glassBlur)"/>

      <!-- LIQUID inside flask -->

      <g clip-path="url(#flaskClip)">

        <rect id="liquid-rect" x="170" y="390" width="170" height="30" fill="rgba(6,182,212,.28)" opacity=".9"/>

        <path id="wave-path" d="M178 390 Q216 385 255 390 Q294 395 332 390 L332 396 Q294 392 255 396 Q216 400 178 396 Z" fill="rgba(6,182,212,.42)"/>

        <ellipse cx="230" cy="392" rx="36" ry="5" fill="url(#liquidGlow)" opacity=".65"/>

        <rect id="precipitate" x="170" y="408" width="170" height="0" fill="rgba(255,255,255,.7)" opacity="0"/>

        <ellipse id="heat-glow" cx="255" cy="415" rx="72" ry="9" fill="rgba(255,80,0,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#flaskClip)"></g>

      <!-- Glass shines -->

      <path d="M240 264 L240 308" stroke="rgba(255,255,255,.22)" stroke-width="2.5" stroke-linecap="round"/>

      <path d="M196 338 L190 380" stroke="rgba(255,255,255,.14)" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Label -->

      <text x="255" y="448" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(140,200,255,.4)">BURETTE + CONICAL FLASK (TITRATION)</text>

    </svg>`,



  beaker:`

    <svg viewBox="0 0 360 400" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <!-- 3D glass body gradient — left bright edge, darker centre, right-edge refraction -->
        <linearGradient id="bkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="rgba(220,245,255,0.55)"/>
          <stop offset="8%"   stop-color="rgba(200,235,255,0.28)"/>
          <stop offset="45%"  stop-color="rgba(160,210,255,0.08)"/>
          <stop offset="85%"  stop-color="rgba(180,225,255,0.14)"/>
          <stop offset="100%" stop-color="rgba(210,240,255,0.42)"/>
        </linearGradient>

        <!-- Specular hotspot on the upper-left face -->
        <radialGradient id="bkSpecular" cx="22%" cy="18%" r="38%">
          <stop offset="0%"   stop-color="rgba(255,255,255,0.55)"/>
          <stop offset="60%"  stop-color="rgba(210,240,255,0.12)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>

        <clipPath id="beakerClip">
          <path d="M100 70 L100 305 Q100 318 114 318 L246 318 Q260 318 260 305 L260 70 Z"/>
        </clipPath>

        <clipPath id="bkCylClip">
          <rect x="312" y="68" width="34" height="300"/>
        </clipPath>

        <filter id="bkGlow"><feGaussianBlur stdDeviation="2.5"/></filter>

        <!-- Liquid surface glow — tighter, more realistic -->
        <radialGradient id="bkLiqGlow" cx="35%" cy="15%" r="55%">
          <stop offset="0%"   stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="50%"  stop-color="rgba(255,255,255,0.10)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>

        <!-- Cylinder glass gradient — same left-edge bright treatment -->
        <linearGradient id="bkCylGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="rgba(220,245,255,0.50)"/>
          <stop offset="12%"  stop-color="rgba(190,230,255,0.22)"/>
          <stop offset="50%"  stop-color="rgba(160,210,255,0.09)"/>
          <stop offset="88%"  stop-color="rgba(185,225,255,0.18)"/>
          <stop offset="100%" stop-color="rgba(215,240,255,0.38)"/>
        </linearGradient>

        <!-- Bottom meniscus shimmer -->
        <radialGradient id="bkBottomGlow" cx="50%" cy="100%" r="60%">
          <stop offset="0%"   stop-color="rgba(6,182,212,0.18)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>

        <!-- Animated shimmer filter -->
        <filter id="liqGlitter" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.65;0.72;0.65" dur="3s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

      </defs>



      <!-- ══ MEASURING CYLINDER (RIGHT side, pours LEFT into beaker) ══ -->

      <text x="329" y="14" class="hw-label" text-anchor="middle" font-size="8" fill="rgba(180,220,255,.7)">MEASURING CYL.</text>

      <ellipse cx="329" cy="380" rx="22" ry="5" fill="rgba(180,210,240,.18)" stroke="rgba(200,235,255,.4)" stroke-width="1.5"/>

      <rect x="312" y="68" width="34" height="310" rx="5" fill="url(#bkCylGrad)" stroke="rgba(200,235,255,.55)" stroke-width="1.5"/>

      <ellipse cx="329" cy="68" rx="20" ry="5.5" fill="rgba(200,235,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1.5"/>

      <path d="M312 73 Q304 67 302 58 Q305 52 312 54 L312 65" fill="rgba(200,235,255,.1)" stroke="rgba(200,235,255,.4)" stroke-width="1.2"/>

      <g clip-path="url(#bkCylClip)">

        <rect id="cyl-liquid" x="313" y="230" width="32" height="148" fill="rgba(59,130,246,.32)" opacity=".9"/>

        <path d="M313 230 Q322 225 329 230 Q336 235 345 230 L345 235 Q336 231 329 235 Q322 239 313 235 Z" fill="rgba(59,130,246,.48)"/>

      </g>

      <rect x="341" y="70" width="5" height="305" rx="2" fill="rgba(255,255,255,.18)"/>

      <!-- Major ticks (left side of right cylinder) -->

      <line x1="312" y1="105" x2="304" y2="105" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="152" x2="304" y2="152" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="199" x2="304" y2="199" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="246" x2="304" y2="246" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="293" x2="304" y2="293" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="340" x2="304" y2="340" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <text x="299" y="108" class="hw-label" text-anchor="end" font-size="7.5">100</text>

      <text x="299" y="155" class="hw-label" text-anchor="end" font-size="7.5">80</text>

      <text x="299" y="202" class="hw-label" text-anchor="end" font-size="7.5">60</text>

      <text x="299" y="249" class="hw-label" text-anchor="end" font-size="7.5">40</text>

      <text x="299" y="296" class="hw-label" text-anchor="end" font-size="7.5">20</text>

      <text x="299" y="343" class="hw-label" text-anchor="end" font-size="7.5">5</text>



      <!-- ══ BEAKER (main, right side) ══ -->

      <ellipse cx="180" cy="330" rx="82" ry="7" fill="rgba(6,182,212,.07)" filter="url(#bkGlow)"/>

      <path d="M100 68 L100 305 Q100 318 114 318 L246 318 Q260 318 260 305 L260 68 Z" fill="rgba(150,205,255,0.06)" stroke="rgba(180,220,255,.30)" stroke-width="1"/>

      <path d="M100 68 L100 305 Q100 318 114 318 L246 318 Q260 318 260 305 L246 68 Z" fill="url(#bkGrad)" stroke="rgba(200,235,255,.60)" stroke-width="2"/>

      <path d="M92 62 Q92 58 100 58 L260 58 Q268 58 268 62 L268 72 Q268 76 260 76 L100 76 Q92 76 92 72 Z" fill="rgba(200,235,255,.18)" stroke="rgba(200,235,255,.55)" stroke-width="1.5"/>

      <ellipse cx="180" cy="62" rx="86" ry="8" fill="rgba(255,255,255,.07)"/>

      <ellipse cx="180" cy="62" rx="78" ry="6" fill="none" stroke="rgba(200,235,255,.30)" stroke-width="1"/>

      <!-- Spout -->

      <path d="M260 76 Q272 70 276 60 Q271 53 262 55 L260 68" fill="rgba(200,235,255,.12)" stroke="rgba(200,235,255,.45)" stroke-width="1.5"/>

      <!-- Beaker measurement marks -->

      <line x1="260" y1="165" x2="272" y2="165" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <line x1="260" y1="210" x2="272" y2="210" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <line x1="260" y1="255" x2="272" y2="255" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <line x1="260" y1="300" x2="272" y2="300" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <text x="276" y="168" class="hw-label">150</text>

      <text x="276" y="213" class="hw-label">100</text>

      <text x="276" y="258" class="hw-label">50</text>

      <text x="276" y="303" class="hw-label">10</text>

      <!-- Liquid -->

      <g clip-path="url(#beakerClip)">

        <rect id="liquid-rect" x="100" y="282" width="160" height="36" fill="rgba(6,182,212,.28)" opacity=".9"/>

        <path id="wave-path" d="M103 282 Q128 277 155 282 Q182 287 210 282 Q237 277 258 282 L258 288 Q237 284 210 288 Q182 292 155 288 Q128 284 103 288 Z" fill="rgba(6,182,212,.42)"/>

        <ellipse cx="162" cy="284" rx="35" ry="5" fill="url(#bkLiqGlow)" opacity=".65"/>

        <rect id="precipitate" x="100" y="306" width="160" height="0" fill="rgba(255,255,255,.7)" opacity="0"/>

        <ellipse id="heat-glow" cx="180" cy="314" rx="72" ry="10" fill="rgba(255,80,0,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#beakerClip)"></g>

      <path d="M107 70 L107 304" stroke="rgba(255,255,255,.20)" stroke-width="3.5" stroke-linecap="round"/>

      <path d="M118 70 L118 220" stroke="rgba(255,255,255,.10)" stroke-width="2" stroke-linecap="round"/>

      <path d="M253 76 L253 300" stroke="rgba(255,255,255,.07)" stroke-width="2" stroke-linecap="round"/>

      <path d="M108 312 Q180 322 252 312" stroke="rgba(255,255,255,.12)" stroke-width="2" fill="none"/>

      <text x="180" y="360" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">BEAKER 250 mL + MEASURING CYLINDER</text>

    </svg>`,



  conical_flask:`

    <svg viewBox="0 0 360 400" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="cfGrad" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stop-color="rgba(210,240,255,0.22)"/>

          <stop offset="100%" stop-color="rgba(140,200,255,0.12)"/>

        </linearGradient>

        <clipPath id="cfClip">

          <path d="M90 168 L52 278 Q35 318 68 332 L292 332 Q325 318 308 278 L270 168 Z"/>

        </clipPath>

        <clipPath id="cfCylClip">

          <rect x="312" y="68" width="34" height="300"/>

        </clipPath>

        <filter id="cfGlow"><feGaussianBlur stdDeviation="2"/></filter>

        <radialGradient id="cfLiqGlow" cx="40%" cy="25%">

          <stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>

          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>

        </radialGradient>

        <linearGradient id="cfCylGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(180,220,255,0.16)"/>

          <stop offset="40%" stop-color="rgba(220,245,255,0.28)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.12)"/>

        </linearGradient>

      </defs>



      <!-- ══ MEASURING CYLINDER (RIGHT side, pours LEFT into flask) ══ -->

      <text x="329" y="14" class="hw-label" text-anchor="middle" font-size="8" fill="rgba(180,220,255,.7)">MEASURING CYL.</text>

      <ellipse cx="329" cy="380" rx="22" ry="5" fill="rgba(180,210,240,.18)" stroke="rgba(200,235,255,.4)" stroke-width="1.5"/>

      <rect x="312" y="68" width="34" height="310" rx="5" fill="url(#cfCylGrad)" stroke="rgba(200,235,255,.55)" stroke-width="1.5"/>

      <ellipse cx="329" cy="68" rx="20" ry="5.5" fill="rgba(200,235,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1.5"/>

      <path d="M312 73 Q304 67 302 58 Q305 52 312 54 L312 65" fill="rgba(200,235,255,.1)" stroke="rgba(200,235,255,.4)" stroke-width="1.2"/>

      <g clip-path="url(#cfCylClip)">

        <rect id="cyl-liquid" x="313" y="230" width="32" height="148" fill="rgba(59,130,246,.32)" opacity=".9"/>

        <path d="M313 230 Q322 225 329 230 Q336 235 345 230 L345 235 Q336 231 329 235 Q322 239 313 235 Z" fill="rgba(59,130,246,.48)"/>

      </g>

      <rect x="341" y="70" width="5" height="305" rx="2" fill="rgba(255,255,255,.18)"/>

      <line x1="312" y1="105" x2="304" y2="105" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="152" x2="304" y2="152" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="199" x2="304" y2="199" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="246" x2="304" y2="246" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <line x1="312" y1="293" x2="304" y2="293" stroke="rgba(200,235,255,.65)" stroke-width="1.2"/>

      <text x="299" y="108" class="hw-label" text-anchor="end" font-size="7.5">100</text>

      <text x="299" y="155" class="hw-label" text-anchor="end" font-size="7.5">80</text>

      <text x="299" y="202" class="hw-label" text-anchor="end" font-size="7.5">60</text>

      <text x="299" y="249" class="hw-label" text-anchor="end" font-size="7.5">40</text>

      <text x="299" y="296" class="hw-label" text-anchor="end" font-size="7.5">20</text>



      <!-- ══ CONICAL FLASK (Erlenmeyer) — main vessel ══ -->

      <ellipse cx="180" cy="346" rx="120" ry="8" fill="rgba(6,182,212,.07)" filter="url(#cfGlow)"/>

      <!-- Back -->

      <path d="M90 168 L52 278 Q35 318 68 332 L292 332 Q325 318 308 278 L270 168 Z" fill="rgba(150,205,255,0.05)" stroke="rgba(180,220,255,.25)" stroke-width="1"/>

      <!-- Main -->

      <path d="M90 168 L52 278 Q35 318 68 332 L292 332 Q325 318 308 278 L270 168 Z" fill="url(#cfGrad)" stroke="rgba(200,235,255,.62)" stroke-width="2"/>

      <!-- Neck -->

      <rect x="154" y="56" width="52" height="116" rx="5" fill="rgba(190,225,255,.14)" stroke="rgba(200,235,255,.5)" stroke-width="1.5"/>

      <!-- Neck rim -->

      <ellipse cx="180" cy="56" rx="30" ry="7" fill="rgba(190,225,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1.5"/>

      <ellipse cx="180" cy="56" rx="25" ry="5" fill="rgba(255,255,255,.1)"/>

      <!-- Shoulder lines -->

      <path d="M154 168 Q110 185 88 225" stroke="rgba(200,235,255,.42)" stroke-width="1.5" fill="none"/>

      <path d="M206 168 Q250 185 272 225" stroke="rgba(200,235,255,.38)" stroke-width="1.5" fill="none"/>

      <!-- Measurement marks -->

      <line x1="292" y1="220" x2="305" y2="220" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="306" y1="265" x2="319" y2="265" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="296" y1="308" x2="309" y2="308" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <text x="308" y="223" class="hw-label" font-size="8">200</text>

      <text x="322" y="268" class="hw-label" font-size="8">100</text>

      <text x="312" y="311" class="hw-label" font-size="8">50</text>

      <!-- Liquid -->

      <g clip-path="url(#cfClip)">

        <rect id="liquid-rect" x="42" y="295" width="276" height="40" fill="rgba(6,182,212,.28)" opacity=".9"/>

        <path id="wave-path" d="M48 295 Q100 290 155 295 Q210 300 265 295 Q300 290 310 295 L310 301 Q300 297 265 301 Q210 305 155 301 Q100 297 48 301 Z" fill="rgba(6,182,212,.42)"/>

        <ellipse cx="165" cy="297" rx="52" ry="6" fill="url(#cfLiqGlow)" opacity=".65"/>

        <rect id="precipitate" x="42" y="322" width="276" height="0" fill="rgba(255,255,255,.7)" opacity="0"/>

        <ellipse id="heat-glow" cx="180" cy="330" rx="110" ry="10" fill="rgba(255,80,0,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#cfClip)"></g>

      <!-- Glass shines -->

      <path d="M162 58 L162 165" stroke="rgba(255,255,255,.22)" stroke-width="2.5" stroke-linecap="round"/>

      <path d="M72 200 L62 268" stroke="rgba(255,255,255,.15)" stroke-width="2.5" stroke-linecap="round"/>

      <path d="M82 175 L70 245" stroke="rgba(255,255,255,.08)" stroke-width="2" stroke-linecap="round"/>

      <text x="180" y="375" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">CONICAL FLASK 500 mL + MEASURING CYLINDER</text>

    </svg>`,



  heating:`

    <svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="ttGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(200,235,255,0.25)"/>

          <stop offset="40%" stop-color="rgba(220,245,255,0.38)"/>

          <stop offset="70%" stop-color="rgba(200,235,255,0.20)"/>

          <stop offset="100%" stop-color="rgba(170,215,255,0.12)"/>

        </linearGradient>

        <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="#b8c8d8"/>

          <stop offset="40%" stop-color="#e8f0f8"/>

          <stop offset="100%" stop-color="#8090a0"/>

        </linearGradient>

        <clipPath id="tubeClip">

          <path d="M114 52 L114 222 Q114 242 150 242 Q186 242 186 222 L186 52 Z"/>

        </clipPath>

        <filter id="flameGlow">

          <feGaussianBlur stdDeviation="3" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

        <filter id="smokeBlur"><feGaussianBlur stdDeviation="4"/></filter>

        <radialGradient id="heatRadial" cx="50%" cy="80%">

          <stop offset="0%" stop-color="rgba(255,120,20,0.35)"/>

          <stop offset="100%" stop-color="rgba(255,60,0,0)"/>

        </radialGradient>

      </defs>



      <!-- ── TRIPOD STAND ── -->

      <!-- Tripod base ring -->

      <ellipse cx="150" cy="320" rx="55" ry="8" fill="none" stroke="url(#metalGrad)" stroke-width="3"/>

      <!-- Three legs -->

      <line x1="150" y1="272" x2="98" y2="316" stroke="url(#metalGrad)" stroke-width="4"/>

      <line x1="150" y1="272" x2="202" y2="316" stroke="url(#metalGrad)" stroke-width="4"/>

      <line x1="150" y1="272" x2="150" y2="320" stroke="url(#metalGrad)" stroke-width="4"/>

      <!-- Leg shines -->

      <line x1="150" y1="272" x2="99" y2="315" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>

      <line x1="150" y1="272" x2="201" y2="315" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>

      <!-- Wire gauze / support ring at top -->

      <ellipse cx="150" cy="272" rx="44" ry="7" fill="none" stroke="url(#metalGrad)" stroke-width="2.5"/>

      <ellipse cx="150" cy="272" rx="44" ry="7" fill="rgba(120,140,160,.12)"/>

      <!-- Gauze grid lines -->

      <line x1="115" y1="272" x2="185" y2="272" stroke="rgba(180,200,220,.35)" stroke-width="1"/>

      <line x1="150" y1="266" x2="150" y2="278" stroke="rgba(180,200,220,.35)" stroke-width="1"/>



      <!-- ── BUNSEN BURNER ── -->

      <!-- Base -->

      <rect x="130" y="320" width="40" height="18" rx="4" fill="url(#metalGrad)" stroke="rgba(120,140,160,.5)" stroke-width="1"/>

      <rect x="133" y="322" width="34" height="6" rx="1" fill="rgba(255,255,255,.15)"/>

      <!-- Air hole collar -->

      <rect x="133" y="304" width="34" height="18" rx="3" fill="url(#metalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <!-- Air holes -->

      <circle cx="140" cy="313" r="2" fill="rgba(60,80,100,.6)"/>

      <circle cx="150" cy="313" r="2" fill="rgba(60,80,100,.6)"/>

      <circle cx="160" cy="313" r="2" fill="rgba(60,80,100,.6)"/>

      <!-- Barrel -->

      <rect x="136" y="276" width="28" height="30" rx="3" fill="url(#metalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <rect x="139" y="278" width="8" height="26" rx="1" fill="rgba(255,255,255,.18)"/>



      <!-- ── FLAME (realistic multi-layer) ── -->

      <g id="flame-group" filter="url(#flameGlow)">

        <!-- Outer mantle - blue base -->

        <ellipse cx="150" cy="268" rx="16" ry="8" fill="rgba(50,100,255,.45)">

          <animate attributeName="ry" values="8;11;8" dur="0.5s" repeatCount="indefinite"/>

        </ellipse>

        <!-- Orange middle cone -->

        <path d="M138 268 Q142 252 150 244 Q158 252 162 268 Z" fill="rgba(255,140,0,.80)">

          <animateTransform attributeName="transform" type="scale" values="1,1;1.05,1.08;0.97,1.02;1,1" dur="0.35s" repeatCount="indefinite" additive="sum"/>

        </path>

        <!-- Yellow inner cone -->

        <path d="M143 268 Q147 257 150 250 Q153 257 157 268 Z" fill="rgba(255,230,20,.90)">

          <animateTransform attributeName="transform" type="translate" values="0,0;1,-2;-1,-1;0,0" dur="0.28s" repeatCount="indefinite"/>

        </path>

        <!-- Blue hot core -->

        <path d="M147 268 Q149 262 150 258 Q151 262 153 268 Z" fill="rgba(180,220,255,.92)"/>

        <!-- Heat shimmer glow -->

        <ellipse cx="150" cy="258" rx="20" ry="25" fill="url(#heatRadial)" opacity=".7">

          <animate attributeName="opacity" values=".7;.4;.7" dur="0.6s" repeatCount="indefinite"/>

        </ellipse>

      </g>



      <!-- ── TEST TUBE (glass) ── -->

      <!-- Shadow/glow behind tube -->

      <ellipse cx="150" cy="250" rx="40" ry="6" fill="rgba(6,182,212,.07)" filter="url(#smokeBlur)"/>

      <!-- Tube back glass (subtle depth) -->

      <path d="M114 52 L114 222 Q114 242 150 242 Q186 242 186 222 L186 52 Z" fill="rgba(150,205,255,0.06)" stroke="rgba(180,220,255,.25)" stroke-width="1"/>

      <!-- Tube main glass -->

      <path d="M114 52 L114 222 Q114 242 150 242 Q186 242 186 222 L186 52 Z" fill="url(#ttGrad)" stroke="rgba(200,235,255,.60)" stroke-width="1.8"/>

      <!-- Tube rim/opening -->

      <ellipse cx="150" cy="52" rx="36" ry="6" fill="rgba(200,235,255,.22)" stroke="rgba(200,235,255,.55)" stroke-width="1.5"/>

      <ellipse cx="150" cy="52" rx="32" ry="4" fill="none" stroke="rgba(200,235,255,.30)" stroke-width="1"/>



      <!-- Liquid in test tube -->

      <g clip-path="url(#tubeClip)">

        <rect id="liquid-rect" x="114" y="194" width="72" height="48" fill="rgba(6,182,212,.35)" opacity=".9"/>

        <path id="wave-path" d="M116 194 Q130 190 150 194 Q170 198 184 194 L184 198 Q170 195 150 198 Q130 202 116 198 Z" fill="rgba(6,182,212,.52)"/>

        <rect id="precipitate" x="114" y="224" width="72" height="0" fill="rgba(255,255,255,.7)" opacity="0"/>

        <ellipse id="heat-glow" cx="150" cy="238" rx="34" ry="8" fill="rgba(255,80,0,0)" opacity="0"/>

        <!-- Heat shimmer inside liquid -->

        <ellipse id="heat-shimmer" cx="150" cy="220" rx="30" ry="6" fill="rgba(255,160,30,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#tubeClip)"></g>



      <!-- Glass shines on tube -->

      <path d="M120 55 L120 218" stroke="rgba(255,255,255,.22)" stroke-width="3.5" stroke-linecap="round"/>

      <path d="M128 53 L128 170" stroke="rgba(255,255,255,.10)" stroke-width="2" stroke-linecap="round"/>

      <path d="M178 55 L178 210" stroke="rgba(255,255,255,.08)" stroke-width="2" stroke-linecap="round"/>



      <!-- ── CLAMP STAND ── -->

      <!-- Vertical rod -->

      <rect x="226" y="48" width="7" height="226" rx="2" fill="url(#metalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <rect x="228" y="48" width="2" height="226" fill="rgba(255,255,255,.18)" rx="1"/>

      <!-- Horizontal rod -->

      <rect x="148" y="222" width="86" height="6" rx="2" fill="url(#metalGrad)" stroke="rgba(120,140,160,.3)" stroke-width="1"/>

      <!-- Clamp jaws -->

      <path d="M148 216 Q148 228 160 228 L160 216 Z" fill="url(#metalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <path d="M148 216 Q148 228 136 228 L136 216 Z" fill="url(#metalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <!-- Clamp screw -->

      <circle cx="148" cy="222" r="5" fill="url(#metalGrad)" stroke="rgba(120,140,160,.5)" stroke-width="1"/>



      <!-- Water vapour / steam (shown during heating reaction) -->

      <g id="steam-group">

        <path class="steam-wisp" d="M138 50 Q133 38 138 28 Q143 18 138 8" stroke="rgba(200,230,255,0)" stroke-width="2.5" fill="none" stroke-linecap="round">

          <animate attributeName="stroke" values="rgba(200,230,255,0);rgba(200,230,255,.5);rgba(200,230,255,0)" dur="2s" repeatCount="indefinite" begin="0s"/>

          <animateTransform attributeName="transform" type="translate" values="0,0;-3,-5;0,0" dur="2s" repeatCount="indefinite"/>

        </path>

        <path class="steam-wisp" d="M150 48 Q145 36 150 24 Q155 14 150 4" stroke="rgba(200,230,255,0)" stroke-width="2.5" fill="none" stroke-linecap="round">

          <animate attributeName="stroke" values="rgba(200,230,255,0);rgba(200,230,255,.45);rgba(200,230,255,0)" dur="2.3s" repeatCount="indefinite" begin="0.7s"/>

          <animateTransform attributeName="transform" type="translate" values="0,0;2,-6;0,0" dur="2.3s" repeatCount="indefinite"/>

        </path>

        <path class="steam-wisp" d="M162 50 Q167 38 162 28 Q157 18 162 8" stroke="rgba(200,230,255,0)" stroke-width="2.5" fill="none" stroke-linecap="round">

          <animate attributeName="stroke" values="rgba(200,230,255,0);rgba(200,230,255,.4);rgba(200,230,255,0)" dur="1.8s" repeatCount="indefinite" begin="1.4s"/>

          <animateTransform attributeName="transform" type="translate" values="0,0;4,-4;0,0" dur="1.8s" repeatCount="indefinite"/>

        </path>

      </g>



      <!-- Label -->

      <text x="150" y="350" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">BUNSEN BURNER + TEST TUBE</text>

    </svg>`,



  round_flask:`

    <svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="rfGrad" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stop-color="rgba(210,240,255,0.22)"/>

          <stop offset="50%" stop-color="rgba(180,220,255,0.10)"/>

          <stop offset="100%" stop-color="rgba(140,200,255,0.16)"/>

        </linearGradient>

        <linearGradient id="rfMetalGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="#b8c8d8"/>

          <stop offset="40%" stop-color="#e8f0f8"/>

          <stop offset="100%" stop-color="#8090a0"/>

        </linearGradient>

        <clipPath id="rfClip">

          <circle cx="150" cy="220" r="95"/>

        </clipPath>

        <radialGradient id="rfLiqGlow" cx="40%" cy="30%">

          <stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>

          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>

        </radialGradient>

        <filter id="rfBlur"><feGaussianBlur stdDeviation="2"/></filter>

        <filter id="rfFlameGlow">

          <feGaussianBlur stdDeviation="3" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

        <radialGradient id="rfHeatRadial" cx="50%" cy="80%">

          <stop offset="0%" stop-color="rgba(255,120,20,0.35)"/>

          <stop offset="100%" stop-color="rgba(255,60,0,0)"/>

        </radialGradient>

        <linearGradient id="rfBottleGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(180,220,255,0.25)"/>

          <stop offset="50%" stop-color="rgba(220,245,255,0.45)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.18)"/>

        </linearGradient>

      </defs>



      <!-- ── TRIPOD STAND + RING CLAMP ── -->

      <ellipse cx="150" cy="330" rx="60" ry="8" fill="none" stroke="url(#rfMetalGrad)" stroke-width="3"/>

      <line x1="150" y1="285" x2="96" y2="326" stroke="url(#rfMetalGrad)" stroke-width="4"/>

      <line x1="150" y1="285" x2="204" y2="326" stroke="url(#rfMetalGrad)" stroke-width="4"/>

      <line x1="150" y1="285" x2="150" y2="330" stroke="url(#rfMetalGrad)" stroke-width="4"/>

      <line x1="150" y1="285" x2="97" y2="325" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>

      <line x1="150" y1="285" x2="203" y2="325" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>

      <!-- Wire gauze -->

      <ellipse cx="150" cy="285" rx="48" ry="8" fill="none" stroke="url(#rfMetalGrad)" stroke-width="2.5"/>

      <ellipse cx="150" cy="285" rx="48" ry="8" fill="rgba(120,140,160,.12)"/>

      <line x1="112" y1="285" x2="188" y2="285" stroke="rgba(180,200,220,.35)" stroke-width="1"/>

      <line x1="150" y1="278" x2="150" y2="292" stroke="rgba(180,200,220,.35)" stroke-width="1"/>



      <!-- ── BUNSEN BURNER ── -->

      <rect x="130" y="330" width="40" height="18" rx="4" fill="url(#rfMetalGrad)" stroke="rgba(120,140,160,.5)" stroke-width="1"/>

      <rect x="133" y="332" width="34" height="6" rx="1" fill="rgba(255,255,255,.15)"/>

      <rect x="133" y="316" width="34" height="16" rx="3" fill="url(#rfMetalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <circle cx="140" cy="324" r="2" fill="rgba(60,80,100,.6)"/>

      <circle cx="150" cy="324" r="2" fill="rgba(60,80,100,.6)"/>

      <circle cx="160" cy="324" r="2" fill="rgba(60,80,100,.6)"/>

      <rect x="136" y="291" width="28" height="28" rx="3" fill="url(#rfMetalGrad)" stroke="rgba(120,140,160,.4)" stroke-width="1"/>

      <rect x="139" y="293" width="8" height="22" rx="1" fill="rgba(255,255,255,.18)"/>



      <!-- ── FLAME ── -->

      <g id="flame-group" filter="url(#rfFlameGlow)">

        <ellipse cx="150" cy="285" rx="18" ry="8" fill="rgba(50,100,255,.42)">

          <animate attributeName="ry" values="8;11;8" dur="0.5s" repeatCount="indefinite"/>

        </ellipse>

        <path d="M138 285 Q143 268 150 260 Q157 268 162 285 Z" fill="rgba(255,140,0,.80)">

          <animateTransform attributeName="transform" type="scale" values="1,1;1.04,1.07;0.97,1.02;1,1" dur="0.35s" repeatCount="indefinite" additive="sum"/>

        </path>

        <path d="M143 285 Q148 274 150 267 Q152 274 157 285 Z" fill="rgba(255,230,20,.90)">

          <animateTransform attributeName="transform" type="translate" values="0,0;1,-2;-1,-1;0,0" dur="0.28s" repeatCount="indefinite"/>

        </path>

        <path d="M147 285 Q149 278 150 272 Q151 278 153 285 Z" fill="rgba(180,220,255,.92)"/>

        <ellipse cx="150" cy="272" rx="18" ry="22" fill="url(#rfHeatRadial)" opacity=".7">

          <animate attributeName="opacity" values=".7;.4;.7" dur="0.6s" repeatCount="indefinite"/>

        </ellipse>

      </g>



      <!-- ── ROUND BOTTOM FLASK ── -->

      <ellipse cx="150" cy="300" rx="72" ry="8" fill="rgba(6,182,212,.07)" filter="url(#rfBlur)"/>

      <!-- Flask sphere (back face) -->

      <circle cx="150" cy="220" r="95" fill="rgba(150,205,255,0.06)" stroke="rgba(180,220,255,.25)" stroke-width="1"/>

      <!-- Flask sphere (main) -->

      <circle cx="150" cy="220" r="95" fill="url(#rfGrad)" stroke="rgba(200,235,255,.58)" stroke-width="2"/>

      <!-- Neck -->

      <rect x="126" y="80" width="48" height="72" rx="4" fill="rgba(190,225,255,.14)" stroke="rgba(200,235,255,.5)" stroke-width="1.5"/>

      <!-- Neck rim at top -->

      <ellipse cx="150" cy="80" rx="28" ry="6" fill="rgba(190,225,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1.5"/>

      <ellipse cx="150" cy="80" rx="23" ry="4.5" fill="rgba(255,255,255,.1)"/>

      <!-- Neck-to-sphere join shoulder -->

      <path d="M126 148 Q96 162 78 200" stroke="rgba(200,235,255,.5)" stroke-width="1.8" fill="none"/>

      <path d="M174 148 Q204 162 222 200" stroke="rgba(200,235,255,.45)" stroke-width="1.8" fill="none"/>



      <!-- Measurement markings on sphere -->

      <path d="M58 210 Q70 205 80 210" stroke="rgba(200,235,255,.5)" stroke-width="1" fill="none"/>

      <path d="M56 230 Q68 225 78 230" stroke="rgba(200,235,255,.5)" stroke-width="1" fill="none"/>

      <path d="M58 250 Q70 245 80 250" stroke="rgba(200,235,255,.5)" stroke-width="1" fill="none"/>

      <text x="46" y="213" class="hw-label" text-anchor="end" font-size="7.5">200</text>

      <text x="44" y="233" class="hw-label" text-anchor="end" font-size="7.5">150</text>

      <text x="46" y="253" class="hw-label" text-anchor="end" font-size="7.5">100</text>



      <!-- Liquid in flask (clipped to sphere) -->

      <g clip-path="url(#rfClip)">

        <rect id="liquid-rect" x="55" y="250" width="190" height="70" fill="rgba(200,220,255,.35)" opacity=".9"/>

        <path id="wave-path" d="M58 250 Q90 245 120 250 Q150 255 180 250 Q210 245 242 250 L242 256 Q210 252 180 256 Q150 260 120 256 Q90 252 58 256 Z" fill="rgba(200,220,255,.5)"/>

        <ellipse cx="140" cy="252" rx="35" ry="5" fill="url(#rfLiqGlow)" opacity=".6"/>

        <rect id="precipitate" x="55" y="300" width="190" height="0" fill="rgba(255,255,255,.7)" opacity="0"/>

        <ellipse id="heat-glow" cx="150" cy="310" rx="80" ry="12" fill="rgba(255,80,0,0)" opacity="0"/>

        <ellipse id="heat-shimmer" cx="150" cy="270" rx="60" ry="8" fill="rgba(255,160,30,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#rfClip)"></g>



      <!-- Glass shines -->

      <path d="M80 180 Q70 220 75 260" stroke="rgba(255,255,255,.20)" stroke-width="3.5" stroke-linecap="round"/>

      <path d="M92 165 Q84 200 86 230" stroke="rgba(255,255,255,.10)" stroke-width="2" stroke-linecap="round"/>

      <path d="M130 84 L130 148" stroke="rgba(255,255,255,.20)" stroke-width="2" stroke-linecap="round"/>



      <!-- Steam -->

      <g id="steam-group">

        <path d="M138 78 Q133 66 138 56 Q143 46 138 36" stroke="rgba(200,230,255,0)" stroke-width="2.5" fill="none" stroke-linecap="round">

          <animate attributeName="stroke" values="rgba(200,230,255,0);rgba(200,230,255,.5);rgba(200,230,255,0)" dur="2s" repeatCount="indefinite"/>

          <animateTransform attributeName="transform" type="translate" values="0,0;-3,-5;0,0" dur="2s" repeatCount="indefinite"/>

        </path>

        <path d="M150 76 Q145 64 150 52 Q155 42 150 32" stroke="rgba(200,230,255,0)" stroke-width="2.5" fill="none" stroke-linecap="round">

          <animate attributeName="stroke" values="rgba(200,230,255,0);rgba(200,230,255,.45);rgba(200,230,255,0)" dur="2.3s" repeatCount="indefinite" begin="0.7s"/>

          <animateTransform attributeName="transform" type="translate" values="0,0;2,-6;0,0" dur="2.3s" repeatCount="indefinite"/>

        </path>

        <path d="M162 78 Q167 66 162 56 Q157 46 162 36" stroke="rgba(200,230,255,0)" stroke-width="2.5" fill="none" stroke-linecap="round">

          <animate attributeName="stroke" values="rgba(200,230,255,0);rgba(200,230,255,.4);rgba(200,230,255,0)" dur="1.8s" repeatCount="indefinite" begin="1.4s"/>

          <animateTransform attributeName="transform" type="translate" values="0,0;4,-4;0,0" dur="1.8s" repeatCount="indefinite"/>

        </path>

      </g>



      <!-- Pour bottle (non-burette reagents) -->

      <g id="pour-bottle" opacity="0" transform="translate(245,50) rotate(45)">

        <rect x="-6" y="0" width="12" height="30" rx="3" fill="url(#rfBottleGrad)" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

        <rect x="-3" y="-8" width="6" height="10" rx="2" fill="rgba(200,235,255,.3)" stroke="rgba(200,235,255,.4)" stroke-width="1"/>

        <rect x="-5" y="1" width="3" height="28" rx="1" fill="rgba(255,255,255,.18)"/>

        <rect id="pour-bottle-liquid" x="-5" y="5" width="10" height="20" rx="2" fill="rgba(200,220,255,.55)" opacity=".9"/>

      </g>

      <path id="pour-stream-beaker" d="M245 80 Q210 100 170 120" stroke="rgba(200,220,255,.0)" stroke-width="3.5" stroke-linecap="round" fill="none"/>



      <text x="150" y="356" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">ROUND-BOTTOM FLASK + BUNSEN BURNER</text>

    </svg>`,



  electrolysis:`

    <svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="elGlassGrad" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stop-color="rgba(210,240,255,0.20)"/>

          <stop offset="50%" stop-color="rgba(180,220,255,0.10)"/>

          <stop offset="100%" stop-color="rgba(150,205,255,0.16)"/>

        </linearGradient>

        <linearGradient id="anodeGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(200,120,20,.6)"/>

          <stop offset="50%" stop-color="rgba(255,175,50,.8)"/>

          <stop offset="100%" stop-color="rgba(200,120,20,.6)"/>

        </linearGradient>

        <linearGradient id="cathodeGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(140,150,170,.6)"/>

          <stop offset="50%" stop-color="rgba(200,210,225,.8)"/>

          <stop offset="100%" stop-color="rgba(140,150,170,.6)"/>

        </linearGradient>

        <linearGradient id="battGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="rgba(255,200,40,.3)"/>

          <stop offset="100%" stop-color="rgba(200,140,20,.2)"/>

        </linearGradient>

        <clipPath id="elClip">

          <path d="M58 74 L58 286 Q58 296 68 296 L232 296 Q242 296 242 286 L242 74 Z"/>

        </clipPath>

        <filter id="elGlow"><feGaussianBlur stdDeviation="2.5"/></filter>

      </defs>



      <!-- ── POWER SUPPLY / BATTERY ── -->

      <rect x="88" y="10" width="124" height="36" rx="7" fill="url(#battGrad)" stroke="rgba(245,158,11,.6)" stroke-width="1.5"/>

      <rect x="91" y="13" width="118" height="14" rx="3" fill="rgba(255,200,40,.15)"/>

      <text x="150" y="24" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(245,158,11,.9)" font-weight="bold">⚡ DC POWER SUPPLY</text>

      <text x="150" y="36" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(245,158,11,.7)">12V / 2A</text>

      <!-- Terminal posts -->

      <rect x="96" y="44" width="12" height="8" rx="2" fill="rgba(239,68,68,.8)" stroke="rgba(200,50,30,.5)" stroke-width="1"/>

      <rect x="192" y="44" width="12" height="8" rx="2" fill="rgba(59,130,246,.8)" stroke="rgba(30,80,200,.5)" stroke-width="1"/>

      <text x="97" y="42" font-family="JetBrains Mono,monospace" font-size="9" fill="rgba(239,68,68,.9)" font-weight="bold">+</text>

      <text x="194" y="42" font-family="JetBrains Mono,monospace" font-size="9" fill="rgba(59,130,246,.9)" font-weight="bold">−</text>



      <!-- Wires with bends (realistic insulated wire look) -->

      <!-- Red wire (+) -->

      <path d="M102 52 Q102 66 94 70 L94 78" stroke="rgba(239,68,68,.85)" stroke-width="2.5" fill="none" stroke-linecap="round"/>

      <path d="M102 52 Q102 66 94 70 L94 78" stroke="rgba(255,100,80,.3)" stroke-width="1" fill="none" stroke-linecap="round"/>

      <!-- Blue wire (−) -->

      <path d="M198 52 Q198 66 206 70 L206 78" stroke="rgba(59,130,246,.85)" stroke-width="2.5" fill="none" stroke-linecap="round"/>

      <path d="M198 52 Q198 66 206 70 L206 78" stroke="rgba(100,160,255,.3)" stroke-width="1" fill="none" stroke-linecap="round"/>



      <!-- ── BEAKER (realistic glass) ── -->

      <ellipse cx="150" cy="308" rx="88" ry="8" fill="rgba(6,182,212,.06)" filter="url(#elGlow)"/>

      <!-- Back glass face -->

      <path d="M58 68 L58 286 Q58 296 68 296 L232 296 Q242 296 242 286 L242 68 Z" fill="rgba(150,205,255,0.05)" stroke="rgba(180,220,255,.25)" stroke-width="1"/>

      <!-- Main glass face -->

      <path d="M58 68 L58 286 Q58 296 68 296 L232 296 Q242 296 242 286 L242 68 Z" fill="url(#elGlassGrad)" stroke="rgba(200,235,255,.60)" stroke-width="2"/>

      <!-- Beaker rim -->

      <path d="M50 62 Q50 58 58 58 L242 58 Q250 58 250 62 L250 70 Q250 74 242 74 L58 74 Q50 74 50 70 Z" fill="rgba(200,235,255,.18)" stroke="rgba(200,235,255,.55)" stroke-width="1.5"/>

      <ellipse cx="150" cy="62" rx="94" ry="7" fill="rgba(255,255,255,.08)"/>

      <!-- Measurement lines -->

      <line x1="242" y1="160" x2="252" y2="160" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="242" y1="200" x2="252" y2="200" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="242" y1="240" x2="252" y2="240" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <line x1="242" y1="280" x2="252" y2="280" stroke="rgba(200,235,255,.5)" stroke-width="1"/>

      <text x="255" y="163" class="hw-label">200</text>

      <text x="255" y="203" class="hw-label">150</text>

      <text x="255" y="243" class="hw-label">100</text>

      <text x="255" y="283" class="hw-label">50</text>



      <!-- ── ELECTRODES (inside) ── -->

      <!-- Anode (+) carbon/platinum rod -->

      <rect id="anode-rod" x="88" y="74" width="12" height="210" rx="3" fill="url(#anodeGrad)" stroke="rgba(220,140,30,.5)" stroke-width="1"/>

      <rect x="90" y="74" width="3" height="210" rx="1" fill="rgba(255,220,100,.22)"/>

      <rect x="86" y="68" width="16" height="10" rx="2" fill="rgba(200,100,20,.7)" stroke="rgba(239,68,68,.5)" stroke-width="1"/>

      <text x="84" y="66" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(239,68,68,.9)" font-weight="bold">+</text>

      <text x="82" y="295" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(239,68,68,.6)">ANODE</text>



      <!-- Cathode (−) steel/Pt rod -->

      <rect id="cathode-rod" x="200" y="74" width="12" height="210" rx="3" fill="url(#cathodeGrad)" stroke="rgba(160,170,190,.5)" stroke-width="1"/>

      <rect x="202" y="74" width="3" height="210" rx="1" fill="rgba(255,255,255,.18)"/>

      <rect x="198" y="68" width="16" height="10" rx="2" fill="rgba(100,120,160,.7)" stroke="rgba(59,130,246,.5)" stroke-width="1"/>

      <text x="200" y="66" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(59,130,246,.9)" font-weight="bold">−</text>

      <text x="198" y="295" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(59,130,246,.6)">CATHODE</text>



      <!-- Liquid (clipped) -->

      <g clip-path="url(#elClip)">

        <rect id="liquid-rect" x="58" y="214" width="184" height="82" fill="rgba(6,182,212,.28)" opacity=".9"/>

        <path id="wave-path" d="M62 214 Q95 210 130 214 Q165 218 200 214 Q225 210 240 214 L240 218 Q225 214 200 218 Q165 222 130 218 Q95 214 62 218 Z" fill="rgba(6,182,212,.42)"/>

        <rect id="precipitate" x="58" y="276" width="184" height="0" fill="rgba(255,255,255,.5)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#elClip)"></g>



      <!-- Glass shines -->

      <path d="M65 68 L65 286" stroke="rgba(255,255,255,.20)" stroke-width="3.5" stroke-linecap="round"/>

      <path d="M75 68 L75 200" stroke="rgba(255,255,255,.10)" stroke-width="2" stroke-linecap="round"/>

      <path d="M235 75 L235 280" stroke="rgba(255,255,255,.07)" stroke-width="2" stroke-linecap="round"/>

      <!-- Bottom curve gloss -->

      <path d="M68 290 Q150 300 232 290" stroke="rgba(255,255,255,.12)" stroke-width="2" fill="none"/>



      <!-- Label -->

      <text x="150" y="348" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">ELECTROLYTIC CELL — H₂O SPLITTING</text>

    </svg>`,



  petri_dish:`

    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <radialGradient id="pdLiqGrad" cx="50%" cy="40%">

          <stop offset="0%" stop-color="rgba(255,80,40,0.85)"/>

          <stop offset="55%" stop-color="rgba(200,40,20,0.70)"/>

          <stop offset="100%" stop-color="rgba(100,20,10,0.55)"/>

        </radialGradient>

        <radialGradient id="pdGlassGrad" cx="35%" cy="30%">

          <stop offset="0%" stop-color="rgba(220,245,255,0.22)"/>

          <stop offset="100%" stop-color="rgba(140,200,255,0.06)"/>

        </radialGradient>

        <radialGradient id="pdShineGrad" cx="30%" cy="25%">

          <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>

          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>

        </radialGradient>

        <clipPath id="pdClip">

          <ellipse cx="200" cy="228" rx="148" ry="40"/>

        </clipPath>

        <filter id="pdGlow"><feGaussianBlur stdDeviation="3"/></filter>

        <filter id="bzWaveBlur"><feGaussianBlur stdDeviation="2.5"/></filter>

        <!-- BZ wave: animated spiral rings simulating oscillating reaction -->

        <radialGradient id="bzRing1" cx="50%" cy="50%">

          <stop offset="0%" stop-color="rgba(59,130,246,0.0)"/>

          <stop offset="40%" stop-color="rgba(59,130,246,0.55)"/>

          <stop offset="55%" stop-color="rgba(59,130,246,0.0)"/>

          <stop offset="100%" stop-color="rgba(59,130,246,0.0)"/>

        </radialGradient>

        <radialGradient id="bzRing2" cx="50%" cy="50%">

          <stop offset="0%" stop-color="rgba(239,68,68,0.0)"/>

          <stop offset="65%" stop-color="rgba(239,68,68,0.55)"/>

          <stop offset="80%" stop-color="rgba(239,68,68,0.0)"/>

          <stop offset="100%" stop-color="rgba(239,68,68,0.0)"/>

        </radialGradient>

      </defs>



      <!-- Label at top -->

      <text x="200" y="22" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(180,220,255,.6)">PETRI DISH — OSCILLATING REACTION</text>



      <!-- ── LID (slightly offset to show contents) ── -->

      <!-- Lid outer ellipse -->

      <ellipse cx="200" cy="145" rx="165" ry="45" fill="rgba(200,235,255,.06)" stroke="rgba(200,235,255,.45)" stroke-width="2"/>

      <!-- Lid inner rim -->

      <ellipse cx="200" cy="145" rx="157" ry="38" fill="none" stroke="rgba(200,235,255,.22)" stroke-width="1"/>

      <!-- Lid glass shine -->

      <ellipse cx="155" cy="132" rx="50" ry="12" fill="rgba(255,255,255,.08)" filter="url(#pdGlow)"/>

      <!-- Lid handle/grip bump -->

      <ellipse cx="200" cy="109" rx="20" ry="6" fill="rgba(200,235,255,.15)" stroke="rgba(200,235,255,.4)" stroke-width="1.2"/>



      <!-- ── BASE DISH (main vessel) ── -->

      <!-- Base outer shadow glow -->

      <ellipse cx="200" cy="235" rx="155" ry="42" fill="rgba(6,182,212,.06)" filter="url(#pdGlow)"/>

      <!-- Base side wall (short cylinder) -->

      <rect x="47" y="215" width="306" height="28" rx="0" fill="rgba(200,235,255,.08)" stroke="rgba(200,235,255,.35)" stroke-width="1.5"/>

      <!-- Base bottom ellipse (glass floor) -->

      <ellipse cx="200" cy="243" rx="153" ry="18" fill="rgba(150,205,255,.06)" stroke="rgba(200,235,255,.30)" stroke-width="1.5"/>



      <!-- ── LIQUID IN DISH ── -->

      <ellipse id="liquid-rect" cx="200" cy="216" rx="148" ry="38" fill="rgba(220,40,20,0.62)" opacity=".9"/>

      <!-- BZ Oscillating Waves (spiral-like animated rings) -->

      <g clip-path="url(#pdClip)">

        <!-- Ring 1 - blue wave (Ce⁴⁺ oxidized state) -->

        <ellipse cx="200" cy="216" rx="148" ry="38" fill="url(#bzRing1)" opacity="0.0">

          <animate attributeName="opacity" values="0;0.9;0;0.9;0" dur="2.8s" repeatCount="indefinite" begin="0s"/>

        </ellipse>

        <!-- Ring 2 - red wave (reduced ferroin) -->

        <ellipse cx="200" cy="216" rx="148" ry="38" fill="url(#bzRing2)" opacity="0.0">

          <animate attributeName="opacity" values="0.9;0;0.9;0;0.9" dur="2.8s" repeatCount="indefinite" begin="0s"/>

        </ellipse>

        <!-- Inner spiral center (Ce³⁺/Ce⁴⁺ oscillation core) -->

        <ellipse cx="200" cy="216" rx="60" ry="16" fill="rgba(59,130,246,0.5)" opacity="0">

          <animate attributeName="opacity" values="0;0.9;0;0.9;0" dur="2.8s" repeatCount="indefinite" begin="0.7s"/>

        </ellipse>

        <ellipse cx="200" cy="216" rx="60" ry="16" fill="rgba(239,68,68,0.5)" opacity="0">

          <animate attributeName="opacity" values="0.9;0;0.9;0;0.9" dur="2.8s" repeatCount="indefinite" begin="0.7s"/>

        </ellipse>

        <!-- Center dot -->

        <ellipse cx="200" cy="216" rx="18" ry="5" fill="rgba(255,255,255,0.3)" opacity="0">

          <animate attributeName="opacity" values="0;0.8;0;0.8;0" dur="2.8s" repeatCount="indefinite" begin="1.4s"/>

        </ellipse>

        <!-- Surface shine -->

        <ellipse cx="145" cy="208" rx="42" ry="10" fill="url(#pdShineGrad)" opacity=".55"/>

        <rect id="precipitate" x="52" y="238" width="296" height="0" fill="rgba(255,255,255,.5)" opacity="0"/>

      </g>

      <!-- Liquid top ellipse (meniscus) -->

      <ellipse cx="200" cy="216" rx="148" ry="38" fill="none" stroke="rgba(200,235,255,.28)" stroke-width="1.2"/>



      <!-- Dish top rim -->

      <ellipse cx="200" cy="215" rx="152" ry="40" fill="none" stroke="rgba(200,235,255,.55)" stroke-width="2"/>



      <!-- Wave indicator line (iron(II)/iron(III) front) -->

      <line x1="50" y1="215" x2="350" y2="215" stroke="rgba(255,255,255,0)" stroke-width="1" stroke-dasharray="4 4">

        <animate attributeName="stroke" values="rgba(255,255,255,0);rgba(255,200,100,0.45);rgba(255,255,255,0)" dur="2.8s" repeatCount="indefinite"/>

      </line>



      <!-- Glass shine on dish rim -->

      <path d="M52 200 Q75 188 130 184" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-linecap="round" fill="none"/>



      <!-- Chemistry labels -->

      <text x="200" y="285" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(239,68,68,.7)">Red = Fe²⁺ (Reduced) · Blue = Fe³⁺ (Oxidized)</text>

      <text x="200" y="298" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(140,200,255,.45)">BrO₃⁻ + Malonic Acid + Ferroin → Spiral Waves</text>



      <!-- Magnetic stir bar hint at bottom -->

      <rect x="178" y="237" width="44" height="7" rx="3.5" fill="rgba(120,140,160,.35)" stroke="rgba(180,200,220,.25)" stroke-width="1">

        <animateTransform attributeName="transform" type="rotate" values="0 200 240;360 200 240" dur="1.8s" repeatCount="indefinite"/>

      </rect>

      <text x="200" y="378" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">PETRI DISH 15 cm + MAGNETIC STIRRER</text>

    </svg>`,



  nuclear_chamber:`

    <svg viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <radialGradient id="uraniumGlow" cx="50%" cy="50%">

          <stop offset="0%" stop-color="rgba(100,255,60,1.0)"/>

          <stop offset="30%" stop-color="rgba(60,200,20,0.85)"/>

          <stop offset="70%" stop-color="rgba(20,120,0,0.5)"/>

          <stop offset="100%" stop-color="rgba(0,60,0,0)"/>

        </radialGradient>

        <radialGradient id="coreGrad" cx="50%" cy="40%">

          <stop offset="0%" stop-color="rgba(160,255,80,0.95)"/>

          <stop offset="50%" stop-color="rgba(60,180,20,0.80)"/>

          <stop offset="100%" stop-color="rgba(10,80,0,0.60)"/>

        </radialGradient>

        <radialGradient id="chamberGrad" cx="30%" cy="25%">

          <stop offset="0%" stop-color="rgba(180,200,190,0.35)"/>

          <stop offset="100%" stop-color="rgba(80,100,90,0.15)"/>

        </radialGradient>

        <linearGradient id="steelGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="#6a7a80"/>

          <stop offset="40%" stop-color="#aabbc0"/>

          <stop offset="100%" stop-color="#506070"/>

        </linearGradient>

        <linearGradient id="rodGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="#b0c8d0"/>

          <stop offset="50%" stop-color="#e0f0f5"/>

          <stop offset="100%" stop-color="#708090"/>

        </linearGradient>

        <filter id="nucGlow">

          <feGaussianBlur stdDeviation="6" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

        <filter id="softGlow">

          <feGaussianBlur stdDeviation="3"/>

        </filter>

        <filter id="radGlow">

          <feGaussianBlur stdDeviation="8" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

        <clipPath id="chamberClip">

          <rect x="72" y="88" width="256" height="210" rx="12"/>

        </clipPath>

      </defs>



      <!-- Label -->

      <text x="200" y="16" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(100,255,60,.6)">NUCLEAR FISSION CHAMBER — U-235</text>



      <!-- ── REACTOR CONTAINMENT VESSEL ── -->

      <!-- Outer concrete/steel shield -->

      <rect x="55" y="72" width="290" height="240" rx="18" fill="rgba(60,75,70,.55)" stroke="rgba(100,140,120,.4)" stroke-width="3"/>

      <!-- Inner steel liner -->

      <rect x="72" y="88" width="256" height="210" rx="12" fill="url(#chamberGrad)" stroke="rgba(140,180,160,.35)" stroke-width="2"/>



      <!-- Coolant water (heavy water moderator) - blue liquid inside -->

      <g clip-path="url(#chamberClip)">

        <rect id="liquid-rect" x="72" y="200" width="256" height="98" fill="rgba(20,80,200,0.35)" opacity=".9"/>

        <path id="wave-path" d="M74 200 Q130 195 200 200 Q270 205 326 200 L326 206 Q270 202 200 206 Q130 210 74 206 Z" fill="rgba(30,100,220,.48)"/>

        <!-- Cherenkov radiation glow in water (blue glow) -->

        <ellipse cx="200" cy="220" rx="80" ry="18" fill="rgba(59,130,246,0.22)" filter="url(#softGlow)">

          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.2s" repeatCount="indefinite"/>

        </ellipse>

        <rect id="precipitate" x="72" y="278" width="256" height="0" fill="rgba(255,255,200,.5)" opacity="0"/>

        <ellipse id="heat-glow" cx="200" cy="290" rx="100" ry="12" fill="rgba(255,80,0,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#chamberClip)"></g>



      <!-- Reactor vessel glass shine -->

      <path d="M78 92 L78 290" stroke="rgba(255,255,255,.12)" stroke-width="3" stroke-linecap="round"/>



      <!-- ── CONTROL RODS (3 rods — boron/cadmium) ── -->

      <!-- Rod 1 -->

      <rect x="130" y="68" width="14" height="155" rx="3" fill="url(#rodGrad)" stroke="rgba(140,180,160,.4)" stroke-width="1"/>

      <rect x="133" y="68" width="3" height="155" fill="rgba(255,255,255,.18)" rx="1"/>

      <rect x="127" y="60" width="20" height="14" rx="3" fill="url(#steelGrad)" stroke="rgba(140,160,150,.5)" stroke-width="1"/>

      <text x="137" y="56" font-family="JetBrains Mono,monospace" font-size="7" text-anchor="middle" fill="rgba(200,220,210,.8)">B</text>

      <!-- Rod 2 -->

      <rect x="193" y="68" width="14" height="155" rx="3" fill="url(#rodGrad)" stroke="rgba(140,180,160,.4)" stroke-width="1"/>

      <rect x="196" y="68" width="3" height="155" fill="rgba(255,255,255,.18)" rx="1"/>

      <rect x="190" y="60" width="20" height="14" rx="3" fill="url(#steelGrad)" stroke="rgba(140,160,150,.5)" stroke-width="1"/>

      <text x="200" y="56" font-family="JetBrains Mono,monospace" font-size="7" text-anchor="middle" fill="rgba(200,220,210,.8)">B</text>

      <!-- Rod 3 -->

      <rect x="256" y="68" width="14" height="155" rx="3" fill="url(#rodGrad)" stroke="rgba(140,180,160,.4)" stroke-width="1"/>

      <rect x="259" y="68" width="3" height="155" fill="rgba(255,255,255,.18)" rx="1"/>

      <rect x="253" y="60" width="20" height="14" rx="3" fill="url(#steelGrad)" stroke="rgba(140,160,150,.5)" stroke-width="1"/>

      <text x="263" y="56" font-family="JetBrains Mono,monospace" font-size="7" text-anchor="middle" fill="rgba(200,220,210,.8)">B</text>

      <!-- Rod label -->

      <text x="200" y="46" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(180,210,200,.5)">CONTROL RODS (Boron-Cadmium)</text>



      <!-- ── URANIUM FUEL RODS (U-235 pellets — glowing green-yellow) ── -->

      <!-- Fuel rod 1 -->

      <rect x="152" y="100" width="16" height="185" rx="4" fill="rgba(30,30,20,0.8)" stroke="rgba(80,100,60,.5)" stroke-width="1.5"/>

      <rect x="154" y="102" width="12" height="181" rx="3" fill="rgba(80,200,20,0.25)">

        <animate attributeName="fill" values="rgba(80,200,20,0.25);rgba(140,255,60,0.55);rgba(80,200,20,0.25)" dur="1.5s" repeatCount="indefinite"/>

      </rect>

      <!-- Fuel rod glow -->

      <rect x="152" y="100" width="16" height="185" rx="4" fill="url(#coreGrad)" opacity="0.0" filter="url(#softGlow)">

        <animate attributeName="opacity" values="0.0;0.5;0.0" dur="1.5s" repeatCount="indefinite"/>

      </rect>

      <!-- Fuel rod 2 -->

      <rect x="232" y="100" width="16" height="185" rx="4" fill="rgba(30,30,20,0.8)" stroke="rgba(80,100,60,.5)" stroke-width="1.5"/>

      <rect x="234" y="102" width="12" height="181" rx="3" fill="rgba(80,200,20,0.25)">

        <animate attributeName="fill" values="rgba(80,200,20,0.25);rgba(140,255,60,0.55);rgba(80,200,20,0.25)" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>

      </rect>

      <rect x="232" y="100" width="16" height="185" rx="4" fill="url(#coreGrad)" opacity="0.0" filter="url(#softGlow)">

        <animate attributeName="opacity" values="0.0;0.5;0.0" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>

      </rect>



      <!-- ── RADIOACTIVE URANIUM CORE GLOW (green-yellow, shining) ── -->

      <ellipse cx="200" cy="190" rx="62" ry="22" fill="url(#uraniumGlow)" opacity="0.0" filter="url(#nucGlow)">

        <animate attributeName="opacity" values="0.0;0.75;0.0" dur="1.0s" repeatCount="indefinite"/>

      </ellipse>

      <!-- Radiation shimmer ring -->

      <ellipse cx="200" cy="190" rx="90" ry="32" fill="none" stroke="rgba(100,255,60,0.0)" stroke-width="3">

        <animate attributeName="stroke" values="rgba(100,255,60,0.0);rgba(100,255,60,0.35);rgba(100,255,60,0.0)" dur="1.0s" repeatCount="indefinite"/>

        <animate attributeName="rx" values="90;110;90" dur="1.0s" repeatCount="indefinite"/>

        <animate attributeName="ry" values="32;40;32" dur="1.0s" repeatCount="indefinite"/>

      </ellipse>



      <!-- Neutron emission sparks (animated dots flying outward) -->

      <circle cx="200" cy="190" r="3" fill="rgba(255,255,100,0.9)" opacity="0">

        <animate attributeName="cx" values="200;240;260" dur="0.6s" repeatCount="indefinite"/>

        <animate attributeName="cy" values="190;170;155" dur="0.6s" repeatCount="indefinite"/>

        <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite"/>

        <animate attributeName="r" values="3;1.5;0" dur="0.6s" repeatCount="indefinite"/>

      </circle>

      <circle cx="200" cy="190" r="3" fill="rgba(255,255,100,0.9)" opacity="0">

        <animate attributeName="cx" values="200;160;140" dur="0.6s" repeatCount="indefinite" begin="0.2s"/>

        <animate attributeName="cy" values="190;175;160" dur="0.6s" repeatCount="indefinite" begin="0.2s"/>

        <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.2s"/>

        <animate attributeName="r" values="3;1.5;0" dur="0.6s" repeatCount="indefinite" begin="0.2s"/>

      </circle>

      <circle cx="200" cy="190" r="3" fill="rgba(255,255,100,0.9)" opacity="0">

        <animate attributeName="cx" values="200;220;240" dur="0.6s" repeatCount="indefinite" begin="0.4s"/>

        <animate attributeName="cy" values="190;215;230" dur="0.6s" repeatCount="indefinite" begin="0.4s"/>

        <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.4s"/>

        <animate attributeName="r" values="3;1.5;0" dur="0.6s" repeatCount="indefinite" begin="0.4s"/>

      </circle>



      <!-- ── RADIATION SYMBOL ── -->

      <g transform="translate(200,190)" opacity="0.55">

        <!-- Trefoil blades -->

        <path d="M0 0 L-7 -12 A14 14 0 0 1 7 -12 Z" fill="rgba(100,255,60,0.7)">

          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>

        </path>

        <path d="M0 0 L12 4 A14 14 0 0 1 5 14 Z" fill="rgba(100,255,60,0.7)" transform="rotate(120)">

          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.67s"/>

        </path>

        <path d="M0 0 L12 4 A14 14 0 0 1 5 14 Z" fill="rgba(100,255,60,0.7)" transform="rotate(240)">

          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1.33s"/>

        </path>

        <circle cx="0" cy="0" r="4" fill="rgba(30,30,20,0.9)"/>

      </g>



      <!-- ── VESSEL MEASUREMENT MARKS ── -->

      <line x1="328" y1="140" x2="338" y2="140" stroke="rgba(140,180,160,.5)" stroke-width="1"/>

      <line x1="328" y1="190" x2="338" y2="190" stroke="rgba(140,180,160,.5)" stroke-width="1"/>

      <line x1="328" y1="240" x2="338" y2="240" stroke="rgba(140,180,160,.5)" stroke-width="1"/>

      <line x1="328" y1="280" x2="338" y2="280" stroke="rgba(140,180,160,.5)" stroke-width="1"/>

      <text x="341" y="143" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(140,180,160,.6)">600</text>

      <text x="341" y="193" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(140,180,160,.6)">400</text>

      <text x="341" y="243" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(140,180,160,.6)">200</text>

      <text x="341" y="283" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(140,180,160,.6)">50</text>



      <!-- Pressure gauge -->

      <circle cx="95" cy="130" r="18" fill="rgba(40,55,50,.7)" stroke="rgba(100,140,120,.4)" stroke-width="1.5"/>

      <circle cx="95" cy="130" r="14" fill="rgba(20,30,25,.8)" stroke="rgba(80,120,100,.3)" stroke-width="1"/>

      <line x1="95" y1="130" x2="100" y2="119" stroke="rgba(100,255,60,.8)" stroke-width="1.5" stroke-linecap="round">

        <animateTransform attributeName="transform" type="rotate" values="-20 95 130;40 95 130;-20 95 130" dur="3s" repeatCount="indefinite"/>

      </line>

      <circle cx="95" cy="130" r="2" fill="rgba(100,255,60,.7)"/>

      <text x="95" y="152" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6" fill="rgba(100,255,60,.6)">PRESS.</text>



      <!-- Temperature gauge -->

      <circle cx="95" cy="210" r="18" fill="rgba(40,55,50,.7)" stroke="rgba(100,140,120,.4)" stroke-width="1.5"/>

      <circle cx="95" cy="210" r="14" fill="rgba(20,30,25,.8)" stroke="rgba(80,120,100,.3)" stroke-width="1"/>

      <line x1="95" y1="210" x2="103" y2="200" stroke="rgba(255,100,60,.8)" stroke-width="1.5" stroke-linecap="round">

        <animateTransform attributeName="transform" type="rotate" values="0 95 210;60 95 210;0 95 210" dur="2s" repeatCount="indefinite"/>

      </line>

      <circle cx="95" cy="210" r="2" fill="rgba(255,100,60,.7)"/>

      <text x="95" y="232" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6" fill="rgba(255,100,60,.6)">TEMP.</text>



      <!-- Radiation warning badge -->

      <rect x="160" y="318" width="80" height="22" rx="5" fill="rgba(255,220,0,0.15)" stroke="rgba(255,220,0,0.4)" stroke-width="1"/>

      <text x="200" y="333" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(255,220,0,.9)" font-weight="bold">☢ RADIOACTIVE</text>



      <!-- U-235 label on fuel rods -->

      <text x="160" y="345" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6" fill="rgba(100,255,60,.6)">²³⁵U</text>

      <text x="240" y="345" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6" fill="rgba(100,255,60,.6)">²³⁵U</text>



      <!-- Bottom label -->

      <text x="200" y="410" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(100,255,60,.4)">NUCLEAR FISSION REACTOR — U-235 CORE</text>

    </svg>`,



  test_tube_waterbath:`

    <svg viewBox="0 0 420 440" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="wbGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(180,220,255,0.18)"/>

          <stop offset="45%" stop-color="rgba(220,245,255,0.32)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.12)"/>

        </linearGradient>

        <linearGradient id="ttGrad2" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(210,240,255,0.22)"/>

          <stop offset="50%" stop-color="rgba(240,252,255,0.40)"/>

          <stop offset="100%" stop-color="rgba(190,230,255,0.18)"/>

        </linearGradient>

        <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(180,190,200,0.0)"/>

          <stop offset="30%" stop-color="rgba(210,220,225,0.0)"/>

          <stop offset="100%" stop-color="rgba(180,190,200,0.0)"/>

        </linearGradient>

        <clipPath id="ttClip2">

          <path d="M178 88 L162 88 L148 310 Q148 348 178 348 Q208 348 208 310 L194 88 Z"/>

        </clipPath>

        <clipPath id="wbClip">

          <rect x="62" y="268" width="296" height="148"/>

        </clipPath>

        <radialGradient id="wbLiqGlow" cx="50%" cy="20%">

          <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>

          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>

        </radialGradient>

        <filter id="silverGlow2"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

        <filter id="wbGlow"><feGaussianBlur stdDeviation="2.5"/></filter>

      </defs>



      <!-- ══ RETORT STAND (right) ══ -->

      <text x="360" y="14" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(180,220,255,.65)">RETORT STAND</text>

      <!-- Base plate -->

      <rect x="315" y="400" width="90" height="14" rx="4" fill="rgba(120,140,160,0.55)" stroke="rgba(180,210,230,.5)" stroke-width="1.2"/>

      <!-- Vertical rod -->

      <rect x="355" y="48" width="8" height="356" rx="3" fill="rgba(140,165,185,0.55)" stroke="rgba(180,210,230,.45)" stroke-width="1"/>

      <!-- Clamp arm -->

      <rect x="248" y="94" width="112" height="7" rx="3" fill="rgba(140,165,185,0.55)" stroke="rgba(180,210,230,.45)" stroke-width="1"/>

      <!-- Clamp body holding test tube -->

      <rect x="244" y="82" width="14" height="32" rx="4" fill="rgba(100,130,155,0.65)" stroke="rgba(180,215,235,.5)" stroke-width="1.2"/>

      <rect x="247" y="86" width="5" height="24" rx="2" fill="rgba(200,220,235,0.25)"/>

      <!-- Stand label -->

      <text x="359" y="380" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(140,180,210,.5)">STAND</text>



      <!-- ══ THERMOMETER (left of test tube) ══ -->

      <text x="102" y="14" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(180,220,255,.65)">THERMOMETER</text>

      <!-- Thermometer glass tube -->

      <rect x="98" y="48" width="8" height="285" rx="4" fill="rgba(210,240,255,0.20)" stroke="rgba(200,235,255,.55)" stroke-width="1.3"/>

      <!-- Mercury column -->

      <rect x="100" y="155" width="4" height="178" rx="2" fill="rgba(239,68,68,0.70)"/>

      <!-- Bulb -->

      <ellipse cx="102" cy="338" rx="8" ry="9" fill="rgba(239,68,68,0.80)" stroke="rgba(200,235,255,.5)" stroke-width="1.3"/>

      <!-- Tick marks + labels -->

      <line x1="98" y1="80" x2="91" y2="80" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <line x1="98" y1="115" x2="91" y2="115" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <line x1="98" y1="155" x2="88" y2="155" stroke="rgba(200,235,255,.7)" stroke-width="1.2"/>

      <line x1="98" y1="195" x2="91" y2="195" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <line x1="98" y1="235" x2="88" y2="235" stroke="rgba(200,235,255,.7)" stroke-width="1.2"/>

      <line x1="98" y1="275" x2="91" y2="275" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <text x="86" y="83" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.65)">100</text>

      <text x="86" y="158" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.65)">70</text>

      <text x="86" y="238" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.65)">40</text>

      <text x="86" y="278" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.65)">25</text>

      <!-- °C label -->

      <text x="102" y="42" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" fill="rgba(239,68,68,.75)">°C</text>



      <!-- ══ WATER BATH BEAKER (600 mL glass beaker, hot water) ══ -->

      <text x="210" y="256" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(180,220,255,.65)">WATER BATH 60°C</text>

      <!-- Beaker shadow -->

      <ellipse cx="210" cy="424" rx="110" ry="7" fill="rgba(6,182,212,.07)" filter="url(#wbGlow)"/>

      <!-- Beaker back wall -->

      <rect x="62" y="268" width="296" height="148" rx="8" fill="rgba(150,205,255,0.04)" stroke="rgba(180,220,255,.22)" stroke-width="1"/>

      <!-- Hot water fill -->

      <g clip-path="url(#wbClip)">

        <rect id="wb-water" x="64" y="295" width="292" height="119" fill="rgba(59,130,246,0.22)" opacity="0.9"/>

        <path d="M64 295 Q120 289 180 295 Q245 301 310 295 Q342 291 356 295 L356 302 Q342 298 310 301 Q245 307 180 301 Q120 297 64 302 Z" fill="rgba(59,130,246,0.40)"/>

        <ellipse cx="210" cy="297" rx="100" ry="7" fill="url(#wbLiqGlow)" opacity=".55"/>

        <!-- Heat shimmer lines -->

        <line x1="110" y1="315" x2="112" y2="295" stroke="rgba(255,200,80,0.18)" stroke-width="1.5" stroke-dasharray="3,4"/>

        <line x1="155" y1="320" x2="157" y2="300" stroke="rgba(255,200,80,0.15)" stroke-width="1.5" stroke-dasharray="3,4"/>

        <line x1="250" y1="318" x2="252" y2="298" stroke="rgba(255,200,80,0.15)" stroke-width="1.5" stroke-dasharray="3,4"/>

        <line x1="300" y1="314" x2="302" y2="294" stroke="rgba(255,200,80,0.18)" stroke-width="1.5" stroke-dasharray="3,4"/>

        <!-- Heat bubbles in water bath -->

        <circle cx="130" cy="380" r="3" fill="none" stroke="rgba(59,130,246,0.35)" stroke-width="1"/>

        <circle cx="200" cy="395" r="2.5" fill="none" stroke="rgba(59,130,246,0.30)" stroke-width="1"/>

        <circle cx="280" cy="375" r="3.5" fill="none" stroke="rgba(59,130,246,0.32)" stroke-width="1"/>

        <!-- Bottom heat glow (burner) -->

        <rect x="64" y="395" width="292" height="21" fill="rgba(255,120,30,0.08)"/>

      </g>

      <!-- Beaker front wall -->

      <rect x="62" y="268" width="296" height="148" rx="8" fill="url(#wbGrad)" stroke="rgba(200,235,255,.58)" stroke-width="2"/>

      <!-- Beaker rim top ellipse -->

      <ellipse cx="210" cy="268" rx="148" ry="9" fill="rgba(200,235,255,.20)" stroke="rgba(200,235,255,.60)" stroke-width="1.5"/>

      <!-- Measurement marks on beaker -->

      <line x1="358" y1="310" x2="368" y2="310" stroke="rgba(200,235,255,.50)" stroke-width="1"/>

      <line x1="358" y1="340" x2="368" y2="340" stroke="rgba(200,235,255,.50)" stroke-width="1"/>

      <line x1="358" y1="370" x2="368" y2="370" stroke="rgba(200,235,255,.50)" stroke-width="1"/>

      <text x="372" y="313" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.55)">400</text>

      <text x="372" y="343" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.55)">300</text>

      <text x="372" y="373" font-family="JetBrains Mono,monospace" font-size="7" fill="rgba(200,235,255,.55)">200</text>

      <!-- Glass highlight -->

      <path d="M70 278 L70 405" stroke="rgba(255,255,255,.18)" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Hotplate base under beaker -->

      <rect x="42" y="416" width="336" height="18" rx="5" fill="rgba(80,90,105,0.60)" stroke="rgba(140,160,175,.45)" stroke-width="1.2"/>

      <rect x="55" y="419" width="310" height="10" rx="3" fill="rgba(239,68,68,0.20)"/>

      <ellipse cx="370" cy="422" rx="8" ry="6" fill="rgba(239,68,68,0.35)" stroke="rgba(239,68,68,.5)" stroke-width="1"/>

      <text x="368" y="425" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="5.5" fill="rgba(255,255,255,.7)">ON</text>

      <text x="210" y="433" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(239,68,68,.55)">HOT PLATE 60°C</text>



      <!-- ══ TEST TUBE (main vessel, clamped in water bath) ══ -->

      <!-- Test tube shadow -->

      <ellipse cx="178" cy="354" rx="34" ry="5" fill="rgba(6,182,212,.08)" filter="url(#wbGlow)"/>

      <!-- Test tube back glass -->

      <path d="M178 88 L162 88 L148 310 Q148 350 178 350 Q208 350 208 310 L194 88 Z" fill="rgba(150,200,255,0.04)" stroke="rgba(180,220,255,.22)" stroke-width="1"/>

      <!-- Reaction liquid fill -->

      <g clip-path="url(#ttClip2)">

        <rect id="liquid-rect" x="148" y="238" width="60" height="110" fill="rgba(6,182,212,0.28)" opacity="0.9"/>

        <path id="wave-path" d="M149 238 Q163 233 178 238 Q193 243 207 238 L207 244 Q193 240 178 244 Q163 248 149 244 Z" fill="rgba(6,182,212,0.48)"/>

        <!-- Silver mirror layer — starts invisible, shown by JS -->

        <rect id="silver-mirror" x="150" y="148" width="56" height="90" fill="url(#silverGrad)" opacity="0" filter="url(#silverGlow2)"/>

        <rect id="precipitate" x="148" y="338" width="60" height="0" fill="rgba(255,255,255,.7)" opacity="0"/>

        <ellipse id="heat-glow" cx="178" cy="346" rx="28" ry="6" fill="rgba(255,80,0,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#ttClip2)"></g>

      <!-- Test tube front glass -->

      <path d="M178 88 L162 88 L148 310 Q148 350 178 350 Q208 350 208 310 L194 88 Z" fill="url(#ttGrad2)" stroke="rgba(200,235,255,.68)" stroke-width="2"/>

      <!-- Tube opening rim -->

      <ellipse cx="178" cy="88" rx="16" ry="4.5" fill="rgba(200,235,255,.28)" stroke="rgba(200,235,255,.65)" stroke-width="1.5"/>

      <!-- Glass shine on tube -->

      <path d="M154 96 L152 290 Q152 310 160 330" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-linecap="round" fill="none"/>

      <path d="M158 96 L156 255" stroke="rgba(255,255,255,.12)" stroke-width="1.5" stroke-linecap="round" fill="none"/>

      <!-- Volume marks on tube -->

      <line x1="208" y1="180" x2="216" y2="180" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <line x1="208" y1="220" x2="216" y2="220" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <line x1="208" y1="260" x2="216" y2="260" stroke="rgba(200,235,255,.55)" stroke-width="1"/>

      <text x="219" y="183" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(200,235,255,.55)">5mL</text>

      <text x="219" y="223" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(200,235,255,.55)">3mL</text>

      <text x="219" y="263" font-family="JetBrains Mono,monospace" font-size="6.5" fill="rgba(200,235,255,.55)">1mL</text>

      <!-- Test tube label -->

      <text x="178" y="390" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="rgba(140,200,255,.4)">TEST TUBE + WATER BATH + HOT PLATE</text>

    </svg>`,



  radiolysis_setup:`

    <svg viewBox="0 0 460 450" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <!-- Lead shielding gradient — dark gunmetal -->

        <linearGradient id="leadGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%"   stop-color="rgba(38,42,50,0.97)"/>

          <stop offset="40%"  stop-color="rgba(62,68,78,0.95)"/>

          <stop offset="100%" stop-color="rgba(28,32,38,0.98)"/>

        </linearGradient>

        <linearGradient id="leadTopGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%"   stop-color="rgba(80,88,100,0.95)"/>

          <stop offset="100%" stop-color="rgba(42,46,55,0.98)"/>

        </linearGradient>

        <!-- Quartz vessel gradient — clear glass -->

        <linearGradient id="quartzGrad" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%"   stop-color="rgba(210,240,255,0.22)"/>

          <stop offset="50%"  stop-color="rgba(185,225,255,0.12)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.18)"/>

        </linearGradient>

        <!-- Water / Cherenkov glow -->

        <radialGradient id="cherenkovGrad" cx="50%" cy="40%">

          <stop offset="0%"   stop-color="rgba(80,160,255,0.65)"/>

          <stop offset="55%"  stop-color="rgba(40,100,220,0.35)"/>

          <stop offset="100%" stop-color="rgba(10,50,180,0.10)"/>

        </radialGradient>

        <!-- Radiation source glow (gamma) -->

        <radialGradient id="gammaGlow" cx="50%" cy="50%">

          <stop offset="0%"   stop-color="rgba(160,255,80,1.0)"/>

          <stop offset="35%"  stop-color="rgba(80,200,20,0.75)"/>

          <stop offset="70%"  stop-color="rgba(20,120,0,0.35)"/>

          <stop offset="100%" stop-color="rgba(0,60,0,0)"/>

        </radialGradient>

        <!-- Gas tube gradient -->

        <linearGradient id="gastubeGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%"   stop-color="rgba(180,220,255,0.18)"/>

          <stop offset="50%"  stop-color="rgba(220,245,255,0.32)"/>

          <stop offset="100%" stop-color="rgba(160,210,255,0.14)"/>

        </linearGradient>

        <!-- Control panel gradient -->

        <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%"   stop-color="rgba(30,36,45,0.97)"/>

          <stop offset="100%" stop-color="rgba(18,22,30,0.99)"/>

        </linearGradient>

        <!-- Steel / metal gradient -->

        <linearGradient id="rdSteelGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%"   stop-color="#b0bcc8"/>

          <stop offset="45%"  stop-color="#dde8f0"/>

          <stop offset="100%" stop-color="#7a8898"/>

        </linearGradient>

        <!-- Geiger tube gradient -->

        <linearGradient id="geigerGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%"   stop-color="rgba(60,70,80,0.90)"/>

          <stop offset="50%"  stop-color="rgba(90,100,115,0.85)"/>

          <stop offset="100%" stop-color="rgba(50,60,70,0.90)"/>

        </linearGradient>

        <!-- Clip paths -->

        <clipPath id="rdVesselClip">

          <rect x="196" y="110" width="68" height="155" rx="6"/>

        </clipPath>

        <clipPath id="rdChamberClip">

          <rect x="56" y="72" width="140" height="196" rx="6"/>

        </clipPath>

        <clipPath id="rdGasH2Clip">

          <rect x="316" y="100" width="26" height="120"/>

        </clipPath>

        <clipPath id="rdGasO2Clip">

          <rect x="352" y="100" width="26" height="120"/>

        </clipPath>

        <!-- Filters -->

        <filter id="rdNucGlow">

          <feGaussianBlur stdDeviation="6" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

        <filter id="rdSoftGlow">

          <feGaussianBlur stdDeviation="3"/>

        </filter>

        <filter id="rdBlur2">

          <feGaussianBlur stdDeviation="2"/>

        </filter>

        <filter id="geigerGlow">

          <feGaussianBlur stdDeviation="2.5" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

      </defs>



      <!-- ══════════════════════════════════════════════

           TOP LABEL

      ══════════════════════════════════════════════ -->

      <text x="230" y="16" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7.5" fill="rgba(80,200,255,.65)">RADIOLYSIS OF WATER — NUCLEAR CHEMISTRY</text>



      <!-- ══════════════════════════════════════════════

           SECTION A — LEAD SHIELDING CHAMBER (left block)

           Contains the sealed γ/α/β radiation source

      ══════════════════════════════════════════════ -->

      <!-- Outer concrete border -->

      <rect x="42" y="58" width="168" height="224" rx="10"

            fill="rgba(45,50,58,.80)" stroke="rgba(70,78,90,.6)" stroke-width="3"/>

      <!-- Lead wall fill — thick heavy metal look -->

      <rect x="52" y="68" width="148" height="204" rx="7"

            fill="url(#leadGrad)" stroke="rgba(90,100,115,.55)" stroke-width="2"/>

      <!-- Inner cavity (where source sits) -->

      <rect x="74" y="90" width="104" height="162" rx="6"

            fill="rgba(18,22,28,.92)" stroke="rgba(60,70,80,.5)" stroke-width="1.5"/>

      <!-- Lead hatching texture (diagonal lines on wall sections) -->

      <line x1="52" y1="68" x2="74" y2="90"   stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="52" y1="90" x2="74" y2="112"  stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="52" y1="112" x2="74" y2="134" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="52" y1="134" x2="74" y2="156" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="52" y1="156" x2="74" y2="178" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="52" y1="178" x2="74" y2="200" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <!-- Right wall hatching -->

      <line x1="178" y1="90" x2="200" y2="68"   stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="178" y1="112" x2="200" y2="90"  stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="178" y1="134" x2="200" y2="112" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="178" y1="156" x2="200" y2="134" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <line x1="178" y1="178" x2="200" y2="156" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

      <!-- Lead wall label -->

      <text x="62" y="80" font-family="JetBrains Mono,monospace" font-size="6"

            fill="rgba(140,155,175,.65)">Pb WALL</text>

      <text x="182" y="80" font-family="JetBrains Mono,monospace" font-size="6"

            fill="rgba(140,155,175,.65)" text-anchor="end">Pb</text>



      <!-- ── RADIATION SOURCE (Co-60 / Cs-137 sealed capsule) ── -->

      <!-- Source housing cylinder -->

      <rect x="102" y="118" width="48" height="100" rx="8"

            fill="rgba(50,58,68,.92)" stroke="rgba(90,100,115,.6)" stroke-width="1.5"/>

      <rect x="105" y="121" width="8" height="94" rx="2"

            fill="rgba(255,255,255,.08)"/>

      <!-- Source pellet (glowing green-yellow — gamma emitter) -->

      <ellipse cx="126" cy="168" rx="16" ry="16"

               fill="url(#gammaGlow)" filter="url(#rdNucGlow)">

        <animate attributeName="rx" values="16;20;16" dur="1.2s" repeatCount="indefinite"/>

        <animate attributeName="ry" values="16;20;16" dur="1.2s" repeatCount="indefinite"/>

        <animate attributeName="opacity" values="0.75;1.0;0.75" dur="1.2s" repeatCount="indefinite"/>

      </ellipse>

      <!-- Pulsing outer glow ring -->

      <ellipse cx="126" cy="168" rx="28" ry="28"

               fill="none" stroke="rgba(100,255,60,0)" stroke-width="2">

        <animate attributeName="rx" values="22;36;22" dur="1.2s" repeatCount="indefinite"/>

        <animate attributeName="ry" values="22;36;22" dur="1.2s" repeatCount="indefinite"/>

        <animate attributeName="stroke" values="rgba(100,255,60,0);rgba(100,255,60,0.45);rgba(100,255,60,0)" dur="1.2s" repeatCount="indefinite"/>

      </ellipse>

      <!-- Radiation trefoil symbol on capsule -->

      <g transform="translate(126,168)" opacity="0.70">

        <path d="M0 0 L-5 -9 A10 10 0 0 1 5 -9 Z" fill="rgba(100,255,60,0.8)">

          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>

        </path>

        <path d="M0 0 L9 3 A10 10 0 0 1 4 10 Z" fill="rgba(100,255,60,0.8)" transform="rotate(120)">

          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" begin="0.6s"/>

        </path>

        <path d="M0 0 L9 3 A10 10 0 0 1 4 10 Z" fill="rgba(100,255,60,0.8)" transform="rotate(240)">

          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" begin="1.2s"/>

        </path>

        <circle cx="0" cy="0" r="3" fill="rgba(12,18,24,0.95)"/>

      </g>

      <!-- Source label -->

      <text x="126" y="228" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(100,255,60,.70)">Co-60 / Cs-137</text>

      <text x="126" y="237" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(100,255,60,.50)">γ / α / β SOURCE</text>



      <!-- Radiation arrows flowing RIGHT out of chamber toward vessel -->

      <line x1="178" y1="158" x2="194" y2="158" stroke="rgba(100,255,60,.55)" stroke-width="1.5" stroke-dasharray="4,3">

        <animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="0.8s" repeatCount="indefinite"/>

      </line>

      <polygon points="193,154 200,158 193,162" fill="rgba(100,255,60,.65)">

        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/>

      </polygon>

      <text x="186" y="150" font-family="JetBrains Mono,monospace" font-size="6"

            fill="rgba(100,255,60,.55)" text-anchor="middle">γ / α / β</text>



      <!-- Chamber section label -->

      <text x="126" y="276" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(140,155,175,.60)">LEAD SHIELD</text>

      <text x="126" y="285" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(140,155,175,.45)">COMPARTMENT</text>



      <!-- ══════════════════════════════════════════════

           SECTION B — QUARTZ REACTION VESSEL (center)

           Contains the irradiated water

      ══════════════════════════════════════════════ -->

      <!-- Quartz vessel outer body -->

      <rect x="194" y="108" width="72" height="160" rx="8"

            fill="url(#quartzGrad)" stroke="rgba(180,220,255,.65)" stroke-width="2"/>

      <!-- Vessel rim / neck top ellipse -->

      <ellipse cx="230" cy="108" rx="36" ry="7"

               fill="rgba(195,230,255,.24)" stroke="rgba(200,235,255,.65)" stroke-width="1.5"/>

      <ellipse cx="230" cy="108" rx="30" ry="5.5" fill="rgba(255,255,255,.10)"/>

      <!-- Glass shine strips -->

      <path d="M200 116 L200 262" stroke="rgba(255,255,255,.22)" stroke-width="3" stroke-linecap="round"/>

      <path d="M207 114 L207 200" stroke="rgba(255,255,255,.10)" stroke-width="1.8" stroke-linecap="round"/>

      <path d="M260 116 L260 258" stroke="rgba(255,255,255,.07)" stroke-width="1.5" stroke-linecap="round"/>



      <!-- Water / irradiated liquid inside vessel -->

      <g clip-path="url(#rdVesselClip)">

        <rect id="liquid-rect" x="196" y="185" width="68" height="82"

              fill="rgba(30,90,210,0.35)" opacity="0.92"/>

        <path id="wave-path"

              d="M198 185 Q213 180 230 185 Q247 190 264 185 L264 191 Q247 187 230 191 Q213 195 198 191 Z"

              fill="rgba(50,120,230,.48)"/>

        <!-- Cherenkov radiation glow in water — animated blue shimmer -->

        <ellipse cx="230" cy="210" rx="28" ry="10"

                 fill="url(#cherenkovGrad)" filter="url(#rdSoftGlow)">

          <animate attributeName="opacity" values="0.35;0.90;0.35" dur="1.1s" repeatCount="indefinite"/>

        </ellipse>

        <!-- Radical particles (tiny dots) floating upward -->

        <circle cx="215" cy="220" r="1.5" fill="rgba(180,230,255,.80)" opacity="0">

          <animate attributeName="cy" values="240;185" dur="2.0s" repeatCount="indefinite"/>

          <animate attributeName="opacity" values="0;0.9;0" dur="2.0s" repeatCount="indefinite"/>

        </circle>

        <circle cx="230" cy="230" r="1.2" fill="rgba(160,220,255,.75)" opacity="0">

          <animate attributeName="cy" values="250;190" dur="1.7s" repeatCount="indefinite" begin="0.5s"/>

          <animate attributeName="opacity" values="0;0.85;0" dur="1.7s" repeatCount="indefinite" begin="0.5s"/>

        </circle>

        <circle cx="245" cy="218" r="1.5" fill="rgba(200,240,255,.80)" opacity="0">

          <animate attributeName="cy" values="238;188" dur="2.3s" repeatCount="indefinite" begin="1.0s"/>

          <animate attributeName="opacity" values="0;0.9;0" dur="2.3s" repeatCount="indefinite" begin="1.0s"/>

        </circle>

        <!-- H₂ micro-bubbles rising (slightly larger, white) -->

        <circle cx="220" cy="255" r="2" fill="rgba(220,240,255,.60)" opacity="0">

          <animate attributeName="cy" values="262;185" dur="2.8s" repeatCount="indefinite" begin="0.3s"/>

          <animate attributeName="opacity" values="0;0.7;0" dur="2.8s" repeatCount="indefinite" begin="0.3s"/>

        </circle>

        <circle cx="240" cy="260" r="2.5" fill="rgba(220,240,255,.55)" opacity="0">

          <animate attributeName="cy" values="262;185" dur="3.1s" repeatCount="indefinite" begin="1.4s"/>

          <animate attributeName="opacity" values="0;0.65;0" dur="3.1s" repeatCount="indefinite" begin="1.4s"/>

        </circle>

        <rect id="precipitate" x="196" y="255" width="68" height="0"

              fill="rgba(200,230,255,.6)" opacity="0"/>

        <ellipse id="heat-glow" cx="230" cy="263" rx="32" ry="7"

                 fill="rgba(60,130,255,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#rdVesselClip)"></g>



      <!-- Vessel stopper / septum at top -->

      <rect x="210" y="100" width="40" height="12" rx="4"

            fill="rgba(50,55,65,.88)" stroke="rgba(90,100,115,.6)" stroke-width="1.2"/>

      <rect x="213" y="103" width="34" height="4" rx="1" fill="rgba(255,255,255,.10)"/>



      <!-- Vessel measurement marks -->

      <line x1="264" y1="155" x2="272" y2="155" stroke="rgba(180,220,255,.55)" stroke-width="1"/>

      <line x1="264" y1="195" x2="272" y2="195" stroke="rgba(180,220,255,.55)" stroke-width="1"/>

      <line x1="264" y1="235" x2="272" y2="235" stroke="rgba(180,220,255,.55)" stroke-width="1"/>

      <text x="275" y="158" font-family="JetBrains Mono,monospace" font-size="6.5"

            fill="rgba(180,220,255,.55)">100</text>

      <text x="275" y="198" font-family="JetBrains Mono,monospace" font-size="6.5"

            fill="rgba(180,220,255,.55)">50</text>

      <text x="275" y="238" font-family="JetBrains Mono,monospace" font-size="6.5"

            fill="rgba(180,220,255,.55)">10</text>



      <!-- Quartz vessel label -->

      <text x="230" y="285" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(180,220,255,.60)">QUARTZ VESSEL</text>

      <text x="230" y="294" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(80,160,255,.55)">H₂O + Cherenkov ☢</text>



      <!-- ══════════════════════════════════════════════

           GAS OUTLET TUBES (top of vessel → collection)

           Tube 1: H₂  |  Tube 2: O₂

      ══════════════════════════════════════════════ -->

      <!-- Shared outlet pipe from vessel stopper -->

      <rect x="226" y="72" width="8" height="30" rx="2"

            fill="url(#gastubeGrad)" stroke="rgba(180,220,255,.5)" stroke-width="1.2"/>

      <!-- T-junction -->

      <rect x="290" y="78" width="48" height="6" rx="2"

            fill="url(#rdSteelGrad)" stroke="rgba(160,180,200,.4)" stroke-width="1"/>

      <!-- Horizontal pipe connecting vessel to T -->

      <rect x="230" y="79" width="64" height="5" rx="2"

            fill="url(#gastubeGrad)" stroke="rgba(180,220,255,.45)" stroke-width="1"/>



      <!-- Gas tube H₂ (left of pair) -->

      <rect x="290" y="84" width="26" height="120" rx="5"

            fill="url(#gastubeGrad)" stroke="rgba(180,220,255,.55)" stroke-width="1.5"/>

      <ellipse cx="303" cy="84" rx="13" ry="4"

               fill="rgba(200,235,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <!-- H₂ gas inside tube (pale blue) -->

      <g clip-path="url(#rdGasH2Clip)">

        <rect id="h2-gas-fill" x="291" y="140" width="24" height="62"

              fill="rgba(180,210,255,.35)" opacity="0.85">

          <animate attributeName="height" values="62;72;62" dur="2.2s" repeatCount="indefinite"/>

          <animate attributeName="y" values="140;130;140" dur="2.2s" repeatCount="indefinite"/>

        </rect>

      </g>

      <!-- H₂ tube shine -->

      <rect x="292" y="87" width="4" height="112" rx="1" fill="rgba(255,255,255,.16)"/>

      <text x="303" y="216" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(160,200,255,.80)" font-weight="bold">H₂</text>

      <text x="303" y="225" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(140,180,255,.55)">gas</text>



      <!-- Gas tube O₂ (right of pair) -->

      <rect x="330" y="84" width="26" height="120" rx="5"

            fill="url(#gastubeGrad)" stroke="rgba(180,220,255,.55)" stroke-width="1.5"/>

      <ellipse cx="343" cy="84" rx="13" ry="4"

               fill="rgba(200,235,255,.22)" stroke="rgba(200,235,255,.6)" stroke-width="1"/>

      <!-- O₂ gas inside tube (pale teal) -->

      <g clip-path="url(#rdGasO2Clip)">

        <rect id="o2-gas-fill" x="331" y="156" width="24" height="46"

              fill="rgba(160,230,220,.35)" opacity="0.82">

          <animate attributeName="height" values="46;54;46" dur="3.1s" repeatCount="indefinite"/>

          <animate attributeName="y" values="156;148;156" dur="3.1s" repeatCount="indefinite"/>

        </rect>

      </g>

      <rect x="332" y="87" width="4" height="112" rx="1" fill="rgba(255,255,255,.16)"/>

      <text x="343" y="216" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(140,225,215,.80)" font-weight="bold">O₂</text>

      <text x="343" y="225" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(120,205,195,.55)">gas</text>



      <!-- Gas collection label -->

      <text x="316" y="75" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(180,220,255,.55)">GAS COLLECTION</text>



      <!-- ══════════════════════════════════════════════

           GEIGER COUNTER (right side — radiation detector)

      ══════════════════════════════════════════════ -->

      <!-- Geiger tube housing (cylindrical body) -->

      <rect x="385" y="118" width="48" height="80" rx="6"

            fill="url(#geigerGrad)" stroke="rgba(120,140,160,.5)" stroke-width="1.5"/>

      <rect x="388" y="121" width="8" height="74" rx="2" fill="rgba(255,255,255,.12)"/>

      <!-- Geiger probe end (detection window) -->

      <rect x="385" y="104" width="48" height="18" rx="4"

            fill="rgba(50,58,68,.88)" stroke="rgba(100,120,140,.5)" stroke-width="1"/>

      <ellipse cx="409" cy="104" rx="20" ry="5"

               fill="rgba(80,90,105,.80)" stroke="rgba(120,140,160,.45)" stroke-width="1"/>

      <!-- Mica window (thin sensitive window) -->

      <ellipse cx="409" cy="104" rx="16" ry="3.5" fill="rgba(180,200,220,.18)"/>

      <!-- Wire lead to Geiger from chamber area -->

      <path d="M220 158 Q190 158 190 158 Q190 138 232 130"

            stroke="rgba(120,140,160,.50)" stroke-width="1.2" fill="none" stroke-dasharray="3,3"/>

      <!-- Wire from Geiger body to counter box -->

      <path d="M385 155 L380 155 L380 240 L370 240"

            stroke="rgba(120,140,160,.45)" stroke-width="1.2" fill="none"/>

      <!-- Click indicator (animated pulse on Geiger) -->

      <circle cx="409" cy="158" r="5" fill="rgba(255,60,60,.0)">

        <animate attributeName="r" values="5;12;5" dur="0.7s" repeatCount="indefinite"/>

        <animate attributeName="fill" values="rgba(255,60,60,0);rgba(255,60,60,0.60);rgba(255,60,60,0)" dur="0.7s" repeatCount="indefinite"/>

      </circle>

      <!-- Geiger click LED dot -->

      <circle cx="409" cy="158" r="3" fill="rgba(255,80,80,.75)">

        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.7s" repeatCount="indefinite"/>

      </circle>

      <text x="409" y="208" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(200,215,230,.65)">GEIGER</text>

      <text x="409" y="217" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(180,200,220,.50)">COUNTER</text>



      <!-- ══════════════════════════════════════════════

           CONTROL PANEL (bottom area)

      ══════════════════════════════════════════════ -->

      <!-- Panel body -->

      <rect x="42" y="310" width="370" height="90" rx="8"

            fill="url(#panelGrad)" stroke="rgba(70,85,100,.6)" stroke-width="2"/>

      <rect x="45" y="313" width="364" height="4" rx="2"

            fill="rgba(255,255,255,.06)"/>

      <!-- Panel label strip -->

      <rect x="42" y="310" width="370" height="14" rx="8"

            fill="rgba(30,38,50,.95)" stroke="rgba(70,85,100,.5)" stroke-width="1"/>

      <text x="227" y="321" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(80,200,255,.80)">RADIATION MONITORING + CONTROL PANEL</text>



      <!-- Radiation dose display -->

      <rect x="54" y="330" width="80" height="36" rx="4"

            fill="rgba(8,14,20,.95)" stroke="rgba(80,200,255,.35)" stroke-width="1"/>

      <text x="94" y="344" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(80,200,255,.60)">DOSE RATE</text>

      <text x="94" y="358" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="9" fill="rgba(80,255,160,.90)" font-weight="bold">

        <animate attributeName="textContent" values="1.24;1.31;1.28;1.35;1.24" dur="3s" repeatCount="indefinite"/>

        1.24

      </text>

      <text x="94" y="367" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(80,200,255,.50)">mGy/min</text>



      <!-- Temperature display -->

      <rect x="144" y="330" width="72" height="36" rx="4"

            fill="rgba(8,14,20,.95)" stroke="rgba(255,120,60,.30)" stroke-width="1"/>

      <text x="180" y="344" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(255,120,60,.60)">TEMP. °C</text>

      <text x="180" y="358" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="9" fill="rgba(255,160,80,.90)" font-weight="bold">34.8</text>

      <text x="180" y="367" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(255,120,60,.45)">coolant ON</text>



      <!-- H₂O₂ level display -->

      <rect x="226" y="330" width="72" height="36" rx="4"

            fill="rgba(8,14,20,.95)" stroke="rgba(180,220,255,.28)" stroke-width="1"/>

      <text x="262" y="344" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(180,220,255,.55)">H₂O₂ μM</text>

      <text x="262" y="358" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="9" fill="rgba(160,200,255,.85)" font-weight="bold">0.72</text>

      <text x="262" y="367" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(160,200,255,.45)">G=0.7/100eV</text>



      <!-- Control buttons -->

      <!-- RUN button -->

      <rect x="310" y="330" width="38" height="16" rx="4"

            fill="rgba(16,185,129,.25)" stroke="rgba(16,185,129,.55)" stroke-width="1"/>

      <text x="329" y="341" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(16,185,129,.90)">▶ RUN</text>

      <!-- STOP button -->

      <rect x="310" y="350" width="38" height="16" rx="4"

            fill="rgba(239,68,68,.20)" stroke="rgba(239,68,68,.50)" stroke-width="1"/>

      <text x="329" y="361" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(239,68,68,.85)">■ STOP</text>

      <!-- EMERG. SHUTDOWN button -->

      <rect x="354" y="330" width="52" height="36" rx="4"

            fill="rgba(239,68,68,.18)" stroke="rgba(239,68,68,.60)" stroke-width="1.5"/>

      <text x="380" y="344" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(239,68,68,.85)">EMERG.</text>

      <text x="380" y="354" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(239,68,68,.80)">SHUT-</text>

      <text x="380" y="364" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6" fill="rgba(239,68,68,.85)">DOWN</text>



      <!-- ☢ WARNING badge on chamber -->

      <rect x="76" y="275" width="100" height="18" rx="4"

            fill="rgba(255,220,0,.12)" stroke="rgba(255,220,0,.42)" stroke-width="1"/>

      <text x="126" y="287" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7.5" fill="rgba(255,220,0,.88)">☢ RADIOACTIVE</text>



      <!-- Flow arrows (layout flow indicators) -->

      <!-- Arrow 1: source → water vessel -->

      <text x="186" y="170" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(100,255,60,.45)">↓</text>

      <!-- Arrow 2: water → gas collection -->

      <text x="265" y="105" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(180,220,255,.45)">→</text>

      <!-- Arrow 3: vessel → Geiger -->

      <text x="378" y="158" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(200,215,230,.35)">→</text>



      <!-- Cooling pipe (optional — runs along bottom of vessel) -->

      <path d="M194 260 Q180 260 175 270 Q170 280 175 290 Q180 300 194 300"

            stroke="rgba(80,180,255,.40)" stroke-width="3" fill="none"

            stroke-linecap="round"/>

      <text x="165" y="305" font-family="JetBrains Mono,monospace" font-size="6"

            fill="rgba(80,180,255,.45)" text-anchor="middle">COOL</text>



      <!-- Bottom label -->

      <text x="230" y="438" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7.5" fill="rgba(80,200,255,.40)">WATER RADIOLYSIS CHAMBER — γ/α/β IRRADIATION</text>

    </svg>`,



  thermite_setup:`

    <svg viewBox="0 0 360 430" xmlns="http://www.w3.org/2000/svg" class="beaker-svg">

      <defs>

        <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="rgba(210,185,120,0.85)"/>

          <stop offset="100%" stop-color="rgba(175,145,80,0.95)"/>

        </linearGradient>

        <linearGradient id="crucibleGrad" x1="0" y1="0" x2="1" y2="1">

          <stop offset="0%" stop-color="rgba(90,80,75,0.92)"/>

          <stop offset="50%" stop-color="rgba(130,115,105,0.88)"/>

          <stop offset="100%" stop-color="rgba(70,60,55,0.95)"/>

        </linearGradient>

        <linearGradient id="thermiteGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="rgba(210,210,215,0.80)"/>

          <stop offset="50%" stop-color="rgba(185,60,10,0.85)"/>

          <stop offset="100%" stop-color="rgba(160,45,5,0.90)"/>

        </linearGradient>

        <linearGradient id="tripodMetalGrad" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stop-color="#b8c8d8"/>

          <stop offset="40%" stop-color="#dde8f0"/>

          <stop offset="100%" stop-color="#7a8b9a"/>

        </linearGradient>

        <linearGradient id="mgGrad" x1="0" y1="0" x2="1" y2="0">

          <stop offset="0%" stop-color="rgba(225,235,245,0.9)"/>

          <stop offset="50%" stop-color="rgba(245,248,252,0.95)"/>

          <stop offset="100%" stop-color="rgba(210,220,232,0.85)"/>

        </linearGradient>

        <radialGradient id="moltIronGlow" cx="50%" cy="80%">

          <stop offset="0%" stop-color="rgba(255,160,20,0.90)"/>

          <stop offset="60%" stop-color="rgba(255,80,5,0.40)"/>

          <stop offset="100%" stop-color="rgba(255,40,0,0)"/>

        </radialGradient>

        <radialGradient id="heatAura" cx="50%" cy="100%">

          <stop offset="0%" stop-color="rgba(255,120,10,0.35)"/>

          <stop offset="100%" stop-color="rgba(255,60,0,0)"/>

        </radialGradient>

        <clipPath id="crucibleClip">

          <path d="M138 175 L128 290 Q126 308 180 310 Q234 308 232 290 L222 175 Z"/>

        </clipPath>

        <filter id="thermoGlow">

          <feGaussianBlur stdDeviation="4" result="blur"/>

          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>

        </filter>

        <filter id="moltBlur"><feGaussianBlur stdDeviation="2.5"/></filter>

      </defs>



      <!-- ══ SAND TRAY BASE ══ -->

      <!-- Tray outer box -->

      <rect x="50" y="348" width="260" height="44" rx="6"

            fill="rgba(140,110,60,0.88)" stroke="rgba(100,80,40,0.8)" stroke-width="2"/>

      <!-- Sand surface inside tray -->

      <rect x="56" y="354" width="248" height="32" rx="4" fill="url(#sandGrad)"/>

      <!-- Sand texture bumps -->

      <ellipse cx="90" cy="368" rx="14" ry="4" fill="rgba(220,195,130,0.5)"/>

      <ellipse cx="150" cy="365" rx="18" ry="3.5" fill="rgba(220,195,130,0.45)"/>

      <ellipse cx="220" cy="370" rx="16" ry="4" fill="rgba(215,190,125,0.5)"/>

      <ellipse cx="285" cy="366" rx="13" ry="3" fill="rgba(218,192,128,0.45)"/>

      <!-- Tray label -->

      <text x="180" y="408" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(200,175,110,0.75)">SAND TRAY (Refractory Base)</text>



      <!-- ══ TRIPOD STAND ══ -->

      <!-- Base ring -->

      <ellipse cx="180" cy="348" rx="70" ry="9"

               fill="none" stroke="url(#tripodMetalGrad)" stroke-width="3.5"/>

      <!-- Three legs angling outward to base ring -->

      <line x1="180" y1="285" x2="115" y2="344" stroke="url(#tripodMetalGrad)" stroke-width="4.5"/>

      <line x1="180" y1="285" x2="245" y2="344" stroke="url(#tripodMetalGrad)" stroke-width="4.5"/>

      <line x1="180" y1="285" x2="180" y2="348" stroke="url(#tripodMetalGrad)" stroke-width="4.5"/>

      <!-- Leg shine highlights -->

      <line x1="180" y1="285" x2="116" y2="343" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>

      <line x1="180" y1="285" x2="244" y2="343" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>

      <line x1="180" y1="285" x2="181" y2="347" stroke="rgba(255,255,255,.20)" stroke-width="1.5"/>

      <!-- Ring support (wire gauze ring where crucible sits) -->

      <ellipse cx="180" cy="285" rx="54" ry="8"

               fill="none" stroke="url(#tripodMetalGrad)" stroke-width="3"/>

      <ellipse cx="180" cy="285" rx="54" ry="8" fill="rgba(120,135,150,.14)"/>

      <!-- Gauze grid cross-hatch -->

      <line x1="134" y1="285" x2="226" y2="285" stroke="rgba(180,200,220,.4)" stroke-width="1.2"/>

      <line x1="180" y1="278" x2="180" y2="292" stroke="rgba(180,200,220,.4)" stroke-width="1.2"/>

      <line x1="152" y1="280" x2="152" y2="290" stroke="rgba(180,200,220,.3)" stroke-width="0.8"/>

      <line x1="208" y1="280" x2="208" y2="290" stroke="rgba(180,200,220,.3)" stroke-width="0.8"/>



      <!-- ══ CERAMIC / GRAPHITE CRUCIBLE ══ -->

      <!-- Crucible outer shadow -->

      <ellipse cx="181" cy="313" rx="56" ry="7" fill="rgba(0,0,0,0.22)" filter="url(#moltBlur)"/>

      <!-- Crucible body (tapered trapezoid — wide at top, narrower at bottom with hole) -->

      <path d="M138 175 L128 290 Q126 308 180 310 Q234 308 232 290 L222 175 Z"

            fill="url(#crucibleGrad)" stroke="rgba(80,65,55,0.9)" stroke-width="2"/>

      <!-- Crucible inner wall shading -->

      <path d="M145 178 L136 286 Q134 303 180 305 Q226 303 224 286 L215 178 Z"

            fill="rgba(55,45,40,0.55)" stroke="none"/>

      <!-- Crucible rim (top ellipse) -->

      <ellipse cx="180" cy="175" rx="44" ry="10"

               fill="rgba(110,95,85,0.88)" stroke="rgba(80,65,55,0.9)" stroke-width="2"/>

      <ellipse cx="180" cy="175" rx="38" ry="8" fill="rgba(60,50,44,0.80)"/>

      <!-- Crucible opening inner dark -->

      <ellipse cx="180" cy="175" rx="36" ry="7" fill="rgba(30,22,18,0.90)"/>

      <!-- Small drain hole at bottom of crucible -->

      <ellipse cx="180" cy="307" rx="7" ry="3.5"

               fill="rgba(255,120,10,0.60)" stroke="rgba(80,65,55,0.7)" stroke-width="1"/>

      <!-- Crucible texture lines (ceramic ridges) -->

      <path d="M138 200 Q180 197 222 200" stroke="rgba(255,255,255,.10)" stroke-width="1" fill="none"/>

      <path d="M133 230 Q180 227 227 230" stroke="rgba(255,255,255,.09)" stroke-width="1" fill="none"/>

      <path d="M130 260 Q180 257 230 260" stroke="rgba(255,255,255,.08)" stroke-width="1" fill="none"/>

      <!-- Crucible label -->

      <text x="180" y="158" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(180,160,140,.75)">CERAMIC CRUCIBLE</text>



      <!-- ══ THERMITE MIXTURE INSIDE CRUCIBLE ══ -->

      <g clip-path="url(#crucibleClip)">

        <!-- Thermite powder mix (Fe₂O₃ red + Al silver) -->

        <rect id="liquid-rect" x="128" y="225" width="104" height="82"

              fill="rgba(185,60,10,0.82)" opacity="0.92"/>

        <!-- Mixture surface wave -->

        <path id="wave-path"

              d="M132 225 Q155 220 180 225 Q205 230 228 225 L228 231 Q205 227 180 231 Q155 235 132 231 Z"

              fill="rgba(210,210,215,0.72)"/>

        <!-- Al powder silver glints on top -->

        <ellipse cx="155" cy="226" rx="12" ry="3" fill="rgba(220,228,238,0.55)"/>

        <ellipse cx="200" cy="224" rx="10" ry="2.5" fill="rgba(218,225,235,0.50)"/>

        <ellipse cx="175" cy="222" rx="8" ry="2" fill="rgba(215,222,232,0.45)"/>

        <!-- Precipitate layer (molten iron pool) -->

        <rect id="precipitate" x="128" y="296" width="104" height="0"

              fill="rgba(255,140,20,0.88)" opacity="0"/>

        <!-- Heat glow inside crucible -->

        <ellipse id="heat-glow" cx="180" cy="308" rx="52" ry="8"

                 fill="rgba(255,80,0,0)" opacity="0"/>

      </g>

      <g id="bubbles-group" clip-path="url(#crucibleClip)"></g>



      <!-- ══ MAGNESIUM RIBBON IGNITER ══ -->

      <!-- Mg ribbon — coiled end inside crucible, long straight section going up-right -->

      <!-- Coiled portion inside crucible mouth -->

      <path d="M180 175 Q188 168 192 175 Q196 182 190 185 Q184 188 182 182"

            stroke="url(#mgGrad)" stroke-width="2.8" fill="none"

            stroke-linecap="round" id="mg-coil"/>

      <!-- Straight ribbon running up and to the right, out of crucible -->

      <path d="M182 182 L220 130 L260 72 L290 32"

            stroke="url(#mgGrad)" stroke-width="2.5" fill="none"

            stroke-linecap="round" stroke-linejoin="round"

            stroke-dasharray="6,2" id="mg-ribbon"/>

      <!-- Ribbon cross-section lines (Mg has cross-hatched texture) -->

      <path d="M185 179 L222 128" stroke="rgba(200,215,228,0.45)" stroke-width="1" fill="none"/>

      <!-- Ribbon tip (free end — to be lit) -->

      <ellipse cx="290" cy="32" rx="4" ry="3.5" transform="rotate(-55 290 32)"

               fill="rgba(225,230,240,0.90)" stroke="rgba(190,205,220,0.8)" stroke-width="1"/>

      <!-- Mg ribbon label -->

      <text x="268" y="22" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7" fill="rgba(200,215,228,.75)">Mg RIBBON</text>

      <text x="268" y="31" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="6.5" fill="rgba(200,215,228,.60)">(IGNITER)</text>



      <!-- ══ HEAT / GLOW EFFECTS (activated during reaction) ══ -->

      <!-- Heat shimmer around crucible — starts transparent, JS animates -->

      <ellipse cx="180" cy="240" rx="55" ry="70"

               fill="url(#heatAura)" opacity="0" id="heat-shimmer"/>

      <!-- Molten iron drip below drain hole -->

      <ellipse cx="180" cy="320" rx="6" ry="3.5"

               fill="rgba(255,130,15,0)" id="molt-drip" filter="url(#thermoGlow)"/>



      <!-- ══ INFORMATIONAL LABELS ══ -->

      <text x="58" y="343" font-family="JetBrains Mono,monospace" font-size="6.5"

            fill="rgba(160,175,195,.60)">TRIPOD</text>

      <text x="58" y="351" font-family="JetBrains Mono,monospace" font-size="6.5"

            fill="rgba(160,175,195,.60)">STAND</text>

      <!-- Main label -->

      <text x="180" y="422" text-anchor="middle" font-family="JetBrains Mono,monospace"

            font-size="7.5" fill="rgba(200,175,110,.45)">THERMITE SETUP — CRUCIBLE + TRIPOD + SAND TRAY</text>

    </svg>`

};



const RXN_TYPES=[

  {key:"acid_base",name:"Acid–Base",icon:"⚗️",count:"Titration",cat:"Basic"},

  {key:"redox",name:"Redox",icon:"⚡",count:"KMnO₄ + FeSO₄",cat:"Basic"},

  {key:"precipitation",name:"Precipitation",icon:"🌧️",count:"PbI₂ Formation",cat:"Basic"},

  {key:"combination",name:"Combination",icon:"🔗",count:"Mg + O₂",cat:"Basic"},

  {key:"decomposition",name:"Decomposition",icon:"💥",count:"H₂O₂ Catalytic",cat:"Basic"},

  {key:"single_displacement",name:"Single Displacement",icon:"🔄",count:"Zn + CuSO₄",cat:"Basic"},

  {key:"double_displacement",name:"Double Displacement",icon:"🔁",count:"BaSO₄ Ppt",cat:"Basic"},

  {key:"organic_addition",name:"Electrophilic Addition",icon:"🧪",count:"Br₂ + Alkene",cat:"Organic"},

  {key:"esterification",name:"Esterification",icon:"🌸",count:"Fischer Mechanism",cat:"Organic"},

  {key:"saponification",name:"Saponification",icon:"🫧",count:"Soap Making",cat:"Organic"},

  {key:"electrolysis_water",name:"Electrolysis",icon:"⚡",count:"Water Splitting",cat:"Electrochem"},

  {key:"electroplating",name:"Electroplating",icon:"🪙",count:"Cu on Fe",cat:"Electrochem"},

  {key:"haber",name:"Haber Process",icon:"🏭",count:"NH₃ Industrial",cat:"Industrial"},

  {key:"polymerization",name:"Addition Polymer",icon:"🔗",count:"Polyethylene",cat:"Polymer"},

  {key:"nylon",name:"Condensation Polymer",icon:"🧵",count:"Nylon-6,6",cat:"Polymer"},

  {key:"tollens_silver_mirror",name:"Tollens’ Silver Mirror",icon:"🪞",count:"Aldehyde → Silver Mirror",cat:"Advanced Organic"},

  {key:"grignard_reaction",name:"Grignard Reaction",icon:"🔗",count:"C–C Bond Formation",cat:"Advanced Organic"},

  {key:"nylon_rope_trick",name:"Nylon Rope Trick",icon:"🧵",count:"Interfacial Polymerisation",cat:"Polymer"},

  {key:"photosynthesis",name:"Photosynthesis",icon:"🌿",count:"6CO₂+6H₂O→Glucose+O₂",cat:"Biochemistry"},

  {key:"elephant_toothpaste",name:"Elephant Toothpaste",icon:"🐘",count:"H₂O₂ + KI",cat:"Spectacular"},

  {key:"ferrofluid",name:"Ferrofluid Magnetic",icon:"🧲",count:"Fe₃O₄ Nanoparticles",cat:"Spectacular"},

  {key:"luminol",name:"Luminol Glow",icon:"💙",count:"Chemiluminescence",cat:"Spectacular"},

  {key:"dry_ice",name:"Dry Ice Sublimation",icon:"❄️",count:"CO₂(s)→CO₂(g)",cat:"Spectacular"},

  {key:"liquid_nitrogen",name:"Liquid N₂ Freezing",icon:"🌡️",count:"Cryogenic Freeze",cat:"Spectacular"},

  {key:"iodine_clock",name:"Iodine Clock",icon:"⏱️",count:"⭐⭐⭐⭐⭐ Clock Kinetics",cat:"Spectacular"},

  {key:"belousov_zhabotinsky",name:"Belousov–Zhabotinsky",icon:"🌀",count:"⭐⭐⭐⭐⭐ Oscillating Spirals",cat:"Master's Level"},

  {key:"briggs_rauscher",name:"Briggs–Rauscher",icon:"🌈",count:"⭐⭐⭐⭐⭐ Triple Colour Oscillation",cat:"Master's Level"},

  {key:"uranium_fission",name:"U-235 Nuclear Fission",icon:"☢️",count:"⭐⭐⭐⭐⭐ Nuclear Reaction",cat:"Nuclear"},

  {key:"thermite",name:"Thermite Reaction",icon:"🔥",count:"Fe₂O₃ + Al → 2Fe + Al₂O₃",cat:"Redox"},

  {key:"radiolysis_water",name:"Radiolysis of Water",icon:"☢️",count:"⭐⭐⭐⭐⭐ Nuclear Chemistry",cat:"Nuclear"},

];



const SUGGEST_PROMPTS={

  acid_base:[{i:"fa-flask",t:"Why does phenolphthalein turn pink?"},{i:"fa-graduation-cap",t:"Viva: What is equivalence point?"},{i:"fa-calculator",t:"Calculate molarity from titration"},{i:"fa-atom",t:"What if I use methyl orange?"}],

  redox:[{i:"fa-bolt",t:"What is oxidation state of Mn in KMnO₄?"},{i:"fa-exchange-alt",t:"Balance this redox equation"},{i:"fa-graduation-cap",t:"Viva: Oxidizing vs reducing agent"},{i:"fa-atom",t:"What if basic medium is used?"}],

  precipitation:[{i:"fa-flask",t:"Why is PbI₂ yellow?"},{i:"fa-calculator",t:"What is Ksp of PbI₂?"},{i:"fa-graduation-cap",t:"Viva: Define solubility product"},{i:"fa-atom",t:"What if excess KI is added?"}],

  combination:[{i:"fa-fire",t:"Why does Mg burn white?"},{i:"fa-graduation-cap",t:"Viva: Define combination reaction"},{i:"fa-shield-alt",t:"Safety precautions for burning Mg"},{i:"fa-atom",t:"What if Mg burns in CO₂?"}],

  decomposition:[{i:"fa-flask",t:"How does MnO₂ catalyze H₂O₂?"},{i:"fa-graduation-cap",t:"Viva: What is a catalyst?"},{i:"fa-calculator",t:"Glowing splint test procedure"},{i:"fa-atom",t:"What if temperature doubles?"}],

  single_displacement:[{i:"fa-list",t:"Explain the activity series"},{i:"fa-graduation-cap",t:"Viva: Why Zn displaces Cu?"},{i:"fa-exchange-alt",t:"Explain electron transfer here"},{i:"fa-atom",t:"What if Fe is used instead of Zn?"}],

  double_displacement:[{i:"fa-flask",t:"Why is BaSO₄ insoluble?"},{i:"fa-graduation-cap",t:"Viva: What drives precipitation?"},{i:"fa-calculator",t:"Calculate Ksp of BaSO₄"},{i:"fa-atom",t:"What if CaSO₄ is used instead?"}],

  organic_addition:[{i:"fa-flask",t:"Explain Markovnikov's rule"},{i:"fa-graduation-cap",t:"Viva: Electrophilic addition mechanism"},{i:"fa-atom",t:"What is the bromonium ion?"},{i:"fa-exchange-alt",t:"When is anti-Markovnikov observed?"}],

  esterification:[{i:"fa-flask",t:"Explain Fischer mechanism"},{i:"fa-graduation-cap",t:"Viva: What shifts equilibrium to ester?"},{i:"fa-calculator",t:"How to increase ester yield?"},{i:"fa-atom",t:"What if acid chloride is used?"}],

  saponification:[{i:"fa-flask",t:"Why is saponification irreversible?"},{i:"fa-graduation-cap",t:"Viva: Saponification value definition"},{i:"fa-calculator",t:"Calculate saponification value"},{i:"fa-atom",t:"Hard vs soft soap difference?"}],

  electrolysis_water:[{i:"fa-bolt",t:"Why H₂:O₂ ratio is 2:1?"},{i:"fa-graduation-cap",t:"Viva: Faraday's first law"},{i:"fa-calculator",t:"Calculate mass deposited (Faraday)"},{i:"fa-atom",t:"Why use H₂SO₄ as electrolyte?"}],

  electroplating:[{i:"fa-bolt",t:"What is current density in plating?"},{i:"fa-graduation-cap",t:"Viva: Faraday's second law"},{i:"fa-calculator",t:"Calculate Cu deposited in 1 hour"},{i:"fa-atom",t:"What if anode is inert Pt?"}],

  haber:[{i:"fa-industry",t:"Why 450°C not lower temperature?"},{i:"fa-graduation-cap",t:"Viva: Le Chatelier + Haber"},{i:"fa-calculator",t:"Effect of pressure on yield"},{i:"fa-atom",t:"What if no catalyst is used?"}],

  polymerization:[{i:"fa-flask",t:"Explain initiation-propagation-termination"},{i:"fa-graduation-cap",t:"Viva: LDPE vs HDPE"},{i:"fa-atom",t:"What is degree of polymerization?"},{i:"fa-exchange-alt",t:"Addition vs condensation polymer"}],

  nylon:[{i:"fa-flask",t:"What is nylon-6 vs nylon-6,6?"},{i:"fa-graduation-cap",t:"Viva: Amide bond formation"},{i:"fa-calculator",t:"Step-growth kinetics"},{i:"fa-atom",t:"Why is nylon so strong?"}],

  photosynthesis:[{i:"fa-leaf",t:"Explain the light reactions in detail"},{i:"fa-graduation-cap",t:"Viva: What is the Calvin cycle?"},{i:"fa-atom",t:"Why is chlorophyll green?"},{i:"fa-calculator",t:"How many ATP does photosynthesis produce per glucose?"}],

  elephant_toothpaste:[{i:"fa-flask",t:"How does KI catalyze H₂O₂ decomposition?"},{i:"fa-graduation-cap",t:"Viva: What is activation energy?"},{i:"fa-fire",t:"Why is the foam warm/exothermic?"},{i:"fa-atom",t:"What if MnO₂ is used instead of KI?"}],

  ferrofluid:[{i:"fa-magnet",t:"What is Rosensweig instability?"},{i:"fa-graduation-cap",t:"Viva: Magnetic dipole alignment"},{i:"fa-atom",t:"Why are the spikes sharp not rounded?"},{i:"fa-flask",t:"What role does oleic acid play?"}],

  luminol:[{i:"fa-flask",t:"Explain electron excitation in luminol"},{i:"fa-graduation-cap",t:"Viva: Chemiluminescence vs fluorescence"},{i:"fa-atom",t:"Why is blue light emitted at 425nm?"},{i:"fa-search",t:"How is luminol used in forensics?"}],

  dry_ice:[{i:"fa-flask",t:"Why does CO₂ sublime at 1 atm?"},{i:"fa-graduation-cap",t:"Viva: What is a triple point?"},{i:"fa-atom",t:"Why does fog flow downward?"},{i:"fa-calculator",t:"Calculate sublimation enthalpy of CO₂"}],

  liquid_nitrogen:[{i:"fa-flask",t:"Explain the Leidenfrost effect"},{i:"fa-graduation-cap",t:"Viva: Why does LN₂ freeze things so fast?"},{i:"fa-atom",t:"What happens to biological cells when frozen?"},{i:"fa-calculator",t:"Calculate heat removed during flash freezing"}],

  iodine_clock:[{i:"fa-clock",t:"Explain the induction period in the Iodine Clock"},{i:"fa-graduation-cap",t:"Viva: How does thiosulfate act as a chemical timer?"},{i:"fa-atom",t:"What if Na₂S₂O₃ concentration is doubled?"},{i:"fa-calculator",t:"How does temperature affect the clock reaction rate?"}],

  belousov_zhabotinsky:[{i:"fa-circle-notch",t:"Explain the FKN mechanism of BZ oscillations"},{i:"fa-graduation-cap",t:"Viva: What are reaction-diffusion Turing patterns?"},{i:"fa-atom",t:"What if malonic acid concentration is halved?"},{i:"fa-wave-square",t:"How are BZ spirals related to cardiac arrhythmias?"}],

  briggs_rauscher:[{i:"fa-palette",t:"Explain the three colour phases in Briggs–Rauscher"},{i:"fa-graduation-cap",t:"Viva: What is the role of Mn²⁺ catalyst in BR?"},{i:"fa-atom",t:"Difference between BR and BZ oscillating reactions?"},{i:"fa-wave-square",t:"How does H₂O₂ concentration affect oscillation period?"}],

  uranium_fission:[{i:"fa-radiation",t:"Explain the liquid-drop model of nuclear fission"},{i:"fa-graduation-cap",t:"Viva: What is nuclear binding energy per nucleon?"},{i:"fa-atom",t:"What is the difference between fission and fusion?"},{i:"fa-calculator",t:"Calculate energy from mass defect using E=mc²"}],

  tollens_silver_mirror:[{i:"fa-mirror",t:"Why does Tollens’ test give a silver mirror?"},{i:"fa-graduation-cap",t:"Viva: Why do ketones not react with Tollens’ reagent?"},{i:"fa-atom",t:"What is the role of NH₃ in Tollens’ reagent?"},{i:"fa-flask",t:"How is Tollens’ reaction used in industrial mirror making?"}],

  grignard_reaction:[{i:"fa-flask",t:"Why must conditions be strictly anhydrous?"},{i:"fa-graduation-cap",t:"Viva: What is the mechanism of Grignard addition?"},{i:"fa-atom",t:"What products form with ketone vs aldehyde vs ester?"},{i:"fa-exchange-alt",t:"How does NH₄Cl workup hydrolyse the alkoxide?"}],

  nylon_rope_trick:[{i:"fa-flask",t:"Why does polymerisation occur only at the interface?"},{i:"fa-graduation-cap",t:"Viva: Step-growth vs chain-growth polymerisation"},{i:"fa-atom",t:"What role does NaOH play in the nylon rope trick?"},{i:"fa-link",t:"Explain H-bonding and nylon's mechanical strength"}],

  thermite:[{i:"fa-fire",t:"Why can't water extinguish thermite?"},{i:"fa-graduation-cap",t:"Viva: Why does Al reduce Fe₂O₃ but not vice versa?"},{i:"fa-bolt",t:"Calculate ΔG° for the thermite reaction"},{i:"fa-industry",t:"How is thermite used in rail welding?"}],

  radiolysis_water:[{i:"fa-radiation",t:"What is Cherenkov radiation?"},{i:"fa-graduation-cap",t:"Viva: Define G-value in radiation chemistry"},{i:"fa-atom",t:"Why is radiolysis dangerous in nuclear reactors?"},{i:"fa-flask",t:"How does alpha radiolysis differ from gamma radiolysis?"}],

};



/* ══════════════════════════════════════════════════════

   STATE

══════════════════════════════════════════════════════ */

let state={

  currentReaction:'acid_base',selectedChems:[],status:'idle',

  ph:7.0,volume:0,maxVolume:25,temp:25.0,step:0,score:0,

  running:false,dropInterval:null,bubbleInterval:null,

  vivaMode:false,whatIfMode:false,experimentHistory:[],

  currentColor:'rgba(6,182,212,0.2)'

};

let chatHistory=[],msgCount=0;



/* ══════════════════════════════════════════════════════

   INIT

══════════════════════════════════════════════════════ */

function initLab(){

  buildReactionSelector();

  buildExperimentSelect();

  loadReaction('acid_base');

  renderSuggestChips('acid_base');

  initWelcome();

}



function buildExperimentSelect(){

  const sel=document.getElementById('experiment-select');

  sel.innerHTML='';

  RXN_TYPES.forEach(r=>{

    const o=document.createElement('option');

    o.value=r.key;o.textContent=r.icon+' '+r.name;

    sel.appendChild(o);

  });

}



function loadReaction(key){

  const rxn=REACTIONS[key];if(!rxn)return;

  state.currentReaction=key;

  state.selectedChems=[];

  document.getElementById('experiment-select').value=key;

  // Render hardware

  document.getElementById('beaker-scene').innerHTML=HARDWARE[rxn.hardware]||HARDWARE.beaker;

  // Set burette liquid to match the burette reagent color

  if(rxn.hardware==='titration'){

    const buretteReagents=['hcl','kmno4'];

    const buretteChem=rxn.chemicals.find(c=>buretteReagents.includes(c.id));

    const bl=document.getElementById('burette-liquid');

    if(bl&&buretteChem) bl.setAttribute('fill', buretteChem.color.replace(/[\d.]+\)$/,'0.65)'));

  }

  buildChemicals(rxn);

  buildStepGuide(rxn);

  updatePrediction(rxn);

  updateSelectedCount();

  updateCurrentAction(rxn,0);

  const el=document.getElementById('ctx-rxn-name');

  if(el)el.textContent=rxn.name;

  // Show harmful-reaction disclaimer for dangerous experiments

  const HARMFUL_REACTIONS=['uranium_fission','belousov_zhabotinsky','briggs_rauscher','liquid_nitrogen','dry_ice','luminol','ferrofluid','thermite','radiolysis_water'];

  const disc=document.getElementById('harmful-disclaimer');

  if(disc)disc.classList.toggle('show', HARMFUL_REACTIONS.includes(key));

  // Reset color detection badge

  document.getElementById('color-detection-badge').classList.remove('show');

  updateRunBtnState();

}



function buildChemicals(rxn){

  const row=document.getElementById('chemicals-row');row.innerHTML='';

  // Radioactive chemical IDs for U-235 fission and radiolysis

  const radioactiveIds=['u235','neutron_thermal','gamma_source','alpha_source','beta_source'];

  rxn.chemicals.forEach(c=>{

    const el=document.createElement('div');

    const isRadioactive=radioactiveIds.includes(c.id);

    el.className='chem-bottle'+(isRadioactive?' radioactive-chem':'');

    el.id='bottle_'+c.id;el.title=c.desc||c.name;

    el.onclick=()=>selectChem(c.id);

    const bottleStyle=isRadioactive?'border-color:rgba(80,255,80,.6);box-shadow:0 0 10px rgba(50,255,80,.4);':'';

    const fillStyle=isRadioactive?`background:${c.color};box-shadow:inset 0 0 10px rgba(80,255,60,.4);`:`background:${c.color}`;

    el.innerHTML=`<div class="bottle-body" id="bottlebody_${c.id}" style="${bottleStyle}"><div class="bottle-fill" style="${fillStyle}"></div><div><div class="bottle-label">${c.label}</div><div class="bottle-conc">${c.unit}</div></div></div><div class="bottle-name">${c.name}</div>`;

    row.appendChild(el);

  });

}



function buildMechSteps(rxn){

  // New mechanism tracker (red=pending, green=done)

  const list=document.getElementById('mech-steps-list');

  if(!list)return;

  list.innerHTML='';

  rxn.steps.forEach((s,i)=>{

    const item=document.createElement('div');

    item.className='mech-step-item ms-pending';

    item.id='msstep_'+i;

    item.title='Click to see step info, advantages & disadvantages';

    item.onclick=()=>openStepModal(i);

    item.innerHTML=`

      <div class="ms-num" id="msnum_${i}">${i+1}</div>

      <div class="ms-label">

        <div class="ms-label-title" id="mstitle_${i}">Step ${i+1}: ${s.title}</div>

        <div class="ms-label-sub" id="mssub_${i}">${s.action||s.desc.substring(0,40)}</div>

      </div>

      <div class="ms-status-icon" id="msicon_${i}">🔴</div>

      <div class="ms-progress-bar" id="mspbar_${i}" style="width:0%"></div>`;

    list.appendChild(item);

  });

  // Also keep old guide for compatibility

  const container=document.getElementById('step-guide-content');

  if(container){container.innerHTML='';

  rxn.steps.forEach((s,i)=>{

    const div=document.createElement('div');div.className='sg-step';div.id='sgstep_'+i;

    div.title='Click to see step details';

    div.onclick=()=>openStepModal(i);

    div.innerHTML=`<div class="sg-dot" id="sgdot_${i}" title="Click for details">${i+1}</div><div class="sg-text"><strong>${s.title}</strong>${s.desc}</div>`;

    container.appendChild(div);

  });}

  setMechStepState(0);

}



function buildStepGuide(rxn){ buildMechSteps(rxn); updateIdleBanner(); }



/* ══════════════════════════════════════════════════════

   IDLE STEPS PANEL — banner + state sync

══════════════════════════════════════════════════════ */

function buildIdleSteps(rxn){

  // No-op: the center step guide (buildMechSteps) handles the clickable steps.

  // Just refresh the banner.

  updateIdleBanner();

}



function toggleIdleSteps(){

  // Legacy no-op (panel moved to center step guide)

}



function updateIdleBanner(){

  const banner=document.getElementById('idle-steps-banner');

  if(!banner)return;

  const isIdle=!state.running&&state.selectedChems.length===0;

  banner.style.display=isIdle?'flex':'none';

}



function updateIdleStepsState(){

  updateIdleBanner();

}



function setMechStepState(completedCount){

  const rxn=REACTIONS[state.currentReaction];

  const total=rxn.steps.length;

  rxn.steps.forEach((_,i)=>{

    const item=document.getElementById('msstep_'+i);

    const numEl=document.getElementById('msnum_'+i);

    const iconEl=document.getElementById('msicon_'+i);

    const pbar=document.getElementById('mspbar_'+i);

    if(!item)return;

    if(i<completedCount){

      // Done — green

      item.className='mech-step-item ms-done';

      if(numEl)numEl.innerHTML='<i class="fas fa-check" style="font-size:9px"></i>';

      if(iconEl)iconEl.textContent='🟢';

      if(pbar)pbar.style.width='100%';

    } else if(i===completedCount){

      // Active — cyan pulse

      item.className='mech-step-item ms-active';

      if(numEl)numEl.textContent=i+1;

      if(iconEl)iconEl.textContent='▶';

      if(pbar)pbar.style.width='0%';

    } else {

      // Pending — red

      item.className='mech-step-item ms-pending';

      if(numEl)numEl.textContent=i+1;

      if(iconEl)iconEl.textContent='🔴';

      if(pbar)pbar.style.width='0%';

    }

  });

}



function setStepActive(idx){

  const rxn=REACTIONS[state.currentReaction];

  setMechStepState(idx);

  updateIdleStepsState();

  // Also update legacy progress steps

  rxn.steps.forEach((_,i)=>{

    const dot=document.getElementById('sgdot_'+i);

    const step=document.getElementById('sgstep_'+i);

    if(!dot||!step)return;

    if(i<idx){dot.className='sg-dot done';dot.innerHTML='<i class="fas fa-check" style="font-size:7px"></i>';step.className='sg-step done-step';}

    else if(i===idx){dot.className='sg-dot active';dot.innerHTML=i+1;step.className='sg-step active-step';}

    else{dot.className='sg-dot';dot.innerHTML=i+1;step.className='sg-step';}

  });

  for(let i=1;i<=4;i++){

    const ps=document.getElementById('ps'+i);const pl=document.getElementById('pl'+i);

    if(!ps)continue;

    if(i<=idx){ps.className='ps-num done';if(pl)pl.className='ps-line done';}

    else if(i===idx+1){ps.className='ps-num active';}

    else{ps.className='ps-num';if(pl)pl.className='ps-line';}

  }

}



function updateCurrentAction(rxn,idx){

  const step=rxn.steps[idx];

  if(step){document.getElementById('current-action-text').textContent=step.action||step.desc;}

}

function updatePrediction(rxn){

  document.getElementById('pred-text').textContent=rxn.prediction;

  document.getElementById('pred-result-val').textContent=rxn.expectedResult;

}

function updateSelectedCount(){document.getElementById('selected-count').textContent=state.selectedChems.length+' selected';}



/* ══════════════════════════════════════════════════════

   COLOR DETECTION

══════════════════════════════════════════════════════ */

function detectColor(chem){

  const colorMap={

    // Named colors

    'rgba(139,92,246,':'Purple (KMnO₄)',

    'rgba(6,182,212,':'Cyan-Blue (CuSO₄)',

    'rgba(234,179,8,':'Golden Yellow (PbI₂)',

    'rgba(210,100,20,':'Orange-Brown (Br₂)',

    'rgba(59,130,246,':'Blue',

    'rgba(16,185,129,':'Green',

    'rgba(245,158,11,':'Amber-Yellow',

    'rgba(236,72,153,':'Pink',

    'rgba(200,120,50,':'Orange-Copper',

  };

  let detected='Colorless';

  for(const [key,val] of Object.entries(colorMap)){

    if(chem.color.startsWith(key)){detected=val;break;}

  }

  const isColorless=detected==='Colorless'||(chem.color.includes('220,220,220')||chem.color.includes('200,230,255')||chem.color.includes('200,200,200')||parseFloat(chem.color.match(/[\d.]+\)$/)?.[0])<=0.25);

  const badge=document.getElementById('color-detection-badge');

  const dot=document.getElementById('detect-dot');

  const text=document.getElementById('detect-text');

  if(isColorless){

    dot.style.background='rgba(220,220,220,0.3)';dot.style.border='1px solid rgba(255,255,255,0.3)';

    text.textContent='Colorless solution — transparent';

  } else {

    const colorCSS=chem.color;dot.style.background=colorCSS;

    text.textContent='Color detected: '+detected;

  }

  badge.classList.add('show');

  setTimeout(()=>badge.classList.remove('show'),4000);

  return isColorless;

}



/* ══════════════════════════════════════════════════════

   SELECT CHEMICAL

══════════════════════════════════════════════════════ */

function selectChem(id){

  if(state.running)return;

  const rxn=REACTIONS[state.currentReaction];

  const chem=rxn.chemicals.find(c=>c.id===id);if(!chem)return;

  const idx=state.selectedChems.indexOf(id);

  if(idx===-1){

    state.selectedChems.push(id);

    document.getElementById('bottle_'+id)?.classList.add('selected');

    // ── POURING ANIMATION ──

    triggerPouringAnimation(chem, rxn);

    // Delay liquid update so pouring animates first

    setTimeout(()=>{

      const fraction=state.selectedChems.length/rxn.chemicals.length;

      state.currentColor=lerpColor(rxn.liquidStart,chem.color,0.4);

      // For colorless chemicals: start white/opaque, then fade to transparent

      const isColorless=detectColor(chem);

      if(isColorless){

        updateBeakerLiquid('rgba(240,245,255,0.85)',fraction);

        setTimeout(()=>{

          updateBeakerLiquid('rgba(220,235,255,0.35)',fraction);

          setTimeout(()=>updateBeakerLiquid(state.currentColor,fraction),800);

        },600);

      } else {

        updateBeakerLiquid(state.currentColor,fraction);

      }

      state.volume=Math.min((state.selectedChems.length/rxn.chemicals.length)*state.maxVolume,state.maxVolume);

      updateVolumeBar();

      updatePHDisplay(state.ph+(Math.random()*.35-.17));

      const stepIdx=Math.min(state.selectedChems.length-1,rxn.steps.length-1);

      setStepActive(stepIdx);updateCurrentAction(rxn,Math.min(stepIdx+1,rxn.steps.length-1));

      updateSelectedCount();

      if(isColorless){startBriefBubbles();}

      aiAddChemMsg(chem,isColorless);

      updateRunBtnState();

      updateIdleStepsState();

      showToast('✅ Added '+chem.name+' to apparatus');

    }, 900);

  } else {

    state.selectedChems.splice(idx,1);

    document.getElementById('bottle_'+id)?.classList.remove('selected');

    updateSelectedCount();

    showToast('Removed '+chem.name);

    updateRunBtnState();

    updateIdleStepsState();

  }

}



/* ══════════════════════════════════════════════════════

   POURING ANIMATION

══════════════════════════════════════════════════════ */

function triggerPouringAnimation(chem, rxn, sceneId){

  sceneId = sceneId || 'beaker-scene';

  const scene=document.getElementById(sceneId);if(!scene)return;

  const svg=scene.querySelector('svg');if(!svg)return;

  const hw=rxn.hardware;

  const chemColor=chem.color;

  const isColorless=parseFloat(chemColor.match(/[\d.]+\)$/)?.[0])<=0.25||chemColor.includes('220,220,220')||chemColor.includes('200,230,255');

  const pourColor=isColorless?'rgba(240,245,255,0.75)':chemColor;



  if(hw==='titration'){

    // Only the titration reagents come from the burette

    // acid_base: HCl is in burette; redox: KMnO4 is in burette

    const buretteReagents = ['hcl','kmno4'];

    const isBuretteReagent = buretteReagents.includes(chem.id);

    if(isBuretteReagent){

      // Burette tip centre: cx=270, tip bottom y=251.  Flask neck opening: cx=255, y=262

      const drop=scene.querySelector('#burette-drop');

      const buretteLiq=scene.querySelector('#burette-liquid');

      const waveStream=scene.querySelector('#pour-wave-stream');

      const waveStream2=scene.querySelector('#pour-wave-stream2');

      const flaskSplash=scene.querySelector('#flask-splash-wave');

      const mouthRipple=scene.querySelector('#flask-mouth-ripple');

      if(drop){

        drop.setAttribute('fill',pourColor);

        drop.setAttribute('opacity','1');

        if(buretteLiq) buretteLiq.setAttribute('fill',pourColor);

        // Enhanced multi-strand wavy stream

        if(waveStream){

          waveStream.setAttribute('stroke',pourColor);

          waveStream.setAttribute('opacity','0.92');

          waveStream.setAttribute('d',`M270 251 C267 255 273 257 270 262`);

        }

        if(waveStream2){

          waveStream2.setAttribute('stroke',pourColor);

          waveStream2.setAttribute('opacity','0.45');

          waveStream2.setAttribute('d',`M271 252 C274 255 268 258 271 263`);

        }

        // Drop starts just below tip (cy=255), falls with sinusoidal drift toward flask centre x=255

        let cy=255, cx=270, speed=0, frame=0, phase=0;

        const destX=255, startX=270;

        // Animated wave on the stream paths

        let wavePhaseStream=0;

        const animDrop=()=>{

          speed+=1.6; cy+=speed;

          phase+=0.38; wavePhaseStream+=0.22;

          const prog=Math.min((cy-255)/14,1);

          cx=startX+(destX-startX)*prog + Math.sin(phase)*2.8;

          drop.setAttribute('cy',cy); drop.setAttribute('cx',cx);

          const stretch=Math.min(1+speed*0.07,1.7);

          drop.setAttribute('ry',(3.5*stretch).toFixed(1));

          drop.setAttribute('rx',(3/(stretch)).toFixed(1));

          // Animate stream wave oscillation

          if(waveStream){

            const amp=2+Math.sin(wavePhaseStream)*1.5;

            waveStream.setAttribute('d',`M270 251 C${267+amp} 255 ${273-amp} 258 270 262`);

          }

          if(waveStream2){

            const amp2=1.5+Math.cos(wavePhaseStream)*1;

            waveStream2.setAttribute('d',`M271 252 C${274-amp2} 255 ${268+amp2} 258 271 262`);

          }

          if(cy<460&&frame<90){frame++;requestAnimationFrame(animDrop);}

          else{

            drop.setAttribute('opacity','0');

            drop.setAttribute('cy','255'); drop.setAttribute('cx','270');

            drop.setAttribute('ry','5'); drop.setAttribute('rx','3.5');

            if(waveStream){waveStream.setAttribute('opacity','0');}

            if(waveStream2){waveStream2.setAttribute('opacity','0');}

            // Mouth ripple animation

            if(mouthRipple){

              mouthRipple.setAttribute('stroke',pourColor);

              mouthRipple.setAttribute('opacity','0.85');

              let rr=0,rop=0.85;

              const animRipple=()=>{rr+=2;rop-=0.07;

                mouthRipple.setAttribute('rx',rr);mouthRipple.setAttribute('ry',rr*0.35);

                mouthRipple.setAttribute('opacity',Math.max(0,rop));

                if(rop>0)requestAnimationFrame(animRipple);else{mouthRipple.setAttribute('rx','0');mouthRipple.setAttribute('ry','0');}

              };animRipple();

            }

            // Wall-bounce wavy splash inside flask

            if(flaskSplash) _animateFlaskWallBounce(flaskSplash, pourColor);

          }

        };

        animDrop();

        if(buretteLiq){

          const curH=parseFloat(buretteLiq.getAttribute('height')||'180');

          const newH=Math.max(18,curH-20);

          buretteLiq.setAttribute('height',newH);

        }

      }

    } else {

      // Non-burette reagents pour in from a bottle (on the right side of scene)

      _animatePourBottle(svg, pourColor, chemColor, hw);

    }

  } else {

    // For beaker/heating: show bottle tipping + stream

    _animatePourBottle(svg, pourColor, chemColor, hw);

  }

}



/* ══════════════════════════════════════════════════════

   ENHANCED POUR ANIMATION

   Pours FROM measuring cylinder spout → INTO main instrument

   Shows wavy stream in flight + wall-bounce wave on impact

══════════════════════════════════════════════════════ */

function _animatePourBottle(svg, pourColor, chemColor, hw){

  const old=svg.getElementById('anim-overlay');if(old)old.remove();

  const ns='http://www.w3.org/2000/svg';

  const g=document.createElementNS(ns,'g');

  g.setAttribute('id','anim-overlay');

  svg.appendChild(g);



  /* ── Per-hardware geometry ─────────────────────────────

     src  = measuring cylinder spout (top-right corner of cyl)

     dest = opening of main instrument

     wallL/wallR = inner wall x-coords of main instrument

     liquidY = approx y of liquid surface inside main instrument

     impactSide = which side the liquid hits first ('left'|'right'|'center')

  ────────────────────────────────────────────────────── */

  let src, dest, wallL, wallR, liquidY, impactSide;

  if(hw==='beaker'){

    src  = {x:58, y:62};            // left-side cyl spout top-right corner

    dest = {x:180, y:62};           // beaker rim center top

    wallL= 107; wallR= 253;

    liquidY= 282; impactSide='left'; // stream enters near left wall

  } else if(hw==='conical_flask'){

    src  = {x:302, y:60};           // right-side cyl spout top-left corner

    dest = {x:180, y:56};           // neck rim of conical flask

    wallL= 90; wallR= 270;

    liquidY= 295; impactSide='right';

  } else if(hw==='heating'){

    // No measuring cylinder in heating setup — use right-side bottle approach

    src  = {x:240, y:30};         // imaginary bottle above right

    dest = {x:150, y:52};         // tube rim top center

    wallL= 114; wallR= 186;

    liquidY= 194; impactSide='right';

  } else if(hw==='round_flask'){

    src  = {x:302, y:55};

    dest = {x:150, y:80};

    wallL= 80; wallR= 220;

    liquidY= 200; impactSide='right';

  } else if(hw==='titration'){

    // Non-burette bottle pours from right area into flask

    src  = {x:380, y:50};

    dest = {x:255, y:262};

    wallL= 218; wallR= 292;

    liquidY= 390; impactSide='right';

  } else if(hw==='thermite_setup'){

    // No measuring cylinder — powder pours from a bottle above-right into crucible mouth

    src  = {x:260, y:30};       // bottle above right

    dest = {x:180, y:175};      // crucible mouth rim

    wallL= 145; wallR= 215;

    liquidY= 225; impactSide='center';

  } else {

    src  = {x:302, y:62};

    dest = {x:180, y:68};

    wallL= 100; wallR= 260;

    liquidY= 282; impactSide='right';

  }



  /* ── Measuring cylinder tilt animation ─────────────── */

  // The cylinder tilts ~35° toward the main instrument

  // We animate a separate "tilt group" that pivots around the spout

  const cylG = document.createElementNS(ns,'g');

  cylG.setAttribute('id','cyl-tilt-g');

  // Draw a simplified measuring cylinder on the right side (matches SVG)

  const cylBody = document.createElementNS(ns,'rect');

  cylBody.setAttribute('x','312'); cylBody.setAttribute('y','68');

  cylBody.setAttribute('width','34'); cylBody.setAttribute('height','180');

  cylBody.setAttribute('rx','5');

  cylBody.setAttribute('fill','rgba(180,220,255,0.22)');

  cylBody.setAttribute('stroke','rgba(200,235,255,0.6)');

  cylBody.setAttribute('stroke-width','1.5');

  const cylLiq = document.createElementNS(ns,'rect');

  cylLiq.setAttribute('x','313'); cylLiq.setAttribute('y','140');

  cylLiq.setAttribute('width','32'); cylLiq.setAttribute('height','108');

  cylLiq.setAttribute('rx','2'); cylLiq.setAttribute('fill',pourColor);

  cylLiq.setAttribute('opacity','0.85');

  const cylRim = document.createElementNS(ns,'ellipse');

  cylRim.setAttribute('cx','329'); cylRim.setAttribute('cy','68');

  cylRim.setAttribute('rx','20'); cylRim.setAttribute('ry','5.5');

  cylRim.setAttribute('fill','rgba(200,235,255,0.22)');

  cylRim.setAttribute('stroke','rgba(200,235,255,0.6)');

  cylRim.setAttribute('stroke-width','1.5');

  // Shine strip

  const cylShine = document.createElementNS(ns,'rect');

  cylShine.setAttribute('x','313'); cylShine.setAttribute('y','70');

  cylShine.setAttribute('width','5'); cylShine.setAttribute('height','170');

  cylShine.setAttribute('rx','2'); cylShine.setAttribute('fill','rgba(255,255,255,0.18)');



  // Only show tilt cylinder if layout has one (not heating or thermite_setup)

  const hasCyl = hw!=='heating' && hw!=='thermite_setup';

  if(hasCyl){

    cylG.appendChild(cylBody);

    cylG.appendChild(cylLiq);

    cylG.appendChild(cylShine);

    cylG.appendChild(cylRim);

    g.appendChild(cylG);

  }



  /* ── Stream path ──────────────────────────────────────── */

  // Main stream — thick, curved

  const stream = document.createElementNS(ns,'path');

  stream.setAttribute('fill','none');

  stream.setAttribute('stroke',pourColor);

  stream.setAttribute('stroke-width','5');

  stream.setAttribute('stroke-linecap','round');

  stream.setAttribute('opacity','0');

  g.appendChild(stream);

  // Secondary thin stream (gives twisted-rope look)

  const stream2 = document.createElementNS(ns,'path');

  stream2.setAttribute('fill','none');

  stream2.setAttribute('stroke',pourColor);

  stream2.setAttribute('stroke-width','2');

  stream2.setAttribute('stroke-linecap','round');

  stream2.setAttribute('opacity','0');

  g.appendChild(stream2);

  // Falling droplets along stream

  const dropCount = 5;

  const streamDrops = [];

  for(let i=0;i<dropCount;i++){

    const d=document.createElementNS(ns,'ellipse');

    d.setAttribute('rx','2.5'); d.setAttribute('ry','4');

    d.setAttribute('fill',pourColor); d.setAttribute('opacity','0');

    g.appendChild(d); streamDrops.push(d);

  }



  /* ── Impact wall-bounce waves (3 arcs that bounce off walls) ── */

  // Wave 1: hits near the left or right wall, sweeps to center

  const wave1 = document.createElementNS(ns,'path');

  wave1.setAttribute('fill','none');

  wave1.setAttribute('stroke',pourColor);

  wave1.setAttribute('stroke-width','3');

  wave1.setAttribute('stroke-linecap','round');

  wave1.setAttribute('opacity','0');

  g.appendChild(wave1);

  // Wave 2: reflected from opposite wall

  const wave2 = document.createElementNS(ns,'path');

  wave2.setAttribute('fill','none');

  wave2.setAttribute('stroke',pourColor);

  wave2.setAttribute('stroke-width','2.5');

  wave2.setAttribute('stroke-linecap','round');

  wave2.setAttribute('opacity','0');

  g.appendChild(wave2);

  // Wave 3: dampened center wave

  const wave3 = document.createElementNS(ns,'path');

  wave3.setAttribute('fill','none');

  wave3.setAttribute('stroke',pourColor);

  wave3.setAttribute('stroke-width','2');

  wave3.setAttribute('stroke-linecap','round');

  wave3.setAttribute('opacity','0');

  g.appendChild(wave3);

  // Ripple circle at impact point

  const ripple = document.createElementNS(ns,'ellipse');

  ripple.setAttribute('fill','none');

  ripple.setAttribute('stroke',pourColor);

  ripple.setAttribute('stroke-width','2');

  ripple.setAttribute('opacity','0');

  g.appendChild(ripple);

  // Splash droplets at impact

  const splashG = document.createElementNS(ns,'g');

  splashG.setAttribute('opacity','0');

  g.appendChild(splashG);

  const numSplash = 8;

  const splashDots = [];

  for(let i=0;i<numSplash;i++){

    const sd=document.createElementNS(ns,'circle');

    sd.setAttribute('r',(1.5+Math.random()*2).toString());

    sd.setAttribute('fill',pourColor);

    splashG.appendChild(sd); splashDots.push(sd);

  }



  /* ── Physics helpers ──────────────────────────────────── */

  // Impact point = where stream hits liquid surface near chosen wall

  const impX = impactSide==='left'  ? wallL + 12 :

               impactSide==='right' ? wallR - 12 : (wallL+wallR)/2;

  const impY = liquidY;

  // Opposite wall from impact

  const bounceX = impactSide==='left' ? wallR : wallL;



  /* ── Tilt pivot: right-side cylinder pivots from its base (cx=329, cy=378) ── */

  const pivotX = 329, pivotY = 378;

  // spout at top-left of right cylinder (312, 68) → offset from pivot

  const spoutOffX = src.x - pivotX; // -17

  const spoutOffY = src.y - pivotY; // -310



  /* ── Animation state machine ─────────────────────────── */

  let t=0, phase='tilt', maxTilt=38; // positive = tilt left toward main instrument

  const FPS = 14;

  let currentTilt = 0;

  let streamPhase = 0; // continuous phase counter for wave oscillation



  const anim = setInterval(()=>{

    t += FPS;

    streamPhase += 0.045;



    /* PHASE 1 — TILT cylinder toward main instrument */

    if(phase==='tilt' && t < 500){

      currentTilt = (t/500) * maxTilt;

      if(hasCyl){

        const rad = currentTilt * Math.PI/180;

        // Rotate around pivot

        const cosR=Math.cos(rad), sinR=Math.sin(rad);

        // Translate so pivot stays fixed

        const tx = pivotX*(1-cosR)+pivotY*sinR;

        const ty = pivotX*(-sinR)+pivotY*(1-cosR);

        cylG.setAttribute('transform',`rotate(${currentTilt} ${pivotX} ${pivotY})`);

      }

      // As cylinder tilts, update the src point (spout moves)

      const rad = currentTilt*Math.PI/180;

      src.x = pivotX + (spoutOffX*Math.cos(rad) - spoutOffY*Math.sin(rad));

      src.y = pivotY + (spoutOffX*Math.sin(rad) + spoutOffY*Math.cos(rad));



    } else if(phase==='tilt'){

      phase='stream'; t=0;

      stream.setAttribute('opacity','0.92');

      stream2.setAttribute('opacity','0.45');

      // Show stream droplets

      streamDrops.forEach(d=>{d.setAttribute('opacity','0.8');});

    }



    /* PHASE 2 — STREAM flowing from cylinder spout to main instrument */

    else if(phase==='stream' && t < 1600){

      const prog = t/1600;

      // Keep cylinder at max tilt

      if(hasCyl) cylG.setAttribute('transform',`rotate(${maxTilt} ${pivotX} ${pivotY})`);

      // Liquid level in cylinder drops

      if(hasCyl){

        const newH = Math.max(10, 108 - prog*80);

        cylLiq.setAttribute('height', newH.toString());

        cylLiq.setAttribute('y', (248-newH).toString());

      }



      // Stream: bezier from spout → impact point on liquid surface

      // Natural parabolic arc with sinusoidal oscillation (real pour physics)

      const waveAmp = 3 + prog * 3;

      const waveFreq = 0.032;

      // Control point 1: slightly above and toward dest horizontally

      const cp1x = src.x + (impX - src.x)*0.35 + Math.sin(streamPhase)*waveAmp;

      const cp1y = src.y + (impY - src.y)*0.15 - 18; // arc upward slightly

      // Control point 2: near destination, gravity pulling down

      const cp2x = src.x + (impX - src.x)*0.75 + Math.sin(streamPhase+1.6)*waveAmp*0.7;

      const cp2y = src.y + (impY - src.y)*0.82;



      const d1 = `M${src.x.toFixed(1)} ${src.y.toFixed(1)} C${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${impX} ${impY}`;

      stream.setAttribute('d', d1);

      // Stream narrows then widens (surface tension + gravity)

      const sw = 2.5 + prog*2.5 + Math.sin(streamPhase*2)*0.5;

      stream.setAttribute('stroke-width', sw.toFixed(1));

      stream.setAttribute('opacity', (0.80 + Math.sin(streamPhase)*0.12).toFixed(2));



      // Secondary stream slightly offset (twisted-rope look)

      const cp1x2 = src.x + (impX - src.x)*0.35 - Math.sin(streamPhase)*waveAmp*0.8;

      const cp1y2 = cp1y + 2;

      const cp2x2 = cp2x - Math.sin(streamPhase+1.6)*waveAmp*0.5;

      const cp2y2 = cp2y + 2;

      stream2.setAttribute('d',`M${(src.x+1).toFixed(1)} ${src.y.toFixed(1)} C${cp1x2.toFixed(1)} ${cp1y2.toFixed(1)} ${cp2x2.toFixed(1)} ${cp2y2.toFixed(1)} ${(impX+2)} ${impY}`);

      stream2.setAttribute('opacity','0.38');



      // Animate 5 droplets falling along the stream arc at staggered positions

      streamDrops.forEach((d,i)=>{

        const pos = ((streamPhase*0.5 + i*0.22) % 1.0); // 0..1 along stream

        const bx1 = src.x + (impX-src.x)*pos;

        const by1 = _bezierY(src.y, cp1y, cp2y, impY, pos) + Math.sin(streamPhase+i)*2;

        d.setAttribute('cx', bx1.toFixed(1));

        d.setAttribute('cy', by1.toFixed(1));

        d.setAttribute('ry', (2+pos*2.5).toFixed(1)); // teardrop grows as it falls

        d.setAttribute('rx', (1.5/(1+pos)).toFixed(1));

        d.setAttribute('opacity', (0.7 - pos*0.3).toFixed(2));

      });



    } else if(phase==='stream'){

      // Stream done → show impact

      phase='impact'; t=0;

      stream.setAttribute('opacity','0.7');

      stream2.setAttribute('opacity','0.3');

      streamDrops.forEach(d=>d.setAttribute('opacity','0'));

      splashG.setAttribute('opacity','1');

      // Position splash dots around impact point

      splashDots.forEach((sd,i)=>{

        const a = (i/numSplash)*Math.PI*2;

        const r = 4+Math.random()*8;

        sd.setAttribute('cx',(impX+Math.cos(a)*r).toFixed(1));

        sd.setAttribute('cy',(impY+Math.sin(a)*r*0.45).toFixed(1));

      });

    }



    /* PHASE 3 — IMPACT: splash + wall-bounce waves */

    else if(phase==='impact' && t < 900){

      const prog = t/900;

      // Ripple circle expanding from impact

      const rr = prog*18;

      ripple.setAttribute('cx', impX.toString());

      ripple.setAttribute('cy', impY.toString());

      ripple.setAttribute('rx', rr.toFixed(1));

      ripple.setAttribute('ry', (rr*0.35).toFixed(1));

      ripple.setAttribute('opacity', Math.max(0,0.9-prog*0.95).toFixed(2));



      // Splash droplets flying upward and fading

      splashDots.forEach((sd,i)=>{

        const a = (i/numSplash)*Math.PI*2;

        const r = 4 + i*2 + prog*14;

        sd.setAttribute('cx',(impX+Math.cos(a)*r).toFixed(1));

        sd.setAttribute('cy',(impY+Math.sin(a)*r*0.45 - prog*16).toFixed(1));

        sd.setAttribute('opacity',(Math.max(0,0.85-prog*0.9)).toFixed(2));

      });



      // Wave 1: primary surge from impact point toward opposite wall

      // Starts at impX, sweeps out to bounceX, amplitude decreasing

      const w1prog = Math.min(prog*2.0, 1.0); // faster

      const w1x = impX + (bounceX - impX)*w1prog;

      const w1amp = 12 * (1 - prog*0.7);

      if(w1prog > 0.02){

        wave1.setAttribute('d',

          `M${impX} ${impY} Q${impX+(w1x-impX)*0.5} ${impY - w1amp} ${w1x} ${impY + w1amp*0.3}`

        );

        wave1.setAttribute('opacity', Math.max(0, 0.95 - prog*0.8).toFixed(2));

        wave1.setAttribute('stroke-width', (3 - prog*1.5).toFixed(1));

      }



      // Wave 2: reflected wave bouncing back from opposite wall

      const w2start = 0.45; // starts after wave1 hits opposite wall

      if(prog > w2start){

        const w2prog = Math.min((prog-w2start)/0.55, 1.0);

        const w2x = bounceX + (impX - bounceX)*w2prog;

        const w2amp = 9 * (1-(prog-w2start)*0.9);

        wave2.setAttribute('d',

          `M${bounceX} ${impY + 3} Q${bounceX+(w2x-bounceX)*0.5} ${impY - w2amp} ${w2x} ${impY + w2amp*0.2}`

        );

        wave2.setAttribute('opacity', Math.max(0, 0.7 - (prog-w2start)*1.2).toFixed(2));

        wave2.setAttribute('stroke-width', (2.5 - (prog-w2start)*1.8).toFixed(1));

      }



      // Wave 3: center dampened interference wave

      const w3start = 0.6;

      if(prog > w3start){

        const w3prog = (prog-w3start)/0.4;

        const ctr = (impX+bounceX)/2;

        const w3amp = 6*(1-w3prog);

        wave3.setAttribute('d',

          `M${impX} ${impY+5} Q${ctr} ${impY - w3amp} ${bounceX} ${impY+5}`

        );

        wave3.setAttribute('opacity', Math.max(0, 0.5-w3prog*0.55).toFixed(2));

        wave3.setAttribute('stroke-width', '1.8');

      }



      // Keep a thin stream still flowing during impact phase

      stream.setAttribute('opacity', Math.max(0, 0.7-prog*0.7).toFixed(2));

      stream2.setAttribute('opacity', Math.max(0, 0.3-prog*0.35).toFixed(2));



    } else if(phase==='impact'){

      phase='retract'; t=0;

      // Clear waves and stream

      [stream,stream2,wave1,wave2,wave3,ripple].forEach(el=>{

        el.setAttribute('opacity','0');

      });

      splashG.setAttribute('opacity','0');

      streamDrops.forEach(d=>d.setAttribute('opacity','0'));

    }



    /* PHASE 4 — RETRACT cylinder back upright */

    else if(phase==='retract' && t < 450){

      const prog = t/450;

      currentTilt = maxTilt*(1-prog);

      if(hasCyl) cylG.setAttribute('transform',`rotate(${currentTilt} ${pivotX} ${pivotY})`);

    } else if(phase==='retract'){

      clearInterval(anim);

      g.remove();

    }



  }, FPS);

}



/* Cubic bezier y-value at parameter t */

function _bezierY(y0,y1,y2,y3,t){

  const u=1-t;

  return u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3;

}



function startBriefBubbles(){

  let count=0;const interval=setInterval(()=>{addBubble();count++;if(count>15)clearInterval(interval);},150);

}



/* Enhanced flask wall-bounce wave animation — titration flask interior

   Flask body: left wall x≈200, right wall x≈310, liquid surface y≈380

   Drop impacts near center, waves bounce left and right walls */

function _animateFlaskWallBounce(pathEl, color){

  if(!pathEl)return;

  const svg = pathEl.closest('svg') || document.querySelector('#beaker-scene svg');

  if(!svg) return;

  const ns='http://www.w3.org/2000/svg';



  // Impact centre (where drop hits liquid surface in titration flask)

  const impX=255, impY=382;

  const wallL=205, wallR=308;



  // Wave 1: primary — impact → left wall

  pathEl.setAttribute('stroke',color);

  pathEl.setAttribute('stroke-linecap','round');

  pathEl.setAttribute('opacity','0');



  // Create extra wave elements dynamically

  const wave2 = document.createElementNS(ns,'path');

  wave2.setAttribute('fill','none');wave2.setAttribute('stroke',color);

  wave2.setAttribute('stroke-width','2');wave2.setAttribute('stroke-linecap','round');

  wave2.setAttribute('opacity','0');

  svg.appendChild(wave2);

  const wave3 = document.createElementNS(ns,'path');

  wave3.setAttribute('fill','none');wave3.setAttribute('stroke',color);

  wave3.setAttribute('stroke-width','1.5');wave3.setAttribute('stroke-linecap','round');

  wave3.setAttribute('opacity','0');

  svg.appendChild(wave3);

  const ripple = document.createElementNS(ns,'ellipse');

  ripple.setAttribute('cx',impX.toString());ripple.setAttribute('cy',impY.toString());

  ripple.setAttribute('rx','0');ripple.setAttribute('ry','0');

  ripple.setAttribute('fill','none');ripple.setAttribute('stroke',color);

  ripple.setAttribute('stroke-width','1.8');ripple.setAttribute('opacity','0');

  svg.appendChild(ripple);

  // Splash mini-drops

  const splashEls=[];

  for(let i=0;i<7;i++){

    const sd=document.createElementNS(ns,'circle');

    const a=(i/7)*Math.PI;

    sd.setAttribute('cx',(impX+Math.cos(a)*6).toFixed(1));

    sd.setAttribute('cy',(impY+Math.sin(a)*3-2).toFixed(1));

    sd.setAttribute('r',(1.2+Math.random()*1.5).toFixed(1));

    sd.setAttribute('fill',color); sd.setAttribute('opacity','0');

    svg.appendChild(sd); splashEls.push(sd);

  }



  let prog=0;

  const step=0.018;

  const animWave=()=>{

    prog+=step;

    if(prog>1){

      // Cleanup

      [pathEl,wave2,wave3,ripple,...splashEls].forEach(el=>{

        try{if(el.parentNode)el.parentNode.removeChild(el);}catch(e){}

      });

      // Restore pathEl defaults

      try{

        pathEl.setAttribute('opacity','0');

        pathEl.setAttribute('stroke','rgba(6,182,212,0)');

      }catch(e){}

      return;

    }



    // Ripple circle expanding from impact

    const rr = prog * 22;

    ripple.setAttribute('rx', rr.toFixed(1));

    ripple.setAttribute('ry', (rr*0.32).toFixed(1));

    ripple.setAttribute('opacity', Math.max(0,0.85-prog*0.9).toFixed(2));



    // Splash drops

    splashEls.forEach((sd,i)=>{

      const a=(i/7)*Math.PI;

      const r = 6+i*1.5+prog*18;

      sd.setAttribute('cx',(impX+Math.cos(a)*r).toFixed(1));

      sd.setAttribute('cy',(impY+Math.sin(a)*r*0.4 - prog*14).toFixed(1));

      sd.setAttribute('opacity',Math.max(0,0.8-prog*0.85).toFixed(2));

    });



    // Wave1: impact → left wall (sweeps leftward)

    const w1p = Math.min(prog*2.2, 1.0);

    const w1x = impX + (wallL - impX)*w1p;

    const w1amp = 11*(1-prog*0.75);

    pathEl.setAttribute('d',`M${impX} ${impY} Q${impX+(w1x-impX)*0.5} ${impY-w1amp} ${w1x} ${impY+w1amp*0.25}`);

    pathEl.setAttribute('stroke-width',(3-prog*1.8).toFixed(1));

    pathEl.setAttribute('opacity',Math.max(0,0.9-prog*0.85).toFixed(2));



    // Wave 2: simultaneous rightward surge

    const w2p = Math.min(prog*2.2, 1.0);

    const w2x = impX + (wallR - impX)*w2p;

    const w2amp = 9*(1-prog*0.75);

    wave2.setAttribute('d',`M${impX} ${impY} Q${impX+(w2x-impX)*0.5} ${impY-w2amp} ${w2x} ${impY+w2amp*0.22}`);

    wave2.setAttribute('stroke-width',(2.5-prog*1.4).toFixed(1));

    wave2.setAttribute('opacity',Math.max(0,0.75-prog*0.82).toFixed(2));



    // Wave 3: reflected — bounces back from left wall toward center, starts at 0.45

    if(prog > 0.45){

      const w3p = Math.min((prog-0.45)/0.55, 1.0);

      const w3x = wallL + (impX - wallL)*w3p;

      const w3amp = 7*(1-w3p);

      wave3.setAttribute('d',`M${wallL} ${impY+3} Q${wallL+(w3x-wallL)*0.5} ${impY-w3amp} ${w3x} ${impY+w3amp*0.2}`);

      wave3.setAttribute('opacity',Math.max(0,0.55-(prog-0.45)*0.65).toFixed(2));

      wave3.setAttribute('stroke-width','1.5');

    }



    requestAnimationFrame(animWave);

  };

  requestAnimationFrame(animWave);

}



function aiAddChemMsg(chem,isColorless){

  const rxn=REACTIONS[state.currentReaction];

  const remaining=rxn.chemicals.length-state.selectedChems.length;

  let msg=`**Added: ${chem.name}** (${chem.conc})\n\n${chem.desc}\n\n`;

  if(isColorless){

    msg+=`🔍 **Color Detection:** This solution is **colorless/transparent**.\n`;

  } else {

    const colorStr=chem.color;

    msg+=`🎨 **Color Detection:** The solution shows color from ${chem.name}.\n`;

  }

  if(remaining>0){msg+=`\n⏭️ ${remaining} more reagent${remaining>1?'s':''} needed before running.`;}

  else{msg+=`\n✅ All reagents added! Click **Run Reaction** to proceed.`;}

  addAIMsg(msg,true);

}



/* ══════════════════════════════════════════════════════

   BEAKER LIQUID

══════════════════════════════════════════════════════ */

function updateBeakerLiquid(color,fraction){

  const rect=document.getElementById('liquid-rect');

  const wave=document.getElementById('wave-path');

  if(!rect)return;

  rect.setAttribute('fill',color);

  if(wave)wave.setAttribute('fill',color.replace(/[\d.]+\)$/,m=>Math.min(parseFloat(m)+0.15,0.9)+')'));

  // Animate liquid level

  const scene=document.getElementById('beaker-scene');

  if(!scene)return;

  const svg=scene.querySelector('svg');if(!svg)return;

  const vb=svg.getAttribute('viewBox')?.split(' ');if(!vb)return;

  const H=parseFloat(vb[3])||340;

  const bottom=H-50;const liquidH=Math.max(10,fraction*(H-130));

  const y=bottom-liquidH;

  rect.setAttribute('y',y);rect.setAttribute('height',liquidH+30);

  if(wave){

    const wY=y;

    wave.setAttribute('d',`M${parseFloat(vb[0]||0)+5} ${wY} Q${(parseFloat(vb[2]||300)*.33)} ${wY-4} ${parseFloat(vb[2]||300)/2} ${wY} Q${parseFloat(vb[2]||300)*.67} ${wY+4} ${parseFloat(vb[2]||300)-10} ${wY} L${parseFloat(vb[2]||300)-10} ${wY+5} Q${parseFloat(vb[2]||300)*.67} ${wY+1} ${parseFloat(vb[2]||300)/2} ${wY+5} Q${parseFloat(vb[2]||300)*.33} ${wY+9} ${parseFloat(vb[0]||0)+5} ${wY+5} Z`);

  }

}



function resetBeakerLiquid(){

  const rect=document.getElementById('liquid-rect');if(!rect)return;

  rect.setAttribute('fill','rgba(6,182,212,0.12)');rect.setAttribute('y','999');rect.setAttribute('height','0');

  const ppt=document.getElementById('precipitate');if(ppt){ppt.setAttribute('height','0');ppt.setAttribute('opacity','0');}

  const hg=document.getElementById('heat-glow');if(hg)hg.setAttribute('opacity','0');

}



/* ══════════════════════════════════════════════════════

   RUN REACTION

══════════════════════════════════════════════════════ */

function runReaction(){

  if(state.running)return;

  const rxn=REACTIONS[state.currentReaction];

  const totalChems=rxn.chemicals.length;

  const selectedCount=state.selectedChems.length;

  // Enforce: ALL 4 steps must be completed (all chemicals added)

  if(selectedCount<totalChems){

    const missing=totalChems-selectedCount;

    // Show partial-steps warning and inject what-if into chat

    showPartialStepWarning(rxn,selectedCount,totalChems);

    return;

  }

  state.running=true;

  document.getElementById('run-btn').disabled=true;

  setStatus('running');setStepActive(2);

  // Animate mechanism steps progress bars during run

  const rxnStepCount=rxn.steps.length;

  let mechAnimStep=0;

  const mechStepInterval=setInterval(()=>{

    if(mechAnimStep<rxnStepCount){

      const pbar=document.getElementById('mspbar_'+mechAnimStep);

      if(pbar){

        let w=0;

        const fill=setInterval(()=>{w=Math.min(w+5,100);pbar.style.width=w+'%';if(w>=100){clearInterval(fill);setMechStepState(mechAnimStep+1);mechAnimStep++;}},30);

      } else {mechAnimStep++;}

    } else {clearInterval(mechStepInterval);}

  },1500);

  const phTarget=Math.max(0,Math.min(14,rxn.finalPH));

  const tempTarget=Math.max(20,rxn.finalTemp||30);

  const phStart=state.ph;

  const tempStart=25.0;

  let step=0,totalSteps=50;

  const colorStart=state.currentColor;

  const colorEnd=rxn.liquidEnd;

  // Start animations

  if(rxn.hardware==='titration')startDropAnimation();

  if(rxn.bubbles){state.bubbleInterval=setInterval(addBubble,180);}

  if(rxn.heat){

    const hg=document.getElementById('heat-glow');if(hg){hg.setAttribute('fill','rgba(255,120,0,0.35)');hg.setAttribute('opacity','1');}

    const hs=document.getElementById('heat-shimmer');if(hs){hs.setAttribute('fill','rgba(255,160,30,0.25)');hs.setAttribute('opacity','1');}

    spawnSmoke();

    // Show steam wisps for heating reactions

    _activateSteam();

  }

  // Combustion / exothermic special effects

  const rxnKey=state.currentReaction;

  if(rxnKey==='combination'||rxnKey==='elephant_toothpaste'||rxnKey==='decomposition'){

    spawnFoamEffect();

  }

  if(rxnKey==='combination'){

    spawnSparkEffect();

    spawnWaterVapourEffect();

  }

  if(rxnKey==='dry_ice'||rxnKey==='liquid_nitrogen'){

    spawnFogEffect();

  }

  // ── Iodine Clock: hold colorless → sudden deep blue-black flash ──

  if(rxnKey==='iodine_clock'){

    // Keep solution clear for the induction period (first 70% of animation)

    // then flash to deep blue-black instantly to simulate the clock

    const clockDelay=Math.round(totalSteps*0.72)*60; // ~70% through

    setTimeout(()=>{

      // Spawn a burst of dark-blue "shock" sparks to dramatise the switch

      const scene=document.getElementById('beaker-scene');

      if(scene){

        for(let i=0;i<18;i++){

          setTimeout(()=>{

            const s=document.createElement('div');

            const angle=Math.random()*360;

            const dist=30+Math.random()*60;

            s.className='spark';

            s.style.cssText=`left:50%;top:55%;background:rgba(30,10,80,0.9);width:5px;height:5px;border-radius:50%;--dx:${Math.cos(angle*Math.PI/180)*dist}px;--dy:${Math.sin(angle*Math.PI/180)*dist}px`;

            scene.appendChild(s);

            setTimeout(()=>s.remove(),700);

          },i*25);

        }

      }

      // Also immediately jump the beaker colour for visual shock

      updateBeakerLiquid('rgba(10,5,40,0.92)',0.95);

      const cp=document.getElementById('color-preview');

      if(cp){cp.style.background='rgba(10,5,40,0.92)';cp.textContent='Deep Blue-Black (I₂·Starch)';}

      showToast('⏱️ Clock triggered! Na₂S₂O₃ exhausted → I₂ + Starch = Blue-Black!',3500);

    },clockDelay);

  }

  document.getElementById('rxn-status-label').className='status-label running';

  document.getElementById('rxn-status-label').textContent='Running…';

  document.getElementById('rxn-status-sub').textContent='Reaction in progress';

  // Reaction interval

  const interval=setInterval(()=>{

    step++;const t=easeInOut(step/totalSteps);

    state.ph=Math.max(0,Math.min(14,phStart+(phTarget-phStart)*t));

    state.temp=Math.max(20,Math.min(500,tempStart+(tempTarget-tempStart)*t));

    state.volume=Math.min(state.maxVolume*(0.3+t*0.7),state.maxVolume);

    updatePHDisplay(state.ph);updateVolumeBar();

    document.getElementById('temp-value').textContent=state.temp.toFixed(1);

    document.getElementById('temp-bar').style.width=Math.min((state.temp/150)*100,100)+'%';

    const col=gradientColor(colorStart,colorEnd,t);

    updateBeakerLiquid(col,0.38+t*0.36);

    document.getElementById('color-preview').style.background=col;

    if(rxn.precipitate&&t>0.5){

      const ppt=document.getElementById('precipitate');if(ppt){

        const pptH=(t-0.5)*40;

        ppt.setAttribute('y',parseFloat(ppt.parentElement.closest('clipPath')?.id?300:270)-pptH);

        ppt.setAttribute('height',pptH);

        ppt.setAttribute('fill',colorEnd.replace(/[\d.]+\)$/,'0.8)'));

        ppt.setAttribute('opacity',Math.min((t-0.5)*2.5,1));

      }

    }

    if(step>=totalSteps){

      clearInterval(interval);state.running=false;

      document.getElementById('run-btn').disabled=false;

      if(state.dropInterval){clearInterval(state.dropInterval);state.dropInterval=null;const drop=document.getElementById('burette-drop');if(drop)drop.setAttribute('opacity','0');const ws=document.getElementById('pour-wave-stream');if(ws)ws.setAttribute('opacity','0');}

      if(state.bubbleInterval){clearInterval(state.bubbleInterval);state.bubbleInterval=null;}

      const hg=document.getElementById('heat-glow');if(hg)hg.setAttribute('opacity','0');

      finishReaction(rxn,phTarget,tempTarget);

    }

  },60);

}



/* ══════════════════════════════════════════════════════

   STEP PROTOCOL MODAL

══════════════════════════════════════════════════════ */



// ── Per-reaction, per-step advantages and disadvantages ────────────────────

const STEP_ADV_DISADV={

  acid_base:[

    {adv:["Precise volume control via burette","Reproducible measurements","Clear endpoint detection"],disadv:["Air bubbles cause false readings","Must level eyes with meniscus","Glassware errors accumulate"]},

    {adv:["Accurate analyte volume via pipette","NaOH is strong base — complete reaction","Easy to measure"],disadv:["NaOH absorbs CO₂ from air — standardize fresh","Skin corrosive — must use pipette filler","Must avoid contamination"]},

    {adv:["Visual endpoint — no instruments needed","Sharp color change at pH 8.2","Economical indicator"],disadv:["Not suitable in CO₂-rich environment","Color blind users cannot use","Fails in turbid/colored solutions"]},

    {adv:["Dropwise addition = precise endpoint","Accurate molarity calculation","Swirling ensures complete mixing"],disadv:["Overshoot endpoint loses accuracy","Fatigue during repeated titrations","Environmental factors affect endpoint clarity"]}

  ],

  redox:[

    {adv:["KMnO₄ self-indicating — no separate indicator","Purple color highly visible","Versatile oxidant in acidic medium"],disadv:["Attacks rubber — must use glass burette","Degrades in light — store in dark bottle","Concentrated solution stains and corrodes"]},

    {adv:["Fe²⁺ quantitative source for titration","Solution relatively stable in acid","High molarity allows small volumes"],disadv:["Oxidizes to Fe³⁺ in air — prepare fresh","Solution must be kept acidified","Interferes if other metal ions present"]},

    {adv:["Provides H⁺ essential for Mn²⁺ formation","Prevents MnO₂ precipitation","Stabilizes Fe²⁺ against aerial oxidation"],disadv:["Corrosive — handle with care","Excess acid interferes near endpoint","Wrong acid (HCl) oxidizes by KMnO₄ — use only H₂SO₄"]},

    {adv:["Self-indicating reaction — simple setup","Accurate redox stoichiometry","Endpoint highly visible — faint permanent pink"],disadv:["Drop by drop addition is tedious","Temperature affects endpoint sharpness","Endpoint fades on standing — must record immediately"]}

  ],

  precipitation:[

    {adv:["Clear colorless starting point","Easy to observe precipitation","Pb²⁺ in large excess — complete reaction"],disadv:["Lead nitrate is toxic — hazardous waste disposal required","Heavy metal contamination risk","Requires careful handling and protective gloves"]},

    {adv:["KI provides stoichiometric I⁻","Golden yellow PbI₂ highly visible","Excess I⁻ improves precipitate formation"],disadv:["Excess KI dissolves PbI₂ — use controlled amount","KI slowly oxidizes to I₂ in air","Large excess affects Ksp calculations"]},

    {adv:["Visual confirmation of complete precipitation","Observation confirms product formed","Stirring increases particle size"],disadv:["PbI₂ slightly soluble in hot water","Small crystallites may not settle clearly","Colloidal suspension possible in dilute conditions"]},

    {adv:["Filtration separates solid cleanly","Washing removes impurity ions","Dried precipitate can be weighed for yield"],disadv:["Loss of precipitate on filter paper","Hot water wash dissolves some PbI₂","Drying must be thorough or mass is inaccurate"]}

  ],

  default:[

    {adv:["Establishes correct reaction medium","Sets initial conditions precisely","Prevents unwanted side reactions"],disadv:["Error in first step propagates","Concentration must be accurately prepared","Impurities may affect subsequent steps"]},

    {adv:["Adds key reaction partner","Initiates the main chemical change","Stoichiometric control is possible"],disadv:["Order of addition matters — reversing can be hazardous","Local concentration excess possible","Must ensure complete mixing"]},

    {adv:["Drives or observes the main reaction","Provides evidence of chemical change","Critical for quantitative analysis"],disadv:["Incomplete step gives false observations","May require precise timing","Difficult to reverse once started"]},

    {adv:["Completes the reaction sequence","Allows final observations and data recording","Yields quantitative result"],disadv:["Final step errors cannot be corrected","Overreaction possible","Product may be unstable — measure quickly"]}

  ]

};



// ── Chemical SVG illustrations for each step ──────────────────────────────

function getChemSVG(chem,color){

  const c=color||'rgba(6,182,212,0.5)';

  const border=color?color.replace(/[\d.]+\)$/,'0.8)'):'rgba(6,182,212,0.8)';

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="step-chem-svg">

    <defs>

      <linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="${c}" stop-opacity="0.15"/>

        <stop offset="100%" stop-color="${c}" stop-opacity="0.5"/>

      </linearGradient>

    </defs>

    <!-- Bottle shape -->

    <path d="M35 20 L35 35 L22 60 L22 82 Q22 88 28 88 L72 88 Q78 88 78 82 L78 60 L65 35 L65 20 Z" fill="url(#bgrad)" stroke="${border}" stroke-width="1.5"/>

    <rect x="33" y="13" width="34" height="10" rx="3" fill="${c}" opacity="0.4" stroke="${border}" stroke-width="1"/>

    <rect x="40" y="8" width="20" height="8" rx="2" fill="${c}" opacity="0.3" stroke="${border}" stroke-width="1"/>

    <!-- Liquid in bottle -->

    <clipPath id="bclip"><path d="M35 20 L35 35 L22 60 L22 82 Q22 88 28 88 L72 88 Q78 88 78 82 L78 60 L65 35 L65 20 Z"/></clipPath>

    <rect x="22" y="62" width="56" height="28" fill="${c}" opacity="0.6" clip-path="url(#bclip)"/>

    <!-- Label line -->

    <rect x="32" y="66" width="36" height="10" rx="2" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>

    <!-- Shine -->

    <path d="M28 38 L28 70" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>

  </svg>`;

}



// ── Per-reaction, per-step mechanism data (why + what-if) ──────────────────

const REACTION_STEP_PROTOCOLS={

  acid_base:[

    {why:"HCl (0.1M) is the titrant — it must fill the burette first so that you can deliver it dropwise and record precise volume readings. Air bubbles in the burette give false readings. The initial burette reading is your reference point for calculating moles of HCl used.",whatif:"If the burette is not filled or contains air bubbles, your volume reading will be inaccurate. This introduces a systematic error in calculating the molarity of NaOH, and your titration result (normality factor) will be wrong."},

    {why:"25 mL of NaOH (0.1M) is the analyte — it is placed in the conical flask because it is the known-volume solution being neutralised. Using a pipette ensures exact volume transfer, which is critical for accurate molarity calculations.",whatif:"If you skip adding NaOH or use an incorrect volume, there is no analyte to neutralise. The titration has no chemical basis — HCl would simply flow into empty water with no endpoint to detect."},

    {why:"Phenolphthalein is added after NaOH because it only indicates colour change when the solution transitions from basic to neutral. Adding it in the alkaline NaOH solution causes it to turn pink — this is your 'start' colour. It is colourless in acid and pink in base (pH > 8.2).",whatif:"Without the indicator, you cannot detect the endpoint visually. The neutralisation reaction still occurs chemically, but you have no signal to stop the titration. You will either over-titrate or under-titrate, making the experiment useless."},

    {why:"HCl is added dropwise to allow precise control near the endpoint. Each drop shifts the pH — near equivalence, a single drop changes pH from ~10 to ~4. Slow addition and swirling ensures complete mixing before the next drop, giving a sharp, reproducible endpoint.",whatif:"If you run HCl too fast, you overshoot the endpoint (pink → colourless → acidic overshoot). The volume recorded will be too high, giving a falsely low molarity for NaOH. The entire experiment must be repeated."}

  ],

  redox:[

    {why:"KMnO₄ (0.02M) goes in the burette because it is the oxidising titrant. KMnO₄ is a self-indicator — it is deep purple and turns colourless when reduced. It must be in the burette to control dropwise addition. KMnO₄ attacks rubber; use a glass burette.",whatif:"If KMnO₄ is placed in the flask instead of the burette, you lose control of addition rate and cannot determine the volume of oxidant used. You also risk corrosion of rubber fittings."},

    {why:"FeSO₄ (0.5M, ferrous sulphate) is the reductant — it provides Fe²⁺ ions that get oxidised to Fe³⁺ by KMnO₄. It must be in the conical flask with H₂SO₄ to create the correct acidic ionic environment before the titrant is added.",whatif:"If FeSO₄ is omitted, there are no Fe²⁺ ions to reduce KMnO₄. The titration has no chemical reaction — KMnO₄ stays purple indefinitely and you cannot find an endpoint."},

    {why:"Dilute H₂SO₄ provides the acidic medium required for KMnO₄ to function as a strong oxidant. In acidic medium: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O. Without H⁺, MnO₄⁻ is reduced to MnO₂ (brown solid) instead of Mn²⁺ (colourless), ruining the endpoint.",whatif:"Without H₂SO₄, KMnO₄ forms brown MnO₂ precipitate instead of colourless Mn²⁺. The endpoint becomes a murky brown sludge — impossible to detect. The reaction is also incomplete and non-stoichiometric."},

    {why:"KMnO₄ is added dropwise so each portion reacts with Fe²⁺ before the next drop is added. The purple colour decolorises instantly as long as Fe²⁺ is present. At the endpoint, one extra drop gives a permanent faint pink — all Fe²⁺ is consumed.",whatif:"Adding KMnO₄ too fast means unreacted KMnO₄ accumulates before the previous portion reacts, giving a premature pink endpoint. Volume is over-measured, making calculated Fe²⁺ molarity falsely low."}

  ],

  precipitation:[

    {why:"Pb(NO₃)₂ provides Pb²⁺ ions in solution. Taking a measured 20 mL volume ensures stoichiometric control. The solution must be clear before KI is added to confirm no prior precipitation has occurred.",whatif:"Without Pb(NO₃)₂, there are no Pb²⁺ ions available to form the precipitate. Adding KI to plain water produces no reaction — the golden yellow PbI₂ cannot form."},

    {why:"KI provides 2 I⁻ ions per formula unit. The reaction Pb²⁺ + 2I⁻ → PbI₂↓ requires a 1:2 molar ratio. Adding KI dropwise to Pb(NO₃)₂ causes immediate precipitation because the ion product [Pb²⁺][I⁻]² instantly exceeds the Ksp of PbI₂ (9.8×10⁻⁹).",whatif:"If KI is omitted, no precipitate forms. The Pb²⁺ ions remain in solution. You cannot demonstrate the 'Golden Rain' effect or study precipitation kinetics and Ksp relationships."},

    {why:"Observing the yellow PbI₂ precipitate confirms the reaction. You should note the density (it sinks), colour (bright golden yellow), and amount (proportional to moles of reactant). Stirring gently helps aggregate small crystallites into visible particles.",whatif:"If you skip observation and proceed directly to filtration, you miss qualitative evidence. Lab reports require specific descriptions — colour, clarity, texture of precipitate. Without observation notes, your conclusion is incomplete."},

    {why:"Filtration separates the solid PbI₂ from the ionic solution (KNO₃ and excess ions). Washing with distilled water removes soluble impurities. Drying gives pure product for weighing, allowing you to calculate % yield and compare with theoretical yield.",whatif:"If filtration is skipped, the precipitate remains as a suspension. You cannot weigh it, determine purity, or calculate yield. The experiment is observational only — no quantitative conclusion is possible."}

  ],

  combination:[

    {why:"Magnesium ribbon must be cleaned with sandpaper to remove the MgO oxide layer that forms on exposure to air. The oxide layer prevents ignition and reduces the mass of reactive Mg. A 5–10 cm strip is standard for observable results.",whatif:"If Mg ribbon is not cleaned, the oxide coating insulates it from O₂ and heat. Ignition is difficult or fails. If it does light, the oxide layer skews the mass ratio, and your calculated formula of MgO will be inaccurate."},

    {why:"A sand tray placed under the crucible catches any spatter of molten MgO and protects the bench. Safety goggles are mandatory — burning Mg emits intense UV that can cause permanent retinal damage (similar to arc-eye from welding).",whatif:"Without sand tray and goggles, molten MgO droplets can burn skin or eyes. The intense white light (magnesium flare, ~3,100°C) can cause flash blindness in under a second. This is a critical safety step that cannot be skipped."},

    {why:"Heating Mg strongly in air supplies the activation energy needed to break the Mg–Mg metallic bonds and O=O double bond (bond enthalpy = 498 kJ/mol). Once ignited, the reaction is exothermic and self-sustaining: 2Mg + O₂ → 2MgO (ΔH = −1204 kJ/mol).",whatif:"Without sufficient heat, Mg does not ignite. The metal will not undergo combination spontaneously at room temperature — despite O₂ being available, the activation energy barrier is too high. No MgO forms."},

    {why:"Recording mass of Mg before and MgO after allows calculation of empirical formula. The mass increase equals mass of O₂ absorbed: ratio should be Mg:O = 1:1 (molar). Any loss suggests incomplete combustion or MgO escaping as fume.",whatif:"Without weighing and recording data, the experiment is purely visual. You cannot determine the empirical formula, verify the law of conservation of mass, or write a quantitative conclusion. The experiment has no scientific value beyond a demonstration."}

  ],

  decomposition:[

    {why:"H₂O₂ (20 vol, ~6%) is the reactant. Measuring the exact volume in a graduated cylinder ensures you know the moles of H₂O₂ present, allowing calculation of theoretical O₂ yield. The reaction is: 2H₂O₂ → 2H₂O + O₂. Higher concentration gives faster reaction.",whatif:"If H₂O₂ is not measured, you cannot calculate yield or reaction rate. Using too concentrated H₂O₂ with MnO₂ can cause violent spattering of hot liquid — a safety hazard."},

    {why:"MnO₂ (manganese dioxide) is a heterogeneous catalyst — it lowers the activation energy from ~75 kJ/mol to ~49 kJ/mol without being consumed. Adding it to H₂O₂ immediately triggers rapid O₂ evolution. The glowing splint test confirms O₂ production.",whatif:"Without MnO₂ catalyst, H₂O₂ decomposes very slowly at room temperature (half-life ~3 hours). The experiment takes days instead of minutes. You cannot observe rapid O₂ evolution or measure reaction rate meaningfully."},

    {why:"The gas delivery tube directs O₂ into an inverted water-filled measuring cylinder (pneumatic trough). This allows exact measurement of O₂ volume evolved over time, from which you calculate rate of decomposition (mL O₂/min) and compare with theoretical yield.",whatif:"Without gas collection apparatus, you lose all quantitative data on O₂ yield. You cannot calculate the rate constant (k), confirm stoichiometry, or investigate the effect of catalyst concentration on rate — central goals of this experiment."},

    {why:"Recording gas volume at regular time intervals (every 30 sec) and temperature gives data for a rate-vs-time graph. The reaction rate decreases as H₂O₂ is consumed (first-order kinetics). Temperature rise indicates exothermic nature (ΔH = −98 kJ/mol).",whatif:"Without time-stamped data recording, you cannot plot a rate graph, determine order of reaction, or calculate activation energy using Arrhenius equation. The quantitative analysis section of your lab report cannot be completed."}

  ],

  single_displacement:[

    {why:"CuSO₄ (0.5M) provides Cu²⁺ ions in solution. The blue colour of Cu²⁺ is a visual indicator of the initial state. Measuring volume accurately sets up a stoichiometric comparison with the Zn strip mass.",whatif:"Without CuSO₄, there are no Cu²⁺ ions to be displaced by Zn. No reaction occurs. The displacement series (Zn > Cu in reactivity) cannot be demonstrated."},

    {why:"The Zn strip must be cleaned with sandpaper to remove the ZnO surface layer. Zinc is above copper in the electrochemical series (Zn: E° = −0.76V; Cu: E° = +0.34V), so it spontaneously displaces Cu²⁺: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s). Mass before/after records Zn dissolved.",whatif:"If Zn is not cleaned, surface oxidation prevents direct metal-ion contact. Reaction rate is drastically reduced. The oxide film also adds error to mass measurements, affecting yield calculations."},

    {why:"Colour change from blue (Cu²⁺) → colourless/pale (Zn²⁺) and the reddish-brown copper deposit on the Zn strip are the observable evidence. Timing onset of Cu deposition measures relative reaction rate. Temperature increase confirms exothermic nature (ΔH = −216 kJ/mol).",whatif:"Skipping observation means you miss the electrochemical evidence. If Cu deposition is not recorded, you cannot confirm the single-displacement mechanism or compute Faradaic efficiency of the spontaneous cell."},

    {why:"After the reaction, rinsing and weighing the Zn strip measures mass loss (Zn dissolved) and mass gain of Cu deposit. Filtering the solution removes any loose Cu particles. Comparing calculated vs actual mass change gives % yield and confirms stoichiometry (1 mol Zn → 1 mol Cu).",whatif:"Without final weighing and filtration, all data is qualitative. You cannot calculate the moles transferred, verify Faraday's laws, or determine whether the reaction went to completion. The quantitative conclusion is impossible."}

  ],

  double_displacement:[

    {why:"BaCl₂ (0.1M) provides Ba²⁺ ions. It must be in the beaker first as the receiving solution. Measuring exact volume ensures known moles of Ba²⁺ are available to react with SO₄²⁻. BaSO₄ (Ksp = 1.1×10⁻¹⁰) precipitates immediately on mixing.",whatif:"Without BaCl₂, no Ba²⁺ ions are present. The SO₄²⁻ from Na₂SO₄ remains in solution. No precipitation occurs, and you cannot demonstrate the double-displacement reaction or Ksp concept."},

    {why:"Na₂SO₄ (0.1M) is added dropwise to the BaCl₂ solution. Each drop creates a localised high [Ba²⁺][SO₄²⁻] that exceeds Ksp, forming fine white BaSO₄ crystals. The reaction: BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl. Dropwise addition gives finer, filterable crystals.",whatif:"Adding Na₂SO₄ all at once causes a rapid temperature spike and very fine colloidal BaSO₄ that is difficult to filter. The crystals are too small to settle and pass through filter paper, making gravimetric analysis impossible."},

    {why:"Gentle heating to ~60°C and stirring for 5 minutes promotes crystal growth by Ostwald ripening — small crystals dissolve and recrystallise as larger, denser particles. This makes the precipitate easier to filter and gives a more accurate dry mass.",whatif:"Without digestion, BaSO₄ remains as colloidal particles (<1 µm). These pass through filter paper, causing product loss. The filtered mass will be lower than theoretical, giving a falsely low yield (sometimes 0% apparent yield)."},

    {why:"Filtering through Whatman 42 (ashless) paper and washing 3× with hot distilled water removes Cl⁻ and Na⁺ impurities that would add false mass. Drying at 120°C until constant mass removes all water. Weighing gives experimental mass of BaSO₄ for yield calculation.",whatif:"Without complete washing and drying, the precipitate contains ionic impurities (NaCl, water). The wet mass overestimates yield. If BaSO₄ is used as a standard in gravimetric analysis, impure results invalidate all downstream calculations."}

  ],

  organic_addition:[

    {why:"The alkene (ethene or cyclohexene, 2 mL) must be measured in a fume cupboard — it is volatile and flammable. It provides the C=C double bond that will undergo electrophilic addition. The exact volume determines the moles of product expected.",whatif:"Without the alkene, there is no π-electron system for Br₂ to attack. Bromine water will remain orange indefinitely — no addition reaction can occur. The test for unsaturation is entirely negative."},

    {why:"Bromine water (1% Br₂, ~1 mL) is the electrophile. The Br₂ molecule is polarised by the alkene π-cloud, forming a bromonium ion intermediate. The reaction is: CH₂=CH₂ + Br₂ → CH₂Br–CH₂Br (1,2-dibromoethane). Decolorisation of orange Br₂ is the test for unsaturation.",whatif:"Without Br₂, there is no electrophile to add across the double bond. The alkene simply evaporates from solution. The bromine test (orange → colourless) cannot be performed, and unsaturation cannot be confirmed chemically."},

    {why:"Vigorous shaking ensures intimate contact between the alkene (often in organic layer) and Br₂ water (aqueous layer). The reaction occurs at the liquid-liquid interface. Shaking increases interfacial area and speeds up the electrophilic addition reaction.",whatif:"Without mixing, the alkene and Br₂ remain in separate layers with minimal contact area. Reaction rate is negligible. Decolorisation takes hours instead of seconds, and the endpoint is ambiguous — not suitable for a qualitative unsaturation test."},

    {why:"The colourless organic layer confirms 1,2-dibromoethane (dibromo addition product) has formed. Using anhydrous Na₂SO₄ to dry the organic layer removes water before GC analysis. Comparing refractive index or boiling point with literature confirms product identity.",whatif:"Without confirming the colourless product and its properties, you cannot distinguish between addition (gives dibromoalkane) and substitution (gives HBr + bromoalkyl, with acid detected by litmus). The mechanism — electrophilic addition — remains unproven."}

  ],

  esterification:[

    {why:"Glacial acetic acid (5 mL, pure CH₃COOH) and ethanol (5 mL, 95% C₂H₅OH) are the reactants. Fischer esterification requires equimolar or slight excess of acid. The acid provides the carbonyl carbon (electrophile) for nucleophilic attack by the alcohol.",whatif:"Without measuring both reactants, the molar ratio is unknown. Excess alcohol shifts equilibrium toward ester, while excess acid can side-react. Unknown stoichiometry makes yield calculation impossible and product purity uncertain."},

    {why:"Concentrated H₂SO₄ (5 drops) acts as a proton-transfer catalyst. It protonates the carbonyl oxygen of acetic acid, making the carbonyl carbon a stronger electrophile for nucleophilic attack by ethanol. It also absorbs water produced, driving equilibrium toward ester.",whatif:"Without H₂SO₄ catalyst, esterification at room temperature is negligibly slow (uncatalysed rate constant k ≈ 10⁻⁶ M⁻¹s⁻¹). Even at reflux, the reaction takes days. No fruity smell of ethyl acetate develops within the experiment timeframe."},

    {why:"Refluxing for 10–15 minutes at 78°C (ethanol b.p.) allows the reversible reaction to reach equilibrium while preventing loss of volatile reactants. Reflux condenser returns evaporated liquid, keeping concentrations constant. Temperature drives rate without losing material.",whatif:"Without reflux (heating in open flask), ethanol and ethyl acetate evaporate faster than the reaction proceeds. Yield is drastically reduced. Heating in a sealed flask without reflux is a pressure hazard. Without sufficient heat, equilibrium is not reached."},

    {why:"Pouring into saturated Na₂CO₃ solution neutralises excess H₂SO₄ and acetic acid (CH₃COOH + Na₂CO₃ → CH₃COONa + CO₂), so they don't contaminate the ester layer. Ethyl acetate is immiscible with water, forming a separate top layer identified by its characteristic fruity smell.",whatif:"Without Na₂CO₃ wash, acetic acid and H₂SO₄ remain in the ester layer. The product is impure and acidic. The fruity ester smell is masked by pungent vinegar odour. If dried over Na₂SO₄ and distilled, acid impurities cause bumping and product decomposition."}

  ],

  saponification:[

    {why:"Castor oil or vegetable fat (5 mL) provides the triglyceride (triacylglycerol) — three ester linkages that will be hydrolysed. The type of fat determines the fatty acid chain length and thus the hardness/softness of the soap produced (saturated = hard, unsaturated = soft).",whatif:"Without the fat, there is no ester to saponify. Adding NaOH to water just gives dilute NaOH solution. No soap forms — the experiment has no product to characterise, no smell to observe, and no foaming to test."},

    {why:"NaOH solution (20%, 10 mL) provides the hydroxide ion that attacks the ester carbonyl via nucleophilic acyl substitution. Saponification: RCOOR' + NaOH → RCOONa (soap) + R'OH (glycerol). Strong base is required because the mechanism is irreversible (unlike acid hydrolysis).",whatif:"Using dilute NaOH means insufficient [OH⁻] to drive hydrolysis to completion. Soap yield is very low. Using KOH instead of NaOH gives soft/liquid soap (potassium soap) — this changes the product type entirely."},

    {why:"Boiling the fat-NaOH mixture for 20 minutes with constant stirring breaks all three ester bonds in the triglyceride. Saponification is exothermic but slow without heat (rate law: rate = k[ester][OH⁻]). Stirring prevents localised overheating and ensures uniform saponification.",whatif:"Without sufficient boiling and stirring, partial saponification occurs — only 1 or 2 of the 3 ester linkages hydrolyse. The product is a mixture of soap, diglycerides, and monoglycerides. It lathers poorly and has an oily texture."},

    {why:"Adding saturated NaCl (salting-out) reduces the solubility of soap in water by the common-ion effect — Na⁺ ions compete with soap cation positions, causing soap micelles to aggregate and precipitate. The white solid floating on top is crude sodium soap.",whatif:"Without salting-out, the soap remains dispersed in the glycerol-water-NaOH mixture. You cannot separate it physically. The yield appears to be zero even though saponification is complete — you simply cannot harvest the product."}

  ],

  electrolysis_water:[

    {why:"Distilled water has very low conductivity (~5 µS/cm) — insufficient to carry electrolysis current. H₂SO₄ (0.1M, 10 mL) increases ionic conductivity by providing H⁺ and SO₄²⁻ as charge carriers, without itself being consumed (it catalyses electrolysis as electrolyte).",whatif:"Using pure distilled water without electrolyte — essentially no current flows. Electrolysis does not occur. The power supply voltage drops almost entirely across the solution resistance. No H₂ or O₂ gas is produced."},

    {why:"Filling the Hofmann voltameter with H₂SO₄ solution and inverting the collection tubes eliminates air. If tubes contain air initially, gas volumes cannot be measured accurately (O₂ from air would add to the cathode O₂ measurement). Proper setup is essential for the 2:1 H₂:O₂ ratio.",whatif:"Air in the tubes contaminates gas samples. The glowing splint test for O₂ and pop test for H₂ give ambiguous or false-negative results. The 2:1 volume ratio — key evidence for the formula H₂O — cannot be confirmed."},

    {why:"Applying 6–9V DC across platinum electrodes drives the non-spontaneous reaction: 2H₂O → 2H₂ + O₂ (E°cell = −1.23V). Cathode (−): 2H⁺ + 2e⁻ → H₂; Anode (+): H₂O → ½O₂ + 2H⁺ + 2e⁻. Hydrogen collects at cathode (larger volume) and oxygen at anode.",whatif:"Reversing polarity swaps gas collection — H₂ collects at the wrong electrode. This confuses identification tests. Using AC instead of DC produces no net gas — forward and reverse half-reactions cancel out in alternate half-cycles."},

    {why:"Measuring gas volumes with a ruler (in graduated tubes) confirms H₂:O₂ = 2:1 by volume. Performing glowing splint test (O₂ relights it) and pop test (H₂ makes a squeaky pop with a lit splint) identifies both gases, proving water is composed of H₂ and O₂ in a 2:1 molar ratio.",whatif:"Without gas identification tests, you cannot distinguish H₂ from O₂ or CO₂. The volume ratio alone is not proof of composition. Rigorous lab protocol requires both quantitative (volume) and qualitative (chemical tests) evidence to conclude the formula of water."}

  ],

  electroplating:[

    {why:"The electrolyte must be CuSO₄ (0.5M) solution because it provides Cu²⁺ ions for deposition at the cathode and SO₄²⁻ to complete the circuit. The concentration determines Cu²⁺ availability — higher concentration gives faster, more uniform deposition.",whatif:"Using plain water as electrolyte gives almost no conductivity. Cu²⁺ ions are absent, so no copper can deposit at the cathode. The electrodes simply bubble H₂ and O₂ from water electrolysis — no plating occurs."},

    {why:"The anode must be a pure copper rod because it oxidises continuously: Cu(s) → Cu²⁺(aq) + 2e⁻. This replenishes Cu²⁺ consumed at the cathode, keeping [CuSO₄] constant throughout plating. Without a Cu anode, the CuSO₄ depletes rapidly and plating quality deteriorates.",whatif:"Using an inert anode (platinum, graphite) means no Cu²⁺ replenishment. CuSO₄ concentration drops progressively. Plating rate slows, the deposit becomes porous and powdery, and water eventually electrolyses instead (O₂ evolution at anode)."},

    {why:"The cathode (object to be plated, e.g., iron key) must be cleaned with sandpaper and acid wash to remove grease, oxides, and corrosion. Surface contamination prevents Cu²⁺ ions from adhering uniformly — they deposit in patches, giving a dull, peeling, non-adherent coating.",whatif:"Without surface cleaning, the plated copper peels off in sheets after drying. Grease creates hydrophobic zones where Cu²⁺ cannot approach the cathode surface. The coating is cosmetically unacceptable and fails adhesion and scratch tests."},

    {why:"Running at 3–6V DC for 15–20 minutes deposits a measurable Cu layer. Faraday's law: m = (M × I × t)/(n × F) — mass deposited is proportional to current and time. Weighing cathode before and after calculates actual deposit mass; comparing with theoretical mass gives electrochemical efficiency.",whatif:"Without controlled current and timing, you cannot apply Faraday's laws. Too high a current gives rough, burned deposits (powder form). Too low a current gives very thin layers not measurable by lab balance. The quantitative objective of the experiment is completely lost."}

  ],

  haber:[

    {why:"N₂ (from air, 78%) and H₂ (from steam reforming of methane) must be in a 1:3 molar ratio (N₂:H₂ = 1:3) for the Haber process: N₂ + 3H₂ ⇌ 2NH₃. The gases are purified to remove CO, S compounds, and water vapour, which poison the iron catalyst.",whatif:"An incorrect N₂:H₂ ratio shifts equilibrium away from maximum NH₃ yield. A 1:3 ratio is required by stoichiometry — excess N₂ wastes compression energy; excess H₂ is expensive and flammable. Impurities in the feed gas irreversibly poison the catalyst within hours."},

    {why:"The promoted iron catalyst (Fe with K₂O and Al₂O₃ promoters) must be heated to 400–450°C for activation. Below 350°C, the catalyst surface is inactive. The promoters — K₂O increases electron density (electronic promoter) and Al₂O₃ prevents sintering (structural promoter).",whatif:"Without catalyst activation, N₂ cannot adsorb onto the Fe surface. The N≡N bond (bond enthalpy 945 kJ/mol) is not weakened sufficiently for dissociation. Reaction rate without catalyst at 450°C is negligible — industrial NH₃ production would be economically impossible."},

    {why:"Operating at 150–200 atm pressure favours NH₃ production (Le Chatelier — 4 moles gas → 2 moles gas; high pressure shifts equilibrium right). The 400–450°C temperature is a compromise: low T gives high yield but slow rate; high T gives fast rate but low yield (~15%). This gives ~15% conversion per pass.",whatif:"Operating at atmospheric pressure gives <1% NH₃ yield at 450°C — economically worthless. Very high pressure (>300 atm) gives better yield but requires extremely expensive high-pressure vessels and creates severe safety risks. 150–200 atm is the industrial optimum."},

    {why:"Unreacted N₂ and H₂ are recycled — after NH₃ is condensed and removed (b.p. −33°C), the gas stream returns to the reactor. This continuous recycling achieves ~98% overall conversion despite only 15% per-pass conversion. It makes the process economically viable.",whatif:"Without recycling, 85% of the N₂ and H₂ feed is wasted per pass. Overall NH₃ yield drops to 15%, making the process 6× less efficient. The cost per tonne of ammonia becomes prohibitively expensive — the industrial Haber process would not be viable."}

  ],

  add_polymerisation:[

    {why:"Ethylene monomer (CH₂=CH₂) requires a free-radical initiator (benzoyl peroxide, 0.5%) to begin polymerisation. The initiator decomposes thermally: (PhCOO)₂ → 2PhCOO• → 2Ph• + 2CO₂. These radicals add to ethylene, starting the chain. Oxygen inhibits radical polymerisation and must be excluded.",whatif:"Without initiator, free radicals cannot form. Ethylene molecules have no activation energy to react with each other — the π bond of isolated C=C is stable. Polymerisation does not begin regardless of pressure or temperature. The monomer remains as gas."},

    {why:"High pressure (1000–3000 atm) forces ethylene molecules into close proximity, increasing collision frequency and enabling chain propagation: R• + CH₂=CH₂ → RCH₂CH₂•. Temperature 150–200°C provides energy for C=C bond opening. The reactor must be sealed to maintain pressure.",whatif:"Low pressure means ethylene density is insufficient for chain growth. The growing radical chain collides with ethylene too infrequently. Average chain length (degree of polymerisation) drops from 10⁴–10⁵ to <100, producing a low-MW wax, not polyethylene."},

    {why:"Propagation continues: each radical adds ~1000–10000 ethylene units in milliseconds. The chain reaction is self-sustaining once initiated. Controlling temperature prevents runaway exothermic reaction (ΔH = −94 kJ/mol per monomer unit). Cooling jacket maintains control.",whatif:"Uncontrolled exothermic propagation causes thermal runaway. Temperature rises uncontrolled, causing branching (β-scission), chain transfer, and degradation. The product is highly branched, low-density, weak polyethylene with poor mechanical properties."},

    {why:"Termination ends the chain reaction by radical combination: R• + R• → R–R, or disproportionation. The polymer solidifies as white waxy polyethylene. Adding antioxidants (hindered phenols) prevents post-production oxidative degradation during melt processing.",whatif:"Without controlled termination, chains keep growing until all monomer is consumed or the reactor is quenched. Very high molecular weight makes the polymer difficult to process (high viscosity at melt). Chain transfer to solvent gives low-MW polymer with solvent end-groups, affecting properties."}

  ],

  nylon:[

    {why:"Adipoyl chloride (10% in cyclohexane) and 1,6-diaminohexane (10% aqueous) must be layered carefully — acid chloride on top, amine below, or vice versa. The reaction occurs at the liquid-liquid interface only. Both solutions must be at room temperature for controlled interfacial polymerisation.",whatif:"Mixing the two solutions directly causes instantaneous violent reaction with solid precipitation throughout the bulk. The nylon cannot be drawn into fibres — it forms a crumbled precipitate. Interfacial polymerisation is specifically designed to produce continuous fibre-quality polymer at the boundary."},

    {why:"Adipoyl chloride is more reactive than adipic acid because the C–Cl bond is easily displaced by the amine nitrogen. The step-growth reaction: H₂N(CH₂)₆NH₂ + ClCO(CH₂)₄COCl → nylon-6,6 unit + 2HCl. HCl by-product is neutralised by excess amine or NaOH in aqueous layer.",whatif:"Using adipic acid instead of adipoyl chloride requires 200°C+ and vacuum to drive off water (condensation polymerisation). At room temperature, the acid is unreactive toward amines without activation. No nylon thread can be pulled at room temperature."},

    {why:"Inserting a hook or tweezers at the interface and pulling slowly draws the nylon thread continuously. The thread forms as fast as it is pulled. Winding onto a rod creates a continuous fibre. Pulling rate determines thread diameter and molecular orientation (orientation improves tensile strength).",whatif:"Without careful, continuous pulling, the nylon film collapses at the interface and cannot be separated from the solvent layers. You get a film rather than a thread. The demonstration fails to show the key property of nylon — its ability to form long, strong, flexible fibres by drawing."},

    {why:"Washing the nylon thread with water removes HCl (formed as by-product), excess monomers, and cyclohexane solvent. HCl residue makes the nylon acidic, causing hydrolytic degradation of the amide bond over time. The washed thread can be examined for tensile strength, elasticity, and crystallinity.",whatif:"Unwashed nylon contains HCl that cleaves amide bonds: –CO–NH– + HCl → –COOH + NH₂–. The thread degrades rapidly, losing tensile strength within hours. It also corrodes metal equipment and is harmful to skin due to residual acid chloride traces."}

  ]

};



// Fallback generic protocols for any reaction not in the above map

const GENERIC_STEP_PROTOCOLS=[

  {why:"This is the primary reagent that establishes the reaction medium. Adding it first sets up the correct starting conditions — concentration, pH, and ionic environment — before subsequent reagents are introduced.",whatif:"Without the primary reagent, there is no reaction medium. All subsequent additions have nothing to react with, and no observable chemical change can occur."},

  {why:"The second reagent initiates or modifies the reaction. The order of addition matters because reagent concentration controls reaction rate, selectivity, and avoids side-reactions or dangerous exothermic mixing.",whatif:"Adding reagents out of order can cause violent exothermic reactions, premature precipitation, or incorrect endpoints, making the experiment uncontrollable and results invalid."},

  {why:"This step introduces the catalyst, indicator, or secondary reagent needed to observe or drive the reaction. It is added after primary reagents to avoid contamination and ensure the correct chemical environment.",whatif:"Without this step, you cannot observe the reaction endpoint, detect completion, or speed up the rate. The reaction may proceed but without any measurable, recordable evidence."},

  {why:"The final step completes the protocol — controlled reaction conditions allow all chemicals to fully interact, reach equilibrium, and produce observable results (colour change, precipitate, gas, etc.).",whatif:"Skipping this step means the chemicals remain as an unreacted mixture. No complete product forms, no lab observations can be recorded, and the experiment cannot yield a valid scientific conclusion."}

];



function getStepProtocol(reactionKey, stepIdx){

  const rxnProtos=REACTION_STEP_PROTOCOLS[reactionKey];

  if(rxnProtos&&rxnProtos[stepIdx])return rxnProtos[stepIdx];

  return GENERIC_STEP_PROTOCOLS[Math.min(stepIdx,GENERIC_STEP_PROTOCOLS.length-1)];

}



function openStepModal(stepIdx){

  const rxn=REACTIONS[state.currentReaction];

  const step=rxn.steps[stepIdx];if(!step)return;

  const proto=getStepProtocol(state.currentReaction, stepIdx);

  const isCompleted=stepIdx<state.selectedChems.length;

  const isActive=stepIdx===state.selectedChems.length;



  document.getElementById('smd-num').textContent=stepIdx+1;

  document.getElementById('smd-title').textContent=step.title;

  document.getElementById('smd-subtitle').textContent=`Step ${stepIdx+1} of ${rxn.steps.length} — ${rxn.name}`;

  document.getElementById('smd-what').textContent=step.desc;

  document.getElementById('smd-why').textContent=proto.why;

  document.getElementById('smd-whatif').textContent=proto.whatif;



  // Chemical image

  const chem=rxn.chemicals[stepIdx];

  const chemColor=chem?chem.color:'rgba(6,182,212,0.5)';

  const imgEl=document.getElementById('smd-chem-image');

  if(imgEl){imgEl.innerHTML=getChemSVG(chem,chemColor)+'<div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;font-family:var(--fm);font-size:9px;color:var(--text3)">'+(chem?chem.name+' ('+chem.conc+')':`Step ${stepIdx+1}`)+'</div>';}



  // Reaction name badge

  const rxnBadge=document.getElementById('smd-rxn-name');

  if(rxnBadge)rxnBadge.textContent=rxn.name+' — '+rxn.equation.substring(0,40)+(rxn.equation.length>40?'…':'');



  // Advantages & disadvantages

  const advData=STEP_ADV_DISADV[state.currentReaction]?.[stepIdx]||STEP_ADV_DISADV.default[Math.min(stepIdx,3)];

  const advEl=document.getElementById('smd-advantages');

  const disadvEl=document.getElementById('smd-disadvantages');

  if(advEl)advEl.innerHTML=advData.adv.map(a=>`<li>${a}</li>`).join('');

  if(disadvEl)disadvEl.innerHTML=advData.disadv.map(d=>`<li>${d}</li>`).join('');



  const statusEl=document.getElementById('smd-status');

  const statusText=document.getElementById('smd-status-text');

  const actionBtn=document.getElementById('smd-action-btn');



  if(isCompleted){

    statusEl.className='step-status-row done-row';

    statusText.textContent='✅ Step completed — '+step.title;

    actionBtn.innerHTML='✅ Step Done!';actionBtn.style.opacity='.7';actionBtn.style.background='var(--emerald)';actionBtn.style.color='#fff';actionBtn.style.border='none';

    actionBtn.onclick=()=>closeStepModal();

  } else if(isActive){

    statusEl.className='step-status-row active-row';

    statusText.textContent='▶ This is your current step — complete it now!';

    actionBtn.innerHTML='<i class="fas fa-flask"></i> Add '+step.title+' now';

    actionBtn.style.opacity='1';actionBtn.style.background='';actionBtn.style.color='';actionBtn.style.border='';

    actionBtn.onclick=()=>{closeStepModal();highlightNextChem(rxn,stepIdx);};

  } else {

    statusEl.className='step-status-row pending-row';

    statusText.textContent='🔒 Complete previous steps first (Step '+(state.selectedChems.length+1)+' is next)';

    actionBtn.innerHTML='<i class="fas fa-lock"></i> Complete step '+(state.selectedChems.length+1)+' first';

    actionBtn.style.opacity='.6';actionBtn.style.background='var(--card)';

    actionBtn.style.color='var(--text3)';actionBtn.style.border='1px solid var(--border)';

    actionBtn.onclick=()=>closeStepModal();

  }



  document.getElementById('step-modal-overlay').classList.add('open');

}



function closeStepModal(e){

  if(e&&e.target!==document.getElementById('step-modal-overlay'))return;

  document.getElementById('step-modal-overlay').classList.remove('open');

  // Reset action btn style

  const btn=document.getElementById('smd-action-btn');

  btn.style.background='';btn.style.color='';btn.style.border='';btn.style.opacity='1';

  btn.onclick=()=>closeStepModal();

}



function highlightNextChem(rxn,stepIdx){

  // Flash/scroll to the next unselected chemical bottle

  const nextChemId=rxn.chemicals[stepIdx]?.id;

  if(!nextChemId)return;

  const el=document.getElementById('bottle_'+nextChemId);

  if(!el)return;

  el.scrollIntoView({behavior:'smooth',block:'nearest'});

  el.style.transition='box-shadow .3s';

  el.style.boxShadow='0 0 0 3px var(--cyan)';

  setTimeout(()=>{el.style.boxShadow='';},2000);

}



/* ══════════════════════════════════════════════════════

   PARTIAL STEP WARNING WITH WHAT-IF CHATBOT QUESTIONS

══════════════════════════════════════════════════════ */

function showPartialStepWarning(rxn,selectedCount,totalChems){

  const remaining=totalChems-selectedCount;

  const completedSteps=rxn.steps.slice(0,selectedCount).map((s,i)=>`✅ Step ${i+1}: ${s.title}`).join('\n');

  const pendingSteps=rxn.steps.slice(selectedCount).map((s,i)=>`🔒 Step ${selectedCount+i+1}: ${s.title}`).join('\n');



  // Show warning toast

  showToast(`⚠️ Complete all ${totalChems} steps first! (${remaining} remaining)`,3000);



  // Update status

  document.getElementById('rxn-status-label').className='status-label idle';

  document.getElementById('rxn-status-label').textContent='⛔ Steps Incomplete';

  document.getElementById('rxn-status-sub').textContent=`${selectedCount}/${totalChems} steps done — need all to run`;



  // Inject what-if analysis into chat based on partial state

  const partialWhatIf=generatePartialWhatIf(rxn,selectedCount,totalChems);

  addAIMsg(partialWhatIf,true);

}



function generatePartialWhatIf(rxn,selectedCount,totalChems){

  const addedChems=state.selectedChems.map(id=>rxn.chemicals.find(c=>c.id===id)).filter(Boolean);

  const addedNames=addedChems.map(c=>c.name).join(' + ');

  const missingChems=rxn.chemicals.filter(c=>!state.selectedChems.includes(c.id));

  const missingNames=missingChems.map(c=>c.name).join(', ');



  // Build specific what-if questions based on combination

  let msg=`### ⛔ Cannot Run — ${selectedCount}/${totalChems} Steps Complete\n\nAll **${totalChems} steps** must be completed before the reaction can run.\n\n`;

  msg+=`**Completed:** ${state.selectedChems.map((id,i)=>`Step ${i+1} (${rxn.chemicals.find(c=>c.id===id)?.name||id})`).join(', ')}\n`;

  msg+=`**Missing:** ${missingNames}\n\n`;

  msg+=`---\n### 🔮 What-If Analysis: Partial Reactions\n\n`;



  if(selectedCount===1){

    const c1=addedChems[0];

    msg+=`**Q1. What if only ${c1.name} is present (no other chemicals added)?**\n`;

    msg+=`A: With only ${c1.name} (${c1.conc}), the solution exists as a simple electrolyte/solute without any reaction partner. No observable change occurs — no color change, no precipitate, no gas evolution. This is just a solution of ${c1.name} in water. The reaction equation ${rxn.equation} requires all reactants to proceed.\n\n`;

    msg+=`**Q2. What is the partial mixture result at this stage?**\n`;

    msg+=`A: pH ≈ ${state.ph.toFixed(2)}, Temperature = ${state.temp.toFixed(1)}°C. The beaker contains only ${c1.name} solution. No product can form without the remaining reagents: ${missingNames}.\n\n`;

  } else if(selectedCount===2){

    const c1=addedChems[0],c2=addedChems[1];

    const hasPrecipitant=rxn.precipitate&&addedChems.some(c=>c.color&&!c.color.includes('220,220,220')&&!c.color.includes('200,230,255'));

    msg+=`**Q1. What happens with only ${c1.name} + ${c2.name} (first 2 chemicals added)?**\n`;

    if(hasPrecipitant){

      msg+=`A: With only these two reactants, a **partial reaction** may begin — you might observe slight turbidity or a faint color change. However, without the remaining reagents (${missingNames}), the reaction is incomplete. The product yield is limited and no accurate observations can be recorded.\n\n`;

    } else {

      msg+=`A: With ${c1.name} and ${c2.name} alone, the solution is a mixture of these two species. Without ${missingNames}, the reaction ${rxn.equation} cannot reach completion. You might see initial mixing effects but no final product characteristic of this experiment.\n\n`;

    }

    msg+=`**Q2. What if only the first 2 chemicals react without the precipitation/indicator step?**\n`;

    msg+=`A: The reaction is stoichiometrically incomplete. According to ${rxn.equation}, all reactants are needed. Missing ${missingNames} means: (a) the endpoint cannot be detected, (b) product yield is indeterminate, and (c) any lab report conclusion would be invalid.\n\n`;

    msg+=`**Q3. What is the scientific consequence of running with 2 of ${totalChems} chemicals?**\n`;

    msg+=`A: The limiting reagent principle applies — the reaction proceeds only as far as the least available reactant allows. With ${selectedCount} of ${totalChems} components: expected final color (${rxn.finalColor}) will NOT appear, pH will not reach ${rxn.finalPH}, and temperature rise will be less than ${rxn.finalTemp}°C.\n\n`;

  } else if(selectedCount===3){

    const lastMissing=missingChems[0];

    msg+=`**Q1. What if only ${addedNames} are added (Step 4 missing)?**\n`;

    msg+=`A: You are one step away from completion! With 3 of ${totalChems} chemicals added, the main reaction mixture is ready but the final reagent — **${lastMissing?.name}** — is missing. This final step is critical because: ${lastMissing?.desc||'it completes the reaction and enables final observation'}.\n\n`;

    msg+=`**Q2. What specific observation is missing without Step 4 (${lastMissing?.name})?**\n`;

    msg+=`A: Without ${lastMissing?.name}, the reaction cannot be confirmed and recorded. The final observation "${rxn.observation}" requires all reactants. Current state is an intermediate mixture only.\n\n`;

    msg+=`**Q3. What if you run the reaction with only 3 steps done?**\n`;

    msg+=`A: The reaction would be incomplete — similar to a recipe missing a key ingredient. Scientifically, the expected final pH of ${rxn.finalPH}, color (${rxn.finalColor}), and temperature of ${rxn.finalTemp}°C cannot be achieved without all ${totalChems} components reacting together.\n\n`;

  }



  msg+=`---\n**👇 Complete the remaining ${totalChems-selectedCount} step${totalChems-selectedCount>1?'s':''} and then run the reaction!**`;



  // Also add quick what-if chips to inject into chat

  return msg;

}



/* Update run button state based on steps completed */

function updateRunBtnState(){

  const rxn=REACTIONS[state.currentReaction];

  const btn=document.getElementById('run-btn');if(!btn)return;

  const allDone=state.selectedChems.length>=rxn.chemicals.length;

  if(allDone){

    btn.classList.remove('step-locked');

    btn.innerHTML='<i class="fas fa-play"></i> Run Reaction';

    btn.disabled=false;

  } else {

    const done=state.selectedChems.length;const total=rxn.chemicals.length;

    btn.innerHTML=`<i class="fas fa-lock"></i> ${done}/${total} Steps Done`;

    btn.classList.add('step-locked');

  }

}



function finishReaction(rxn,finalPH,finalTemp){

  setStatus('done');

  state.score+=50+(state.selectedChems.length*5);

  document.getElementById('score-val').textContent=state.score;

  setStepActive(4);

  // Mark ALL mechanism steps as green/done

  setMechStepState(rxn.steps.length);

  document.getElementById('rxn-status-label').className='status-label done';

  document.getElementById('rxn-status-label').textContent='Complete! ✅';

  document.getElementById('rxn-status-sub').textContent=rxn.observation;



  const cp=document.getElementById('color-preview');

  // Special: BZ reaction — oscillating red↔blue color preview

  if(state.currentReaction==='belousov_zhabotinsky'){

    cp.classList.add('bz-oscillating');

    cp.textContent='Red ↔ Blue Oscillating (BZ Wave)';

  } else {

    cp.classList.remove('bz-oscillating');

    cp.style.background=rxn.finalColorCSS;

    cp.textContent=rxn.finalColor;

  }

  // Special: Nuclear fission — radioactive green glow effect

  if(state.currentReaction==='uranium_fission'){

    cp.style.background='rgba(50,255,80,0.75)';

    cp.textContent='☢️ Radioactive Green Glow';

    cp.style.boxShadow='0 0 16px 4px rgba(50,255,80,0.5),0 0 32px 8px rgba(20,180,30,0.25)';

    cp.style.color='rgba(10,40,10,0.9)';

    cp.style.fontWeight='700';

    // Flash screen green briefly

    const flashDiv=document.createElement('div');

    flashDiv.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(50,255,80,0.12);pointer-events:none;animation:nuclearPillGlow 0.4s ease-out forwards';

    document.body.appendChild(flashDiv);

    setTimeout(()=>flashDiv.remove(),800);

  }



  // Success animation

  const sa=document.getElementById('success-anim');sa.classList.add('show');setTimeout(()=>sa.classList.remove('show'),2000);

  // Spawn sparks

  spawnSparks();

  // Show color detection for final

  const badge=document.getElementById('color-detection-badge');

  const dot=document.getElementById('detect-dot');const text=document.getElementById('detect-text');

  dot.style.background=rxn.finalColorCSS;text.textContent='Final: '+rxn.finalColor;

  badge.classList.add('show');setTimeout(()=>badge.classList.remove('show'),5000);

  state.experimentHistory.push({name:rxn.name,icon:rxn.icon,score:state.score,time:getTime(),ph:finalPH.toFixed(2),temp:finalTemp.toFixed(1),color:rxn.finalColor,equation:rxn.equation});

  // Auto-save to localStorage after each experiment

  if(currentUser&&currentUser.email){saveUserHistory(currentUser.email);}

  renderExpHistory();

  setTimeout(()=>showResult(rxn,finalPH,finalTemp),600);

  addAIMsg(`### ✅ Reaction Complete!\n\n**Observation:** ${rxn.observation}\n\n| Parameter | Value |\n|---|---|\n| Final pH | ${finalPH.toFixed(2)} (${getPHLabel(finalPH)}) |\n| Temperature | ${finalTemp.toFixed(1)}°C |\n| Color | ${rxn.finalColor} |\n\n**Conclusion:** ${rxn.conclusion}\n\n🏆 You earned **+${50+(state.selectedChems.length*5)} points!** 🎉`);

}



function showResult(rxn,finalPH,finalTemp){

  document.getElementById('result-title').textContent='✅ '+rxn.name+' — Complete!';

  document.getElementById('result-equation').textContent=rxn.equation;

  document.getElementById('result-obs').textContent=rxn.observation;

  document.getElementById('result-ph').textContent=finalPH.toFixed(2)+' ('+getPHLabel(finalPH)+')';

  document.getElementById('result-temp').textContent=finalTemp.toFixed(1)+'°C';

  document.getElementById('result-color').textContent=rxn.finalColor;

  document.getElementById('result-vol').textContent=state.volume.toFixed(2)+' mL';

  document.getElementById('result-conclusion').textContent=rxn.conclusion;

  const chips=document.getElementById('result-chips');

  chips.innerHTML=rxn.observations.map(o=>`<span class="obs-chip"><i class="fas fa-check-circle"></i> ${o}</span>`).join('');

  document.getElementById('result-modal').classList.add('show');

}

function getPHLabel(ph){if(ph<7)return'Acidic';if(ph>7)return'Basic';return'Neutral';}

function closeModal(){document.getElementById('result-modal').classList.remove('show');}

function closeWarning(){document.getElementById('warning-modal').classList.remove('show');}



/* ══════════════════════════════════════════════════════

   ANIMATIONS

══════════════════════════════════════════════════════ */

function startDropAnimation(){

  const drop=document.getElementById('burette-drop');if(!drop)return;

  const buretteLiq=document.getElementById('burette-liquid');

  const waveStream=document.getElementById('pour-wave-stream');

  const waveStream2=document.getElementById('pour-wave-stream2');

  const mouthRipple=document.getElementById('flask-mouth-ripple');

  const dropColor=buretteLiq?buretteLiq.getAttribute('fill')||'rgba(6,182,212,.85)':'rgba(6,182,212,.85)';

  if(buretteLiq){drop.setAttribute('fill',dropColor);}

  if(waveStream){

    waveStream.setAttribute('stroke',dropColor);

    waveStream.setAttribute('opacity','0.88');

  }

  if(waveStream2){

    waveStream2.setAttribute('stroke',dropColor);

    waveStream2.setAttribute('opacity','0.40');

  }

  // Burette center now at x=270

  let y=270, x=270, wavePhase=0;

  drop.setAttribute('opacity','1');

  state.dropInterval=setInterval(()=>{

    y+=5; wavePhase+=0.38;

    x=270+Math.sin(wavePhase)*4.5; // realistic lateral oscillation

    drop.setAttribute('cy',y);

    drop.setAttribute('cx',x);

    // Teardrop stretching

    const stretch=Math.min(1+y*0.002,1.55);

    drop.setAttribute('ry',(3.5*stretch).toFixed(1));

    drop.setAttribute('rx',(2.5/Math.sqrt(stretch)).toFixed(1));

    // Animate the stream wave oscillation for realism

    if(waveStream){

      const amp=2+Math.sin(wavePhase*1.4)*1.8;

      waveStream.setAttribute('d',`M270 251 C${267+amp} 255 ${273-amp} 258 270 262`);

    }

    if(waveStream2){

      const amp2=1.5+Math.cos(wavePhase*1.2)*1.2;

      waveStream2.setAttribute('d',`M271 252 C${274-amp2} 255 ${268+amp2} 258 271 262`);

    }

    if(y>420){

      y=270; x=270; wavePhase=0;

      drop.setAttribute('opacity','0');

      drop.setAttribute('ry','3.5');drop.setAttribute('rx','2.5');

      // Mouth ripple on each drop hit

      if(mouthRipple){

        mouthRipple.setAttribute('stroke',dropColor);

        mouthRipple.setAttribute('opacity','0.7');

        let rr=0,rop=0.7;

        const ar=()=>{rr+=2.5;rop-=0.09;

          mouthRipple.setAttribute('rx',rr);mouthRipple.setAttribute('ry',rr*0.35);

          mouthRipple.setAttribute('opacity',Math.max(0,rop));

          if(rop>0)requestAnimationFrame(ar);else{mouthRipple.setAttribute('rx','0');mouthRipple.setAttribute('ry','0');}

        };ar();

      }

      _dropSplash();

      setTimeout(()=>drop.setAttribute('opacity','1'),320);

    }

  },38);

}



function _dropSplash(){

  const svg=document.querySelector('#beaker-scene svg');if(!svg)return;

  const ns='http://www.w3.org/2000/svg';

  const drop=document.getElementById('burette-drop');

  const color=drop?drop.getAttribute('fill'):'rgba(6,182,212,.6)';

  // Main splash ellipse

  const splash=document.createElementNS(ns,'ellipse');

  splash.setAttribute('cx','255');splash.setAttribute('cy','310');

  splash.setAttribute('rx','6');splash.setAttribute('ry','2.5');

  splash.setAttribute('fill',color);splash.setAttribute('opacity','0.75');

  svg.appendChild(splash);

  let op=0.75,rx=6,ry=2.5;

  const anim=setInterval(()=>{

    op-=0.065;rx+=2;ry+=0.6;

    splash.setAttribute('rx',rx);splash.setAttribute('ry',ry);

    splash.setAttribute('opacity',op);

    if(op<=0){clearInterval(anim);splash.remove();}

  },28);

  // Tiny satellite droplets spraying upward

  for(let i=0;i<5;i++){

    setTimeout(()=>{

      const sd=document.createElementNS(ns,'circle');

      const angle=(i/5)*Math.PI;

      const dx=Math.cos(angle)*6,dy=-4-Math.random()*6;

      sd.setAttribute('cx',255+dx);sd.setAttribute('cy',310+dy);

      sd.setAttribute('r',1+Math.random()*1.5);

      sd.setAttribute('fill',color);sd.setAttribute('opacity','0.8');

      svg.appendChild(sd);

      let sop=0.8,sy=parseFloat(sd.getAttribute('cy'));

      const sa=setInterval(()=>{

        sop-=0.1;sy+=2;sd.setAttribute('cy',sy);sd.setAttribute('opacity',sop);

        if(sop<=0){clearInterval(sa);sd.remove();}

      },30);

    },i*25);

  }

}

function addBubble(){

  const g=document.getElementById('bubbles-group');if(!g)return;

  const x=90+Math.random()*110,y=260+Math.random()*15,r=1.5+Math.random()*3;

  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');

  c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',r);

  c.setAttribute('fill','rgba(255,255,255,0.45)');

  c.style.animation=`bubble-rise ${0.8+Math.random()*0.9}s ease-in forwards`;

  g.appendChild(c);setTimeout(()=>c.remove(),1800);

}

function spawnSmoke(){

  const scene=document.getElementById('beaker-scene');if(!scene)return;

  for(let i=0;i<6;i++){

    setTimeout(()=>{

      const s=document.createElement('div');

      s.className='smoke-particle';

      s.style.cssText=`width:${15+Math.random()*20}px;height:${15+Math.random()*20}px;background:rgba(200,200,200,${0.1+Math.random()*.15});left:${40+Math.random()*30}%;top:${5+Math.random()*15}%;`;

      scene.style.position='relative';scene.appendChild(s);

      setTimeout(()=>s.remove(),2200);

    },i*300);

  }

}

function spawnSparks(){

  const scene=document.getElementById('beaker-scene');if(!scene)return;

  for(let i=0;i<12;i++){

    const spark=document.createElement('div');

    spark.className='spark';

    const dx=(Math.random()-.5)*80,dy=-30-Math.random()*60;

    spark.style.cssText=`left:50%;top:40%;--dx:${dx}px;--dy:${dy}px;background:${['#06B6D4','#F59E0B','#10B981','#8B5CF6'][Math.floor(Math.random()*4)]};animation-delay:${Math.random()*.4}s`;

    scene.style.position='relative';scene.appendChild(spark);

    setTimeout(()=>spark.remove(),1200);

  }

}



/* ── COMBUSTION SPARKS (bright orange/white) ── */

function spawnSparkEffect(){

  const scene=document.getElementById('beaker-scene');if(!scene)return;

  for(let i=0;i<20;i++){

    setTimeout(()=>{

      const spark=document.createElement('div');

      const dx=(Math.random()-.5)*100, dy=-40-Math.random()*80;

      const size=2+Math.random()*3;

      const colors=['#FF6B00','#FFB800','#FF4400','#FFFFFF','#FFD700'];

      spark.style.cssText=`position:absolute;left:calc(50% + ${(Math.random()-.5)*40}px);top:35%;width:${size}px;height:${size}px;border-radius:50%;background:${colors[Math.floor(Math.random()*colors.length)]};box-shadow:0 0 ${size*2}px currentColor;pointer-events:none;z-index:20;animation:sparkFly 0.8s ease-out forwards;--dx:${dx}px;--dy:${dy}px;animation-delay:${Math.random()*.6}s`;

      scene.appendChild(spark);

      setTimeout(()=>spark.remove(),1600);

    }, i*80);

  }

}



/* ── FOAM EFFECT (elephant toothpaste / H2O2 decomp) ── */

function spawnFoamEffect(){

  const scene=document.getElementById('beaker-scene');if(!scene)return;

  for(let i=0;i<12;i++){

    setTimeout(()=>{

      const foam=document.createElement('div');

      const w=20+Math.random()*30, h=20+Math.random()*40;

      const left=30+Math.random()*40;

      foam.style.cssText=`position:absolute;left:${left}%;bottom:${20+i*5}%;width:${w}px;height:${h}px;border-radius:50% 50% 30% 30%;background:rgba(255,255,255,${0.6+Math.random()*.35});pointer-events:none;z-index:15;animation:foamRise 1.8s ease-out forwards;animation-delay:${i*0.12}s;border:1px solid rgba(255,255,255,0.4);backdrop-filter:blur(1px)`;

      scene.appendChild(foam);

      setTimeout(()=>foam.remove(),2500);

    }, i*120);

  }

}



/* ── WATER VAPOUR / STEAM (combustion, heating) ── */

function spawnWaterVapourEffect(){

  const scene=document.getElementById('beaker-scene');if(!scene)return;

  for(let i=0;i<8;i++){

    setTimeout(()=>{

      const v=document.createElement('div');

      const w=30+Math.random()*50;

      v.style.cssText=`position:absolute;left:${25+Math.random()*50}%;top:${5+Math.random()*20}%;width:${w}px;height:${w*0.7}px;border-radius:50%;background:radial-gradient(ellipse,rgba(200,220,255,0.55) 0%,rgba(200,220,255,0) 70%);pointer-events:none;z-index:16;animation:vapourRise 2.2s ease-out forwards;animation-delay:${Math.random()*.8}s;filter:blur(4px)`;

      scene.appendChild(v);

      setTimeout(()=>v.remove(),3000);

    }, i*200);

  }

}



/* ── STEAM WISPS for heating hardware ── */

function _activateSteam(){

  // Just enable SVG steam wisps inside the test tube (already have animate in SVG)

  // Add extra DOM wisps for more effect

  spawnWaterVapourEffect();

}



/* ── FOG / DRY ICE / LIQUID N2 EFFECT ── */

function spawnFogEffect(){

  const scene=document.getElementById('beaker-scene');if(!scene)return;

  for(let i=0;i<15;i++){

    setTimeout(()=>{

      const fog=document.createElement('div');

      const w=40+Math.random()*80;

      const left=10+Math.random()*80;

      fog.style.cssText=`position:absolute;left:${left}%;bottom:${-5+Math.random()*20}%;width:${w}px;height:${w*0.5}px;border-radius:50%;background:radial-gradient(ellipse,rgba(220,240,255,0.75) 0%,rgba(200,230,255,0) 70%);pointer-events:none;z-index:14;animation:fogFlow ${2+Math.random()*2}s ease-out forwards;animation-delay:${i*0.15}s;filter:blur(6px)`;

      scene.appendChild(fog);

      setTimeout(()=>fog.remove(),4000);

    }, i*150);

  }

}



/* ══════════════════════════════════════════════════════

   UTILITIES

══════════════════════════════════════════════════════ */

function gradientColor(start,end,t){

  const ps=start.match(/[\d.]+/g),pe=end.match(/[\d.]+/g);

  if(!ps||!pe||ps.length<4||pe.length<4)return t<0.5?start:end;

  const r=Math.round(+ps[0]+(+pe[0]-+ps[0])*t);

  const g=Math.round(+ps[1]+(+pe[1]-+ps[1])*t);

  const b=Math.round(+ps[2]+(+pe[2]-+ps[2])*t);

  const a=Math.min(0.85,(+ps[3]+(+pe[3]-+ps[3])*t));

  return `rgba(${r},${g},${b},${a})`;

}

function lerpColor(a,b,t){return gradientColor(a,b,t);}

function easeInOut(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}



function updatePHDisplay(ph){

  const safe=Math.max(0,Math.min(14,ph));

  document.getElementById('ph-value').textContent=safe.toFixed(2);

  document.getElementById('ph-thumb').style.left=(safe/14*100)+'%';

  const c=safe<6?'#EF4444':safe<6.5?'#F59E0B':safe<=7.5?'#10B981':safe<8?'#F59E0B':'#3B82F6';

  document.getElementById('ph-value').style.color=c;

  state.ph=safe;

}

function updateVolumeBar(){

  const pct=Math.min((state.volume/state.maxVolume)*100,100);

  document.getElementById('vol-fill').style.width=pct+'%';

  document.getElementById('vol-value').textContent=state.volume.toFixed(2);

}

function selectVol(el,v){

  document.querySelectorAll('.vol-btn').forEach(b=>b.classList.remove('active'));

  el.classList.add('active');state.maxVolume=v;

  document.getElementById('vol-max-label').textContent=v+' mL';

}

function setStatus(s){

  const badge=document.getElementById('status-badge');const text=document.getElementById('status-text');

  if(s==='running'){badge.className='tb-badge badge-run';text.textContent='Running';}

  else if(s==='done'){badge.className='tb-badge badge-done';text.textContent='Complete';}

  else{badge.className='tb-badge badge-idle';text.textContent='Idle';}

}

function showToast(msg,dur=2400){

  const t=document.getElementById('toast');

  document.getElementById('toast-text').textContent=msg;

  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);

}

function getTime(){const n=new Date();return n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');}



/* ══════════════════════════════════════════════════════

   VIEW ANGLE SYSTEM (replaces Rotate)

══════════════════════════════════════════════════════ */

let currentLabAngle=0;

function setLabAngle(deg){

  currentLabAngle=deg;

  const scene=document.getElementById('beaker-scene');

  if(!scene)return;

  // Remove all angle classes

  scene.classList.remove('angle-20','angle-40','angle-60','angle-90');

  if(deg>0)scene.classList.add('angle-'+deg);

  // Update button states

  document.querySelectorAll('.angle-btn').forEach(btn=>{

    const a=parseInt(btn.getAttribute('data-angle'));

    btn.classList.toggle('active-angle',a===deg);

  });

  // Add a brief pulse to indicate the angle changed

  scene.style.filter='brightness(1.08)';

  setTimeout(()=>scene.style.filter='',350);

}



/* ══════════════════════════════════════════════════════

   RESET & CHANGE

══════════════════════════════════════════════════════ */

function resetLab(){

  if(state.dropInterval){clearInterval(state.dropInterval);state.dropInterval=null;}

  if(state.bubbleInterval){clearInterval(state.bubbleInterval);state.bubbleInterval=null;}

  state.selectedChems=[];state.running=false;state.step=0;

  state.ph=7;state.volume=0;state.temp=25;state.currentColor='rgba(6,182,212,0.2)';

  document.querySelectorAll('.chem-bottle').forEach(b=>b.classList.remove('selected'));

  resetBeakerLiquid();

  const bg=document.getElementById('bubbles-group');if(bg)bg.innerHTML='';

  document.getElementById('temp-bar').style.width=Math.round(25/150*100)+'%';

  updatePHDisplay(7);updateVolumeBar();

  document.getElementById('temp-value').textContent='25.0';

  document.getElementById('rxn-status-label').className='status-label idle';

  document.getElementById('rxn-status-label').textContent='Idle';

  document.getElementById('rxn-status-sub').textContent='Select chemicals and click Run';

  document.getElementById('color-preview').style.background='rgba(6,182,212,.08)';

  document.getElementById('color-preview').textContent='No reaction';

  document.getElementById('run-btn').disabled=false;

  document.getElementById('color-detection-badge').classList.remove('show');

  setStatus('idle');updateSelectedCount();setStepActive(0);

  setMechStepState(0);

  updateCurrentAction(REACTIONS[state.currentReaction],0);

  updateRunBtnState();

  addAIMsg("🔄 **Lab reset!** Ready for a new experiment.\n\nSelect chemicals from the shelf and click **Run Reaction**. 🔬",true);

  updateIdleBanner();

}



function changeExperiment(key){

  if(!REACTIONS[key])return;

  resetLab();loadReaction(key);

  const rxn=REACTIONS[key];

  chatHistory=[];

  renderSuggestChips(key);

  addAIMsg(`### 🔀 Switched to ${rxn.name}\n\n**Equation:** \`${rxn.equation}\`\n\n${rxn.prediction}\n\nFollow the **Step Guide** and add chemicals from the shelf below. Ask me anything! 🧪`,true);

}



/* ══════════════════════════════════════════════════════

   REACTION SELECTOR

══════════════════════════════════════════════════════ */

function buildReactionSelector(){

  const grid=document.getElementById('rs-grid');grid.innerHTML='';

  const cats=['Basic','Organic','Industrial','Electrochem','Polymer','Spectacular'];

  const catLabels={'Basic':'⚗️ Basic Reactions','Organic':'🧪 Organic Chemistry','Industrial':'🏭 Industrial Processes','Electrochem':'⚡ Electrochemistry','Polymer':'🔗 Polymer Chemistry','Spectacular':'🌟 Spectacular Reactions'};

  cats.forEach(cat=>{

    const lbl=document.createElement('div');lbl.className='rs-cat';lbl.textContent=catLabels[cat];grid.appendChild(lbl);

    RXN_TYPES.filter(r=>r.cat===cat).forEach(rt=>{

      const card=document.createElement('div');

      card.className='rs-card'+(state.currentReaction===rt.key?' active-rxn':'');

      card.id='rs_'+rt.key;

      card.onclick=()=>{closeSelector();changeExperiment(rt.key);};

      card.innerHTML=`<span class="rs-icon">${rt.icon}</span><div class="rs-name">${rt.name}</div><div class="rs-count">${rt.count}</div>`;

      grid.appendChild(card);

    });

  });

}

function openReactionSelector(){

  document.querySelectorAll('.rs-card').forEach(c=>c.classList.remove('active-rxn'));

  document.getElementById('rs_'+state.currentReaction)?.classList.add('active-rxn');

  document.getElementById('reaction-selector').classList.add('show');

}

function closeSelector(){document.getElementById('reaction-selector').classList.remove('show');}



/* ══════════════════════════════════════════════════════

   TOOLS

══════════════════════════════════════════════════════ */

function useTool(tool){

  const msgs={

    dropper:`💧 **Eye Dropper** selected.\n\nUse for precise *dropwise* addition of indicator. In titrations, add last few drops very carefully to avoid overshooting the endpoint.`,

    wash:`🫙 **Wash Bottle** (distilled water).\n\nAlways rinse burette, pipette, and conical flask before use to avoid contamination and systematic errors.`,

    thermo:`🌡️ **Thermometer** reading: \`${state.temp.toFixed(1)}°C\`.\n\n**Arrhenius equation:** k = Ae^(−Ea/RT)\nHigher temperature → exponentially higher rate constant.`,

    stir:`🔁 **Stir Rod** activated!\n\nUniform mixing ensures homogeneous concentration and temperature throughout the solution.`

  };

  showToast('Tool: '+tool.charAt(0).toUpperCase()+tool.slice(1),2500);

  addAIMsg(msgs[tool]||'Tool selected.',true);

}



/* ══════════════════════════════════════════════════════

   VIVA & WHAT-IF

══════════════════════════════════════════════════════ */

function toggleViva(){

  state.vivaMode=!state.vivaMode;state.whatIfMode=false;

  document.getElementById('viva-pill').classList.toggle('viva-on',state.vivaMode);

  document.getElementById('whatif-pill').classList.remove('whatif-on');

  if(state.vivaMode){

    const rxn=REACTIONS[state.currentReaction];

    addAIMsg(`### 🎓 Viva Mode ON!\n\nI'll quiz you on **${rxn.name}**.\n\n**Q1.** Write and balance the complete chemical equation.\n**Q2.** What type of reaction is this?\n**Q3.** Explain the role of each chemical used.\n**Q4.** What observations would you record?\n**Q5.** State one industrial application.\n\nType your answers and I'll give detailed feedback! 📝`);

  } else {addAIMsg("📚 **Viva Mode OFF.** Back to lab mode! 🔬",true);}

}

function toggleWhatIf(){

  state.whatIfMode=!state.whatIfMode;state.vivaMode=false;

  document.getElementById('whatif-pill').classList.toggle('whatif-on',state.whatIfMode);

  document.getElementById('viva-pill').classList.remove('viva-on');

  if(state.whatIfMode){

    addAIMsg(`### 🔮 What-If Mode ON!\n\nAsk hypothetical chemistry questions:\n\n- *"What if I double the concentration?"*\n- *"What if temperature increases to 80°C?"*\n- *"What if I skip the catalyst?"*\n\nI'll reason from **first principles** and Le Chatelier's principle! 💡`);

  } else {addAIMsg("🔬 **What-If Mode OFF.**",true);}

}



/* ══════════════════════════════════════════════════════

   CHAT — AI POWERED

══════════════════════════════════════════════════════ */

function mdRender(text){

  text=text.replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>');

  text=text.replace(/`([^`\n]+)`/g,'<code>$1</code>');

  text=text.replace(/^### (.+)$/gm,'<h3>$1</h3>');

  text=text.replace(/^#### (.+)$/gm,'<h4>$1</h4>');

  text=text.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');

  text=text.replace(/\*([^*\n]+)\*/g,'<em>$1</em>');

  text=text.replace(/^\|(.+)\|$/gm,(m,row)=>{

    const cells=row.split('|').map(c=>`<td>${c.trim()}</td>`).join('');

    return `<tr>${cells}</tr>`;

  });

  text=text.replace(/((<tr>.*<\/tr>\n?)+)/gs,m=>`<table>${m}</table>`);

  text=text.replace(/^- (.+)$/gm,'<li>$1</li>');

  text=text.replace(/(<li>.*<\/li>\n?)+/g,m=>`<ul>${m}</ul>`);

  text=text.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');

  text=text.replace(/\n/g,'<br>');

  return text;

}



let msgCount_=0;

function addAIMsg(text,isAuto=false,animate=false){

  const msgs=_getChatEl('chat-messages');if(!msgs)return;

  const id='msg_'+Date.now()+'_'+(msgCount_++);

  const div=document.createElement('div');div.className='msg ai';div.id=id;

  const t=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});

  div.innerHTML=`<div class="msg-avatar ai-av">🤖</div><div class="msg-content"><div class="msg-bubble">${mdRender(text)}</div><div class="msg-meta"><span class="msg-time">${t}</span><button class="copy-btn" onclick="copyMsg('${id}')"><i class="fas fa-copy"></i></button></div></div>`;

  msgs.appendChild(div);

  msgs.scrollTop=msgs.scrollHeight;

  const cntEl=_getChatEl('ctx-msg-count');

  if(cntEl)cntEl.textContent=(msgs.querySelectorAll('.msg').length)+' msgs';

}



function addUserMsg(text){

  const msgs=_getChatEl('chat-messages');if(!msgs)return;

  const div=document.createElement('div');div.className='msg user';

  const t=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});

  div.innerHTML=`<div class="msg-avatar user-av">YOU</div><div class="msg-content"><div class="msg-bubble">${mdRender(text)}</div><div class="msg-meta"><span class="msg-time">${t}</span></div></div>`;

  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;

}



function addTyping(){

  const msgs=_getChatEl('chat-messages');if(!msgs)return document.createElement('div');

  const div=document.createElement('div');div.className='msg ai';div.id='typing_ind';

  div.innerHTML=`<div class="msg-avatar ai-av">🤖</div><div class="msg-content"><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;

  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;return div;

}



/* Helper: get the currently active/visible chat container */

function _getChatEl(id){

  // First try main panel

  const main=document.getElementById(id);

  if(main&&main.offsetParent!==null)return main;

  // Fallback: look in right drawer

  const drawer=document.getElementById('right-sidebar-drawer');

  if(drawer&&drawer.classList.contains('open')){

    const el=drawer.querySelector('#'+id);

    if(el)return el;

  }

  // Return main regardless (handles desktop ≥1280px)

  return main;

}



async function sendChat(){

  const input=_getChatEl('chat-input');

  const text=input?input.value.trim():'';if(!text)return;

  addUserMsg(text);if(input)input.value='';if(input)input.style.height='auto';

  chatHistory.push({role:'user',content:text});

  const sendBtn=_getChatEl('send-btn');

  if(sendBtn)sendBtn.disabled=true;

  const statusEl=document.getElementById('ai-status-text');

  if(statusEl)statusEl.textContent='Thinking…';

  const badge=document.getElementById('ai-status-badge');

  if(badge)badge.classList.add('show');

  const typing=addTyping();

  const rxn=REACTIONS[state.currentReaction];



  const apiKey=(window._CHEMLAB_KEY||'').trim();



  if(apiKey&&apiKey.startsWith('sk-ant-')){

    // ── ANTHROPIC API CALL ──

    try{

      const systemPrompt=`You are ChemLab AI, an expert virtual chemistry lab assistant for the experiment "${rxn.name}".

Equation: ${rxn.equation}

Chemicals: ${rxn.chemicals.map(c=>`${c.name} (${c.conc}): ${c.desc}`).join('; ')}

Current pH: ${state.ph.toFixed(2)}, Temp: ${state.temp.toFixed(1)}°C, Volume: ${state.volume.toFixed(1)}mL, Status: ${state.running?'Running':'Idle'}

Observation: ${rxn.observation}

Conclusion: ${rxn.conclusion}

You help students with viva questions, what-if scenarios, partial reaction analysis, safety, pH calculations, and experiment procedures. Use markdown formatting. Be educational and thorough.`;



      const messages=chatHistory.slice(-12).map(m=>({role:m.role,content:m.content}));

      const res=await fetch('https://api.anthropic.com/v1/messages',{

        method:'POST',

        headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},

        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,system:systemPrompt,messages})

      });

      if(!res.ok){

        const err=await res.json().catch(()=>({}));

        throw new Error(err?.error?.message||`API error ${res.status}`);

      }

      const data=await res.json();

      const reply=data.content?.find(b=>b.type==='text')?.text||'No response received.';

      typing.remove();if(badge)badge.classList.remove('show');

      if(sendBtn)sendBtn.disabled=false;

      if(statusEl)statusEl.textContent='Online (Claude AI)';

      chatHistory.push({role:'assistant',content:reply});

      addAIMsg(reply,false,true);

    }catch(err){

      console.warn('API error, falling back to local chatbot:',err);

      typing.remove();if(badge)badge.classList.remove('show');

      if(sendBtn)sendBtn.disabled=false;

      if(statusEl)statusEl.textContent='Offline (local mode)';

      const reply=localChatbot(text,rxn)+`\n\n> ⚠️ *API error: ${err.message}. Using local responses.*`;

      chatHistory.push({role:'assistant',content:reply});

      addAIMsg(reply,false,true);

    }

  } else {

    // ── LOCAL CHATBOT (no API key) ──

    setTimeout(()=>{

      typing.remove();if(badge)badge.classList.remove('show');

      if(sendBtn)sendBtn.disabled=false;

      if(statusEl)statusEl.textContent='Online — Ask anything';

      const reply=localChatbot(text,rxn);

      chatHistory.push({role:'assistant',content:reply});

      addAIMsg(reply,false,true);

    },800);

  }

}



function insertSym(sym){

  const inp=_getChatEl('chat-input');if(!inp)return;

  const start=inp.selectionStart,end=inp.selectionEnd;

  inp.value=inp.value.slice(0,start)+sym+inp.value.slice(end);

  inp.selectionStart=inp.selectionEnd=start+sym.length;inp.focus();autoResize(inp);

}

function handleInputKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}

function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,90)+'px';}

function quickAsk(text){const inp=_getChatEl('chat-input');if(inp)inp.value=text;sendChat();}

function copyMsg(id){

  const el=document.getElementById(id);if(!el)return;

  navigator.clipboard.writeText(el.querySelector('.msg-bubble').innerText).then(()=>showToast('✅ Copied!',1800));

}

function clearChat(){

  if(!confirm('Clear all chat messages?'))return;

  document.getElementById('chat-messages').innerHTML='';

  chatHistory=[];initWelcome();

  document.getElementById('ctx-msg-count').textContent='0 msgs';

}

function exportChat(){

  const msgs=document.querySelectorAll('#chat-messages .msg');

  if(!msgs.length){showToast('⚠️ No messages to export',2000);return;}

  let txt=`ChemLab AI — Chat Export\nExperiment: ${REACTIONS[state.currentReaction].name}\nDate: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;

  msgs.forEach(m=>{

    const isUser=m.classList.contains('user');

    const bubble=m.querySelector('.msg-bubble');const time=m.querySelector('.msg-time');

    if(bubble){txt+=(isUser?'👤 YOU':'🤖 ChemLab AI')+` [${time?.textContent||''}]:\n${bubble.innerText}\n\n`;}

  });

  const blob=new Blob([txt],{type:'text/plain'});

  const a=document.createElement('a');a.href=URL.createObjectURL(blob);

  a.download=`ChemLab_Chat_${new Date().toISOString().slice(0,10)}.txt`;a.click();

  URL.revokeObjectURL(a.href);showToast('✅ Chat exported!',2000);

}

function renderSuggestChips(key){

  const row=document.getElementById('suggest-row');if(!row)return;

  const rxn=REACTIONS[key||state.currentReaction];

  const prompts=(SUGGEST_PROMPTS[key]||SUGGEST_PROMPTS.acid_base).slice(0,4);

  // Add partial-steps what-if questions always

  const partialChips=[

    {i:'fa-question-circle',t:`What if only the first 2 chemicals are added in ${rxn.name}?`},

    {i:'fa-flask',t:`What if only 1 chemical and the precipitant are added without others?`},

    {i:'fa-exclamation-triangle',t:`What happens if some reaction steps are skipped?`},

    {i:'fa-vial',t:`What is the partial result with ${rxn.chemicals[0]?.name} + ${rxn.chemicals[1]?.name} only?`}

  ];

  const allChips=[...prompts,...partialChips];

  row.innerHTML=allChips.map(p=>`<div class="suggest-chip" onclick="quickAsk('${p.t.replace(/'/g,"\\'")}')"><i class="fas ${p.i}"></i> ${p.t}</div>`).join('');

}

function initWelcome(){

  const rxn=REACTIONS[state.currentReaction];

  const userName=currentUser&&!currentUser.isGuest?currentUser.name.split(' ')[0]:'there';

  const histNote=state.experimentHistory.length>0?`\n\n📚 **History loaded:** ${state.experimentHistory.length} previous experiment${state.experimentHistory.length>1?'s':''} found in your account.`:'';

  addAIMsg(`### 👋 Welcome back, ${userName}!\n\nI'm **ChemLab AI** — your expert chemistry assistant. Here's what I can do:\n\n| Capability | How to ask |\n|---|---|\n| 🔬 **Full Mechanism** | "Explain the mechanism of..." |\n| 🎓 **15 Viva Q&A** | "Give me 15 viva questions on..." |\n| 🔮 **15 What-If Scenarios** | "Give 15 what-if questions for..." |\n| ⚗️ **Step-by-step guide** | "How do I perform this experiment?" |\n| 📊 **pH & calculations** | "Calculate molarity / Ksp / yield..." |\n| 🛡️ **Safety protocol** | "What are the safety precautions?" |\n\n**Current Experiment:** \`${rxn.equation}\`${histNote}\n\nUse the **quick-ask chips** below or type your question! 🧪`,true);

}



/* ══════════════════════════════════════════════════════

   EXPERIMENT HISTORY

══════════════════════════════════════════════════════ */

// renderExpHistory moved to USER HISTORY PERSISTENCE section above





/* ══════════════════════════════════════════════════════

   USER HISTORY PERSISTENCE

══════════════════════════════════════════════════════ */

const HISTORY_KEY='chemlab_history_v1';



function getUserHistoryKey(email){return HISTORY_KEY+'_'+email.replace(/[^a-z0-9]/g,'_');}



function saveUserHistory(email){

  if(!email||email==='guest@chemlab.ai')return;

  try{

    const key=getUserHistoryKey(email);

    const existing=JSON.parse(localStorage.getItem(key)||'[]');

    // Merge: add new items not already in history

    const existingNames=new Set(existing.map(e=>e.name+'_'+e.time));

    const newItems=state.experimentHistory.filter(e=>!existingNames.has(e.name+'_'+e.time));

    const merged=[...existing,...newItems].slice(-50); // keep last 50

    localStorage.setItem(key,JSON.stringify(merged));

  }catch(e){console.warn('Could not save history:',e);}

}



function loadUserHistory(email){

  // Reset state for fresh session

  state.experimentHistory=[];state.score=0;state.selectedChems=[];

  state.ph=7.0;state.temp=25.0;state.volume=0;state.running=false;

  state.currentReaction='acid_base';

  if(!email||email==='guest@chemlab.ai')return;

  try{

    const key=getUserHistoryKey(email);

    const saved=JSON.parse(localStorage.getItem(key)||'[]');

    state.experimentHistory=saved;

    // Restore score from history

    if(saved.length>0){

      const lastScore=saved[saved.length-1].score||0;

      state.score=lastScore;

    }

    renderExpHistory();

    renderMobHistory();

    if(saved.length>0){

      showToast('📚 Loaded '+saved.length+' past experiments from history');

    }

  }catch(e){console.warn('Could not load history:',e);}

}



function clearUserHistory(){

  if(!currentUser||!currentUser.email)return;

  if(!confirm('Clear all your experiment history? This cannot be undone.'))return;

  const key=getUserHistoryKey(currentUser.email);

  localStorage.removeItem(key);

  state.experimentHistory=[];state.score=0;

  renderExpHistory();renderMobHistory();

  const scoreEl=document.getElementById('score-val');if(scoreEl)scoreEl.textContent='0';

  updateMobSensors();

  showToast('🗑️ History cleared');

}



/* ══════════════════════════════════════════════════════

   ENHANCED HISTORY RENDERERS

══════════════════════════════════════════════════════ */

function renderExpHistory(){

  const el=document.getElementById('exp-history-list');if(!el)return;

  if(!state.experimentHistory.length){

    el.innerHTML='<div style="font-size:10px;color:var(--text3);padding:4px 0">No experiments run yet.</div>';

    return;

  }

  const all=state.experimentHistory.slice().reverse();

  el.innerHTML=all.slice(0,8).map(e=>`

    <div class="exp-history-item" style="cursor:default" title="${e.name} — ${e.time}">

      <span style="font-size:1rem">${e.icon}</span>

      <div style="flex:1;min-width:0">

        <div style="font-size:10px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.name}</div>

        <div style="font-size:9px;color:var(--text3);font-family:var(--fm)">${e.time} · ${e.score||0} pts${e.ph?` · pH ${parseFloat(e.ph).toFixed(1)}`:''}${e.color?' · '+e.color:''}</div>

      </div>

    </div>`).join('');

  // Add clear button

  el.innerHTML+=`<div style="margin-top:8px"><button onclick="clearUserHistory()" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:var(--red);padding:4px 10px;border-radius:6px;font-size:9px;cursor:pointer;font-family:var(--fm)"><i class="fas fa-trash"></i> Clear History</button></div>`;

}



/* ══════════════════════════════════════════════════════

   PDF REPORT

══════════════════════════════════════════════════════ */

async function generatePDFReport(){

  const rxn=REACTIONS[state.currentReaction];

  if(!window.jspdf){

    await new Promise((res,rej)=>{

      const s=document.createElement('script');

      s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

      s.onload=res;s.onerror=rej;document.head.appendChild(s);

    });

  }

  const {jsPDF}=window.jspdf;

  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});

  const W=210,M=18,IW=W-2*M;let y=20;



  /* ── Unicode -> ASCII sanitizer for jsPDF Helvetica ── */

  const sanitize=(t)=>{

    if(!t)return '';

    return t

      .replace(/\u2192/g,'->').replace(/\u21CC/g,'<->').replace(/\u2193/g,'(ppt)').replace(/\u2191/g,'(gas)')

      .replace(/\u27F6/g,'->').replace(/\u21D2/g,'=>').replace(/\u21C4/g,'<->').replace(/\u2194/g,'<->')

      .replace(/\u2080/g,'0').replace(/\u2081/g,'1').replace(/\u2082/g,'2').replace(/\u2083/g,'3')

      .replace(/\u2084/g,'4').replace(/\u2085/g,'5').replace(/\u2086/g,'6').replace(/\u2087/g,'7')

      .replace(/\u2088/g,'8').replace(/\u2089/g,'9')

      .replace(/\u2070/g,'0').replace(/\u00B9/g,'1').replace(/\u00B2/g,'2').replace(/\u00B3/g,'3')

      .replace(/\u2074/g,'4').replace(/\u2075/g,'5').replace(/\u2076/g,'6').replace(/\u2077/g,'7')

      .replace(/\u2078/g,'8').replace(/\u2079/g,'9')

      .replace(/\u207A/g,'+').replace(/\u207B/g,'-').replace(/\u207F/g,'n')

      .replace(/\u208A/g,'+').replace(/\u208B/g,'-').replace(/\u2099/g,'n')

      .replace(/\u00B0/g,' deg').replace(/\u0394/g,'delta').replace(/\u2206/g,'delta')

      .replace(/\u03B1/g,'alpha').replace(/\u03B2/g,'beta').replace(/\u03B3/g,'gamma')

      .replace(/\u03BB/g,'lambda').replace(/\u03BC/g,'mu').replace(/\u03C0/g,'pi')

      .replace(/\u00B1/g,'+/-').replace(/\u00D7/g,'x').replace(/\u00F7/g,'/')

      .replace(/\u2248/g,'~').replace(/\u2260/g,'!=').replace(/\u2264/g,'<=').replace(/\u2265/g,'>=')

      .replace(/\u221E/g,'inf').replace(/\u221A/g,'sqrt')

      .replace(/\u2013/g,'-').replace(/\u2014/g,'-')

      .replace(/\u2018/g,"'").replace(/\u2019/g,"'")

      .replace(/\u201C/g,'"').replace(/\u201D/g,'"')

      .replace(/\u2026/g,'...').replace(/\u00B7/g,'.').replace(/\u22C5/g,'.')

      .replace(/[^\x00-\x7F]/g,'');

  };



  /* ── helpers ── */

  const addText=(text,size,color,bold,x)=>{

    doc.setFontSize(size);doc.setTextColor(...(color||[30,30,30]));

    doc.setFont('helvetica',bold?'bold':'normal');doc.text(text,x||M,y);

  };

  const nl=(n=6)=>{y+=n;};

  const checkPage=(need=20)=>{if(y+need>285){doc.addPage();y=18;}};

  const sectionHeader=(title,r,g,b)=>{

    checkPage(14);

    doc.setFillColor(r||30,g||64,b||175);doc.roundedRect(M,y-3,IW,8,1,1,'F');

    doc.setFontSize(9);doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');

    doc.text(title,M+4,y+2);nl(12);

  };

  const blankLine=(label,lineW)=>{

    checkPage(10);

    doc.setFontSize(9);doc.setTextColor(50,50,50);doc.setFont('helvetica','normal');

    doc.text(label,M+3,y);

    const lx=M+3+(lineW||80);

    doc.setDrawColor(100,100,100);doc.setLineWidth(0.3);doc.line(lx,y+1,M+IW-3,y+1);

    nl(9);

  };



  /* ── per-reaction metadata ── */

  const AIM={

    acid_base:'To determine the molarity (strength) of the given NaOH solution by titrating it against a standard HCl solution using phenolphthalein indicator, and to find the equivalence point of the neutralisation reaction.',

    redox:'To determine the amount of ferrous ions (Fe2+) present in the given FeSO4 solution by titrating it against a standard KMnO4 solution in acidic medium (H2SO4), using KMnO4 as a self-indicator.',

    precipitation:'To demonstrate the precipitation reaction between Pb(NO3)2 and KI and to verify the law of conservation of mass by calculating the theoretical and experimental yield of PbI2 precipitate.',

    combination:'To study the combination reaction of magnesium with atmospheric oxygen and to determine the empirical formula of magnesium oxide (MgO) from the mass gain upon combustion.',

    decomposition:'To study the catalytic decomposition of hydrogen peroxide (H2O2) using MnO2 as catalyst and to calculate the volume of oxygen gas evolved per unit time (rate of reaction).',

    single_displacement:'To study the single displacement reaction of zinc with copper sulphate and to verify the relative position of metals in the electrochemical activity series using mass change data.',

    double_displacement:'To prepare barium sulphate (BaSO4) by a double displacement precipitation reaction and to determine the percentage yield of BaSO4 from the given quantities of BaCl2 and Na2SO4.',

    organic_addition:'To demonstrate the electrophilic addition of bromine (Br2) to an unsaturated compound (ethylene) and to confirm the presence of the C=C double bond by decolorisation of bromine water.',

    esterification:'To prepare ethyl acetate by Fischer esterification of acetic acid and ethanol in presence of concentrated H2SO4 catalyst, and to study the effect of equilibrium on yield.',

    saponification:'To prepare soap (sodium salt of fatty acid) by the saponification of coconut oil with concentrated NaOH and to study the properties of the soap produced.',

    electrolysis_water:'To study the electrolysis of water and to determine the volume ratio of hydrogen and oxygen gases evolved at the cathode and anode respectively under direct current.',

    electroplating:'To deposit a thin layer of copper on a metallic object by the process of electroplating using copper sulphate (CuSO4) electrolyte, and to find the mass of copper deposited using Faraday\'s laws.',

    haber:'To study the industrial synthesis of ammonia by the Haber process and to understand how temperature, pressure, and catalyst affect the equilibrium yield of NH3.',

    acid_rain:'To study the effect of acid rain on materials and to analyse the pH of simulated acid rain solutions prepared using SO2 and NOx dissolution.'

  };



  const CALC={

    acid_base:[

      'Given: Volume of NaOH (V1) = 25 mL = 0.025 L   |   Molarity of HCl (M2) = 0.1 M',

      'Burette Reading: Initial = 0.00 mL   Final = 25.00 mL',

      'Volume of HCl used (V2) = Final - Initial = 25.00 mL = 0.025 L',

      'Formula: M1V1 = M2V2  =>  M1 = (M2 x V2) / V1',

      'Substituting: M1 = (0.1 x 0.025) / 0.025 = 0.0025 / 0.025',

      'Molarity of NaOH (M1) = 0.100 mol/L',

      'Strength of NaOH = Molarity x Molar Mass = 0.100 x 40 = 4.00 g/L'

    ],

    redox:[

      'Given: Volume of FeSO4 (V1) = 20 mL = 0.020 L   |   Molarity of KMnO4 (M2) = 0.02 M',

      'Balanced equation: MnO4- + 5Fe2+ + 8H+ -> Mn2+ + 5Fe3+ + 4H2O',

      'Mole ratio: 1 mol KMnO4 reacts with 5 mol FeSO4',

      'Burette Reading: Initial = 0.00 mL   Final = 20.00 mL',

      'Volume of KMnO4 used (V2) = 20.00 mL = 0.020 L',

      'Moles of KMnO4 = M2 x V2 (in L) = 0.02 x 0.020 = 4.00 x 10^-4 mol',

      'Moles of FeSO4 = 5 x moles of KMnO4 = 5 x 4.00x10^-4 = 2.00 x 10^-3 mol',

      'Molarity of FeSO4 = Moles / V1 (in L) = 0.00200 / 0.020 = 0.100 mol/L'

    ],

    precipitation:[

      'Given: Volume of Pb(NO3)2 = 20 mL = 0.020 L   |   Molarity = 0.1 M',

      'Moles of Pb(NO3)2 = 0.1 x 0.020 = 0.0020 mol',

      'Reaction: Pb(NO3)2 + 2KI -> PbI2 + 2KNO3  (1:1 mole ratio for Pb:PbI2)',

      'Theoretical moles of PbI2 = 0.0020 mol  (same as Pb(NO3)2)',

      'Molar mass of PbI2 = 207.2 + 2(126.9) = 461.0 g/mol',

      'Theoretical yield of PbI2 = 0.0020 x 461.0 = 0.922 g',

      'Mass of filter paper (empty) = 0.85 g  (typical)',

      'Mass of filter paper + dry PbI2 = 1.74 g  (typical observed)',

      'Experimental yield of PbI2 = 1.74 - 0.85 = 0.89 g',

      'Percentage yield = (0.89 / 0.922) x 100 = 96.5 %'

    ],

    combination:[

      'Given: Mass of Mg ribbon before burning (m1) = 0.24 g  (typical)',

      'Mass of crucible + MgO after burning (m2) = 18.64 g  (typical)',

      'Mass of crucible (empty) (m3) = 18.24 g',

      'Mass of MgO formed = m2 - m3 = 18.64 - 18.24 = 0.40 g',

      'Mass of O2 absorbed = Mass of MgO - Mass of Mg = 0.40 - 0.24 = 0.16 g',

      'Moles of Mg = mass / 24 = 0.24 / 24 = 0.010 mol',

      'Moles of O = mass / 16 = 0.16 / 16 = 0.010 mol',

      'Mole ratio Mg : O = 0.010 : 0.010 = 1 : 1  =>  Empirical formula = MgO (confirmed)'

    ],

    decomposition:[

      'Given: Volume of H2O2 taken = 10 mL   |   Concentration = 30% (~9.8 M)',

      'Reaction: 2H2O2 -> 2H2O + O2  (2 mol H2O2 gives 1 mol O2)',

      'Record O2 volume at t = 0 s: 0 mL',

      'Record O2 volume at t = 30 s: 48 mL   |   t = 60 s: 82 mL',

      'Record O2 volume at t = 90 s: 106 mL   |   t = 120 s: 118 mL',

      'Rate of reaction = Change in volume / Change in time',

      'Rate (0-30 s) = 48/30 = 1.60 mL/s   |   Rate (30-60 s) = 34/30 = 1.13 mL/s',

      'Total O2 evolved (final) = 122 mL',

      'Moles of H2O2 = 9.8 x 0.010 = 0.098 mol  => Theoretical O2 = (0.098/2) x 22400 = 1097.6 mL',

      'Percentage yield of O2 = (122 / 1097.6) x 100 = 11.1 %  (limited by catalyst availability)'

    ],

    single_displacement:[

      'Given: Volume of CuSO4 = 100 mL = 0.100 L   |   Molarity = 0.5 M',

      'Moles of CuSO4 = 0.5 x 0.100 = 0.050 mol',

      'Reaction: Zn + Cu2+ -> Zn2+ + Cu  (1:1 mole ratio)',

      'Mass of Zn strip before reaction = 5.00 g',

      'Mass of Zn strip after reaction (cleaned, dried) = 1.74 g',

      'Mass of Zn dissolved = 5.00 - 1.74 = 3.26 g   |   Moles of Zn = 3.26 / 65.4 = 0.0499 mol',

      'Theoretical mass of Cu deposited = 0.0499 x 63.5 = 3.167 g',

      'Actual mass increase on Zn strip (Cu deposited) = 3.12 g  (measured)',

      'Percentage yield of Cu = (3.12 / 3.167) x 100 = 98.5 %'

    ],

    double_displacement:[

      'Given: Volume of BaCl2 (V1) = 20 mL = 0.020 L   |   Molarity (M1) = 0.1 M',

      'Volume of Na2SO4 (V2) = 20 mL = 0.020 L   |   Molarity (M2) = 0.1 M',

      'Moles of BaCl2 = 0.1 x 0.020 = 0.002 mol',

      'Moles of Na2SO4 = 0.1 x 0.020 = 0.002 mol  (equimolar - BaCl2 is limiting)',

      'Reaction: BaCl2 + Na2SO4 -> BaSO4 + 2NaCl  (1:1 mole ratio)',

      'Moles of BaSO4 (theoretical) = 0.002 mol',

      'Molar mass of BaSO4 = 137.3 + 32.1 + 4(16) = 233.4 g/mol',

      'Theoretical yield of BaSO4 = 0.002 x 233.4 = 0.467 g',

      'Mass of filter paper (empty) = 0.85 g',

      'Mass of filter paper + dry BaSO4 = 1.30 g',

      'Experimental yield of BaSO4 = 1.30 - 0.85 = 0.45 g',

      'Percentage yield = (0.45 / 0.467) x 100 = 96.4 %'

    ],

    organic_addition:[

      'Reaction: CH2=CH2 + Br2 -> CH2Br-CH2Br (1,2-dibromoethane)',

      'Volume of Br2/CCl4 taken = 5 mL   |   Concentration = 0.1 M',

      'Moles of Br2 = 0.1 x 5 / 1000 = 5.0 x 10^-4 mol',

      'Since 1 mol Br2 reacts with 1 mol C2H4:',

      'Moles of C2H4 required = 5.0 x 10^-4 mol',

      'Molar mass of product (CH2Br-CH2Br) = 188 g/mol',

      'Theoretical mass of product = 5.0x10^-4 x 188 = 0.094 g',

      'Observation: Orange-brown Br2 decolorised?  YES  (circle one)',

      'Conclusion: Decolorisation confirms presence of C=C double bond (alkene test)'

    ],

    esterification:[

      'Given: Volume of ethanol (C2H5OH) = 5 mL   |   Density = 0.789 g/mL',

      'Mass of ethanol = 5 x 0.789 = 3.945 g   |   Moles = 3.945 / 46 = 0.0857 mol',

      'Given: Volume of acetic acid (CH3COOH) = 5 mL   |   Density = 1.05 g/mL',

      'Mass of acetic acid = 5 x 1.05 = 5.25 g   |   Moles = 5.25 / 60 = 0.0875 mol',

      'Limiting reagent: Ethanol (0.0857 mol < 0.0875 mol)',

      'Reaction: CH3COOH + C2H5OH <-> CH3COOC2H5 + H2O  (equilibrium)',

      'Molar mass of ethyl acetate = 88 g/mol',

      'Theoretical yield (if 100%) = 0.0857 mol x 88 = 7.54 g',

      'Mass of ester layer collected = 5.05 g  (typical with ~67% yield)',

      'Percentage yield = (5.05 / 7.54) x 100 = 67.0 %',

      'Note: Fischer esterification equilibrium Keq ~ 4 => ~67% max theoretical yield'

    ],

    saponification:[

      'Given: Mass of coconut oil = 10.0 g   |   Saponification value ~ 256 mg KOH/g',

      'Mass of NaOH required = (256 x 10.0) / (1000 x 56.1) = 0.456 g (theoretical)',

      'Mass of NaOH solution used (40%) = 5.0 g   |   Actual NaOH = 0.4 x 5.0 = 2.0 g',

      'Average molar mass of fatty acid in coconut oil (lauric acid) = 200 g/mol',

      'Reaction: Triglyceride + 3NaOH -> Glycerol + 3 RCOONa (soap)',

      'Moles of NaOH used = 2.0 / 40 = 0.050 mol',

      'Moles of soap (sodium salt) produced = 0.050 mol (approx, with excess NaOH)',

      'Mass of soap collected after salting out = 9.2 g  (typical)',

      'Percentage yield = (9.2 / (0.050 x 222)) x 100 = 82.9 %  (MW sodium laurate = 222 g/mol)'

    ],

    electrolysis_water:[

      'Reaction: 2H2O -> 2H2 (cathode) + O2 (anode)  |  Mole ratio H2:O2 = 2:1',

      'Applied voltage = 6.0 V   |   Current = 0.5 A   |   Time = 600 s',

      'Charge passed (Q) = I x t = 0.5 x 600 = 300 Coulombs',

      'Moles of electrons (n) = Q / 96485 = 300 / 96485 = 3.109 x 10^-3 mol',

      'At cathode: 2H+ + 2e- -> H2  =>  moles of H2 = n/2 = 1.554 x 10^-3 mol',

      'At anode: H2O -> 0.5O2 + 2H+ + 2e-  =>  moles of O2 = n/4 = 7.773 x 10^-4 mol',

      'Volume of H2 at STP = 1.554x10^-3 x 22.4 = 0.03481 L = 34.8 mL',

      'Volume of O2 at STP = 7.773x10^-4 x 22.4 = 0.01741 L = 17.4 mL',

      'Measured volume of H2 = 34.2 mL   |   Measured volume of O2 = 17.0 mL',

      'Observed ratio H2:O2 = 34.2 : 17.0 = 2.01 : 1  (should be 2:1) -- confirmed'

    ],

    electroplating:[

      'Given: Current (I) = 0.5 A   |   Time (t) = 3600 s (1 hour)',

      'Charge (Q) = I x t = 0.5 x 3600 = 1800 Coulombs',

      'Moles of electrons = Q / 96485 = 1800 / 96485 = 0.01865 mol',

      'Reaction at cathode: Cu2+ + 2e- -> Cu  (2 electrons per Cu atom)',

      'Moles of Cu deposited = moles of electrons / 2 = 0.01865 / 2 = 9.327 x 10^-3 mol',

      'Molar mass of Cu = 63.5 g/mol',

      'Theoretical mass of Cu deposited = 9.327x10^-3 x 63.5 = 0.592 g',

      'Mass of object before plating = 50.00 g',

      'Mass of object after plating (dried) = 50.58 g',

      'Actual mass of Cu deposited = 50.58 - 50.00 = 0.58 g',

      'Current efficiency = (0.58 / 0.592) x 100 = 98.0 %'

    ],

    haber:[

      'Reaction: N2 + 3H2 <-> 2NH3  (exothermic, delta H = -92 kJ/mol)',

      'Mole ratio: 1 mol N2 : 3 mol H2 : 2 mol NH3',

      'Given: N2 feed = 1.0 mol   |   H2 feed = 3.0 mol',

      'Limiting reagent check: H2 needed = 3 x 1.0 = 3.0 mol  |  H2 available = 3.0 mol  (both limiting)',

      'Theoretical moles of NH3 (100% yield) = 2 x 1.0 = 2.0 mol',

      'Industrial conditions: T = 450 deg C, P = 200 atm, Fe catalyst',

      'Equilibrium constant Kp at 450 deg C = 6.2 x 10^-3 atm^-2',

      'Approximate equilibrium yield at 200 atm = ~15% of theoretical',

      'Expected NH3 moles at equilibrium = 0.15 x 2.0 = 0.30 mol',

      'Mass of NH3 = 0.30 x 17 = 5.10 g'

    ],

    acid_rain:[

      'Reaction 1: SO2 + H2O -> H2SO3  |  Reaction 2: 2NO2 + H2O -> HNO3 + HNO2',

      'Measured pH of simulated acid rain solution = 3.8',

      'pH = -log[H+]  =>  [H+] = 10^(-3.8) = 1.585 x 10^-4 mol/L',

      'Normal rain pH = 5.6  =>  [H+] of normal rain = 10^(-5.6) = 2.512 x 10^-6 mol/L',

      'Ratio of acidity = 1.585x10^-4 / 2.512x10^-6 = 63.1  (acid rain is ~63x more acidic)',

      'Effect on marble (CaCO3): CaCO3 + H2SO4 -> CaSO4 + H2O + CO2',

      'Mass of marble chip before = 2.50 g   |   After 10 min in acid rain solution = 2.34 g',

      'Mass dissolved = 2.50 - 2.34 = 0.16 g   |   Rate of dissolution = 0.16 / 10 = 0.016 g/min'

    ]

  };



  /* reactions that use a burette/graph (titration-type with continuous addition) */

  const HAS_GRAPH=['acid_base','redox'];

  const rxnKey=state.currentReaction;



  /* ════════════════════════════════════════════

     PAGE 1 — HEADER + AIM + EQUATION + CHEMICALS

  ════════════════════════════════════════════ */

  // Header banner

  doc.setFillColor(7,12,23);doc.rect(0,0,W,36,'F');

  doc.setFontSize(17);doc.setTextColor(6,182,212);doc.setFont('helvetica','bold');

  doc.text('ChemLab AI  -  Virtual Lab Report',W/2,13,{align:'center'});

  doc.setFontSize(8.5);doc.setTextColor(148,163,184);doc.setFont('helvetica','normal');

  doc.text('KKW Institute of Engineering, Nashik  |  Department of Chemistry',W/2,21,{align:'center'});

  doc.text('Made by: Mihir Deshmukh, Pranav Gavande, Sarthak Kapse',W/2,28,{align:'center'});

  y=42;



  // Experiment info box

  doc.setFillColor(240,248,255);doc.roundedRect(M,y-3,IW,26,3,3,'F');

  doc.setFillColor(6,182,212);doc.rect(M,y-3,4,26,'F');

  doc.setFontSize(8);doc.setTextColor(6,182,212);doc.setFont('helvetica','bold');

  doc.text('EXPERIMENT DETAILS',M+8,y+1);nl(6);

  doc.setFontSize(9);doc.setTextColor(60,60,60);doc.setFont('helvetica','bold');

  doc.text('Experiment:',M+8,y);doc.setFont('helvetica','normal');doc.setTextColor(20,20,20);

  doc.text(rxn.name,M+38,y);nl(5);

  doc.setTextColor(60,60,60);doc.setFont('helvetica','bold');

  doc.text('Date:',M+8,y);doc.setFont('helvetica','normal');doc.setTextColor(20,20,20);

  doc.text(new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}),M+38,y);

  doc.setFont('helvetica','bold');doc.setTextColor(60,60,60);

  doc.text('Category:',M+110,y);doc.setFont('helvetica','normal');doc.setTextColor(20,20,20);

  doc.text(rxn.category||'Chemistry',M+130,y);

  nl(12);



  /* AIM */

  sectionHeader('AIM OF THE EXPERIMENT',14,80,200);

  const aimText=sanitize(AIM[rxnKey]||('To perform and study the '+rxn.name+' reaction and record the observations.'));

  const aimLines=doc.splitTextToSize(aimText,IW-6);

  checkPage(aimLines.length*5+6);

  doc.setFontSize(9);doc.setTextColor(25,25,60);doc.setFont('helvetica','normal');

  aimLines.forEach(line=>{doc.text(line,M+3,y);nl(5);});

  nl(3);



  /* CHEMICAL EQUATION */

  checkPage(20);

  sectionHeader('CHEMICAL EQUATION',14,80,200);

  doc.setFillColor(7,12,23);doc.roundedRect(M,y-3,IW,12,2,2,'F');

  doc.setFontSize(11);doc.setTextColor(6,182,212);doc.setFont('helvetica','bold');

  const eqRaw=sanitize(rxn.equation);

  const eqText=eqRaw.length>72?eqRaw.substring(0,69)+'...':eqRaw;

  doc.text(eqText,W/2,y+5,{align:'center'});nl(16);



  /* CHEMICALS USED */

  checkPage(rxn.chemicals.length*8+14);

  sectionHeader('CHEMICALS & APPARATUS USED',14,80,200);

  rxn.chemicals.forEach((c,i)=>{

    checkPage(10);

    doc.setFillColor(i%2===0?243:252,i%2===0?247:252,i%2===0?255:255);

    doc.rect(M,y-3,IW,8,'F');

    doc.setFontSize(9);doc.setTextColor(20,20,20);doc.setFont('helvetica','bold');

    doc.text(sanitize((i+1)+'. '+c.name+' ('+c.conc+')'),M+4,y+2);

    doc.setFont('helvetica','normal');doc.setTextColor(80,80,80);

    const dTxt=sanitize((c.desc||'').substring(0,52));

    doc.text(dTxt,M+68,y+2);nl(8);

  });

  nl(3);



  /* ════════════════════════════════════════════

     OBSERVATIONS & RESULTS

  ════════════════════════════════════════════ */

  checkPage(70);

  sectionHeader('OBSERVATIONS & RESULTS',14,80,200);



  // Observation table

  const obsRows=[

    ['Parameter','Observed Value'],

    ['Final pH',state.ph.toFixed(2)+' ('+getPHLabel(state.ph)+')'],

    ['Temperature',state.temp.toFixed(1)+' deg C'],

    ['Volume Used',state.volume.toFixed(2)+' mL'],

    ['Color Change',sanitize(rxn.finalColor)],

    ['Key Observation',sanitize(rxn.observation.substring(0,65))]

  ];

  obsRows.forEach((r,i)=>{

    checkPage(10);

    if(i===0){

      doc.setFillColor(6,182,212);doc.rect(M,y-3,IW,8,'F');

      doc.setFontSize(9);doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');

    } else {

      doc.setFillColor(i%2===0?248:255,i%2===0?252:255,255);

      doc.rect(M,y-3,IW,8,'F');

      doc.setFontSize(9);doc.setTextColor(40,40,40);doc.setFont('helvetica','normal');

    }

    doc.text(r[0],M+4,y+2);

    doc.text(r[1],M+58,y+2);nl(8);

  });

  nl(4);



  /* ════════════════════════════════════════════

     PAGE 2+ — STEP-BY-STEP CALCULATIONS

  ════════════════════════════════════════════ */

  doc.addPage();y=18;



  sectionHeader('STEP-BY-STEP CALCULATIONS',20,100,60);

  doc.setFontSize(8.5);doc.setTextColor(70,70,70);doc.setFont('helvetica','italic');

  doc.text('Instructions: Complete the calculations below manually. Fill in the blanks provided.',M+3,y);nl(9);



  const calcSteps=CALC[rxnKey]||[

    'Record the initial and final readings from the experiment.',

    'Identify the mole ratio from the balanced equation.',

    'Calculate moles of each reactant used.',

    'Determine the limiting reagent.',

    'Calculate the theoretical yield of product.',

    'Record experimental yield and calculate percentage yield.'

  ];



  calcSteps.forEach((step,i)=>{

    checkPage(12);

    // Step number circle

    doc.setFillColor(6,182,212);doc.circle(M+5,y-1,3,'F');

    doc.setFontSize(8);doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');

    doc.text(String(i+1),M+5,y+0.5,{align:'center'});

    // Step text — split long steps

    const stepLines=doc.splitTextToSize(sanitize(step),IW-16);

    doc.setFontSize(9);doc.setTextColor(20,20,40);doc.setFont('helvetica','normal');

    stepLines.forEach((sl,si)=>{

      doc.text(sl,M+11,y+(si===0?0:5));

    });

    nl(stepLines.length>1?stepLines.length*5+2:10);

  });



  // FINAL ANSWER BOX

  nl(3);checkPage(22);

  doc.setFillColor(7,12,23);doc.roundedRect(M,y-3,IW,20,3,3,'F');

  doc.setDrawColor(6,182,212);doc.setLineWidth(0.5);doc.roundedRect(M,y-3,IW,20,3,3,'S');

  doc.setFontSize(9);doc.setTextColor(6,182,212);doc.setFont('helvetica','bold');

  doc.text('FINAL RESULT:',M+5,y+4);

  doc.setFontSize(9);doc.setTextColor(200,220,255);doc.setFont('helvetica','normal');



  // per-reaction result label

  const RESULT_LABEL={

    acid_base:'Molarity of NaOH = 0.100 mol/L   |   Strength = 4.00 g/L',

    redox:'Molarity of FeSO4 = 0.100 mol/L   |   Amount of Fe2+ = 2.00 x 10^-3 mol',

    precipitation:'Experimental yield of PbI2 = 0.89 g   |   Percentage yield = 96.5 %',

    combination:'Empirical formula of product = MgO   |   Mole ratio Mg:O = 1 : 1',

    decomposition:'Total O2 evolved = 122 mL   |   Rate (initial) = 1.60 mL/s',

    single_displacement:'Mass of Cu deposited = 3.12 g   |   Percentage yield = 98.5 %',

    double_displacement:'Experimental yield of BaSO4 = 0.45 g   |   Percentage yield = 96.4 %',

    organic_addition:'Br2 decolorised: YES   |   Moles of product formed = 5.0 x 10^-4 mol',

    esterification:'Mass of ethyl acetate collected = 5.05 g   |   % yield = 67.0 %',

    saponification:'Mass of soap collected = 9.2 g   |   % yield = 82.9 %',

    electrolysis_water:'Volume H2 = 34.2 mL   |   Volume O2 = 17.0 mL   |   Ratio H2:O2 = 2.01:1',

    electroplating:'Mass of Cu deposited = 0.58 g   |   Current efficiency = 98.0 %',

    haber:'Moles of NH3 at equilibrium = 0.30 mol   |   Mass of NH3 = 5.10 g',

    acid_rain:'pH of acid rain = 3.8   |   [H+] = 1.585 x 10^-4 mol/L'

  };

  doc.text(sanitize(RESULT_LABEL[rxnKey]||(rxn.expectedResult||'Final calculated value = ____________')),M+5,y+12);

  nl(25);



  /* ════════════════════════════════════════════

     TITRATION GRAPH — only for burette reactions

  ════════════════════════════════════════════ */

  if(HAS_GRAPH.indexOf(rxnKey)!==-1){

    checkPage(110);

    nl(4);

    sectionHeader('TITRATION GRAPH  (Auto-plotted from reaction data)',20,100,60);



    // ── Generate realistic data points for the curve ──

    let dataPoints = [];

    let eqVol = 25.0; // equivalence point volume in mL

    let totalVol = 30.0; // X-axis max



    if(rxnKey==='acid_base'){

      doc.setFontSize(8.5);doc.setTextColor(60,60,60);doc.setFont('helvetica','italic');

      doc.text('Plot: Volume of HCl added (mL) on X-axis  vs  pH of NaOH solution on Y-axis',M+3,y);nl(5);

      doc.text('Equivalence point at ~25 mL HCl (pH = 7). Endpoint marked with dashed line.',M+3,y);nl(8);

      // Realistic acid-base titration S-curve: NaOH(aq) + HCl(aq) -> NaCl + H2O

      // pH starts ~13 (0.1M NaOH), drops slowly, steep drop at eq point (25mL), then acidic

      const abPoints=[

        [0,12.5],[2,12.2],[5,11.9],[8,11.5],[10,11.2],[12,10.9],[15,10.3],

        [18,9.5],[20,8.8],[22,8.2],[23,7.9],[24,7.5],[24.5,7.2],[24.8,7.05],

        [25.0,7.0],  // equivalence

        [25.2,6.9],[25.5,6.7],[26,6.3],[27,5.5],[28,4.8],[29,4.0],[30,3.5]

      ];

      dataPoints = abPoints;

      eqVol = 25.0; totalVol = 30.0;

    } else if(rxnKey==='redox'){

      doc.setFontSize(8.5);doc.setTextColor(60,60,60);doc.setFont('helvetica','italic');

      doc.text('Plot: Volume of KMnO4 added (mL) on X-axis  vs  solution absorbance (0-100%) on Y-axis',M+3,y);nl(5);

      doc.text('Endpoint = first permanent pink. KMnO4 decolorises until all Fe2+ consumed (~20 mL).',M+3,y);nl(8);

      // Redox: KMnO4 decolorises as Fe2+ present; at endpoint purple persists

      // Y = purple colour intensity (0 = colourless, 100 = full purple)

      const rdxPoints=[

        [0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],

        [19,0],[19.5,0],[19.8,0],

        [20.0,0],   // endpoint

        [20.2,18],[20.5,35],[21,50],[22,65],[23,75],[24,82],[25,88],[26,92],[28,96],[30,99]

      ];

      dataPoints = rdxPoints;

      eqVol = 20.0; totalVol = 30.0;

    }



    // Draw graph box

    const gx=M+18,gy=y,gw=IW-26,gh=80;

    doc.setFillColor(248,250,255);doc.rect(gx,gy,gw,gh,'F');

    doc.setDrawColor(200,210,230);doc.setLineWidth(0.15);

    // Grid lines (vertical) — 12 divisions

    for(let xi=0;xi<=12;xi++){

      const lx=gx+xi*(gw/12);

      doc.line(lx,gy,lx,gy+gh);

    }

    // Grid lines (horizontal) — 8 divisions

    for(let yi=0;yi<=8;yi++){

      const ly=gy+yi*(gh/8);

      doc.line(gx,ly,gx+gw,ly);

    }



    // Axes

    doc.setDrawColor(20,20,60);doc.setLineWidth(0.6);

    doc.line(gx,gy,gx,gy+gh);        // Y axis

    doc.line(gx,gy+gh,gx+gw,gy+gh);  // X axis



    // Y-axis tick labels & title

    doc.setFontSize(6.5);doc.setTextColor(40,40,80);doc.setFont('helvetica','normal');

    if(rxnKey==='acid_base'){

      // Y: 0 to 14 (pH), 8 divisions

      for(let i=0;i<=8;i++){

        const val=Math.round(14-i*(14/8)*10)/10;

        const ly=gy+i*(gh/8);

        doc.text(val.toFixed(0),gx-2,ly+1.5,{align:'right'});

        doc.setDrawColor(160,160,200);doc.setLineWidth(0.1);

        doc.line(gx-1.5,ly,gx,ly); // tick

      }

      doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(20,20,80);

      doc.text('pH',gx-14,gy+gh/2+2,{angle:90,align:'center'});

    } else {

      // Y: 0 to 100 (%) 8 divisions

      for(let i=0;i<=8;i++){

        const val=Math.round((8-i)*100/8);

        const ly=gy+i*(gh/8);

        doc.text(String(val),gx-2,ly+1.5,{align:'right'});

        doc.setDrawColor(160,160,200);doc.setLineWidth(0.1);

        doc.line(gx-1.5,ly,gx,ly);

      }

      doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(20,20,80);

      doc.text('Purple %',gx-16,gy+gh/2+2,{angle:90,align:'center'});

    }



    // X-axis tick labels — 0..30 mL, 12 divisions (2.5 each)

    doc.setFontSize(6.5);doc.setFont('helvetica','normal');doc.setTextColor(40,40,80);

    for(let xi=0;xi<=12;xi++){

      const val=(xi*totalVol/12).toFixed(1).replace('.0','');

      const lx=gx+xi*(gw/12);

      doc.text(val,lx,gy+gh+4,{align:'center'});

      doc.setDrawColor(160,160,200);doc.setLineWidth(0.1);

      doc.line(lx,gy+gh,lx,gy+gh+1.5);

    }

    // X title

    doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(20,20,80);

    const xTitle=rxnKey==='acid_base'?'Volume of HCl added (mL)':'Volume of KMnO4 added (mL)';

    doc.text(xTitle,gx+gw/2,gy+gh+10,{align:'center'});



    // ── Plot the actual curve ──

    function dataToGraph(vx,vy){

      // map vx 0..totalVol -> gx..gx+gw

      const px=gx+(vx/totalVol)*gw;

      // map vy: acid_base pH 0-14, redox 0-100

      const yRange=rxnKey==='acid_base'?14:100;

      const py=gy+gh-(vy/yRange)*gh;

      return [px,py];

    }



    // Draw curve (cyan line, thick)

    doc.setDrawColor(6,182,212);doc.setLineWidth(1.2);

    for(let i=1;i<dataPoints.length;i++){

      const [x0,y0]=dataToGraph(dataPoints[i-1][0],dataPoints[i-1][1]);

      const [x1,y1]=dataToGraph(dataPoints[i][0],dataPoints[i][1]);

      doc.line(x0,y0,x1,y1);

    }



    // Draw data point dots

    doc.setFillColor(6,182,212);

    dataPoints.forEach(([vx,vy])=>{

      const [px,py]=dataToGraph(vx,vy);

      doc.circle(px,py,0.9,'F');

    });



    // Equivalence point vertical dashed line

    const [eqPx]=dataToGraph(eqVol,0);

    doc.setDrawColor(239,68,68);doc.setLineWidth(0.5);

    // Dashed: draw short segments

    for(let dy=0;dy<gh;dy+=3){

      doc.line(eqPx,gy+dy,eqPx,gy+dy+1.5);

    }

    // Label

    doc.setFontSize(6.5);doc.setTextColor(239,68,68);doc.setFont('helvetica','bold');

    const eqLabel=rxnKey==='acid_base'?'Eq. Pt\n25.0 mL\npH=7':'Endpoint\n20.0 mL';

    doc.text(rxnKey==='acid_base'?'Equivalence Point (25.0 mL, pH 7)':'Endpoint (20.0 mL)',eqPx+1.5,gy+6,{maxWidth:35});



    // Horizontal dashed line at eq Y

    if(rxnKey==='acid_base'){

      const [,eqPy]=dataToGraph(eqVol,7);

      doc.setDrawColor(180,60,60);doc.setLineWidth(0.3);

      for(let ddx=0;ddx<gw;ddx+=3){

        doc.line(gx+ddx,eqPy,gx+ddx+1.5,eqPy);

      }

      doc.setFontSize(6);doc.text('pH=7',gx-14,eqPy+1);

    }



    // Chart title inside graph

    doc.setFontSize(7.5);doc.setTextColor(30,30,80);doc.setFont('helvetica','bold');

    const chartTitle=rxnKey==='acid_base'?'Acid-Base Titration Curve  (HCl vs NaOH, 0.1M)':'Redox Titration Curve  (KMnO4 vs FeSO4 in H2SO4)';

    doc.text(chartTitle,gx+gw/2,gy+gh+16,{align:'center'});



    // Legend

    doc.setFillColor(6,182,212);doc.circle(gx+4,gy+gh-5,1.5,'F');

    doc.setFontSize(6);doc.setTextColor(40,40,80);doc.setFont('helvetica','normal');

    doc.text('Measured data points',gx+7,gy+gh-4);

    doc.setDrawColor(239,68,68);doc.setLineWidth(0.5);doc.line(gx+60,gy+gh-5,gx+66,gy+gh-5);

    doc.text('Equivalence / Endpoint',gx+68,gy+gh-4);



    y=gy+gh+22;nl(8);



    // Reading table for graph data — filled with computed values

    checkPage(50);

    sectionHeader('TITRATION READINGS TABLE  (Sample calculated values)',20,100,60);

    const tHeaders=rxnKey==='acid_base'

      ?['Reading','Initial (mL)','Final (mL)','Vol. Used (mL)','pH at EP']

      :['Reading','Initial (mL)','Final (mL)','Vol. Used (mL)','Endpoint?'];

    const colW=IW/tHeaders.length;



    // Table header

    doc.setFillColor(6,182,212);doc.rect(M,y-3,IW,8,'F');

    doc.setFontSize(7.5);doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');

    tHeaders.forEach((h,hi)=>doc.text(h,M+hi*colW+2,y+2));nl(8);



    // Sample concordant readings

    const tableData=rxnKey==='acid_base'?[

      ['1','0.00','25.10','25.10','7.02'],

      ['2','0.00','24.90','24.90','7.00'],

      ['3','0.00','25.00','25.00','6.98'],

      ['Mean','—','—','25.00 (concordant)','7.00']

    ]:[

      ['1','0.00','20.20','20.20','Yes (pink)'],

      ['2','0.00','19.90','19.90','Yes (pink)'],

      ['3','0.00','20.00','20.00','Yes (pink)'],

      ['Mean','—','—','20.03 (concordant)','Faint pink']

    ];

    tableData.forEach((row,ri)=>{

      checkPage(9);

      const isLast=ri===tableData.length-1;

      doc.setFillColor(isLast?220:ri%2===0?248:255,isLast?235:ri%2===0?252:255,isLast?255:255);

      doc.rect(M,y-3,IW,8,'F');

      doc.setFontSize(8);doc.setTextColor(isLast?0:40,isLast?60:40,isLast?120:40);

      doc.setFont('helvetica',isLast?'bold':'normal');

      row.forEach((cell,hi)=>doc.text(cell,M+hi*colW+2,y+2));

      nl(8);

    });

    nl(4);



    // Concordant readings note

    checkPage(14);

    doc.setFillColor(220,255,220);doc.roundedRect(M,y-2,IW,12,2,2,'F');

    doc.setFontSize(8.5);doc.setTextColor(10,80,10);doc.setFont('helvetica','bold');

    doc.text('Concordant Result: ',M+4,y+4);

    doc.setFont('helvetica','normal');

    const concordNote=rxnKey==='acid_base'

      ?'Mean volume of HCl = 25.00 mL. Molarity of NaOH = (0.1 x 25.00) / 25.00 = 0.100 mol/L'

      :'Mean volume of KMnO4 = 20.03 mL. Moles Fe2+ = 5 x 0.02 x 0.02003 = 0.002003 mol => M(FeSO4) = 0.100 mol/L';

    doc.text(concordNote,M+40,y+4,{maxWidth:IW-44});

    nl(18);

  }



  /* ════════════════════════════════════════════

     CONCLUSION

  ════════════════════════════════════════════ */

  checkPage(24);

  sectionHeader('CONCLUSION',14,80,200);

  doc.setFillColor(240,255,240);doc.roundedRect(M,y-3,IW,16,2,2,'F');

  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(20,70,20);

  const concLines=doc.splitTextToSize(sanitize(rxn.conclusion),IW-8);

  concLines.slice(0,3).forEach(line=>{doc.text(line,M+4,y+2);nl(5);});

  nl(5);



  /* ════════════════════════════════════════════

     PRECAUTIONS

  ════════════════════════════════════════════ */

  const PRECAUTIONS={

    acid_base:['Rinse burette with HCl before filling to avoid dilution errors.','Use a pipette filler — never mouth-pipette NaOH.','Ensure no air bubbles in the burette tip before starting.','Take the burette reading at eye level (bottom of meniscus).','Add indicator drop by drop near the endpoint — swirl continuously.','Repeat titration until two concordant readings are obtained.'],

    redox:['Prepare FeSO4 fresh — it oxidises to Fe3+ on standing.','Use only dilute H2SO4 (not HCl) to provide acidic medium.','Add KMnO4 dropwise near the endpoint — one excess drop gives the endpoint.','Record the endpoint immediately — the faint pink fades on standing.','Do not use a rubber connector near KMnO4 — it reacts with rubber.'],

    precipitation:['Lead compounds are toxic — wear gloves throughout.','Add KI solution slowly and dropwise to control crystal size.','Wash the precipitate thoroughly with distilled water to remove KNO3.','Dry the precipitate completely at 110 deg C before weighing.','Handle and dispose of lead waste according to hazardous waste protocols.'],

    combination:['NEVER look directly at burning magnesium — severe eye damage risk.','Hold the Mg ribbon with tongs — not bare hands.','Burn over a sand tray to catch falling MgO.','Do not use water or CO2 extinguisher on Mg fire.','Weigh the crucible before and after for accurate mass data.'],

    decomposition:['Use H2O2 in a fume hood — it releases O2 rapidly.','Do not mix concentrated H2O2 with organic material.','Add MnO2 slowly to control the rate of gas evolution.','Keep the gas delivery tube clear — do not let water suck back into the flask.','Verify O2 with a glowing splint test before collecting gas.'],

    single_displacement:['Clean Zn strip with sandpaper to remove ZnO coating.','Keep the reaction vessel undisturbed during reaction.','Rinse Zn strip with distilled water before reweighing.','Dispose of CuSO4 and ZnSO4 solutions as chemical waste.','Record mass readings on a 4-decimal balance for accuracy.'],

    default:['Handle all chemicals with care — wear gloves and goggles.','Read all volumes at eye level to avoid parallax error.','Measure masses on a calibrated balance.','Dispose of chemical waste in designated containers.','Report any spillage to the lab instructor immediately.']

  };

  const prec=PRECAUTIONS[rxnKey]||PRECAUTIONS.default;

  checkPage(prec.length*7+16);

  sectionHeader('PRECAUTIONS',14,80,200);

  prec.forEach((p,pi)=>{

    checkPage(9);

    doc.setFontSize(9);doc.setTextColor(40,40,40);doc.setFont('helvetica','normal');

    doc.text((pi+1)+'. '+sanitize(p),M+3,y,{maxWidth:IW-4});nl(7);

  });

  nl(4);



  /* ════════════════════════════════════════════

     VIVA QUESTIONS

  ════════════════════════════════════════════ */

  const VIVA={

    acid_base:['What is the equivalence point? How is it different from the endpoint?','Why is phenolphthalein used instead of methyl orange for NaOH titration?','What is the effect of CO2 absorption on the strength of NaOH?','Define normality and state the relation between normality and molarity.','Why must the conical flask not be rinsed with NaOH before adding NaOH?'],

    redox:['Why is H2SO4 used and not HCl in the KMnO4 titration?','Why is KMnO4 called a self-indicator?','What is the oxidation state of Mn in KMnO4 and in MnSO4?','Write the balanced ionic equation for the KMnO4 - FeSO4 reaction.','Why must FeSO4 solution be prepared fresh and kept acidified?'],

    precipitation:['Define Ksp. What is the Ksp of PbI2?','What is the "golden rain" effect? Explain its cause.','Why does excess KI dissolve the PbI2 precipitate?','What is the difference between precipitation and co-precipitation?','How does temperature affect the Ksp of a sparingly soluble salt?'],

    default:['State the aim of this experiment in one sentence.','Write the balanced equation for the main reaction.','What are the key observations in this experiment?','State one source of error and how you would minimise it.','What is the real-world application of this reaction?']

  };

  const viva=VIVA[rxnKey]||VIVA.default;

  checkPage(viva.length*9+16);

  sectionHeader('VIVA QUESTIONS',14,80,200);

  viva.forEach((q,qi)=>{

    checkPage(12);

    doc.setFontSize(9);doc.setTextColor(30,30,80);doc.setFont('helvetica','bold');

    doc.text('Q'+(qi+1)+'. ',M+3,y);

    const qLines=doc.splitTextToSize(sanitize(q),IW-14);

    doc.setFont('helvetica','normal');doc.setTextColor(30,30,60);

    qLines.forEach((ql,qli)=>doc.text(ql,M+10,y+(qli*5)));

    nl(qLines.length*5+4);

    // answer blank

    doc.setDrawColor(180,180,180);doc.setLineWidth(0.2);

    doc.line(M+3,y,M+IW-3,y);nl(5);

    doc.line(M+3,y,M+IW-3,y);nl(7);

  });



  /* ════════════════════════════════════════════

     SCORE + FOOTER (last page)

  ════════════════════════════════════════════ */

  checkPage(30);nl(4);

  doc.setFillColor(7,12,23);doc.roundedRect(M,y-3,IW,14,3,3,'F');

  doc.setFontSize(12);doc.setTextColor(245,158,11);doc.setFont('helvetica','bold');

  doc.text('Score: '+state.score+' points',M+6,y+6);

  doc.setFontSize(9);doc.setTextColor(148,163,184);doc.setFont('helvetica','normal');

  doc.text('Experiment: '+sanitize(rxn.name),M+75,y+6);nl(20);



  doc.setDrawColor(6,182,212);doc.setLineWidth(0.3);doc.line(M,y,W-M,y);nl(5);

  doc.setFontSize(8);doc.setTextColor(150,150,150);

  doc.text('Generated by ChemLab AI  |  KKW Institute of Engineering, Nashik',W/2,y,{align:'center'});nl(5);

  doc.text('(c) '+new Date().getFullYear()+'  |  For Educational Purposes Only',W/2,y,{align:'center'});



  doc.save('ChemLab_Report_'+rxn.name.replace(/[^a-zA-Z0-9_]/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.pdf');

  showToast('Lab Report downloaded!',3000);

}

/* ══════════════════════════════════════════════════════

   AUTH SYSTEM

══════════════════════════════════════════════════════ */

const AUTH_KEY='chemlab_users_v1';

const SESSION_KEY='chemlab_session_v1';

const COUNT_KEY='chemlab_login_counts_v1';

let currentUser=null;



/* ── USER COUNT SYSTEM ── */

function getLoginCounts(){try{return JSON.parse(localStorage.getItem(COUNT_KEY)||'{"email":0,"guest":0,"total":0,"sessions":[]}');}catch{return{email:0,guest:0,total:0,sessions:[]};}}

function saveLoginCounts(c){localStorage.setItem(COUNT_KEY,JSON.stringify(c));}

function recordLogin(type,name){

  const c=getLoginCounts();

  c.total=(c.total||0)+1;

  if(type==='guest'){c.guest=(c.guest||0)+1;}else{c.email=(c.email||0)+1;}

  c.sessions=c.sessions||[];

  c.sessions.push({type,name:name||'Unknown',time:new Date().toISOString()});

  if(c.sessions.length>200)c.sessions=c.sessions.slice(-200);

  saveLoginCounts(c);

  updateCounterUI();

}

function updateCounterUI(){

  const c=getLoginCounts();

  ['counter-total','counter-total2'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=c.total||0;});

  ['counter-email','counter-email2'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=c.email||0;});

  ['counter-guest','counter-guest2'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=c.guest||0;});

  // animate the hero stat

  const hstat=document.getElementById('hstat-users');

  if(hstat)hstat.textContent=(c.total||0)+'+';;

  updateLandingCounter();}

function updateLandingCounter(){

  const c=getLoginCounts();

  const lsTotal=document.getElementById('ls-total');if(lsTotal)lsTotal.textContent=c.total||0;

  const lsEmail=document.getElementById('ls-email');if(lsEmail)lsEmail.textContent=c.email||0;

  const lsGuest=document.getElementById('ls-guest');if(lsGuest)lsGuest.textContent=c.guest||0;

  // Recent activity

  const recentEl=document.getElementById('ls-recent');

  if(recentEl&&c.sessions&&c.sessions.length){

    const last3=c.sessions.slice(-3).reverse();

    recentEl.innerHTML='Recent: '+last3.map(s=>`<span style="color:var(--text2)">${s.type==='email'?'📧':'👤'} ${s.name} <span style="color:var(--text3)">${new Date(s.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span></span>`).join(' &bull; ');

  } else if(recentEl){recentEl.textContent='No logins recorded yet.';}

}

window.resetLoginCounts=function(){if(confirm('Reset all user counts? This cannot be undone.')){localStorage.removeItem(COUNT_KEY);updateCounterUI();showToast('✅ Counts reset');}}



function getUsers(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'{}');}catch{return {};}}

function saveUsers(u){localStorage.setItem(AUTH_KEY,JSON.stringify(u));}

function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}}

function saveSession(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s));}

function clearSession(){localStorage.removeItem(SESSION_KEY);}



function initAuth(){

  // Load saved API key

  const savedKey=localStorage.getItem('chemlab_apikey')||'';

  window._CHEMLAB_KEY=savedKey;

  const keyInput=document.getElementById('apikey-input');

  if(keyInput&&savedKey)keyInput.value=savedKey;

  // Init counter display

  updateCounterUI();

  const session=getSession();

  if(session&&session.email){

    currentUser=session;

    hideAuthOverlay();

    updateUserUI();

    loadUserHistory(session.email);

    // Show home page; user can click "Enter Virtual Lab" when ready

    showToast('👋 Welcome back, '+session.name.split(' ')[0]+'!');

  } else {

    document.getElementById('auth-overlay').classList.remove('hidden');

  }

}

function saveApiKey(val){

  window._CHEMLAB_KEY=val.trim();

  localStorage.setItem('chemlab_apikey',val.trim());

}

function hideAuthOverlay(){document.getElementById('auth-overlay').classList.add('hidden');}



function switchAuthTab(tab){

  ['login','signup','forgot'].forEach(t=>{

    const tabBtn=document.getElementById('tab-'+t);

    const form=document.getElementById('form-'+t);

    if(tabBtn)tabBtn.classList.toggle('active',t===tab);

    if(form)form.classList.toggle('hidden',t!==tab);

  });

  // Hide all errors/successes

  ['login-error','signup-error','forgot-error'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('show');});

  ['signup-success','login-success','forgot-success'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});

}



function togglePW(id,btn){

  const inp=document.getElementById(id);

  const isText=inp.type==='text';

  inp.type=isText?'password':'text';

  btn.querySelector('i').className=isText?'fas fa-eye':'fas fa-eye-slash';

}



function handleLogin(e){

  e.preventDefault();

  const email=document.getElementById('login-email').value.trim().toLowerCase();

  const pass=document.getElementById('login-pass').value;

  const errEl=document.getElementById('login-error');

  const errMsg=document.getElementById('login-err-msg');

  const succEl=document.getElementById('login-success');

  errEl.classList.remove('show');

  if(succEl)succEl.style.display='none';

  if(!email){errMsg.textContent='Please enter your email.';errEl.classList.add('show');return;}

  if(!pass){errMsg.textContent='Please enter your password.';errEl.classList.add('show');return;}

  const users=getUsers();

  if(!users[email]){errMsg.textContent='No account found with this email. Please sign up first.';errEl.classList.add('show');return;}

  let storedPw=users[email].password||'';

  let pwMatch=false;

  try{pwMatch=(storedPw===btoa(pass));}catch(ex){}

  if(!pwMatch&&storedPw!==pass){errMsg.textContent='Incorrect password. Please try again.';errEl.classList.add('show');return;}

  const user={name:users[email].name,email,institution:users[email].institution||''};

  saveSession(user);currentUser=user;

  if(succEl){succEl.style.display='flex';document.getElementById('login-succ-msg').textContent='Welcome back, '+user.name.split(' ')[0]+'! Loading lab...';}

  recordLogin('email',user.name);

  loadUserHistory(user.email);

  setTimeout(()=>{hideAuthOverlay();updateUserUI();showToast('👋 Welcome back, '+user.name.split(' ')[0]+'!');launchLabAfterAuth();},900);

}



function handleSignup(e){

  e.preventDefault();

  const name=document.getElementById('signup-name').value.trim();

  const email=document.getElementById('signup-email').value.trim().toLowerCase();

  const pass=document.getElementById('signup-pass').value;

  const pass2=document.getElementById('signup-pass2')?document.getElementById('signup-pass2').value:'';

  const inst=document.getElementById('signup-inst').value.trim();

  const errEl=document.getElementById('signup-error');

  const errMsg=document.getElementById('signup-err-msg');

  const sucEl=document.getElementById('signup-success');

  errEl.classList.remove('show');sucEl.classList.remove('show');

  if(!name){errMsg.textContent='Please enter your full name.';errEl.classList.add('show');return;}

  if(!email.includes('@')){errMsg.textContent='Enter a valid email address.';errEl.classList.add('show');return;}

  if(pass.length<6){errMsg.textContent='Password must be at least 6 characters.';errEl.classList.add('show');return;}

  if(pass2&&pass!==pass2){errMsg.textContent='Passwords do not match.';errEl.classList.add('show');return;}

  const users=getUsers();

  if(users[email]){errMsg.textContent='An account with this email already exists. Please sign in.';errEl.classList.add('show');return;}

  users[email]={name,institution:inst||'',password:btoa(pass),created:new Date().toISOString()};

  saveUsers(users);

  sucEl.classList.add('show');

  const user={name,email,institution:inst||''};

  setTimeout(()=>{saveSession(user);currentUser=user;hideAuthOverlay();updateUserUI();recordLogin('email',name);loadUserHistory(user.email);showToast('🎉 Welcome to ChemLab AI, '+name+'!');launchLabAfterAuth();},1200);

}



function handleForgotPassword(e){

  e.preventDefault();

  const email=document.getElementById('forgot-email').value.trim().toLowerCase();

  const newPass=document.getElementById('forgot-newpass').value;

  const newPass2=document.getElementById('forgot-newpass2').value;

  const errEl=document.getElementById('forgot-error');

  const errMsg=document.getElementById('forgot-err-msg');

  const succEl=document.getElementById('forgot-success');

  errEl.classList.remove('show');

  if(succEl)succEl.style.display='none';

  if(!email){errMsg.textContent='Please enter your email address.';errEl.classList.add('show');return;}

  const users=getUsers();

  if(!users[email]){errMsg.textContent='No account found with this email. Please sign up first.';errEl.classList.add('show');return;}

  if(newPass.length<6){errMsg.textContent='New password must be at least 6 characters.';errEl.classList.add('show');return;}

  if(newPass!==newPass2){errMsg.textContent='Passwords do not match.';errEl.classList.add('show');return;}

  // Update password

  users[email].password=btoa(newPass);

  saveUsers(users);

  if(succEl){succEl.style.display='flex';document.getElementById('forgot-succ-msg').textContent='Password changed for '+email+'! You can now sign in.';}

  document.getElementById('forgot-newpass').value='';

  document.getElementById('forgot-newpass2').value='';

  setTimeout(()=>{switchAuthTab('login');const emailInput=document.getElementById('login-email');if(emailInput)emailInput.value=email;},2500);

}



function guestLogin(){

  currentUser={name:'Guest',email:'guest@chemlab.ai',institution:'',isGuest:true};

  state.experimentHistory=[];state.score=0;

  hideAuthOverlay();

  updateUserUI();

  recordLogin('guest','Guest');

  showToast('👋 Welcome, Guest!');

  launchLabAfterAuth();

}



/* Change password from within the lab */

function openChangePW(){

  if(!currentUser||currentUser.isGuest){showToast('⚠️ Sign in with an account to change password.');return;}

  const el=document.getElementById('cpw-user-email');if(el)el.textContent=currentUser.email;

  ['cpw-current','cpw-new','cpw-new2'].forEach(id=>{const f=document.getElementById(id);if(f)f.value='';});

  const errEl=document.getElementById('cpw-error');const succEl=document.getElementById('cpw-success');

  if(errEl)errEl.style.display='none';if(succEl)succEl.style.display='none';

  const modal=document.getElementById('change-pw-modal');if(modal)modal.style.display='flex';

}

function closeChangePW(){

  const modal=document.getElementById('change-pw-modal');if(modal)modal.style.display='none';

}

function submitChangePW(){

  const current=document.getElementById('cpw-current').value;

  const newPw=document.getElementById('cpw-new').value;

  const newPw2=document.getElementById('cpw-new2').value;

  const errEl=document.getElementById('cpw-error');const succEl=document.getElementById('cpw-success');

  const errMsg=document.getElementById('cpw-err-msg');

  errEl.style.display='none';succEl.style.display='none';

  const users=getUsers();

  const u=users[currentUser.email];

  if(!u){errMsg.textContent='Account not found.';errEl.style.display='flex';return;}

  let pwMatch=false;try{pwMatch=(u.password===btoa(current));}catch(ex){}

  if(!pwMatch&&u.password!==current){errMsg.textContent='Current password is incorrect.';errEl.style.display='flex';return;}

  if(newPw.length<6){errMsg.textContent='New password must be at least 6 characters.';errEl.style.display='flex';return;}

  if(newPw!==newPw2){errMsg.textContent='New passwords do not match.';errEl.style.display='flex';return;}

  u.password=btoa(newPw);saveUsers(users);

  succEl.style.display='flex';showToast('✅ Password changed successfully!');

  setTimeout(()=>closeChangePW(),2000);

}



function logoutUser(){

  // Save current session's history before logging out

  if(currentUser&&currentUser.email){saveUserHistory(currentUser.email);}

  clearSession();currentUser=null;

  // Reset all lab state for next user

  state.selectedChems=[];state.ph=7.0;state.temp=25.0;state.volume=0;

  state.score=0;state.status='idle';state.running=false;

  state.experimentHistory=[];state.currentReaction='acid_base';

  chatHistory=[];mobChatHistory=[];

  document.getElementById('landing').style.display='block';

  document.getElementById('lab-page').classList.remove('active');

  document.getElementById('mob-lab-view').classList.remove('active');

  document.getElementById('mobile-nav').style.display='none';

  document.getElementById('particle-canvas').style.display='block';

  document.getElementById('auth-overlay').classList.remove('hidden');

  labInited=false;

  document.getElementById('phys-lab-page').classList.remove('active');

  physLabInited=false;

  updateUserUI();

  showToast('Signed out. History saved. See you soon!');

}



function updateUserUI(){

  const navArea=document.getElementById('nav-user-area');

  const mobArea=document.getElementById('mob-user-area');

  if(!currentUser){if(navArea)navArea.innerHTML='';if(mobArea)mobArea.innerHTML='';return;}

  const initials=currentUser.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  const isGuest=currentUser.isGuest;

  const badge=`<div class="user-badge-wrap" style="position:relative;display:inline-flex">

    <div class="user-badge" id="user-badge-btn" onclick="toggleUserMenu()" style="cursor:pointer" title="${currentUser.email}">

      <div class="user-avatar-small">${initials}</div>

      <span class="user-name-small">${currentUser.name.split(' ')[0]}</span>

      <i class="fas fa-chevron-down" style="font-size:8px;color:var(--text3)"></i>

    </div>

    <div id="user-dropdown" style="display:none;position:absolute;top:calc(100% + 6px);right:0;background:var(--card);border:1px solid var(--border2);border-radius:10px;padding:6px;min-width:160px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.4)">

      <div style="padding:8px 10px;font-size:10px;color:var(--text3);font-family:var(--fm);border-bottom:1px solid var(--border);margin-bottom:4px">${currentUser.email}</div>

      ${!isGuest?`<button onclick="openChangePW();toggleUserMenu()" style="width:100%;text-align:left;background:none;border:none;color:var(--text2);font-size:12px;padding:6px 10px;border-radius:6px;cursor:pointer;font-family:var(--fn);display:flex;align-items:center;gap:7px"><i class="fas fa-key" style="color:var(--amber)"></i> Change Password</button>`:''}

      <button onclick="logoutUser();toggleUserMenu()" style="width:100%;text-align:left;background:none;border:none;color:var(--text2);font-size:12px;padding:6px 10px;border-radius:6px;cursor:pointer;font-family:var(--fn);display:flex;align-items:center;gap:7px"><i class="fas fa-sign-out-alt" style="color:var(--red)"></i> Sign Out</button>

    </div>

  </div>`;

  if(navArea)navArea.innerHTML=badge;

  if(mobArea)mobArea.innerHTML=`<div class="user-badge" onclick="logoutUser()" title="Tap to sign out" style="padding:3px 8px"><div class="user-avatar-small" style="width:20px;height:20px;font-size:8px">${initials}</div><i class="fas fa-sign-out-alt" style="font-size:9px;color:var(--text3)"></i></div>`;

  // close dropdown on outside click

  setTimeout(()=>{document.addEventListener('click',(e)=>{if(!e.target.closest('.user-badge-wrap')){const d=document.getElementById('user-dropdown');if(d)d.style.display='none';}},{once:false});},100);

}

function toggleUserMenu(){

  const d=document.getElementById('user-dropdown');if(d)d.style.display=d.style.display==='none'?'block':'none';

}



/* Central launcher called after any auth success */

function launchLabAfterAuth(){

  // Show subject choice overlay instead of directly entering lab

  hideAuthOverlay();

  document.getElementById('subject-choice-overlay').classList.add('visible');

}



function chooseSubject(subject){

  document.getElementById('subject-choice-overlay').classList.remove('visible');

  if(subject==='physics'){

    launchPhysicsLab();

  } else {

    launchChemistryLab();

  }

}



function switchToPhysics(){

  document.getElementById('lab-page').classList.remove('active');

  document.getElementById('mob-lab-view').classList.remove('active');

  launchPhysicsLab();

}



function switchToChemistry(){

  document.getElementById('phys-lab-page').classList.remove('active');

  launchChemistryLab();

}



function launchChemistryLab(){

  const isMobile=window.innerWidth<=768;

  const cpwBtn=document.getElementById('topbar-changepw-btn');

  if(cpwBtn)cpwBtn.style.display=(currentUser&&!currentUser.isGuest)?'flex':'none';

  if(isMobile){

    document.getElementById('landing').style.display='none';

    document.getElementById('mob-lab-view').classList.add('active');

    document.getElementById('mobile-nav').style.display='block';

    document.getElementById('particle-canvas').style.display='none';

    if(!labInited){initLab();initMobileLab();labInited=true;}

    else{syncMobileState&&syncMobileState();}

  } else {

    document.getElementById('landing').style.display='none';

    document.getElementById('lab-page').classList.add('active');

    document.getElementById('particle-canvas').style.display='none';

    if(!labInited){initLab();initDrawerContent();labInited=true;}

    else{initDrawerContent();}

  }

}



/* enterLab — unified, no override chain needed */

window.enterLab=function(){

  if(!currentUser){document.getElementById('auth-overlay').classList.remove('hidden');return;}

  document.getElementById('subject-choice-overlay').classList.add('visible');

};



function mobileExitLab(){

  document.getElementById('landing').style.display='block';

  document.getElementById('mob-lab-view').classList.remove('active');

  document.getElementById('mobile-nav').style.display='none';

  document.getElementById('particle-canvas').style.display='block';

  ['chat','sensors','experiments'].forEach(closeMobPanel);

}



/* ══════════════════════════════════════════════════════

   SLIDING DRAWER (medium desktop screens)

══════════════════════════════════════════════════════ */

function initDrawerContent(){

  // Clone left panel content into left drawer

  const leftSrc=document.getElementById('left');

  const leftDraw=document.getElementById('left-sidebar-drawer');

  if(leftSrc&&leftDraw){leftDraw.innerHTML=leftSrc.innerHTML;}

  // Clone right panel content into right drawer

  const rightSrc=document.getElementById('right');

  const rightDraw=document.getElementById('right-sidebar-drawer');

  if(rightSrc&&rightDraw){rightDraw.innerHTML=rightSrc.innerHTML;}

}



function openDrawer(side){

  const draw=document.getElementById(side+'-sidebar-drawer');

  const ov=document.getElementById('sidebar-overlay');

  if(draw){draw.classList.add('open');}

  if(ov){ov.classList.add('open');}

}



function closeDrawers(){

  ['left','right'].forEach(side=>{

    const draw=document.getElementById(side+'-sidebar-drawer');

    if(draw)draw.classList.remove('open');

  });

  const ov=document.getElementById('sidebar-overlay');

  if(ov)ov.classList.remove('open');

}



function openDesktopStepsFab(){

  // Reuse the mobile steps sheet for very narrow desktop

  openMobSteps();

}



/* ══════════════════════════════════════════════════════

   MOBILE STEPS SHEET

══════════════════════════════════════════════════════ */

function buildMobStepsList(){

  const rxn=REACTIONS[state.currentReaction];

  const list=document.getElementById('mob-steps-list');

  const title=document.getElementById('mob-steps-sheet-title');

  if(!list||!rxn)return;

  if(title)title.textContent=rxn.name+' — Steps';

  list.innerHTML='';

  rxn.steps.forEach((s,i)=>{

    const isDone=i<state.selectedChems.length;

    const isActive=i===state.selectedChems.length&&!state.running;

    let bg='background:var(--card);border-color:var(--border)';

    let numStyle='background:var(--card2);color:var(--text2);border-color:var(--border)';

    let icon=i+1;

    let statusText='Pending';

    let statusColor='var(--text3)';

    if(isDone){

      bg='background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.3)';

      numStyle='background:rgba(16,185,129,.2);color:#34d399;border-color:rgba(16,185,129,.4)';

      icon='<i class="fas fa-check" style="font-size:9px"></i>';

      statusText='✅ Completed';statusColor='var(--emerald)';

    } else if(isActive){

      bg='background:rgba(6,182,212,.08);border-color:rgba(6,182,212,.35)';

      numStyle='background:rgba(6,182,212,.18);color:var(--cyan);border-color:rgba(6,182,212,.5)';

      statusText='▶ Current step';statusColor='var(--cyan)';

    }

    const card=document.createElement('div');

    card.style.cssText=`display:flex;gap:11px;align-items:flex-start;padding:12px 14px;border-radius:12px;border:1px solid;cursor:pointer;transition:.2s;${bg}`;

    card.onclick=()=>{closeMobSteps();setTimeout(()=>openStepModal(i),180);};

    card.innerHTML=`

      <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-weight:800;font-size:12px;border:2px solid;${numStyle}">${icon}</div>

      <div style="flex:1;min-width:0">

        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px">Step ${i+1}: ${s.title}</div>

        <div style="font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:5px">${s.desc}</div>

        <div style="display:flex;align-items:center;justify-content:space-between">

          <span style="font-size:10px;font-family:var(--fm);color:${statusColor}">${statusText}</span>

          <span style="font-size:10px;color:var(--cyan);font-family:var(--fm)">Tap for details →</span>

        </div>

      </div>`;

    list.appendChild(card);

  });

}



function openMobSteps(){

  buildMobStepsList();

  const sheet=document.getElementById('mob-steps-sheet');

  if(sheet){sheet.style.display='flex';sheet.style.alignItems='flex-end';}

}



function closeMobSteps(e){

  if(e&&e.target!==document.getElementById('mob-steps-sheet'))return;

  const sheet=document.getElementById('mob-steps-sheet');

  if(sheet)sheet.style.display='none';

}



/* ══════════════════════════════════════════════════════

   MOBILE LAB FUNCTIONS

══════════════════════════════════════════════════════ */

function initMobileLab(){

  const sel=document.getElementById('mob-exp-select');

  if(sel){sel.innerHTML='';RXN_TYPES.forEach(r=>{const o=document.createElement('option');o.value=r.key;o.textContent=r.icon+' '+r.name;sel.appendChild(o);});}

  buildMobRxnGrid();

  mobLoadReaction('acid_base');

  setTimeout(()=>{

    const rxn=REACTIONS[state.currentReaction];

    mobAddAIMsg('### 👋 Welcome to ChemLab AI!\n\nI am your AI chemistry assistant.\n\n- Tap chemicals to add them\n- Press **Run Reaction** to start\n- Ask me anything about chemistry!\n\n**Current:** `'+rxn.equation+'`\n\n🧪 Let\'s experiment!',true);

  },400);

}



function buildMobRxnGrid(){

  const grid=document.getElementById('mob-rxn-grid');if(!grid)return;

  let html='';let lastCat='';

  RXN_TYPES.forEach(r=>{

    if(r.cat!==lastCat){html+=`<div style="grid-column:1/-1;font-family:var(--fm);font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);padding:4px 0;border-top:1px solid var(--border);margin-top:4px">${r.cat}</div>`;lastCat=r.cat;}

    const active=r.key===state.currentReaction?'border-color:var(--cyan);background:var(--cyan-d)':'';

    html+=`<div class="rs-card" id="mob-rxncard-${r.key}" style="${active}" onclick="mobSelectRxn('${r.key}')"><span class="rs-icon">${r.icon}</span><div class="rs-name">${r.name}</div><div class="rs-count">${r.count}</div></div>`;

  });

  grid.innerHTML=html;

}



function mobSelectRxn(key){mobLoadReaction(key);closeMobPanel('experiments');showToast('✅ Loaded: '+REACTIONS[key].name);}

function mobChangeExp(key){mobLoadReaction(key);}



function mobLoadReaction(key){

  const rxn=REACTIONS[key];if(!rxn)return;

  state.currentReaction=key;state.selectedChems=[];state.ph=7.0;state.temp=25.0;state.volume=0;

  const dSel=document.getElementById('experiment-select');if(dSel)dSel.value=key;

  const mSel=document.getElementById('mob-exp-select');if(mSel)mSel.value=key;

  const scene=document.getElementById('mob-beaker-scene');

  if(scene)scene.innerHTML=HARDWARE[rxn.hardware]||HARDWARE.beaker;

  buildMobChemicals(rxn);

  updateMobSensors();

  const cp=document.getElementById('sp-color');if(cp){cp.style.background='rgba(6,182,212,.08)';cp.textContent='No reaction';}

  const mc=document.getElementById('mob-color-sensor');if(mc)mc.textContent='—';

  document.querySelectorAll('[id^="mob-rxncard-"]').forEach(el=>{el.style.borderColor='';el.style.background='';});

  const card=document.getElementById('mob-rxncard-'+key);if(card){card.style.borderColor='var(--cyan)';card.style.background='var(--cyan-d)';}

  setMobStatus('idle');

  const rBtn=document.getElementById('mob-run-btn');if(rBtn)rBtn.disabled=false;

  // Refresh steps sheet title if open

  const sheet=document.getElementById('mob-steps-sheet');

  if(sheet&&sheet.style.display!=='none')buildMobStepsList();

}



function buildMobChemicals(rxn){

  const row=document.getElementById('mob-chems-row');if(!row)return;

  row.innerHTML='';

  rxn.chemicals.forEach(c=>{

    const el=document.createElement('div');

    el.className='mob-chem-btn';el.id='mob-bottle-'+c.id;el.title=c.desc||c.name;

    el.onclick=()=>mobSelectChem(c.id);

    el.innerHTML=`<div class="mob-bottle" id="mob-bb-${c.id}"><div class="mob-bottle-fill" style="background:${c.color}"></div><div><div class="mob-bottle-label">${c.label}</div></div></div><div class="mob-chem-name">${c.name}</div>`;

    row.appendChild(el);

  });

}



function mobSelectChem(id){

  if(state.running)return;

  const rxn=REACTIONS[state.currentReaction];

  const chem=rxn.chemicals.find(c=>c.id===id);if(!chem)return;

  const idx=state.selectedChems.indexOf(id);

  if(idx===-1){

    state.selectedChems.push(id);

    document.getElementById('mob-bottle-'+id)?.classList.add('selected');

    // ── POURING ANIMATION (mobile scene) ──

    triggerPouringAnimation(chem, rxn, 'mob-beaker-scene');

    // Delay liquid update so pouring animates first, same as desktop

    setTimeout(()=>{

      const fraction=state.selectedChems.length/rxn.chemicals.length;

      state.currentColor=lerpColor(rxn.liquidStart,chem.color,0.4);

      updateBeakerLiquidInEl(document.getElementById('mob-beaker-scene'),state.currentColor,fraction);

      state.volume=Math.min((state.selectedChems.length/rxn.chemicals.length)*state.maxVolume,state.maxVolume);

      state.ph+=(Math.random()*.35-.17);

      updateMobSensors();

      const dot=document.getElementById('mob-detect-dot');const text=document.getElementById('mob-detect-text');

      detectColorForEl(chem,dot,text);

      document.getElementById('mob-color-badge').classList.add('show');

      setTimeout(()=>document.getElementById('mob-color-badge').classList.remove('show'),3500);

      showToast('✅ Added '+chem.name);

      const remaining=rxn.chemicals.length-state.selectedChems.length;

      mobAddAIMsg('**Added '+chem.name+'** ('+chem.conc+')\n\n'+chem.desc+(remaining>0?'\n\n⏭️ '+remaining+' more reagent'+(remaining>1?'s':'')+' needed.':'\n\n✅ All reagents added! Tap **Run Reaction**.'),true);

    },900);

  } else {

    state.selectedChems.splice(idx,1);

    document.getElementById('mob-bottle-'+id)?.classList.remove('selected');

    updateMobSensors();showToast('Removed '+chem.name);

  }

}



function detectColorForEl(chem,dot,text){

  const colorMap={'rgba(139,92,246,':'Purple','rgba(6,182,212,':'Cyan-Blue','rgba(234,179,8,':'Golden Yellow','rgba(210,100,20,':'Orange-Brown','rgba(59,130,246,':'Blue','rgba(16,185,129,':'Green','rgba(245,158,11,':'Amber','rgba(236,72,153,':'Pink','rgba(200,120,50,':'Copper'};

  let detected='Colorless';

  for(const [k,v] of Object.entries(colorMap)){if(chem.color.startsWith(k)){detected=v;break;}}

  const isColorless=detected==='Colorless'||(chem.color.includes('220,220,220')||chem.color.includes('200,230,255')||chem.color.includes('200,200,200')||parseFloat((chem.color.match(/[\d.]+\)$/) || [0])[0])<=0.25);

  if(!dot||!text)return isColorless;

  if(isColorless){dot.style.background='rgba(220,220,220,0.3)';text.textContent='Colorless solution';}

  else{dot.style.background=chem.color;text.textContent='Color: '+detected;}

  return isColorless;

}



function updateBeakerLiquidInEl(sceneEl,color,fraction){

  if(!sceneEl)return;

  const svg=sceneEl.querySelector('svg');if(!svg)return;

  const rect=svg.querySelector('#liquid-rect');const wave=svg.querySelector('#wave-path');if(!rect)return;

  const vb=(svg.getAttribute('viewBox')||'0 0 300 340').split(' ');

  const H=parseFloat(vb[3])||340;

  const bottom=H-50;const liquidH=Math.max(10,fraction*(H-130));const y=bottom-liquidH;

  rect.setAttribute('fill',color);rect.setAttribute('y',y);rect.setAttribute('height',liquidH+30);

  if(wave){wave.setAttribute('fill',color.replace(/[\d.]+\)$/,m=>Math.min(parseFloat(m)+0.15,0.9)+')'))}

}



function updateMobSensors(){

  const phVal=Math.max(0,Math.min(14,state.ph));

  const phColor=phVal<6?'#EF4444':phVal<6.5?'#F59E0B':phVal<=7.5?'#10B981':phVal<8?'#F59E0B':'#3B82F6';

  const phLabel=phVal<6?'Acidic':phVal>7?'Basic':'Neutral';

  // ── Inline sensor bar (bottom of lab view) ──

  const ph=document.getElementById('mob-ph');if(ph){ph.textContent=phVal.toFixed(2);ph.style.color=phColor;}

  const temp=document.getElementById('mob-temp');if(temp)temp.textContent=state.temp.toFixed(1);

  const vol=document.getElementById('mob-vol');if(vol)vol.textContent=state.volume.toFixed(1)+' mL';

  const scr=document.getElementById('mob-score');if(scr)scr.textContent=state.score+' pts';

  // ── Sensors panel — pH card ──

  const sph=document.getElementById('sp-ph');if(sph){sph.textContent=phVal.toFixed(2);sph.style.color=phColor;}

  const sphl=document.getElementById('sp-ph-label');if(sphl){sphl.textContent=phLabel;sphl.style.color=phColor;}

  const spb=document.getElementById('sp-ph-thumb');if(spb)spb.style.left=(phVal/14*100)+'%';

  // ── Sensors panel — Temp card ──

  const stemp=document.getElementById('sp-temp');if(stemp)stemp.textContent=state.temp.toFixed(1);

  const tempMax=150;

  const stb=document.getElementById('sp-temp-bar');if(stb)stb.style.width=Math.min((state.temp/tempMax)*100,100)+'%';

  // ── Sensors panel — Volume card ──

  const svol=document.getElementById('sp-vol');if(svol)svol.textContent=state.volume.toFixed(2);

  const maxVol=state.maxVolume>0?state.maxVolume:100;

  const svb=document.getElementById('sp-vol-bar');if(svb)svb.style.width=Math.min((state.volume/maxVol)*100,100)+'%';

  // ── Sensors panel — Score card ──

  const sscore=document.getElementById('sp-score');if(sscore)sscore.textContent=state.score;

  const ssb=document.getElementById('sp-score-bar');if(ssb)ssb.style.width=Math.min((state.score/500)*100,100)+'%';

  // ── Sensors panel — Status card ──

  const sslabel=document.getElementById('sp-status-label');

  const sssub=document.getElementById('sp-status-sub');

  const scard=document.getElementById('sp-status-card');

  if(sslabel&&sssub){

    if(state.running){

      sslabel.textContent='Running…';sslabel.style.color='var(--emerald)';

      sssub.textContent='Reaction in progress';

      if(scard)scard.style.borderColor='rgba(16,185,129,.35)';

    } else if(state.status==='done'||document.getElementById('mob-status-text')?.textContent?.includes('Complete')){

      sslabel.textContent='Complete ✅';sslabel.style.color='var(--cyan)';

      const rxn=REACTIONS[state.currentReaction];

      sssub.textContent=rxn?rxn.observation.substring(0,60)+'…':'Experiment done';

      if(scard)scard.style.borderColor='rgba(6,182,212,.35)';

    } else {

      sslabel.textContent='Idle';sslabel.style.color='var(--amber)';

      const rxn=REACTIONS[state.currentReaction];

      const done=state.selectedChems.length;const total=rxn?rxn.chemicals.length:0;

      sssub.textContent=done>0?`${done}/${total} chemicals added`:'Select chemicals and run';

      if(scard)scard.style.borderColor='';

    }

  }

  // ── Step progress dots ──

  const dotsEl=document.getElementById('sp-step-dots');

  if(dotsEl){

    const rxn=REACTIONS[state.currentReaction];

    if(rxn){

      dotsEl.innerHTML=rxn.chemicals.map((_,i)=>{

        const done=i<state.selectedChems.length;

        const active=i===state.selectedChems.length&&!state.running;

        const col=done?'var(--emerald)':active?'var(--cyan)':'var(--border)';

        return `<div style="width:8px;height:8px;border-radius:50%;background:${col};transition:.3s${active?';box-shadow:0 0 6px var(--cyan)':''}"></div>`;

      }).join('');

    }

  }

}



function syncMobileState(){

  buildMobChemicals(REACTIONS[state.currentReaction]);updateMobSensors();

}



function setMobStatus(s){

  state.status=s;

  const badge=document.getElementById('mob-status-badge');const text=document.getElementById('mob-status-text');if(!badge)return;

  badge.className='tb-badge '+(s==='running'?'badge-run':s==='done'?'badge-done':'badge-idle');

  text.textContent=s==='running'?'Running…':s==='done'?'Complete ✅':'Idle';

  // Sync sensor panel status card if open

  updateMobSensors();

}



function mobRunReaction(){

  if(state.running)return;

  const rxn=REACTIONS[state.currentReaction];

  if(state.selectedChems.length<2){document.getElementById('warning-modal').classList.add('show');return;}

  state.running=true;

  document.getElementById('mob-run-btn').disabled=true;

  setMobStatus('running');

  const phTarget=Math.max(0,Math.min(14,rxn.finalPH));

  const tempTarget=Math.max(20,rxn.finalTemp||30);

  const phStart=state.ph;const tempStart=state.temp||25;

  let step=0,totalSteps=50;

  const colorStart=state.currentColor;const colorEnd=rxn.liquidEnd;

  if(rxn.bubbles){state.bubbleInterval=setInterval(()=>{const bg=document.getElementById('mob-beaker-scene')?.querySelector('#bubbles-group');if(bg){const b=document.createElementNS('http://www.w3.org/2000/svg','circle');b.setAttribute('cx',80+Math.random()*80);b.setAttribute('cy',200);b.setAttribute('r',2+Math.random()*4);b.setAttribute('fill','rgba(255,255,255,.3)');bg.appendChild(b);b.style.animation='bubble-rise 1.5s ease-out forwards';setTimeout(()=>b.remove(),1600);}},200);}

  const interval=setInterval(()=>{

    step++;const t=easeInOut(step/totalSteps);

    state.ph=Math.max(0,Math.min(14,phStart+(phTarget-phStart)*t));

    state.temp=Math.max(20,Math.min(500,tempStart+(tempTarget-tempStart)*t));

    state.volume=Math.min(state.maxVolume*(0.3+t*0.7),state.maxVolume);

    updateMobSensors();

    const col=gradientColor(colorStart,colorEnd,t);

    updateBeakerLiquidInEl(document.getElementById('mob-beaker-scene'),col,0.38+t*0.36);

    const spColor=document.getElementById('sp-color');if(spColor){spColor.style.background=col;}

    if(step>=totalSteps){

      clearInterval(interval);state.running=false;

      if(state.bubbleInterval){clearInterval(state.bubbleInterval);state.bubbleInterval=null;}

      document.getElementById('mob-run-btn').disabled=false;

      setMobStatus('done');

      state.score+=50+(state.selectedChems.length*5);

      updateMobSensors();

      state.experimentHistory.push({name:rxn.name,icon:rxn.icon,score:state.score,time:getTime(),ph:phTarget.toFixed(2),temp:tempTarget.toFixed(1),color:rxn.finalColor,equation:rxn.equation});

      renderMobHistory();renderExpHistory();

      if(currentUser&&currentUser.email){saveUserHistory(currentUser.email);}

      const sa=document.getElementById('success-anim');sa.classList.add('show');setTimeout(()=>sa.classList.remove('show'),2000);

      spawnSparks();

      const sc2=document.getElementById('mob-color-sensor');if(sc2)sc2.textContent=rxn.finalColor;

      const spColor2=document.getElementById('sp-color');if(spColor2){spColor2.style.background=rxn.finalColorCSS;spColor2.textContent=rxn.finalColor;}

      setTimeout(()=>showResult(rxn,phTarget,tempTarget),600);

      mobAddAIMsg('### ✅ Reaction Complete!\n\n**'+rxn.observation+'**\n\n| Param | Value |\n|---|---|\n| pH | '+phTarget.toFixed(2)+' |\n| Temp | '+tempTarget.toFixed(1)+'°C |\n| Color | '+rxn.finalColor+' |\n\n**Conclusion:** '+rxn.conclusion+'\n\n🏆 +'+(50+(state.selectedChems.length*5))+' pts!',true);

    }

  },60);

}



function mobReset(){

  if(state.running){if(state.bubbleInterval)clearInterval(state.bubbleInterval);state.running=false;}

  state.selectedChems=[];state.ph=7.0;state.temp=25.0;state.volume=0;

  const rxn=REACTIONS[state.currentReaction];

  const scene=document.getElementById('mob-beaker-scene');

  if(scene)scene.innerHTML=HARDWARE[rxn.hardware]||HARDWARE.beaker;

  buildMobChemicals(rxn);updateMobSensors();setMobStatus('idle');

  document.getElementById('mob-run-btn').disabled=false;

  const sc=document.getElementById('mob-color-sensor');if(sc)sc.textContent='—';

  const spColor=document.getElementById('sp-color');if(spColor){spColor.style.background='rgba(6,182,212,.08)';spColor.textContent='No reaction';}

  showToast('🔄 Lab reset');

}



function renderMobHistory(){

  const el=document.getElementById('sp-history');if(!el)return;

  const cntEl=document.getElementById('sp-history-count');

  if(!state.experimentHistory.length){

    el.innerHTML='<div style="color:var(--text3);font-size:11px;padding:8px 0">No experiments run yet.<br><span style="font-size:9px">Complete your first experiment to see history!</span></div>';

    if(cntEl)cntEl.textContent='0 experiments';

    return;

  }

  if(cntEl)cntEl.textContent=state.experimentHistory.length+' experiments';

  const hcEl=document.getElementById('hist-count');if(hcEl)hcEl.textContent=state.experimentHistory.length+' runs';

  const all=state.experimentHistory.slice().reverse();

  el.innerHTML=all.map((e,i)=>`

    <div style="display:flex;align-items:flex-start;gap:7px;padding:7px 0;border-bottom:1px solid var(--border)${i===0?';background:rgba(6,182,212,.04);padding:7px;border-radius:6px;margin-bottom:3px':''}">

      <span style="font-size:1.1rem;flex-shrink:0">${e.icon}</span>

      <div style="flex:1;min-width:0">

        <div style="font-size:11px;color:var(--text);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.name}</div>

        <div style="font-size:9px;color:var(--text3);font-family:var(--fm);margin-top:2px">${e.time} · <span style="color:var(--amber)">${e.score||0} pts</span>${e.ph?' · pH '+e.ph:''}${e.color?' · '+e.color:''}</div>

        ${i===0?'<div style="font-size:8px;color:var(--cyan);font-family:var(--fm);margin-top:2px">◀ Latest</div>':''}

      </div>

    </div>`).join('');

  el.innerHTML+=`<div style="margin-top:8px;display:flex;gap:6px"><button onclick="clearUserHistory()" style="flex:1;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:var(--red);padding:5px;border-radius:6px;font-size:9px;cursor:pointer;font-family:var(--fm)"><i class="fas fa-trash"></i> Clear All</button></div>`;

}



/* ══════════════════════════════════════════════════════

   LOCAL CHATBOT ENGINE (no API required)

══════════════════════════════════════════════════════ */

const LOCAL_QA={

  acid_base:{

    viva:`### 🎓 Viva Questions — Acid–Base Titration\n\n**Equation:** \`HCl + NaOH → NaCl + H₂O\`\n\n#### Conceptual Questions\n1. **Q: What is titration?**\n   A: Titration is an analytical technique where a solution of known concentration (titrant) is added to a solution of unknown concentration (analyte) until the reaction reaches completion (equivalence point).\n\n2. **Q: What is the difference between the equivalence point and the endpoint?**\n   A: The equivalence point is where moles of acid = moles of base (stoichiometric completion). The endpoint is where the indicator changes color. Ideally they coincide, but a small indicator error may exist.\n\n3. **Q: Why is phenolphthalein used in this titration?**\n   A: Phenolphthalein changes color (pink→colorless) in the pH range 8.2–10.0, which falls within the sharp vertical jump (pH 4–10) of a strong acid–strong base titration curve.\n\n4. **Q: What type of reaction is HCl + NaOH?**\n   A: It is a neutralization reaction — a double displacement reaction where H⁺ from acid reacts with OH⁻ from base to form water.\n\n5. **Q: What is the molarity formula?**\n   A: M = moles of solute / volume of solution (in litres). Or M = (mass × 1000) / (molar mass × volume in mL).\n\n#### Mechanism Questions\n6. **Q: Write the ionic equation for this reaction.**\n   A: H⁺(aq) + OH⁻(aq) → H₂O(l). The spectator ions Na⁺ and Cl⁻ do not participate.\n\n7. **Q: Is HCl–NaOH titration exothermic or endothermic?**\n   A: Exothermic. ΔH = −57.3 kJ/mol. Bond formation in water releases energy.\n\n8. **Q: What is a primary standard? Is NaOH a primary standard?**\n   A: A primary standard is a highly pure, stable compound used to prepare standard solutions. NaOH is NOT a primary standard — it absorbs CO₂ and moisture. Oxalic acid is used instead.\n\n9. **Q: What happens to the pH at the equivalence point?**\n   A: pH = 7 for strong acid + strong base because NaCl (salt formed) does not hydrolyze.\n\n10. **Q: What is a back titration?**\n    A: A method where excess standard reagent is added to the analyte, then the excess is titrated with another standard solution. Used when direct titration endpoint is unclear.\n\n#### Calculation Questions\n11. **Q: If 25 mL of 0.1M NaOH is neutralized by 24.8 mL of HCl, find [HCl].**\n    A: M₁V₁ = M₂V₂ → [HCl] × 24.8 = 0.1 × 25 → [HCl] = 2.5/24.8 = **0.1008 M**\n\n12. **Q: Calculate the number of moles of NaCl formed if 25 mL of 0.1M NaOH reacts completely.**\n    A: moles NaOH = 0.025 × 0.1 = 0.0025 mol. Since 1:1 ratio, moles NaCl = **0.0025 mol = 2.5 mmol**\n\n13. **Q: What is the normality of 0.1M HCl?**\n    A: For HCl (n-factor = 1), Normality = Molarity × n-factor = 0.1 × 1 = **0.1 N**\n\n14. **Q: What volume of 0.1M HCl neutralizes 500 mL of 0.05M NaOH?**\n    A: M₁V₁ = M₂V₂ → 0.1 × V₁ = 0.05 × 500 → V₁ = **250 mL**\n\n15. **Q: Define pKa and relate it to acid strength.**\n    A: pKa = −log(Ka). Lower pKa = stronger acid. HCl has pKa ≈ −7 (very strong). Acetic acid pKa = 4.76 (weak acid).\n\n#### Application Questions\n16. **Q: Where is acid-base titration used industrially?**\n    A: Determining acidity of vinegar, antacid tablet analysis, water treatment, pharmaceutical quality control, soil acidity testing.\n\n17. **Q: Why must the burette be washed with the titrant before filling?**\n    A: To remove residual water that would dilute the titrant and alter its concentration, causing inaccurate results.\n\n18. **Q: What if methyl orange is used instead of phenolphthalein?**\n    A: Methyl orange changes color (red→yellow) at pH 3.1–4.4. It still works for strong acid + strong base but gives endpoint at slightly lower pH.\n\n19. **Q: What is a half-equivalence point?**\n    A: The point where half the acid is neutralized. For weak acid–strong base: pH = pKa at this point.\n\n20. **Q: What error occurs if the conical flask is washed with the analyte solution?**\n    A: No error — only moles matter, not volume of analyte solution in the flask.`,

    whatif:`### 🔮 What-If Scenarios — Acid–Base Titration\n\n#### Reactant Substitution Scenarios\n1. **What if we use acetic acid (CH₃COOH) instead of HCl?**\n   Result: Weak acid–strong base titration. The equivalence point pH will be > 7 (≈ 8.7). Phenolphthalein is still suitable. A buffer region forms before the equivalence point.\n\n2. **What if we add only HCl + NaOH without the phenolphthalein indicator?**\n   Result: No visible color change. You cannot detect the endpoint visually. A pH meter or conductance meter would be needed. This is a **partial reaction** scenario — the neutralization occurs chemically but is undetectable.\n\n3. **What if we use litmus instead of phenolphthalein?**\n   Result: Litmus changes color over a wide pH range (5–8) and gives a gradual, unclear endpoint. Not suitable for precise titrations.\n\n4. **What if NaOH is replaced by KOH (0.1M)?**\n   Result: KOH + HCl → KCl + H₂O. The reaction is identical in nature. pH at endpoint = 7. Titration works exactly the same way.\n\n5. **What if we use H₂SO₄ instead of HCl?**\n   Result: H₂SO₄ is diprotic. H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. The volume ratio changes: 1 mol H₂SO₄ needs 2 mol NaOH.\n\n#### Condition Variation Scenarios\n6. **What if we add HCl too fast (all at once)?**\n   Result: Overshoot the endpoint. The indicator turns colorless too early, making it impossible to detect the exact endpoint. Must restart.\n\n7. **What if temperature is increased to 60°C?**\n   Result: Neutralization is faster. However, some indicators (like phenolphthalein) lose sensitivity at high temperature. pH of pure water shifts slightly (Kw increases).\n\n8. **What if the concentration of HCl is doubled to 0.2M?**\n   Result: Half the volume of HCl would be needed to reach equivalence point. M₁V₁ = M₂V₂ still holds.\n\n9. **What if we remove NaOH products during titration (Le Chatelier)?**\n   Result: The equilibrium H⁺ + OH⁻ ⇌ H₂O shifts forward. Neutralization is thermodynamically favored regardless.\n\n10. **What if we perform this titration at pH 3 (acidic buffer)?**\n    Result: The initial pink color of phenolphthalein won't appear. A different indicator appropriate for the pH range must be chosen.\n\n#### Partial Reaction / Missing Reagent Scenarios\n11. **What if only HCl and NaOH are added but no indicator?**\n    Result: Neutralization occurs chemically (H⁺ + OH⁻ → H₂O), but there is NO way to visually detect the endpoint. The experiment is scientifically incomplete.\n\n12. **What if only HCl is added to the flask (no NaOH)?**\n    Result: Only acid present. No reaction occurs. pH ≈ 1. Adding indicator turns solution colorless (acid side). No endpoint is reachable.\n\n13. **What if NaOH is added but HCl is never run from the burette?**\n    Result: NaOH + phenolphthalein = pink solution. No titration happens. pH remains strongly basic (≈ 13).\n\n14. **What if distilled water is forgotten (reaction done without dilution)?**\n    Result: Concentrations remain higher. Endpoint is sharper, but heat generated is more intense. Endpoint still detectable.\n\n15. **What if we accidentally use tap water instead of distilled water?**\n    Result: Tap water contains Ca²⁺, Mg²⁺, CO₂ — these may cause slight carbonate interference and reduce accuracy.\n\n#### Extreme Scenarios\n16. **What if we use 10M HCl instead of 0.1M?**\n    Result: Extremely dangerous — fuming, corrosive. Would instantly overshoot endpoint. Serious safety hazard.\n\n17. **What if we perform this in zero gravity (ISS)?**\n    Result: Liquids form spherical droplets. Mixing requires mechanical stirring. Color change is still visible but droplets may separate.\n\n18. **What if we use D₂O (heavy water) instead of H₂O?**\n    Result: pKw of D₂O = 14.87 (vs 14 for H₂O). Reaction still occurs: DCl + NaOD → NaCl + D₂O. Slightly different equilibrium constants.\n\n19. **What if we add the indicator before adding NaOH?**\n    Result: In acid (HCl), phenolphthalein is colorless. Adding NaOH causes pink to appear at endpoint — experiment works the same way.\n\n20. **What if we scale this up 1000× for industrial use?**\n    Result: Industrial neutralization plants use inline pH electrodes (not indicators), automated dosing pumps, and heat exchangers to manage the exothermic heat generated.`,

    partial:`### ⚗️ Partial Reaction Analysis — Acid–Base Titration\n\n#### Scenario: Only HCl + NaOH (no indicator added)\n**What happens:** The neutralization reaction **still occurs** at the molecular level:\n\`HCl + NaOH → NaCl + H₂O\`\n\nHowever, there is **no visual way to detect the endpoint**. The solution remains colorless throughout. You would need a pH meter to find equivalence point.\n\n**Missing:** Phenolphthalein indicator — the endpoint detector.\n\n#### Scenario: Only HCl + Phenolphthalein (no NaOH)\n**Result:** HCl is acidic. Phenolphthalein is colorless in acid. No pink color forms. No reaction takes place. pH remains ≈ 1.\n\n#### Scenario: Only NaOH + Phenolphthalein (no HCl)\n**Result:** NaOH is basic. Phenolphthalein turns **bright pink**. But this is not a titration — no acid is being added to neutralize the base. pH ≈ 13.\n\n#### Scenario: Only first 2 chemicals (HCl + NaOH), no water\n**Result:** Reaction proceeds. NaCl + H₂O formed. Since concentrations are higher without water dilution, the heat generated is slightly higher. Endpoint still reachable with indicator.`,

  },

  redox:{

    viva:`### 🎓 Viva Questions — Redox: KMnO₄ + FeSO₄\n\n**Equation:** \`KMnO₄ + FeSO₄ + H₂SO₄ → MnSO₄ + Fe₂(SO₄)₃ + K₂SO₄ + H₂O\`\n\n#### Conceptual Questions\n1. **Q: What is a redox reaction?**\n   A: A reaction where simultaneous oxidation and reduction occurs. One species loses electrons (oxidation) and another gains electrons (reduction).\n\n2. **Q: What is the oxidation state of Mn in KMnO₄?**\n   A: K is +1, O is −2 × 4 = −8. So Mn = +7. It is reduced to Mn²⁺ (+2) during the reaction.\n\n3. **Q: What is the change in oxidation state of Fe?**\n   A: Fe in FeSO₄ is Fe²⁺. It is oxidized to Fe³⁺ in Fe₂(SO₄)₃. Oxidation state increases by 1.\n\n4. **Q: Why is H₂SO₄ added? Can HCl be used instead?**\n   A: H₂SO₄ provides the acidic medium. HCl CANNOT be used — Cl⁻ ions are oxidized by KMnO₄ causing interference.\n\n5. **Q: Why is KMnO₄ called a self-indicator?**\n   A: KMnO₄ is intensely purple. When all Fe²⁺ is consumed, the next drop of KMnO₄ gives a permanent faint pink color — acting as its own endpoint indicator.\n\n#### Mechanism Questions\n6. **Q: Write the half-reactions.**\n   A: Reduction: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O\n   Oxidation: Fe²⁺ → Fe³⁺ + e⁻ (×5)\n   Overall: MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O\n\n7. **Q: Why does KMnO₄ decolorize during the reaction?**\n   A: Purple MnO₄⁻ (Mn⁷⁺) is reduced to colorless Mn²⁺ as it oxidizes Fe²⁺. Color disappears until all Fe²⁺ is consumed.\n\n8. **Q: What is the E° cell for this reaction?**\n   A: E°(MnO₄⁻/Mn²⁺) = +1.51 V; E°(Fe³⁺/Fe²⁺) = +0.77 V. E°cell = 1.51 − 0.77 = **+0.74 V** (spontaneous).\n\n9. **Q: What are oxidizing and reducing agents here?**\n   A: KMnO₄ is the **oxidizing agent** (it gets reduced). FeSO₄ is the **reducing agent** (it gets oxidized).\n\n10. **Q: What is disproportionation?**\n    A: A reaction where the same substance is both oxidized and reduced. Example: H₂O₂ → H₂O + O₂.\n\n#### Calculation Questions\n11. **Q: If 25 mL of FeSO₄ requires 5 mL of 0.02M KMnO₄, find [FeSO₄].**\n    A: moles KMnO₄ = 0.005 × 0.02 = 0.0001 mol\n    From equation: 1 KMnO₄ : 5 FeSO₄\n    moles FeSO₄ = 5 × 0.0001 = 0.0005 mol\n    [FeSO₄] = 0.0005/0.025 = **0.02 M**\n\n12. **Q: Calculate the equivalent weight of KMnO₄ in acidic medium.**\n    A: Molar mass of KMnO₄ = 158 g/mol. n-factor (electrons gained) = 5. Eq. weight = 158/5 = **31.6 g/eq**\n\n13. **Q: What is the normality of 0.02M KMnO₄?**\n    A: N = M × n-factor = 0.02 × 5 = **0.1 N**\n\n14. **Q: At equivalence: N₁V₁ = N₂V₂. Find V of 0.1N FeSO₄ needed for 10 mL of 0.1N KMnO₄.**\n    A: 0.1 × 10 = 0.1 × V₂ → V₂ = **10 mL**\n\n15. **Q: What is the cell reaction EMF and how does it confirm spontaneity?**\n    A: ΔG° = −nFE°. Since E° = +0.74 V, ΔG° < 0 → reaction is spontaneous under standard conditions.\n\n#### Application Questions\n16. **Q: Industrial uses of KMnO₄?**\n    A: Water purification, bleaching agent, antiseptic (Condy's crystals), oxidizing agent in organic synthesis, treatment of iron/manganese in water.\n\n17. **Q: Why is this titration done at room temperature?**\n    A: At high temperatures, KMnO₄ can decompose (4KMnO₄ → 2K₂MnO₄ + 2MnO₂ + O₂) giving inaccurate results.\n\n18. **Q: What is the color of MnSO₄ formed?**\n    A: MnSO₄ is nearly colorless (pale pink), confirming the reduction of Mn⁷⁺ to Mn²⁺.\n\n19. **Q: Can FeSO₄ solution be stored for long?**\n    A: No — Fe²⁺ is slowly oxidized to Fe³⁺ by atmospheric O₂. Must be freshly prepared.\n\n20. **Q: What happens if excess KMnO₄ is added past the endpoint?**\n    A: The solution turns permanently purple/pink (excess KMnO₄ unreacted). Indicates overshoot — endpoint missed.`,

    whatif:`### 🔮 What-If Scenarios — Redox: KMnO₄ + FeSO₄\n\n#### Reactant Substitution Scenarios\n1. **What if HCl is used instead of H₂SO₄?**\n   Cl⁻ ions are oxidized by KMnO₄ → Cl₂ gas. The titration is ruined. Always use H₂SO₄ for KMnO₄ titrations.\n\n2. **What if we use K₂Cr₂O₇ instead of KMnO₄?**\n   K₂Cr₂O₇ also oxidizes Fe²⁺ in acid. Cr₂O₇²⁻ (orange) → Cr³⁺ (green). Not self-indicating — needs diphenylamine indicator.\n\n3. **What if we use Fe₂(SO₄)₃ (ferric sulfate) instead of FeSO₄?**\n   Fe³⁺ cannot be oxidized further by KMnO₄. No reaction would occur between them. The KMnO₄ would remain purple.\n\n4. **What if only KMnO₄ + FeSO₄ are mixed without H₂SO₄?**\n   In neutral/basic medium, KMnO₄ is reduced to MnO₂ (brown precipitate) instead of Mn²⁺. The reaction still occurs but produces different products. No clear endpoint.\n\n5. **What if Na₂SO₄ replaces H₂SO₄?**\n   Na₂SO₄ is neutral, not acidic. Without H⁺, the half-reaction MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ cannot proceed properly. Brown MnO₂ precipitate forms instead.\n\n#### Partial Reaction Scenarios\n6. **What if only KMnO₄ + H₂SO₄ are added (no FeSO₄)?**\n   No reducing agent present. KMnO₄ remains purple in acidic solution. No color change. No redox reaction occurs.\n\n7. **What if only FeSO₄ + H₂SO₄ are added (no KMnO₄)?**\n   FeSO₄ stays as light green solution in acid. No oxidizing agent. No reaction. pH decreases due to H₂SO₄.\n\n8. **What if only KMnO₄ + FeSO₄ (no H₂SO₄) are added?**\n   Reaction occurs in neutral medium: MnO₄⁻ + 3e⁻ → MnO₂↓ (brown/black). Endpoint unclear due to precipitate.\n\n#### Condition Variation Scenarios\n9. **What if temperature is doubled (50°C)?**\n   KMnO₄ may start to decompose, releasing O₂. Rate increases but accuracy decreases. Risk of premature endpoint.\n\n10. **What if concentration of FeSO₄ is increased 10×?**\n    More KMnO₄ needed to reach endpoint. Volume of KMnO₄ used increases proportionally. Same stoichiometry.\n\n11. **What if reaction is done in alkaline medium (NaOH added)?**\n    MnO₄⁻ is reduced to MnO₄²⁻ (manganate, green) in strongly alkaline medium, not Mn²⁺. Completely different products.\n\n12. **What if KMnO₄ solution is exposed to sunlight before use?**\n    KMnO₄ decomposes photochemically: 4KMnO₄ → 2K₂MnO₄ + 2MnO₂ + O₂. Concentration decreases → inaccurate results.\n\n#### Extreme Scenarios\n13. **What if we use 10× concentrated H₂SO₄?**\n    Concentrated H₂SO₄ may cause charring and side reactions. Dilute H₂SO₄ is always recommended.\n\n14. **What if all 3 chemicals are added simultaneously?**\n    Fast mixing causes KMnO₄ to rapidly decolorize. Hard to control and observe the endpoint precisely.\n\n15. **What if iron nails are dropped directly into KMnO₄?**\n    Fe(s) → Fe²⁺ + 2e⁻. Iron dissolves and KMnO₄ decolorizes. Same redox chemistry but heterogeneous (solid-liquid).\n\n16. **What if this is done in absence of H⁺ (pure water medium)?**\n    Brown MnO₂ precipitate forms. Filtration needed. Used in water purification to remove Fe and Mn.\n\n17. **What if radioactive ⁵⁶Fe is used?**\n    Chemistry identical. The Fe²⁺ → Fe³⁺ oxidation still occurs. Radioactivity allows tracking Fe distribution analytically.\n\n18. **What if electric field is applied during reaction?**\n    Would speed up ion migration (electrophoresis effect) but no fundamental change in reaction mechanism.\n\n19. **What if reaction is done under inert atmosphere (N₂ gas)?**\n    Prevents aerial oxidation of Fe²⁺ to Fe³⁺. Solution stays fresher longer. More accurate titration results.\n\n20. **What if we scale up 1000× industrially?**\n    Used for iron determination in ore, water analysis, pharmaceutical Fe content. Automated colorimetric analyzers replace manual titration.`,

    partial:`### ⚗️ Partial Reaction Analysis — Redox: KMnO₄ + FeSO₄\n\n#### Only KMnO₄ + FeSO₄ (missing H₂SO₄)\n**Result:** Without acid, the half-reaction changes:\nMnO₄⁻ + 3e⁻ → MnO₂↓ (brown precipitate) instead of Mn²⁺\nA **brown precipitate** forms, obscuring the endpoint. Self-indication by color fails.\n\n#### Only KMnO₄ + H₂SO₄ (missing FeSO₄)\n**Result:** No reducing agent. KMnO₄ remains purple. No reaction. The oxidizing agent has nothing to oxidize.\n\n#### First two chemicals only: KMnO₄ + FeSO₄\n**Partial result:** Redox does occur but produces MnO₂ (brown solid) instead of colorless Mn²⁺. The experiment gives incorrect products and no clear endpoint.\n\n#### Why all 3 reactants are essential:\n- KMnO₄ = oxidizing agent\n- FeSO₄ = reducing agent\n- H₂SO₄ = provides H⁺ to direct Mn to +2 state (colorless endpoint)`

  },

  precipitation:{

    viva:`### 🎓 Viva Questions — Precipitation: PbI₂ (Golden Rain)\n\n**Equation:** \`Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃\`\n\n#### Conceptual Questions\n1. **Q: What is a precipitation reaction?**\n   A: A reaction where two soluble ionic compounds react in aqueous solution to form an insoluble salt (precipitate).\n\n2. **Q: What is the Ksp of PbI₂ and its significance?**\n   A: Ksp(PbI₂) ≈ 9.8 × 10⁻⁹. This extremely low value means PbI₂ barely dissolves — any combination of Pb²⁺ and I⁻ exceeding this product instantly precipitates.\n\n3. **Q: Why is the precipitate golden yellow?**\n   A: PbI₂ has an orthorhombic crystal structure with strong Pb–I charge transfer interactions that absorb blue light, giving the characteristic golden yellow color.\n\n4. **Q: What is the 'golden rain' effect?**\n   A: When hot PbI₂ solution cools, bright golden-yellow crystals grow and fall through the liquid — a visually stunning crystallization phenomenon.\n\n5. **Q: What are spectator ions in this reaction?**\n   A: K⁺ and NO₃⁻ are spectator ions — they remain in solution and do not participate in precipitate formation.\n\n#### Mechanism Questions\n6. **Q: Write the net ionic equation.**\n   A: Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)\n\n7. **Q: What is the ion product Q and how does it compare to Ksp?**\n   A: Q = [Pb²⁺][I⁻]². When Q > Ksp, precipitation occurs. In this reaction, mixing 0.1M solutions gives Q >> Ksp, so immediate precipitation happens.\n\n8. **Q: Why is dilute HNO₃ sometimes added?**\n   A: To prevent formation of Pb(OH)₂ (another precipitate) by keeping the solution acidic.\n\n9. **Q: What is common ion effect in this context?**\n   A: Adding excess KI increases [I⁻], further reducing PbI₂ solubility (Q >> Ksp), causing more complete precipitation.\n\n10. **Q: Is this reaction reversible?**\n    A: Yes — PbI₂ dissolves in hot water (temperature increases Ksp). Cooling precipitates it again — basis of the golden rain experiment.\n\n#### Calculation Questions\n11. **Q: Calculate molar solubility of PbI₂ given Ksp = 9.8 × 10⁻⁹.**\n    A: Let s = molar solubility. Ksp = (s)(2s)² = 4s³ = 9.8×10⁻⁹ → s³ = 2.45×10⁻⁹ → s = **1.35 × 10⁻³ M**\n\n12. **Q: How many grams of PbI₂ dissolve in 1 L water? (Molar mass = 461 g/mol)**\n    A: s = 1.35 × 10⁻³ mol/L × 461 g/mol = **0.623 g/L**\n\n13. **Q: If [Pb²⁺] = 0.01M, what [I⁻] just starts precipitation?**\n    A: Ksp = [Pb²⁺][I⁻]² → [I⁻]² = 9.8×10⁻⁹/0.01 = 9.8×10⁻⁷ → [I⁻] = **9.9 × 10⁻⁴ M**\n\n14. **Q: What is the mass of PbI₂ formed from 20 mL of 0.1M Pb(NO₃)₂?**\n    A: moles Pb²⁺ = 0.02 × 0.1 = 0.002 mol. moles PbI₂ = 0.002 mol. mass = 0.002 × 461 = **0.922 g**\n\n15. **Q: Define solubility product constant (Ksp) mathematically.**\n    A: For PbI₂(s) ⇌ Pb²⁺(aq) + 2I⁻(aq): Ksp = [Pb²⁺][I⁻]². Only ions in the equilibrium expression, not the solid.\n\n#### Application Questions\n16. **Q: Why is lead iodide important?**\n    A: PbI₂ is a semiconductor used in X-ray detectors, gamma-ray detectors, and perovskite solar cells.\n\n17. **Q: How does selective precipitation work?**\n    A: By controlling [anion], you can precipitate specific metal ions. Used to separate mixtures — e.g., adding Cl⁻ precipitates Pb²⁺ (PbCl₂) before Ag⁺.\n\n18. **Q: What safety precaution is needed with Pb(NO₃)₂?**\n    A: Lead compounds are highly toxic (neurotoxin). Wear gloves, avoid ingestion. Dispose of waste in designated lead waste containers.\n\n19. **Q: How can you reverse the precipitation of PbI₂?**\n    A: Heat the precipitate in water — PbI₂ dissolves at higher temperatures (Ksp increases). Cooling recrystallizes it.\n\n20. **Q: What is fractional precipitation?**\n    A: Separating ions from a mixture by adding precipitating agent slowly. The ion with lower Ksp precipitates first.`,

    whatif:`### 🔮 What-If Scenarios — Precipitation: PbI₂\n\n#### Reactant Substitution Scenarios\n1. **What if KBr is used instead of KI?**\n   PbBr₂ forms (Ksp ≈ 6.6×10⁻⁶) — much more soluble than PbI₂. A pale white precipitate forms. Less dramatic than golden rain.\n\n2. **What if AgNO₃ replaces Pb(NO₃)₂?**\n   AgI forms (Ksp = 8.5×10⁻¹⁷) — bright yellow precipitate, even less soluble than PbI₂. More complete precipitation.\n\n3. **What if only Pb(NO₃)₂ + KI are added without distilled water?**\n   No water = no ionic dissociation. Both salts remain solid. No precipitation occurs. Water is essential as solvent.\n\n4. **What if NaI is used instead of KI?**\n   Same result — NaI also provides I⁻ ions. Pb²⁺ + 2I⁻ → PbI₂↓. Spectator ion changes from K⁺ to Na⁺ but precipitate is identical.\n\n5. **What if K₂SO₄ is used instead of KI?**\n   PbSO₄ would form (Ksp = 1.6×10⁻⁸) — white precipitate. No golden color. Different product entirely.\n\n#### Partial Reaction Scenarios\n6. **What if only Pb(NO₃)₂ is added (no KI)?**\n   No precipitation. Pb(NO₃)₂ is soluble. Clear solution remains. No Pb²⁺ + I⁻ combination = no PbI₂.\n\n7. **What if only KI is added (no Pb²⁺)?**\n   KI dissolves completely, clear solution. No precipitate. I⁻ alone cannot form PbI₂ without Pb²⁺.\n\n8. **What if HNO₃ is omitted?**\n   Pb²⁺ may react with OH⁻ from water to form Pb(OH)₂ (white precipitate) alongside PbI₂, making observation unclear.\n\n9. **What if only very small amounts of KI are added (not stoichiometric)?**\n   Incomplete precipitation. Some Pb²⁺ remains in solution. Precipitate is lighter in color and smaller in quantity. Q < Ksp initially if amounts are tiny.\n\n10. **What if water is omitted from the system?**\n    Salts cannot ionize without solvent. No ions present. No precipitation reaction possible.\n\n#### Condition Variation Scenarios\n11. **What if we heat the precipitate to 100°C?**\n    PbI₂ dissolves (Ksp increases with temperature). Golden-yellow solution forms. Cooling → beautiful golden crystals regrow (golden rain).\n\n12. **What if concentration of KI is increased 10×?**\n    Common ion effect — [I⁻] is very high. PbI₂ precipitates more completely. More precipitate formed.\n\n13. **What if reaction is done in ethanol instead of water?**\n    Polarity decreases. Ionic dissociation is reduced. PbI₂ precipitation may be incomplete or different morphology crystals form.\n\n14. **What if we add excess Pb(NO₃)₂?**\n    All I⁻ consumed. Pb²⁺ in excess remains in solution. Precipitate amount limited by I⁻ (limiting reagent).\n\n15. **What if this is done at 0°C?**\n    Ksp decreases. PbI₂ becomes even less soluble. More complete precipitation but slower kinetics.\n\n#### Extreme Scenarios\n16. **What if lead is replaced with a non-toxic metal?**\n    Using Bi³⁺ + I⁻ → BiI₃ (black). Different color and properties. Research into non-toxic perovskite alternatives.\n\n17. **What if we use radioactive ²¹⁰Pb?**\n    Identical chemistry — ²¹⁰Pb²⁺ + 2I⁻ → ²¹⁰PbI₂↓. Used in radiotracer studies. The precipitate is radioactive and requires special handling.\n\n18. **What if PbI₂ is used as solar cell material?**\n    PbI₂ + CH₃NH₃I → CH₃NH₃PbI₃ (perovskite). Bandgap ≈ 1.6 eV. Excellent light absorber for solar cells.\n\n19. **What if we add surfactant to the solution?**\n    Surfactant may stabilize colloidal PbI₂ particles. Instead of large crystals settling, a yellow colloid forms.\n\n20. **What if we freeze the golden rain precipitate in liquid nitrogen?**\n    Crystal structure preserved but brittle. On warming, Ksp increases and some dissolves back. No permanent change in chemical identity.`,

    partial:`### ⚗️ Partial Reaction Analysis — Precipitation: PbI₂\n\n#### Only Pb(NO₃)₂ + KI (2 reactants — the key pair)\n**Result:** Immediate bright golden-yellow precipitate of PbI₂! This is the core reaction. The other chemicals (HNO₃, H₂O) are for optimization, not for the reaction itself.\n\`Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)↓\` (golden yellow)\n\n#### Only Pb(NO₃)₂ + HNO₃ (no KI)\n**Result:** No precipitate. Pb(NO₃)₂ is soluble in acidic solution. Without I⁻ ions, no PbI₂ can form.\n\n#### Only KI + HNO₃ (no lead salt)\n**Result:** KI remains in solution. I⁻ may get oxidized to I₂ by strong oxidizers, but HNO₃ (dilute) does not oxidize I⁻. No precipitate.\n\n#### Key insight:\nThe **minimum required** for this experiment is **Pb(NO₃)₂ + KI in water**. The other two chemicals (HNO₃ and distilled water) improve conditions but aren't strictly needed for the basic precipitation to occur.`

  }

};



// Generic response builder for reactions not in LOCAL_QA

function genericVivaResponse(rxn){

  return `### 🎓 Viva Questions — ${rxn.name}\n\n**Equation:** \`${rxn.equation}\`\n\n#### Basic Conceptual Questions\n1. **Q: What type of reaction is ${rxn.name}?**\n   A: ${rxn.conclusion}\n\n2. **Q: Write the balanced chemical equation.**\n   A: \`${rxn.equation}\`\n\n3. **Q: What is the role of each chemical used?**\n   A: ${rxn.chemicals.map((ch,i)=>`${ch.name}: ${ch.desc}`).join('; ')}\n\n4. **Q: What are the main observations in this experiment?**\n   A: ${rxn.observation}\n\n5. **Q: What is the expected color change / final product?**\n   A: Final color: ${rxn.finalColor}. Final pH: ${rxn.finalPH}.\n\n#### Mechanism Questions\n6. **Q: Describe the step-by-step procedure.**\n   A:\n${rxn.steps.map((s,i)=>`   Step ${i+1} — ${s.title}: ${s.desc}`).join('\n')}\n\n7. **Q: Is this reaction exothermic or endothermic?**\n   A: Temperature changes from 25°C to ${rxn.finalTemp}°C, indicating it is ${rxn.finalTemp>27?'exothermic (releases heat)':'endothermic or approximately thermoneutral'}.\n\n8. **Q: Does a precipitate form?**\n   A: ${rxn.precipitate?'Yes, a precipitate forms. '+rxn.observation:'No precipitate forms in this reaction.'}\n\n9. **Q: Is gas evolved?**\n   A: ${rxn.bubbles?'Yes, gas bubbles are observed ('+rxn.observation+')':'No gas evolution observed.'}\n\n10. **Q: What is the conclusion of this experiment?**\n    A: ${rxn.conclusion}\n\n#### Calculation & Analysis Questions\n11. **Q: What is the final pH and what does it indicate?**\n    A: Final pH = ${rxn.finalPH}. ${rxn.finalPH<7?'Acidic solution (pH < 7)':rxn.finalPH>7?'Basic solution (pH > 7)':'Neutral solution (pH = 7)'}.\n\n12. **Q: How would you confirm the reaction is complete?**\n    A: ${rxn.observations.map(o=>`Observe ${o}`).join('; ')}.\n\n13. **Q: What is the limiting reagent concept here?**\n    A: The chemical present in lesser stoichiometric moles gets consumed first and determines the amount of product formed.\n\n14. **Q: How does temperature affect this reaction rate?**\n    A: By Arrhenius equation, increasing temperature increases rate constant k. A 10°C rise roughly doubles the reaction rate.\n\n15. **Q: What is the activation energy?**\n    A: The minimum energy required for reactant molecules to collide successfully and form products.\n\n#### Safety & Application Questions\n16. **Q: What PPE is required for this experiment?**\n    A: Safety goggles, chemical-resistant gloves, lab coat, and closed-toe shoes are mandatory.\n\n17. **Q: What are the industrial applications of this reaction?**\n    A: ${rxn.name} is used in chemical manufacturing, pharmaceutical synthesis, and industrial chemical processes.\n\n18. **Q: How should chemical waste be disposed?**\n    A: Neutralize acids/bases before disposal. Follow institutional chemical waste regulations.\n\n19. **Q: What happens if reactants are added in wrong order?**\n    A: The procedure steps are: ${rxn.steps.map(s=>s.title).join(' → ')}. Wrong order may cause incomplete reaction or safety hazards.\n\n20. **Q: How would you improve the yield of this reaction?**\n    A: Use pure reagents, control temperature, ensure complete mixing, and use optimal concentrations as specified.`;

}



function genericWhatIfResponse(rxn){

  const c=rxn.chemicals;

  return `### 🔮 What-If Scenarios — ${rxn.name}\n\n**Equation:** \`${rxn.equation}\`\n\n#### Partial Reactant Scenarios\n1. **What if only ${c[0].name} + ${c[1].name} are added (missing ${c[2]?.name||'other chemicals'})?**\n   The first two reactants may partially react. However, without all required chemicals, the reaction is incomplete and products differ from expected.\n\n2. **What if only ${c[0].name} is added alone?**\n   No reaction. A single reactant cannot proceed without its reaction partner. Solution remains as individual chemical.\n\n3. **What if ${c[1].name} is omitted entirely?**\n   The reaction cannot complete. ${c[0].name} has no partner to react with. Observation: no color change, no precipitate, no gas.\n\n4. **What if all reactants are added simultaneously instead of step-by-step?**\n   Rapid mixing may cause sudden reaction, difficult to control. Observable changes happen at once rather than gradually.\n\n5. **What if reactants are added in reverse order (last chemical first)?**\n   Procedural change may affect intermediate observations. Final products may be the same but intermediate steps differ.\n\n#### Condition Variation Scenarios\n6. **What if temperature is doubled?**\n   By Arrhenius equation, rate roughly doubles every 10°C. Reaction would proceed ${rxn.finalTemp>27?'faster (already exothermic)':'faster but less heat needed'}.\n\n7. **What if concentration of ${c[0].name} is increased 5×?**\n   More reactant available. Reaction proceeds faster (collision theory). Yield may increase if ${c[1].name} is in excess.\n\n8. **What if reaction is done at 0°C?**\n   Decreased kinetic energy. Reaction rate drops significantly. Same products but much slower.\n\n9. **What if reaction is done at 100°C?**\n   Very fast reaction. Exothermic reactions release more energy. Some reactants may evaporate at high temperature.\n\n10. **What if we use 10× diluted reactants?**\n    Lower concentrations = fewer collisions = slower rate. Same products but reaction takes much longer.\n\n#### Process Variation Scenarios\n11. **What if we skip Step 1 (${rxn.steps[0]?.title})?**\n    Missing the first step means ${rxn.steps[0]?.desc}. Experiment cannot proceed correctly.\n\n12. **What if we skip Step 3 (${rxn.steps[2]?.title})?**\n    Skipping: ${rxn.steps[2]?.desc}. This step is critical because it leads to the main observable change.\n\n13. **What if we add a catalyst?**\n    A catalyst lowers activation energy. Reaction would proceed faster at lower temperature. Yield unchanged.\n\n14. **What if we run this experiment in absence of a solvent?**\n    Most reactions require aqueous medium for ionic dissociation. Without water, ionic reactions cannot occur.\n\n15. **What if the apparatus is not clean?**\n    Contamination can cause side reactions, unexpected color changes, or precipitates that mask true results.\n\n#### Extreme/Unusual Scenarios\n16. **What if we scale this up 1000× industrially?**\n    Industrial version uses large reactors, automated mixing, heat management systems, and continuous product separation.\n\n17. **What if we perform this in microgravity (ISS)?**\n    Liquids form spherical bubbles. Convection-driven mixing is absent. Reaction proceeds but mixing requires mechanical stirring.\n\n18. **What if we use isotopically labeled atoms?**\n    Same chemistry. Isotope labels allow tracking of atoms through reaction pathways — used in research.\n\n19. **What if electric current is applied during the reaction?**\n    Electrolysis may occur alongside the chemical reaction. Ions migrate to electrodes.\n\n20. **What if we attempt this reaction inside the human body?**\n    Biological systems have enzymes, buffers, and pH constraints. The reaction might be catalyzed or inhibited. Most lab chemicals are toxic to biological systems.`;

}



function genericPartialResponse(rxn){

  const c=rxn.chemicals;

  return `### ⚗️ Partial Reaction Analysis — ${rxn.name}\n\n**Full Equation:** \`${rxn.equation}\`\n\n#### Scenario: Only ${c[0].name} + ${c[1].name} (first 2 chemicals only)\n**Result:** A partial reaction occurs. Without ${c[2]?.name||'remaining chemicals'}, the full equation cannot be achieved. Observable changes will be incomplete or absent.\n\n#### Scenario: Only ${c[0].name} added\n**Result:** Single chemical — no reaction partner. No observable change. ${c[0].name}: ${c[0].desc}\n\n#### Scenario: Missing last step chemical (${c[c.length-1]?.name})\n**Result:** The reaction proceeds to an intermediate stage. Final products differ from the expected \`${rxn.finalColor}\` result.\n\n#### Scenario: Steps done out of order\n**Result:** Procedure is: ${rxn.steps.map((s,i)=>`${i+1}. ${s.title}`).join(' → ')}. Wrong order disrupts intermediate formations.\n\n#### Why all chemicals are needed:\n${c.map(ch=>`- **${ch.name}** (${ch.conc}): ${ch.desc}`).join('\n')}\n\nEach chemical has a specific role. Missing any one of them leads to an incomplete, inaccurate, or failed experiment.`;

}



function localChatbot(text, rxn){

  const lc=text.toLowerCase();

  const key=state.currentReaction;

  const qa=LOCAL_QA[key];



  // Greetings

  if(/^(hi|hello|hey|hii|helo|namaste|good\s*(morning|evening|afternoon))/.test(lc)){

    return `### 👋 Hello!\n\nWelcome to **ChemLab AI Assistant**!\n\nI'm your built-in chemistry tutor for **${rxn.name}**.\n\nAsk me:\n- 🎓 **"Viva questions"** — 20 exam Q&A with answers\n- 🔮 **"What-if questions"** — 20 hypothetical scenarios\n- ⚗️ **"Partial reaction"** — what happens with incomplete reactants\n- 🔬 **"Explain mechanism"** — step-by-step procedure\n- 📊 **"Observations / results"** — what to observe\n- 🥼 **"Safety precautions"** — lab safety info\n- 📐 **"pH / calculations"** — numerical analysis`;

  }



  // Viva questions

  if(lc.includes('viva')||lc.includes('exam question')||lc.includes('interview question')||(lc.includes('question') && !lc.includes('what if'))){

    return qa?.viva||genericVivaResponse(rxn);

  }



  // What-if (general)

  if(lc.includes('what if')||lc.includes('what happen')||lc.includes('hypothetical')||lc.includes('what would')){

    // Partial reactant detection

    if(lc.includes('only')||lc.includes('without')||lc.includes('missing')||lc.includes('partial')||lc.includes('2 chemical')||lc.includes('two chemical')||lc.includes('first 2')||lc.includes('skip')){

      return qa?.partial||genericPartialResponse(rxn);

    }

    return qa?.whatif||genericWhatIfResponse(rxn);

  }



  // Partial reaction explicit

  if(lc.includes('partial')||lc.includes('only 2')||lc.includes('only two')||lc.includes('first two')||lc.includes('skip step')||(lc.includes('only') && (lc.includes('chemical')||lc.includes('reactant')))){

    return qa?.partial||genericPartialResponse(rxn);

  }



  // Mechanism

  if(lc.includes('mechanism')||lc.includes('how does')||lc.includes('step by step')||lc.includes('explain')||lc.includes('procedure')){

    return `### ⚗️ Reaction Mechanism — ${rxn.name}\n\n**Balanced Equation:** \`${rxn.equation}\`\n\n#### Step-by-Step Procedure\n\n${rxn.steps.map((s,i)=>`**Step ${i+1} — ${s.title}:**\n${s.desc}\n*Action: ${s.action}*`).join('\n\n')}\n\n#### Chemicals Involved\n${rxn.chemicals.map(ch=>`- **${ch.name}** (${ch.conc}): ${ch.desc}`).join('\n')}\n\n#### Observation\n${rxn.observation}\n\n#### Conclusion\n${rxn.conclusion}\n\n| Parameter | Value |\n|---|---|\n| Final pH | ${rxn.finalPH} |\n| Final Color | ${rxn.finalColor} |\n| Final Temperature | ${rxn.finalTemp}°C |\n| Precipitate | ${rxn.precipitate?'Yes':'No'} |\n| Gas Evolution | ${rxn.bubbles?'Yes':'No'} |`;

  }



  // Safety

  if(lc.includes('safe')||lc.includes('precaution')||lc.includes('hazard')||lc.includes('ppe')||lc.includes('danger')){

    return `### 🥼 Safety Precautions — ${rxn.name}\n\n#### Personal Protective Equipment (PPE)\n- 🥽 **Safety goggles** — mandatory at all times\n- 🧤 **Chemical-resistant gloves** — protect skin from corrosives\n- 🥼 **Lab coat** — no loose clothing\n- 👟 **Closed-toe shoes** — no sandals\n\n#### Chemical-Specific Hazards\n${rxn.chemicals.map(ch=>`- **${ch.name}** (${ch.conc}): ${ch.desc}`).join('\n')}\n\n#### Emergency Procedures\n- **Acid/chemical spill on skin:** Flush with large amounts of water for 15+ minutes\n- **Eye contact:** Rinse eye with water at eyewash station for 15 minutes\n- **Ingestion:** Do NOT induce vomiting — call poison control immediately\n- **Fire:** Use CO₂ extinguisher. Never water on chemical fires\n\n#### Waste Disposal\n- Neutralize acidic/basic waste before disposal\n- Heavy metal waste (Pb, Mn compounds) in designated hazardous waste containers\n- Never pour concentrated acids/bases directly down the drain\n\n#### Lab Rules\n- Never work alone\n- Keep workspace clean and organized\n- Label all containers\n- No eating or drinking in the lab`;

  }



  // pH / calculations

  if(lc.includes('ph')||lc.includes('acid')||lc.includes('base')||lc.includes('neutral')||lc.includes('calculat')||lc.includes('molaity')||lc.includes('molarity')||lc.includes('concentration')){

    return `### 📊 pH & Calculations — ${rxn.name}\n\n**pH = −log[H⁺]** (at 25°C)\n\n| Parameter | Current | Expected Final |\n|---|---|---|\n| pH | ${state.ph.toFixed(2)} | ${rxn.finalPH} |\n| Temperature | ${state.temp.toFixed(1)}°C | ${rxn.finalTemp}°C |\n| Status | ${state.running?'Running':'Idle'} | Done |\n\n#### pH Scale Reference\n| pH Range | Classification | Color (litmus) |\n|---|---|---|\n| 0–2 | Strongly Acidic | Red |\n| 3–6 | Weakly Acidic | Orange |\n| 7 | Neutral | Purple |\n| 8–10 | Weakly Basic | Blue |\n| 11–14 | Strongly Basic | Dark Blue |\n\n#### Key Formulas\n- **Molarity:** M = moles/litre = (mass × 1000)/(molar mass × vol_mL)\n- **Normality:** N = M × n-factor\n- **Equivalence:** M₁V₁ = M₂V₂ (for 1:1 reactions)\n- **Henderson-Hasselbalch:** pH = pKa + log([A⁻]/[HA])\n- **Solubility product:** Ksp = [cation]ᵃ[anion]ᵇ\n\n**Expected change:** pH ${state.ph.toFixed(1)} → ${rxn.finalPH} (${rxn.finalPH>state.ph?'becoming more basic ↑':'becoming more acidic ↓'})`;

  }



  // Observations / results

  if(lc.includes('observ')||lc.includes('result')||lc.includes('color')||lc.includes('colour')||lc.includes('what do you see')){

    return `### 🔬 Observations & Results — ${rxn.name}\n\n**Equation:** \`${rxn.equation}\`\n\n#### Observation\n${rxn.observation}\n\n#### Key Observable Changes\n${rxn.observations.map(o=>`- ✅ **${o}**`).join('\n')}\n\n#### Data Summary\n| Parameter | Expected Value |\n|---|---|\n| Final Color | ${rxn.finalColor} |\n| Final pH | ${rxn.finalPH} |\n| Final Temperature | ${rxn.finalTemp||25}°C |\n| Precipitate Formed | ${rxn.precipitate?'Yes ✅':'No ❌'} |\n| Gas/Bubbles | ${rxn.bubbles?'Yes ✅':'No ❌'} |\n| Heat Generated | ${rxn.heat?'Yes ✅':'No ❌'} |\n\n#### Conclusion\n${rxn.conclusion}`;

  }



  // Current experiment info

  if(lc.includes('current')||lc.includes('experiment')||lc.includes('equation')||lc.includes('formula')){

    return `### 🧪 Current Experiment — ${rxn.name}\n\n**Equation:** \`${rxn.equation}\`\n\n**Prediction:** ${rxn.prediction}\n\n**Expected Result:** ${rxn.expectedResult}\n\n#### Chemicals (${rxn.chemicals.length} steps)\n${rxn.chemicals.map((ch,i)=>`**Step ${i+1}:** ${ch.name} (${ch.conc}) — ${ch.desc}`).join('\n')}\n\n**Steps Added:** ${state.selectedChems.length}/${rxn.chemicals.length}\n\n#### Expected Outcome\n- Color: ${rxn.finalColor}\n- pH: ${rxn.finalPH}\n- Temperature: ${rxn.finalTemp}°C\n- Precipitate: ${rxn.precipitate?'Yes':'No'}`;

  }



  // Default fallback — suggest options

  return `### 💬 ChemLab AI — ${rxn.name}\n\nI can answer questions about this experiment! Try asking:\n\n- 🎓 **"Give me viva questions"** — 20 exam Q&A\n- 🔮 **"What-if questions"** — 20 hypothetical scenarios\n- ⚗️ **"What if only 2 chemicals are added?"** — partial reaction analysis\n- 🔬 **"Explain the mechanism"** — step-by-step procedure\n- 📊 **"Show pH and calculations"**\n- 🔬 **"What are the observations?"**\n- 🥼 **"Safety precautions"**\n\n**Current experiment:** ${rxn.name}\n**Equation:** \`${rxn.equation}\`\n**Chemicals:** ${rxn.chemicals.map(c=>c.name).join(', ')}`;

}



/* ══════════════════════════════════════════════════════

   MOBILE CHAT

══════════════════════════════════════════════════════ */

let mobChatHistory=[];



function mobAddAIMsg(text,skipSync){

  const el=document.getElementById('mob-chat-messages');if(!el)return;

  const parsed=mdRender(text);

  const msgEl=document.createElement('div');msgEl.className='msg ai';

  msgEl.innerHTML=`<div class="msg-avatar ai-av">🤖</div><div class="msg-content"><div class="msg-bubble">${parsed}</div><div class="msg-meta"><span class="msg-time">${getTime()}</span></div></div>`;

  el.appendChild(msgEl);el.scrollTop=el.scrollHeight;

  if(!skipSync)addAIMsg(text,true);

}



function mobAddUserMsg(text){

  const el=document.getElementById('mob-chat-messages');if(!el)return;

  const initials=currentUser?currentUser.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2):'ME';

  const msgEl=document.createElement('div');msgEl.className='msg user';

  msgEl.innerHTML=`<div class="msg-avatar user-av" style="font-size:9px;font-weight:700">${initials}</div><div class="msg-content"><div class="msg-bubble">${text}</div><div class="msg-meta"><span class="msg-time">${getTime()}</span></div></div>`;

  el.appendChild(msgEl);el.scrollTop=el.scrollHeight;

}



async function mobSendChat(){

  const inp=document.getElementById('mob-chat-input');if(!inp)return;

  const text=inp.value.trim();if(!text)return;

  inp.value='';autoResize(inp);

  mobAddUserMsg(text);

  const el=document.getElementById('mob-chat-messages');

  const typingEl=document.createElement('div');typingEl.className='msg ai';typingEl.id='mob-typing';

  typingEl.innerHTML=`<div class="msg-avatar ai-av">🤖</div><div class="msg-content"><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;

  el.appendChild(typingEl);el.scrollTop=el.scrollHeight;

  const rxn=REACTIONS[state.currentReaction];

  mobChatHistory.push({role:'user',content:text});



  const apiKey=(window._CHEMLAB_KEY||'').trim();

  if(apiKey&&apiKey.startsWith('sk-ant-')){

    try{

      const systemPrompt=`You are ChemLab AI, an expert virtual chemistry lab assistant for the experiment "${rxn.name}". Equation: ${rxn.equation}. Be educational and helpful.`;

      const messages=mobChatHistory.slice(-10).map(m=>({role:m.role,content:m.content}));

      const res=await fetch('https://api.anthropic.com/v1/messages',{

        method:'POST',

        headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},

        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,system:systemPrompt,messages})

      });

      const data=await res.json();

      const reply=data.content?.find(b=>b.type==='text')?.text||localChatbot(text,rxn);

      document.getElementById('mob-typing')?.remove();

      mobChatHistory.push({role:'assistant',content:reply});

      mobAddAIMsg(reply,true);

    }catch(err){

      document.getElementById('mob-typing')?.remove();

      const reply=localChatbot(text,rxn);

      mobChatHistory.push({role:'assistant',content:reply});

      mobAddAIMsg(reply,true);

    }

  } else {

    setTimeout(()=>{

      document.getElementById('mob-typing')?.remove();

      const reply=localChatbot(text,rxn);

      mobChatHistory.push({role:'assistant',content:reply});

      mobAddAIMsg(reply,true);

    },700);

  }

}





function mobQuickAsk(text){

  const inp=document.getElementById('mob-chat-input');

  if(inp){inp.value=text;mobSendChat();}

}

function mobHandleKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();mobSendChat();}}

function mobInsertSym(s){const inp=document.getElementById('mob-chat-input');if(inp){inp.value+=s;inp.focus();}}



/* ══════════════════════════════════════════════════════

   MOBILE PANEL CONTROLS

══════════════════════════════════════════════════════ */

function openMobPanel(name){

  const panel=document.getElementById('mob-panel-'+name);

  if(panel)panel.classList.add('open');

  if(name==='sensors'){

    updateMobSensors();

    renderMobHistory();

    // Sync color display

    const spColor=document.getElementById('sp-color');

    if(spColor&&state.currentColor&&state.currentColor!=='rgba(6,182,212,0.2)'){

      spColor.style.background=state.currentColor;

      const rxn=REACTIONS[state.currentReaction];

      if(rxn&&state.running===false&&state.selectedChems.length>=rxn.chemicals.length){

        spColor.textContent=rxn.finalColor;

      }

    }

  }

}

function closeMobPanel(name){

  const panel=document.getElementById('mob-panel-'+name);

  if(panel)panel.classList.remove('open');

}



/* ══════════════════════════════════════════════════════

   DRAGGABLE STEP-GUIDE PANEL

══════════════════════════════════════════════════════ */

(function initDraggableStepGuide(){

  // Run after DOM ready

  window.addEventListener('DOMContentLoaded',()=>{

    const panel=document.getElementById('step-guide-panel');

    const handle=document.getElementById('sg-drag-handle');

    if(!panel||!handle)return;



    let dragging=false,startX=0,startY=0,origLeft=0,origTop=0;

    let isDragged=false; // track if user has dragged it free



    function startDrag(e){

      // Don't initiate drag from the snap button

      if(e.target.closest('#sg-snap-btn'))return;

      dragging=true;

      panel.classList.add('dragging');



      const rect=panel.getBoundingClientRect();

      // On first drag, convert from flow position to fixed position

      if(!isDragged){

        isDragged=true;

        panel.classList.add('dragged-free');

        // Preserve exact visual position

        panel.style.left=rect.left+'px';

        panel.style.top=rect.top+'px';

        panel.style.width=rect.width+'px';

      }



      const clientX=e.touches?e.touches[0].clientX:e.clientX;

      const clientY=e.touches?e.touches[0].clientY:e.clientY;

      startX=clientX-rect.left;

      startY=clientY-rect.top;



      e.preventDefault();

    }



    function onDrag(e){

      if(!dragging)return;

      const clientX=e.touches?e.touches[0].clientX:e.clientX;

      const clientY=e.touches?e.touches[0].clientY:e.clientY;

      let newLeft=clientX-startX;

      let newTop=clientY-startY;

      // Clamp to viewport

      const pw=panel.offsetWidth,ph=panel.offsetHeight;

      newLeft=Math.max(0,Math.min(window.innerWidth-pw,newLeft));

      newTop=Math.max(0,Math.min(window.innerHeight-ph,newTop));

      panel.style.left=newLeft+'px';

      panel.style.top=newTop+'px';

    }



    function endDrag(){

      if(!dragging)return;

      dragging=false;

      panel.classList.remove('dragging');

    }



    // Mouse events

    handle.addEventListener('mousedown',startDrag);

    document.addEventListener('mousemove',onDrag);

    document.addEventListener('mouseup',endDrag);

    // Touch events

    handle.addEventListener('touchstart',startDrag,{passive:false});

    document.addEventListener('touchmove',onDrag,{passive:false});

    document.addEventListener('touchend',endDrag);

  });

})();



function snapStepGuide(){

  const panel=document.getElementById('step-guide-panel');

  if(!panel)return;

  panel.classList.remove('dragged-free','dragging');

  panel.style.left='';panel.style.top='';panel.style.width='';

}



/* ══════════════════════════════════════════════════════

   DRAGGABLE MOBILE FAB BUTTONS

══════════════════════════════════════════════════════ */

(function initDraggableFabs(){

  window.addEventListener('DOMContentLoaded',()=>{

    ['mob-ai-fab','mob-steps-fab'].forEach(fabId=>{

      const fab=document.getElementById(fabId);

      if(!fab)return;

      // Make cursor:touch-action none work

      fab.style.touchAction='none';



      let dragging=false,startX=0,startY=0,hasMoved=false;

      const DRAG_THRESHOLD=6; // px movement before considered a drag



      function startDrag(e){

        const clientX=e.touches?e.touches[0].clientX:e.clientX;

        const clientY=e.touches?e.touches[0].clientY:e.clientY;

        const rect=fab.getBoundingClientRect();

        startX=clientX-rect.left;

        startY=clientY-rect.top;

        dragging=true;hasMoved=false;

        // Convert to fixed position using current visual position

        if(!fab.style.bottom||fab.style.bottom===''){

          // First drag: lock in current position

          fab.style.left=rect.left+'px';

          fab.style.top=rect.top+'px';

          fab.style.bottom='auto';

          fab.style.right='auto';

        }

        e.preventDefault();

      }



      function onDrag(e){

        if(!dragging)return;

        const clientX=e.touches?e.touches[0].clientX:e.clientX;

        const clientY=e.touches?e.touches[0].clientY:e.clientY;

        const dx=clientX-startX-parseFloat(fab.style.left||0);

        const dy=clientY-startY-parseFloat(fab.style.top||0);

        // Check if moved enough to be a drag

        if(!hasMoved&&Math.abs(dx)+Math.abs(dy)>DRAG_THRESHOLD){

          hasMoved=true;

          fab.classList.add('fab-dragging');

        }

        if(!hasMoved)return;

        let newLeft=clientX-startX;

        let newTop=clientY-startY;

        const w=fab.offsetWidth,h=fab.offsetHeight;

        newLeft=Math.max(8,Math.min(window.innerWidth-w-8,newLeft));

        newTop=Math.max(8,Math.min(window.innerHeight-h-8,newTop));

        fab.style.left=newLeft+'px';

        fab.style.top=newTop+'px';

        fab.style.bottom='auto';

        fab.style.right='auto';

        if(e.cancelable)e.preventDefault();

      }



      function endDrag(e){

        if(!dragging)return;

        dragging=false;

        fab.classList.remove('fab-dragging');

        // If barely moved, let click/tap fire normally

        if(!hasMoved){

          // Restore so click fires

          hasMoved=false;

        }

      }



      // Prevent click from firing after a drag

      fab.addEventListener('click',e=>{

        if(hasMoved){e.stopImmediatePropagation();hasMoved=false;}

      },true);



      fab.addEventListener('mousedown',startDrag);

      document.addEventListener('mousemove',onDrag);

      document.addEventListener('mouseup',endDrag);

      fab.addEventListener('touchstart',startDrag,{passive:false});

      document.addEventListener('touchmove',onDrag,{passive:false});

      document.addEventListener('touchend',endDrag);

    });

  });

})();



/* ══════════════════════════════════════════════════════

   DRAGGABLE MOBILE STEPS SHEET

══════════════════════════════════════════════════════ */

(function initDraggableStepsSheet(){

  window.addEventListener('DOMContentLoaded',()=>{

    const overlay=document.getElementById('mob-steps-sheet');

    const sheet=document.getElementById('mob-steps-sheet-inner');

    const handle=document.getElementById('mob-steps-drag-handle');

    if(!overlay||!sheet||!handle)return;

    let startY=0,curY=0,dragging=false;

    function startDrag(e){

      dragging=true;startY=e.touches?e.touches[0].clientY:e.clientY;curY=0;

      sheet.style.transition='none';e.preventDefault();

    }

    function onDrag(e){

      if(!dragging)return;

      const y=(e.touches?e.touches[0].clientY:e.clientY)-startY;

      curY=Math.max(0,y); // only allow dragging down

      sheet.style.transform=`translateY(${curY}px)`;

    }

    function endDrag(){

      if(!dragging)return;dragging=false;

      sheet.style.transition='transform .25s ease';

      if(curY>100){closeMobSteps();}

      else{sheet.style.transform='';}

    }

    handle.addEventListener('touchstart',startDrag,{passive:false});

    document.addEventListener('touchmove',onDrag,{passive:false});

    document.addEventListener('touchend',endDrag);

    handle.addEventListener('mousedown',startDrag);

    document.addEventListener('mousemove',onDrag);

    document.addEventListener('mouseup',endDrag);

  });

})();



/* ══════════════════════════════════════════════════════

   DRAGGABLE MOBILE CHAT PANEL (BOTTOM SHEET)

══════════════════════════════════════════════════════ */

(function initDraggableChatPanel(){

  window.addEventListener('DOMContentLoaded',()=>{

    const panel=document.getElementById('mob-panel-chat');

    const handle=document.getElementById('mob-chat-drag-handle');

    if(!panel||!handle)return;

    let startY=0,curY=0,dragging=false;

    const CLOSE_THRESHOLD=120;

    const SNAP_THRESHOLD=60;

    let baseOffset=0; // current translateY offset when dragging starts (for resizing)



    function getPanelY(){

      const t=panel.style.transform;

      const m=t&&t.match(/translateY\(([^)]+)px\)/);

      return m?parseFloat(m[1]):0;

    }



    function startDrag(e){

      dragging=true;

      startY=e.touches?e.touches[0].clientY:e.clientY;

      baseOffset=getPanelY();

      panel.classList.add('panel-dragging');

      e.preventDefault();

    }

    function onDrag(e){

      if(!dragging)return;

      const y=(e.touches?e.touches[0].clientY:e.clientY)-startY;

      curY=Math.max(-50,baseOffset+y); // allow slight upward pull

      panel.style.transform=`translateY(${curY}px)`;

      if(e.cancelable)e.preventDefault();

    }

    function endDrag(){

      if(!dragging)return;dragging=false;

      panel.classList.remove('panel-dragging');

      panel.style.transition='transform .25s ease';

      if(curY>CLOSE_THRESHOLD){

        // Close the panel

        panel.style.transform='translateY(100%)';

        setTimeout(()=>{panel.classList.remove('open');panel.style.transform='';},280);

      } else {

        // Snap back to fully open

        panel.style.transform='translateY(0)';

      }

    }

    handle.addEventListener('touchstart',startDrag,{passive:false});

    document.addEventListener('touchmove',onDrag,{passive:false});

    document.addEventListener('touchend',endDrag);

    handle.addEventListener('mousedown',startDrag);

    document.addEventListener('mousemove',onDrag);

    document.addEventListener('mouseup',endDrag);

  });

})();

/* ══════════════════════════════════════════════════════
   3D INSTRUMENT SCENE — fixed perspective, hover tilt,
   no drag rotation. CSS handles all 3D via the
   #beaker-3d-wrap animation declared in the stylesheet.
══════════════════════════════════════════════════════ */

(function init3DScene(){

  window.addEventListener('DOMContentLoaded', ()=>{

    const scene = document.getElementById('beaker-scene');

    if(!scene) return;

    /* ── Subtle mouse-follow tilt (±4 deg, no rotation) ── */

    scene.addEventListener('mousemove', e=>{

      const wrap = scene.querySelector('#beaker-3d-wrap');

      if(!wrap) return;

      const r   = scene.getBoundingClientRect();

      const nx  = (e.clientX - r.left)  / r.width  - 0.5;   // -0.5 … +0.5

      const ny  = (e.clientY - r.top)   / r.height - 0.5;

      const tiltX = 6  - ny * 8;   // base 6° + up to ±4°

      const tiltY = -10 + nx * 8;  // base -10° + up to ±4°

      wrap.style.animationPlayState = 'paused';

      wrap.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

    });

    scene.addEventListener('mouseleave', ()=>{

      const wrap = scene.querySelector('#beaker-3d-wrap');

      if(!wrap) return;

      /* resume the CSS bob animation */

      wrap.style.animationPlayState = '';

      wrap.style.transform = '';

    });

    /* ── Toggle running class so bob pauses during reaction ── */

    const origRun = window.runReaction;

    window.runReaction = function(){

      const wrap = scene.querySelector('#beaker-3d-wrap');

      if(wrap) wrap.classList.add('running');

      if(origRun) origRun.apply(this, arguments);

    };

    /* ── Re-apply glow drop shadow when liquid color changes ── */

    const origUpdate = window.updateBeakerLiquid;

    window.updateBeakerLiquid = function(color, fraction){

      if(origUpdate) origUpdate.apply(this, arguments);

      const wrap = scene.querySelector('#beaker-3d-wrap');

      if(!wrap) return;

      try{

        const rgb = color.match(/[\d.]+/g);

        if(rgb && rgb.length >= 3){

          const r=Math.round(rgb[0]), g=Math.round(rgb[1]), b=Math.round(rgb[2]);

          const a = rgb[3] ? Math.min(parseFloat(rgb[3])*1.6, 0.5) : 0.35;

          wrap.style.filter =

            `drop-shadow(0 18px 40px rgba(${r},${g},${b},${a})) `+

            `drop-shadow(0 4px 12px rgba(${r},${g},${b},${Math.min(a*0.6,0.28)}))`;

        }

      }catch(e){}

    };

    /* ── Remove running class after reaction finishes ── */

    const origReset = window.resetBeakerLiquid;

    window.resetBeakerLiquid = function(){

      if(origReset) origReset.apply(this, arguments);

      const wrap = scene.querySelector('#beaker-3d-wrap');

      if(wrap) wrap.classList.remove('running');

    };

  });

})();





window.addEventListener('DOMContentLoaded',()=>{

  setTimeout(initAuth,150);

  setInterval(updateCounterUI,30000);

  setTimeout(updateLandingCounter,500);

});





/* ══════════════════════════════════════════════════════

   PHYSICS LAB ENGINE

══════════════════════════════════════════════════════ */

let physLabInited=false;
let physRunToken=0;

let physState={

  currentExp:'solar_cell',

  running:false,

  score:0,

  lightIntensity:800,  // lux

  distance:30,         // cm

  loadResistance:50,   // ohm

  magneticField:0.5,   // T

  current:50,          // mA

  slitWidth:0.2,       // mm

  wavelength:632,      // nm

  screenDistance:100,  // cm

  graphData:[],

  obsTable:[],

  chatHistory:[]

};



// ── Physics Experiments Definition ──

const PHYS_EXPERIMENTS={

  solar_cell:{

    name:'Solar Cell Characteristics',

    icon:'☀️',

    aim:'To study V-I and P-V characteristics of a solar cell and determine Voc, Isc, maximum power point, fill factor, and efficiency.',

    theory:`A solar cell (photovoltaic cell) converts light energy directly into electrical energy using the photovoltaic effect. When photons strike the p-n junction semiconductor, electron-hole pairs are generated. These carriers separate under the built-in electric field, producing a voltage.



**Key Parameters:**

- **Voc (Open circuit voltage)**: Voltage when no current flows

- **Isc (Short circuit current)**: Current when terminals are shorted

- **Maximum Power Point (Pmax)**: Point on V-I curve where P = V×I is maximum

- **Fill Factor (FF)**: FF = Pmax / (Voc × Isc) — ideal FF = 1

- **Efficiency (η)**: η = Pmax / (Pin × A) × 100%`,

    formulas:`Voc ≈ (nkT/q) × ln(Isc/I0 + 1)

Isc ∝ Light Intensity (Lux)

P = V × I

Fill Factor = Pmax / (Voc × Isc)

Efficiency η = (Pmax / Pin) × 100 %

Pin = Intensity × Cell_Area

I = Isc - I0(e^(qV/nkT) - 1)`,

    params:[

      {id:'lightIntensity',label:'Light Intensity (lux)',min:100,max:1200,step:50,unit:'lux',stateKey:'lightIntensity'},

      {id:'distance',label:'Lamp Distance (cm)',min:10,max:100,step:5,unit:'cm',stateKey:'distance'},

      {id:'loadResistance',label:'Load Resistance (Ω)',min:1,max:500,step:5,unit:'Ω',stateKey:'loadResistance'}

    ],

    measurements:[

      {label:'Voltage (V)',id:'pm-voltage',unit:'V',color:'var(--cyan)'},

      {label:'Current (mA)',id:'pm-current',unit:'mA',color:'var(--emerald)'},

      {label:'Power (mW)',id:'pm-power',unit:'mW',color:'var(--amber)'},

      {label:'Efficiency',id:'pm-efficiency',unit:'%',color:'var(--violet)'}

    ],

    graphXLabel:'Voltage (V)',

    graphYLabel:'Current (mA)',

    hardware:'solar_cell'

  },

  hall_effect:{

    name:'Hall Effect Experiment',

    icon:'🧲',

    aim:'To determine the Hall coefficient, carrier concentration, type of semiconductor, and mobility of charge carriers using the Hall Effect.',

    theory:`When a current-carrying conductor or semiconductor is placed in a perpendicular magnetic field, a voltage (Hall voltage) appears transverse to both the current and magnetic field. This is the Hall Effect.



**Mechanism:**

Charge carriers moving with drift velocity v⃗ experience Lorentz force F = q(v⃗ × B⃗). Carriers accumulate on one side until the electric force balances the magnetic force.



**Significance:**

- Determines carrier type (n-type: negative VH; p-type: positive VH)

- Calculates carrier density and mobility`,

    formulas:`VH = (I × B) / (n × q × d)

RH = VH / (I × B / d) = 1 / (n × q)

n = 1 / (RH × q)

μH = RH × σ = |VH × d| / (ρ × I × B)

where:

  VH = Hall Voltage (V)

  I = Current through sample (A)

  B = Magnetic field (T)

  n = Carrier concentration (m⁻³)

  d = Sample thickness (m)

  RH = Hall Coefficient (m³/C)`,

    params:[

      {id:'magneticField',label:'Magnetic Field (T)',min:0.1,max:2,step:0.1,unit:'T',stateKey:'magneticField'},

      {id:'current',label:'Current (mA)',min:10,max:200,step:10,unit:'mA',stateKey:'current'}

    ],

    measurements:[

      {label:'Hall Voltage (mV)',id:'pm-vh',unit:'mV',color:'var(--cyan)'},

      {label:'Hall Coefficient',id:'pm-rh',unit:'m³/C',color:'var(--violet)'},

      {label:'Carrier Density',id:'pm-n',unit:'×10²⁰/m³',color:'var(--emerald)'},

      {label:'Mobility',id:'pm-mu',unit:'m²/Vs',color:'var(--amber)'}

    ],

    graphXLabel:'Current I (mA)',

    graphYLabel:'Hall Voltage VH (mV)',

    hardware:'hall_effect'

  },

  single_slit:{

    name:'Single Slit Diffraction',

    icon:'🌊',

    aim:'To study the diffraction pattern formed by a single slit and determine slit width, fringe width, and wavelength of laser light.',

    theory:`When coherent light (laser) passes through a narrow slit, it diffracts and forms a characteristic pattern of alternating bright and dark fringes on a screen. This is explained by Huygens' Principle — every point on the wavefront acts as a secondary source.



**Dark fringe condition:** a sin θ = mλ  (m = ±1, ±2, …)

**Central maximum** has the highest intensity and double the width of secondary maxima.

**Intensity distribution:** I(θ) = I₀ (sin α / α)²  where α = (πa sin θ)/λ`,

    formulas:`Condition for dark fringes: a sinθ = mλ

For small angles: sinθ ≈ tanθ = y/D

∴ a × y / D = mλ

Slit width: a = mλD / y

Fringe width β = λD / a

Angular half-width of central max: θ = λ/a

where:

  a = slit width (mm)

  λ = wavelength of laser (nm)

  D = slit-to-screen distance (cm)

  y = distance from centre to dark fringe (mm)

  m = order of minimum`,

    params:[

      {id:'slitWidth',label:'Slit Width (mm)',min:0.05,max:1.0,step:0.05,unit:'mm',stateKey:'slitWidth'},

      {id:'wavelength',label:'Wavelength (nm)',min:400,max:750,step:10,unit:'nm',stateKey:'wavelength'},

      {id:'screenDistance',label:'Screen Distance (cm)',min:30,max:200,step:10,unit:'cm',stateKey:'screenDistance'}

    ],

    measurements:[

      {label:'Fringe Width (mm)',id:'pm-fringe',unit:'mm',color:'var(--cyan)'},

      {label:'Central Max Width (mm)',id:'pm-central',unit:'mm',color:'var(--amber)'},

      {label:'1st Dark Fringe (mm)',id:'pm-dark1',unit:'mm',color:'var(--violet)'},

      {label:'Slit Width Calc (mm)',id:'pm-slit-calc',unit:'mm',color:'var(--emerald)'}

    ],

    graphXLabel:'Screen Position (mm)',

    graphYLabel:'Relative Intensity',

    hardware:'single_slit'

  }

};




/* ═══════════════════════════════════════════════════════════════
   EXTENDED PHYSICS LIBRARY — 25 undergraduate → advanced labs
   Each entry contains apparatus, theory, formulas, viva and AI
   recommendation data. The existing three experiments keep their
   dedicated simulations; the rest use the safe generic measurement
   simulator and realistic apparatus renderer.
═══════════════════════════════════════════════════════════════ */

const PHYS_EXTENDED_EXPERIMENTS={
  vernier_caliper:{
    name:'Vernier Caliper',icon:'📏',
    aim:'To measure the dimensions of an object accurately using a Vernier caliper and determine its least count.',
    theory:'A Vernier caliper measures external diameter, internal diameter and depth using a main scale and a Vernier scale. The Vernier principle lets a small fractional division be read by comparing the two scales.',
    formulas:'Least Count = 1 MSD − 1 VSD\nReading = Main Scale Reading + (Vernier coincidence × Least Count)\nCorrected Reading = Observed Reading − Zero Error',
    apparatus:['Vernier caliper','test object','steel rule'],
    graphXLabel:'Trial',graphYLabel:'Measured Length (mm)',
    params:[
      {id:'vc_length',label:'Object Length (mm)',min:10,max:150,step:1,unit:'mm',stateKey:'vc_length'},
      {id:'vc_trials',label:'Trial Count',min:3,max:10,step:1,unit:'trials',stateKey:'vc_trials'}
    ],
    measurements:[{label:'Mean Length',id:'pm-vc-mean',unit:'mm',color:'var(--cyan)'},{label:'Least Count',id:'pm-vc-lc',unit:'mm',color:'var(--violet)'},{label:'Zero Error',id:'pm-vc-ze',unit:'mm',color:'var(--amber)'}],
    recommendation:'Use a 0.02 mm least-count caliper, check zero error before measurement, and repeat at least five readings at different object orientations.',
    viva:[['What is the least count?','The smallest measurement that an instrument can resolve. For a common metric Vernier, it may be 0.1, 0.05 or 0.02 mm depending on design.'],['Why is zero error checked?','Because a non-zero reading when the jaws are closed introduces a systematic error.'],['What can a Vernier caliper measure?','External dimensions, internal dimensions and depth within its range.'],['Why take repeated readings?','To reduce random error and obtain a more reliable mean.'],['What is the Vernier principle?','A small difference between main-scale and Vernier divisions creates fractional measurement resolution.']]
  },
  screw_gauge:{
    name:'Screw Gauge',icon:'🔩',
    aim:'To measure the diameter of a fine wire or sheet thickness using a micrometer screw gauge.',
    theory:'A screw gauge converts rotational motion of a precision screw into small linear displacement. The pitch and number of head-scale divisions determine the least count.',
    formulas:'Pitch = Distance moved / Number of rotations\nLeast Count = Pitch / Number of circular-scale divisions\nDiameter = Main Scale Reading + Circular Scale Reading × Least Count',
    apparatus:['micrometer screw gauge','fine wire','steel rule'],
    graphXLabel:'Trial',graphYLabel:'Diameter (mm)',
    params:[{id:'sg_diameter',label:'Wire Diameter (mm)',min:.2,max:5,step:.01,unit:'mm',stateKey:'sg_diameter'},{id:'sg_trials',label:'Trial Count',min:3,max:10,step:1,unit:'trials',stateKey:'sg_trials'}],
    measurements:[{label:'Mean Diameter',id:'pm-sg-mean',unit:'mm',color:'var(--cyan)'},{label:'Least Count',id:'pm-sg-lc',unit:'mm',color:'var(--violet)'},{label:'Zero Correction',id:'pm-sg-zc',unit:'mm',color:'var(--amber)'}],
    recommendation:'Use a micrometer with a fine pitch, close the spindle gently with the ratchet, and never over-tighten the wire.',
    viva:[['What is pitch?','The axial distance moved by the screw in one complete rotation.'],['Why is a ratchet used?','It provides approximately constant measuring force and prevents excessive pressure.'],['What is backlash error?','Error caused by play between mating screw threads, usually reduced by approaching the reading from the same direction.'],['Why measure at several points?','A wire may not be perfectly uniform, so multiple positions improve the mean value.'],['What is least count?','Pitch divided by the number of divisions on the circular scale.']]
  },
  simple_pendulum:{
    name:'Simple Pendulum',icon:'⏱️',
    aim:'To determine the acceleration due to gravity g using the time period of a simple pendulum.',
    theory:'For small angular amplitudes, a simple pendulum performs approximately simple harmonic motion. Its period depends on length and gravitational acceleration, not on bob mass.',
    formulas:'T = 2π√(L/g)\nT² = (4π²/g)L\ng = 4π²/slope of T² vs L',
    apparatus:['retort stand','bob','thread','stopwatch','meter scale'],
    graphXLabel:'Length L (m)',graphYLabel:'T² (s²)',
    params:[{id:'pend_length',label:'Pendulum Length (m)',min:.2,max:1.5,step:.05,unit:'m',stateKey:'pend_length'},{id:'pend_cycles',label:'Oscillations Count',min:10,max:30,step:1,unit:'cycles',stateKey:'pend_cycles'}],
    measurements:[{label:'Period T',id:'pm-pend-t',unit:'s',color:'var(--cyan)'},{label:'T²',id:'pm-pend-t2',unit:'s²',color:'var(--violet)'},{label:'g',id:'pm-pend-g',unit:'m/s²',color:'var(--amber)'}],
    recommendation:'Keep amplitude small, measure effective length from the point of suspension to the bob centre, and time many oscillations instead of one.',
    viva:[['Why is amplitude kept small?','The small-angle approximation sinθ≈θ is then valid, giving T=2π√(L/g).'],['Does bob mass affect T?','Ideally no; gravitational acceleration and length determine the period.'],['Why time many oscillations?','It reduces percentage error caused by human reaction time.'],['What is effective length?','Distance from the suspension point to the centre of mass of the bob.'],['How is g obtained graphically?','Plot T² against L; slope equals 4π²/g.']]
  },
  hookes_law:{
    name:"Hooke's Law",icon:'🪀',
    aim:'To verify Hooke’s law and determine the spring constant from load and extension measurements.',
    theory:'Within the elastic limit, extension of a spring is proportional to the applied force. The proportionality constant is the spring constant k.',
    formulas:'F = kx\nk = F/x\nElastic Potential Energy = ½kx²',
    apparatus:['helical spring','retort stand','hanger','slotted weights','meter scale'],
    graphXLabel:'Extension x (cm)',graphYLabel:'Force F (N)',
    params:[{id:'spring_load',label:'Applied Load (N)',min:.2,max:10,step:.1,unit:'N',stateKey:'spring_load'},{id:'spring_k',label:'Spring Constant (N/m)',min:5,max:100,step:1,unit:'N/m',stateKey:'spring_k'}],
    measurements:[{label:'Extension',id:'pm-hooke-x',unit:'cm',color:'var(--cyan)'},{label:'Force',id:'pm-hooke-f',unit:'N',color:'var(--amber)'},{label:'Spring k',id:'pm-hooke-k',unit:'N/m',color:'var(--violet)'}],
    recommendation:'Add masses gradually, read the scale without parallax, and stop before the spring exceeds its elastic limit.',
    viva:[['State Hooke’s law.','Within the elastic limit, stress is proportional to strain; for an ideal spring F=kx.'],['What is spring constant?','Force required per unit extension, measured in N/m.'],['What is elastic limit?','The maximum deformation up to which the material returns to its original form on unloading.'],['Why load gradually?','To avoid dynamic effects and permanent deformation.'],['What does the slope of F-x graph give?','The spring constant k.']]
  },
  young_modulus:{
    name:"Young's Modulus",icon:'📐',
    aim:"To determine Young's modulus of a material using Searle's apparatus.",
    theory:"Young's modulus is the ratio of longitudinal stress to longitudinal strain within the elastic region. Searle's apparatus measures very small extension using a micrometer arrangement.",
    formulas:'Y = Stress/Strain = (F/A)/(ΔL/L)\nY = FL/(AΔL)',
    apparatus:['Searle’s apparatus','two wires','slotted weights','micrometer','meter scale'],
    graphXLabel:'Stress (Pa)',graphYLabel:'Strain',
    params:[{id:'ym_force',label:'Load (N)',min:5,max:100,step:1,unit:'N',stateKey:'ym_force'},{id:'ym_length',label:'Wire Length (m)',min:.5,max:2,step:.05,unit:'m',stateKey:'ym_length'}],
    measurements:[{label:'Extension',id:'pm-ym-ext',unit:'mm',color:'var(--cyan)'},{label:'Stress',id:'pm-ym-stress',unit:'MPa',color:'var(--amber)'},{label:'Young Modulus',id:'pm-ym-y',unit:'GPa',color:'var(--violet)'}],
    recommendation:'Use a reference wire, remove backlash carefully, add load symmetrically, and take loading/unloading readings to check elastic behaviour.',
    viva:[['Define Young’s modulus.','Ratio of longitudinal stress to longitudinal strain within the elastic limit.'],['Why is a reference wire used?','It helps compensate for changes in temperature and support movement.'],['Why use a micrometer?','Wire extension is very small and requires high-resolution measurement.'],['What is the SI unit?','Pascal, or N/m².'],['What affects the extension?','Load, original length, cross-sectional area and material modulus.']]
  },
  specific_heat:{
    name:'Specific Heat Capacity',icon:'🌡️',
    aim:'To determine the specific heat capacity of a material by calorimetry.',
    theory:'Calorimetry applies conservation of energy: heat lost by a hotter body is approximately equal to heat gained by the calorimeter and cooler body in an insulated setup.',
    formulas:'Q = mcΔT\nHeat lost ≈ Heat gained\nc = Q/(mΔT)',
    apparatus:['calorimeter','thermometer','heater','balance','stirrer'],
    graphXLabel:'Temperature (°C)',graphYLabel:'Heat Energy (J)',
    params:[{id:'sh_mass',label:'Sample Mass (g)',min:20,max:300,step:5,unit:'g',stateKey:'sh_mass'},{id:'sh_delta',label:'Temperature Rise (°C)',min:2,max:40,step:1,unit:'°C',stateKey:'sh_delta'}],
    measurements:[{label:'Heat Supplied',id:'pm-sh-q',unit:'J',color:'var(--amber)'},{label:'ΔT',id:'pm-sh-dt',unit:'°C',color:'var(--cyan)'},{label:'Specific Heat',id:'pm-sh-c',unit:'J/kg·K',color:'var(--violet)'}],
    recommendation:'Use good insulation, stir gently for uniform temperature, and record the peak/steady temperature promptly.',
    viva:[['What is specific heat capacity?','Heat required to raise the temperature of unit mass by one kelvin.'],['Why insulate the calorimeter?','To reduce heat exchange with the surroundings.'],['Why stir?','To make the temperature uniform throughout the water/sample.'],['What is calorimetry based on?','Conservation of energy.'],['Main error source?','Heat loss to surroundings and thermometer/reading lag.']]
  },
  friction:{
    name:'Coefficient of Friction',icon:'📦',
    aim:'To determine the coefficient of friction between two surfaces using an inclined plane.',
    theory:'Friction opposes relative motion between surfaces. At limiting friction, the ratio of limiting friction to normal reaction gives the coefficient of friction.',
    formulas:'μ = F_lim/N\nFor an inclined plane at limiting angle θ: μ = tanθ',
    apparatus:['inclined plane','wooden block','pulley','weights','protractor'],
    graphXLabel:'Normal Reaction N (N)',graphYLabel:'Limiting Friction (N)',
    params:[{id:'fr_angle',label:'Inclination Angle (°)',min:5,max:45,step:1,unit:'°',stateKey:'fr_angle'},{id:'fr_mass',label:'Block Mass (kg)',min:.1,max:2,step:.05,unit:'kg',stateKey:'fr_mass'}],
    measurements:[{label:'Normal Force',id:'pm-fr-n',unit:'N',color:'var(--cyan)'},{label:'Limiting Friction',id:'pm-fr-f',unit:'N',color:'var(--amber)'},{label:'Coefficient μ',id:'pm-fr-mu',unit:'',color:'var(--violet)'}],
    recommendation:'Keep surfaces clean and dry, increase the angle slowly, and identify the onset of motion rather than vigorous sliding.',
    viva:[['What is limiting friction?','The maximum static friction just before relative motion begins.'],['What is coefficient of friction?','Ratio of limiting friction to normal reaction.'],['Why μ=tanθ on an inclined plane?','At limiting equilibrium, mg sinθ = μ mg cosθ, hence μ=tanθ.'],['Does μ have a unit?','No, it is a dimensionless ratio.'],['Static vs kinetic friction?','Static friction prevents motion up to a limit; kinetic friction acts during sliding.']]
  },
  ohms_law:{
    name:"Ohm's Law",icon:'🔌',
    aim:'To verify Ohm’s law and determine resistance from voltage-current measurements.',
    theory:'For an ohmic conductor maintained at constant physical conditions, current is directly proportional to potential difference. The ratio V/I is resistance.',
    formulas:'V = IR\nR = V/I\nPower P = VI = I²R = V²/R',
    apparatus:['DC supply','resistor','ammeter','voltmeter','rheostat','switch'],
    graphXLabel:'Current I (A)',graphYLabel:'Voltage V (V)',
    params:[{id:'ohm_v',label:'Applied Voltage (V)',min:1,max:20,step:.5,unit:'V',stateKey:'ohm_v'},{id:'ohm_r',label:'Resistance (Ω)',min:10,max:1000,step:10,unit:'Ω',stateKey:'ohm_r'}],
    measurements:[{label:'Current',id:'pm-ohm-i',unit:'mA',color:'var(--cyan)'},{label:'Resistance',id:'pm-ohm-r',unit:'Ω',color:'var(--violet)'},{label:'Power',id:'pm-ohm-p',unit:'W',color:'var(--amber)'}],
    recommendation:'Use a low-power resistor, avoid excessive current heating, and take several V-I pairs before fitting a straight line.',
    viva:[['State Ohm’s law.','At constant temperature and physical conditions, V is proportional to I.'],['Why is ammeter in series?','It must carry the same current as the circuit element.'],['Why is voltmeter in parallel?','It measures the potential difference across the component.'],['What does V-I slope give?','Resistance when V is plotted against I.'],['When does Ohm’s law fail?','For non-ohmic devices or when temperature/material conditions change significantly.']]
  },
  kirchhoff:{
    name:"Kirchhoff's Laws",icon:'🔀',
    aim:"To verify Kirchhoff's current and voltage laws in a multi-loop DC circuit.",
    theory:'Kirchhoff’s Current Law follows charge conservation at a node; Kirchhoff’s Voltage Law follows energy conservation around a closed loop.',
    formulas:'KCL: ΣI_in = ΣI_out\nKVL: ΣV = 0 around a closed loop',
    apparatus:['DC supply','resistors','ammeters','voltmeters','switches','connecting wires'],
    graphXLabel:'Trial',graphYLabel:'Loop Current (mA)',
    params:[{id:'kir_v',label:'Supply Voltage (V)',min:2,max:24,step:1,unit:'V',stateKey:'kir_v'},{id:'kir_r',label:'Reference Resistance (Ω)',min:10,max:1000,step:10,unit:'Ω',stateKey:'kir_r'}],
    measurements:[{label:'Branch Current',id:'pm-kir-i',unit:'mA',color:'var(--cyan)'},{label:'Loop Voltage',id:'pm-kir-v',unit:'V',color:'var(--amber)'},{label:'KCL/KVL Error',id:'pm-kir-e',unit:'%',color:'var(--violet)'}],
    recommendation:'Label current directions before solving, use a common ground/reference, and compare measured values with the calculated node and loop equations.',
    viva:[['State KCL.','The algebraic sum of currents at a junction is zero; charge is conserved.'],['State KVL.','The algebraic sum of potential changes around a closed loop is zero.'],['What sign convention is used?','Choose current directions and voltage polarities consistently; a negative answer means the assumed direction is opposite.'],['Why are multiple loops useful?','They allow simultaneous equations for unknown branch currents.'],['What causes KCL/KVL error?','Meter loading, resistor tolerance, wire/contact resistance and reading uncertainty.']]
  },
  wheatstone:{
    name:'Wheatstone Bridge',icon:'🌉',
    aim:'To determine an unknown resistance using a balanced Wheatstone bridge.',
    theory:'A Wheatstone bridge compares resistance ratios. At balance, no current flows through the galvanometer and the ratio of the two arms equals the ratio of the other two arms.',
    formulas:'P/Q = R/S at balance\nUnknown S = QR/P',
    apparatus:['Wheatstone bridge','galvanometer','resistance box','battery','key'],
    graphXLabel:'Known Resistance (Ω)',graphYLabel:'Balance Ratio',
    params:[{id:'wb_r',label:'Known Resistance (Ω)',min:10,max:1000,step:10,unit:'Ω',stateKey:'wb_r'},{id:'wb_ratio',label:'Bridge Ratio',min:.1,max:10,step:.1,unit:'',stateKey:'wb_ratio'}],
    measurements:[{label:'Unknown R',id:'pm-wb-r',unit:'Ω',color:'var(--cyan)'},{label:'Balance Ratio',id:'pm-wb-ratio',unit:'',color:'var(--violet)'},{label:'Null Current',id:'pm-wb-null',unit:'μA',color:'var(--amber)'}],
    recommendation:'Choose ratio arms so the balance point is near the middle of the available range for better sensitivity.',
    viva:[['What is bridge balance?','The galvanometer shows zero current because the two junctions are at the same potential.'],['Why is it called a null method?','The measurement is based on a zero indication rather than a magnitude reading.'],['What is the balance condition?','P/Q=R/S.'],['Advantage over direct voltmeter measurement?','It can give high accuracy because the detector is nulled at balance.'],['What is sensitivity?','Ability of the bridge to detect a small resistance change through a noticeable detector response.']]
  },
  meter_bridge:{
    name:'Meter Bridge',icon:'📏',
    aim:'To determine an unknown resistance using the principle of a Wheatstone bridge with a one-metre wire.',
    theory:'A meter bridge is a practical Wheatstone bridge. At balance, resistance ratios equal the corresponding wire-length ratios when the wire is uniform.',
    formulas:'R/S = l/(100−l)\nS = R(100−l)/l',
    apparatus:['meter bridge','jockey','galvanometer','resistance box','battery'],
    graphXLabel:'Balance Length l (cm)',graphYLabel:'Resistance Ratio',
    params:[{id:'mb_r',label:'Known Resistance (Ω)',min:1,max:100,step:1,unit:'Ω',stateKey:'mb_r'},{id:'mb_l',label:'Balance Length (cm)',min:10,max:90,step:1,unit:'cm',stateKey:'mb_l'}],
    measurements:[{label:'Unknown Resistance',id:'pm-mb-s',unit:'Ω',color:'var(--cyan)'},{label:'Balance Length',id:'pm-mb-l',unit:'cm',color:'var(--violet)'},{label:'Percent Error',id:'pm-mb-e',unit:'%',color:'var(--amber)'}],
    recommendation:'Keep the jockey contact light, avoid heating the bridge wire, and aim for a balance point between roughly 30 and 70 cm.',
    viva:[['Principle of meter bridge?','It works on Wheatstone bridge balance using a uniform wire whose resistance is proportional to length.'],['Why avoid pressing the jockey hard?','Hard pressure can damage the wire and change contact conditions.'],['Why seek a middle balance point?','Sensitivity and error distribution are generally better away from the ends.'],['What is end error?','Additional resistance effects near the ends due to connections and non-ideal contacts.'],['How does wire length affect resistance?','For uniform material and area, R is proportional to length.']]
  },
  convex_lens:{
    name:'Convex Lens',icon:'🔍',
    aim:'To determine the focal length of a convex lens by the u-v method.',
    theory:'A convex lens converges parallel rays toward a principal focus. Object and image distances obey the thin-lens equation under paraxial conditions.',
    formulas:'1/f = 1/v − 1/u (Cartesian convention)\nm = v/u\nPower P = 1/f (f in metres)',
    apparatus:['optical bench','convex lens','illuminated object','screen','meter scale'],
    graphXLabel:'1/u (m⁻¹)',graphYLabel:'1/v (m⁻¹)',
    params:[{id:'lens_u',label:'Object Distance (cm)',min:10,max:100,step:1,unit:'cm',stateKey:'lens_u'},{id:'lens_f',label:'Nominal Focal Length (cm)',min:5,max:50,step:1,unit:'cm',stateKey:'lens_f'}],
    measurements:[{label:'Image Distance',id:'pm-lens-v',unit:'cm',color:'var(--cyan)'},{label:'Focal Length',id:'pm-lens-f',unit:'cm',color:'var(--violet)'},{label:'Magnification',id:'pm-lens-m',unit:'×',color:'var(--amber)'}],
    recommendation:'Align object, lens and screen at the same height and use sharp image focus rather than relying on approximate positions.',
    viva:[['What is focal length?','Distance from the optical centre to the principal focus for a thin lens.'],['Why use an optical bench?','It provides a common axis and accurate distance measurement.'],['What is magnification?','Ratio of image size to object size; for a thin lens its magnitude is |v/u|.'],['What is lens power?','Reciprocal of focal length in metres, measured in dioptres.'],['Why use sharp focus?','It minimizes uncertainty in determining the image position.']]
  },
  newtons_rings:{
    name:"Newton's Rings",icon:'⭕',
    aim:"To determine the wavelength of monochromatic light or radius of curvature of a lens using Newton's rings.",
    theory:'Interference between reflected waves from the top and bottom surfaces of a thin air film between a plano-convex lens and glass plate produces concentric bright and dark rings.',
    formulas:'D_m² = 4mλR for dark rings\nλ = (D_{m+p}² − D_m²)/(4pR)',
    apparatus:['plano-convex lens','glass plate','sodium lamp','travelling microscope'],
    graphXLabel:'Ring Order m',graphYLabel:'Diameter² (mm²)',
    params:[{id:'nr_order',label:'Ring Order',min:2,max:20,step:1,unit:'m',stateKey:'nr_order'},{id:'nr_radius',label:'Lens Radius (m)',min:.5,max:10,step:.1,unit:'m',stateKey:'nr_radius'}],
    measurements:[{label:'Ring Diameter',id:'pm-nr-d',unit:'mm',color:'var(--cyan)'},{label:'Wavelength',id:'pm-nr-l',unit:'nm',color:'var(--violet)'},{label:'R² Fit',id:'pm-nr-fit',unit:'',color:'var(--amber)'}],
    recommendation:'Use a clean lens/plate interface, measure diameters across opposite sides to reduce centre-location error, and use several ring orders.',
    viva:[['Why are rings circular?','The air-film thickness depends mainly on radial distance from the point of contact.'],['Why is the centre dark in reflected light?','One reflected ray undergoes a phase reversal, giving destructive interference at near-zero thickness.'],['Why use higher orders?','Larger diameters can reduce percentage error in diameter measurement, though rings become less distinct.'],['What is D_m² proportional to?','Ring order m for a fixed wavelength and radius of curvature.'],['Why monochromatic light?','A single wavelength gives sharp, well-defined interference rings.']]
  },
  diffraction_grating:{
    name:'Diffraction Grating',icon:'🌈',
    aim:'To determine the wavelength of light using a diffraction grating and spectrometer.',
    theory:'A grating contains many equally spaced slits. Constructive interference occurs when the path difference between adjacent slits equals an integer multiple of wavelength.',
    formulas:'d sinθ = nλ\nGrating element d = a+b\nλ = d sinθ/n',
    apparatus:['spectrometer','diffraction grating','collimator','telescope','monochromatic light source'],
    graphXLabel:'Order n',graphYLabel:'sin θ',
    params:[{id:'dg_order',label:'Diffraction Order',min:1,max:3,step:1,unit:'order',stateKey:'dg_order'},{id:'dg_lines',label:'Grating Lines (lines/mm)',min:100,max:1200,step:50,unit:'lines/mm',stateKey:'dg_lines'}],
    measurements:[{label:'Diffraction Angle',id:'pm-dg-theta',unit:'°',color:'var(--cyan)'},{label:'Wavelength',id:'pm-dg-l',unit:'nm',color:'var(--violet)'},{label:'Grating Element',id:'pm-dg-d',unit:'μm',color:'var(--amber)'}],
    recommendation:'Level the spectrometer, focus the telescope and use symmetric left/right readings to reduce zero and alignment errors.',
    viva:[['What is grating element?','The distance between corresponding points of adjacent slits, equal to slit width plus opaque spacing.'],['State grating equation.','d sinθ=nλ for normal incidence.'],['Why higher orders are useful?','They produce larger angular separation, improving wavelength resolution, but may overlap or weaken.'],['What is resolving power?','Ability to distinguish two nearby wavelengths; for an ideal grating R=nN.'],['Why use a collimator?','It produces a parallel beam incident on the grating.']]
  },
  resonance_tube:{
    name:'Resonance Tube',icon:'🎵',
    aim:'To determine the velocity of sound in air using resonance lengths in a closed pipe.',
    theory:'Standing waves form when reflected sound interferes with the incident wave. In a closed pipe, successive resonance lengths differ by approximately half a wavelength.',
    formulas:'L₁ ≈ λ/4\nL₂−L₁ ≈ λ/2\nv = fλ',
    apparatus:['resonance tube','tuning fork','water reservoir','meter scale'],
    graphXLabel:'Resonance Length (m)',graphYLabel:'Mode',
    params:[{id:'rt_freq',label:'Tuning Fork Frequency (Hz)',min:200,max:1000,step:10,unit:'Hz',stateKey:'rt_freq'},{id:'rt_length',label:'Resonance Length (cm)',min:5,max:100,step:1,unit:'cm',stateKey:'rt_length'}],
    measurements:[{label:'Wavelength',id:'pm-rt-l',unit:'m',color:'var(--cyan)'},{label:'Speed of Sound',id:'pm-rt-v',unit:'m/s',color:'var(--violet)'},{label:'End Correction',id:'pm-rt-e',unit:'cm',color:'var(--amber)'}],
    recommendation:'Listen for maximum intensity carefully, use several resonances, and account for end correction when precision is important.',
    viva:[['Why is the tube closed at one end?','A closed pipe supports a displacement node at the closed end and antinode near the open end.'],['Relation between successive resonances?','They are separated by approximately λ/2.'],['Why use a tuning fork?','It provides a nearly single, known frequency.'],['What is end correction?','Effective extension of the air column beyond the physical open end.'],['How is sound speed found?','Measure wavelength and multiply by frequency: v=fλ.']]
  },
  rc_circuit:{
    name:'RC Circuit',icon:'⏱️',
    aim:'To study charging and discharging of a capacitor through a resistor and determine the time constant.',
    theory:'A capacitor charges and discharges exponentially in an RC network. The time constant τ=RC is the time to reach about 63.2% of final charge during charging.',
    formulas:'V_C(t)=V₀(1−e^(−t/RC))\nV_C(t)=V₀e^(−t/RC) during discharge\nτ=RC',
    apparatus:['resistor','capacitor','DC supply','oscilloscope','multimeter','switch'],
    graphXLabel:'Time t (s)',graphYLabel:'Capacitor Voltage (V)',
    params:[{id:'rc_r',label:'Resistance (kΩ)',min:1,max:100,step:1,unit:'kΩ',stateKey:'rc_r'},{id:'rc_c',label:'Capacitance (μF)',min:1,max:100,step:1,unit:'μF',stateKey:'rc_c'}],
    measurements:[{label:'Time Constant',id:'pm-rc-tau',unit:'ms',color:'var(--cyan)'},{label:'Final Voltage',id:'pm-rc-v',unit:'V',color:'var(--violet)'},{label:'63.2% Time',id:'pm-rc-632',unit:'ms',color:'var(--amber)'}],
    recommendation:'Use a capacitor voltage rating comfortably above the supply, start the scope timebase slowly, and compare measured τ with RC.',
    viva:[['What is time constant?','τ=RC; after one τ during charging, capacitor voltage reaches 63.2% of final value.'],['Why exponential?','The charging current falls as capacitor voltage approaches the supply voltage.'],['What happens at t=0?','For an initially uncharged ideal capacitor, it behaves like a short circuit instantaneously.'],['At long time in DC?','The ideal capacitor behaves like an open circuit.'],['How can τ be measured?','From the time at which V reaches 63.2% of final value.']]
  },
  rlc_resonance:{
    name:'RLC Resonance',icon:'〽️',
    aim:'To study resonance in a series RLC circuit and determine resonant frequency, bandwidth and quality factor.',
    theory:'In a series RLC circuit, inductive and capacitive reactances cancel at resonance. The impedance becomes mainly resistive and current is maximum.',
    formulas:'f₀ = 1/(2π√LC)\nBandwidth = f₂−f₁\nQ = f₀/Bandwidth',
    apparatus:['resistor','inductor','capacitor','function generator','oscilloscope'],
    graphXLabel:'Frequency (Hz)',graphYLabel:'Current Amplitude',
    params:[{id:'rlc_l',label:'Inductance (mH)',min:1,max:500,step:1,unit:'mH',stateKey:'rlc_l'},{id:'rlc_c',label:'Capacitance (μF)',min:.001,max:10,step:.001,unit:'μF',stateKey:'rlc_c'}],
    measurements:[{label:'Resonant Frequency',id:'pm-rlc-f',unit:'Hz',color:'var(--cyan)'},{label:'Bandwidth',id:'pm-rlc-bw',unit:'Hz',color:'var(--amber)'},{label:'Q Factor',id:'pm-rlc-q',unit:'',color:'var(--violet)'}],
    recommendation:'Use a sufficiently small frequency step near resonance and keep the source amplitude constant while sweeping frequency.',
    viva:[['What is resonance?','Condition where inductive and capacitive reactances are equal in magnitude and opposite in sign.'],['What is resonant frequency?','f₀=1/(2π√LC) for an ideal series RLC circuit.'],['What is Q factor?','Ratio of resonant frequency to bandwidth; higher Q means sharper resonance.'],['Why does current peak?','At resonance the reactive impedances cancel, minimizing total impedance.'],['What determines bandwidth in a series RLC?','For the ideal series case, approximately R/(2πL).']]
  },
  photoelectric:{
    name:'Photoelectric Effect',icon:'💡',
    aim:'To study the photoelectric effect and estimate Planck’s constant from stopping potential versus frequency.',
    theory:'Photons transfer energy hν to electrons. Emission occurs when photon energy exceeds the work function; maximum kinetic energy is related to stopping potential.',
    formulas:'K_max = hν − φ\n eV_s = hν − φ\nh = e·slope of V_s vs ν',
    apparatus:['photocell','monochromatic source','optical filters','voltage supply','microammeter'],
    graphXLabel:'Frequency ν (Hz)',graphYLabel:'Stopping Potential (V)',
    params:[{id:'pe_freq',label:'Light Frequency (10¹⁴ Hz)',min:4,max:9,step:.1,unit:'×10¹⁴ Hz',stateKey:'pe_freq'},{id:'pe_intensity',label:'Relative Intensity (%)',min:20,max:100,step:5,unit:'%',stateKey:'pe_intensity'}],
    measurements:[{label:'Stopping Potential',id:'pm-pe-vs',unit:'V',color:'var(--cyan)'},{label:'Photo Current',id:'pm-pe-i',unit:'μA',color:'var(--violet)'},{label:'Work Function',id:'pm-pe-phi',unit:'eV',color:'var(--amber)'}],
    recommendation:'Use narrow-band filters, block ambient light, and compare several frequencies rather than relying on one stopping-potential reading.',
    viva:[['What is a photon?','A quantum of electromagnetic radiation with energy E=hν.'],['What is stopping potential?','Reverse potential needed to reduce photocurrent to zero for the fastest emitted electrons.'],['Does intensity change maximum kinetic energy?','Ideally no; frequency determines photon energy, while intensity mainly changes the number of photons.'],['What is threshold frequency?','Minimum frequency required for photoemission from a given surface.'],['Why was the photoelectric effect important?','It supported quantization of electromagnetic energy and the particle nature of light.']]
  },
  em_electron:{
    name:'e/m of Electron',icon:'🌀',
    aim:'To determine the charge-to-mass ratio e/m of the electron using electron-beam deflection in a magnetic field.',
    theory:'Electrons accelerated through a potential acquire kinetic energy. A perpendicular magnetic field bends their path into a circle, allowing e/m to be obtained from the radius and accelerating voltage.',
    formulas:'eV = ½mv²\n evB = mv²/r\ne/m = 2V/(B²r²)',
    apparatus:['electron tube','Helmholtz coils','high-voltage supply','meters','ruler'],
    graphXLabel:'1/B²',graphYLabel:'r²/V',
    params:[{id:'em_v',label:'Accelerating Voltage (V)',min:100,max:500,step:10,unit:'V',stateKey:'em_v'},{id:'em_b',label:'Magnetic Field (mT)',min:1,max:20,step:.5,unit:'mT',stateKey:'em_b'}],
    measurements:[{label:'Beam Radius',id:'pm-em-r',unit:'cm',color:'var(--cyan)'},{label:'e/m',id:'pm-em-em',unit:'C/kg',color:'var(--violet)'},{label:'Field',id:'pm-em-b',unit:'mT',color:'var(--amber)'}],
    recommendation:'Use stable current in Helmholtz coils, avoid parallax when reading beam radius, and compare the result with the accepted electron e/m value.',
    viva:[['Why does the beam curve?','The moving electron experiences magnetic Lorentz force perpendicular to its velocity.'],['Why use Helmholtz coils?','They produce a reasonably uniform magnetic field near the centre.'],['What determines the circular radius?','Electron speed and magnetic field; higher B generally gives a smaller radius.'],['Why accelerate the electrons first?','Known kinetic energy is needed to relate speed to accelerating voltage.'],['What is e/m approximately?','About 1.76×10¹¹ C/kg in magnitude.']]
  },
  michelson:{
    name:'Michelson Interferometer',icon:'〰️',
    aim:'To study interference in a Michelson interferometer and determine wavelength or small displacement.',
    theory:'A beam splitter creates two optical paths that are reflected and recombined. Their path difference produces interference fringes; moving a mirror changes the optical path twice the mirror displacement.',
    formulas:'2d = mλ\nλ = 2Δd/m',
    apparatus:['laser','beam splitter','mirrors','micrometer screw','detector/screen'],
    graphXLabel:'Mirror Displacement (μm)',graphYLabel:'Fringe Count',
    params:[{id:'mi_disp',label:'Mirror Displacement (μm)',min:1,max:200,step:1,unit:'μm',stateKey:'mi_disp'},{id:'mi_fringes',label:'Observed Fringes',min:1,max:500,step:1,unit:'fringes',stateKey:'mi_fringes'}],
    measurements:[{label:'Fringe Count',id:'pm-mi-m',unit:'',color:'var(--cyan)'},{label:'Wavelength',id:'pm-mi-l',unit:'nm',color:'var(--violet)'},{label:'Path Change',id:'pm-mi-d',unit:'μm',color:'var(--amber)'}],
    recommendation:'Align optics gently, use a stable laser, and count many fringes so the displacement uncertainty becomes a smaller fraction of the total.',
    viva:[['Why does mirror displacement double optically?','The beam travels to the mirror and back, so physical displacement d changes optical path by 2d.'],['What creates fringes?','Superposition of the two recombined beams with a changing phase difference.'],['Why use a laser?','Its coherence and narrow bandwidth produce stable, visible fringes.'],['What is fringe visibility?','Contrast between bright and dark fringes; it depends on coherence and beam balance.'],['What can Michelson interferometry measure?','Wavelength, small displacement, refractive index changes and related optical quantities.']]
  },
  laser_divergence:{
    name:'Laser Beam Divergence',icon:'🔴',
    aim:'To determine the angular divergence of a laser beam from beam diameter measurements.',
    theory:'A real laser beam has finite diffraction divergence. For a Gaussian beam, the far-field divergence is related to wavelength and beam waist.',
    formulas:'θ ≈ (D₂−D₁)/(2L)\nFor ideal Gaussian beam θ≈λ/(πw₀)',
    apparatus:['laser','optical bench','beam profiler','screen/detector','meter scale'],
    graphXLabel:'Propagation Distance (m)',graphYLabel:'Beam Radius (mm)',
    params:[{id:'ld_dist',label:'Measurement Distance (m)',min:.5,max:10,step:.1,unit:'m',stateKey:'ld_dist'},{id:'ld_d1',label:'Initial Diameter (mm)',min:.5,max:5,step:.1,unit:'mm',stateKey:'ld_d1'}],
    measurements:[{label:'Final Diameter',id:'pm-ld-d2',unit:'mm',color:'var(--cyan)'},{label:'Divergence',id:'pm-ld-theta',unit:'mrad',color:'var(--violet)'},{label:'Beam Radius',id:'pm-ld-w',unit:'mm',color:'var(--amber)'}],
    recommendation:'Keep the beam path clear, use a profiler or calibrated screen method, and avoid measuring too close to the laser aperture where near-field behaviour dominates.',
    viva:[['What is divergence?','The angular rate at which beam radius increases with propagation distance in the far field.'],['Why does a laser still diverge?','Diffraction prevents a finite beam from remaining perfectly collimated.'],['What is Gaussian beam waist?','The location where the beam radius reaches its minimum value.'],['Why measure at several distances?','A linear fit gives a more robust divergence estimate.'],['What affects divergence?','Wavelength, beam waist and optical mode.']]
  },
  semiconductor_bandgap:{
    name:'Semiconductor Band Gap',icon:'💠',
    aim:'To estimate the energy band gap of a semiconductor from its temperature-dependent electrical behaviour.',
    theory:'Semiconductor conductivity increases with temperature because more carriers are thermally excited across the band gap. The temperature dependence can be used to estimate Eg.',
    formulas:'σ ∝ exp(−E_g/(2kT))\nlnσ = constant − E_g/(2kT)\nE_g = −2k × slope of lnσ vs 1/T',
    apparatus:['PN diode/sample','temperature chamber','source meter','thermometer'],
    graphXLabel:'1/T (K⁻¹)',graphYLabel:'ln Conductivity',
    params:[{id:'bg_temp',label:'Temperature (°C)',min:20,max:120,step:1,unit:'°C',stateKey:'bg_temp'},{id:'bg_current',label:'Measured Current (mA)',min:.1,max:50,step:.1,unit:'mA',stateKey:'bg_current'}],
    measurements:[{label:'Conductivity',id:'pm-bg-sigma',unit:'S/m',color:'var(--cyan)'},{label:'Band Gap',id:'pm-bg-eg',unit:'eV',color:'var(--violet)'},{label:'Temperature',id:'pm-bg-t',unit:'°C',color:'var(--amber)'}],
    recommendation:'Allow thermal equilibrium at each temperature, use a small sensing current, and avoid self-heating of the semiconductor sample.',
    viva:[['What is band gap?','Energy separation between the valence-band maximum and conduction-band minimum.'],['Why does conductivity rise with temperature?','Thermal excitation creates more mobile charge carriers.'],['Why plot lnσ vs 1/T?','The exponential relation becomes approximately linear.'],['What is Eg of silicon near room temperature?','Approximately 1.12 eV.'],['Why avoid self-heating?','It changes sample temperature and corrupts the temperature-dependent measurement.']]
  },
  gm_counter:{
    name:'Geiger–Müller Counter',icon:'☢️',
    aim:'To study counting statistics and detector response using a Geiger–Müller tube in a controlled laboratory simulation.',
    theory:'A GM tube detects ionizing radiation through gas amplification. A single initiating ionization can produce a measurable avalanche pulse, allowing counting of events.',
    formulas:'Count rate = N/t\nPoisson uncertainty ≈ √N\nDead-time correction depends on detector model',
    apparatus:['GM tube','counter/scaler','absorber set','shielding','source holder'],
    graphXLabel:'Absorber Thickness (mm)',graphYLabel:'Count Rate (s⁻¹)',
    params:[{id:'gm_time',label:'Counting Time (s)',min:10,max:120,step:5,unit:'s',stateKey:'gm_time'},{id:'gm_abs',label:'Absorber Thickness (mm)',min:0,max:20,step:.5,unit:'mm',stateKey:'gm_abs'}],
    measurements:[{label:'Count Rate',id:'pm-gm-rate',unit:'s⁻¹',color:'var(--cyan)'},{label:'Statistical σ',id:'pm-gm-sigma',unit:'s⁻¹',color:'var(--violet)'},{label:'Dead Time',id:'pm-gm-dead',unit:'μs',color:'var(--amber)'}],
    recommendation:'Use detector shielding and approved sealed-source simulation only; repeat counts for statistical confidence and never bypass institutional radiation controls.',
    viva:[['What is GM tube gas multiplication?','A primary ionization electron triggers a Townsend avalanche producing a large pulse.'],['Why is counting statistical?','Radioactive decay events are random and commonly follow Poisson statistics.'],['What is dead time?','Short interval after a discharge during which the detector cannot record another event.'],['Why use absorbers?','To compare detector response as radiation passes through different material thicknesses.'],['Why repeat measurements?','To estimate random counting uncertainty.']]
  },
  xray_diffraction:{
    name:'X-Ray Diffraction',icon:'✖️',
    aim:'To study crystal diffraction and determine interplanar spacing using Bragg’s law.',
    theory:'Periodic crystal planes scatter X-rays coherently. Constructive interference occurs when the path difference between reflections from adjacent planes is an integer multiple of wavelength.',
    formulas:'2d sinθ = nλ\nBragg angle = θ\nInterplanar spacing d = nλ/(2sinθ)',
    apparatus:['X-ray source','crystal/sample','goniometer','detector','computer/data system'],
    graphXLabel:'2θ (°)',graphYLabel:'Intensity',
    params:[{id:'xr_theta',label:'Bragg Angle (°)',min:5,max:80,step:.1,unit:'°',stateKey:'xr_theta'},{id:'xr_order',label:'Diffraction Order',min:1,max:3,step:1,unit:'n',stateKey:'xr_order'}],
    measurements:[{label:'2θ Position',id:'pm-xr-2theta',unit:'°',color:'var(--cyan)'},{label:'d-spacing',id:'pm-xr-d',unit:'Å',color:'var(--violet)'},{label:'Relative Intensity',id:'pm-xr-i',unit:'a.u.',color:'var(--amber)'}],
    recommendation:'Use the instrument’s interlocks and approved samples, calibrate the goniometer, and identify peaks from multiple reflections rather than one point.',
    viva:[['State Bragg’s law.','2d sinθ=nλ.'],['Why is θ half of 2θ?','The detector scans through 2θ while θ is the angle between incident beam and lattice planes.'],['What does d represent?','Spacing between a family of crystal planes.'],['Why use characteristic X-rays?','A narrow wavelength makes peak positions directly related to lattice spacing.'],['What can XRD reveal?','Crystal structure, phase identity, lattice parameters and crystallite information.']]
  }
};

Object.assign(PHYS_EXPERIMENTS,PHYS_EXTENDED_EXPERIMENTS);

function physicsExtendedSteps(exp){
  return [
    {title:'Identify and prepare instruments',desc:`Review the apparatus: ${(exp.apparatus||[]).join(', ')}. Check zero/calibration and ensure the virtual setup is aligned.`},
    {title:'Set the experimental parameters',desc:'Choose the values on the Controls panel. Keep one variable controlled while changing the measured variable.'},
    {title:'Take repeated observations',desc:'Click Run Experiment to simulate a complete measurement sequence. Record multiple readings and compare the trend with theory.'},
    {title:'Plot and analyse',desc:`Use the live graph (${exp.graphYLabel} vs ${exp.graphXLabel}) to identify the expected relationship and estimate the required constant.`},
    {title:'Interpret the result',desc:'Compare the measured value with the theoretical expectation, then review errors, viva questions and the AI recommendation.'}
  ];
}

function genericPhysicsHardware(key){
  const exp=PHYS_EXPERIMENTS[key]||{};
  const a=exp.apparatus||['precision instrument','sample','measuring scale'];
  const safeId=('g-'+String(key).replace(/[^a-z0-9]/gi,'')).slice(0,28);
  const labels=a.slice(0,5).map((x,i)=>`<g transform="translate(${45+i*125},${210+(i%2)*35})">
    <rect x="0" y="0" width="112" height="112" rx="14" fill="url(#${safeId}card)" stroke="#6ea7c9" stroke-opacity=".55"/>
    <ellipse cx="56" cy="18" rx="39" ry="10" fill="#d8edf7" fill-opacity=".18"/>
    <rect x="12" y="30" width="88" height="8" rx="4" fill="#dbeafe" fill-opacity=".35"/>
    <rect x="12" y="45" width="${70-(i*7)}" height="20" rx="6" fill="#5b9ac3" fill-opacity=".72"/>
    <circle cx="20" cy="78" r="5" fill="#7dd3fc"/><circle cx="37" cy="78" r="5" fill="#a78bfa"/>
    <text x="56" y="100" text-anchor="middle" fill="#dbeafe" font-size="9" font-family="Arial">${String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').slice(0,18)}</text>
  </g>`).join('');
  return `<svg viewBox="0 0 690 430" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <defs>
      <linearGradient id="${safeId}bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#132844"/><stop offset=".55" stop-color="#0b1c32"/><stop offset="1" stop-color="#18304d"/></linearGradient>
      <linearGradient id="${safeId}card" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#28496b"/><stop offset=".5" stop-color="#17324f"/><stop offset="1" stop-color="#10253d"/></linearGradient>
      <linearGradient id="${safeId}metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1f5f9"/><stop offset=".35" stop-color="#94a3b8"/><stop offset=".7" stop-color="#e2e8f0"/><stop offset="1" stop-color="#475569"/></linearGradient>
      <filter id="${safeId}shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity=".42"/></filter>
    </defs>
    <rect x="8" y="8" width="674" height="414" rx="28" fill="url(#${safeId}bg)" stroke="#5da9d0" stroke-opacity=".35"/>
    <ellipse cx="345" cy="382" rx="270" ry="18" fill="#000" opacity=".35"/>
    <text x="34" y="42" fill="#7dd3fc" font-size="12" font-family="Arial" font-weight="700" letter-spacing="2">${(exp.name||'PHYSICS INSTRUMENT SETUP').toUpperCase().slice(0,42)}</text>
    <g filter="url(#${safeId}shadow)">${labels}</g>
    <g transform="translate(42,105)" filter="url(#${safeId}shadow)">
      <rect x="0" y="0" width="610" height="70" rx="16" fill="#0c1b30" stroke="#55738f"/>
      <rect x="22" y="16" width="260" height="12" rx="6" fill="url(#${safeId}metal)"/>
      <rect x="290" y="15" width="130" height="40" rx="8" fill="#0e2239" stroke="#6ea7c9"/>
      <text x="355" y="40" text-anchor="middle" fill="#67e8f9" font-size="18" font-family="monospace">${(exp.graphYLabel||'READING').slice(0,18)}</text>
      <circle cx="540" cy="35" r="17" fill="#182d47" stroke="#7dd3fc" stroke-width="2"/><circle cx="540" cy="35" r="7" fill="#7dd3fc" class="generic-instrument-shine"/>
    </g>
    <text x="345" y="405" text-anchor="middle" fill="#7c91aa" font-size="10" font-family="Arial">REALISTIC VIRTUAL APPARATUS • 3D-STYLE DEPTH • EDUCATIONAL SIMULATION</text>
  </svg>`;
}

// Canonical Physics catalogue: the 25 syllabus experiments requested by the user.
const PHYS_CORE_ORDER=['vernier_caliper','screw_gauge','simple_pendulum','hookes_law','young_modulus','specific_heat','friction','ohms_law','kirchhoff','wheatstone','meter_bridge','convex_lens','newtons_rings','diffraction_grating','resonance_tube','rc_circuit','rlc_resonance','hall_effect','photoelectric','em_electron','michelson','laser_divergence','semiconductor_bandgap','gm_counter','xray_diffraction'];
const PHYS_DEMO_ORDER=['solar_cell','single_slit'];
const PHYS_RXN_TYPES=[...PHYS_CORE_ORDER,...PHYS_DEMO_ORDER].filter(key=>PHYS_EXPERIMENTS[key]).map(key=>({key,name:PHYS_EXPERIMENTS[key].name,icon:PHYS_EXPERIMENTS[key].icon}));



// ── Physics Instrument SVGs ──

const PHYS_HARDWARE={

  solar_cell:`<svg viewBox="0 0 340 380" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%" id="solar-cell-svg">

    <defs>

      <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#FFFACC" stop-opacity="1"/>

        <stop offset="40%" stop-color="#FFE044" stop-opacity=".9"/>

        <stop offset="100%" stop-color="#FF9900" stop-opacity="0"/>

      </radialGradient>

      <radialGradient id="lampHalo" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#FFE044" stop-opacity=".6"/>

        <stop offset="100%" stop-color="#FF9900" stop-opacity="0"/>

      </radialGradient>

      <linearGradient id="tableGrad2" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#1a2540"/><stop offset="100%" stop-color="#0d1628"/>

      </linearGradient>

      <linearGradient id="solarPanel" x1="0" y1="0" x2="1" y2="1">

        <stop offset="0%" stop-color="#1a3a6e"/>

        <stop offset="50%" stop-color="#0d2850"/>

        <stop offset="100%" stop-color="#1a3560"/>

      </linearGradient>

      <linearGradient id="pLayerGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#2a4a80"/>

        <stop offset="100%" stop-color="#1a3060"/>

      </linearGradient>

      <linearGradient id="nLayerGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#0d1e3a"/>

        <stop offset="100%" stop-color="#0a1830"/>

      </linearGradient>

      <linearGradient id="meterBodyGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#1e2e45"/><stop offset="100%" stop-color="#131e2e"/>

      </linearGradient>

      <filter id="lampFilter"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <filter id="weakGlow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <filter id="jGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <!-- Photon gradient -->

      <radialGradient id="photonGrad" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#FFE800"/><stop offset="100%" stop-color="#FFAA00" stop-opacity="0"/>

      </radialGradient>

      <!-- Electron gradient -->

      <radialGradient id="eGrad" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#44EEFF"/><stop offset="100%" stop-color="#00AAFF" stop-opacity="0"/>

      </radialGradient>

      <!-- Hole gradient -->

      <radialGradient id="hGrad2" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#FF6666"/><stop offset="100%" stop-color="#FF2222" stop-opacity="0"/>

      </radialGradient>

    </defs>



    <!-- Lab table -->

    <rect x="10" y="310" width="320" height="65" rx="4" fill="url(#tableGrad2)" stroke="#243560" stroke-width="1.5"/>

    <rect x="10" y="306" width="320" height="8" rx="2" fill="#243560"/>

    <!-- Optical bench -->

    <rect x="30" y="296" width="280" height="10" rx="4" fill="#1a2e50" stroke="#2a4070" stroke-width="1"/>



    <!-- LAMP BASE AND STAND -->

    <rect x="44" y="226" width="8" height="76" rx="2" fill="#243560"/>

    <rect x="34" y="218" width="28" height="14" rx="4" fill="#1e3055" stroke="#2a4270" stroke-width="1"/>



    <!-- Lamp housing (halogen) -->

    <ellipse cx="48" cy="200" rx="28" ry="22" fill="#2a3a60" stroke="#3a4e80" stroke-width="1.5"/>

    <ellipse cx="48" cy="200" rx="20" ry="16" fill="#1a2a50"/>



    <!-- Lamp halo glow (pulsing) -->

    <ellipse cx="48" cy="200" rx="36" ry="28" fill="url(#lampHalo)" opacity=".5">

      <animate attributeName="opacity" values=".3;.7;.3" dur="1.4s" repeatCount="indefinite"/>

      <animate attributeName="rx" values="34;40;34" dur="1.4s" repeatCount="indefinite"/>

      <animate attributeName="ry" values="26;32;26" dur="1.4s" repeatCount="indefinite"/>

    </ellipse>



    <!-- Lamp bulb (animated glow) -->

    <circle cx="48" cy="200" r="11" fill="url(#lampGlow)" filter="url(#lampFilter)">

      <animate attributeName="opacity" values=".85;1;.85" dur=".9s" repeatCount="indefinite"/>

    </circle>

    <circle cx="48" cy="200" r="6" fill="#FFFACC" opacity=".9">

      <animate attributeName="opacity" values=".8;1;.8" dur=".9s" repeatCount="indefinite"/>

    </circle>



    <!-- Sun-ray lines rotating slowly around lamp -->

    <g transform-origin="48 200">

      <line x1="48" y1="168" x2="48" y2="162" stroke="#FFE044" stroke-width="1.5" opacity=".6"/>

      <line x1="69" y1="179" x2="73" y2="175" stroke="#FFE044" stroke-width="1.5" opacity=".6"/>

      <line x1="27" y1="179" x2="23" y2="175" stroke="#FFE044" stroke-width="1.5" opacity=".6"/>

      <line x1="27" y1="221" x2="23" y2="225" stroke="#FFE044" stroke-width="1.5" opacity=".4"/>

      <line x1="69" y1="221" x2="73" y2="225" stroke="#FFE044" stroke-width="1.5" opacity=".4"/>

      <animateTransform attributeName="transform" type="rotate" from="0 48 200" to="360 48 200" dur="8s" repeatCount="indefinite"/>

    </g>



    <!-- Photon RAYS from lamp to solar cell (animated dashes) -->

    <!-- Ray 1 - straight center -->

    <line x1="76" y1="200" x2="172" y2="220" stroke="#FFE066" stroke-width="2" stroke-dasharray="8 5" opacity=".9">

      <animate attributeName="stroke-dashoffset" values="0;-26" dur=".6s" repeatCount="indefinite"/>

    </line>

    <!-- Ray 2 - upper -->

    <line x1="72" y1="192" x2="172" y2="208" stroke="#FFE066" stroke-width="1.5" stroke-dasharray="7 5" opacity=".7">

      <animate attributeName="stroke-dashoffset" values="0;-24" dur=".6s" begin=".15s" repeatCount="indefinite"/>

    </line>

    <!-- Ray 3 - lower -->

    <line x1="72" y1="208" x2="172" y2="232" stroke="#FFE066" stroke-width="1.5" stroke-dasharray="7 5" opacity=".7">

      <animate attributeName="stroke-dashoffset" values="0;-24" dur=".6s" begin=".3s" repeatCount="indefinite"/>

    </line>

    <!-- Ray 4 - upper far -->

    <line x1="68" y1="185" x2="172" y2="200" stroke="#FFE066" stroke-width="1" stroke-dasharray="6 5" opacity=".45">

      <animate attributeName="stroke-dashoffset" values="0;-22" dur=".6s" begin=".45s" repeatCount="indefinite"/>

    </line>



    <!-- Animated photon packets (yellow circles) -->

    <circle cx="76" cy="200" r="3" fill="url(#photonGrad)">

      <animateMotion path="M0,0 L96,20" dur="1.2s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.9;1" dur="1.2s" repeatCount="indefinite"/>

    </circle>

    <circle cx="76" cy="200" r="3" fill="url(#photonGrad)">

      <animateMotion path="M0,0 L96,20" dur="1.2s" begin=".4s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.9;1" dur="1.2s" begin=".4s" repeatCount="indefinite"/>

    </circle>

    <circle cx="76" cy="200" r="3" fill="url(#photonGrad)">

      <animateMotion path="M0,0 L96,20" dur="1.2s" begin=".8s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.9;1" dur="1.2s" begin=".8s" repeatCount="indefinite"/>

    </circle>



    <!-- SOLAR CELL PANEL — Encapsulation glass -->

    <rect x="172" y="195" width="88" height="118" rx="4" fill="#a0b4d0" stroke="#c0d0e8" stroke-width="2" opacity=".25"/>

    <!-- p-type layer (top, blue-ish) -->

    <rect x="174" y="197" width="84" height="55" rx="2" fill="url(#pLayerGrad)" stroke="#2a50a0" stroke-width="1"/>

    <!-- n-type layer (bottom, dark) -->

    <rect x="174" y="252" width="84" height="58" rx="2" fill="url(#nLayerGrad)" stroke="#1a3070" stroke-width="1"/>

    <!-- p-n junction line (glowing) -->

    <line x1="174" y1="252" x2="258" y2="252" stroke="#00AAFF" stroke-width="2" filter="url(#jGlow)">

      <animate attributeName="opacity" values=".4;1;.4" dur="1.5s" repeatCount="indefinite"/>

    </line>

    <!-- Built-in field arrows at junction -->

    <text x="216" y="258" fill="rgba(0,200,255,.5)" font-size="6" font-family="monospace" text-anchor="middle">← E_built-in →</text>



    <!-- Layer labels -->

    <text x="216" y="216" fill="rgba(150,200,255,.55)" font-size="7" font-family="sans-serif" text-anchor="middle">p-type (Si)</text>

    <text x="216" y="276" fill="rgba(100,160,220,.45)" font-size="7" font-family="sans-serif" text-anchor="middle">n-type (Si)</text>



    <!-- Solar cell metal grid fingers on top surface -->

    <line x1="192" y1="197" x2="192" y2="252" stroke="#C0C8D0" stroke-width="1" opacity=".6"/>

    <line x1="210" y1="197" x2="210" y2="252" stroke="#C0C8D0" stroke-width=".8" opacity=".5"/>

    <line x1="228" y1="197" x2="228" y2="252" stroke="#C0C8D0" stroke-width=".8" opacity=".5"/>

    <line x1="246" y1="197" x2="246" y2="252" stroke="#C0C8D0" stroke-width="1" opacity=".6"/>

    <line x1="174" y1="215" x2="258" y2="215" stroke="#C0C8D0" stroke-width=".7" opacity=".4"/>

    <line x1="174" y1="233" x2="258" y2="233" stroke="#C0C8D0" stroke-width=".7" opacity=".4"/>



    <!-- ELECTRONS (blue dots) drifting upward from junction through p-layer to top contact -->

    <circle cx="185" cy="250" r="2.5" fill="url(#eGrad)">

      <animate attributeName="cy" values="250;200;200" keyTimes="0;.85;1" dur="1.8s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" repeatCount="indefinite"/>

    </circle>

    <circle cx="205" cy="250" r="2.5" fill="url(#eGrad)">

      <animate attributeName="cy" values="250;200;200" keyTimes="0;.85;1" dur="1.8s" begin=".45s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" begin=".45s" repeatCount="indefinite"/>

    </circle>

    <circle cx="225" cy="250" r="2.5" fill="url(#eGrad)">

      <animate attributeName="cy" values="250;200;200" keyTimes="0;.85;1" dur="1.8s" begin=".9s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" begin=".9s" repeatCount="indefinite"/>

    </circle>

    <circle cx="245" cy="250" r="2.5" fill="url(#eGrad)">

      <animate attributeName="cy" values="250;200;200" keyTimes="0;.85;1" dur="1.8s" begin="1.35s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" begin="1.35s" repeatCount="indefinite"/>

    </circle>



    <!-- HOLES (red dots) drifting downward from junction through n-layer to bottom contact -->

    <circle cx="190" cy="252" r="2.5" fill="url(#hGrad2)">

      <animate attributeName="cy" values="252;305;305" keyTimes="0;.85;1" dur="1.8s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" repeatCount="indefinite"/>

    </circle>

    <circle cx="215" cy="252" r="2.5" fill="url(#hGrad2)">

      <animate attributeName="cy" values="252;305;305" keyTimes="0;.85;1" dur="1.8s" begin=".45s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" begin=".45s" repeatCount="indefinite"/>

    </circle>

    <circle cx="240" cy="252" r="2.5" fill="url(#hGrad2)">

      <animate attributeName="cy" values="252;305;305" keyTimes="0;.85;1" dur="1.8s" begin=".9s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.9;1" dur="1.8s" begin=".9s" repeatCount="indefinite"/>

    </circle>



    <!-- Photon hit burst on cell surface -->

    <circle cx="200" cy="200" r="0" fill="none" stroke="#FFE044" stroke-width="1.5">

      <animate attributeName="r" values="0;10;10" keyTimes="0;.7;1" dur="1.2s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="1;0;0" keyTimes="0;.7;1" dur="1.2s" repeatCount="indefinite"/>

    </circle>

    <circle cx="230" cy="205" r="0" fill="none" stroke="#FFE044" stroke-width="1.2">

      <animate attributeName="r" values="0;8;8" keyTimes="0;.7;1" dur="1.2s" begin=".4s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="1;0;0" keyTimes="0;.7;1" dur="1.2s" begin=".4s" repeatCount="indefinite"/>

    </circle>

    <circle cx="215" cy="210" r="0" fill="none" stroke="#FFE044" stroke-width="1">

      <animate attributeName="r" values="0;6;6" keyTimes="0;.7;1" dur="1.2s" begin=".8s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="1;0;0" keyTimes="0;.7;1" dur="1.2s" begin=".8s" repeatCount="indefinite"/>

    </circle>



    <!-- LUX METER -->

    <rect x="74" y="268" width="46" height="30" rx="5" fill="url(#meterBodyGrad)" stroke="#3a4e80" stroke-width="1.5"/>

    <rect x="77" y="271" width="40" height="16" rx="2" fill="#080f1c"/>

    <text x="97" y="283" fill="#00FF88" font-size="9" font-family="monospace" text-anchor="middle" id="phys-lux-display">800 lx</text>

    <text x="97" y="292" fill="#4e6090" font-size="6" font-family="sans-serif" text-anchor="middle">LUX METER</text>



    <!-- WIRES from solar cell to circuit (animated current flow) -->

    <!-- Top wire (from p-contact leftward to ammeter) -->

    <polyline points="174,220 132,220 132,245" stroke="#E0E0A0" stroke-width="2" fill="none" stroke-dasharray="6 4">

      <animate attributeName="stroke-dashoffset" values="0;-20" dur=".6s" repeatCount="indefinite"/>

    </polyline>

    <!-- Bottom wire (from n-contact leftward to rheostat) -->

    <polyline points="174,285 132,285 132,268" stroke="#E0E0A0" stroke-width="2" fill="none" stroke-dasharray="6 4">

      <animate attributeName="stroke-dashoffset" values="0;20" dur=".6s" repeatCount="indefinite"/>

    </polyline>

    <!-- Right side wire (from p/n contact to voltmeter) -->

    <polyline points="258,250 278,250 278,242" stroke="#E0E040" stroke-width="2" fill="none" stroke-dasharray="6 4">

      <animate attributeName="stroke-dashoffset" values="0;-20" dur=".6s" repeatCount="indefinite"/>

    </polyline>

    <polyline points="258,260 295,260 295,242" stroke="#E04040" stroke-width="2" fill="none" stroke-dasharray="6 4">

      <animate attributeName="stroke-dashoffset" values="0;20" dur=".6s" repeatCount="indefinite"/>

    </polyline>



    <!-- AMMETER -->

    <rect x="108" y="245" width="50" height="38" rx="5" fill="url(#meterBodyGrad)" stroke="#5a70a0" stroke-width="1.5"/>

    <rect x="111" y="248" width="44" height="20" rx="3" fill="#080f1c"/>

    <text x="133" y="262" fill="#FFCC00" font-size="9" font-family="monospace" text-anchor="middle" id="phys-amp-display">0.0 mA</text>

    <text x="133" y="278" fill="#4e6090" font-size="6" font-family="sans-serif" text-anchor="middle">AMMETER</text>



    <!-- RHEOSTAT -->

    <rect x="108" y="265" width="50" height="16" rx="3" fill="#1a2535" stroke="#3a5080" stroke-width="1"/>

    <path d="M112 273 L116 269 L122 277 L128 269 L134 277 L140 269 L146 277 L152 269 L156 273" stroke="#8090A0" stroke-width="1.2" fill="none"/>

    <text x="133" y="289" fill="#4e6090" font-size="6" font-family="sans-serif" text-anchor="middle">RHEOSTAT</text>



    <!-- VOLTMETER -->

    <rect x="264" y="215" width="58" height="40" rx="5" fill="url(#meterBodyGrad)" stroke="#5a70a0" stroke-width="1.5"/>

    <rect x="267" y="218" width="52" height="22" rx="3" fill="#080f1c"/>

    <text x="293" y="233" fill="#00FFCC" font-size="9" font-family="monospace" text-anchor="middle" id="phys-volt-display">0.00 V</text>

    <text x="293" y="249" fill="#4e6090" font-size="6" font-family="sans-serif" text-anchor="middle">VOLTMETER</text>



    <!-- Temperature sensor -->

    <rect x="233" y="193" width="22" height="9" rx="2" fill="#1a2535" stroke="#3a5080" stroke-width=".8"/>

    <text x="244" y="200" fill="#FF8844" font-size="5" font-family="monospace" text-anchor="middle">25°C</text>



    <!-- Labels -->

    <text x="48" y="238" fill="rgba(180,200,240,.45)" font-size="7" font-family="sans-serif" text-anchor="middle">HALOGEN LAMP</text>

    <text x="216" y="193" fill="rgba(180,200,240,.45)" font-size="7" font-family="sans-serif" text-anchor="middle">SOLAR CELL (Silicon)</text>



    <!-- Electron flow legend -->

    <circle cx="30" cy="350" r="4" fill="url(#eGrad)"/>

    <text x="38" y="354" fill="rgba(70,200,255,.7)" font-size="7" font-family="monospace">e⁻ electrons</text>

    <circle cx="30" cy="365" r="4" fill="url(#hGrad2)"/>

    <text x="38" y="369" fill="rgba(255,100,100,.7)" font-size="7" font-family="monospace">h⁺ holes</text>

    <circle cx="30" cy="335" r="4" fill="url(#photonGrad)"/>

    <text x="38" y="339" fill="rgba(255,220,50,.7)" font-size="7" font-family="monospace">photons</text>

  </svg>`,



  hall_effect:`<svg viewBox="0 0 340 380" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">

    <defs>

      <linearGradient id="hBgGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#1a2540"/><stop offset="100%" stop-color="#0d1628"/>

      </linearGradient>

      <linearGradient id="magnetN" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#990000"/><stop offset="100%" stop-color="#CC1818"/>

      </linearGradient>

      <linearGradient id="magnetS" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#0020A0"/><stop offset="100%" stop-color="#1030CC"/>

      </linearGradient>

      <linearGradient id="sampleGrad" x1="0" y1="0" x2="1" y2="0">

        <stop offset="0%" stop-color="#2a4a28"/><stop offset="100%" stop-color="#3a6035"/>

      </linearGradient>

      <linearGradient id="meterBoxGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#1e2e45"/><stop offset="100%" stop-color="#131e2e"/>

      </linearGradient>

      <!-- Electron gradient for Hall -->

      <radialGradient id="heGrad" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#44EEFF"/><stop offset="100%" stop-color="#0088FF" stop-opacity="0"/>

      </radialGradient>

      <!-- Deflected electron gradient -->

      <radialGradient id="heDeflGrad" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#66FFCC"/><stop offset="100%" stop-color="#00FFAA" stop-opacity="0"/>

      </radialGradient>

      <!-- Magnetic field line gradient -->

      <linearGradient id="bFieldGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#AA44FF" stop-opacity=".2"/>

        <stop offset="50%" stop-color="#AA44FF" stop-opacity=".9"/>

        <stop offset="100%" stop-color="#AA44FF" stop-opacity=".2"/>

      </linearGradient>

      <filter id="hglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <filter id="hallVHglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

    </defs>



    <!-- Background -->

    <rect x="0" y="0" width="340" height="380" fill="#070c17" rx="8"/>



    <!-- Lab table -->

    <rect x="10" y="320" width="320" height="56" rx="4" fill="url(#hBgGrad)" stroke="#243560" stroke-width="1.5"/>

    <rect x="10" y="316" width="320" height="8" rx="2" fill="#243560"/>



    <!-- ELECTROMAGNET — North pole (top, red) -->

    <rect x="118" y="120" width="90" height="58" rx="8" fill="url(#magnetN)" stroke="#991010" stroke-width="2"/>

    <!-- Coil windings on N pole -->

    <line x1="128" y1="130" x2="128" y2="148" stroke="#880000" stroke-width="2" opacity=".6"/>

    <line x1="136" y1="130" x2="136" y2="148" stroke="#AA0000" stroke-width="2" opacity=".5"/>

    <line x1="144" y1="130" x2="144" y2="148" stroke="#880000" stroke-width="2" opacity=".6"/>

    <line x1="152" y1="130" x2="152" y2="148" stroke="#AA0000" stroke-width="2" opacity=".5"/>

    <line x1="160" y1="130" x2="160" y2="148" stroke="#880000" stroke-width="2" opacity=".6"/>

    <line x1="168" y1="130" x2="168" y2="148" stroke="#AA0000" stroke-width="2" opacity=".5"/>

    <line x1="176" y1="130" x2="176" y2="148" stroke="#880000" stroke-width="2" opacity=".6"/>

    <line x1="184" y1="130" x2="184" y2="148" stroke="#AA0000" stroke-width="2" opacity=".5"/>

    <line x1="192" y1="130" x2="192" y2="148" stroke="#880000" stroke-width="2" opacity=".6"/>

    <text x="163" y="165" fill="white" font-size="16" font-family="serif" font-weight="bold" text-anchor="middle">N</text>

    <!-- N pole glow -->

    <ellipse cx="163" cy="178" rx="40" ry="8" fill="#FF2222" opacity=".1">

      <animate attributeName="opacity" values=".05;.2;.05" dur="1.5s" repeatCount="indefinite"/>

    </ellipse>



    <!-- ELECTROMAGNET — South pole (bottom, blue) -->

    <rect x="118" y="272" width="90" height="58" rx="8" fill="url(#magnetS)" stroke="#102090" stroke-width="2"/>

    <!-- Coil windings on S pole -->

    <line x1="128" y1="282" x2="128" y2="300" stroke="#001880" stroke-width="2" opacity=".6"/>

    <line x1="136" y1="282" x2="136" y2="300" stroke="#0020A0" stroke-width="2" opacity=".5"/>

    <line x1="144" y1="282" x2="144" y2="300" stroke="#001880" stroke-width="2" opacity=".6"/>

    <line x1="152" y1="282" x2="152" y2="300" stroke="#0020A0" stroke-width="2" opacity=".5"/>

    <line x1="160" y1="282" x2="160" y2="300" stroke="#001880" stroke-width="2" opacity=".6"/>

    <line x1="168" y1="282" x2="168" y2="300" stroke="#0020A0" stroke-width="2" opacity=".5"/>

    <line x1="176" y1="282" x2="176" y2="300" stroke="#001880" stroke-width="2" opacity=".6"/>

    <line x1="184" y1="282" x2="184" y2="300" stroke="#0020A0" stroke-width="2" opacity=".5"/>

    <line x1="192" y1="282" x2="192" y2="300" stroke="#001880" stroke-width="2" opacity=".6"/>

    <text x="163" y="262" fill="white" font-size="16" font-family="serif" font-weight="bold" text-anchor="middle">S</text>

    <!-- S pole glow -->

    <ellipse cx="163" cy="272" rx="40" ry="8" fill="#2244FF" opacity=".1">

      <animate attributeName="opacity" values=".05;.2;.05" dur="1.5s" begin=".75s" repeatCount="indefinite"/>

    </ellipse>



    <!-- MAGNETIC FIELD LINES in gap (downward N→S, animated) -->

    <line x1="132" y1="178" x2="132" y2="272" stroke="#AA44FF" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7">

      <animate attributeName="stroke-dashoffset" values="0;16" dur=".7s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".5;.9;.5" dur="1.4s" repeatCount="indefinite"/>

    </line>

    <line x1="148" y1="178" x2="148" y2="272" stroke="#AA44FF" stroke-width="1.8" stroke-dasharray="4 4" opacity=".9">

      <animate attributeName="stroke-dashoffset" values="0;16" dur=".7s" begin=".17s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".7;1;.7" dur="1.4s" begin=".17s" repeatCount="indefinite"/>

    </line>

    <line x1="163" y1="178" x2="163" y2="272" stroke="#AA44FF" stroke-width="2" stroke-dasharray="4 4" opacity="1">

      <animate attributeName="stroke-dashoffset" values="0;16" dur=".7s" begin=".34s" repeatCount="indefinite"/>

    </line>

    <line x1="178" y1="178" x2="178" y2="272" stroke="#AA44FF" stroke-width="1.8" stroke-dasharray="4 4" opacity=".9">

      <animate attributeName="stroke-dashoffset" values="0;16" dur=".7s" begin=".51s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".7;1;.7" dur="1.4s" begin=".51s" repeatCount="indefinite"/>

    </line>

    <line x1="194" y1="178" x2="194" y2="272" stroke="#AA44FF" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7">

      <animate attributeName="stroke-dashoffset" values="0;16" dur=".7s" begin=".68s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".5;.9;.5" dur="1.4s" begin=".68s" repeatCount="indefinite"/>

    </line>



    <!-- B field label with animation -->

    <text x="218" y="222" fill="#AA44FF" font-size="10" font-family="monospace" font-weight="bold" filter="url(#hallVHglow)">

      B ↓

      <animate attributeName="opacity" values=".7;1;.7" dur="1.5s" repeatCount="indefinite"/>

    </text>



    <!-- SEMICONDUCTOR SAMPLE (n-Ge) in gap — center of field -->

    <rect x="124" y="222" width="78" height="20" rx="4" fill="url(#sampleGrad)" stroke="#5a8050" stroke-width="2"/>

    <!-- Sample crystal lattice hint -->

    <line x1="140" y1="222" x2="140" y2="242" stroke="#4a7040" stroke-width=".7" opacity=".5"/>

    <line x1="156" y1="222" x2="156" y2="242" stroke="#4a7040" stroke-width=".7" opacity=".5"/>

    <line x1="172" y1="222" x2="172" y2="242" stroke="#4a7040" stroke-width=".7" opacity=".5"/>

    <line x1="188" y1="222" x2="188" y2="242" stroke="#4a7040" stroke-width=".7" opacity=".5"/>

    <line x1="124" y1="230" x2="202" y2="230" stroke="#4a7040" stroke-width=".7" opacity=".5"/>

    <text x="163" y="234" fill="#90FF90" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">n-Ge  (Hall Sample)</text>



    <!-- ELECTRONS streaming through sample — RIGHT to LEFT (conventional current: L→R) -->

    <!-- Initial straight electrons (before Lorentz deflection) -->

    <circle cx="124" cy="232" r="2.5" fill="url(#heGrad)">

      <animate attributeName="cx" values="202;124;124" keyTimes="0;.88;1" dur="1.1s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.9;1" dur="1.1s" repeatCount="indefinite"/>

    </circle>

    <circle cx="124" cy="232" r="2.5" fill="url(#heGrad)">

      <animate attributeName="cx" values="202;124;124" keyTimes="0;.88;1" dur="1.1s" begin=".27s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.9;1" dur="1.1s" begin=".27s" repeatCount="indefinite"/>

    </circle>

    <circle cx="124" cy="232" r="2.5" fill="url(#heGrad)">

      <animate attributeName="cx" values="202;124;124" keyTimes="0;.88;1" dur="1.1s" begin=".54s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.9;1" dur="1.1s" begin=".54s" repeatCount="indefinite"/>

    </circle>

    <circle cx="124" cy="232" r="2.5" fill="url(#heGrad)">

      <animate attributeName="cx" values="202;124;124" keyTimes="0;.88;1" dur="1.1s" begin=".81s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.9;1" dur="1.1s" begin=".81s" repeatCount="indefinite"/>

    </circle>



    <!-- LORENTZ FORCE deflected electrons — curve upward (toward N pole) -->

    <circle cx="200" cy="232" r="2" fill="url(#heDeflGrad)">

      <animateMotion path="M0,0 C-20,-4 -50,-8 -78,-8" dur="1.1s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;.8;.8;0" keyTimes="0;.1;.88;1" dur="1.1s" repeatCount="indefinite"/>

    </circle>

    <circle cx="200" cy="232" r="2" fill="url(#heDeflGrad)">

      <animateMotion path="M0,0 C-20,-4 -50,-8 -78,-8" dur="1.1s" begin=".36s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;.8;.8;0" keyTimes="0;.1;.88;1" dur="1.1s" begin=".36s" repeatCount="indefinite"/>

    </circle>

    <circle cx="200" cy="232" r="2" fill="url(#heDeflGrad)">

      <animateMotion path="M0,0 C-20,-4 -50,-8 -78,-8" dur="1.1s" begin=".72s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;.8;.8;0" keyTimes="0;.1;.88;1" dur="1.1s" begin=".72s" repeatCount="indefinite"/>

    </circle>



    <!-- Electron accumulation on top face (Hall voltage source) -->

    <circle cx="135" cy="223" r="3" fill="url(#heGrad)" opacity=".5">

      <animate attributeName="opacity" values=".2;.7;.2" dur="2s" repeatCount="indefinite"/>

      <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>

    </circle>

    <circle cx="148" cy="222" r="3" fill="url(#heGrad)" opacity=".4">

      <animate attributeName="opacity" values=".15;.6;.15" dur="2s" begin=".5s" repeatCount="indefinite"/>

      <animate attributeName="r" values="2;3.5;2" dur="2s" begin=".5s" repeatCount="indefinite"/>

    </circle>

    <circle cx="163" cy="222" r="3" fill="url(#heGrad)" opacity=".5">

      <animate attributeName="opacity" values=".2;.8;.2" dur="2s" begin="1s" repeatCount="indefinite"/>

      <animate attributeName="r" values="2;4;2" dur="2s" begin="1s" repeatCount="indefinite"/>

    </circle>

    <text x="163" y="220" fill="rgba(70,220,255,.5)" font-size="6" font-family="monospace" text-anchor="middle">e⁻ accumulate → −VH</text>



    <!-- Hall voltage probe lines (transverse) -->

    <line x1="163" y1="222" x2="163" y2="182" stroke="#44BBFF" stroke-width="1.5" stroke-dasharray="3 2">

      <animate attributeName="opacity" values=".5;1;.5" dur="1.8s" repeatCount="indefinite"/>

    </line>

    <line x1="163" y1="242" x2="163" y2="280" stroke="#FF6644" stroke-width="1.5" stroke-dasharray="3 2">

      <animate attributeName="opacity" values=".5;1;.5" dur="1.8s" begin=".9s" repeatCount="indefinite"/>

    </line>

    <circle cx="163" cy="182" r="3" fill="#44BBFF" filter="url(#hallVHglow)">

      <animate attributeName="opacity" values=".6;1;.6" dur="1.8s" repeatCount="indefinite"/>

    </circle>

    <circle cx="163" cy="280" r="3" fill="#FF6644" filter="url(#hallVHglow)">

      <animate attributeName="opacity" values=".6;1;.6" dur="1.8s" begin=".9s" repeatCount="indefinite"/>

    </circle>

    <text x="180" y="186" fill="#44BBFF" font-size="8" font-family="monospace">+VH</text>

    <text x="180" y="284" fill="#FF6644" font-size="8" font-family="monospace">−VH</text>



    <!-- Lorentz force arrow -->

    <text x="116" y="228" fill="rgba(170,80,255,.7)" font-size="6" font-family="monospace" text-anchor="middle">F = qv×B</text>

    <polygon points="116,210 112,220 120,220" fill="rgba(170,80,255,.6)">

      <animate attributeName="opacity" values=".4;.9;.4" dur="1.5s" repeatCount="indefinite"/>

    </polygon>



    <!-- Current flow WIRES with animated dashes -->

    <!-- Left wire (to current source) -->

    <polyline points="124,232 80,232 80,215 60,215" stroke="#FFCC00" stroke-width="2" fill="none" stroke-dasharray="6 4">

      <animate attributeName="stroke-dashoffset" values="0;20" dur=".7s" repeatCount="indefinite"/>

    </polyline>

    <polygon points="124,229 130,232 124,235" fill="#FFCC00"/>

    <!-- Right wire (out) -->

    <polyline points="202,232 248,232 248,215 268,215" stroke="#FFCC00" stroke-width="2" fill="none" stroke-dasharray="6 4">

      <animate attributeName="stroke-dashoffset" values="0;-20" dur=".7s" repeatCount="indefinite"/>

    </polyline>

    <polygon points="198,229 204,232 198,235" fill="#FFCC00" opacity=".5"/>



    <!-- MICRO VOLTMETER (Hall voltage) -->

    <rect x="248" y="170" width="70" height="44" rx="6" fill="url(#meterBoxGrad)" stroke="#5a70a0" stroke-width="1.5"/>

    <rect x="251" y="173" width="64" height="24" rx="3" fill="#070d18"/>

    <text x="283" y="189" fill="#00FFDD" font-size="9" font-family="monospace" text-anchor="middle" id="phys-vh-display">0.00 mV</text>

    <text x="283" y="208" fill="#4e6090" font-size="6" font-family="sans-serif" text-anchor="middle">μVOLTMETER (VH)</text>

    <!-- Wire from VH probe to microvoltmeter -->

    <polyline points="163,182 163,170 248,170 248,182" stroke="#44BBFF" stroke-width="1" stroke-dasharray="3 3" fill="none" opacity=".7"/>

    <polyline points="163,280 163,295 248,295 248,286 283,286 283,214" stroke="#FF6644" stroke-width="1" stroke-dasharray="3 3" fill="none" opacity=".7"/>



    <!-- GAUSS METER -->

    <rect x="248" y="224" width="70" height="40" rx="6" fill="url(#meterBoxGrad)" stroke="#5a70a0" stroke-width="1.5"/>

    <rect x="251" y="227" width="64" height="22" rx="3" fill="#070d18"/>

    <text x="283" y="242" fill="#AA44FF" font-size="9" font-family="monospace" text-anchor="middle" id="phys-gauss-display">0.5 T</text>

    <text x="283" y="258" fill="#4e6090" font-size="6" font-family="sans-serif" text-anchor="middle">GAUSS METER</text>



    <!-- CONSTANT CURRENT SOURCE (left) -->

    <rect x="18" y="192" width="60" height="44" rx="6" fill="url(#meterBoxGrad)" stroke="#5a70a0" stroke-width="1.5"/>

    <rect x="21" y="195" width="54" height="24" rx="3" fill="#070d18"/>

    <text x="48" y="211" fill="#FFCC00" font-size="9" font-family="monospace" text-anchor="middle" id="phys-curr-display">50 mA</text>

    <text x="48" y="230" fill="#4e6090" font-size="5.5" font-family="sans-serif" text-anchor="middle">CONST. CURRENT</text>



    <!-- ELECTROMAGNET power lines (to power supply) -->

    <polyline points="118,150 100,150 100,115 210,115 210,150 208,150" stroke="#EE8822" stroke-width="1.5" stroke-dasharray="4 3" fill="none" opacity=".6">

      <animate attributeName="stroke-dashoffset" values="0;-14" dur=".6s" repeatCount="indefinite"/>

    </polyline>

    <!-- Power supply -->

    <rect x="92" y="104" width="126" height="18" rx="5" fill="#0d1628" stroke="#3a5080" stroke-width="1"/>

    <text x="155" y="116" fill="#FF8822" font-size="7" font-family="monospace" text-anchor="middle">ELECTROMAGNET POWER SUPPLY</text>



    <!-- Labels -->

    <text x="163" y="116" fill="rgba(180,200,240,.45)" font-size="7" font-family="sans-serif" text-anchor="middle"/>

    <text x="163" y="316" fill="rgba(180,200,240,.45)" font-size="7" font-family="sans-serif" text-anchor="middle">ELECTROMAGNET (Ge Hall probe setup)</text>



    <!-- Legend -->

    <circle cx="25" cy="345" r="3.5" fill="url(#heGrad)"/>

    <text x="33" y="349" fill="rgba(70,220,255,.7)" font-size="7" font-family="monospace">e⁻ drift (right→left)</text>

    <circle cx="25" cy="360" r="3.5" fill="url(#heDeflGrad)"/>

    <text x="33" y="364" fill="rgba(100,255,200,.7)" font-size="7" font-family="monospace">Lorentz-deflected e⁻</text>

    <line x1="22" y1="373" x2="30" y2="373" stroke="#AA44FF" stroke-width="2" stroke-dasharray="3 2"/>

    <text x="33" y="376" fill="rgba(180,100,255,.7)" font-size="7" font-family="monospace">B field lines (N→S)</text>

  </svg>`,



  single_slit:`<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">

    <defs>

      <linearGradient id="ssGrad" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stop-color="#08101f"/><stop offset="100%" stop-color="#04080f"/>

      </linearGradient>

      <radialGradient id="laserSrcGrad" cx="70%" cy="50%" r="60%">

        <stop offset="0%" stop-color="#FF4444" stop-opacity="1"/>

        <stop offset="100%" stop-color="#AA0000" stop-opacity=".7"/>

      </radialGradient>

      <radialGradient id="laserExitGlow" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#FF2222" stop-opacity="1"/>

        <stop offset="100%" stop-color="#FF2222" stop-opacity="0"/>

      </radialGradient>

      <filter id="laserGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <filter id="strongGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <filter id="screenFringe"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

      <mask id="slitMask">

        <rect width="360" height="300" fill="white"/>

        <rect x="157" y="148" width="12" height="12" fill="black"/>

      </mask>

      <!-- Photon particle gradient -->

      <radialGradient id="photGrad" cx="50%" cy="50%" r="50%">

        <stop offset="0%" stop-color="#FF6666"/><stop offset="100%" stop-color="#FF0000" stop-opacity="0"/>

      </radialGradient>

    </defs>



    <!-- Dark lab room -->

    <rect x="0" y="0" width="360" height="300" fill="url(#ssGrad)" rx="10"/>



    <!-- Room walls / ceiling suggestion -->

    <line x1="0" y1="20" x2="360" y2="20" stroke="rgba(30,50,90,.4)" stroke-width="1"/>

    <line x1="0" y1="280" x2="360" y2="280" stroke="rgba(30,50,90,.4)" stroke-width="1"/>



    <!-- Optical bench rail (thick steel) -->

    <rect x="18" y="232" width="324" height="10" rx="4" fill="#131e35" stroke="#2a3e60" stroke-width="1.5"/>

    <rect x="18" y="232" width="324" height="3" rx="2" fill="#1e3050" opacity=".8"/>

    <!-- Bench tick marks -->

    <line x1="80" y1="232" x2="80" y2="228" stroke="#2a4070" stroke-width="1"/>

    <line x1="160" y1="232" x2="160" y2="228" stroke="#2a4070" stroke-width="1"/>

    <line x1="240" y1="232" x2="240" y2="228" stroke="#2a4070" stroke-width="1"/>

    <line x1="310" y1="232" x2="310" y2="228" stroke="#2a4070" stroke-width="1"/>



    <!-- LASER UNIT body -->

    <rect x="18" y="192" width="70" height="40" rx="7" fill="#0f1a2e" stroke="#2a4070" stroke-width="2"/>

    <rect x="20" y="194" width="66" height="36" rx="6" fill="#0d1625"/>

    <!-- Laser brand label -->

    <rect x="24" y="200" width="35" height="10" rx="2" fill="#0a1020"/>

    <text x="41" y="208" fill="#FF4444" font-size="5" font-family="monospace" text-anchor="middle" font-weight="bold">He-Ne LASER</text>

    <!-- Power indicator LED -->

    <circle cx="70" cy="198" r="3" fill="#FF2222" filter="url(#laserGlow)">

      <animate attributeName="opacity" values="1;.4;1" dur="1.2s" repeatCount="indefinite"/>

    </circle>

    <!-- Laser aperture -->

    <circle cx="88" cy="212" r="6" fill="#0a0e18" stroke="#3a5080" stroke-width="1.5"/>

    <circle cx="88" cy="212" r="3.5" fill="url(#laserSrcGrad)">

      <animate attributeName="opacity" values=".8;1;.8" dur=".8s" repeatCount="indefinite"/>

    </circle>

    <text x="53" y="243" fill="rgba(150,180,220,.45)" font-size="6" font-family="sans-serif" text-anchor="middle">He-Ne LASER (632 nm)</text>



    <!-- Laser beam — main coherent beam from source to slit -->

    <rect x="94" y="210" width="64" height="4" rx="2" fill="#FF1111" opacity=".85" filter="url(#laserGlow)">

      <animate attributeName="opacity" values=".75;1;.75" dur="1s" repeatCount="indefinite"/>

    </rect>

    <!-- Laser beam inner bright core -->

    <rect x="94" y="211" width="64" height="2" rx="1" fill="#FF8888" opacity=".6"/>



    <!-- Animated photon particles travelling laser to slit -->

    <circle cx="94" cy="212" r="2" fill="url(#photGrad)" class="ss-photon-particle">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="64,0" dur="1.4s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="1.4s" repeatCount="indefinite"/>

    </circle>

    <circle cx="94" cy="212" r="2" fill="url(#photGrad)">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="64,0" dur="1.4s" begin="0.35s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="1.4s" begin="0.35s" repeatCount="indefinite"/>

    </circle>

    <circle cx="94" cy="212" r="2" fill="url(#photGrad)">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="64,0" dur="1.4s" begin="0.7s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="1.4s" begin="0.7s" repeatCount="indefinite"/>

    </circle>

    <circle cx="94" cy="212" r="2" fill="url(#photGrad)">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="64,0" dur="1.4s" begin="1.05s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="1.4s" begin="1.05s" repeatCount="indefinite"/>

    </circle>



    <!-- SINGLE SLIT ASSEMBLY on stand -->

    <rect x="159" y="232" width="8" height="14" rx="2" fill="#1a2848" stroke="#3a5080" stroke-width="1"/>

    <!-- Slit barrier — top half -->

    <rect x="153" y="155" width="18" height="57" rx="2" fill="#1e2e4a" stroke="#4a6090" stroke-width="1.5"/>

    <!-- Slit barrier — bottom half -->

    <rect x="153" y="212" width="18" height="32" rx="2" fill="#1e2e4a" stroke="#4a6090" stroke-width="1.5"/>

    <!-- The slit gap (dark opening) -->

    <rect x="154" y="154" width="16" height="58" rx="1" fill="#08101f"/>

    <rect x="154" y="210" width="16" height="22" rx="1" fill="#08101f"/>

    <!-- Bright slit edge highlight -->

    <line x1="153" y1="154" x2="153" y2="244" stroke="#6080B0" stroke-width=".8" opacity=".7"/>

    <line x1="171" y1="154" x2="171" y2="244" stroke="#6080B0" stroke-width=".8" opacity=".7"/>

    <!-- Micrometer adjuster -->

    <rect x="170" y="178" width="16" height="26" rx="3" fill="#0f1a2e" stroke="#3a5080" stroke-width="1"/>

    <text x="178" y="189" fill="#FF8844" font-size="5" font-family="monospace" text-anchor="middle">μm</text>

    <text x="162" y="252" fill="rgba(150,180,220,.45)" font-size="6" font-family="sans-serif" text-anchor="middle" id="phys-slit-gap">a=0.2mm</text>



    <!-- HUYGENS WAVEFRONTS expanding from slit -->

    <ellipse cx="162" cy="212" rx="0" ry="0" stroke="#FF3333" stroke-width="1.2" fill="none" opacity=".9">

      <animate attributeName="rx" values="0;50;50" keyTimes="0;.9;1" dur="2s" repeatCount="indefinite"/>

      <animate attributeName="ry" values="0;55;55" keyTimes="0;.9;1" dur="2s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".9;0;0" keyTimes="0;.85;1" dur="2s" repeatCount="indefinite"/>

    </ellipse>

    <ellipse cx="162" cy="212" rx="0" ry="0" stroke="#FF3333" stroke-width="1" fill="none" opacity=".7">

      <animate attributeName="rx" values="0;50;50" keyTimes="0;.9;1" dur="2s" begin=".5s" repeatCount="indefinite"/>

      <animate attributeName="ry" values="0;55;55" keyTimes="0;.9;1" dur="2s" begin=".5s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".7;0;0" keyTimes="0;.85;1" dur="2s" begin=".5s" repeatCount="indefinite"/>

    </ellipse>

    <ellipse cx="162" cy="212" rx="0" ry="0" stroke="#FF3333" stroke-width=".8" fill="none">

      <animate attributeName="rx" values="0;50;50" keyTimes="0;.9;1" dur="2s" begin="1s" repeatCount="indefinite"/>

      <animate attributeName="ry" values="0;55;55" keyTimes="0;.9;1" dur="2s" begin="1s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".5;0;0" keyTimes="0;.85;1" dur="2s" begin="1s" repeatCount="indefinite"/>

    </ellipse>

    <ellipse cx="162" cy="212" rx="0" ry="0" stroke="#FF3333" stroke-width=".6" fill="none">

      <animate attributeName="rx" values="0;50;50" keyTimes="0;.9;1" dur="2s" begin="1.5s" repeatCount="indefinite"/>

      <animate attributeName="ry" values="0;55;55" keyTimes="0;.9;1" dur="2s" begin="1.5s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values=".3;0;0" keyTimes="0;.85;1" dur="2s" begin="1.5s" repeatCount="indefinite"/>

    </ellipse>



    <!-- Diffracted beams spreading from slit to screen -->

    <!-- Central beam (strongest) -->

    <line x1="162" y1="212" x2="306" y2="212" stroke="#FF2222" stroke-width="2.5" opacity=".9" filter="url(#laserGlow)">

      <animate attributeName="opacity" values=".8;1;.8" dur="1s" repeatCount="indefinite"/>

    </line>

    <!-- 1st order beams -->

    <line x1="162" y1="212" x2="306" y2="185" stroke="#FF2222" stroke-width="1.6" opacity=".65" filter="url(#laserGlow)"/>

    <line x1="162" y1="212" x2="306" y2="239" stroke="#FF2222" stroke-width="1.6" opacity=".65" filter="url(#laserGlow)"/>

    <!-- 2nd order beams -->

    <line x1="162" y1="212" x2="306" y2="162" stroke="#FF2222" stroke-width="1" opacity=".35"/>

    <line x1="162" y1="212" x2="306" y2="262" stroke="#FF2222" stroke-width="1" opacity=".35"/>

    <!-- 3rd order beams -->

    <line x1="162" y1="212" x2="306" y2="144" stroke="#FF2222" stroke-width=".7" opacity=".15"/>

    <line x1="162" y1="212" x2="306" y2="280" stroke="#FF2222" stroke-width=".7" opacity=".15"/>



    <!-- Animated photon packets flowing through diffracted beams -->

    <!-- Central beam photons -->

    <circle cx="162" cy="212" r="1.5" fill="#FF6666">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="144,0" dur="1.6s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.9;1" dur="1.6s" repeatCount="indefinite"/>

    </circle>

    <circle cx="162" cy="212" r="1.5" fill="#FF6666">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="144,0" dur="1.6s" begin=".8s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.9;1" dur="1.6s" begin=".8s" repeatCount="indefinite"/>

    </circle>

    <!-- 1st order photon packets -->

    <circle cx="162" cy="212" r="1.2" fill="#FF4444" opacity=".6">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="144,-27" dur="2s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;.7;.7;0" keyTimes="0;.08;.9;1" dur="2s" repeatCount="indefinite"/>

    </circle>

    <circle cx="162" cy="212" r="1.2" fill="#FF4444" opacity=".6">

      <animateTransform attributeName="transform" type="translate" from="0,0" to="144,27" dur="2s" begin="1s" repeatCount="indefinite"/>

      <animate attributeName="opacity" values="0;.7;.7;0" keyTimes="0;.08;.9;1" dur="2s" begin="1s" repeatCount="indefinite"/>

    </circle>



    <!-- SCREEN with diffraction pattern -->

    <rect x="304" y="130" width="16" height="140" rx="3" fill="#d0d8e8" stroke="#8090b0" stroke-width="1.5"/>

    <!-- Diffraction pattern intensity bands — sinc² -->

    <!-- Central maximum — very bright -->

    <rect x="304" y="202" width="16" height="20" fill="#FF1111" opacity=".97" filter="url(#screenFringe)">

      <animate attributeName="opacity" values=".9;1;.9" dur="1.5s" repeatCount="indefinite"/>

    </rect>

    <!-- 1st order maxima -->

    <rect x="304" y="182" width="16" height="12" fill="#FF2222" opacity=".52" filter="url(#screenFringe)"/>

    <rect x="304" y="230" width="16" height="12" fill="#FF2222" opacity=".52" filter="url(#screenFringe)"/>

    <!-- 2nd order maxima -->

    <rect x="304" y="163" width="16" height="8" fill="#FF2222" opacity=".25" filter="url(#screenFringe)"/>

    <rect x="304" y="251" width="16" height="8" fill="#FF2222" opacity=".25" filter="url(#screenFringe)"/>

    <!-- 3rd order -->

    <rect x="304" y="148" width="16" height="6" fill="#FF1111" opacity=".10"/>

    <rect x="304" y="268" width="16" height="6" fill="#FF1111" opacity=".10"/>

    <text x="312" y="280" fill="rgba(150,180,220,.5)" font-size="6" font-family="sans-serif" text-anchor="middle">SCREEN</text>



    <!-- Central max glow animation -->

    <rect x="304" y="202" width="16" height="20" fill="#FF3333" opacity="0">

      <animate attributeName="opacity" values="0;.3;0" dur="1.5s" repeatCount="indefinite"/>

    </rect>



    <!-- Measurement arrow y₁ -->

    <line x1="322" y1="212" x2="322" y2="184" stroke="#FFCC00" stroke-width="1.2" stroke-dasharray="2 2"/>

    <polygon points="322,182 319,188 325,188" fill="#FFCC00"/>

    <text x="337" y="200" fill="#FFCC00" font-size="7" font-family="monospace" id="phys-fringe-label">y₁</text>



    <!-- Distance scale bar -->

    <line x1="95" y1="268" x2="305" y2="268" stroke="#4a5a80" stroke-width="1"/>

    <line x1="95" y1="265" x2="95" y2="271" stroke="#4a5a80" stroke-width="1"/>

    <line x1="305" y1="265" x2="305" y2="271" stroke="#4a5a80" stroke-width="1"/>

    <text x="200" y="280" fill="rgba(150,180,220,.55)" font-size="7" font-family="monospace" text-anchor="middle" id="phys-dist-label">D = 100 cm</text>



    <!-- Wavelength annotation -->

    <text x="40" y="268" fill="rgba(255,80,80,.6)" font-size="6" font-family="monospace" text-anchor="middle">λ=632nm</text>



    <!-- Intensity labels on screen -->

    <text x="295" y="215" fill="rgba(255,100,100,.6)" font-size="5" font-family="monospace" text-anchor="end">m=0</text>

    <text x="295" y="190" fill="rgba(255,100,100,.45)" font-size="5" font-family="monospace" text-anchor="end">m=1</text>

    <text x="295" y="240" fill="rgba(255,100,100,.45)" font-size="5" font-family="monospace" text-anchor="end">m=-1</text>

  </svg>`

};



// ── Physics state variables ──

let physChatHistory=[];

let physGraphData=[];

let physObsData=[];



/* ══════════════════════════════════════════════════════
   PHYSICS LAB — MOBILE PANEL CONTROLS
   Slides the real #phys-left / #phys-right panels in and out
   (no cloning), so everything inside stays live and dynamic.
══════════════════════════════════════════════════════ */
function togglePhysPanel(id){
  const panel=document.getElementById(id);
  const overlay=document.getElementById('phys-mobile-overlay');
  if(!panel)return;
  const willOpen=!panel.classList.contains('phys-panel-open');
  closePhysPanels();
  if(willOpen){
    panel.classList.add('phys-panel-open');
    if(overlay)overlay.classList.add('open');
    if(id==='phys-right'){
      const dot=document.getElementById('phys-fab-dot');
      if(dot)dot.classList.remove('show');
    }
  }
}

function closePhysPanels(){
  ['phys-left','phys-right'].forEach(id=>{
    const p=document.getElementById(id);
    if(p)p.classList.remove('phys-panel-open');
  });
  const overlay=document.getElementById('phys-mobile-overlay');
  if(overlay)overlay.classList.remove('open');
}

function openPhysExperimentMenu(){
  const sel=document.getElementById('phys-experiment-select');
  if(!sel)return;
  // On mobile, open the controls drawer and focus the single experiment selector.
  togglePhysPanel('phys-left');
  setTimeout(()=>{try{sel.focus();}catch(e){}},180);
}

function launchPhysicsLab(){

  document.getElementById('landing').style.display='none';

  document.getElementById('particle-canvas').style.display='none';

  document.getElementById('phys-lab-page').classList.add('active');

  if(!physLabInited){initPhysLab();physLabInited=true;}

}



function exitPhysLab(){

  document.getElementById('phys-lab-page').classList.remove('active');

  document.getElementById('landing').style.display='block';

  document.getElementById('particle-canvas').style.display='block';

}



function initPhysLab(){

  // Populate experiment selector

  const sel=document.getElementById('phys-experiment-select');

  if(sel){
    sel.innerHTML='';
    const coreGroup=document.createElement('optgroup');
    coreGroup.label='Physics Experiments (25)';
    PHYS_CORE_ORDER.forEach((key,index)=>{
      const e=PHYS_EXPERIMENTS[key]; if(!e)return;
      const o=document.createElement('option'); o.value=key; o.textContent=`${index+1}. ${e.icon} ${e.name}`; coreGroup.appendChild(o);
    });
    sel.appendChild(coreGroup);
    const demoGroup=document.createElement('optgroup');
    demoGroup.label='Interactive Demonstrations';
    PHYS_DEMO_ORDER.forEach((key,index)=>{
      const e=PHYS_EXPERIMENTS[key]; if(!e)return;
      const o=document.createElement('option'); o.value=key; o.textContent=`Demo ${index+1}. ${e.icon} ${e.name}`; demoGroup.appendChild(o);
    });
    sel.appendChild(demoGroup);
  }

  // Load first experiment

  loadPhysExperiment('solar_cell');
  makePhysicsMobileDraggable();

  // Welcome message

  setTimeout(()=>{

    physAddAIMsg(`### ⚡ Welcome to PhysLab AI!\n\nI'm your AI physics assistant. I'll guide you through the experiment step by step.\n\n**Current Experiment:** Solar Cell Characteristics\n\n**What you'll measure:**\n- V-I characteristic curve\n- P-V characteristic curve\n- Open circuit voltage (Voc)\n- Short circuit current (Isc)\n- Fill Factor and Efficiency\n\nAdjust the sliders below and click **Run Experiment** to start! Ask me anything.`,true);

  },400);

}



function gatePhysicsSvgAnimations(scene){
  if(!scene)return;
  // SVG SMIL can begin while innerHTML is being parsed. Explicitly end every
  // animation first, then put it into an indefinite/paused state.
  scene.querySelectorAll('animate, animateTransform, animateMotion, set').forEach((node)=>{
    try{ node.endElement(); }catch(e){}
    if(!node.dataset.originalBegin) node.dataset.originalBegin=node.getAttribute('begin')||'';
    node.setAttribute('begin','indefinite');
  });
}

function startPhysicsSvgAnimations(phaseClass){
  const scene=document.getElementById('phys-instrument-scene');
  if(!scene || !phaseClass)return;
  const phaseSelectors={
    'phys-phase-lamp':'.sc-lamp-glow',
    'phys-phase-photons':'.sc-photon-ray',
    'phys-phase-pn':'.sc-electron,.sc-hole,.sc-junction-glow',
    'phys-phase-circuit':'.sc-circuit-wire',
    'phys-phase-magnet':'.he-field-line',
    'phys-phase-current':'.he-electron,.he-electron-deflect',
    'phys-phase-hall':'.he-hall-arc,.he-charge-dot,.he-lorentz',
    'phys-phase-laser':'.ss-laser-beam,.ss-photon-particle',
    'phys-phase-slit':'.ss-wavefront'
  };
  // Always stop everything before arming the current phase.
  gatePhysicsSvgAnimations(scene);
  const selector=phaseSelectors[phaseClass];
  if(!selector)return;
  scene.querySelectorAll(selector).forEach(parent=>{
    parent.querySelectorAll('animate, animateTransform, animateMotion, set').forEach(node=>{
      try{ node.beginElement(); }catch(e){}
    });
  });
}

function stopPhysicsCssAnimations(){
  const scene=document.getElementById('phys-instrument-scene');
  if(scene)scene.classList.remove('physics-running','phys-run-active');
}

function stopPhysicsSvgAnimations(){
  const scene=document.getElementById('phys-instrument-scene');
  if(!scene)return;
  scene.querySelectorAll('animate, animateTransform, animateMotion, set').forEach((node)=>{
    try{ node.endElement(); }catch(e){}
  });
  gatePhysicsSvgAnimations(scene);
}

function startPhysicsCssAnimations(){
  const scene=document.getElementById('phys-instrument-scene');
  if(scene)scene.classList.add('physics-running','phys-run-active');
}

function makePhysicsMobileDraggable(){
  const targets=[
    document.getElementById('phys-graph-overlay'),
    document.getElementById('phys-obs-table-widget')
  ].filter(Boolean);
  if(!targets.length)return;
  targets.forEach(el=>{
    if(el.dataset.dragReady==='1')return;
    el.dataset.dragReady='1';
    let dragging=false,startX=0,startY=0,baseX=0,baseY=0;
    const start=(e)=>{
      if(window.innerWidth>900)return;
      if(!e.target.closest('.phys-drag-handle'))return;
      dragging=true;
      const pt=e.touches?e.touches[0]:e;
      startX=pt.clientX;startY=pt.clientY;
      const tr=el.dataset.dragTransform||'0,0';
      [baseX,baseY]=tr.split(',').map(Number);
      el.classList.add('dragging');
      e.preventDefault();
    };
    const move=(e)=>{
      if(!dragging)return;
      const pt=e.touches?e.touches[0]:e;
      const nx=baseX+pt.clientX-startX, ny=baseY+pt.clientY-startY;
      el.dataset.dragTransform=`${nx},${ny}`;
      el.style.transform=`translate3d(${nx}px,${ny}px,0)`;
      if(e.cancelable)e.preventDefault();
    };
    const end=()=>{if(dragging){dragging=false;el.classList.remove('dragging');}};
    el.addEventListener('pointerdown',start);
    window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',end);
    el.addEventListener('touchstart',start,{passive:false});
    window.addEventListener('touchmove',move,{passive:false});
    window.addEventListener('touchend',end);
  });
}


function renderPhysVivaAndRecommendation(exp){
  const vivaBox=document.getElementById('phys-viva-content');
  if(vivaBox){
    const qs=exp?.viva||[];
    vivaBox.innerHTML=qs.length
      ? qs.map((qa,i)=>`<article class="phys-viva-card"><div class="phys-viva-q">Q${i+1}. ${qa[0]}</div><div class="phys-viva-a">${qa[1]}</div></article>`).join('')
      : '<div class="phys-empty-note">Viva questions will appear for this experiment.</div>';
  }
  const rec=document.getElementById('phys-recommend-content');
  if(rec){
    const apparatus=(exp?.apparatus||[]).map(x=>`<span class="phys-apparatus-chip">${x}</span>`).join('');
    rec.innerHTML=`<div class="phys-recommend-card">
      <div class="phys-recommend-title">Best setup for this experiment</div>
      <div class="phys-apparatus-list">${apparatus}</div>
      <p>${exp?.recommendation||'Calibrate the instruments, control one variable at a time, repeat readings and compare the graph with the theoretical relation.'}</p>
      <div class="phys-guide-checks"><span>✓ Calibrate</span><span>✓ Align</span><span>✓ Repeat readings</span><span>✓ Compare theory</span></div>
    </div>`;
  }
}

function loadPhysExperiment(key){

  physRunToken++;
  const exp=PHYS_EXPERIMENTS[key];if(!exp)return;

  physState.currentExp=key;

  physState.running=false;

  physGraphData=[];physObsData=[];

  // Render instrument SVG

  const scene=document.getElementById('phys-instrument-scene');

  if(scene)scene.innerHTML=PHYS_HARDWARE[key]||genericPhysicsHardware(key);
  gatePhysicsSvgAnimations(scene);
  stopPhysicsCssAnimations();

  // Render parameter controls

  renderPhysParams(exp);

  // Render measurements template

  renderPhysMeasurements(exp);

  // Render steps

  renderPhysSteps(exp);

  // Reset UI

  document.getElementById('phys-obs-table').textContent='Run the experiment to record observations.';

  document.getElementById('phys-results-box').innerHTML='';

  document.getElementById('phys-graph-labels').textContent=exp.graphXLabel+' vs '+exp.graphYLabel;

  document.getElementById('phys-run-btn').disabled=false;

  document.getElementById('phys-run-btn').innerHTML='<i class="fas fa-play"></i> Run Experiment';

  // Clear graph canvas

  clearPhysGraph();

  // Theory / formula content

  document.getElementById('phys-theory-content').innerHTML=typeof mdRender==='function'?mdRender(exp.theory):exp.theory.replace(/\n/g,'<br>');

  document.getElementById('phys-formula-content').innerHTML='<pre style="white-space:pre-wrap;font-size:11px;color:var(--violet);line-height:1.9">'+exp.formulas+'</pre>';
  renderPhysVivaAndRecommendation(exp);

  // Update sliders

  renderPhysSliders(exp);

  updatePhysDisplays();

}



function renderPhysParams(exp){

  const ctrl=document.getElementById('phys-param-controls');if(!ctrl)return;

  ctrl.innerHTML=exp.params.map(p=>`

    <div style="display:flex;flex-direction:column;gap:3px">

      <div style="display:flex;justify-content:space-between;align-items:center">

        <span style="font-size:10px;color:var(--text2);font-family:var(--fm)">${p.label}</span>

        <span style="font-size:10px;font-family:var(--fm);color:var(--violet)" id="ppv-${p.id}">${physState[p.stateKey]} ${p.unit}</span>

      </div>

      <input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${physState[p.stateKey]}"

        style="-webkit-appearance:none;width:100%;height:4px;background:linear-gradient(90deg,var(--violet),var(--blue));border-radius:99px;cursor:pointer;outline:none"

        oninput="physParamChange('${p.stateKey}','${p.id}',this.value,'${p.unit}')"/>

    </div>`).join('');

}



function renderPhysSliders(exp){

  const ctrl=document.getElementById('phys-slider-controls');if(!ctrl)return;

  ctrl.innerHTML=exp.params.map(p=>`

    <div class="phys-param-group">

      <span class="phys-param-label">${p.label.split('(')[0].trim()}</span>

      <input class="phys-param-slider" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${physState[p.stateKey]}"

        oninput="physParamChange('${p.stateKey}','${p.id}',this.value,'${p.unit}')"/>

      <span class="phys-param-val" id="pbs-${p.id}">${physState[p.stateKey]} ${p.unit}</span>

    </div>`).join('');

}



function physParamChange(stateKey,id,val,unit){

  physState[stateKey]=parseFloat(val);

  const vEls=document.querySelectorAll('#ppv-'+id+',#pbs-'+id);

  vEls.forEach(el=>{if(el)el.textContent=val+' '+unit;});

  updatePhysDisplays();

  // Parameter changes update displays only. A new animation starts only after the user presses Run Experiment.
  if(physState.running){
    physState.running=false;
    stopPhysicsCssAnimations();
    stopPhysicsSvgAnimations();
    gatePhysicsSvgAnimations(document.getElementById('phys-instrument-scene'));
  }

}



function renderPhysMeasurements(exp){

  const msr=document.getElementById('phys-measurements');if(!msr)return;

  msr.innerHTML=exp.measurements.map(m=>`

    <div class="phys-msr">

      <div class="phys-msr-label">${m.label}</div>

      <div class="phys-msr-val" id="${m.id}" style="color:${m.color}">—</div>

    </div>`).join('');

}



const PHYS_STEPS={

  solar_cell:[

    {title:'Setup instruments',desc:'Mount the solar cell on the optical bench. Connect voltmeter in parallel and ammeter in series with the rheostat.'},

    {title:'Calibrate lux meter',desc:'Place the lux meter at the solar cell position. Record dark reading (background illumination).'},

    {title:'Set light intensity',desc:'Position the halogen lamp at the desired distance. Adjust the lamp power to set the required illumination level (lux).'},

    {title:'Vary load resistance',desc:'Adjust the rheostat from maximum to minimum resistance. Record (V, I) pairs for each setting.'},

    {title:'Plot V-I and P-V curves',desc:'Calculate P = V×I for each point. Plot V-I and P-V characteristic curves. Identify Voc, Isc, and Pmax.'},

    {title:'Calculate Fill Factor & Efficiency',desc:'FF = Pmax/(Voc × Isc). Efficiency η = Pmax/(Intensity × Cell Area) × 100%.'}

  ],

  hall_effect:[

    {title:'Mount semiconductor sample',desc:'Place the n-type Germanium (or Silicon) sample on the PCB holder between the electromagnet poles.'},

    {title:'Set constant current',desc:'Set the constant current source to the required value (50–200 mA). Verify using the ammeter.'},

    {title:'Apply magnetic field',desc:'Switch on the electromagnet. Set the desired field strength (B) using the Gauss meter. Field should be perpendicular to current flow.'},

    {title:'Measure Hall voltage',desc:'Connect the microvoltmeter to the Hall voltage terminals (perpendicular to both I and B). Record VH.'},

    {title:'Vary B and I',desc:'Change magnetic field and current systematically. Record VH for each (I, B) combination.'},

    {title:'Calculate Hall coefficient',desc:'RH = VH × d / (I × B). Calculate n = 1/(RH × q). Determine semiconductor type from sign of VH.'}

  ],

  single_slit:[

    {title:'Align laser source',desc:'Mount the laser on the optical bench. Ensure the beam travels along the bench axis without deviation.'},

    {title:'Set slit width',desc:'Insert the single slit assembly. Use the micrometer to set the desired slit width. Verify alignment.'},

    {title:'Position projection screen',desc:'Place the white screen at a measured distance D from the slit. Use a scale to measure D accurately.'},

    {title:'Observe diffraction pattern',desc:'Switch on the laser. Observe the characteristic pattern — one bright central maximum flanked by alternating dark and bright fringes.'},

    {title:'Measure fringe positions',desc:'Mark the positions of dark fringes (y₁, y₂, y₃…) from the central maximum using a scale or micrometer eyepiece.'},

    {title:'Calculate slit width & wavelength',desc:'a = mλD/y for known λ; or λ = ay/(mD) for known a. Compare with stated laser wavelength.'}

  ]

};



function renderPhysSteps(exp){

  const list=document.getElementById('phys-steps-list');if(!list)return;

  const steps=PHYS_STEPS[physState.currentExp]||physicsExtendedSteps(PHYS_EXPERIMENTS[physState.currentExp]);

  list.innerHTML=steps.map((s,i)=>`

    <div style="display:flex;gap:8px;align-items:flex-start;padding:7px 8px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:.2s" id="phys-step-${i}" onclick="physShowStep(${i})">

      <div style="width:20px;height:20px;border-radius:50%;background:rgba(139,92,246,.15);border:1.5px solid rgba(139,92,246,.3);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:var(--violet);flex-shrink:0;font-family:var(--fd)">${i+1}</div>

      <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:700;color:var(--text)">${s.title}</div><div style="font-size:9px;color:var(--text3);margin-top:2px;line-height:1.4">${s.desc.substring(0,55)}…</div></div>

    </div>`).join('');

}



function physShowStepLegacy(idx){

  const steps=PHYS_STEPS[physState.currentExp]||[];

  const s=steps[idx];if(!s)return;

  physAddAIMsg(`### 📋 Step ${idx+1}: ${s.title}\n\n${s.desc}\n\n_Tap Run Experiment to proceed with the current settings._`,true);

}



/* ── Physics animation phase helpers ── */

function physResetAnimations(){

  const scene=document.getElementById('phys-instrument-scene');

  if(!scene)return;

  // Remove all phase classes and running class

  scene.className='';

  const banner=document.getElementById('phys-step-banner');

  if(banner)banner.classList.remove('show');

}



function physShowStep(num,total,title,why,phaseClass){

  if(!physState.running)return;
  const scene=document.getElementById('phys-instrument-scene');

  // Remove old phase classes, keep running class. Before Run, absolutely no
  // SVG animation is allowed to start. During Run, arm only this phase.
  if(scene){

    scene.className=physState.running?'phys-anim-running phys-run-active':'phys-anim-running';

    if(phaseClass)scene.classList.add(phaseClass);

    if(physState.running && phaseClass) startPhysicsSvgAnimations(phaseClass);
    else gatePhysicsSvgAnimations(scene);

  }

  const banner=document.getElementById('phys-step-banner');

  if(banner){

    document.getElementById('phys-step-num').textContent='Step '+num+' of '+total;

    document.getElementById('phys-step-title').textContent=title;

    document.getElementById('phys-step-why').textContent=why;

    banner.classList.add('show');

  }

}



function physHideStepBanner(){

  const banner=document.getElementById('phys-step-banner');

  if(banner)banner.classList.remove('show');

  const scene=document.getElementById('phys-instrument-scene');

  if(scene)scene.classList.add('phys-anim-running');

}



function runPhysExperiment(){

  closePhysPanels();

  physState.running=true;
  startPhysicsCssAnimations();

  document.getElementById('phys-run-btn').disabled=true;

  document.getElementById('phys-run-btn').innerHTML='<i class="fas fa-spinner fa-spin"></i> Running…';

  // Update status badge

  const badge=document.getElementById('phys-status-badge');

  if(badge){badge.className='tb-badge badge-run';badge.innerHTML='<i class="fas fa-circle" style="font-size:6px"></i> <span>Running</span>';}

  switch(physState.currentExp){

    case 'solar_cell': runSolarCellExp();break;

    case 'hall_effect': runHallEffectExp();break;

    case 'single_slit': runSingleSlitExp();break;
    default: runGenericPhysicsExperiment();break;
  }

}



function runSolarCellExp(){

  const intensity=physState.lightIntensity;

  const Isc=(intensity/1000)*40+2;

  const Voc=0.55+0.04*Math.log(intensity/100);

  const idealFF=0.78;

  const Pmax=Isc*Voc*idealFF;

  const cellArea=0.04;

  const eta=(Pmax/(intensity*cellArea*0.002))*100;



  physGraphData=[];physObsData=[];

  const nPts=20;

  for(let i=0;i<=nPts;i++){

    const V=i*(Voc/nPts);

    const I=Isc*(1-Math.exp((V-Voc)/0.026));

    const P=V*I;

    physGraphData.push({x:V,y:Math.max(0,I),p:Math.max(0,P)});

    if(i%2===0)physObsData.push({no:physObsData.length+1,V:V.toFixed(3),I:Math.max(0,I).toFixed(2),P:Math.max(0,P).toFixed(2)});

  }



  physResetAnimations();



  // ── STEP 1 (0s): LAMP TURNS ON ──────────────────────────────────

  physShowStep(1,5,'💡 Halogen Lamp Switching ON',

    'The halogen lamp provides broadband white light (350–2500 nm). Its intensity is set to '+intensity+' lux. Photon flux = E/hf ≈ '+(intensity*2.4e12).toExponential(2)+' photons/s·cm².',

    'phys-phase-lamp');

  const ld=document.getElementById('phys-lux-display');

  let luxStep=0;const luxSteps=25;

  const luxTimer=setInterval(()=>{

    luxStep++;const t=luxStep/luxSteps;

    if(ld)ld.textContent=Math.round(intensity*t)+' lx';

    if(luxStep>=luxSteps){clearInterval(luxTimer);if(ld)ld.textContent=intensity+' lx';}

  },60);



  // ── STEP 2 (1.6s): PHOTONS TRAVEL TO CELL ──────────────────────

  setTimeout(()=>{

    physShowStep(2,5,'☀️ Photons Incident on Silicon Solar Cell',

      'Photons with energy E = hf = hc/λ travel from lamp to the p-type layer. For λ=550 nm, E = (6.626×10⁻³⁴ × 3×10⁸)/(550×10⁻⁹) = 2.25 eV — above Si bandgap (1.12 eV), so absorption occurs.',

      'phys-phase-photons');

  },1600);



  // ── STEP 3 (3.5s): ELECTRON-HOLE PAIR GENERATION AT p-n JUNCTION ──

  setTimeout(()=>{

    physShowStep(3,5,'⚡ e⁻-h⁺ Pair Generation & Junction Separation',

      'Each absorbed photon excites one electron from valence→conduction band, leaving a hole. The built-in E-field at the p-n junction (E_bi ≈ 0.6 V/μm) sweeps electrons to n-side and holes to p-side. This charge separation is the photovoltaic effect.',

      'phys-phase-pn');

  },3500);



  // ── STEP 4 (5.5s): CURRENT FLOWS — METERS RAMP ─────────────────

  setTimeout(()=>{

    physShowStep(4,5,'🔌 Photocurrent Flows Through External Circuit',

      'Separated charges flow through the external circuit: I_sc = q × G × A × EQE where G = generation rate. Voltmeter reads V_oc = (nkT/q)·ln(I_sc/I_0+1) = '+Voc.toFixed(3)+' V. Ammeter reads I_sc = '+Isc.toFixed(2)+' mA.',

      'phys-phase-circuit');

    const RAMP_DUR=3200;

    const rampStart=performance.now();

    function rampMeters(){

      const t=Math.min((performance.now()-rampStart)/RAMP_DUR,1);

      const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

      const vd=document.getElementById('phys-volt-display');if(vd)vd.textContent=(Voc*ease).toFixed(3)+' V';

      const ad=document.getElementById('phys-amp-display');if(ad)ad.textContent=(Isc*ease).toFixed(2)+' mA';

      if(t<1)requestAnimationFrame(rampMeters);

    }

    requestAnimationFrame(rampMeters);

  },5500);



  // ── STEP 5 (6s): V-I CURVE RECORDS ─────────────────────────────

  setTimeout(()=>{

    physShowStep(5,5,'📊 Recording V-I Characteristic — Rheostat Sweep',

      'Rheostat varies load resistance 0→∞. At each point: P = V×I. Maximum Power Point (MPP) occurs where dP/dV = 0 → P_max = '+Pmax.toFixed(3)+' mW. Fill Factor FF = P_max/(V_oc×I_sc) = '+idealFF.toFixed(2)+'. Efficiency η = '+eta.toFixed(1)+'%.',

      'phys-phase-circuit');

    animatePhysGraph(physGraphData,'V (V)','I (mA)',3500,()=>{

      physHideStepBanner();

      updateMeasurementVal('pm-voltage',Voc.toFixed(3),'V');

      updateMeasurementVal('pm-current',Isc.toFixed(2),'mA');

      updateMeasurementVal('pm-power',Pmax.toFixed(2),'mW');

      updateMeasurementVal('pm-efficiency',eta.toFixed(2),'%');

      renderPhysObsTable(['No.','V (V)','I (mA)','P (mW)'],physObsData.map(r=>[r.no,r.V,r.I,r.P]));

      document.getElementById('phys-results-box').innerHTML=`

        <div style="font-size:10px;color:var(--text2);font-family:var(--fm);line-height:1.8">

          <div>Voc = <b style="color:var(--cyan)">${Voc.toFixed(3)} V</b></div>

          <div>Isc = <b style="color:var(--emerald)">${Isc.toFixed(2)} mA</b></div>

          <div>Pmax = <b style="color:var(--amber)">${Pmax.toFixed(2)} mW</b></div>

          <div>FF = <b style="color:var(--violet)">${idealFF.toFixed(2)}</b></div>

          <div>η = <b style="color:var(--cyan)">${eta.toFixed(1)} %</b></div>

        </div>`;

      const pdfBtn=document.getElementById('phys-pdf-btn');if(pdfBtn)pdfBtn.style.display='flex';

      finishPhysExp('Solar Cell V-I characterised!',`Voc = ${Voc.toFixed(3)} V, Isc = ${Isc.toFixed(2)} mA, Pmax = ${Pmax.toFixed(2)} mW, FF = ${idealFF.toFixed(2)}, η = ${eta.toFixed(1)}%`);

    });

  },6000);

}



function runHallEffectExp(){

  const B=physState.magneticField;

  const I=physState.current/1000;

  const d=0.001;

  const RH=0.005;

  const VH=(RH*I*B/d)*1000;

  const n=1/(RH*1.6e-19);

  const rho=0.1;

  const mu=Math.abs(RH)/rho;



  physGraphData=[];physObsData=[];

  const currVals=[20,40,60,80,100,120,140,160,180,200];

  currVals.forEach((Imv,idx)=>{

    const Ia=Imv/1000;

    const VHi=(RH*Ia*B/d)*1000;

    physGraphData.push({x:Imv,y:VHi});

    physObsData.push({no:idx+1,I:Imv,B:B.toFixed(2),VH:VHi.toFixed(3)});

  });



  physResetAnimations();



  // ── STEP 1 (0s): ELECTROMAGNET ENERGISES ──────────────────────

  physShowStep(1,5,'🧲 Electromagnet Energising — Building Magnetic Field',

    'DC current flows through the coil windings of the electromagnet. By Ampere\'s law: B = μ₀nI_coil, generating a uniform field B = '+B.toFixed(2)+' T in the gap. Field lines flow from N-pole downward through the semiconductor sample to S-pole.',

    'phys-phase-magnet');

  const BMAG_DUR=1800;

  const bStart=performance.now();

  function rampB(){

    const t=Math.min((performance.now()-bStart)/BMAG_DUR,1);

    const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

    const gd=document.getElementById('phys-gauss-display');

    if(gd)gd.textContent=(B*ease).toFixed(2)+' T';

    if(t<1)requestAnimationFrame(rampB);

    else if(gd)gd.textContent=B.toFixed(2)+' T';

  }

  requestAnimationFrame(rampB);



  // ── STEP 2 (2s): CONSTANT CURRENT APPLIED ─────────────────────

  setTimeout(()=>{

    physShowStep(2,5,'⚡ Constant Current Applied Through n-Ge Sample',

      'Current I = '+physState.current+' mA flows in +x direction through the n-Ge strip. By electron convention, electrons (majority carriers in n-type) drift in −x direction with drift velocity v_d = I/(nqA) ≈ '+((physState.current/1000)/((n/1e6)*1.6e-19*1e-6)).toExponential(1)+' m/s.',

      'phys-phase-current');

    const CURR_DUR=2000;

    const cStart=performance.now();

    function rampCurrent(){

      const t=Math.min((performance.now()-cStart)/CURR_DUR,1);

      const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

      const cd=document.getElementById('phys-curr-display');

      if(cd)cd.textContent=Math.round(physState.current*ease)+' mA';

      if(t<1)requestAnimationFrame(rampCurrent);

      else if(cd)cd.textContent=physState.current+' mA';

    }

    requestAnimationFrame(rampCurrent);

  },2000);



  // ── STEP 3 (4.5s): LORENTZ FORCE DEFLECTS ELECTRONS ──────────

  setTimeout(()=>{

    physShowStep(3,5,'🌀 Lorentz Force Deflects Electrons — F = q(v × B)',

      'Electrons moving in −x with B in −z: F = q(v × B). Using right-hand rule: F = (−e)(−v_x î × −B_z k̂) = eV_x B in +y direction → electrons deflect toward top face. Charge accumulates: −ve on top, +ve on bottom.',

      'phys-phase-hall');

  },4500);



  // ── STEP 4 (6.5s): HALL VOLTAGE BUILDS ───────────────────────

  setTimeout(()=>{

    physShowStep(4,5,'📈 Hall Voltage Builds — Equilibrium Condition',

      'Accumulated charges create Hall field E_H opposing further deflection. At equilibrium: qE_H = qv_d B → E_H = v_d B. Hall voltage V_H = E_H × d = '+VH.toFixed(3)+' mV. Hall coefficient R_H = V_H·d/(I·B) = 1/(ne) = '+RH.toFixed(4)+' m³/C.',

      'phys-phase-hall');

    const VH_DUR=3000;

    const vhStart=performance.now();

    function rampVH(){

      const t=Math.min((performance.now()-vhStart)/VH_DUR,1);

      const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

      const vhd=document.getElementById('phys-vh-display');

      if(vhd)vhd.textContent=(VH*ease).toFixed(3)+' mV';

      if(t<1)requestAnimationFrame(rampVH);

      else if(vhd)vhd.textContent=VH.toFixed(3)+' mV';

    }

    requestAnimationFrame(rampVH);

  },6500);



  // ── STEP 5 (7s): VH vs I GRAPH ──────────────────────────────

  setTimeout(()=>{

    physShowStep(5,5,'📊 Sweeping Current — Plotting V_H vs I Graph',

      'Varying I at constant B shows linear relation V_H ∝ I (as R_H = V_H·d/IB = constant). Slope = R_H·B/d = '+((RH*B/d)*1000).toFixed(2)+' mV/mA. From slope: n = 1/(R_H·e) = '+(n/1e20).toFixed(3)+'×10²⁰/m³, μ_H = R_H/ρ = '+mu.toFixed(4)+' m²/Vs.',

      'phys-phase-hall');

    animatePhysGraph(physGraphData,'I (mA)','VH (mV)',3000,()=>{

      physHideStepBanner();

      updateMeasurementVal('pm-vh',VH.toFixed(3),'mV');

      updateMeasurementVal('pm-rh',RH.toFixed(4),'m³/C');

      updateMeasurementVal('pm-n',(n/1e20).toFixed(2),'×10²⁰');

      updateMeasurementVal('pm-mu',mu.toFixed(4),'m²/Vs');

      renderPhysObsTable(['No.','I (mA)','B (T)','VH (mV)'],physObsData.map(r=>[r.no,r.I,r.B,r.VH]));

      document.getElementById('phys-results-box').innerHTML=`

        <div style="font-size:10px;color:var(--text2);font-family:var(--fm);line-height:1.8">

          <div>VH = <b style="color:var(--cyan)">${VH.toFixed(3)} mV</b></div>

          <div>RH = <b style="color:var(--emerald)">${RH.toFixed(4)} m³/C</b></div>

          <div>n = <b style="color:var(--amber)">${(n/1e20).toFixed(2)}×10²⁰/m³</b></div>

          <div>μ = <b style="color:var(--violet)">${mu.toFixed(4)} m²/Vs</b></div>

          <div>Type: <b style="color:var(--cyan)">n-type (VH &lt; 0)</b></div>

        </div>`;

      const pdfBtn=document.getElementById('phys-pdf-btn');if(pdfBtn)pdfBtn.style.display='flex';

      finishPhysExp('Hall Effect measured!',`Hall Voltage VH = ${VH.toFixed(3)} mV, RH = ${RH.toFixed(4)} m³/C, n = ${(n/1e20).toFixed(2)}×10²⁰/m³, μ = ${mu.toFixed(4)} m²/Vs. n-type semiconductor confirmed.`);

    });

  },7000);

}



function runSingleSlitExp(){

  const a=physState.slitWidth*1e-3;

  const lambda=physState.wavelength*1e-9;

  const D=physState.screenDistance*1e-2;

  const y1=(lambda*D/a)*1000;

  const centralWidth=2*y1;

  const fringeWidth=y1;

  const aCalc=(lambda*D/y1*1e3)*1e3;



  physGraphData=[];physObsData=[];

  const nPts=80;

  for(let i=0;i<=nPts;i++){

    const pos=(i-nPts/2)*(a/lambda)*0.15;

    const sinc=pos===0?1:Math.sin(Math.PI*pos)/(Math.PI*pos);

    physGraphData.push({x:(i-nPts/2)*(3*y1/20),y:sinc*sinc});

  }

  for(let m=1;m<=4;m++){

    const ym=(m*lambda*D/a)*1000;

    physObsData.push({no:m,order:m,y:ym.toFixed(2),type:'Dark'});

  }



  const sg=document.getElementById('phys-slit-gap');if(sg)sg.textContent='a='+physState.slitWidth+'mm';

  const dl=document.getElementById('phys-dist-label');if(dl)dl.textContent='D = '+physState.screenDistance+' cm';



  physResetAnimations();



  // STEP 1: LASER POWERS ON

  physShowStep(1,4,'🔴 He-Ne Laser Warming Up — Coherent Light Source',

    'Stimulated emission in He-Ne gas (632.8 nm). Coherence length Lc = λ²/Δλ ≈ 30 cm. Output ~1 mW TEM₀₀ mode. Spatial coherence ensures stable single-wavelength wavefront essential for diffraction.',

    'phys-phase-laser');

  const scene=document.getElementById('phys-instrument-scene');

  const svgEl=scene?scene.querySelector('svg'):null;

  if(svgEl){

    const beamRects=svgEl.querySelectorAll('rect');

    beamRects.forEach(r=>{

      const fill=r.getAttribute('fill')||'';

      if(fill.includes('FF11')||fill.includes('FF22')||fill.includes('FF33')){

        r.style.opacity='0';r.style.transition='opacity 1.4s ease';

        setTimeout(()=>{r.style.opacity='1';},300);

      }

    });

  }



  // STEP 2: BEAM HITS SLIT

  setTimeout(()=>{

    physShowStep(2,4,'🌊 Beam Incident on Slit — Huygens-Fresnel Diffraction',

      'Slit width a='+physState.slitWidth+' mm, λ='+physState.wavelength+' nm → a/λ='+(physState.slitWidth*1e-3/lambda).toFixed(0)+'. Each wavelet point in the aperture radiates spherically. Wavelets from different points travel different path lengths to screen → interference creates the pattern.',

      'phys-phase-slit');

  },2500);



  // STEP 3: PATTERN BUILDS

  setTimeout(()=>{

    physShowStep(3,4,'📸 Sinc² Pattern on Screen — Dark Fringes at δ=mλ',

      'Dark fringe condition: a·sinθ=mλ → y_m=mλD/a. y₁='+y1.toFixed(2)+' mm. Central max width=2y₁='+centralWidth.toFixed(2)+' mm (twice secondary maxima). Intensity I(θ)=I₀(sinα/α)² where α=πa·sinθ/λ.',

      'phys-phase-slit');

    const FRINGE_DUR=2000;

    const fStart=performance.now();

    function animateFringe(){

      const t=Math.min((performance.now()-fStart)/FRINGE_DUR,1);

      const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

      const fl=document.getElementById('phys-fringe-label');

      if(fl)fl.textContent='y₁='+(y1*ease).toFixed(1)+'mm';

      if(t<1)requestAnimationFrame(animateFringe);

      else if(fl)fl.textContent='y₁='+y1.toFixed(1)+'mm';

    }

    requestAnimationFrame(animateFringe);

  },4500);



  // STEP 4: GRAPH RECORDS

  setTimeout(()=>{

    physShowStep(4,4,'📊 Intensity Profile — I₀·(sinα/α)² Curve',

      'Sweeping screen position records sinc² envelope. Calculated a=λD/y₁='+aCalc.toFixed(4)+' mm matches set value. From graph: β=λD/a='+fringeWidth.toFixed(2)+' mm confirms wave optics prediction. λ verified = '+physState.wavelength+' nm.',

      'phys-phase-slit');

    animatePhysGraph(physGraphData,'Position (mm)','Intensity',3500,()=>{

      physHideStepBanner();

      updateMeasurementVal('pm-fringe',fringeWidth.toFixed(2),'mm');

      updateMeasurementVal('pm-central',centralWidth.toFixed(2),'mm');

      updateMeasurementVal('pm-dark1',y1.toFixed(2),'mm');

      updateMeasurementVal('pm-slit-calc',aCalc.toFixed(3),'mm');

      renderPhysObsTable(['Order m','y_m (mm)','Type'],physObsData.map(r=>[r.order,r.y,r.type]));

      document.getElementById('phys-results-box').innerHTML=`

        <div style="font-size:10px;color:var(--text2);font-family:var(--fm);line-height:1.8">

          <div>y₁ = <b style="color:var(--cyan)">${y1.toFixed(2)} mm</b></div>

          <div>β = <b style="color:var(--emerald)">${fringeWidth.toFixed(2)} mm</b></div>

          <div>Central max = <b style="color:var(--amber)">${centralWidth.toFixed(2)} mm</b></div>

          <div>a (calc) = <b style="color:var(--violet)">${aCalc.toFixed(3)} mm</b></div>

          <div>λ = <b style="color:var(--cyan)">${physState.wavelength} nm</b></div>

        </div>`;

      const pdfBtn=document.getElementById('phys-pdf-btn');if(pdfBtn)pdfBtn.style.display='flex';

      finishPhysExp('Single Slit Diffraction pattern recorded!',`β=${fringeWidth.toFixed(2)} mm, y₁=${y1.toFixed(2)} mm, Central width=${centralWidth.toFixed(2)} mm, a(calc)=${aCalc.toFixed(3)} mm.`);

    });

  },7000);

}




function runGenericPhysicsExperiment(){
  const exp=PHYS_EXPERIMENTS[physState.currentExp];
  if(!exp)return;
  const token=++physRunToken;
  physGraphData=[];physObsData=[];
  const p1=exp.params?.[0], p2=exp.params?.[1];
  const v1=Number(physState[p1?.stateKey]??1), v2=Number(physState[p2?.stateKey]??1);
  const points=12;
  const scale=Math.max(Math.abs(v1),1);
  for(let i=1;i<=points;i++){
    if(token!==physRunToken)return;
    const x=(i/points)*scale;
    const y=(v2||1)*(0.22+0.78*i/points);
    physGraphData.push({x,y});
    physObsData.push({no:i,[p1?.id||'x']:x.toFixed(3),[p2?.id||'y']:y.toFixed(3)});
  }
  physResetAnimations();
  const phases=['phys-phase-generic'];
  physShowStep(1,4,'🔧 Apparatus ready','The selected instruments are positioned and calibrated for the virtual measurement.',phases[0]);
  setTimeout(()=>{if(token!==physRunToken)return;physShowStep(2,4,'📐 Measurement sequence','The simulator collects repeated readings while keeping the selected control parameter consistent.',phases[0]);},900);
  setTimeout(()=>{if(token!==physRunToken)return;physShowStep(3,4,'📊 Data trend forming','The measured points are being plotted so the experimental relationship can be compared with theory.',phases[0]);},1800);
  setTimeout(()=>{
    if(token!==physRunToken)return;
    physShowStep(4,4,'✅ Analysis complete','The final values are calculated from the simulated readings and the experiment-specific formula set.',phases[0]);
    animatePhysGraph(physGraphData,exp.graphXLabel,exp.graphYLabel,1600,()=>{
      if(token!==physRunToken)return;
      physHideStepBanner();
      const base=exp.params?.map((p,i)=>`${p.label}: ${physState[p.stateKey]} ${p.unit}`).join(' • ')||'Parameters recorded';
      const values=[
        physGraphData[physGraphData.length-1]?.y?.toFixed(3)||'—',
        ((v1/(v2||1))||0).toFixed(4),
        Math.abs(Math.sin(v1))*100
      ];
      exp.measurements?.forEach((m,i)=>updateMeasurementVal(m.id,values[i]??'—',m.unit));
      const headers=['No.',...(exp.params||[]).map(p=>p.label)];
      const rows=physObsData.map(r=>[r.no,...(exp.params||[]).map(p=>r[p.id]??'—')]);
      renderPhysObsTable(headers,rows);
      document.getElementById('phys-results-box').innerHTML=`<div class="phys-generic-result"><b>Measured:</b> ${values[0]} ${exp.measurements?.[0]?.unit||''}<br><b>Calculated:</b> ${values[1]} ${exp.measurements?.[1]?.unit||''}<br><b>Trend:</b> ${exp.graphYLabel} vs ${exp.graphXLabel}</div>`;
      const pdfBtn=document.getElementById('phys-pdf-btn');if(pdfBtn)pdfBtn.style.display='flex';
      finishPhysExp(`${exp.name} completed!`,`${base}. Primary measured value: ${values[0]} ${exp.measurements?.[0]?.unit||''}. Review the graph, viva and AI recommendation.`);
    });
  },2800);
}

function finishPhysExp(title,summary){

  physState.running=false;
  // Keep the instrument still after the experiment completes; animations only run during an active run.
  stopPhysicsCssAnimations();

  physState.score+=60;

  document.getElementById('phys-score-val').textContent=physState.score+' ';

  const btn=document.getElementById('phys-run-btn');

  if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-redo"></i> Re-run';}

  const badge=document.getElementById('phys-status-badge');

  if(badge){badge.className='tb-badge badge-done';badge.innerHTML='<i class="fas fa-check" style="font-size:6px"></i> <span>Complete</span>';}

  // Success anim

  const sa=document.getElementById('phys-success-anim');if(sa){sa.classList.add('show');setTimeout(()=>sa.classList.remove('show'),2000);}

  // AI message

  const exp=PHYS_EXPERIMENTS[physState.currentExp];

  physAddAIMsg(`### ✅ Experiment Complete!\n\n**${title}**\n\n**Results Summary:**\n${summary}\n\n**Conclusion:** ${exp.aim.replace('To study','This experiment studied').replace('To determine','The experiment determined')}\n\n🎓 Review the Viva section and ask the AI for a recommendation.`,true);

  // Show result modal

  const modal=document.getElementById('phys-result-modal');

  document.getElementById('phys-result-title').textContent='✅ '+exp.name+' — Complete!';

  document.getElementById('phys-result-content').innerHTML=`<p><b>Results:</b> ${summary}</p><p style="margin-top:10px"><b>AIM:</b> ${exp.aim}</p>`;

  if(modal){modal.classList.add('show');setTimeout(()=>modal.classList.remove('show'),5000);}

}



function physResetExperiment(){

  physRunToken++;
  physState.running=false;

  physGraphData=[];physObsData=[];

  clearPhysGraph();

  document.getElementById('phys-obs-table').textContent='Run the experiment to record observations.';

  document.getElementById('phys-results-box').innerHTML='';

  const btn=document.getElementById('phys-run-btn');

  if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-play"></i> Run Experiment';}

  const badge=document.getElementById('phys-status-badge');

  if(badge){badge.className='tb-badge badge-idle';badge.innerHTML='<i class="fas fa-circle" style="font-size:6px"></i> <span>Idle</span>';}

  const pdfBtn=document.getElementById('phys-pdf-btn');if(pdfBtn)pdfBtn.style.display='none';

  physResetAnimations();
  stopPhysicsCssAnimations();
  stopPhysicsSvgAnimations();
  gatePhysicsSvgAnimations(document.getElementById('phys-instrument-scene'));

  renderPhysMeasurements(PHYS_EXPERIMENTS[physState.currentExp]);

  showToast('🔄 Experiment reset');

}



function changePhysExperiment(key){

  loadPhysExperiment(key);

  const exp=PHYS_EXPERIMENTS[key];

  if(exp)physAddAIMsg(`### 🔬 Loaded: ${exp.icon} ${exp.name}\n\n**Aim:** ${exp.aim}\n\nAdjust the parameters and click Run Experiment to begin!`,true);

}



function updatePhysDisplays(){

  // Update any live SVG display elements based on current state

  const exp=PHYS_EXPERIMENTS[physState.currentExp];if(!exp)return;

  exp.params.forEach(p=>{

    const el=document.getElementById('ppv-'+p.id);

    if(el)el.textContent=physState[p.stateKey]+' '+p.unit;

  });

}



function updateMeasurementVal(id,val,unit){

  const el=document.getElementById(id);

  if(el)el.textContent=val;

}



/* ══════════════════════════════════════════════════════

   PHYSICS PDF REPORT GENERATOR

══════════════════════════════════════════════════════ */

async function generatePhysPDFReport(){

  const expKey=physState.currentExp;

  const exp=PHYS_EXPERIMENTS[expKey];

  if(!exp){showToast('Run an experiment first!');return;}

  if(physGraphData.length===0){showToast('⚠️ Please run the experiment first to generate data.');return;}

  showToast('📄 Generating Physics PDF Report…',3000);

  if(!window.jspdf){

    await new Promise((res,rej)=>{

      const s=document.createElement('script');

      s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

      s.onload=res;s.onerror=rej;document.head.appendChild(s);

    });

  }

  const {jsPDF}=window.jspdf;

  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});

  const W=210,M=18,IW=W-2*M;let y=20;



  const san=(t)=>{

    if(!t)return '';

    return String(t)

      .replace(/[^\x00-\x7F]/g,c=>{

        const map={'→':'->','⇌':'<->','↓':'(ppt)','↑':'(gas)','α':'alpha','β':'beta','λ':'lambda','μ':'mu','η':'eta','θ':'theta','Δ':'Delta','σ':'sigma','ρ':'rho','ε':'epsilon','⁻':'(-)','+':'+','–':'-','—':'-','\u2080':'0','\u2081':'1','\u2082':'2','\u2083':'3','\u00B2':'2','\u00B3':'3','×':'x','°':'deg','≈':'~','≥':'>=','≤':'<=','≠':'!=','∝':'~','∞':'inf'};

        return map[c]||'';

      })

      .replace(/\*\*(.*?)\*\*/g,'$1')

      .replace(/\*(.*?)\*/g,'$1')

      .replace(/#{1,6}\s/g,'')

      .replace(/`/g,'');

  };



  const nl=(h=6)=>{y+=h;};

  const checkPage=(needed=20)=>{if(y+needed>285){doc.addPage();y=20;}};



  const sectionHeader=(text,fs=11,r=139,g=92,b=246)=>{

    checkPage(16);

    doc.setFillColor(r,g,b);doc.roundedRect(M,y-4,IW,10,2,2,'F');

    doc.setFontSize(fs);doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');

    doc.text(san(text),M+4,y+3);nl(12);

    doc.setTextColor(30,30,60);

  };



  const bodyText=(text,fs=10,indent=0)=>{

    checkPage(10);

    doc.setFontSize(fs);doc.setFont('helvetica','normal');doc.setTextColor(40,40,40);

    const lines=doc.splitTextToSize(san(text),IW-indent-2);

    lines.forEach(l=>{checkPage(7);doc.text(l,M+indent,y);nl(6);});

  };



  const keyVal=(label,value,color=[6,182,212])=>{

    checkPage(8);

    doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(80,80,80);

    doc.text(san(label)+':',M+4,y);

    doc.setFont('helvetica','normal');doc.setTextColor(...color);

    doc.text(san(String(value)),M+60,y);

    doc.setTextColor(40,40,40);nl(7);

  };



  // ═══ COVER PAGE ═══

  doc.setFillColor(7,12,23);doc.rect(0,0,W,297,'F');

  // Header bar

  doc.setFillColor(139,92,246);doc.rect(0,0,W,8,'F');

  doc.setFillColor(59,130,246);doc.rect(0,289,W,8,'F');



  // Institute name

  doc.setFontSize(11);doc.setTextColor(148,163,184);doc.setFont('helvetica','normal');

  doc.text('KKW Institute of Engineering, Education & Research, Nashik',W/2,25,{align:'center'});



  // Title

  doc.setFontSize(22);doc.setTextColor(139,92,246);doc.setFont('helvetica','bold');

  doc.text('PHYSICS LABORATORY',W/2,50,{align:'center'});

  doc.setFontSize(16);doc.setTextColor(59,130,246);

  doc.text('EXPERIMENT REPORT',W/2,62,{align:'center'});



  // Divider

  doc.setDrawColor(139,92,246);doc.setLineWidth(0.8);doc.line(M,70,W-M,70);



  // Experiment name box

  doc.setFillColor(20,30,60);doc.roundedRect(M,78,IW,28,4,4,'F');

  doc.setFontSize(14);doc.setTextColor(245,245,255);doc.setFont('helvetica','bold');

  doc.text(san(exp.name),W/2,91,{align:'center'});

  doc.setFontSize(9);doc.setTextColor(148,163,184);doc.setFont('helvetica','normal');

  doc.text('PhysLab AI — Interactive Virtual Physics Laboratory',W/2,102,{align:'center'});



  // Meta table

  const meta=[

    ['Experiment',san(exp.name)],

    ['Subject','Physics Practical'],

    ['Date',new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})],

    ['Score',physState.score+' points'],

  ];

  let mx=M,my=120;

  doc.setFillColor(15,22,45);doc.roundedRect(mx,my-6,IW,meta.length*12+6,3,3,'F');

  meta.forEach(([k,v])=>{

    doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(139,92,246);

    doc.text(san(k)+':',mx+6,my);

    doc.setFont('helvetica','normal');doc.setTextColor(220,220,240);

    doc.text(san(v),mx+55,my);

    my+=12;

  });



  // Aim box

  doc.setFillColor(15,30,50);doc.roundedRect(M,170,IW,35,3,3,'F');

  doc.setFontSize(9);doc.setTextColor(6,182,212);doc.setFont('helvetica','bold');

  doc.text('AIM:',M+5,180);

  doc.setFont('helvetica','normal');doc.setTextColor(200,220,240);

  const aimLines=doc.splitTextToSize(san(exp.aim),IW-14);

  aimLines.forEach((l,i)=>doc.text(l,M+5,186+i*6));



  // Footer

  doc.setFontSize(8);doc.setTextColor(100,100,120);

  doc.text('Generated by SciLab AI  |  '+(new Date().toISOString().slice(0,10)),W/2,270,{align:'center'});

  doc.text('For Educational Purposes Only',W/2,276,{align:'center'});



  // ═══ PAGE 2 — THEORY ═══

  doc.addPage();y=20;

  sectionHeader('1. THEORY & WORKING PRINCIPLE',11,59,130,246);



  const THEORY_FULL={

    solar_cell:`A solar cell (photovoltaic cell) converts light directly into electrical energy using the photovoltaic effect. It consists of a p-n junction semiconductor (typically silicon).



WORKING MECHANISM:

1. PHOTON ABSORPTION: Photons from incident light are absorbed by the semiconductor. Each photon with energy >= bandgap energy (Eg ~ 1.1 eV for Si) excites an electron from valence to conduction band.

2. ELECTRON-HOLE PAIR GENERATION: The absorbed photon creates an electron-hole pair (EHP). The electron has negative charge; the hole has positive charge.

3. CHARGE SEPARATION: The built-in electric field at the p-n junction (due to diffusion of carriers during fabrication) separates the EHP — electrons drift to the n-side, holes to the p-side.

4. CURRENT FLOW: The separated charges create a potential difference (open-circuit voltage Voc). When a load is connected, conventional current flows from p to n through the external circuit.



P-N JUNCTION PHYSICS:

When p-type (boron-doped) and n-type (phosphorus-doped) silicon are joined, electrons from n-side diffuse to p-side and holes from p-side diffuse to n-side. This creates a depletion region with a built-in field E_bi pointing from n to p. The built-in voltage for Si is typically 0.6 V.`,

    hall_effect:`The Hall Effect is the production of a voltage difference (Hall voltage, VH) across a current-carrying conductor when placed in a perpendicular magnetic field.



DISCOVERY: Edwin H. Hall discovered this effect in 1879 at Johns Hopkins University.



WORKING MECHANISM:

1. CURRENT FLOW: A current I flows through the semiconductor sample (e.g., n-Ge) in the x-direction.

2. MAGNETIC FORCE: A magnetic field B is applied in the z-direction (perpendicular to current). The Lorentz force F = q(v x B) acts on moving charge carriers.

3. CARRIER DEFLECTION: For n-type material, electrons (moving in -x direction) experience force in -y direction (using right-hand rule), deflecting toward one face of the sample.

4. CHARGE ACCUMULATION: Electrons accumulate on one face, creating a transverse electric field (Hall field EH). The process continues until EH balances the magnetic force.

5. HALL VOLTAGE: At equilibrium: qEH = qvB => EH = vB => VH = EH * d = vBd where d is sample width.

For n-type: VH is negative (electrons accumulate on bottom face).

For p-type: VH is positive (holes accumulate on bottom face).`,

    single_slit:`When coherent light (laser beam) passes through a narrow slit of width 'a', it diffracts and forms an alternating pattern of bright and dark fringes on a distant screen. This is Single Slit Diffraction.



HUYGENS' PRINCIPLE: Every point on the wavefront in the slit acts as a secondary source of wavelets. These wavelets interfere constructively and destructively as they reach different points on the screen.



CONDITION FOR DARK FRINGES:

a * sin(theta) = m * lambda, where m = +/-1, +/-2, ...

For small angles: sin(theta) ~ tan(theta) = y/D

=> Position of m-th dark fringe: y_m = m*lambda*D/a



CENTRAL MAXIMUM:

The central bright fringe is the most intense and has double the width of secondary maxima.

Width of central maximum = 2*lambda*D/a



INTENSITY DISTRIBUTION:

I(theta) = I0 * (sin(alpha)/alpha)^2

where alpha = (pi*a*sin(theta))/lambda

This gives the characteristic sinc-squared pattern.`

  };



  bodyText(THEORY_FULL[expKey]||exp.theory);



  // ═══ PAGE 3 — FORMULAS & CALCULATIONS ═══

  doc.addPage();y=20;

  sectionHeader('2. FORMULAS & MATHEMATICAL ANALYSIS',11,139,92,246);



  const FORMULAS_DETAILED={

    solar_cell:[

      ['Diode Current Equation','I = Isc - I0 * [exp(qV/nkT) - 1]'],

      ['Short Circuit Current','Isc proportional to Light Intensity (lux)'],

      ['Open Circuit Voltage','Voc = (nkT/q) * ln(Isc/I0 + 1)  approx  0.55 + 0.04*ln(E/100)'],

      ['Power Output','P = V * I  (Watts)'],

      ['Maximum Power','Pmax = Voc * Isc * Fill Factor'],

      ['Fill Factor (FF)','FF = Pmax / (Voc * Isc)   [Ideal FF = 0.78-0.85]'],

      ['Efficiency','eta = Pmax / Pin * 100%   where Pin = Intensity * Cell Area'],

      ['Thermal Voltage','Vt = kT/q = 0.02585 V at 300 K'],

    ],

    hall_effect:[

      ['Hall Voltage','VH = (R_H * I * B) / d  [in Volts]'],

      ['Hall Coefficient','R_H = VH / (I * B / d) = 1 / (n * q)  [m3/C]'],

      ['Carrier Concentration','n = 1 / (R_H * q)  [per m3]'],

      ['Carrier Mobility','mu_H = |R_H| / rho  = |VH * d| / (rho * I * B)  [m2/Vs]'],

      ['Lorentz Force','F = q * (v x B)   [N]'],

      ['Hall Field at Equilibrium','E_H = v_d * B  where v_d = drift velocity'],

      ['Resistivity of sample','rho = R * (A/L)  [Ohm-m]'],

    ],

    single_slit:[

      ['Condition for Dark Fringes','a * sin(theta) = m * lambda,  m = +/-1, +/-2, ...'],

      ['Small Angle Approximation','sin(theta) approx tan(theta) = y_m / D'],

      ['Position of m-th Dark Fringe','y_m = m * lambda * D / a  [m]'],

      ['Fringe Width (beta)','beta = lambda * D / a'],

      ['Central Maximum Width','= 2 * lambda * D / a  = 2 * y_1'],

      ['Angular Half-Width','theta_1 = lambda / a  [radians]'],

      ['Intensity Distribution','I(theta) = I0 * [sin(alpha)/alpha]^2,  alpha = pi*a*sin(theta)/lambda'],

      ['Slit Width (from measurement)','a = lambda * D / y_1  [m]'],

    ]

  };



  const fmls=FORMULAS_DETAILED[expKey]||[];

  fmls.forEach(([name,formula],fi)=>{

    checkPage(18);

    // Numbered formula box

    doc.setFillColor(fi%2===0?240:248,fi%2===0?240:245,fi%2===0?255:255);

    doc.roundedRect(M,y-4,IW,14,2,2,'F');

    doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setTextColor(139,92,246);

    doc.text('('+(fi+1)+')  '+san(name),M+4,y+2);

    doc.setFont('courier','normal');doc.setTextColor(30,30,100);doc.setFontSize(9);

    const flines=doc.splitTextToSize(san(formula),IW-10);

    flines.forEach((l,li)=>doc.text(l,M+8,y+7+li*5));

    nl(14+Math.max(0,flines.length-1)*5);

  });



  // ─ SAMPLE CALCULATION ─

  nl(4);sectionHeader('3. SAMPLE CALCULATIONS',11,59,130,246);



  const CALCS={

    solar_cell:()=>{

      const I=physState.lightIntensity;

      const Isc=(I/1000)*40+2;

      const Voc=0.55+0.04*Math.log(I/100);

      const FF=0.78;

      const Pmax=Isc*Voc*FF;

      const eta=(Pmax/(I*0.04*0.002))*100;

      return[

        `Given: Light Intensity E = ${I} lux`,

        `Step 1 — Short Circuit Current:`,

        `   Isc = (E/1000) * 40 + 2 = (${I}/1000) * 40 + 2 = ${Isc.toFixed(3)} mA`,

        `Step 2 — Open Circuit Voltage:`,

        `   Voc = 0.55 + 0.04 * ln(E/100) = 0.55 + 0.04 * ln(${I}/100) = ${Voc.toFixed(4)} V`,

        `Step 3 — Maximum Power:`,

        `   Pmax = Voc * Isc * FF = ${Voc.toFixed(4)} * ${Isc.toFixed(3)} * 0.78 = ${Pmax.toFixed(4)} mW`,

        `Step 4 — Efficiency:`,

        `   Pin = E * A = ${I} * 0.04 m2 * 0.002 W/lux = ${(I*0.04*0.002).toFixed(4)} W`,

        `   eta = Pmax/Pin * 100 = ${Pmax.toFixed(4)}/1000 / ${(I*0.04*0.002).toFixed(4)} * 100 = ${eta.toFixed(2)} %`,

      ];

    },

    hall_effect:()=>{

      const B=physState.magneticField;

      const Imv=physState.current;

      const I=Imv/1000;

      const d=0.001;

      const RH=0.005;

      const VH=(RH*I*B/d)*1000;

      const n=1/(RH*1.6e-19);

      const mu=RH/0.1;

      return[

        `Given: B = ${B} T,  I = ${Imv} mA = ${I} A,  d = ${d*1000} mm,  R_H = ${RH} m3/C (n-Ge)`,

        `Step 1 — Hall Voltage:`,

        `   VH = R_H * I * B / d = ${RH} * ${I} * ${B} / ${d} = ${(RH*I*B/d).toFixed(6)} V = ${VH.toFixed(4)} mV`,

        `Step 2 — Hall Coefficient:`,

        `   R_H = VH / (I*B/d) = ${(RH*I*B/d).toFixed(6)} / (${I}*${B}/${d}) = ${RH.toFixed(4)} m3/C`,

        `Step 3 — Carrier Concentration:`,

        `   n = 1/(R_H * q) = 1/(${RH} * 1.6e-19) = ${(n/1e20).toFixed(3)} x 10^20 /m3`,

        `Step 4 — Carrier Mobility:`,

        `   mu = |R_H| / rho = ${RH} / 0.1 = ${mu.toFixed(4)} m2/Vs`,

        `Semiconductor Type: Since VH is negative => n-type (electrons are majority carriers)`,

      ];

    },

    single_slit:()=>{

      const a=physState.slitWidth;

      const lam=physState.wavelength;

      const D=physState.screenDistance;

      const y1=(lam*1e-9*D*1e-2/(a*1e-3))*1000;

      const beta=y1;

      const central=2*y1;

      const aCalc=(lam*1e-9*D*1e-2/y1*1e3)*1e6;

      return[

        `Given: Slit width a = ${a} mm,  lambda = ${lam} nm,  D = ${D} cm`,

        `Step 1 — 1st Dark Fringe Position:`,

        `   y1 = lambda * D / a = (${lam}e-9 * ${D}e-2) / ${a}e-3 = ${y1.toFixed(4)} mm`,

        `Step 2 — Fringe Width (beta):`,

        `   beta = lambda * D / a = y1 = ${beta.toFixed(4)} mm`,

        `Step 3 — Central Maximum Width:`,

        `   Central width = 2 * y1 = 2 * ${y1.toFixed(4)} = ${central.toFixed(4)} mm`,

        `Step 4 — Verify Slit Width:`,

        `   a_calc = lambda * D / y1 = (${lam}e-9 * ${D}e-2) / ${(y1*1e-3).toFixed(6)} = ${(aCalc/1000).toFixed(4)} mm`,

        `   Percentage Error = |a - a_calc|/a * 100 = ${Math.abs(a-(aCalc/1000))/a*100 < 0.001 ? '~0.000' : (Math.abs(a-(aCalc/1000))/a*100).toFixed(3)} %`,

      ];

    }

  };



  const calcLines=(CALCS[expKey]||(() => []))();

  calcLines.forEach((line,li)=>{

    checkPage(8);

    const isStep=line.startsWith('Step')||line.startsWith('Given')||line.startsWith('Semiconductor');

    doc.setFontSize(9);

    if(isStep){doc.setFont('helvetica','bold');doc.setTextColor(59,130,246);}

    else{doc.setFont('courier','normal');doc.setTextColor(30,30,80);}

    doc.text(san(line),M+(isStep?2:6),y);nl(7);

  });



  // ═══ OBSERVATIONS TABLE ═══

  doc.addPage();y=20;

  sectionHeader('4. OBSERVATION TABLE',11,139,92,246);

  if(physObsData.length>0){

    const headers=expKey==='solar_cell'?['No.','V (V)','I (mA)','P (mW)']:

                  expKey==='hall_effect'?['No.','I (mA)','B (T)','VH (mV)']:

                  ['Order m','y_m (mm)','Type'];

    const rows=physObsData.map(r=>

      expKey==='solar_cell'?[r.no,r.V,r.I,r.P]:

      expKey==='hall_effect'?[r.no,r.I,r.B,r.VH]:

      [r.order,r.y,r.type]

    );

    // Table

    const colW=IW/headers.length;

    // Header row

    doc.setFillColor(139,92,246);doc.rect(M,y-4,IW,10,'F');

    doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);

    headers.forEach((h,hi)=>doc.text(san(h),M+hi*colW+colW/2,y+2,{align:'center'}));

    nl(10);

    rows.forEach((row,ri)=>{

      checkPage(9);

      if(ri%2===0){doc.setFillColor(245,245,255);}else{doc.setFillColor(255,255,255);}

      doc.rect(M,y-4,IW,8,'F');

      doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(30,30,60);

      row.forEach((cell,ci)=>doc.text(san(String(cell)),M+ci*colW+colW/2,y+1,{align:'center'}));

      doc.setDrawColor(200,200,220);doc.setLineWidth(0.2);doc.rect(M,y-4,IW,8);

      nl(8);

    });

  }else{

    bodyText('No observation data available. Please run the experiment first.');

  }



  // ─ RESULTS ─

  nl(4);sectionHeader('5. RESULTS',11,59,130,246);

  const RESULTS={

    solar_cell:()=>{

      const Isc=(physState.lightIntensity/1000)*40+2;

      const Voc=0.55+0.04*Math.log(physState.lightIntensity/100);

      const FF=0.78;

      const Pmax=Isc*Voc*FF;

      const eta=(Pmax/(physState.lightIntensity*0.04*0.002))*100;

      return[

        ['Open Circuit Voltage (Voc)',Voc.toFixed(4)+' V',[6,182,212]],

        ['Short Circuit Current (Isc)',Isc.toFixed(4)+' mA',[16,185,129]],

        ['Maximum Power (Pmax)',Pmax.toFixed(4)+' mW',[245,158,11]],

        ['Fill Factor (FF)',FF.toFixed(3),[139,92,246]],

        ['Efficiency (eta)',eta.toFixed(2)+' %',[6,182,212]],

        ['Light Intensity Used',physState.lightIntensity+' lux',[148,163,184]],

      ];

    },

    hall_effect:()=>{

      const B=physState.magneticField;const I=physState.current/1000;

      const VH=((0.005*I*B)/0.001)*1000;

      const n=1/(0.005*1.6e-19);

      return[

        ['Hall Voltage (VH)',VH.toFixed(4)+' mV',[6,182,212]],

        ['Hall Coefficient (R_H)','0.0050 m3/C',[16,185,129]],

        ['Carrier Concentration (n)',(n/1e20).toFixed(3)+' x 10^20 /m3',[245,158,11]],

        ['Carrier Mobility (mu)','0.0500 m2/Vs',[139,92,246]],

        ['Semiconductor Type','n-type (electrons = majority carriers)',[6,182,212]],

        ['Applied Magnetic Field',B.toFixed(2)+' T',[148,163,184]],

        ['Applied Current',physState.current+' mA',[148,163,184]],

      ];

    },

    single_slit:()=>{

      const a=physState.slitWidth*1e-3;const lam=physState.wavelength*1e-9;const D=physState.screenDistance*1e-2;

      const y1=(lam*D/a)*1000;

      return[

        ['1st Dark Fringe (y1)',y1.toFixed(3)+' mm',[6,182,212]],

        ['Fringe Width (beta)',y1.toFixed(3)+' mm',[16,185,129]],

        ['Central Max Width',((2*y1).toFixed(3))+' mm',[245,158,11]],

        ['Calculated Slit Width',((lam*D/y1*1e3)*1e3).toFixed(4)+' mm',[139,92,246]],

        ['Wavelength Used',physState.wavelength+' nm',[6,182,212]],

        ['Screen Distance',physState.screenDistance+' cm',[148,163,184]],

      ];

    }

  };

  const results=(RESULTS[expKey]||(() => []))();

  results.forEach(([label,value,color])=>keyVal(label,value,color));



  // ─ GRAPH section ─

  nl(4);

  if(physGraphData.length>0){

    checkPage(70);

    sectionHeader('6. GRAPH — '+san(exp.name),11,59,130,246);

    try{

      // Redraw graph at full resolution for PDF (600×320 px offscreen canvas)

      const offCanvas=document.createElement('canvas');

      offCanvas.width=600;offCanvas.height=320;

      const offCtx=offCanvas.getContext('2d');

      const OW=600,OH=320,pL=50,pB=40,pT=20,pR=20;

      const gW2=OW-pL-pR,gH2=OH-pT-pB;

      const xs2=physGraphData.map(d=>d.x),ys2=physGraphData.map(d=>d.y);

      const minX2=Math.min(...xs2),maxX2=Math.max(...xs2);

      const minY2=Math.min(...ys2),maxY2=Math.max(...ys2)||1;

      function toC(x,y){return[pL+(x-minX2)/(maxX2-minX2||1)*gW2,pT+gH2-(y-minY2)/(maxY2-minY2||1)*gH2];}



      offCtx.fillStyle='#f8f9ff';offCtx.fillRect(0,0,OW,OH);

      // Grid

      offCtx.strokeStyle='rgba(139,92,246,.15)';offCtx.lineWidth=1;

      for(let i=0;i<=5;i++){

        const yy=pT+i*(gH2/5);

        offCtx.beginPath();offCtx.moveTo(pL,yy);offCtx.lineTo(OW-pR,yy);offCtx.stroke();

        const xv=minY2+(maxY2-minY2)*((5-i)/5);

        offCtx.fillStyle='#555';offCtx.font='12px monospace';offCtx.textAlign='right';

        offCtx.fillText(xv.toFixed(2),pL-5,yy+4);

      }

      for(let i=0;i<=5;i++){

        const xx=pL+i*(gW2/5);

        offCtx.beginPath();offCtx.moveTo(xx,pT);offCtx.lineTo(xx,pT+gH2);offCtx.stroke();

        const xv=minX2+(maxX2-minX2)*(i/5);

        offCtx.fillStyle='#555';offCtx.font='12px monospace';offCtx.textAlign='center';

        offCtx.fillText(xv.toFixed(2),xx,pT+gH2+18);

      }

      // Axes

      offCtx.strokeStyle='rgba(139,92,246,.7)';offCtx.lineWidth=2;

      offCtx.beginPath();offCtx.moveTo(pL,pT);offCtx.lineTo(pL,pT+gH2);offCtx.lineTo(pL+gW2,pT+gH2);offCtx.stroke();

      // Labels

      const graphLabels2={solar_cell:['V (V)','I (mA)'],hall_effect:['I (mA)','VH (mV)'],single_slit:['Position (mm)','Intensity']};

      const [xLbl,yLbl]=graphLabels2[expKey]||['X','Y'];

      offCtx.fillStyle='#333';offCtx.font='bold 14px sans-serif';offCtx.textAlign='center';

      offCtx.fillText(xLbl,pL+gW2/2,OH-4);

      offCtx.save();offCtx.translate(14,pT+gH2/2);offCtx.rotate(-Math.PI/2);offCtx.fillText(yLbl,0,0);offCtx.restore();

      // Data line with gradient

      const grad2=offCtx.createLinearGradient(pL,0,pL+gW2,0);

      grad2.addColorStop(0,'#8B5CF6');grad2.addColorStop(.5,'#3B82F6');grad2.addColorStop(1,'#06B6D4');

      offCtx.strokeStyle=grad2;offCtx.lineWidth=2.5;offCtx.beginPath();

      const[x0g,y0g]=toC(physGraphData[0].x,physGraphData[0].y);offCtx.moveTo(x0g,y0g);

      physGraphData.forEach(d=>{const[px,py]=toC(d.x,d.y);offCtx.lineTo(px,py);});

      offCtx.stroke();

      // Fill

      offCtx.globalAlpha=.1;offCtx.fillStyle='#8B5CF6';offCtx.beginPath();

      offCtx.moveTo(...toC(physGraphData[0].x,physGraphData[0].y));

      physGraphData.forEach(d=>offCtx.lineTo(...toC(d.x,d.y)));

      offCtx.lineTo(toC(physGraphData[physGraphData.length-1].x,minY2)[0],pT+gH2);

      offCtx.lineTo(toC(physGraphData[0].x,minY2)[0],pT+gH2);offCtx.fill();

      offCtx.globalAlpha=1;

      // Data points

      offCtx.fillStyle='#8B5CF6';

      physGraphData.forEach((d,di)=>{

        if(di%Math.max(1,Math.floor(physGraphData.length/15))===0){

          const[px,py]=toC(d.x,d.y);

          offCtx.beginPath();offCtx.arc(px,py,4,0,Math.PI*2);offCtx.fill();

        }

      });

      // Title

      const graphTitles={solar_cell:'V-I Characteristic Curve of Solar Cell',hall_effect:'Hall Voltage (VH) vs Current (I)',single_slit:'Sinc² Intensity Distribution — Single Slit'};

      offCtx.fillStyle='#222';offCtx.font='bold 15px sans-serif';offCtx.textAlign='center';

      offCtx.fillText(graphTitles[expKey]||exp.name+' Graph',OW/2,14);



      const imgData=offCanvas.toDataURL('image/png');

      const gw=IW,gh=70;

      doc.addImage(imgData,'PNG',M,y,gw,gh);nl(gh+4);

      doc.setFontSize(8);doc.setTextColor(100,100,120);doc.setFont('helvetica','italic');

      doc.text('Fig: '+san(graphTitles[expKey]||exp.name),W/2,y,{align:'center'});nl(8);

    }catch(e){

      bodyText('Graph: '+e.message);

    }

  }



  // ═══ REAL LIFE APPLICATIONS ═══

  doc.addPage();y=20;

  sectionHeader('7. REAL-LIFE APPLICATIONS',11,16,185,129);

  const APPS={

    solar_cell:[

      ['Residential Solar Panels','Silicon solar cells with 15-22% efficiency power millions of homes. A 5 kW rooftop system (about 20 panels) generates ~7,000 kWh/year, saving ~INR 50,000 annually in electricity costs.'],

      ['International Space Station (ISS)','The ISS uses eight solar arrays with 2,500 m2 of silicon solar cells generating 84 kW — the entire station runs on solar power.'],

      ['Solar-Powered Irrigation (India)','PM-KUSUM scheme: 3.5 lakh solar pumps installed for farmers. A 3 HP solar pump replaces 1,200 litres of diesel per year, saving ~INR 72,000.'],

      ['Electric Vehicles (EVs)','Solar cells integrated into car roofs (e.g., Lightyear 0) add 70 km/day of solar range. Toyota Prius uses roof solar for cabin ventilation.'],

      ['Medical Devices','Solar-powered hearing aids, insulin pumps, and remote health monitors in areas without grid power — critical for 800 million people without reliable electricity.'],

      ['ISRO Solar Missions','Chandrayaan-3 lander used solar panels producing 738 W. Aditya-L1 (India\'s solar mission) uses solar cells to study the sun itself.'],

    ],

    hall_effect:[

      ['Brushless DC Motor (BLDC)','Hall effect sensors detect rotor position in BLDC motors used in ceiling fans, electric bikes (e.g., OLA S1), hard drives, and drones — enabling precise commutation without brushes.'],

      ['Anti-lock Braking System (ABS)','Hall sensors measure wheel speed in ABS and traction control systems of every modern car. The sensor generates pulses as teeth on the wheel pass by, allowing <1 ms response time.'],

      ['Smartphone Compass & Lid Detection','Hall sensors detect magnetic field direction for compass apps. In laptops/tablets (e.g., iPad), a Hall sensor detects when the cover closes and auto-locks the screen.'],

      ['Current Sensing in EV Batteries','Hall-effect current sensors measure battery charge/discharge in EVs (Tesla, Nexon EV). They provide galvanic isolation — no direct electrical contact — essential for 400V battery safety.'],

      ['Medical MRI Machines','Hall probes map the 1.5-3 Tesla magnetic field uniformity in MRI scanners. Non-uniformity > 5 ppm causes image artefacts — Hall sensors detect this with nT resolution.'],

      ['DRDO & Defense','Hall sensors in missile guidance systems measure yaw, pitch, and roll via Earth\'s magnetic field. Used in INS/GPS hybrid navigation where GPS is jammed.'],

    ],

    single_slit:[

      ['X-ray Crystallography','The same diffraction principle (with X-rays, lambda ~ 0.1 nm) reveals crystal structures. Rosalind Franklin\'s X-ray diffraction image of DNA (Photo 51) led to the discovery of the double helix.'],

      ['Optical Fibre Bandwidth Testing','Single-slit diffraction measures core diameter of optical fibres (8-50 um) to sub-micron precision. Critical for 5G and broadband infrastructure.'],

      ['Electron Microscopy','Diffraction patterns from electron beams (de Broglie wavelength ~0.004 nm) reveal atomic structure. Resolution 10,000x better than optical microscopes.'],

      ['Holography & Security Holograms','Diffraction gratings (multiple slits) create holograms on currency notes (Indian Rs. 500, US $100), credit cards, and passports — impossible to counterfeit without precise wavelength control.'],

      ['Spectroscopy & Pollution Detection','Diffraction spectrometers analyse light from industrial chimneys, detecting pollutants like SO2 and NO2 at ppb levels. Used by PCB (Pollution Control Board) monitoring stations.'],

      ['ISRO Remote Sensing','Resourcesat-2 and Cartosat satellites use diffraction-limited optics. Knowing lambda and aperture, slit diffraction formulas set the theoretical resolution limit: ~0.5 m ground resolution.'],

    ]

  };

  const apps=APPS[expKey]||[];

  apps.forEach(([title,desc],ai)=>{

    checkPage(22);

    doc.setFillColor(ai%2===0?240:248,255,ai%2===0?245:250);

    doc.roundedRect(M,y-4,IW,18,2,2,'F');

    doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(16,185,129);

    doc.text((ai+1)+'. '+san(title),M+4,y+2);

    doc.setFont('helvetica','normal');doc.setTextColor(40,50,40);doc.setFontSize(8.5);

    const dlines=doc.splitTextToSize(san(desc),IW-8);

    dlines.forEach((dl,dli)=>doc.text(dl,M+6,y+8+dli*5));

    nl(14+Math.max(0,dlines.length-1)*5);

  });



  // ═══ PRECAUTIONS ═══

  checkPage(20);nl(4);

  sectionHeader('8. PRECAUTIONS',11,245,158,11);

  const PREC={

    solar_cell:['Mount the solar cell perpendicular to the lamp to maximise light collection.','Ensure no shadow falls on the cell during readings.','Allow the lamp to warm up for 5 minutes before starting measurements.','Avoid touching the cell surface — fingerprints reduce efficiency.','Take readings quickly to avoid heating effects changing Voc.','Use a calibrated lux meter, zeroed in total darkness.'],

    hall_effect:['Ensure the semiconductor sample is exactly perpendicular to B field.','Keep current constant during each set of VH measurements.','Allow the electromagnet to reach steady-state before recording B.','Reverse current and B field directions to eliminate contact potential errors.','Zero the microvoltmeter before each reading.','Keep the Hall probe at room temperature — mobility changes ~0.5%/K.'],

    single_slit:['Align the slit parallel to the laser beam axis precisely.','Allow the laser to warm up for 10 minutes for stable output.','Take the screen measurement at the same height as the central maximum.','Measure y from the centre of dark fringes, not from bright fringes.','Reduce ambient light to minimise background noise on the screen.','Verify the slit width using a calibrated micrometer before the experiment.']

  };

  const prec=PREC[expKey]||[];

  prec.forEach((p,pi)=>{

    checkPage(9);

    doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(40,40,40);

    doc.text((pi+1)+'. '+san(p),M+3,y,{maxWidth:IW-4});nl(7);

  });



  // ═══ VIVA QUESTIONS ═══

  checkPage(20);nl(4);

  sectionHeader('9. VIVA QUESTIONS',11,139,92,246);

  const VIVA={

    solar_cell:[

      ['What is the photovoltaic effect?','The generation of voltage/current in a material upon exposure to light. Discovered by Edmond Becquerel in 1839.'],

      ['Why is the V-I curve non-linear?','The solar cell follows the diode equation I = Isc - I0*exp(qV/nkT), which is inherently exponential.'],

      ['What is Fill Factor and what is its ideal value?','FF = Pmax/(Voc*Isc). Ideal FF = 1. Practical silicon cells achieve FF = 0.75-0.85.'],

      ['How does temperature affect Voc?','Voc decreases by ~2 mV/K. At 60 deg C a cell loses ~100 mV compared to 25 deg C.'],

      ['Name the types of solar cells.','Monocrystalline Si (22%), Polycrystalline Si (17%), Thin-film CdTe (19%), Perovskite (25.7% record).'],

    ],

    hall_effect:[

      ['State the Hall Effect.','When current-carrying conductor is in perpendicular B field, a transverse voltage (Hall voltage) appears, perpendicular to both current and B.'],

      ['How does Hall Effect determine carrier type?','For n-type: electrons deflect, making the top face negative (VH < 0). For p-type: holes deflect to top face (VH > 0).'],

      ['What is Hall coefficient and its units?','R_H = 1/(nq) in SI units m3/C. Positive for p-type, negative for n-type semiconductors.'],

      ['Why is Germanium preferred over Silicon?','Ge has lower bandgap (0.67 eV vs 1.1 eV), higher carrier mobility (3900 vs 1400 cm2/Vs), giving larger and more measurable Hall voltage.'],

      ['What is quantum Hall effect?','At very low temperatures and high B fields, Hall resistance is quantised in units of h/e2 = 25812.8 Ohm. Used to define the Ohm precisely.'],

    ],

    single_slit:[

      ['State Huygens Principle.','Every point on a wavefront acts as a secondary source of spherical wavelets; the new wavefront is the envelope of these wavelets.'],

      ['What is the condition for the 1st dark fringe?','a*sin(theta) = lambda, or for small angles: y1 = lambda*D/a.'],

      ['Why is the central maximum twice as wide?','The central maximum extends from -y1 to +y1 (distance = 2y1) while secondary maxima span from y1 to y2 (distance = y1).'],

      ['How does decreasing slit width affect the pattern?','Smaller a => larger y1 => wider, more spread diffraction pattern. As a approaches lambda, the beam spreads nearly 180 deg.'],

      ['What is the difference between diffraction and interference?','Diffraction: bending of a single wavefront around an obstacle/slit. Interference: superposition of waves from two or more separate sources.'],

    ]

  };

  const viva=VIVA[expKey]||[];

  viva.forEach((qa,qi)=>{

    checkPage(22);

    doc.setFillColor(248,248,255);doc.roundedRect(M,y-4,IW,16,2,2,'F');

    doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setTextColor(30,30,80);

    doc.text('Q'+(qi+1)+'. '+san(qa[0]),M+3,y+2,{maxWidth:IW-6});

    doc.setFont('helvetica','normal');doc.setTextColor(20,80,20);

    const alines=doc.splitTextToSize('Ans: '+san(qa[1]),IW-8);

    alines.forEach((al,ali)=>doc.text(al,M+6,y+8+ali*5));

    nl(14+Math.max(0,alines.length-1)*5);

  });



  // ═══ CONCLUSION ═══

  checkPage(30);nl(4);

  sectionHeader('10. CONCLUSION',11,6,182,212);

  const CONC={

    solar_cell:`The experiment successfully characterised the V-I and P-V curves of a silicon solar cell under ${physState.lightIntensity} lux illumination. The open-circuit voltage (${(0.55+0.04*Math.log(physState.lightIntensity/100)).toFixed(3)} V) and short-circuit current confirm the photovoltaic behaviour predicted by the diode equation. The fill factor of 0.78 indicates a well-fabricated cell. Efficiency of ${((((physState.lightIntensity/1000)*40+2)*(0.55+0.04*Math.log(physState.lightIntensity/100))*0.78)/(physState.lightIntensity*0.04*0.002)*100).toFixed(1)}% was determined, consistent with commercial silicon solar panels.`,

    hall_effect:`The Hall Effect experiment on n-type Germanium confirmed the n-type nature of the sample (negative Hall voltage). A Hall coefficient R_H = 0.0050 m3/C was determined, giving carrier concentration n = 1.25 x 10^19 /cm3 and mobility mu = 0.050 m2/Vs. These values are consistent with published data for lightly-doped n-Ge. The linear relationship between VH and current I confirms Ohmic behaviour of the sample under the applied field of ${physState.magneticField} T.`,

    single_slit:`The single slit diffraction experiment with a ${physState.slitWidth} mm slit and ${physState.wavelength} nm He-Ne laser at ${physState.screenDistance} cm screen distance produced a clear sinc-squared intensity pattern. The 1st dark fringe at y1 = ${((physState.wavelength*1e-9*physState.screenDistance*1e-2/(physState.slitWidth*1e-3))*1000).toFixed(3)} mm confirms the diffraction formula a*y1 = lambda*D. The experiment validates Huygens' principle and the wave nature of light.`

  };

  bodyText(CONC[expKey]||'Experiment completed successfully.');



  // ═══ FOOTER ═══

  checkPage(20);nl(6);

  doc.setDrawColor(6,182,212);doc.setLineWidth(0.4);doc.line(M,y,W-M,y);nl(5);

  doc.setFontSize(8);doc.setTextColor(150,150,170);doc.setFont('helvetica','normal');

  doc.text('Generated by SciLab AI  |  KKW Institute of Engineering, Nashik  |  '+new Date().toLocaleDateString('en-IN'),W/2,y,{align:'center'});nl(5);

  doc.text('Score: '+physState.score+' points  |  For Educational Purposes Only  |  PhysLab AI v3.0',W/2,y,{align:'center'});



  // Page numbers

  const pageCount=doc.internal.getNumberOfPages();

  for(let i=1;i<=pageCount;i++){

    doc.setPage(i);

    doc.setFontSize(8);doc.setTextColor(150,150,170);

    doc.text('Page '+i+' / '+pageCount,W-M,292,{align:'right'});

    doc.setDrawColor(139,92,246);doc.setLineWidth(0.3);doc.line(M,288,W-M,288);

  }



  doc.save('PhysLab_Report_'+san(exp.name).replace(/[^a-zA-Z0-9_]/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.pdf');

  showToast('✅ Physics PDF Report downloaded!',3000);

}



// ── Physics Graph (Canvas-based) ──

function clearPhysGraph(){

  const canvas=document.getElementById('phys-graph-canvas');if(!canvas)return;

  const ctx=canvas.getContext('2d');

  canvas.width=canvas.offsetWidth||200;canvas.height=160;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle='rgba(7,12,23,.8)';ctx.fillRect(0,0,canvas.width,canvas.height);

  // Draw axes

  ctx.strokeStyle='rgba(139,92,246,.3)';ctx.lineWidth=1;

  ctx.beginPath();ctx.moveTo(30,10);ctx.lineTo(30,canvas.height-20);ctx.lineTo(canvas.width-10,canvas.height-20);ctx.stroke();

}



function animatePhysGraph(data,xLabel,yLabel,durationMs,callback){

  if(typeof durationMs==='function'){callback=durationMs;durationMs=4000;}

  const canvas=document.getElementById('phys-graph-canvas');if(!canvas)return;

  canvas.width=canvas.offsetWidth||200;canvas.height=160;

  const ctx=canvas.getContext('2d');

  const W=canvas.width,H=canvas.height;

  const padL=32,padB=22,padT=10,padR=10;

  const gW=W-padL-padR,gH=H-padT-padB;

  const xs=data.map(d=>d.x),ys=data.map(d=>d.y);

  const minX=Math.min(...xs),maxX=Math.max(...xs);

  const minY=Math.min(...ys),maxY=Math.max(...ys)||1;

  function toCanvas(x,y){

    return[padL+(x-minX)/(maxX-minX||1)*gW,padT+gH-(y-minY)/(maxY-minY||1)*gH];

  }

  const startTime=performance.now();

  function drawFrame(now){

    const elapsed=now-startTime;

    const progress=Math.min(elapsed/durationMs,1);

    ctx.clearRect(0,0,W,H);

    ctx.fillStyle='rgba(7,12,23,.9)';ctx.fillRect(0,0,W,H);

    ctx.strokeStyle='rgba(139,92,246,.1)';ctx.lineWidth=.5;

    for(let i=0;i<=4;i++){

      const yy=padT+i*(gH/4);

      ctx.beginPath();ctx.moveTo(padL,yy);ctx.lineTo(W-padR,yy);ctx.stroke();

    }

    ctx.strokeStyle='rgba(139,92,246,.5)';ctx.lineWidth=1.5;

    ctx.beginPath();ctx.moveTo(padL,padT);ctx.lineTo(padL,padT+gH);ctx.lineTo(padL+gW,padT+gH);ctx.stroke();

    ctx.fillStyle='rgba(148,163,184,.7)';ctx.font='8px monospace';ctx.textAlign='center';

    ctx.fillText(xLabel,padL+gW/2,H-2);

    ctx.save();ctx.translate(8,padT+gH/2);ctx.rotate(-Math.PI/2);ctx.fillText(yLabel,0,0);ctx.restore();

    const pointsToDraw=Math.max(2,Math.ceil(data.length*progress));

    if(pointsToDraw>1){

      const grad=ctx.createLinearGradient(padL,0,padL+gW,0);

      grad.addColorStop(0,'#8B5CF6');grad.addColorStop(.5,'#3B82F6');grad.addColorStop(1,'#06B6D4');

      ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.beginPath();

      const[x0,y0]=toCanvas(data[0].x,data[0].y);ctx.moveTo(x0,y0);

      for(let i=1;i<pointsToDraw;i++){const[x,y]=toCanvas(data[i].x,data[i].y);ctx.lineTo(x,y);}

      ctx.stroke();

      ctx.globalAlpha=.12;ctx.fillStyle='rgba(139,92,246,.4)';ctx.beginPath();

      ctx.moveTo(...toCanvas(data[0].x,data[0].y));

      for(let i=1;i<pointsToDraw;i++){const[x,y]=toCanvas(data[i].x,data[i].y);ctx.lineTo(x,y);}

      ctx.lineTo(toCanvas(data[pointsToDraw-1].x,0)[0],padT+gH);ctx.lineTo(toCanvas(data[0].x,0)[0],padT+gH);ctx.fill();

      ctx.globalAlpha=1;

      const[tipX,tipY]=toCanvas(data[pointsToDraw-1].x,data[pointsToDraw-1].y);

      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(tipX,tipY,3,0,Math.PI*2);ctx.fill();

      ctx.fillStyle='#8B5CF6';ctx.beginPath();ctx.arc(tipX,tipY,2,0,Math.PI*2);ctx.fill();

    }

    if(progress<1)requestAnimationFrame(drawFrame);

    else callback&&callback();

  }

  requestAnimationFrame(drawFrame);

}



function renderPhysObsTable(headers,rows){

  const el=document.getElementById('phys-obs-table');if(!el)return;

  el.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:9px;font-family:var(--fm)">

    <thead><tr>${headers.map(h=>`<th style="padding:4px 6px;background:rgba(139,92,246,.15);color:var(--violet);text-align:left;border-bottom:1px solid rgba(139,92,246,.3)">${h}</th>`).join('')}</tr></thead>

    <tbody>${rows.map((r,i)=>`<tr style="background:${i%2?'rgba(255,255,255,.02)':'transparent'}">${r.map(c=>`<td style="padding:3px 6px;color:var(--text2);border-bottom:1px solid rgba(255,255,255,.04)">${c}</td>`).join('')}</tr>`).join('')}</tbody>

  </table>`;

}



// ── Physics AI Chat ──

function physAddAIMsg(text,isAI=false){
  const msgs=document.getElementById('phys-chat-messages');
  if(!msgs)return;
  const div=document.createElement('div');
  div.style.cssText='display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;'+(isAI?'':'flex-direction:row-reverse');
  const rendered=typeof mdRender==='function'
    ? mdRender(text)
    : text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/\*(.*?)\*/g,'<i>$1</i>').replace(/`(.*?)`/g,'<code style="background:rgba(139,92,246,.15);padding:1px 4px;border-radius:3px;font-family:monospace">$1</code>');
  if(isAI){
    div.innerHTML=`<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">⚡</div><div style="background:var(--card);border:1px solid var(--border2);border-radius:0 12px 12px 12px;padding:10px 13px;font-size:12.5px;line-height:1.65;color:var(--text1);max-width:88%;flex:1">${rendered}</div>`;
  } else {
    div.innerHTML=`<div style="background:linear-gradient(135deg,rgba(139,92,246,.2),rgba(59,130,246,.15));border:1px solid rgba(139,92,246,.3);border-radius:12px 0 12px 12px;padding:9px 12px;font-size:12.5px;color:var(--text1);max-width:82%">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
  if(isAI){
    const rightPanel=document.getElementById('phys-right');
    const dot=document.getElementById('phys-fab-dot');
    if(dot&&rightPanel&&!rightPanel.classList.contains('phys-panel-open')&&window.innerWidth<=900){
      dot.classList.add('show');
    }
  }
}

function physSendChat(){
  const inp=document.getElementById('phys-chat-input');
  if(!inp)return;
  const text=inp.value.trim();
  if(!text)return;
  inp.value='';
  if(typeof autoResize==='function')autoResize(inp);
  physAddAIMsg(text,false);
  physAskAI(text);
}

function physHandleKey(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();physSendChat();}
}

function physQuickAsk(q){
  physAddAIMsg(q,false);
  physAskAI(q);
}

async function physAskAI(userMsg){
  const exp=PHYS_EXPERIMENTS[physState.currentExp];
  if(!exp)return;
  const expResults=physGraphData.length>0
    ? 'Experiment completed. Results: '+(document.getElementById('phys-results-box')?.innerText||'See panel.')
    : 'Experiment not yet run.';
  const systemPrompt=`You are an expert physics professor and virtual lab assistant at KKW Institute of Engineering, Nashik (SPPU affiliated).\nThe student is working on: ${exp.name}\nCurrent settings: ${exp.params.map(p=>p.label+': '+physState[p.stateKey]+' '+p.unit).join(', ')}\nTheory: ${exp.theory.substring(0,500)}\n${expResults}\nHelp with: theory, viva Q&A with model answers, formula derivations, error analysis, real-life applications, calculations, step explanations.\nUse markdown formatting. Be educational and concise. Always relate to this specific experiment.`;

  physChatHistory.push({role:'user',content:userMsg});
  if(physChatHistory.length>12)physChatHistory=physChatHistory.slice(-12);

  const msgs=document.getElementById('phys-chat-messages');
  if(!msgs)return;

  const typingId='phys-typing-'+Date.now();
  const typing=document.createElement('div');
  typing.id=typingId;
  typing.style.cssText='display:flex;gap:8px;align-items:flex-start;margin-bottom:10px';
  typing.innerHTML=`<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">⚡</div><div style="background:var(--card);border:1px solid var(--border2);border-radius:0 12px 12px 12px;padding:10px 13px"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop=msgs.scrollHeight;
  const removeTyping=()=>{const t=document.getElementById(typingId);if(t)t.remove();};

  const apiKey=(window._CHEMLAB_KEY||'').trim();

  if(apiKey&&apiKey.startsWith('sk-ant-')){
    try{
      const resp=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1200,system:systemPrompt,messages:physChatHistory.slice(-12)})
      });
      if(!resp.ok){const err=await resp.json().catch(()=>({}));throw new Error(err?.error?.message||'HTTP '+resp.status);}
      const data=await resp.json();
      const reply=data.content?.find(b=>b.type==='text')?.text||'No response.';
      removeTyping();
      physChatHistory.push({role:'assistant',content:reply});
      physAddAIMsg(reply,true);
    }catch(e){
      removeTyping();
      const local=physLocalChat(userMsg,exp);
      physChatHistory.push({role:'assistant',content:local});
      physAddAIMsg(local+'\n\n---\n> 💡 *Offline mode active. Add your Anthropic API key in Chemistry Lab settings for full AI.*',true);
    }
  } else {
    await new Promise(r=>setTimeout(r,600+Math.random()*500));
    removeTyping();
    const reply=physLocalChat(userMsg,exp);
    physChatHistory.push({role:'assistant',content:reply});
    physAddAIMsg(reply,true);
  }
}

function physLocalChat(msg,exp){
  const q=msg.toLowerCase();
  const expKey=physState.currentExp;

  if(q.match(/\b(aim|objective|purpose|about this|what is this)\b/)){
    return `## 🎯 Aim\n${exp.aim}\n\n## 🔬 Principle\n${exp.theory.substring(0,300)}…\n\n## 📦 Apparatus\n${exp.apparatus||'See the virtual lab setup in the instrument panel.'}`;
  }

  if(q.match(/\b(recommend|recommendation|best setup|suggest|what should i use|apparatus)\b/)){
    const apparatus=(exp.apparatus||[]).map(x=>`- ${x}`).join('\n');
    return `## ✨ AI Lab Recommendation — ${exp.name}\n\n**Recommended apparatus**\n${apparatus}\n\n**My recommendation**\n${exp.recommendation||'Take repeated measurements, calibrate the instruments first, keep one variable controlled, and compare the measured trend with the theoretical model.'}\n\n**Before you run:** check alignment, zero error/calibration and measurement range.`;
  }

  if(q.match(/\b(viva|question|q&a|interview|quiz|test me)\b/) && exp.viva?.length){
    return `## 🎓 Viva — ${exp.name}\n\n${exp.viva.map((qa,i)=>`**Q${i+1}. ${qa[0]}**\n\n**Answer:** ${qa[1]}`).join('\n\n')}`;
  }

  if(q.match(/\b(formula|equation|derivat|express)\b/)){
    const fmls={
      solar_cell:`## 📐 Solar Cell Formulas\n\n**Diode Equation:**\nI = Isc − I₀·exp(qV/nkT)\n\n**Open Circuit Voltage:**\nVoc = (nkT/q)·ln(Isc/I₀ + 1)\n\n**Fill Factor:**\nFF = Pmax / (Voc·Isc)  [ideal ≈ 0.83]\n\n**Efficiency:**\nη = Pmax / Pin × 100%\n\n**Thermal Voltage at 300K:**\nVt = kT/q = 0.02585 V`,
      hall_effect:`## 📐 Hall Effect Formulas\n\n**Hall Voltage:**\nVH = (RH·I·B) / d\n\n**Hall Coefficient:**\nRH = 1/(n·q)  [m³/C]\n\n**Carrier Concentration:**\nn = 1/(RH·q)  [m⁻³]\n\n**Hall Mobility:**\nμH = |RH|/ρ  [m²/Vs]\n\n**Lorentz Force:**\nF = q(v × B)`,
      single_slit:`## 📐 Single Slit Diffraction Formulas\n\n**Dark Fringe Condition:**\na·sinθ = mλ,  m = ±1, ±2, …\n\n**Fringe Position:**\ny_m = mλD / a\n\n**Fringe Width:**\nβ = λD / a\n\n**Central Maximum Width:**\n2y₁ = 2λD / a\n\n**Intensity Distribution:**\nI(θ) = I₀·(sinα/α)²,  α = πa·sinθ/λ`
    };
    return fmls[expKey]||'See the **Formulas** tab above for all equations.';
  }

  if(q.match(/\b(error|source|mistake|precaution|accurate|uncertain|wrong)\b/)){
    const errs={
      solar_cell:`## ⚠️ Sources of Error — Solar Cell\n1. **Shadow/shading** — Even partial shading of one cell drops Isc proportionally. Keep path clear.\n2. **Temperature drift** — Each 1°C rise drops Voc by ~2 mV. Allow thermal equilibrium.\n3. **Lux meter calibration** — ±5% typical; zero it in darkness first.\n4. **Contact resistance** — Loose clips add series resistance, reducing FF.\n5. **Rheostat resolution** — Discrete steps miss exact MPP; take fine readings near peak.\n6. **Non-linearity** — Isc vs lux is non-linear below 100 lux.`,
      hall_effect:`## ⚠️ Sources of Error — Hall Effect\n1. **Misaligned probes** — Offset voltage appears even at B=0; reverse I and B to cancel.\n2. **Temperature dependence** — Mobility μ ∝ T⁻³/² (lattice scattering); keep T constant.\n3. **Magnetoresistance** — At high B, sample resistivity changes, distorting VH.\n4. **Non-uniform B field** — Measure B exactly at sample location with Gauss probe.\n5. **Sample geometry** — Width d must be measured with micrometer (d appears in VH formula).\n6. **Contact resistance** — Ohmic contacts essential; rectifying contacts introduce error.`,
      single_slit:`## ⚠️ Sources of Error — Single Slit\n1. **Slit misalignment** — Slit must be exactly perpendicular to optical axis.\n2. **Parallax error** — Eye must be directly behind the scale when reading y_m.\n3. **Laser warm-up** — Allow 10 min; output power stabilises within ±1%.\n4. **Screen distance D** — ±1 mm error gives ±1% error in calculated slit width.\n5. **Fringe centre** — Dark fringe centre is easier to locate than bright fringe peak.\n6. **Ambient light** — Any stray light raises background, reducing fringe contrast.`
    };
    return errs[expKey]||'Common errors: parallax, calibration drift, alignment, and temperature effects.';
  }

  if(q.match(/\b(viva|question|q&a|interview|ask me|test me|quiz)\b/)){
    const vivas={
      solar_cell:`## 🎓 Viva Questions — Solar Cell\n\n**Q1. What is the photovoltaic effect?**\nAns: Generation of voltage/current in a semiconductor p-n junction when exposed to light. Photons excite electrons from valence to conduction band. Discovered by Edmond Becquerel, 1839.\n\n**Q2. Why does Voc decrease with temperature?**\nAns: Reverse saturation current I₀ increases exponentially with T. Since Voc = (nkT/q)·ln(Isc/I₀), the increase in I₀ dominates and Voc falls ~2 mV/°C.\n\n**Q3. What is Fill Factor?**\nAns: FF = Pmax/(Voc·Isc). Measures how "square" the V-I curve is. Practical Si cells: FF = 0.75–0.85. Higher FF = less resistive losses.\n\n**Q4. What limits solar cell efficiency?**\nAns: Shockley-Queisser limit (~33% for single junction). Losses due to: photons below bandgap not absorbed, excess photon energy lost as heat, recombination.\n\n**Q5. Name types of solar cells.**\nAns: Monocrystalline Si (22%), Polycrystalline Si (17%), Thin-film CdTe (19%), Perovskite (25.7% record, 2024).`,
      hall_effect:`## 🎓 Viva Questions — Hall Effect\n\n**Q1. State the Hall Effect.**\nAns: When a current-carrying conductor is placed in a magnetic field perpendicular to the current, a transverse voltage (VH) appears perpendicular to both current and B. Discovered by E.H. Hall, 1879.\n\n**Q2. How do you identify semiconductor type?**\nAns: n-type: electrons deflect upward → top face −ve → VH < 0. p-type: holes deflect upward → top face +ve → VH > 0. Sign of VH determines carrier type.\n\n**Q3. Why use Germanium instead of Silicon?**\nAns: Ge has higher carrier mobility (μe = 3900 vs 1400 cm²/Vs for Si), giving a larger, more measurable VH. Also lower bandgap (0.67 eV) means more intrinsic carriers at room temperature.\n\n**Q4. What is the Quantum Hall Effect?**\nAns: At very low temperatures and high B fields, Hall resistance is quantised: RH = h/e² = 25812.8 Ω (von Klitzing constant). Used to define the Ohm precisely since 1990.\n\n**Q5. What does the Hall coefficient tell us?**\nAns: RH = 1/(nq). Magnitude gives carrier concentration n; sign gives carrier type (+ve for p-type, −ve for n-type). Units: m³/C.`,
      single_slit:`## 🎓 Viva Questions — Single Slit\n\n**Q1. State Huygens' Principle.**\nAns: Every point on a wavefront acts as a source of secondary spherical wavelets. The new wavefront is the tangential envelope of all secondary wavelets.\n\n**Q2. Condition for dark fringes?**\nAns: a·sinθ = mλ where m = ±1, ±2, … For small angles: y_m = mλD/a. Path difference from opposite edges of slit = integer multiple of λ.\n\n**Q3. Why is the central maximum twice as wide?**\nAns: Central max spans from −y₁ to +y₁ (width = 2y₁). Each secondary maximum spans y_m to y_{m+1} (width = y₁). So central max = 2 × width of secondary maxima.\n\n**Q4. What happens if slit width a → λ?**\nAns: sinθ₁ = λ/a → 1 when a=λ, so θ₁ = 90°. First dark fringe at 90° means light spreads in all directions — maximum possible diffraction.\n\n**Q5. Difference between diffraction and interference?**\nAns: Diffraction = bending/spreading of a single wavefront around an aperture (single source). Interference = superposition of waves from two or more separate coherent sources.`
    };
    return vivas[expKey]||'Ask me a specific question (e.g. "What is Hall coefficient?") and I will answer it fully!';
  }

  if(q.match(/\b(application|real.?life|use|industry|example|where is)\b/)){
    const apps={
      solar_cell:`## 🌍 Real-Life Applications — Solar Cell\n1. **Rooftop Solar (India)** — A 5 kW system saves ₹50,000/year; PM-KUSUM has 3.5 lakh solar pumps for farmers.\n2. **ISRO Chandrayaan-3** — Vikram lander solar panels produce 738 W to power all Moon instruments.\n3. **International Space Station** — 2,500 m² of silicon cells generate 84 kW; entire ISS runs on solar.\n4. **Electric Vehicles** — Lightyear 0 roof solar adds up to 70 km/day of free range.\n5. **Medical Devices** — Solar hearing aids, insulin pumps in areas without grid power.`,
      hall_effect:`## 🌍 Real-Life Applications — Hall Effect\n1. **BLDC Motors** — Hall sensors detect rotor position in fans, OLA S1 e-scooter, drones — enabling brushless commutation.\n2. **ABS Braking** — Hall sensors in every modern car measure wheel speed (30–100 pulses/rev), response <1 ms.\n3. **Smartphone Compass** — Hall sensor detects Earth's ~50 μT field. iPad uses one to detect Smart Cover closure.\n4. **EV Battery BMS** — Measures 400 V pack current with full galvanic isolation for safety.\n5. **MRI Machines** — Hall probes map 1.5–3 T field to 5 ppm uniformity to prevent image artefacts.`,
      single_slit:`## 🌍 Real-Life Applications — Single Slit\n1. **X-ray Crystallography** — Rosalind Franklin's Photo 51 (1952) used X-ray diffraction to discover the DNA double helix.\n2. **Optical Fibre QC** — Slit diffraction measures fibre core diameter (8–50 μm) to sub-micron accuracy for 5G networks.\n3. **Security Holograms** — Diffraction gratings on ₹500 notes, passports, credit cards — impossible to counterfeit.\n4. **Spectroscopy** — Diffraction gratings in spectrometers analyse star composition and detect industrial pollutants.\n5. **ISRO Cartosat-2** — Diffraction limit θ=λ/D determines 0.5 m ground resolution of the satellite telescope.`
    };
    return apps[expKey]||'This experiment has direct applications in modern electronics, space, and medical technology.';
  }

  if(q.match(/\b(theory|explain|principle|mechanism|how does|what happens|why)\b/)){
    return `## 📖 Theory — ${exp.name}\n\n${exp.theory}\n\n---\n*Click the **Theory** tab above for formatted content with diagrams.*`;
  }

  if(q.match(/\b(result|value|reading|output|number|show|what did|observation)\b/)){
    if(physGraphData.length===0){
      return `## ⚠️ No Results Yet\n\nClick **▶ Run Experiment** first!\n\nOnce complete, I can:\n- Interpret all measured values\n- Explain what the graph shape means\n- Compare your results to theory\n- Identify sources of any discrepancy`;
    }
    const res=document.getElementById('phys-results-box')?.innerText||'Check the measurements panel.';
    return `## 📊 Your Results\n\`\`\`\n${res}\n\`\`\`\n\n**Interpretation:** ${
      expKey==='solar_cell'?'The V-I curve shows high Isc at low V (photocurrent region), then a rapid drop near Voc. The knee of the curve is the MPP. Steeper knee = higher FF = better cell quality.':
      expKey==='hall_effect'?'VH is proportional to I (linear graph confirms Ohmic behaviour). Negative VH confirms n-type material. Graph slope = RH·B/d, from which carrier concentration n is extracted.':
      'The sinc² pattern shows a tall central peak with rapidly decreasing side lobes. 2nd maximum intensity ≈ 4.7% of central. Wider slit → narrower pattern (inverse relationship a·β = λD).'
    }\n\nAsk me to explain any specific value!`;
  }

  if(q.match(/\b(step|procedure|how to perform|method|protocol|conduct)\b/)){
    const steps={
      solar_cell:`## 📋 Procedure — Solar Cell\n1. **Setup** — Mount solar cell facing halogen lamp on optical bench. Record distance.\n2. **Connect circuit** — Voltmeter in parallel, ammeter in series, rheostat as variable load.\n3. **Set intensity** — Switch on lamp; record lux meter reading.\n4. **Record Isc** — Rheostat at minimum (short circuit). Record max current.\n5. **Record Voc** — Remove load (open circuit). Record max voltage.\n6. **V-I sweep** — Vary rheostat; record 15–20 (V, I) pairs.\n7. **Calculate** — Plot V-I curve, find Pmax = max(V×I), compute FF and η.`,
      hall_effect:`## 📋 Procedure — Hall Effect\n1. **Setup** — Mount n-Ge sample in Hall probe holder between electromagnet poles.\n2. **Apply B field** — Energise electromagnet; measure B with Gauss meter at sample position.\n3. **Apply current** — Connect constant current source; set I = 50 mA.\n4. **Measure VH** — Record Hall voltage with microvoltmeter (transverse contacts).\n5. **Vary current** — Repeat for I = 20, 40, 60, …, 200 mA.\n6. **Reverse check** — Reverse I, verify VH reverses (confirms Hall effect, not contact potential).\n7. **Calculate** — Plot VH vs I; slope = RH·B/d. Compute n and μH.`,
      single_slit:`## 📋 Procedure — Single Slit\n1. **Align** — Mount laser, single slit, and screen on optical bench. Align to common axis.\n2. **Set distance** — Place screen at D = 100 cm. Record D precisely.\n3. **Warm up** — Switch on He-Ne laser; allow 10 min for stability.\n4. **Observe pattern** — Adjust slit width until clear diffraction pattern appears.\n5. **Measure fringes** — Record y_m for dark fringes m = 1, 2, 3, 4 from centre.\n6. **Repeat** — Change D or slit width; repeat measurements.\n7. **Calculate** — Plot y_m vs m (slope = λD/a). Calculate a and verify.`
    };
    return steps[expKey]||'See the **Steps** section in the left panel for detailed procedure.';
  }

  if(q.match(/\b(calculat|comput|find|determin|numer|solve|work out)\b/)){
    const calcs={
      solar_cell:()=>{
        const E=physState.lightIntensity;
        const Isc=((E/1000)*40+2).toFixed(3);
        const Voc=(0.55+0.04*Math.log(E/100)).toFixed(4);
        const Pmax=(parseFloat(Isc)*parseFloat(Voc)*0.78).toFixed(4);
        const eta=((parseFloat(Pmax)/1000/(E*0.04*0.002))*100).toFixed(2);
        return `## 🔢 Sample Calculation (E=${E} lux)\n\n**Step 1 — Short Circuit Current:**\nIsc = (E/1000)×40 + 2 = **${Isc} mA**\n\n**Step 2 — Open Circuit Voltage:**\nVoc = 0.55 + 0.04×ln(E/100) = **${Voc} V**\n\n**Step 3 — Maximum Power:**\nPmax = Voc × Isc × FF = ${Voc} × ${Isc} × 0.78 = **${Pmax} mW**\n\n**Step 4 — Efficiency:**\nPin = E × Area = ${E} × 0.04 × 0.002 = ${(E*0.04*0.002).toFixed(4)} W\nη = Pmax/Pin × 100 = **${eta} %**`;
      },
      hall_effect:()=>{
        const B=physState.magneticField;
        const Imv=physState.current;
        const I=(Imv/1000).toFixed(3);
        const VH=((0.005*parseFloat(I)*B/0.001)*1000).toFixed(4);
        const n=(1/(0.005*1.6e-19)/1e20).toFixed(3);
        return `## 🔢 Sample Calculation (B=${B}T, I=${Imv}mA)\n\n**Step 1 — Hall Voltage:**\nVH = RH×I×B/d = 0.005×${I}×${B}/0.001 = **${VH} mV**\n\n**Step 2 — Carrier Concentration:**\nn = 1/(RH×q) = 1/(0.005×1.6×10⁻¹⁹) = **${n}×10²⁰ /m³**\n\n**Step 3 — Mobility:**\nμH = RH/ρ = 0.005/0.1 = **0.05 m²/Vs**\n\n✅ VH < 0 confirms **n-type** semiconductor.`;
      },
      single_slit:()=>{
        const a=physState.slitWidth;
        const lam=physState.wavelength;
        const D=physState.screenDistance;
        const y1=((lam*1e-9*D*1e-2/(a*1e-3))*1000).toFixed(3);
        return `## 🔢 Sample Calculation (a=${a}mm, λ=${lam}nm, D=${D}cm)\n\n**Step 1 — 1st Dark Fringe (m=1):**\ny₁ = λD/a = (${lam}×10⁻⁹ × ${D}×10⁻²) / (${a}×10⁻³) = **${y1} mm**\n\n**Step 2 — Fringe Width:**\nβ = y₁ = **${y1} mm**\n\n**Step 3 — Central Maximum Width:**\n2y₁ = 2 × ${y1} = **${(parseFloat(y1)*2).toFixed(3)} mm**\n\n**Step 4 — Verify Slit Width:**\na_calc = λD/y₁ = **${a} mm** ✓`;
      }
    };
    const fn=calcs[expKey];
    return fn ? fn() : 'Set your parameters with the sliders, then ask me to calculate!';
  }

  if(q.match(/^(hi|hello|hey|namaste|good\s|hii|helo|greet)/)){
    return `👋 **Hello! I am your PhysLab AI assistant.**\n\nI am here to help you with **${exp.name}**.\n\nTry asking me:\n- "What are the formulas?"\n- "Give me 5 viva questions"\n- "Sources of error"\n- "Real-life applications"\n- "Show me the calculation"\n- "Explain the theory"\n\nOr type any question! 🔬`;
  }

  const keyFormula={solar_cell:'**η = Pmax/Pin × 100%** | **FF = Pmax/(Voc·Isc)**',hall_effect:'**VH = RH·I·B/d** | **n = 1/(RH·q)**',single_slit:'**y_m = mλD/a** | **I(θ) = I₀(sinα/α)²**'};
  const formulaText=keyFormula[expKey]||'See Formulas tab';
  return `## ⚡ ${exp.name} — Quick Help\n\n**Aim:** ${exp.aim}\n\n**Key Formula:** ${formulaText}\n\n**AI Recommendation:** ${exp.recommendation||'Use calibrated instruments, repeat readings and compare your graph with theory.'}\n\n**I can help with:**\n- 📐 Formulas & derivations\n- 🎓 Viva questions with model answers\n- ⚠️ Sources of error & precautions\n- 🔢 Step-by-step calculation with your values\n- 🌍 Real-life applications with examples\n- 📋 Experimental procedure\n- 📊 Result interpretation\n\nJust ask anything! 🔬`;
}

function switchPhysTab(tab){
  const panels={chat:'flex',theory:'block',formula:'block',viva:'block',recommend:'block'};
  Object.keys(panels).forEach(t=>{
    const p=document.getElementById('phys-'+t+'-panel');
    if(p)p.style.display=(t===tab)?panels[t]:'none';
    const btn=document.getElementById('phys-tab-'+t);
    if(btn)btn.classList.toggle('active',t===tab);
  });
}

// ── footer update ──

const fy=document.getElementById('footer-year');if(fy)fy.textContent='© '+new Date().getFullYear();


/* =========================================================
   UI POLISH — GSAP only, no experiment/application logic changed.
   ========================================================= */
(function initFriendlyGSAP(){
  function ready(){
    if(!window.gsap) return;
    if(window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animate = (selector, vars, triggerStart='top 88%') => {
      document.querySelectorAll(selector).forEach((el, i)=>{
        if(el.dataset.uiGsap==='1') return;
        el.dataset.uiGsap='1';
        gsap.fromTo(el,
          {opacity:0, y:24, ...((vars&&vars.from)||{})},
          {opacity:1, y:0, duration:.72, delay:Math.min(i*.07,.35), ease:'power3.out',
            ...(vars&&vars.to||{}),
            scrollTrigger: window.ScrollTrigger ? {trigger:el,start:triggerStart,once:true} : undefined}
        );
      });
    };

    animate('.feat-card', {to:{y:0}});
    animate('.rxn-pill', {from:{y:18,scale:.97},to:{y:0,scale:1,duration:.55}}, 'top 92%');
    animate('.step-box', {from:{y:20,scale:.98},to:{y:0,scale:1}}, 'top 90%');
    animate('.section-label', {from:{x:-18,y:0},to:{x:0,y:0,duration:.55}}, 'top 92%');

    const stats=document.querySelectorAll('.hstat');
    if(stats.length && !document.body.dataset.statsGsap){
      document.body.dataset.statsGsap='1';
      gsap.from(stats,{opacity:0,y:18,scale:.94,duration:.65,stagger:.08,delay:.65,ease:'back.out(1.5)'});
    }

    document.querySelectorAll('.btn-hero,.nav-cta').forEach(btn=>{
      if(btn.dataset.uiHover==='1') return;
      btn.dataset.uiHover='1';
      btn.addEventListener('mouseenter',()=>gsap.to(btn,{y:-2,scale:1.015,duration:.2,ease:'power2.out'}));
      btn.addEventListener('mouseleave',()=>gsap.to(btn,{y:0,scale:1,duration:.25,ease:'power2.out'}));
    });

    // Give the science illustration a gentle breathing motion without changing its SVG logic.
    const art=document.querySelector('.hero-visual');
    if(art && !art.dataset.uiFloat){
      art.dataset.uiFloat='1';
      gsap.to(art,{y:-8,duration:2.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
    }

    if(window.ScrollTrigger) ScrollTrigger.refresh();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,120),{once:true});
  else setTimeout(ready,120);
})();
