/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require(["com/aysa/pgo/abmAdmins/test/integration/AllJourneys"], function () {
        QUnit.start();
    });
});
