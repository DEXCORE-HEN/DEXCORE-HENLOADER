(function () {
  "use strict";
  var button=document.getElementById("cheats-download");
  var status=document.getElementById("cheats-download-status"),busy=false;
  if(!button||!status)return;
  function get(url){return fetch(url,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("Download failed ("+r.status+")");return r;});}
  button.addEventListener("click",function(event){
    event.preventDefault();if(busy)return Promise.resolve();
    busy=true;button.setAttribute("aria-disabled","true");status.textContent="Preparing verified download…";
    return get("downloads/cheats.json").then(function(r){return r.json();}).then(function(manifest){
      var parts=[],loaded=0,chain=Promise.resolve();
      manifest.parts.forEach(function(part,index){
        chain=chain.then(function(){status.textContent="Downloading collection ("+(index+1)+"/"+manifest.parts.length+")…";return get("downloads/"+part.file);})
          .then(function(r){return r.arrayBuffer();}).then(function(data){var bytes=new Uint8Array(data);if(bytes.length!==part.bytes||window.HEN_SHA256(bytes)!==part.sha256)throw new Error("Download integrity check failed; please retry.");parts.push(bytes);loaded+=bytes.length;});
      });
      return chain.then(function(){
        if(loaded!==manifest.size_bytes)throw new Error("Incomplete download; please retry.");
        var bytes=new Uint8Array(loaded),offset=0;parts.forEach(function(p){bytes.set(p,offset);offset+=p.length;});
        if(window.HEN_SHA256(bytes)!==manifest.sha256)throw new Error("Collection checksum mismatch; please retry.");
        var url=URL.createObjectURL(new Blob([bytes],{type:"application/zip"}));
        var link=document.createElement("a");link.href=url;link.download=manifest.file;document.body.appendChild(link);link.click();document.body.removeChild(link);
        setTimeout(function(){URL.revokeObjectURL(url);},30000);
        status.textContent="Verified. Your collection download is ready.";
      });
    }).catch(function(error){status.textContent=error.message||"Download failed; please retry.";})
      .then(function(){busy=false;button.removeAttribute("aria-disabled");});
  });
})();
