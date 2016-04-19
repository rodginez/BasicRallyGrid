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
      var pullDownContainer = Ext.create('Ext.container.Container',{
        itemId: 'pullDownContainer',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
      });
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
      //this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
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
//      var iterComboBox = pullDownContainer.getComponent('iterComboBox');

      var iterComboBox = this.down('iterComboBox');
      var sevComboBox = pullDownContainer.getComponent('sevComboBox');

      var selectedIterRef = iterComboBox.getRecord().get('_ref');
      var selectedSevValue  = sevComboBox.getRecord().get('value');
      //console.log('itCombo getRecord: ', this.iterComboBox.getRecord());
      //console.log('sevCombo getRecord: ', this.severityComboBox.getRecord());

      var blockedFilter = Ext.create('Rally.data.wsapi.Filter', {
        property: 'Blocked',
        operation: '=',
        value: true
      });

      var iterAndSev = this._getFilters(selectedIterRef, selectedSevValue);
      var orFilter = iterAndSev.or(blockedFilter);

      console.log('combo filter', this._getFilters(selectedIterRef, selectedSevValue).toString());
      console.log('or Filter', orFilter.toString());

      var defectStore = this.defectStore;
      //If store exists, reload it
      if (defectStore){
        this.defectStore.setFilter(orFilter);
        this.defectStore.load();
      } else {
        console.log('Creating store...');
        this.defectStore = Ext.create('Rally.data.wsapi.Store', {
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
      var defectStore = this.getComponent('defectStore');

      if (defectGrid){
        //console.log('Creating defectGrid');
      } else {
        //console.log('no defectGrid');
        defectGrid = Ext.create('Rally.ui.grid.Grid', {
          itemId: 'defectGrid',
          store: defectStore,
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
