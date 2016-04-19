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
      //var store = this._loadData();
      this.pullDownContainer = Ext.create('Ext.container.Container',{
        id: 'pullDownContainerAC',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
      });
      this.add(this.pullDownContainer);
      this._loadIterations();
    },

    _loadIterations: function(){
      this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
        itemID: 'cb_iteration',
        width: 300,
        fieldLabel: 'Iteration',
        labelAlign: 'right',
        listeners: {
          ready: this._loadSeverities,
          select: this._loadData,
          scope: this,
        }
      });
      this.pullDownContainer.add(this.iterComboBox);

    },
    _loadSeverities: function(){
      this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
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
      this.pullDownContainer.add(this.severityComboBox);
    },

    _loadData: function(){
      var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
      var selectedSevValue  = this.severityComboBox.getRecord().get('value');
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

      //If store exists, reload it
      if (this.defectStore){
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
      if (this.defectGrid){
        //console.log('Creating defectGrid');
      } else {
        //console.log('no defectGrid');
        this.defectGrid = Ext.create('Rally.ui.grid.Grid', {
          store: this.defectStore,
          columnCfgs: ['FormattedID', 'Name', 'ScheduleState', 'Blocked', 'Severity', 'Iteration']
        });
        this.add(this.defectGrid);
      }
      //Two different ways
      //First: explicitly refer to the app
      //Second: use the scope attribute to set this to the app
      //(at the time of the function creation this refers to the app!
    }
});
