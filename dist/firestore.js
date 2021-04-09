function e(a){const[s]=Object.keys(a),n=a[s];switch(s){case"mapValue":return t(n.fields);case"arrayValue":return n.values.map((t=>e(t)));case"integerValue":return+n;case"timestampValue":return new Date(n);default:return n}}function t(t){const a={};for(const s of Object.keys(t))a[s]=e(t[s]);return a}function a(e){if(Array.isArray(e))return e.map((e=>a(e)));if(e.fields)return t(e.fields);if(e.documents){return{documents:e.documents.map((e=>a(e))),nextPageToken:e.nextPageToken}}return e.document?a(e.document):void 0}function s(e){const t=typeof e;return"number"===t?Number.isInteger(e)?{integerValue:String(e)}:{doubleValue:e}:"boolean"===t?{booleanValue:e}:null===e?{nullValue:null}:e instanceof Date?{timestampValue:e.toISOString()}:"string"===t?e.match(/projects\/.*?\/databases\/.*?\/documents\//)?{referenceValue:e}:{stringValue:e}:Array.isArray(e)?{arrayValue:{values:e.map((e=>s(e)))}}:e.latitude&&e.longitude&&2===Object.keys(e).length?{geoPointValue:e}:{mapValue:n(e)}}function n(e){const t={};for(const a of Object.keys(e))t[a]=s(e[a]);return{fields:t}}function r(e){return n(e)}let o=0;function i(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())).toString(36)}async function c(e,t,a,s){const{host:n,auth:r}=e,o=function(e,t){return`https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?${t}`}(0,t),i={method:a?"POST":"GET",mode:"cors",cache:"no-cache",headers:{pragma:"no-cache","cache-control":"no-cache"}};r&&(i.headers.Authorization=`Bearer ${r.idToken}`),a&&(i.body="string"==typeof a?a:JSON.stringify(a)),s&&Object.assign(i.headers,s);let d=await fetch(o,i);if(!d.ok){if(r&&401===d.status)return await r.tokenRefresh(),await c(e,t,a,s);throw d.statusText}return d}async function d(e,t){e.targetId=o+=2;const a=`database=projects/${e.database}/databases/(default)&VER=8&RID=${e.RID++}&CVER=22&X-HTTP-Session-Id=gsessionid&$httpHeaders=X-Goog-Api-Client:gl-js/ fire/8.3.1\nContent-Type:text/plain\n&zx=${i()}&t=1`,s=encodeURI(`count=1&ofs=0&req0___data__={"database":"projects/${e.database}/databases/(default)","addTarget":{"documents":{"documents":["projects/${e.database}/databases/(default)/documents/${e.documentPath}"]},"targetId":${e.targetId}}}`),n=await c(e,a,s,{"Content-Type":"application/x-www-form-urlencoded"}),r=n.headers;e.sessionId=r.get("x-http-session-id");const d=await n.text(),u=JSON.parse(d.split("\n")[1]);e.SID=u[0][1][1],t&&t()}function u(e,t){let s;const n=e=>{if(!["noop","close"].includes(e))if(e.documentChange){const s=a(e.documentChange.document);t&&t(s)}else if(e.targetChange){const{targetChange:t}=e;"REMOVE"===t.targetChangeType&&t.cause&&7===t.cause.code&&(s="permission")}else if(e.__sm__){const t=e.__sm__.status[0][0].error;t&&401===t.code&&(s="refresh")}else console.log("Unknown request:",e)},r=JSON.parse(e);let o,i=0;for([i,o]of r)if(Array.isArray(o))for(const e of o)n(e);else n(o);return{AID:i,error:s}}async function l(e,t,a){const s=`database=projects/${e.database}/databases/(default)&gsessionid=${e.sessionId}&VER=8&RID=rpc&SID=${e.SID}&AID=${e.AID}&TYPE=xmlhttp&zx=${i()}&t=1`,n=new TextDecoder("utf-8"),r=await c(e,s);if(r.body){const s=r.body.getReader();let o,i,c=0,h="";for(;!o;)if(({value:i,done:o}=await s.read()),!o)for(i=i?n.decode(i,{stream:!0}):"";i.length;){if(!c){const e=i.indexOf("\n");c=+i.slice(0,e),i=i.slice(e+1)}if(c<=i.length){h=i.slice(0,c),i=i.slice(c);const{AID:n,error:r}=u(h,t);if(e.AID=n,c=0,h="",r){const n={...e};return await f(n),"permission"===r?a&&a("Missing or insufficient permissions"):"refresh"===r&&(await e.auth.tokenRefresh(),e.AID=0,e.RID=Math.round(64e3*Math.random()),d(e,(()=>l(e,t)))),void s.releaseLock()}}else h+=i}e.closed||(s.releaseLock(),l(e,t))}else a&&a(r.statusText)}async function f(e){if(!e.closed){const t=`database=projects/${e.database}/databases/(default)&VER=8&gsessionid=${e.sessionId}&SID=${e.SID}&RID=${e.RID++}&AID=${e.AID}&zx=${i()}&t=1`,a=`count=1&ofs=1&req0___data__={"database":"projects/${e.database}/databases/(default)","removeTarget":${e.targetId}}`;await c(e,t,a,{"Content-Type":"application/x-www-form-urlencoded"}),e.closed=!0}}function h(e,t,a,s){const n={...e,documentPath:t,AID:0,RID:Math.round(64e3*Math.random())};try{d(n,(()=>l(n,a,s)))}catch(e){s&&s(e)}return()=>f(n)}const p=e=>{throw e};async function m(e,t,s,n,r){const o=function(e,t,a){t.startsWith(":")||(t="/"+t);let s=`${e.host}/v1/projects/${e.database}/databases/(default)/documents${t}`;if(a){const e=new URLSearchParams;Object.entries(a).map((([t,a])=>{["mask","updateMask","select","project"].includes(t)?(["select","project"].includes(t)&&(t="mask"),Array.isArray(a)||(a=[a]),a.map((a=>e.append(`${t}.fieldPaths`,a)))):e.append(t,a)})),s=`${s}?${e.toString()}`}return s}(e,t,s),i={method:n||"GET",mode:"cors",cache:"no-cache",headers:{pragma:"no-cache","cache-control":"no-cache"}},c=e.auth;c&&(i.headers.Authorization=`Bearer ${c.idToken}`),r&&(i.body=JSON.stringify(r));let d=await fetch(o,i),u=await d.json();if(!d.ok){if(Array.isArray(u)&&(u=u[0]),c&&401===u.error.code)return await c.tokenRefresh(),await m(e,t,s,n,r);p(u)}return a(u)}const g=e=>!(1&e.split("/").length),b=e=>{if(((e,t)=>{Array.isArray(e)||p(`"${t}" value must be an array`)})(e,"where"),Array.isArray(e[0]))return{compositeFilter:{op:"AND",filters:e.map((e=>b(e)))}};const[t,a,n]=e;a||p('"where" array needs 2 or 3 value');const r=n?"fieldFilter":"unaryFilter",o=(e=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL","==":"EQUAL","=":"EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","!=":"NOT_EQUAL","<>":"NOT_EQUAL"}[e]||e.toUpperCase().replace(/\-/g,"_")))(a);o||p(`Invalid operator in where: ${a}`);const i={field:{fieldPath:t},op:o};return n&&(i.value=s(n)),{[r]:i}},y={listen:function(e,t,a){return h(this.dbinfo,e,t,a)},get:function(e,t){return(async(e,t,a)=>g(t)?m(e,t,a):p('Collection specified. Use "list" to get list of documents.'))(this.dbinfo,e,t)},query:function(e,t){return(async(e,t,a)=>{const n={};return Object.entries(t).map((([e,t])=>{const a=Array.isArray(t);switch(e){case"select":t={fields:a?t.map((e=>({fieldPath:e}))):[{fieldPath:t}]};break;case"from":t=a?t.map((e=>({collectionId:e}))):[{collectionId:t}];break;case"where":t=b(t);break;case"orderBy":const n=e=>{let t={};return e.startsWith("-")&&(e=e.slice(1),t.direction="DESCENDING"),t.field={fieldPath:e},t};t=a?t.map((e=>n(e))):[n(t)];break;case"startAt":case"startAfter":case"endAt":case"endBefore":t={values:[s(t)],before:["startAt","endBefore"].includes(e)},e=e.replace(/After|Before/,"At");break;default:t=s(t)}n[e]=t})),m(e,":runQuery",a,"POST",{structuredQuery:n})})(this.dbinfo,e,t)},list:function(e,t){return(async(e,t,a)=>g(t)?p('Document specified. Use "get" to get document.'):m(e,t,a))(this.dbinfo,e,t)},set:function(e,t,a){return(async(e,t,a,s)=>m(e,t,s,"PATCH",r(a)))(this.dbinfo,e,t,a)},update:function(e,t,a){return(async(e,t,a,s={})=>{const n=[],o=(e,t)=>{Object.entries(e).map((([e,a])=>{"Object"===a.constructor.name?o(a,`${t}${e}.`):n.push(t+e)}))};return o(a,""),s.updateMask=n,m(e,t,s,"PATCH",r(a))})(this.dbinfo,e,t,a)},delete:function(e,t){return(async(e,t,a)=>m(e,t,a,"DELETE"))(this.dbinfo,e,t)}};function A(e,t,a){const s={host:"https://firestore.googleapis.com",database:e,auth:t};return s.host=!1===a?"https://firestore.googleapis.com":a&&"string"==typeof a?a.startsWith("http")?a:`http://${a}`:"http://localhost:8080",{...y,dbinfo:s}}"undefined"!=typeof window&&(window.smallfire=window.smallfire||{},window.smallfire.getFirestoreDB=A);export{A as getFirestoreDB};
