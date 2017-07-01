const stepTypes = require('se-builder-transpiler/stepTypes');
const { createLangFormatter } = require('se-builder-transpiler');

module.exports = createLangFormatter({
  name: "Tiny Example",
  extension: ".tiny",
  not: "not",
  start: `[start]\n`,
  end: `[end]\n`,
  lineForType: {
    "get": `get! {url}\n`,
    "clickElement": `click! {locatorBy} - {locator}\n`,
    "setElementText": `type! {locatorBy} - {locator} - {text}\n`,
  },
  waitFor: "",
  assert: (step, escapeValue, doSubs, getter) => doSubs(`
    {getter}
      {value} must ${negated ? 'not' : ''} equal {cmp}
    {getterFinish}
  `, getter),
  verify: (step, escapeValue, doSubs, getter) => doSubs(`
    {getter}
      {value} does ${negated ? 'not' : ''} equal {cmp} ?
    {getterFinish}
  `, getter),
  getters: {
    "Text": {
      getter: `get some text at {locatorBy} - {locator}\n`,
      getterFinish: "okay done with that stuff!",
      cmp: "{text}",
      value: "text"
    },
  },
  escapeValue: function(stepType, value, pName) {
    var output = "", lastChunk = "", hasDollar = false, insideVar = false, varName = "";
    for (var i = 0; i < value.length; i++) {
      var ch = value.substring(i, i + 1);
      if (insideVar) {
        if (ch === "}") {
          insideVar = hasDollar = false;
          varName = "";
        }
        else varName += ch;
      } else {
        if (hasDollar) {
          if (ch == "{") {
            insideVar = true;
            if (lastChunk.length > 0) output += lastChunk;
            lastChunk = "";
          }
          else lastChunk += "$" + ch;
        } else {
          if (ch == "$") hasDollar = true;
          else lastChunk += ch;
        }
      }
    }
    if (lastChunk.length > 0) output += lastChunk;
    return output;
  },
  locatorByForType: function(stepType, locatorType, locatorIndex) {
    if(locatorType === "xpath"){ return "XPath"; }
    return locatorType.split(" ").map(function(el) {
      return el.charAt(0).toUpperCase() + el.slice(1);
    }).join("");
  },
  usedVar: function(varName, varType) { return "VARS." + varName; },
  unusedVar: function(varName, varType) { return "VARS." + varName; }
});
