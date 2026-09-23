(function(){
  window.addEventListener("error", function(e){
    var app=document.getElementById("app");
    if(app && !app.dataset.booted){ app.innerHTML='<div style="padding:32px;font-family:system-ui;color:#edf3ff;background:#0b1020;min-height:100vh"><h1>PhonaCore-ASLP</h1><p>Application startup error.</p><pre style="white-space:pre-wrap;color:#fb7185">'+String(e.error?.stack||e.message||e).replace(/[&<>]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]})+'</pre><p>Open Chrome DevTools → Console for the full error.</p></div>'; }
  });
  if(!window.SV_DSP){
    var app=document.getElementById("app");
    if(app) app.innerHTML='<div style="padding:32px;font-family:system-ui;color:#edf3ff;background:#0b1020;min-height:100vh"><h1>PhonaCore-ASLP</h1><p style="color:#fb7185">DSP module failed to load.</p><p>Check <code>/dsp.js</code> in Chrome DevTools → Network.</p></div>';
  }
})();