sap.ui.define([], function () {
    "use strict";
    return {
      _urlCatalog: null,
      _urlDMS: null,
      _urlWF: null,
      callGetService: function (sEntity) {
        return new Promise((res, rej) => {
          fetch(`${this._urlCatalog}/${sEntity}`)
            .then((response) => res(response.json()))
            .catch((err) => rej(err));
        });
      },

      callPostService: function (sEntity, oPayload) {
        return new Promise((res, rej) => {
          fetch(`${this._urlCatalog}/${sEntity}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(oPayload),
          })
            .then((response) => res(response.json()))
            .catch((err) => rej(err));
        });
      },

      callUpdateService: function (sEntity, oPayload) {
        return new Promise((res, rej) => {
          fetch(`${this._urlCatalog}/${sEntity}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(oPayload),
          })
            .then((response) => res(response))
            .catch((err) => rej(err));
        });
      },

      callDeleteService: function (sEntity) {
        return new Promise((res, rej) => {
          fetch(`${this._urlCatalog}/${sEntity}`, {
            method: "DELETE",
          })
            .then((response) => res(response))
            .catch((err) => rej(err));
        });
      },
      setUrl: function (urlCatalog, urlDMS, urlWF) {
        this._urlCatalog = urlCatalog;
        this._urlDMS = urlDMS;
        this._urlWF = urlWF;
      },

      getDirection: function (sID) {
        return this.callGetService(`Direction/${sID}`);
      },

      getDirections: function () {
        return this.callGetService("Direction");
      },

      getInspector: function (sID) {
        return this.callGetService(`Inspector/${sID}`);
      },

      getInspectors: function (sID) {
        return this.callGetService(`Direction/${sID}/inspectores`);
      },

      getManager: function (sID) {
        return this.callGetService(`Manager/${sID}`);
      },
      getManagers: function (sID) {
        return this.callGetService(`Direction/${sID}/managers`);
      },
      getAllManagers: function () {
        return this.callGetService(`Manager`);
      },


    };
  });