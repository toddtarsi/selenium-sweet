// Init namespace.
var selenium_sweet = {
  shutdown: function() {},
};

// Strings
// en
var m = builder.translate.locales['en'].mapping;
m.__selenium_sweet_settings = "Selenium Sweet Settings";
m.__selenium_sweet_active = "Activate External Step Source"
m.__selenium_sweet_owner_name = "Repo owner name";
m.__selenium_sweet_repo_name = "Repo name";
m.__selenium_sweet_branch_name = "Branch name";
m.__selenium_sweet_stepData_path = "Path to step json";
m.__selenium_sweet_stepCategories_path = "Path to step categories json";
m.__selenium_sweet_failure = "Selenium Sweet Configuration Failure";
m.__selenium_sweet_failure_failed_to_load_stepData = "Failed to load in the step data json file from github";
m.__selenium_sweet_failure_failed_to_load_stepCategories = "Failed to load in the step categories json file from github";
m.__selenium_sweet_failure_needs_github_integration = "Selenium Sweet must have a base github integration to derive from";
m.__selenium_sweet_failure_needs_valid_github_path = "Selenium Sweet must have a valid github path to assemble steps and categories from";
m.__selenium_sweet_external_step_source = "External step data source";
m.__selenium_sweet_external_step_source_desc = "Using these fields, you can override the cooked in step list with your own custom step and parameter combinations";
m.__selenium_sweet_success = "Selenium Sweet Configuration Success";
m.__selenium_sweet_success_desc = "Congratulations! Selenium Sweet is pulling in custom step and category data correctly!";
m.__selenium_sweet_failure_needs_valid_github_path = "Selenium Sweet must have a valid github path to assemble steps and categories from";
m.__selenium_sweet_validating_config_changes = "Validating configuration changes";
m.__selenium_sweet_validating_config_changes_desc = "Pulling in files from github and testing for compatibility.";

/* Helper db method first */
var execute = function(block, args) {
  return function() {
    // console.log("Executing", block, args);
    return builder.plugins.db.execute(block.join(" "), args);
  };
};

/* The Database / SQLite API */
selenium_sweet.db = {
  table: {
    create: function(name, fieldList) {
      if(!fieldList.indexOf('id varchar(255)') === -1) {
        throw new Error("To create a table, an ID field must be specified");
      }
      return execute([
        "CREATE TABLE",
        name,
        "(" + fieldList.join(', ') + ")"
      ]);
    },
    createIfNotExists: function(name, fieldList) {
      return function() {
        return new Promise(function(resolve, reject) {
          return builder.plugins.db
            .tableExists(name)
            .then(function(exists) {
              if (exists) return resolve();
              return selenium_sweet.db.table
                .create(name, fieldList)()
                .then(function(err) {
                  if (err) return reject(err);
                  return resolve();
                });
            });
        });
      };
    },
    read: function(name) {
      return execute([
        "SELECT * FROM",
        name,
      ]);
    },
    delete: function(name) {
      return execute([
        "DROP TABLE IF EXISTS",
        name,
      ]);
    },
  },
  row: {
    insert: function(name, obj) {
      var fields = []
      jQuery.each(obj, function(key, value) {
        fields.push(':' + key);
      });
      return execute([
        "INSERT INTO",
        name,
        'VALUES',
        '(' + fields.join(', ') + ')'
      ], obj);
    },
    insertIfNoID: function(name, obj) {
      return function() {
        return new Promise(function(resolve, reject) {
          var id = obj.id;
          return execute(["SELECT * FROM", name, "WHERE id=:id"], { id: id })()
            .then(function(rows) {
              if (rows.length) return resolve();
              return selenium_sweet.db.row
                .insert(name, obj)()
                .then(function(err) {
                  if (err) return reject(err);
                  return resolve();
                });
            });
        });
      };
    },
    update: function(name, obj) {
      var id = '';
      var fields = []
      jQuery.each(obj, function(key, value) {
        if (key === 'id') id = value;
        else fields.push(key + "=:" + key);
      });
      return execute([
        "UPDATE",
        name,
        'SET',
        fields.join(' AND '),
        "WHERE id=:id" 
      ], obj);
    },
  },
};

/* The Configuration API */
selenium_sweet.config = {
  _data: {
    active: 'N',
    validated: 'N',
    owner: '',
    repo: '',
    branch: 'master',
    stepDataPath: 'step_data.json',
    stepCategoriesPath: 'step_categories.json', 
  },
  /* Instantiate our attributes */
  init: function() {
    builder.plugins.db
      .tableExists('seleniumSweetConfig')
      .then(function(exists) {
        var firstCommand;
        var config = selenium_sweet.config.read();
        return selenium_sweet.db.table.createIfNotExists('seleniumSweetConfig', ['id varchar(255)', 'value varchar(255)'])()
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "validated", value: config.validated }))
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "active", value: config.active }))
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "owner", value: config.owner }))
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "repo", value: config.repo }))
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "branch", value: config.branch }))
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "stepDataPath", value: config.stepDataPath }))
          .then(selenium_sweet.db.row.insertIfNoID('seleniumSweetConfig', { id: "stepCategoriesPath", value: config.stepCategoriesPath }))
          .then(selenium_sweet.db.table.read('seleniumSweetConfig'))
          .then(updateConfigWithData)
          .then(function() {
            if (config.active == "Y") return selenium_sweet
              .replaceStepsFromGitHub()
              .catch(function(err) {
                var sp = selenium_sweet.settingsPanel;
                sp.update(sp._dialogs.failure(err, false));
              });
          });
        
        function updateConfigWithData(tableRows) {
          return new Promise(function(resolve, reject) {
            jQuery.each(tableRows, function(index, row) {
              config[row.getResultByName('id')] = row.getResultByName('value');
            });
            resolve();
          });
        }
      });
  },
  read: function() {
    return selenium_sweet.config._data;
  },
  update: function(data) {
    selenium_sweet.config._data = data;
    return selenium_sweet.db.row.update('seleniumSweetConfig', { id: "validated", value: "N" })()
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "active", value: data.active }))
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "owner", value: data.owner }))
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "repo", value: data.repo }))
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "branch", value: data.branch }))
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "stepDataPath", value: data.stepDataPath }))
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "stepCategoriesPath", value: data.stepCategoriesPath }))
  },
  delete: selenium_sweet.db.table.delete('seleniumSweetConfig'),
};

/* The Primary Configuration Dialog */
selenium_sweet.settingsPanel = {
  dialog: null,
  hide: function() {
    jQuery(selenium_sweet.settingsPanel.dialog).remove();
    selenium_sweet.settingsPanel.dialog = null;
  },
  show: function(settingsPanel) {
    if (selenium_sweet.settingsPanel.dialog) { return; }
    selenium_sweet.settingsPanel.dialog = settingsPanel;
    builder.dialogs.show(selenium_sweet.settingsPanel.dialog);
  },
  update: function(settingsPanel) {
    selenium_sweet.settingsPanel.hide();
    selenium_sweet.settingsPanel.show(settingsPanel);
  },
  _dialogs: {
    failure: function(failure_string, returnToForm) {
      return newNode('div', {'class': 'dialog'},
        newNode('h3', _t('__selenium_sweet_failure')),
        newNode('h4', _t('__selenium_sweet_failure_' + failure_string)),
        newNode('a', {'href': '#', 'class': 'button', 'id': 'selenium_sweet-ok', 'click': function() {
          var sp = selenium_sweet.settingsPanel;
          if (returnToForm) sp.update(sp._dialogs.main());
          else sp.hide();
        }}, _t('ok')),
      );
    },
    success: function() {
      return newNode('div', {'class': 'dialog'},
        newNode('h3', _t('__selenium_sweet_success')),
        newNode('h4', _t('__selenium_sweet_success_desc')),
        newNode('a', {'href': '#', 'class': 'button', 'id': 'selenium_sweet-ok', 'click': function() {
          selenium_sweet.settingsPanel.hide();
        }}, _t('ok')),
      );
    },
    validating: function() {
      return newNode('div', {'class': 'dialog'},
        newNode('h3', _t('__selenium_sweet_validating_config_changes')),
        newNode('p', _t('__selenium_sweet_validating_config_changes_desc')),
      );
    },
    main: function() {
      var config = selenium_sweet.config.read();
      return newNode('div', {'class': 'dialog'},
        newNode('h3', _t('__selenium_sweet_settings')),
        newNode('h4', _t('__selenium_sweet_external_step_source')),
        newNode('p', _t('__selenium_sweet_external_step_source_desc')),
        newNode('table', {style: 'border: none;', id: 'settings-table'},
          newNode('tr',
            newNode('td', _t('__selenium_sweet_active') + " "),
            newNode('td', newNode('input', {id: 'selenium-sweet-active', type: 'checkbox', checked: config.active === "Y" }))
          ),
          newNode('tr',
            newNode('td', _t('__selenium_sweet_owner_name') + " "),
            newNode('td', newNode('input', {id: 'selenium-sweet-owner-name', type: 'text', value: config.owner}))
          ),
          newNode('tr',
            newNode('td', _t('__selenium_sweet_repo_name') + " "),
            newNode('td', newNode('input', {id: 'selenium-sweet-repo-name', type: 'text', value: config.repo}))
          ),
          newNode('tr',
            newNode('td', _t('__selenium_sweet_branch_name') + " "),
            newNode('td', newNode('input', {id: 'selenium-sweet-branch-name', type: 'text', value: config.branch}))
          ),
          newNode('tr',
            newNode('td', _t('__selenium_sweet_stepData_path') + " "),
            newNode('td', newNode('input', {id: 'selenium-sweet-step-data-path', type: 'text', value: config.stepDataPath}))
          ),
          newNode('tr',
            newNode('td', _t('__selenium_sweet_stepCategories_path') + " "),
            newNode('td', newNode('input', {id: 'selenium-sweet-step-categories-path', type: 'text', value: config.stepCategoriesPath}))
          )
        ),
        newNode('a', {'href': '#', 'class': 'button', 'id': 'selenium-sweet-ok', 'click': function() {
          var sp = selenium_sweet.settingsPanel;
          var gh = selenium_sweet.github_integration;
          var active = jQuery('#selenium-sweet-active').is(':checked') ? "Y" : "N";
          var owner = jQuery('#selenium-sweet-owner-name').val();
          var repo = jQuery('#selenium-sweet-repo-name').val();
          var branch = jQuery('#selenium-sweet-branch-name').val();
          var stepDataPath = jQuery('#selenium-sweet-step-data-path').val();
          var stepCategoriesPath = jQuery('#selenium-sweet-step-categories-path').val();
          selenium_sweet.config.update({
            validated: 'N',
            active: active,
            owner: owner,
            repo: repo,
            branch: branch,
            stepDataPath: stepDataPath,
            stepCategoriesPath: stepCategoriesPath
          });
          if (active !== "Y") return sp.hide();

          sp.update(sp._dialogs.validating());
          return selenium_sweet
            .replaceStepsFromGitHub()
            .then(function(res){
              sp.update(sp._dialogs.success());
            })
            .catch(function(err) {
              sp.update(sp._dialogs.failure(err, true));
            });
        }}, _t('ok')),
        newNode('a', {'href': '#', 'class': 'button', 'id': 'selenium-sweet-cancel', 'click': function() {
          selenium_sweet.settingsPanel.hide();
        }}, _t('cancel'))
      );
    }
  }
};

/* The Calls against the GitHub API */
selenium_sweet.github_integration = {
  applyStepTypeData: function(data) {
    return new Promise(function(resolve, reject) {
      // First we apply our new step types
      builder.selenium2.docs = data.stepData;
      var stepData = {};
      for (var stepName in data.stepData) {
        var step = data.stepData[stepName];
        if (!step.params) stepData[stepName] = [];
        else stepData[stepName] = jQuery.map(step.params, function(param, name) {
          return name;
        });
      }
      builder.selenium2.__stepData = stepData;
      builder.selenium2.stepTypes = {};
      for (var n in stepData) {
        builder.selenium2.stepTypes[n] = new builder.selenium2.StepType(n);
      }
      builder.selenium2.defaultStepType = builder.selenium2.stepTypes.clickElement;
      builder.selenium2.navigateToUrlStepType = builder.selenium2.stepTypes.get;
  
      // Next we apply our new step categories
      var stepCategories = data.stepCategories;
      builder.selenium2.categories = jQuery.map(
        stepCategories,
        function(category, index) {
          return [[
            category.name,
            jQuery.map(
              category.steps,
              function(stepType) {
                return builder.selenium2.stepTypes[stepType];
              }
            )
          ]];
        }
      );
      resolve();
    });
  },
  loadStepTypeData: function(data) {
    var config = selenium_sweet.config.read();
    var username = github_integration.getCredentials().username;
    var owner = config.owner;
    var repo = config.repo;
    var branch = config.branch;

    return new Promise(function(resolve, reject) {
      var remaining = 2;
      var rv = { stepData: {}, stepCategories: [] };
      loadToPathProp('stepData');
      loadToPathProp('stepCategories');
  
      function loadToPathProp(propName) {
        return github_integration.tryLoading(
          [username, owner, repo, branch]
            .concat(config[propName + 'Path'])
            .join("/"),
          function (data) {
            try {
              rv[propName] = JSON.parse(data);
              if (--remaining === 0) {
                resolve(rv);
              }
            }
            catch (err) {
              console.error(err);
              reject('invalid_json_' + propName);
            }
          },
          function (err) {
            reject('failed_to_load_' + propName);
          },
        );
      }
    });
  },
};

/* This is the main operation, which reads github for custom step and category json */
selenium_sweet.replaceStepsFromGitHub = function() {
  return new Promise(function (resolve, reject) {
    var gh = selenium_sweet.github_integration;
    return gh
      .loadStepTypeData()
      .then(gh.applyStepTypeData)
      .then(selenium_sweet.db.row.update('seleniumSweetConfig', { id: "validated", value: "Y" }))
      .then(resolve)
      .catch(function(err){
        selenium_sweet.db.row.update('seleniumSweetConfig', { id: "validated", value: "N" })
        reject(err);
      });
  });
};

/* The Initial run loop */
builder.registerPostLoadHook(function() {
  selenium_sweet.config.init();
  builder.gui.addStartupEntry(_t('__selenium_sweet_settings'), 'startup-settings-selenium-sweet', function() {
    var dialog;
    var dialogs = selenium_sweet.settingsPanel._dialogs;
    if (!github_integration) dialog = dialogs.failure('needs_github_integration');
    else dialog = dialogs.main();
    selenium_sweet.settingsPanel.show(dialog);
  });
});
