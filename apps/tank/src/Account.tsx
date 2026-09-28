import {UserRound} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import Home from './page';
import {supabase,accountSession} from './supabase';
import {AccountStore,type SaveService} from './AccountStore';
import {StorageContext,readGuest,cleanDocument} from './tankStorage';
import './account.css';

function service(userId:string):SaveService{
 return {
  async read(){
   const {data,error}=await supabase.from('tank_saves').select('document,revision').eq('user_id',userId).maybeSingle();
   if(error)throw Error(error.message);
   return data?{document:cleanDocument(data.document),revision:data.revision}:null;
  },
  async write(document,revision){
   const values={user_id:userId,document,revision:revision+1,updated_at:new Date().toISOString()};
   const query=revision===0?supabase.from('tank_saves').insert(values):supabase.from('tank_saves').update(values).eq('user_id',userId).eq('revision',revision);
   const {data,error}=await query.select('document,revision').maybeSingle();
   if(error?.code==='23505')return null;
   if(error)throw Error(error.message);
   return data?{document:cleanDocument(data.document),revision:data.revision}:null;
  }
 };
}

export default function AccountApp(){
 const [session,setSession]=useState<Session|null|undefined>(undefined);
 const [authError,setAuthError]=useState(()=>{const query=new URLSearchParams(location.search),hash=new URLSearchParams(location.hash.slice(1));return query.get('error_description')||hash.get('error_description')||'';});
 useEffect(()=>{
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
  void supabase.auth.getSession().then(({data,error})=>{if(error){setAuthError(error.message);setSession(null);}else setSession(data.session);}).catch(error=>{setAuthError(String(error));setSession(null);});
  return()=>subscription.unsubscribe();
 },[]);
 if(session===undefined)return <div className="account-loading" role="status">Opening your aquarium…</div>;
 return <Workspace key={session?.user.id??'guest'} session={session} authError={authError}/>;
}
function Workspace({session,authError}:{session:Session|null;authError:string}){
 const [,redraw]=useState(0);
 const [generation,setGeneration]=useState(0),[ready,setReady]=useState(!session);
 const [open,setOpen]=useState(Boolean(authError)),[mode,setMode]=useState<'signin'|'signup'>('signin');
 const [message,setMessage]=useState(authError),[busy,setBusy]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [remember,setRemember]=useState(()=>accountSession.remember());
 const dialog=useRef<HTMLDialogElement>(null);
 const storeDisposeTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const [store]=useState(()=>session?new AccountStore(session.user.id,service(session.user.id),localStorage,()=>redraw(v=>v+1),()=>setGeneration(v=>v+1)):null);
 useEffect(()=>{
  if(!store)return;
  clearTimeout(storeDisposeTimer.current);
  let alive=true;
  void store.refresh().finally(()=>{if(alive)setReady(true);});
  const refresh=()=>{if(document.visibilityState==='visible')void store.refresh();};
  window.addEventListener('online',refresh);window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',refresh);
  const interval=setInterval(refresh,30000);
  return()=>{alive=false;storeDisposeTimer.current=setTimeout(()=>store.stop(),0);clearInterval(interval);window.removeEventListener('online',refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[store]);
 useEffect(()=>{if(store?.conflict)setOpen(true);},[store?.conflict]);
 useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();if(!open&&dialog.current?.open)dialog.current?.close();},[open]);
 async function authenticate(event:React.FormEvent){
  event.preventDefault();setBusy(true);setMessage('');
  try{
   accountSession.setRemember(remember);
   const credentials={email:email.trim(),password};
   const result=mode==='signin'?await supabase.auth.signInWithPassword(credentials):await supabase.auth.signUp(credentials);
   if(result.error)throw result.error;
   setPassword('');
   if(mode==='signup'&&!result.data.session)setMessage('Check your email to confirm your account, then return here and sign in. You can also use your existing hub account.');
  }catch(error){setMessage(error instanceof Error?error.message:'Unable to sign in. Please try again.');}
  finally{setBusy(false);}
 }
 async function signInWithGoogle(){
  setBusy(true);setMessage('');
  try{
   accountSession.setRemember(remember);
   const response=await fetch('https://pqaucwuuegebngkrybbx.supabase.co/auth/v1/settings',{
    headers:{apikey:'sb_publishable_5zFA4ACR_7Zhm16XSgqy6w_foYqHBDw'},
    signal:AbortSignal.timeout(12000)
   });
   if(!response.ok)throw Error('Google sign-in is unavailable right now. Please try again.');
   const settings=await response.json();
   if(!settings.external?.google)throw Error('Google sign-in setup is not finished yet. You can still sign in with your hub email and password.');
   const {error}=await supabase.auth.signInWithOAuth({
    provider:'google',
    options:{redirectTo:new URL('/apps/tank/',window.location.origin).href,queryParams:{prompt:'select_account'}}
   });
   if(error)throw error;
  }catch(error){setMessage(error instanceof Error?error.message:'Unable to start Google sign-in. Please try again.');setBusy(false);}
 }

 async function signOut(){
  setBusy(true);
  try{const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;}
  catch(error){setMessage(error instanceof Error?error.message:'Unable to sign out.');}
  finally{setBusy(false);}
 }
 function importBrowser(){
  if(!store)return;
  if(!window.confirm('Copy this browser’s guest tank, saved layouts, sound and menu colors into your account? This replaces the current account collection. The guest originals and a local account backup will be kept.'))return;
  try{store.replace(readGuest());}catch(error){setMessage(error instanceof Error?error.message:'Unable to copy browser saves.');}
 }
 return <StorageContext.Provider value={store??localStorage}>
  {ready?<Home key={generation} accountControl={<button className="top-icon-button" aria-label={session?'Account':'Sign in'} title={session?'Account':'Sign in'} onClick={()=>setOpen(true)}><UserRound size={21} strokeWidth={1.7} aria-hidden="true"/>{store?.dirty&&<span className="account-sync-dot" aria-hidden="true"/>}</button>}/>:<div className="account-loading" role="status">Loading your saved aquarium…</div>}
  <dialog ref={dialog} className="tank-account" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)}>
   <div className="account-heading"><h2>{session?'Your tank account':mode==='signin'?'Welcome back':'Create your account'}</h2><button aria-label="Close account" onClick={()=>setOpen(false)}>×</button></div>
   {session&&store?<><p className="account-email">{session.user.email}</p><p role="status">{store.status}</p>
    <p>Your active tank, saved layouts, sound settings and menu colors save automatically across devices.</p>
    {store.conflict?<div className="account-actions"><button onClick={()=>{if(confirm('Load the account version? Your current device version will be kept as a local backup.'))void store.resolve(false);}}>Use account version</button><button onClick={()=>{if(confirm('Replace the account version with this device’s version?'))void store.resolve(true);}}>Use this device’s version</button></div>:<button className="account-primary" onClick={()=>void store.refresh()}>Sync now</button>}
    <button onClick={importBrowser}>Copy browser saves into account</button>
    <p className="account-note">Signed-out browser saves stay separate. Sound may need a click to resume on another device.</p>
    <button disabled={busy} onClick={()=>{if(!store.dirty||confirm('Some changes have not synced. They will stay on this device for the next time you sign in. Sign out anyway?'))void signOut();}}>Sign out</button>
   </>:<><p>Use your existing hub email and password, or create an account. Your browser saves will remain available.</p>
    <label className="account-remember"><input type="checkbox" checked={remember} disabled={busy} onChange={e=>setRemember(e.target.checked)}/><span>Stay signed in on this device</span></label>
    <button className="google-signin" disabled={busy} onClick={()=>void signInWithGoogle()}><span aria-hidden="true" className="google-mark">G</span>Continue with Google</button>
    <p className="account-separator">or use your email</p>
    <form onSubmit={authenticate}><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete={mode==='signin'?'current-password':'new-password'} required minLength={mode==='signup'?8:undefined} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="account-primary" disabled={busy}>{busy?'Please wait…':mode==='signin'?'Sign in':'Create account'}</button></form>
    <button disabled={busy} onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('');}}>{mode==='signin'?'Create an account':'Already have an account? Sign in'}</button>
   </>}
   {message&&<p role="alert">{message}</p>}
  </dialog>
 </StorageContext.Provider>;
}
