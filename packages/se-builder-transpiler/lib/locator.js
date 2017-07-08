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
  id:    { selenium1: "id" },
  name:  { selenium1: "name" },
  link:  { selenium1: "link" },
  css:   { selenium1: "css" },
  xpath: { selenium1: "xpath" },
};

locator.methods.id.selenium2 = "id";
locator.methods.name.selenium2 = "name";
locator.methods.link.selenium2 = "link text";
locator.methods.css.selenium2 = "css selector";
locator.methods.xpath.selenium2 = "xpath";

locator.methodForName = function(name, seleniumVersion) {
  for (var k in locator.methods) {
    if (locator.methods[k][seleniumVersion] === name) {
      return locator.methods[k];
    }
  }
  throw new Error("Missing locator method: '" + name + "' seleniumVersion: '" + seleniumVersion + "'");
};

locator.jsonToLoc = function(jsonO, seleniumVersion) {
  var method = locator.methodForName(jsonO.type, seleniumVersion);
  var values = {};
  values[method] = ["" + jsonO.value];
  return new locator.Locator(method, values);
};

/**
 * @param The preferred location method (one of builder.locator.methods).
 * @param Map of locator methods to appropriate values.
 */
locator.Locator = function(preferredMethod, values) {
  this.preferredMethod = preferredMethod;
  this.values = values || {};
};

locator.Locator.prototype = {
  /** @return Name of the locator's preferred location method for the given version. */
  getName: function(seleniumVersion) {
    return this.preferredMethod[seleniumVersion];
  },
  /** @return Value of the preferred method. */
  getValue: function()    {
    return this.values;
  },
};

locator.empty = function() {
  return new locator.Locator(locator.methods.id);
};

module.exports = locator;
