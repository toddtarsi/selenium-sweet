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
  id:    { toString: function() { return "id"; }},
  name:  { toString: function() { return "name"; }},
  link:  { toString: function() { return "link"; }},
  css:   { toString: function() { return "css"; }},
  xpath: { toString: function() { return "xpath"; }},
};

locator.methods.id.selenium2 = "id";
locator.methods.name.selenium2 = "name";
locator.methods.link.selenium2 = "link text";
locator.methods.css.selenium2 = "css selector";
locator.methods.xpath.selenium2 = "xpath";

locator.methodForName = function(seleniumVersion, name) {
  for (var k in locator.methods) {
    if (locator.methods[k][seleniumVersion] === name) {
      return locator.methods[k];
    }
  }
  return null;
};

locator.locToJSON = function(loc) {
  return {
    type: loc.getName(builder.selenium2),
    value: loc.getValue()
  };
};

locator.jsonToLoc = function(jsonO) {
  var method = locator.methodForName('selenium2', jsonO.type);
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
  /** @return The same locator with the given preferred method. */
  withPreferredMethod: function(preferredMethod, preferredAlternative) {
    var l2 = new locator.Locator(preferredMethod, preferredAlternative || 0);
    for (var t in this.values) {
      l2.values[t] = this.values[t].slice(0);
    }
  },
  /** @return Whether the locator has a value for the given locator method. */
  supportsMethod: function(method) {
    if (this.values[method] && this.values[method].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  /** @return Get the value for the given method. */
  getValueForMethod: function(method, alternative) {
    alternative = alternative || 0;
    if (this.values[method]) {
      if (alternative >= this.values[method].length) {
        return "";
      }
      return this.values[method][alternative] || "";
    } else {
      return "";
    }
  },
  /** @return Whether the given locator has the same preferred method with the same value. */
  probablyHasSameTarget: function(l2) {
    if (this.__originalElement && l2.__originalElement) {
      return this.__originalElement == l2.__originalElement;
    }
    return this.preferredMethod === l2.preferredMethod && this.getValue() === l2.getValue();
  }
};

locator.empty = function() {
  return new locator.Locator(locator.methods.id);
};

// From http://stackoverflow.com/questions/2332811/capitalize-words-in-string
locator.capitalize = function(s) {
  return s.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

module.exports = locator;