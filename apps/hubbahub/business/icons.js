// Small functional icons; visible labels remain the source of meaning.
(() => {
 const paths={
  opsPayments:'M3 5h18v14H3z M3 10h18 M6 15h4',
  opsReceipts:'M5 3h14v18l-3-2-4 2-4-2-3 2z M8 8h8 M8 12h5 M9 16l2 2 4-4',
  opsCalendar:'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4 M8 14h2 M14 14h2 M8 18h2',
  opsChangeOrders:'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M12.5 10v6',
  opsApps:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  opsCRM:'M3 21V7l9-4 9 4v14 M8 21v-5h8v5 M8 8h1 M15 8h1 M8 12h1 M15 12h1',
  opsLeads:'M4 4h16l-6 8v7l-4 2V12z',
  opsPipeline:'M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1',
  opsProjectWorkspace:'M3 7V5h6l2 2h10v13H3z',
  opsClients:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  opsPhotoCenter:'M3 3h18v18H3z M3 16l5-5 4 4 3-3 6 6 M7 7h.01',
  opsEstimates:'M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h5',
  opsInvoices:'M5 3h14v18l-3-2-4 2-4-2-3 2z M8 8h8 M8 12h8',
  opsTimesheet:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
  opsFinancials:'M3 3v18h18 M7 17v-5 M12 17V7 M17 17V4',
  opsNotes:'M4 20l4-1L20 7l-3-3L5 16z M14 7l3 3',
  opsReview:'M12 3l8 4v5c0 5-8 9-8 9s-8-4-8-9V7z M8 12l3 3 5-6',
  opsUpload:'M12 16V3 M7 8l5-5 5 5 M4 14v7h16v-7',
  opsField:'M9 5h12 M9 12h12 M9 19h12 M2 5l2 2 3-4 M2 12l2 2 3-4 M2 19l2 2 3-4'
 };
 paths.opsProjects=paths.opsProjectWorkspace;paths.opsCrew=paths.opsClients;paths.opsContact=paths.opsClients;paths.opsPhotos=paths.opsPhotoCenter;paths.opsEstimate=paths.opsEstimates;paths.opsPublish=paths.opsUpload;
 paths.opsGallery=paths.opsPhotoCenter;
 paths.opsAlbums='M3 7h7l2-3h9v17H3z M6 11h12 M6 15h8';
 paths.opsTrash='M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7';
 paths.opsProcessing=paths.opsClients;
 window.OpsIcon=type=>`<svg class="ops-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[type]||paths.opsApps}"/></svg>`;
})();
