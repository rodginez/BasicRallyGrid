var myApp = Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
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
        listeners: {
          single: true,
          ready: function(combobox){
            //this._loadData()
            this._loadSeverities();
          },
          select: function(combobox, records){
            this._loadData();
          },
          scope: this,
        }
      });
      this.pullDownContainer.add(this.iterComboBox);

    },
    _loadSeverities: function(){
      this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
        model: 'Defect',
        field: 'Severity',
        listeners: {
          ready: function(){
            this._loadData();
          },
          select: function(){
            this._loadData();
          },
          scope: this
        }
      });
      this.pullDownContainer.add(this.severityComboBox);
    },

    _loadData: function(){
      var selectedRef = this.iterComboBox.getRecord().get('_ref');
      var selectedSevValue  = this.severityComboBox.getRecord().get('value');
      console.log('itCombo getRecord: ', this.iterComboBox.getRecord());
      console.log('sevCombo getRecord: ', this.severityComboBox.getRecord());

      var myFilters = [
            {
              property: 'Iteration',
              operation: '=',
              value: selectedRef
            },
            {
              property: 'Severity',
              operation: '=',
              value: selectedSevValue
            }
          ];

      //If store exists, reload it
      if (this.defectStore){
        this.defectStore.setFilter(myFilters);
        this.defectStore.load();
      } else {
        console.log('Creating store...');
        this.defectStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'Defect',
            autoLoad: true,
            filters: myFilters,
            listeners:{
                load: function(store, data, success) {
                  //console.log('got data', myStore, data, success);
                  //Grid has to be loaded from within the load function - asynchronous
                  this._loadGrid();
                }, scope: this
            },
            fetch: ['FormattedID', 'Name', 'ScheduleState',  'Blocked', 'Severity', 'Iteration']
          }
        );
      }
    },
    _loadGrid: function(){
      if (this.defectGrid){
        console.log('Creating defectGrid');
      } else {
        console.log('no defectGrid');
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
