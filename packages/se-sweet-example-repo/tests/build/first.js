var wd = require('wd')
  , _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , uuid = require('uuid-js');
var VARS = {};

var b = wd.promiseRemote();

b.on('status', function(info){console.log('[36m%s[0m', info);});b.on('command', function(meth, path, data){  console.log(' > [33m%s[0m: %s', meth, path, data || '');});
b.init({
  browserName:'firefox'
})
.then(function () { return b.get("https://www.google.com/"); })
.then(function () { return b.elementById(); })
.then(function (el) { return b.clear(el)
  .then(function () { return b.type(el, "this is a testerooney"); });
})
.then(function () { return b.elementByXPath(); })
.then(function (el) { return b.clickElement(el); })
.then(function () { return b.elementByLinkText(); })
.then(function (el) { return b.clickElement(el); })
.fin(function () {
b.quit();
}).done();
