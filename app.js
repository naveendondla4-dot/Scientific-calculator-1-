const $=id=>document.getElementById(id);
let mode="login", angle="DEG", expr="", ans=0, deferredPrompt=null;
const USERS="sc_users_v1", SESSION="sc_session_v1", HIST="sc_history_v1";
function users(){return JSON.parse(localStorage.getItem(USERS)||"[]")}
function saveUsers(x){localStorage.setItem(USERS,JSON.stringify(x))}
function session(){return JSON.parse(localStorage.getItem(SESSION)||"null")}
function history(){let s=session();return s?JSON.parse(localStorage.getItem(HIST+"_"+s.email)||"[]"):[]}
function saveHistory(h){let s=session();if(s)localStorage.setItem(HIST+"_"+s.email,JSON.stringify(h))}
function setMode(m){mode=m;$("loginTab").classList.toggle("active",m==="login");$("registerTab").classList.toggle("active",m==="register");$("auth").classList.toggle("registering",m==="register");$("authBtn").textContent=m==="login"?"Login":"Create Account";$("authMsg").textContent=""}
$("loginTab").onclick=()=>setMode("login");$("registerTab").onclick=()=>setMode("register");
$("authForm").onsubmit=e=>{e.preventDefault();let email=$("email").value.trim().toLowerCase(),pw=$("password").value,us=users();
 if(mode==="register"){let name=$("name").value.trim();if(!name)return $("authMsg").textContent="Enter your name.";if(us.some(u=>u.email===email))return $("authMsg").textContent="Account already exists.";us.push({name,email,password:pw});saveUsers(us);localStorage.setItem(SESSION,JSON.stringify({name,email}));showApp()}
 else{let u=us.find(x=>x.email===email&&x.password===pw);if(!u)return $("authMsg").textContent="Invalid email or password.";localStorage.setItem(SESSION,JSON.stringify({name:u.name,email:u.email}));showApp()}};
function showApp(){let s=session();if(!s)return;$("auth").classList.add("hidden");$("app").classList.remove("hidden");$("welcome").textContent="Welcome, "+s.name;renderHistory()}
$("logoutBtn").onclick=()=>{localStorage.removeItem(SESSION);location.reload()};
function update(){ $("expression").textContent=expr; $("result").textContent=expr?preview(expr):"0"}
function preview(x){try{let v=calculate(x);return format(v)}catch{return ""}}
function format(v){if(typeof v!=="number"||!isFinite(v))return "Error";return Math.abs(v)>=1e12||Math.abs(v)<1e-9&&v!==0?v.toExponential(8):String(Number(v.toFixed(12)))}
function fact(n){if(n<0||n%1)return NaN;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function calculate(x){let s=x.replaceAll("×","*").replaceAll("÷","/").replaceAll("π","Math.PI").replace(/\be\b/g,"Math.E").replaceAll("√(","sqrt(").replaceAll("^","**").replace(/(\d+(?:\.\d+)?)%/g,"($1/100)").replace(/\bAns\b/g,String(ans));
 s=s.replace(/\bsin\(/g,"sin(").replace(/\bcos\(/g,"cos(").replace(/\btan\(/g,"tan(").replace(/\basin\(/g,"asin(").replace(/\bacos\(/g,"acos(").replace(/\batan\(/g,"atan(").replace(/\blog\(/g,"log10(").replace(/\bln\(/g,"Math.log(");
 s=s.replace(/(\d+(?:\.\d+)?)x²/g,"($1**2)").replace(/(\d+(?:\.\d+)?)x³/g,"($1**3)").replace(/(\d+(?:\.\d+)?)!/g,"fact($1)").replace(/(\d+(?:\.\d+)?)1\/x/g,"(1/$1)");
 const rad=v=>angle==="DEG"?v*Math.PI/180:v, inv=v=>angle==="DEG"?v*180/Math.PI:v;
 const sin=v=>Math.sin(rad(v)),cos=v=>Math.cos(rad(v)),tan=v=>Math.tan(rad(v)),asin=v=>inv(Math.asin(v)),acos=v=>inv(Math.acos(v)),atan=v=>inv(Math.atan(v)),sqrt=v=>Math.sqrt(v),log10=v=>Math.log10(v);
 if(!/^[0-9+\-*/().\sA-Za-z_]*$/.test(s))throw 0;
 return Function("fact","sin","cos","tan","asin","acos","atan","sqrt","log10",'"use strict";return ('+s+')')(fact,sin,cos,tan,asin,acos,atan,sqrt,log10)
}
document.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{let v=b.dataset.v;if(v==="1/x"){expr=expr?`1/(${expr})`:"1/("}else if(v==="x²"){expr+= "^2"}else if(v==="x³"){expr+="^3"}else if(v==="(-"){expr=expr?`(-${expr})`:"-("}else if(v==="⌫"){expr=expr.slice(0,-1)}else expr+=v;update()});
$("ac").onclick=()=>{expr="";update()};$("del").onclick=()=>{expr=expr.slice(0,-1);update()};
$("equals").onclick=()=>{if(!expr)return;try{let v=calculate(expr);ans=v;let h=history();h.unshift({ex:expr,re:format(v)});saveHistory(h.slice(0,50));expr=format(v);update();renderHistory()}catch{ $("result").textContent="Error"}};
$("angleBtn").onclick=()=>{angle=angle==="DEG"?"RAD":"DEG";$("angleBtn").textContent=angle;update()};
$("themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("sc_theme",document.body.classList.contains("light")?"light":"dark");$("themeBtn").textContent=document.body.classList.contains("light")?"🌙":"☀️"};
$("historyToggle").onclick=()=>document.body.classList.toggle("show-history");
$("clearHistory").onclick=()=>{saveHistory([]);renderHistory()};
function renderHistory(){let h=history();$("historyList").innerHTML=h.length?h.map((a,i)=>`<div class="history-item" data-i="${i}"><div class="ex">${a.ex}</div><div class="re">= ${a.re}</div></div>`).join(""):"<p>No calculations yet.</p>";document.querySelectorAll(".history-item").forEach(x=>x.onclick=()=>{expr=h[x.dataset.i].ex;update()})}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("installBtn").classList.add("hidden")}};
if(localStorage.getItem("sc_theme")==="light"){$("app").classList.add("light");document.body.classList.add("light");$("themeBtn").textContent="🌙"}
if(session())showApp(); else setMode("login");
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
