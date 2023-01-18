sap.ui.define(
    ["com/aysa/pgo/abmAdmins/controller/BaseController",
        "com/aysa/pgo/abmAdmins/services/Services",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "sap/m/MessageToast"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.Fragment} Fragment 
 */
    function (Controller, Services, Fragment, Filter, FilterOperator, Sorter, MessageToast) {
        "use strict";

        return Controller.extend("com.aysa.pgo.abmAdmins.controller.Main", {
            onInit: function () {
                const oManifest = this.getOwnerComponent().getManifestObject()
                const urlCatalog = oManifest.resolveUri("catalog")
                Services.setUrl(urlCatalog)
                this.getRouter().getRoute("Main").attachPatternMatched(this._onObjectMatched, this)
            },

            _onObjectMatched: async function () {
                const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                await Services.getDirections().then(oData => {
                    oModel.setProperty("/Direction", oData.value)
                })
                /* forEach  */
            },

            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    this.onRefresh();
                } else {
                    const aTableSearchState = [];
                    const sQuery = oEvent.getParameter("query");

                    if (sQuery && sQuery.length > 0) {

                        aTableSearchState.push(new Filter({
                            filters: [
                                new Filter("description", FilterOperator.Contains, sQuery),
                                new Filter("ID", FilterOperator.Contains, sQuery),
                            ],
                            and: false,
                        }));

                    }
                    this._applySearch(aTableSearchState);
                }
            },

            _applySearch: function (aTableSearchState) {
                const oTable = this.byId("table")
                oTable.getBinding("items").filter(aTableSearchState, "Application");
            },

            onSort: function () {

                const oView = this.getView()
                const oSorter = new Sorter({
                    path: "ID",
                    descending: false
                })
                oView.byId("table").getBinding("items").sort(oSorter);
            },
            onSortDesc: function () {

                const oView = this.getView()
                const oSorter = new Sorter({
                    path: "ID",
                    descending: true
                })
                oView.byId("table").getBinding("items").sort(oSorter);
            },

            onPress: function (oEvent) {
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()
                this.getRouter().navTo("object", {
                    id: selectedRow.ID
                });
            },

            handleUploadDialog: function () {
                const oView = this.getView();
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oView.getId(),
                        controller: this,
                        name: "com.aysa.pgo.abmAdmins.view.fragments.dialogs.DirectionDialog"
                    }).then(oDialog => {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this.pDialog.then(oDialog => {
                    oDialog.open();
                });
            },

            onCloseDialogEdit: function () {
                this.byId("idEditDirectionDialog").close()
                this.getOwnerComponent().getModel("AppJsonModel").setProperty("/updateDirection", {})
            },

            onCloseDialogUpload: function () {
                this.byId("idUploadDialog").close()
                this.getOwnerComponent().getModel("AppJsonModel").setProperty("/updateDirection", {})
            },

            onCreateDirection: async function () {
                const id = this.getView().byId("idInputID").getValue()
                const description = this.getView().byId("idInputDesc").getValue()
                const newDirection = {
                    ID: id,
                    description
                }
                /* forEach del modelo y si el id existe no hago la call  */
                const directions = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/Direction")

                const search = directions.find(direction => direction.ID === id)

                if (search === undefined && id.toString().length === 2){
                    await Services.callPostService("Direction", newDirection).then(() => {
                        window.location.reload()
                    })
                } else {
                    MessageToast.show(`La dirección con el id ${id} es nulo o ya existente`)
                }
            },

            onEditDirection: async function () {
                const id = this.getView().byId("idInputIDEdit").getValue()
                const description = this.getView().byId("idInputDescEdit").getValue()
                const newDirection = {
                    ID: id,
                    description
                }

                await Services.callUpdateService(`Direction/${newDirection.ID}`, newDirection).then(() => {
                    window.location.reload()
                })
            },

            onPressDelete: async function (oEvent) {
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()

                await Services.callDeleteService(`Direction/${selectedRow.ID}`).then(() => {
                    window.location.reload()
                })
            },

            onPressEdit: function (oEvent) {
                const oView = this.getView();
                if (!this.pDialogAlta) {
                    this.pDialogAlta = Fragment.load({
                        id: oView.getId(),
                        controller: this,
                        name: "com.aysa.pgo.abmAdmins.view.fragments.dialogs.EditDirectionDialog"
                    }).then(oDialog => {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()

                this.pDialogAlta.then(async oDialog => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    await Services.getDirection(selectedRow.ID).then(oData => {
                        oModel.setProperty("/updateDirection", oData)
                    })
                    oDialog.open();
                });
            }
        });
    }
);
