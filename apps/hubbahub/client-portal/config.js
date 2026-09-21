// Public browser configuration only. The portal never uses a service-role or secret key.
window.ClientPortalConfig=Object.freeze({
  mode:'local-draft',
  enableCloudWrites:false,
  supabaseUrl:window.OpsConfig?.url||'',
  publishableKey:window.OpsConfig?.key||'',
  storageBucket:'project-documents'
});
