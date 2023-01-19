/* eslint-disable camelcase */
sap.ui.define(
    ["com/aysa/pgo/abmAdmins/controller/BaseController",
        "com/aysa/pgo/abmAdmins/services/Services",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/m/MessageToast"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Services, Filter, FilterOperator, Fragment, MessageToast) {
        "use strict";

        return Controller.extend("com.aysa.pgo.abmAdmins.controller.Object", {
            onInit: function () {
                const oManifest = this.getOwnerComponent().getManifestObject()
                const urlCatalog = oManifest.resolveUri("catalog")
                Services.setUrl(urlCatalog)
                this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this)


            },
            _onObjectMatched: async function (oEvent) {
                const sObjectId = oEvent.getParameter("arguments").id;
                const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                oModel.setProperty("/SelectedKey", "gerencias")

                await Services.getInspectors(sObjectId).then(oData => {
                    oModel.setProperty("/Inspector", oData.value)
                })
                await Services.getDirection(sObjectId).then(oData => {
                    oModel.setProperty("/Direction", oData)
                })
                await Services.getManagers(sObjectId).then(oData => {
                    oModel.setProperty("/Manager", oData.value)
                })
                await Services.getAllManagers().then(oData => {
                    oModel.setProperty("/AllManagers", oData.value)
                })

                oModel.setProperty("/EmployeeTypes", [{ name: "JE", value: "JE" }, { name: "EM", value: "EM" }])

                this._tableFilter("tableInspector", "employee_type_ID", "JE")
                this._tableFilter("tableEmployee", "employee_type_ID", "EM")
            },

            _tableFilter: function (table, column, filter) {
                const oTable = this.getView().byId(table)
                const aTableSearchState = [];
                aTableSearchState.push(new Filter({
                    filters: [
                        new Filter(column, FilterOperator.EQ, filter),
                    ],
                    and: false,
                }));

                oTable.getBinding("items").filter(aTableSearchState, "Application");
            },

            onSearchEmployee: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    this.onRefresh();
                } else {
                    const aTableSearchState = [];
                    const sQuery = oEvent.getParameter("query");

                    if (sQuery && sQuery.length > 0) {

                        aTableSearchState.push(new Filter({
                            filters: [
                                new Filter("first_name", FilterOperator.Contains, sQuery),
                                new Filter("last_name", FilterOperator.Contains, sQuery),

                            ],
                            and: false,
                        }));

                    }
                    aTableSearchState.push(new Filter("employee_type_ID", FilterOperator.EQ, "EM"))
                    this._applySearch(aTableSearchState);
                }
            },

            onSearchInspector: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    this.onRefresh();
                } else {
                    const aTableSearchState = [];
                    const sQuery = oEvent.getParameter("query");

                    if (sQuery && sQuery.length > 0) {

                        aTableSearchState.push(new Filter({
                            filters: [
                                new Filter("first_name", FilterOperator.Contains, sQuery),
                                new Filter("last_name", FilterOperator.Contains, sQuery)
                            ],
                            and: false,
                        }));

                    }
                    aTableSearchState.push(new Filter("employee_type_ID", FilterOperator.EQ, "JE"))
                    this._applySearch(aTableSearchState);
                }
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
                                new Filter("ID", FilterOperator.Contains, sQuery),
                            ],
                            and: false,
                        }));

                    }
                    this._applySearch(aTableSearchState);
                }
            },

            _applySearch: function (aTableSearchState) {
                const key = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/SelectedKey")
                let tableId;
                switch (key) {
                    case "gerencias":
                        tableId = "tableManagement"
                        break;
                    case "JE":
                        tableId = "tableInspector"
                        break;
                    case "EM":
                        tableId = "tableEmployee"
                        break;

                    default:
                        break;
                }
                const oTable = this.byId(tableId)
                oTable.getBinding("items").filter(aTableSearchState, "Application");
            },

            handleManagementDialog: function () {
                const key = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/SelectedKey")

                if (key === 'gerencias') {

                    const oView = this.getView();
                    if (!this.pDialogAlta) {
                        this.pDialogAlta = Fragment.load({
                            id: oView.getId(),
                            controller: this,
                            name: "com.aysa.pgo.abmAdmins.view.fragments.dialogs.ManagerDialog"
                        }).then(oDialog => {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this.pDialogAlta.then(oDialog => {
                        oDialog.open();
                    });
                } else {
                    const oView = this.getView();
                    if (!this.pDialog) {
                        this.pDialog = Fragment.load({
                            id: oView.getId(),
                            controller: this,
                            name: "com.aysa.pgo.abmAdmins.view.fragments.dialogs.InspectorDialog"
                        }).then(oDialog => {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }

                    this.pDialog.then(oDialog => {
                        oDialog.open();
                    });
                }
            },

            onFilterSelect: function (oEvent) {
                const selectedKey = oEvent.getSource().getSelectedKey()
                this.getOwnerComponent().getModel("AppJsonModel").setProperty('/SelectedKey', selectedKey)
            },

            onCreateInspector: async function () {
                const first_name = this.getView().byId("idInputName").getValue()
                const last_name = this.getView().byId("idInputLastName").getValue()
                const employee_type = this.getView().byId("selectTypeEmployee").getSelectedKey()
                const direction_ID = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/Direction").ID

                const newInspector = {
                    first_name,
                    last_name,
                    direction_ID,
                    employee_type_ID: employee_type
                }
                await Services.callPostService("Inspector", newInspector).then(async () => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    await Services.getInspectors(direction_ID).then(oData => {
                        oModel.setProperty("/Inspector", oData.value)
                    })
                })

            },

            onEditInspector: async function (oEvent) {
                const oView = this.getView();
                if (!this.pDialogEditInspector) {
                    this.pDialogEditInspector = Fragment.load({
                        id: oView.getId(),
                        controller: this,
                        name: "com.aysa.pgo.abmAdmins.view.fragments.dialogs.EditInspectorDialog"
                    }).then(oDialog => {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()

                this.pDialogEditInspector.then(async oDialog => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    await Services.getInspector(selectedRow.ID).then(oData => {
                        oModel.setProperty("/updateInspector", oData)
                    })
                    oDialog.open();
                });
            },

            onPressEditInspector: async function () {
                const first_name = this.getView().byId("idEditInputName").getValue()
                const last_name = this.getView().byId("idEditInputLastName").getValue()
                const employee_type_ID = this.getView().byId("selectEmployee").getSelectedKey()
                const ID = this.getView().byId("idEditId").getValue()
                const direction_ID = this.getView().byId("idEditDirectionId").getValue()

                const editInspector = {
                    first_name,
                    last_name,
                    direction_ID,
                    employee_type_ID
                }

                await Services.callUpdateService(`Inspector/${ID}`, editInspector).then(async () => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    await Services.getInspectors(direction_ID).then(oData => {
                        oModel.setProperty("/Inspector", oData.value)
                    })
                })
            },

            onPressDeleteInspector: async function (oEvent) {
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()
                const direction_ID = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/Direction").ID

                await Services.callDeleteService(`Inspector/${selectedRow.ID}`).then(async () => {

                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")

                    await Services.getInspectors(direction_ID).then(oData => {
                        oModel.setProperty("/Inspector", oData.value)
                    })
                })
            },

            onCreateManager: async function () {
                const ID = this.getView().byId("idInputID").getValue()
                const description = this.getView().byId("idInputDesc").getValue()
                const direction_ID = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/Direction").ID

                const newManager = {
                    ID,
                    description,
                    direction_ID,

                }
                const managers = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/AllManagers")

                const search = managers.find(manager => manager.ID === ID)
                const message = this.getResourceBundle().getText("noAuthGer")

                if (search === undefined && ID.toString().length === 2) {

                    await Services.callPostService("Manager", newManager).then(async () => {
                        const oModel = this.getOwnerComponent().getModel("AppJsonModel")

                        await Services.getManagers(direction_ID).then(oData => {
                            oModel.setProperty("/Manager", oData.value)
                        })
                    })
                } else {
                    MessageToast.show(message)
                }

            },

            onEditManager: async function (oEvent) {
                const oView = this.getView();
                if (!this.pDialogEditManager) {
                    this.pDialogEditManager = Fragment.load({
                        id: oView.getId(),
                        controller: this,
                        name: "com.aysa.pgo.abmAdmins.view.fragments.dialogs.EditManagerDialog"
                    }).then(oDialog => {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()

                this.pDialogEditManager.then(async oDialog => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    await Services.getManager(selectedRow.ID).then(oData => {
                        oModel.setProperty("/updateManager", oData)
                    })
                    oDialog.open();
                });
            },

            onPressEditManager: async function () {
                const ID = this.getView().byId("idEditInputID").getValue()
                const description = this.getView().byId("idEditInputDesc").getValue()
                const editManager = {
                    ID,
                    description
                }

                await Services.callUpdateService(`Manager/${editManager.ID}`, editManager).then(async () => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    const direction_ID = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/Direction").ID
                    await Services.getManagers(direction_ID).then(oData => {
                        oModel.setProperty("/Manager", oData.value)
                    })
                })
            },

            onPressDeleteManager: async function (oEvent) {
                const selectedRow = oEvent.getSource().getBindingContext("AppJsonModel").getObject()

                await Services.callDeleteService(`Manager/${selectedRow.ID}`).then(async () => {
                    const oModel = this.getOwnerComponent().getModel("AppJsonModel")
                    const direction_ID = this.getOwnerComponent().getModel("AppJsonModel").getProperty("/Direction").ID
                    await Services.getManagers(direction_ID).then(oData => {
                        oModel.setProperty("/Manager", oData.value)
                    })
                })
            },

            onCloseDialog: function () {
                this.byId("idManagerDialog").close()
            },

            onCloseDialogInspector: function () {
                this.byId("idInspectorDialog").close()
            },

            onCloseDialogEditInspector: function () {
                this.byId("idEditInspectorDialog").close()
            },

            onCloseDialogEditManager: function () {
                this.byId("idEditManagerDialog").close()
            },
        });
    }
);