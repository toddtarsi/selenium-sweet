const StepType = function(name) {
  this.name = name;
};

StepType.prototype = {
  /** @return The type's name. */
  getName: function() {
    return this.name;
  },
  /** @return List of parameter names. */
  getParamNames: function() {
    return __stepData[this.name];
  },
  /** @return Whether the given parameter is a "locator" or "string". */
  getParamType: function(paramName) {
    return paramName.toLowerCase().indexOf("locator") != -1 ? "locator" : "string";
  },
  /** @return Whether setting negated to true on a step of this type is valid. */
  getNegatable: function() {
    return (
      this.name.startsWith("waitFor") ||
      this.name.startsWith("assert") ||
      this.name.startsWith("verify")
    );
  },
};

/** Internal step data - converted into stepTypes below. */
const __stepData = {
  "get":                             ["url"], 
  "goBack":                          [], 
  "goForward":                       [], 
  "clickElement":                    ["locator"], 
  "setElementText":                  ["locator", "text"], 
  "sendKeysToElement":               ["locator", "text"], 
  "clickElementWithOffset":          ["locator", "offset"],
  "doubleClickElement":              ["locator"],
  "mouseOverElement":                ["locator"],
  "dragToAndDropElement":            ["locator", "targetLocator"], 
  "clickAndHoldElement":             ["locator"], 
  "releaseElement":                  ["locator"], 
  "setElementSelected":              ["locator"], 
  "clearSelections":                 ["locator"], 
  "setElementNotSelected":           ["locator"], 
  "submitElement":                   ["locator"], 
  "close":                           [], 
  "refresh":                         [], 
  "assertTextPresent":               ["text"], 
  "verifyTextPresent":               ["text"], 
  "waitForTextPresent":              ["text"], 
  "storeTextPresent":                ["text", "variable"], 
  "assertBodyText":                  ["text"], 
  "verifyBodyText":                  ["text"], 
  "waitForBodyText":                 ["text"], 
  "storeBodyText":                   ["variable"], 
  "assertElementPresent":            ["locator"], 
  "verifyElementPresent":            ["locator"], 
  "waitForElementPresent":           ["locator"], 
  "storeElementPresent":             ["locator", "variable"], 
  "assertPageSource":                ["source"], 
  "verifyPageSource":                ["source"], 
  "waitForPageSource":               ["source"], 
  "storePageSource":                 ["variable"], 
  "assertText":                      ["locator", "text"], 
  "verifyText":                      ["locator", "text"], 
  "waitForText":                     ["locator", "text"], 
  "storeText":                       ["locator", "variable"], 
  "assertCurrentUrl":                ["url"], 
  "verifyCurrentUrl":                ["url"], 
  "waitForCurrentUrl":               ["url"], 
  "storeCurrentUrl":                 ["variable"], 
  "assertTitle":                     ["title"], 
  "verifyTitle":                     ["title"], 
  "waitForTitle":                    ["title"], 
  "storeTitle":                      ["variable"], 
  "assertElementAttribute":          ["locator", "attributeName", "value"], 
  "verifyElementAttribute":          ["locator", "attributeName", "value"], 
  "waitForElementAttribute":         ["locator", "attributeName", "value"], 
  "storeElementAttribute":           ["locator", "attributeName", "variable"], 
  "assertElementStyle":              ["locator", "propertyName", "value"], 
  "verifyElementStyle":              ["locator", "propertyName", "value"], 
  "waitForElementStyle":             ["locator", "propertyName", "value"], 
  "storeElementStyle":               ["locator", "propertyName", "variable"],
  "assertElementSelected":           ["locator"], 
  "verifyElementSelected":           ["locator"], 
  "waitForElementSelected":          ["locator"], 
  "storeElementSelected":            ["locator", "variable"], 
  "assertElementValue":              ["locator", "value"], 
  "verifyElementValue":              ["locator", "value"], 
  "waitForElementValue":             ["locator", "value"], 
  "storeElementValue":               ["locator", "variable"], 
  "addCookie":                       ["name", "value", "options"], 
  "deleteCookie":                    ["name"], 
  "assertCookieByName":              ["name", "value"], 
  "verifyCookieByName":              ["name", "value"], 
  "waitForCookieByName":             ["name", "value"], 
  "storeCookieByName":               ["name", "variable"], 
  "assertCookiePresent":             ["name"], 
  "verifyCookiePresent":             ["name"], 
  "waitForCookiePresent":            ["name"], 
  "storeCookiePresent":              ["name", "variable"], 
  "saveScreenshot":                  ["file"], 
  "print":                           ["text"], 
  "store":                           ["text", "variable"],
  "pause":                           ["waitTime"],
  "switchToFrame":                   ["identifier"],
  "switchToFrameByIndex":            ["index"],
  "switchToWindow":                  ["name"],
  "switchToWindowByIndex":           ["index"],
  "switchToWindowByTitle":           ["title"],
  "switchToDefaultContent":          [],
  "assertAlertText":                 ["text"],
  "verifyAlertText":                 ["text"],
  "waitForAlertText":                ["text"],
  "storeAlertText":                  ["variable"],
  "assertAlertPresent":              [],
  "verifyAlertPresent":              [],
  "waitForAlertPresent":             [],
  "storeAlertPresent":               ["variable"],
  "answerAlert":                     ["text"],
  "acceptAlert":                     [],
  "dismissAlert":                    [],
  "assertEval":                      ["script", "value"],
  "verifyEval":                      ["script", "value"],
  "waitForEval":                     ["script", "value"],
  "storeEval":                       ["script", "variable"],
  "setWindowSize":                   ["width", "height"]
};

/** Map of step types. */
const stepTypes = {};
for (var n in __stepData) {
  stepTypes[n] = new StepType(n);
}

module.exports = {
  StepType,
  stepTypes
};