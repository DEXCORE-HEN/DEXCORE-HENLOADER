(function(root){
  "use strict";
  // Return only a boolean; never retain response bytes in a completed request.
  root.HEN_VERIFY_RESOURCE=function(spec){
    return new Promise(function(resolve,reject){
      var xhr=null,finished=false;
      function finish(error){
        if(finished)return;finished=true;
        if(xhr){xhr.onload=null;xhr.onerror=null;xhr.ontimeout=null;xhr.onabort=null;}
        xhr=null;
        if(error)reject(error);else resolve(true);
      }
      if(!spec||typeof spec[0]!=="string"||typeof spec[1]!=="number"||spec[1]<=0||typeof spec[2]!=="string"||!/^[0-9a-f]{64}$/.test(spec[2])){finish(Error("Host file metadata is invalid."));return;}
      if(typeof root.HEN_SHA256!=="function"){finish(Error("SHA-256 verification code did not load."));return;}
      try{
        xhr=new XMLHttpRequest();xhr.open("GET",spec[0],true);xhr.responseType="arraybuffer";xhr.timeout=30000;
        xhr.onload=function(){
          try{
            if(xhr.status!==200||!xhr.response){finish(Error("Host file missing (HTTP "+xhr.status+")."));return;}
            var bytes=new Uint8Array(xhr.response);
            if(bytes.length!==spec[1]){finish(Error("Size mismatch: clear the PS4 browser cache."));return;}
            if(root.HEN_SHA256(bytes)!==spec[2]){finish(Error("SHA-256 mismatch: exploit not started."));return;}
            bytes=null;finish();
          }catch(error){finish(error);}
        };
        xhr.onerror=function(){finish(Error("Network failure: check the website connection."));};
        xhr.ontimeout=function(){finish(Error("Host file download timed out."));};
        xhr.onabort=function(){finish(Error("Host file download was canceled."));};
        xhr.send();
      }catch(error){finish(error);}
    });
  };
})(typeof window!=="undefined"?window:globalThis);
