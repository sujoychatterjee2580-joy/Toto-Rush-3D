(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var V=[{n:'Yellow Toto',p:0,c:0xffc107,r:0x2e7d32},{n:'Red Toto',p:100,c:0xe53935,r:0x212121},{n:'Blue Toto',p:250,c:0x1e88e5,r:0xffffff},{n:'Pink Toto',p:500,c:0xec407a,r:0x6a1b9a},{n:'Gold Toto',p:1000,c:0xffd54f,r:0xb71c1c}];
var Z=[{sky:0x87ceeb,gr:0x6aa84f,rd:0x6d5a4a,nm:'Village Road'},{sky:0x9fb4c4,gr:0x8a8a8a,rd:0x3a3a3a,nm:'City Streets'},{sky:0xffb870,gr:0xc9b79c,rd:0x2f3a42,nm:'Kolkata Roads'}];
var LX=[-1.5,0,1.5];
var S={coins:0,pts:0,best:0,sel:0,own:[0],name:'',runs:[],mute:false};
try{var j=JSON.parse(localStorage.getItem('trs')||'{}');for(var k in j)S[k]=j[k]}catch(e){}
function save(){try{localStorage.setItem('trs',JSON.stringify(S))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
var play=false,E=[],B=[],D=[],lane=1,px=0,py=0,vy=0,dist=0,cn=0,boost=0,shield=false,acc=0,sacc=0,zone=0,T=null,bt=0;
// ---------- 3D setup ----------
var cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});
R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.shadowMap.enabled=true;
var sc=new THREE.Scene();sc.fog=new THREE.Fog(0x87ceeb,25,85);
var cam=new THREE.PerspectiveCamera(60,1,.1,200);
function rs(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.fov=innerWidth<innerHeight?80:60;cam.updateProjectionMatrix();cam.position.set(0,4.6,8.2);cam.lookAt(0,.6,-7)}
addEventListener('resize',rs);rs();
var sun=new THREE.DirectionalLight(0xfff4e0,.9);sun.position.set(6,14,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
var sh=sun.shadow.camera;sh.left=-7;sh.right=7;sh.top=12;sh.bottom=-12;sh.near=1;sh.far=45;sc.add(sun);
sc.add(new THREE.HemisphereLight(0xcfe8ff,0x886644,.7));
var BG=new THREE.BoxGeometry(1,1,1),CG=new THREE.CylinderGeometry(.5,.5,1,14),SG=new THREE.SphereGeometry(.5,14,10);
var MC={};function M(c){return MC[c]||(MC[c]=new THREE.MeshStandardMaterial({color:c,roughness:.6,metalness:.1}))}
var PM={};function P(c){return PM[c]||(PM[c]=new THREE.MeshBasicMaterial({color:c}))}
var CM=new THREE.MeshStandardMaterial({color:0xffc107,metalness:.8,roughness:.3,emissive:0x554400});
function mk(g,c,w,h,d,x,y,z,p){var m=new THREE.Mesh(g,M(c));m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;p.add(m);return m}
function wheel(c,w,h,d,x,y,z,p){var m=mk(CG,c,w,h,d,x,y,z,p);m.rotation.z=Math.PI/2;return m}
var G=new THREE.Mesh(new THREE.PlaneGeometry(80,300),new THREE.MeshStandardMaterial({color:0x6aa84f}));G.rotation.x=-Math.PI/2;G.position.set(0,-.03,-100);G.receiveShadow=true;sc.add(G);
var Rd=new THREE.Mesh(new THREE.PlaneGeometry(5.2,300),new THREE.MeshStandardMaterial({color:0x6d5a4a}));Rd.rotation.x=-Math.PI/2;Rd.position.set(0,0,-100);Rd.receiveShadow=true;sc.add(Rd);
[-2.5,2.5].forEach(function(x){var e=new THREE.Mesh(BG,M(0xffffff));e.scale.set(.1,.02,300);e.position.set(x,.02,-100);sc.add(e)});
[-.75,.75].forEach(function(x){for(var i=0;i<10;i++){var d=new THREE.Mesh(BG,M(0xffffff));d.scale.set(.1,.02,3);d.position.set(x,.02,-i*10);sc.add(d);D.push(d)}});
var SH=new THREE.Mesh(SG,new THREE.MeshBasicMaterial({color:0x00e5ff,transparent:true,opacity:.3}));SH.scale.set(2.2,2.2,2.2);SH.position.y=.9;
// ---------- models ----------
function toto(v){var g=new THREE.Group();
mk(BG,v.c,1,.5,1.3,0,.45,0,g);mk(BG,0x37474f,.84,.5,.08,0,.95,.5,g);
[[-.5,.5],[.5,.5],[-.5,-.5],[.5,-.5]].forEach(function(p){mk(BG,v.r,.06,.7,.06,p[0],1,p[1],g)});
mk(BG,v.r,1.15,.08,1.3,0,1.38,0,g);
mk(BG,0xff1744,.14,.1,.04,-.38,.45,.66,g);mk(BG,0xff1744,.14,.1,.04,.38,.45,.66,g);mk(BG,0xffffff,.3,.12,.03,0,.35,.66,g);
[[-.55,.35],[.55,.35],[0,-.55]].forEach(function(p){wheel(0x111111,.5,.18,.5,p[0],.25,p[1],g)});
return g}
function buildToto(){if(T)sc.remove(T);T=toto(V[S.sel]);T.add(SH);sc.add(T)}
function coin(){var g=new THREE.Group(),m=new THREE.Mesh(CG,CM);m.scale.set(.5,.1,.5);m.rotation.x=Math.PI/2;m.position.y=.7;m.castShadow=true;g.add(m);return g}
function pwr(c){var g=new THREE.Group(),m=new THREE.Mesh(SG,P(c));m.scale.set(.7,.7,.7);m.position.y=.9;g.add(m);return g}
function tall(){var g=new THREE.Group(),v=Math.random()<.5;
if(zone===0){mk(BG,0x6d4c41,1.2,.35,1.7,0,.5,0,g);mk(BG,0xfdd835,1.05,.75,1.3,0,1.05,0,g);[-.62,.62].forEach(function(x){wheel(0x3e2723,.8,.15,.8,x,.4,0,g)})}
else{var c=zone===1?(v?0xe53935:0x3949ab):(v?0x1976d2:0xffc107);mk(BG,c,1.2,1.2,2.4,0,.85,0,g);mk(BG,0x90a4ae,1.22,.4,2,0,1.15,0,g);
[-.6,.6].forEach(function(x){wheel(0x111111,.55,.15,.55,x,.28,.7,g);wheel(0x111111,.55,.15,.55,x,.28,-.7,g)})}
return g}
function low(){var g=new THREE.Group();
if(zone===0)mk(BG,0xfbc02d,1.2,.5,.8,0,.25,0,g);
else{mk(BG,zone===1?0xff6f00:0xffeb3b,1.25,.3,.3,0,.55,0,g);mk(BG,0xeeeeee,.25,.3,.32,-.35,.55,0,g);mk(BG,0xeeeeee,.25,.3,.32,.35,.55,0,g);mk(BG,0x616161,.1,.5,.1,-.5,.25,0,g);mk(BG,0x616161,.1,.5,.1,.5,.25,0,g)}
return g}
function spawnB(){var s=Math.random()<.5?-1:1,g=new THREE.Group();
if(zone===0){mk(CG,0x5d4037,.3,1.2,.3,0,.6,0,g);mk(SG,0x2e7d32,1.8,1.8,1.8,0,1.9,0,g)}
else{var h=3+Math.random()*5,cl=zone===1?[0x607d8b,0x78909c,0x546e7a]:[0xffcc80,0xf48fb1,0x80cbc4];
mk(BG,cl[Math.random()*3|0],2.2,h,2.2,0,h/2,0,g);mk(BG,0xfff59d,1.6,.4,.05,0,h*.6,1.12,g)}
g.position.set(s*(4+Math.random()*3),0,-95);sc.add(g);B.push({m:g,z:-95})}
function add(t,l,z){var m=t===0?coin():t===1?pwr(0xff6d00):t===2?pwr(0x00e5ff):t===3?tall():low();m.position.set(LX[l],0,z);sc.add(m);E.push({m:m,t:t,l:l,z:z})}
function row(){var r=Math.random()*10|0,ln=[0,1,2].sort(function(){return Math.random()-.5}),z=-90;
if(r<4){var n=1+(Math.random()*2|0),ty=Math.random()<.35?4:3;for(var i=0;i<n;i++)add(ty,ln[i],z);if(Math.random()<.5)add(0,ln[n],z)}
else if(r<8){for(var q=0;q<5;q++)add(0,ln[0],z-q*2.2)}
else if(r===8)add(Math.random()<.5?1:2,ln[0],z)}
// ---------- audio ----------
var AC=null,mt=null,mi=0,NOTES=[261,329,392,523,392,329,293,349,440,587,440,349];
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,ty,v){var a=AC;if(!a||S.mute)return;var o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.08,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d)}
function music(){if(mt)return;mt=setInterval(function(){if(S.mute||!AC)return;var n=NOTES[mi%NOTES.length];tone(n,.28,'triangle',.05);if(mi%4===0)tone(n/2,.5,'sine',.07);mi++},230)}
// ---------- game flow ----------
function ban(){var b=$('ban');b.style.display='block';clearTimeout(bt);bt=setTimeout(function(){b.style.display='none'},2200)}
function applyZone(z,q){var o=Z[z];sc.background=new THREE.Color(o.sky);sc.fog.color.set(o.sky);G.material.color.set(o.gr);Rd.material.color.set(o.rd);if(!q){$('ban').textContent=o.nm;ban()}}
var OV=['menu','shop','rank','over'];
function go(id){OV.forEach(function(o){$(o).classList.toggle('on',o===id)});var p=id==='';$('hud').style.display=p?'flex':'none';$('pad').style.display=p?'flex':'none';if(id==='menu')menuUI();if(id==='shop')shopUI();if(id==='rank')rankUI()}
function menuUI(){$('wl').textContent='Wallet: '+S.pts+' points  |  Coins: '+S.coins+'  |  Best: '+S.best+' m'}
function shopUI(){var h='<h1 style="font-size:32px">Shop</h1><b>Coins: '+S.coins+'</b>';
V.forEach(function(v,i){var own=S.own.indexOf(i)>=0,sel=S.sel===i;h+='<div class="row"><span>'+v.n+'</span>'+(sel?'<button disabled>In use</button>':'<button data-i="'+i+'">'+(own?'Use':'Buy '+v.p)+'</button>')+'</div>'});
$('shop').innerHTML=h+'<button data-b="menu">Back</button>'}
function rankUI(){var h='<h1 style="font-size:32px">Ranking</h1><div>Top runs on this device</div>';
S.runs.forEach(function(r,i){h+='<div class="row"><span>'+(i+1)+'. '+esc(r.n)+'</span><b>'+r.d+' m</b></div>'});
if(!S.runs.length)h+='<div>No runs yet</div>';
$('rank').innerHTML=h+'<div style="opacity:.7;font-size:14px">Online ranking: coming next</div><button data-b="menu">Back</button>'}
$('shop').onclick=function(e){var t=e.target,b=t.getAttribute('data-b'),i=t.getAttribute('data-i');
if(b){go('menu');return}if(i===null)return;i=+i;var v=V[i];
if(S.own.indexOf(i)<0){if(S.coins<v.p){t.textContent='Need coins';return}S.coins-=v.p;S.own.push(i)}
S.sel=i;save();buildToto();shopUI()};
$('rank').onclick=function(e){if(e.target.getAttribute('data-b'))go('menu')};
function reset(){E.forEach(function(e){sc.remove(e.m)});E=[];lane=1;px=0;py=0;vy=0;dist=0;cn=0;boost=0;shield=false;acc=0;zone=0;applyZone(0)}
function start(){ac();music();S.name=($('nm').value||'Player').slice(0,12);save();reset();go('');play=true}
function end(){play=false;var m=Math.floor(dist),pts=m+cn*5;S.coins+=cn;S.pts+=pts;if(m>S.best)S.best=m;
S.runs.push({n:S.name||'Player',d:m});S.runs.sort(function(a,b){return b.d-a.d});S.runs=S.runs.slice(0,10);save();tone(120,.5,'sawtooth',.12);
$('res').innerHTML='Distance: '+m+' m<br>Coins: '+cn+'<br>Points earned: '+pts+'<br><b>Wallet: '+S.pts+' points</b>';go('over')}
function mv(d){if(play)lane=Math.max(0,Math.min(2,lane+d))}
function jp(){if(play&&py<=.001)vy=8}
function pw(){tone(660,.15,'triangle',.08);tone(990,.2,'triangle',.06)}
function upd(dt){
var sp=play?Math.min(14+dist/80,26):7;if(boost>0)sp*=1.5;var d=sp*dt;
D.forEach(function(m){m.position.z+=d;if(m.position.z>10)m.position.z-=100});
for(var b=B.length-1;b>=0;b--){var o=B[b];o.z+=d;o.m.position.z=o.z;if(o.z>12){sc.remove(o.m);B.splice(b,1)}}
sacc+=d;if(sacc>=8){sacc=0;spawnB()}
if(!play)return;
dist+=d;var nz=Math.floor(dist/600)%3;if(nz!==zone){zone=nz;applyZone(nz)}
acc+=d;if(acc>=10){acc=0;row()}
for(var i=E.length-1;i>=0;i--){var e=E[i];e.z+=d;e.m.position.z=e.z;if(e.t<3)e.m.rotation.y+=dt*4;
if(e.z>-1.4&&e.z<1.2&&Math.abs(LX[e.l]-px)<.8){var rm=false;
if(e.t===0){cn++;tone(880,.08,'square',.05);rm=true}
else if(e.t===1){boost=4;pw();rm=true}
else if(e.t===2){shield=true;pw();rm=true}
else if(!(e.t===4&&py>.6)){if(boost>0||shield){if(boost<=0)shield=false;rm=true;tone(200,.2,'sawtooth',.1)}else{end();return}}
if(rm){sc.remove(e.m);E.splice(i,1);continue}}
if(e.z>8){sc.remove(e.m);E.splice(i,1)}}
px+=(LX[lane]-px)*Math.min(1,dt*12);
if(py>0||vy>0){vy-=24*dt;py+=vy*dt;if(py<=0){py=0;vy=0}}
T.position.set(px,py,0);T.rotation.z=(px-LX[lane])*.2;SH.visible=shield;
if(boost>0)boost-=dt;
$('sc').textContent=Math.floor(dist)+' m';$('co').textContent='\u25CF '+cn;$('st').textContent=(boost>0?'Boost '+Math.ceil(boost):'')+(shield?' Shield':'')}
var last=0;
function loop(t){requestAnimationFrame(loop);var dt=Math.min((t-last)/1000,.05);last=t;if(!(dt>0))return;upd(dt);R.render(sc,cam)}
// ---------- controls ----------
var sx=0,sy=0;
cv.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY});
cv.addEventListener('pointerup',function(e){var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>30&&Math.abs(dx)>Math.abs(dy))mv(dx>0?1:-1);else if(dy<-30)jp()});
$('bl').onpointerdown=function(e){e.preventDefault();mv(-1)};
$('br').onpointerdown=function(e){e.preventDefault();mv(1)};
$('bj').onpointerdown=function(e){e.preventDefault();jp()};
addEventListener('keydown',function(e){if(e.key==='ArrowLeft')mv(-1);else if(e.key==='ArrowRight')mv(1);else if(e.key==='ArrowUp'||e.key===' ')jp()});
$('bp').onclick=start;$('pa').onclick=start;
$('bsh').onclick=function(){go('shop')};$('brk').onclick=function(){go('rank')};$('pm').onclick=function(){go('menu')};
$('bmu').onclick=function(){S.mute=!S.mute;save();$('bmu').textContent=S.mute?'Music: Off':'Music: On'};
$('bmu').textContent=S.mute?'Music: Off':'Music: On';$('nm').value=S.name||'';
buildToto();applyZone(0,true);menuUI();requestAnimationFrame(loop);
})();
