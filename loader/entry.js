(function(){
  "use strict";
  var build=window.HEN_BUILD;
  var diagnosticLink=document.getElementById("diagnostics");
  if(diagnosticLink&&build)diagnosticLink.href="diagnostics.html"+build.query;
  if(!window.HEN_DEVICE||!window.HEN_DEVICE.supported){
    document.getElementById("msg").textContent="Disabled. Only PS4 firmware 13.52 is supported.";
    document.getElementById("state").textContent="Detected: "+(window.HEN_DEVICE&&window.HEN_DEVICE.firmware||"not a PS4");
    return;
  }

  var message=document.getElementById("msg");

  var state=document.getElementById("state");
  var output=document.getElementById("out");
  var reported=false;
  window.HEN_LOADER_STARTED=false;

  function fail(stage, detail){
    if(reported || window.HEN_LOADER_STARTED)return;
    reported=true;
    if(document.body)document.body.className="log fail";
    if(message)message.textContent="Exploit loader did not start";
    if(state)state.textContent=stage;
    if(output)output.textContent+=(detail||"The loader could not initialize.")+"\n";
  }
  if(typeof window.addEventListener==="function"){
    window.addEventListener("error",function(event){
      if(window.HEN_LOADER_STARTED)return;
      var target=event.target;
      if(target && target.tagName==="SCRIPT"){
        fail("Script request failed",target.src||"A required JavaScript file could not load.");
      }else if(event.message){
        fail("JavaScript error",String(event.message).slice(0,240));
      }
    },true);
    window.addEventListener("unhandledrejection",function(event){
      if(!window.HEN_LOADER_STARTED){
        var reason=event.reason;
        fail("Module initialization failed",String(reason && reason.message||reason).slice(0,240));
      }
    });
  }
  function startModule() {
    if(reported)return;
    if(message)message.textContent="Files verified. Loading DEXCORE…";
    var module=document.createElement("script");module.type="module";
    module.src="jb.js?v=r26.5-host-memory1";
    module.onerror=function(){fail("Exploit module failed to load","Missing file, unsupported module syntax, or network error.");};
    document.head.appendChild(module);
    setTimeout(function(){if(!window.HEN_LOADER_STARTED)fail("Exploit JavaScript never started","Clear website data, fully restart the console, then record the last message if loading still fails.");},15000);
  }
  if(typeof window.HEN_VERIFY_RESOURCE!=="function"||!build||!build.payload||!build.patch){fail("Host verification unavailable","Required host metadata or verification code did not load.");return;}
  if(message)message.textContent="Verifying DEXCORE files…";
  if(state)state.textContent="Checking the payload size and SHA-256";
  window.HEN_VERIFY_RESOURCE(build.payload).then(function(){
    if(state)state.textContent="Checking the firmware patch size and SHA-256";
    return window.HEN_VERIFY_RESOURCE(build.patch);
  }).then(function(){
    if(state)state.textContent="Host files verified";
    setTimeout(startModule,100);
  }).catch(function(error){fail("Host verification failed",error.message||String(error));});
})();
