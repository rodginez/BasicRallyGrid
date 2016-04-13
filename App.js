var myApp = Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
  //launch is called implicitly
    launch: function() {
      var store = this._loadData();
      this._loadGrid(store);
    },
    _loadData: function(){
      var myStore = Ext.create('Rally.data.wsapi.Store', {
          model: 'User Story',
          autoLoad: true,
          listeners:{
              load: function(store, data, success) {
                console.log('got data', myStore, data, success);
                //Grid has to be loaded from within the load function - asynchronous
              }, scope: this
          },
          fetch: ['FormattedID', 'Name', 'ScheduleState']
        }
      );
      return myStore;
    },
    _loadGrid: function(store){
      var myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: store,
        columnCfgs: ['FormattedID', 'Name', 'ScheduleState']
      });
      //Two different ways
      //First: explicitly refer to the app
      //Second: use the scope attribute to set this to the app
      //(at the time of the function creation this refers to the app!
      //myApp.add(myGrid);

      this.add(myGrid);
    }
});
