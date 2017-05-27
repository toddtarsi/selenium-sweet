const locator = require('./locator');
const Script = require('./script');
const stepTypes = require('./stepTypes');
const { stepFromJSON } = require('./step');

/**
 * Code for exporting/importing Selenium 2 scripts in a variety of formats.
*/
const parseScript = function(text) {
  var scriptJSON = JSON.parse(text);
  var script = new Script('selenium2');
  var known_unknowns = [];
  var ko_string = "";
  for (var i = 0; i < scriptJSON.steps.length; i++) {
    var typeName = scriptJSON.steps[i].type;
    if (!stepTypes[typeName] && known_unknowns.indexOf(typeName) == -1) {
      if (known_unknowns.length > 0) {
        ko_string += ", ";
      }
      ko_string += typeName;
      known_unknowns.push(typeName);
    }
  }
  if (known_unknowns.length > 0) {
    throw new Error(_t("sel1_no_command_found") + ": " + ko_string);
  }
  
  for (var i = 0; i < scriptJSON.steps.length; i++) {
    script.steps.push(stepFromJSON(scriptJSON.steps[i], 'selenium2'));
  }
  
  script.timeoutSeconds = scriptJSON.timeoutSeconds || 60;
  if (scriptJSON.data) {
    script.data = scriptJSON.data;
  }
  if (scriptJSON.inputs) {
    script.inputs = scriptJSON.inputs;
  }
  
  return script;
};

/*
  How this tool abstracts to almost every language:
    Constraints:
      - Scopes entered must be equal to scopes exited
      - Code path must flow linearly from top to bottom
      - Other than that, we're basically good.
    Transpiling:
      - 
    Features 
    - First we attach a static start block
      - By letting anything be written here
    - For every step in the json process, we 
    - Last we attach an end

*/
const makeDoSubs = (script, step, name, userParams, used_vars, lang_info) => (line, extras) => {
  if (extras) {
    for (var k in extras) {
      var v = doSubs(extras[k]);
      line = line.replace(new RegExp("\\{" + k + "\\}", "g"), v);
    }
  
  line = line.replace(new RegExp("\\{stepTypeName\\}", "g"), step.type.name);
  for (var k in userParams) {
    line = line.replace(new RegExp("\\{" + k + "\\}", "g"), userParams[k]);
  }
  var pNames = step.getParamNames();
  for (var j = 0; j < pNames.length; j++) {
    if (step.type.getParamType(pNames[j]) == "locator") {
      line = line.replace(new RegExp("\\{" + pNames[j] + "\\}", "g"), lang_info.escapeValue(step.type, step[pNames[j]].getValue(), pNames[j]));
      line = line.replace(new RegExp("\\{" + pNames[j] + "By\\}", "g"), lang_info.locatorByForType(step.type, step[pNames[j]].getName('selenium2'), j + 1));
    } else {
      line = line.replace(new RegExp("\\{" + pNames[j] + "\\}", "g"), lang_info.escapeValue(step.type, step[pNames[j]], pNames[j]));
    }
  }
  // Depending on whether the step is negated, put in the appropriate logical nots.
  if (step.negated) {
    line = line.replace(new RegExp("\\{posNot\\}", "g"), "");
    line = line.replace(new RegExp("\\{negNot\\}", "g"), lang_info.not);
  } else {
    line = line.replace(new RegExp("\\{posNot\\}", "g"), lang_info.not);
    line = line.replace(new RegExp("\\{negNot\\}", "g"), "");
  }
  // Finally, sub in any lang_info keys required.
  for (var k in lang_info) {
    line = line.replace(new RegExp("\\{" + k + "\\}", "g"), lang_info[k]);
  }
  // Replace ${foo} with the necessary invocation of the variable, eg "String foo" or "var foo".
  var l2 = "";
  var hasDollar = false;
  var insideVar = false;
  var varName = "";
  for (var j = 0; j < line.length; j++) {
    var ch = line.substring(j, j + 1);
    if (insideVar) {
      if (ch == "}") {
        var spl = varName.split(":", 2);
        var varType = spl.length == 2 ? spl[1] : null;
        varName = spl[0];
        if (used_vars[varName]) {
          l2 += lang_info.usedVar(varName, varType);
        } else {
          l2 += lang_info.unusedVar(varName, varType);
          used_vars[varName] = true;
        }
        insideVar = false;
        hasDollar = false;
        varName = "";
      } else {
        varName += ch;
      }
    } else {
      // !insideVar
      if (hasDollar) {
        if (ch == "{") { insideVar = true; } else { hasDollar = false; l2 += "$" + ch; }
      } else {
        if (ch == "$") { hasDollar = true; } else { l2 += ch; }
      }
    }
  }
  
  return l2;
};

const canExport = (lang_info, stepType) => {
  var lft = lang_info.lineForType[stepType.name];
  if (lft !== undefined) { return true; }
  if (!lang_info.getters || !lang_info.boolean_getters) { return false; }
  var booleanVersion = false;
  for (var b = 0; b < 2; b++) {
    var stepFlavors = ["assert", "verify", "waitFor", "store"];
    for (var f = 0; f < stepFlavors.length; f++) {
      var flavor_key = (booleanVersion ? "boolean_" : "") + stepFlavors[f];
      if (stepType.name.startsWith(stepFlavors[f]) && lang_info[flavor_key] !== undefined) {
        var getter_name = stepType.name.substring(stepFlavors[f].length);
        var getter = booleanVersion ? lang_info.boolean_getters[getter_name] : lang_info.getters[getter_name];
        if (getter !== undefined) { return true; }
      }
    }
    booleanVersion = true;
  }
  return false;
};

const createLangFormatter = lang_info => ({
  name: lang_info.name,
  extension: lang_info.extension,
  get_params: lang_info.get_params || null,
  format: (script, name, userParams) => {
    var t = "";
    var start = lang_info.start;
    for (var k in lang_info) {
      start = start.replace(new RegExp("\\{" + k + "\\}", "g"), lang_info[k]);
    }
    for (var k in userParams) {
      start = start.replace(new RegExp("\\{" + k + "\\}", "g"), userParams[k]);
    }
    start = start.replace(/\{scriptName\}/g, name.substr(0, name.indexOf(".")));
    start = start.replace(/\{timeoutSeconds\}/g, "" + script.timeoutSeconds);
    t += start;
    var used_vars = {};
    stepsLoop: for (var i = 0; i < script.steps.length; i++) {
      var step = script.steps[i];
      var doSubs = makeDoSubs(script, step, name, userParams, used_vars, lang_info);
      var line = lang_info.lineForType[step.type.name];
      if (typeof line != 'undefined') {
        if (line instanceof Function) {
          t += line(step, lang_info.escapeValue, userParams, doSubs);
        } else {
          t += doSubs(line);
        }
      } else {
        var booleanVersion = false;
        for (var b = 0; b < 2; b++) {
          var stepFlavors = ["assert", "verify", "waitFor", "store"];
          for (var f = 0; f < stepFlavors.length; f++) {
            var flavor_key = (booleanVersion ? "boolean_" : "") + stepFlavors[f];
            if (step.type.name.startsWith(stepFlavors[f]) && lang_info[flavor_key] !== undefined) {
              var flavor = lang_info[flavor_key];
              var getter_name = step.type.name.substring(stepFlavors[f].length);
              var getter = booleanVersion ? lang_info.boolean_getters[getter_name] : lang_info.getters[getter_name];
              if (getter !== undefined) {
                if (flavor instanceof Function) {
                  t += flavor(step, lang_info.escapeValue, doSubs, getter);
                } else {
                  t += doSubs(flavor, getter);
                }
                continue stepsLoop;
              }
            }
          }
          booleanVersion = true;
        }
        throw new Error('sel2_cant_export_step_type ' + step.type.name);
      }
    }
    var end = lang_info.end;
    for (var k in lang_info) {
      end = end.replace(new RegExp("\\{" + k + "\\}", "g"), lang_info[k]);
    }
    for (var k in userParams) {
      end = end.replace(new RegExp("\\{" + k + "\\}", "g"), userParams[k]);
    }
    end = end.replace(/\{scriptName\}/g, name.substr(0, name.indexOf(".")));
    t += end;
    return t;
  },
  canExport: stepType => canExport(lang_info, stepType),
  nonExportables: script => script.steps.filter(
    step => nes.indexOf(step.type.name) == -1 && !canExport(lang_info, step.type)
  ),
});

const createDerivedLangFormatter = (original, lang_info_diff) => Object.assign(
  original,
  lang_info_diff
);


module.exports = {
  createLangFormatter,
  createDerivedLangFormatter,
  canExport,
  parseScript
};
