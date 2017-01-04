exports.config = {
  specResolver: {name: './resolver/localUI5SpecResolver'},
  storageProvider: {name: './image/localStorageProvider',refImagesRoot: './target'},
  screenshotProvider: {name: './image/localScreenshotProvider',screenshotSleep: 100},
  comparisonProvider: {name: './image/localComparisonProvider'},

  baseUrlQuery: ['sap-ui-animation=false','sap-ui-theme=sap_${theme}','sap-ui-rtl=${direction === \'rtl\'}','sap-ui-xx-formfactor=${mode}']
};
