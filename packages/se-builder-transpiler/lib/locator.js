/**
 * Data structure describing a Selenium 1/2 locator. The "values" property maps different ways of
 * locating an element to the values used to do so. (For example, mapping
 * builder.locator.methods.id to "searchField".) The "preferredMethod" property specifies which
 * method should be used.
 */
 
const locator = {};

/**
 * Available types of locator, to be used as keys. Use eg builder.locator.methods.xpath to refer to
 * the idea of an xpath locator.
 */
locator.methods = {
  id:    { selenium1: function() { return "id"; }},
  name:  { selenium1: function() { return "name"; }},
  link:  { selenium1: function() { return "link"; }},
  css:   { selenium1: function() { return "css"; }},
  xpath: { selenium1: function() { return "xpath"; }},
};

locator.methods.id.selenium2 = "id";
locator.methods.name.selenium2 = "name";
locator.methods.link.selenium2 = "link text";
locator.methods.css.selenium2 = "css selector";
locator.methods.xpath.selenium2 = "xpath";

locator.methodForName = function(name, selenium_version) {
  for (var k in locator.methods) {
    if (locator.methods[k][seleniumVersion] === name) {
      return locator.methods[k];
    }
  }
  return null;
};

locator.jsonToLoc = function(jsonO, selenium_version) {
  var method = locator.methodForName(jsonO.type, selenium_version);
  var values = {};
  values[method] = ["" + jsonO.value];
  return new locator.Locator(method, 0, values);
};

/**
 * @param The preferred location method (one of builder.locator.methods).
 * @param Map of locator methods to appropriate values.
 */
locator.Locator = function(preferredMethod, preferredAlternative, values) {
  this.preferredMethod = preferredMethod;
  this.preferredAlternative = preferredAlternative || 0;
  this.values = values || {};
  this.__originalElement = null;
};

locator.Locator.prototype = {
  /** @return Name of the locator's preferred location method for the given version. */
  getName: function(selVersion) {
    return this.preferredMethod[selVersion];
  },
  /** @return Value of the preferred method. */
  getValue: function()    {
    if (this.values[this.preferredMethod]) {
      if (this.preferredAlternative >= this.values[this.preferredMethod].length) {
        return "";
      }
      return this.values[this.preferredMethod][this.preferredAlternative] || "";
    } else {
      return "";
    }
  },
};

locator.empty = function() {
  return new locator.Locator(locator.methods.id);
};

module.exports = locator;