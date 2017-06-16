
function loadWaiter(config) {
  if (!sap.ui.ClassicalWaitForUI5) {
    var ClassicalWaitForUI5 = new Function('return (' + config.ClassicalWaitForUI5 + ').apply(this, arguments)');
    sap.ui.getCore().registerPlugin({
      startPlugin: function (oCore) {
        jQuery.sap.declare('sap.ui.ClassicalWaitForUI5');
        sap.ui.ClassicalWaitForUI5 = new ClassicalWaitForUI5(config.waitForUI5Timeout, {
          getUIDirty: oCore.getUIDirty.bind(oCore),
          attachUIUpdated: oCore.attachUIUpdated.bind(oCore)
        });
      }
    });
  }
}

function wait(config, fnCallback) {
  sap.ui.ClassicalWaitForUI5.notifyWhenStable(fnCallback);
}

module.exports = {
  loadWaiter: loadWaiter,
  wait: wait
};
