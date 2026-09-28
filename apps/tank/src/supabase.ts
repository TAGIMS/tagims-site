import {createClient} from '@supabase/supabase-js';
import {AUTH_STORAGE_KEY,createSessionStorage} from './sessionStorage';
export const accountSession=createSessionStorage(localStorage,sessionStorage);
// Public browser key. Row-level security restricts tank_saves to the signed-in owner.
export const supabase=createClient(
 'https://pqaucwuuegebngkrybbx.supabase.co',
 'sb_publishable_5zFA4ACR_7Zhm16XSgqy6w_foYqHBDw',
 {auth:{storageKey:AUTH_STORAGE_KEY,storage:accountSession.storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}}
);
