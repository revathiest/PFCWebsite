window.PFCAuth = {
    signingSecret: 'idontknowwhatgoeshere', // ⬅️ Replace with your actual secret
  
    base64urlStr: function (input) {
      return btoa(unescape(encodeURIComponent(input)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    },
  
    createJWT: async function (payload, secret) {
      const header = { alg: 'HS256', typ: 'JWT' };
      const headerStr = this.base64urlStr(JSON.stringify(header));
      const payloadStr = this.base64urlStr(JSON.stringify(payload));
      const data = `${headerStr}.${payloadStr}`;
  
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
  
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
      const sigBytes = new Uint8Array(sig);
      const sigStr = btoa(String.fromCharCode(...sigBytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
  
      return `${data}.${sigStr}`;
    },
  
    getApiToken: async function (apiBase) {
      const payload = {
        iat: Math.floor(Date.now() / 1000),
        iss: 'pfc-website'
      };
  
      const preToken = await this.createJWT(payload, this.signingSecret);
  
      const res = await fetch(`${apiBase}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: preToken })
      });
  
      if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
      const data = await res.json();
      return data.token;
    }
  };
  