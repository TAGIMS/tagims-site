// Only one renderer is registered in this sandbox. Uses the native HUB content host.
const contentRenderers = {gestures: () => GesturesWidget.render()};
function initializeListScrolling() {}
function initializeUsabilityPass() {}
function configureWidgetAppSettings(widget) {
 if(widget._appSettingsSection) widget._appSettingsSection.hidden=true;
}
