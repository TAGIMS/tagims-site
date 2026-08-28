const TAGIM_ORIGIN = "https://ta-gi-m.vercel.app";
const WEBSITE_ORIGIN = "https://tagims-site-production.pages.dev";
const BRAND_PATH = "/__tagims/brand.png";

const SHELL_STYLES = `
  #tagims-site-shell{position:fixed;inset:0 0 auto;z-index:2147483000;height:58px;display:flex;align-items:center;justify-content:space-between;padding:7px 16px;background:linear-gradient(180deg,rgba(2,7,16,.96),rgba(2,7,16,.76));border-bottom:1px solid rgba(255,255,255,.09);backdrop-filter:blur(18px);font-family:Inter,"Segoe UI",Arial,sans-serif}
  #tagims-site-shell img{display:block;width:165px;height:44px;object-fit:cover;object-position:center}
  #tagims-site-menu-button{width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(7,13,24,.7);color:#fff;cursor:pointer}
  #tagims-site-menu-button span,#tagims-site-menu-button:before,#tagims-site-menu-button:after{content:"";display:block;width:18px;height:2px;border-radius:2px;background:currentColor;transition:transform .2s ease,opacity .2s ease}
  #tagims-site-menu-button span{margin:4px 0}
  #tagims-site-shell[data-open="true"] #tagims-site-menu-button:before{transform:translateY(6px) rotate(45deg)}
  #tagims-site-shell[data-open="true"] #tagims-site-menu-button span{opacity:0}
  #tagims-site-shell[data-open="true"] #tagims-site-menu-button:after{transform:translateY(-6px) rotate(-45deg)}
  #tagims-site-drawer{position:fixed;z-index:2147482999;inset:58px 0 0 auto;width:min(390px,100%);padding:28px 24px 32px;overflow:auto;background:rgba(3,8,17,.97);border-left:1px solid rgba(255,255,255,.1);box-shadow:-26px 0 70px rgba(0,0,0,.5);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#f7fbff;transform:translateX(105%);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
  #tagims-site-drawer[data-open="true"]{transform:translateX(0)}
  #tagims-site-drawer .tagims-kicker{margin:0 0 10px;color:#23e2df;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
  #tagims-site-drawer h2{margin:0 0 13px;font-size:32px;line-height:1.05;letter-spacing:-.04em}
  #tagims-site-drawer p{margin:0 0 25px;color:#aebac7;font-size:14px;line-height:1.65}
  #tagims-site-drawer nav{display:grid;border-top:1px solid rgba(255,255,255,.1)}
  #tagims-site-drawer nav a{display:flex;align-items:center;justify-content:space-between;min-height:56px;border-bottom:1px solid rgba(255,255,255,.1);color:#f7fbff;text-decoration:none;font-size:14px;font-weight:800}
  #tagims-site-drawer nav a:after{content:"↗";color:#23e2df}
  #tagims-site-drawer .tagims-contact{margin-top:26px;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 17px;border-radius:11px;background:linear-gradient(90deg,#23e2df,#d52ee9);color:#020711;text-decoration:none;font-size:13px;font-weight:900}
  #tagims-site-scrim{position:fixed;z-index:2147482998;inset:58px 0 0;background:rgba(0,0,0,.38);opacity:0;pointer-events:none;transition:opacity .25s ease}
  #tagims-site-scrim[data-open="true"]{opacity:1;pointer-events:auto}
  @media(max-width:600px){#tagims-site-shell{height:52px;padding:4px 10px}#tagims-site-shell img{width:110px;height:42px}#tagims-site-drawer{inset-top:52px}#tagims-site-scrim{inset-top:52px}}
  @media(prefers-reduced-motion:reduce){#tagims-site-drawer,#tagims-site-scrim,#tagims-site-menu-button span,#tagims-site-menu-button:before,#tagims-site-menu-button:after{transition:none}}
`;

const SHELL_MARKUP = `
  <header id="tagims-site-shell" data-open="false">
    <a href="/" aria-label="TAGIMS home"><img src="${BRAND_PATH}" alt="TAGIMS"></a>
    <button id="tagims-site-menu-button" type="button" aria-label="Open website menu" aria-expanded="false" aria-controls="tagims-site-drawer"><span></span></button>
  </header>
  <div id="tagims-site-scrim" data-open="false"></div>
  <aside id="tagims-site-drawer" data-open="false" aria-hidden="true">
    <div class="tagims-kicker">Tag Intelligence Management Systems</div>
    <h2>Operate Intelligently.</h2>
    <p>Use TAGiM now. Explore the intelligence, automation, and implementation support behind it when you need more.</p>
    <nav aria-label="Website">
      <a href="/">TAGiM</a>
      <a href="/audit/">Business Score</a>
      <a href="/apps/autoloan/">Auto Loan Calculator</a>
      <a href="mailto:alex@tagims.com">Request a Consultation</a>
    </nav>
    <a class="tagims-contact" href="mailto:alex@tagims.com">Talk With TAGIMS</a>
  </aside>
`;

const SHELL_SCRIPT = `
  (()=>{
    const shell=document.getElementById('tagims-site-shell');
    const button=document.getElementById('tagims-site-menu-button');
    const drawer=document.getElementById('tagims-site-drawer');
    const scrim=document.getElementById('tagims-site-scrim');
    if(!shell||!button||!drawer||!scrim)return;
    const setOpen=open=>{
      const value=String(open);
      shell.dataset.open=value;drawer.dataset.open=value;scrim.dataset.open=value;
      button.setAttribute('aria-expanded',value);button.setAttribute('aria-label',open?'Close website menu':'Open website menu');
      drawer.setAttribute('aria-hidden',String(!open));
    };
    button.addEventListener('click',()=>setOpen(drawer.dataset.open!=='true'));
    scrim.addEventListener('click',()=>setOpen(false));
    document.addEventListener('keydown',event=>{if(event.key==='Escape')setOpen(false)});
  })();
`;

class HeadShell {
  element(element) {
    element.append(`<style id="tagims-site-styles">${SHELL_STYLES}</style>`, { html: true });
  }
}

class BodyShell {
  element(element) {
    element.prepend(SHELL_MARKUP, { html: true });
    element.append(`<script id="tagims-site-script">${SHELL_SCRIPT}</script>`, { html: true });
  }
}

function isWebsitePath(pathname) {
  return pathname === "/audit" || pathname.startsWith("/audit/") || pathname.startsWith("/apps/autoloan/");
}

function upstreamRequest(request, origin) {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);
  return new Request(target, request);
}

function rewriteLocation(response, publicOrigin) {
  const location = response.headers.get("location");
  if (!location || !location.startsWith(TAGIM_ORIGIN)) return response;
  const headers = new Headers(response.headers);
  headers.set("location", publicOrigin + location.slice(TAGIM_ORIGIN.length));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);

    if (incoming.pathname === BRAND_PATH) {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/TAGIMS%20LOGO.png";
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    if (isWebsitePath(incoming.pathname)) {
      return fetch(upstreamRequest(request, WEBSITE_ORIGIN));
    }

    const upstream = await fetch(upstreamRequest(request, TAGIM_ORIGIN), { redirect: "manual" });
    const response = rewriteLocation(upstream, incoming.origin);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("text/html")) {
      return response;
    }

    return new HTMLRewriter()
      .on("head", new HeadShell())
      .on("body", new BodyShell())
      .transform(response);
  },
};
