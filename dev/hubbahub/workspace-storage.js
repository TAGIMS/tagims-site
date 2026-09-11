// Isolate this iframe's browser workspace from /apps/hubbahub.
// Cloud accounts are deliberately not cloned; explicit sign-in still uses real cloud data.
(() => {
  'use strict';
  const prefix = 'tagims-hub18-design:';
  for (const name of ['localStorage', 'sessionStorage']) {
    const original = window[name];
    const keys = () => Object.keys(original).filter(key => key.startsWith(prefix));
    const isolated = {
      getItem: key => original.getItem(prefix + key),
      setItem: (key, value) => original.setItem(prefix + key, String(value)),
      removeItem: key => original.removeItem(prefix + key),
      clear: () => keys().forEach(key => original.removeItem(key)),
      key: index => keys()[index]?.slice(prefix.length) ?? null,
      get length() { return keys().length; }
    };
    Object.defineProperty(window, name, { value: isolated });
  }
  const open = indexedDB.open.bind(indexedDB);
  indexedDB.open = (name, ...args) => open(prefix + name, ...args);
})();
