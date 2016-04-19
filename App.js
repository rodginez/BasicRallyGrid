var myApp = Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    defectGrid: undefined,
    defectStore: undefined,

    _getFilters: function(iterationValue, severityValue){
      var iterationFilter = Ext.create('Rally.data.wsapi.Filter', {
        property: 'Iteration',
        operation: '=',
        value: iterationValue
      });

      var severityFilter = Ext.create('Rally.data.wsapi.Filter', {
        property: 'Severity',
        operation: '=',
        value: severityValue
      });


      return iterationFilter.and(severityFilter);
    },

  //launch is called implicitly
    launch: function() {
      /*
      Explicit declaration
      var pullDownContainer = Ext.create('Ext.container.Container',{
        itemId: 'pullDownContainer',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
      });
*/
      var pullDownContainer = {
        xtype: 'container',
        itemId: 'pullDownContainer',
        layout: {
            type: 'hbox',
            align: 'stretch'
        }
      }
      //The component is created only when this line is executed
      this.add(pullDownContainer);
      this._loadIterations();
    },

    _loadIterations: function(){
      var iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
        itemId: 'iterComboBox',
        width: 300,
        fieldLabel: 'Iteration',
        labelAlign: 'right',
        listeners: {
          ready: this._loadSeverities,
          select: this._loadData,
          scope: this,
        }
      });
      var container = this.getComponent('pullDownContainer');
      container.add(iterComboBox);
    },
    _loadSeverities: function(){
      var severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
        itemId: 'sevComboBox',
        model: 'Defect',
        width: 300,
        fieldLabel: 'Severity',
        field: 'Severity',
        labelAlign: 'right',
        listeners: {
          ready: this._loadData,
          select: this._loadData,
          scope: this
        }
      });
      var container = this.getComponent('pullDownContainer');
      container.add(severityComboBox);
    },

    _loadData: function(){
      var pullDownContainer = this.getComponent('pullDownContainer');
      var sevComboBox = pullDownContainer.getComponent('sevComboBox');
      var iterComboBox = pullDownContainer.getComponent('iterComboBox');

      var selectedIterRef = iterComboBox.getRecord().get('_ref');
      var selectedSevValue  = sevComboBox.getRecord().get('value');

      var blockedFilter = Ext.create('Rally.data.wsapi.Filter', {
        property: 'Blocked',
        operation: '=',
        value: true
      });

      var iterAndSev = this._getFilters(selectedIterRef, selectedSevValue);
      var orFilter = iterAndSev.or(blockedFilter);

      console.log('combo filter', this._getFilters(selectedIterRef, selectedSevValue).toString());
      console.log('or Filter', orFilter.toString());

      //If store exists, reload it
      if (this.defectStore){
        this.defectStore.setFilter(orFilter);
        this.defectStore.load();
      } else {
        console.log('Creating store...');
        this.defectStore = Ext.create('Rally.data.wsapi.Store', {
            itemId: 'defectStore',
            model: 'Defect',
            autoLoad: true,
            filters: orFilter,
            listeners:{
                load: function(store, data, success) {
                  //console.log('got data', myStore, data, success);
                  //Grid has to be loaded from within the load function - asynchronous
                  this._createGrid();
                }, scope: this
            },
            fetch: ['FormattedID', 'Name', 'ScheduleState',  'Blocked', 'Severity', 'Iteration']
          }
        );
      }
    },
    _createGrid: function(){
      var defectGrid = this.getComponent('defectGrid');

      if (defectGrid){
        //console.log('defectGrid exists');
      } else {
        //console.log('no defectGrid');
        defectGrid = Ext.create('Rally.ui.grid.Grid', {
          itemId: 'defectGrid',
          store: this.defectStore,
          columnCfgs: ['FormattedID', 'Name', 'ScheduleState', 'Blocked', 'Severity', 'Iteration']
        });
        this.add(defectGrid);
      }
      //Two different ways
      //First: explicitly refer to the app
      //Second: use the scope attribute to set this to the app
      //(at the time of the function creation this refers to the app!
    }
});
