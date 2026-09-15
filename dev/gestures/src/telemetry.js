// Native HUB window-header helper retained; performance/photos/clocks omitted.
const widgetTypeLabels = {gestures:'Gestures'};
const headerlessWidgetTypes = new Set();
function syncWidgetWindowHeader(widget, type) {
 const explicitTitle = localStorage.getItem(`hub-widget-setting-${widget.id}-title`);
 const fallback = widgetTypeLabels[type] || widget._defaultWidgetLabel || 'Widget Window';
 widget._setWindowTitle?.(explicitTitle || fallback, false);
 const headerPreference = localStorage.getItem(`hub-widget-setting-${widget.id}-show-header`);
 const globalPreference = localStorage.getItem('hub-all-widget-headers');
 const showHeader = headerPreference === null
  ? (globalPreference === null ? !headerlessWidgetTypes.has(type) : globalPreference !== 'false')
  : headerPreference !== 'false';
 widget._setHeaderVisible?.(showHeader, false);
}
function updateClocks() {}
