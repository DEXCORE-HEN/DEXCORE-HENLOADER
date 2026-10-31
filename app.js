(function () {
  "use strict";
  var build = window.HEN_BUILD;
  var device = window.HEN_DEVICE;
  var btn = document.getElementById("loadExploit");
  var verifyBtn = document.getElementById("verifyFiles");
  var autoBtn = document.getElementById("toggleAuto");
  var statusEl = document.getElementById("status");
  var integrityEl = document.getElementById("integrityState");
  var integrityCaption = document.getElementById("integrityCaption");
  var detectedEl = document.getElementById("detectedFirmware");
  var deviceCaption = document.getElementById("deviceCaption");
  var supported = !!(device && device.supported);
  var busy = false, verified = false, timer = null, deadline = 0;
  var autoEnabled = false;
  var files = [
    ["loader/" + build.payload[0], build.payload[1], build.payload[2]],
    ["loader/" + build.patch[0], build.patch[1], build.patch[2]]
  ];
  function setStatus(message) { statusEl.textContent = message; }
  function resetTimer() { if (timer !== null) { clearInterval(timer); timer = null; } }
  function setButtons() { btn.disabled = busy || !supported; verifyBtn.disabled = busy; autoBtn.disabled = busy || !supported; }
  function setIntegrity(ok, message) {
    integrityEl.textContent = ok ? "VERIFIED" : "CHECK FAILED";
    integrityEl.style.color = ok ? "#62d9bc" : "#ff9eaa";
    integrityCaption.textContent = message;
  }
  function checkOne(spec) {
    if(typeof window.HEN_VERIFY_RESOURCE!=="function")return Promise.reject(Error("Verification code did not load. Refresh the website."));
    return window.HEN_VERIFY_RESOURCE(spec);
  }
  function checkFiles() {
    if(busy)return;
    resetTimer();autoEnabled=false;autoBtn.textContent="AUTO-LOAD: OFF";
    busy=true;verified=false;setButtons();
    integrityEl.textContent="CHECKING…";integrityEl.style.color="#b5ddff";
    integrityCaption.textContent="Checking payload and kernel patch";setStatus("Verifying payload and kernel patch…");
    checkOne(files[0]).then(function(){return checkOne(files[1]);}).then(function(){
      verified=true;setIntegrity(true,"Size and SHA-256 checks passed");
      setStatus(supported?"Files verified. Ready for manual launch.":"Files verified. Launch requires PS4 firmware 13.52.");
    }).catch(function(err){setIntegrity(false,err.message||"Unknown verification failure");setStatus("Verification failed. Exploit not launched.");})
      .then(function(){busy=false;setButtons();});
  }
  function launch() {
    if(busy||!supported)return;
    resetTimer();autoEnabled=false;autoBtn.textContent="AUTO-LOAD: OFF";busy=true;setButtons();
    setStatus("Opening DEXCORE. Files will be verified before launch…");
    // Drop decoded artwork and animated layers before leaving this document.
    var images=document.querySelectorAll("img");
    for(var i=0;i<images.length;i++){images[i].removeAttribute("srcset");images[i].removeAttribute("src");}
    document.body.textContent="Opening DEXCORE…";
    // Replace this history entry so the dashboard need not survive in Page Cache.
    setTimeout(function(){
      try{window.location.replace("loader/jb.html?v=r26.5-nativefix-7fd6775c4c40");}
      catch(e){document.body.textContent="Could not open DEXCORE. Reload the website to retry.";}
    },50);
  }
  function autoTick() {
    if (!autoEnabled || busy || !supported) return;
    var seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    setStatus("Auto-load in " + seconds + " second" + (seconds === 1 ? "" : "s") + ".");
    if (seconds === 0) launch();
  }
  btn.addEventListener("click", function(){ launch(); });
  verifyBtn.addEventListener("click", function(){ checkFiles(); });
  autoBtn.addEventListener("click", function() {
    if (!supported || busy) return;
    if (autoEnabled) { autoEnabled = false; resetTimer(); autoBtn.textContent = "AUTO-LOAD: OFF"; setStatus("Auto-load canceled. Ready for manual launch."); }
    else { autoEnabled = true; deadline = Date.now() + 10000; autoBtn.textContent = "AUTO-LOAD: ON (CANCEL)"; autoTick(); timer = setInterval(autoTick, 250); }
  });
  detectedEl.textContent = device && device.firmware ? "PS4 " + device.firmware : "NOT DETECTED";
  deviceCaption.textContent = supported ? "Compatible firmware detected" : "Launch restricted to PS4 13.52";
  setStatus(supported ? "Firmware 13.52 detected. Ready for payload verification." : "Preview mode. Launch requires PS4 firmware 13.52.");
  setButtons();
  // PS4's cursor stays enabled by default. D-pad focus navigation is opt-in.
  var navBtn = document.getElementById("navigationMode");
  var navEnabled = false;
  var agent = navigator.userAgent || "";
  if (/PlayStation\s*4/i.test(agent)) document.body.className += " ps4-browser";
  function focusableControls() {
    var nodes = document.querySelectorAll("a[href], button");
    var result = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n.disabled && n.offsetWidth > 0 && n.offsetHeight > 0 && n.getAttribute("aria-hidden") !== "true") result.push(n);
    }
    return result;
  }
  if (navBtn) {
    navBtn.addEventListener("click", function () {
      navEnabled = !navEnabled;
      navBtn.textContent = navEnabled ? "D-PAD NAV: ON" : "D-PAD NAV: OFF";
      navBtn.setAttribute("aria-pressed", navEnabled ? "true" : "false");
      if (navEnabled) navBtn.focus();
    });
    document.addEventListener("keydown", function (event) {
      if (!navEnabled) return;
      var key = event.key || "";
      var code = event.keyCode;
      var forward = (key === "ArrowDown" || key === "ArrowRight" || code === 40 || code === 39);
      var back = (key === "ArrowUp" || key === "ArrowLeft" || code === 38 || code === 37);
      if (!forward && !back) return;
      var items = focusableControls();
      if (!items.length) return;
      var current = document.activeElement, index = -1;
      for (var i = 0; i < items.length; i++) { if (items[i] === current) { index = i; break; } }
      var next = forward ? (index + 1) % items.length : (index < 0 ? items.length - 1 : (index + items.length - 1) % items.length);
      event.preventDefault();
      items[next].focus();
    }, false);
  }
})();



