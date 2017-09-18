/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(5);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(6);
__webpack_require__(9);
__webpack_require__(11);
__webpack_require__(13);
__webpack_require__(15);
__webpack_require__(17);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./reset.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./reset.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*样式重置表*/\r\nhtml,body{\r\n\tfont-size: 12px;\r\n\tfont-family: 'arial','\\5FAE\\8F6F\\96C5\\9ED1';\r\n}\r\na{\r\n\ttext-decoration: none;\r\n\tcolor: #333;\r\n}\r\nbody,p,h1,h2,h3,h4,h5,h6,hr,pre,ul,ol,dl,dd{margin: 0;}\r\ninput,ul,ol,textarea{padding: 0;}\r\nul,ol{list-style: none;}\r\nhr{border:none;}\r\ninput{border-width:1px;}\r\ni,address{\r\n\tfont-style: normal;\r\n}\r\nimg{\r\n\t/*display: block;*/\r\n\t/*由行内块元素转换为块级元素*/\r\n\tvertical-align: top;\r\n\t/* top/middle/bottom\r\n\t */\r\n\t/*图片底部间隙解决办法*/\r\n}\r\n/*button{\r\n\tpadding: 3px 8px;\r\n\tfont:14px 'arial','微软雅黑';\r\n}*/\r\n/*hr{border:none;height: 1px;width: 600px;background: red;}\r\n*/\r\n/*\r\nhtml,body{font-size: 12px;font-family: 'arial','微软雅黑';\r\nfont-style: italic;\r\ncolor: red;\r\nfont-weight: normal;\r\nline-height: 2em;\r\nletter-spacing: -2px;\r\nword-spacing: 20px;\r\ntext-align: right;\r\ntext-decoration: overline;\r\ntext-transform: uppercase;\r\ntext-indent: 40px;\r\n}\r\n */", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/* nav */\r\nhtml,body{\r\n\twidth:100%;\r\n\theight:100%;\r\n}\r\nnav{\r\n\tmin-width:250px;\r\n\tdisplay:block;\r\n\theight:100%;\r\n\tmin-height:800px;\r\n\tbackground-color:#262727;\r\n\tz-index:9999;\r\n\tposition:fixed;\r\n\tleft:0;\r\n\ttop:0;\r\n\tbottom:0;\r\n}\r\n.nav_header{\r\n\twidth:100%;\r\n\theight:100px;\r\n\ttext-indent:3em;\r\n\t/* cursor:pointer; */\r\n}\r\n.nav_header #nav{\r\n\tdisplay:block;\r\n\tbackground-image:url(" + __webpack_require__(8) + ");\r\n\twidth:32px;\r\n\theight:32px;\r\n\tposition:absolute;\r\n\tright:10px;\r\n\ttop:32px;\r\n\tvisibility:hidden;\r\n}\r\n.nav_header>.resume{\r\n\tline-height:100px;\r\n\tcolor:#5eb78a;\r\n\tfont-size:35px;\r\n\tfont-weight:bolder;\r\n}\r\n/* .nav_content{\r\n\tposition:relative;\r\n} */\r\n.nav_content>ul{\r\n\tlist-style:none;\r\n\tmargin:50px 0;\r\n\tvisibility:visible;\r\n\tvertical-align:bottom;\r\n}\r\n.nav_content>ul>li{\r\n\tmargin-bottom:25px;\r\n\twidth:80%;\r\n\tmargin-left:20%;\r\n\tcolor:#fff;\r\n\tfont-weight:lighter;\r\n\tfont-size:14px;\r\n\tcursor:pointer;\r\n}\r\n.nav_content>ul>li>a{\r\n\tfont-size:18px;\r\n\tcolor:#fff;\r\n}\r\n.nav_content>ul>li.active>a{\r\n\tcolor:#ec962a;\r\n}\r\n.nav_content>ul>li:hover>a{\r\n\tcolor:#2ab0d4;\r\n}\r\n.nav_footer{\r\n\tposition:fixed;\r\n\tbottom:15px;\r\n\twidth:250px;\r\n\ttext-align:center;\r\n}\r\n/* .nav_footer .nav_footer_icon{\r\n\twidth:100%;\r\n\theight:100px;\r\n} */\r\n.nav_footer .nav_footer_icon>li{\r\n\tdisplay:inline-block;\r\n\twidth:50px;\r\n\theight:50px;\r\n\tborder-radius:25px;\r\n\tmargin:20px 10px;\r\n\tcursor:pointer;\r\n}\r\n.nav_footer>span{\r\n\tcolor:#ccc;\r\n\tfont-size:14px;\r\n}\r\n/* content */\r\n.content{\r\n\tpadding-left:250px;\r\n\tmin-width:372px;\r\n}\r\n.content>div{\r\n\twidth:78%;\r\n\tmargin:auto;\r\n\tposition:absolute;\r\n\tright:4%;\r\n\ttransition:all 0.6s ease-in;\r\n}\r\n.content>div.show{\r\n\topacity:1;\r\n\tdisplay:block;\r\n}\r\n.content>div.hide{\r\n\topacity:0;\r\n\tdisplay:block;\r\n}\r\n.Basic_header,Contact_header{\r\n\theight:100px;\r\n}\r\n.Basic_header>h2,.Contact_header>h2{\r\n\tdisplay:inline-block;\r\n\tline-height:100px;\r\n\tfont-size:30px;\r\n\tmargin-right:20px;\r\n}\r\n.Basic_header>span,.Contact_header>span{\r\n\tcolor:#ccc;\r\n\tfont-size:18px;\r\n}\r\n.content hr{\r\n\twidth:100%;\r\n\theight:2px;\r\n\tbackground-color:skyblue;\r\n\tmargin-bottom:50px;\r\n}\r\n.Basic_main{\r\n\twidth:100%;\r\n\t/*height:100%;*/\r\n\tmargin-bottom:50px;\r\n\toverflow:hidden;\r\n}\r\n.Basic_information{\r\n\twidth:40%;\r\n\tfloat:left;\r\n\tmargin-right:3%;\r\n\tmargin-bottom:3%;\r\n\tz-index:6666;\r\n\tcursor:pointer;\r\n\toverflow:hidden;\r\n\tposition:relative;\r\n}\r\n.Basic_information>span{\r\n\tposition:absolute;\r\n\tleft:50%;top:50%;\r\n\ttransform:translateX(-50%) translateY(-50%);\r\n\tz-index:667;\r\n\tfont-size:23px;\r\n\tfont-weight:bolder;\r\n\ttransition:all 0.6s ease-out;\r\n}\r\n.Basic_main>div:nth-child(1)>span{\r\n\tcolor:#fff;\r\n}\r\n.Basic_main>div:nth-child(2)>span{\r\n\tcolor:#262727;\r\n}\r\n.Basic_main>div:nth-child(3)>span{\r\n\tcolor:#E52A10;\r\n}\r\n.Basic_main>div:nth-child(4)>span{\r\n\tcolor:#0EF20A;\r\n}\r\n.Basic_information>img{\r\n\twidth:100%;\r\n\theight:auto;\r\n\tborder:1px solid #fff;\r\n\ttransition:all 0.6s ease-out;\r\n}\r\n.Basic_information:hover>img{\r\n\ttransform:scale(1.2);\r\n}\r\n.Basic_information:before{\r\n\tcontent:'';\r\n\twidth:100%;\r\n\theight:100%;\r\n\tposition:absolute;\r\n\tleft:0;bottom:100%;\r\n\ttransition:all 0.6s ease-out;\r\n\tbackground-color:skyblue;\r\n\topacity:0;\r\n\tz-index:666;\r\n}\r\n.Basic_information:hover:before{\r\n\tbottom:0;\r\n\topacity:0.2;\r\n}\r\n.Basic_information:after{\r\n\tcontent:'';\r\n\tposition:absolute;\r\n\ttop:100%;left:50%;\r\n\ttransform:translateX(-50%);\r\n\ttransition:all 0.6s ease-out;\r\n\topacity:0;\r\n\tfont-size:18px;\r\n}\r\n.Basic_main>div:nth-child(1):after{\r\n\tcontent:'\\6C5F\\897F\\519C\\4E1A\\5927\\5B66';\r\n\tcolor:#fff;\r\n}\r\n.Basic_main>div:nth-child(2):after{\r\n\tcontent:'18770813129';\r\n\tcolor:#262727;\r\n}\r\n.Basic_main>div:nth-child(3):after{\r\n\tcontent:'linxunzyf@gmail.com';\r\n\tcolor:#E52A10;\r\n}\r\n.Basic_main>div:nth-child(4):after{\r\n\tcontent:'zyf18279782420';\r\n\tcolor:#0EF20A;\r\n}\r\n.Basic_information:hover:after{\r\n\ttop:55%;\r\n\topacity:1;\r\n}\r\n.Basic_information:hover>span{\r\n\ttransform:translateX(-50%) translateY(-50%) translateY(-20px);\r\n\topacity:0.5 ;\r\n}", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = "./dist/images/nav.png";

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(10);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./Contact.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./Contact.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".Contact_header>h2{\r\n\tmargin-right:80px;\r\n}\r\n.Contact_main{\r\n\twidth:100%;\r\n\t/*height:100%;*/\r\n}\r\n.Contact_main>div{\r\n\twidth:60%;\r\n\tmargin:auto;\r\n}\r\n.Contact_main p{\r\n\tmargin-bottom:50px;\r\n}\r\n.Contact_main .aboutMe{\r\n\t/* font-style:italic; */\r\n\t/*font-style:oblique;*/\r\n\tfont-size:14px;\r\n\tline-height: 1.6em;\r\n\tcolor:#666;\r\n\tline-height:28px;\r\n}\r\n.Contact_main .contactMe{\r\n\tcolor:#0B0000;\r\n\tfont-size:16px;\r\n\tline-height:2em;\r\n}\r\n.Contact_main .footer{\r\n\tmargin-top:50px;\r\n\twidth:100%;\r\n\ttext-align: center;\r\n}\r\n.Contact_main .footer>li{\r\n\tdisplay:inline-block;\r\n\twidth:50px;\r\n\theight:50px;\r\n\tborder-radius:25px;\r\n\tmargin:20px 10px;\r\n\tcursor:pointer;\r\n}\r\n.Contact_main a:hover{\r\n\ttext-decoration: underline;\r\n}\r\n.Contact_main>div>div{\r\n\twidth:100%;\r\n\ttext-align: center;\r\n\tfont-size: 14px;\r\n}\r\n.Contact_main .github{\r\n\ttext-align: center;\r\n\tmargin:20px 0;\r\n\tfont-size: 20px;\r\n}", ""]);

// exports


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(12);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./personalskills.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./personalskills.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".skill_content>ol{\r\n    width:100%;\r\n}\r\n.skill_content>ol>li{\r\n    line-height:2em;\r\n    list-style: square;\r\n    font-size: 16px;\r\n    margin-bottom: 15px;\r\n}\r\n.skill_content>ol>li>span{\r\n    color:skyblue;\r\n    font-weight: bolder;\r\n} ", ""]);

// exports


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./portfolio.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./portfolio.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*portfolio*/\r\n.portfolio{\r\n\t/*position:absolute;\r\n\tleft:500px;*/\r\n\twidth:100%;\r\n\theight:100%;\r\n\tposition:absolute;\r\n\tleft:0;top:0;\r\n\tright:0;bottom:0;\r\n\tmargin:auto;\r\n}\r\n.portfolio>.portfolio_content{\r\n\tfloat:left;\r\n\twidth:40%;\r\n\tpadding-right:10%;\r\n\tpadding-bottom:5%;\r\n\theight:auto;\r\n}\r\n.portfolio_content>h3{\r\n\tmargin:3% 0;\r\n\tfont-size:18px;\r\n}\r\n.portfolio_content>p{\r\n\twidth:100%;\r\n\tline-height: 2em;\r\n\tfont-size: 1.2em;\r\n\tbackground-color:rgba(255, 250, 250, 0.89);\r\n}\r\n.portfolio_content>a{\r\n\tcolor:rgba(18, 181, 235, 0.93);\r\n\tfont-size:14px;\r\n}\r\n.portfolio_content>a:hover{\r\n\ttext-decoration: underline;\r\n}", ""]);

// exports


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(16);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./response.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./response.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "@media (max-width:1500px){\r\n\t.content>div{\r\n\t\twidth:75%;\r\n\t\tright:3%;\r\n\t}\r\n\t.Basic_information>span{\r\n\t\tfont-size:20px;\r\n\t}\r\n}\r\n@media (max-width:1253px){\r\n\t.content>div{\r\n\t\twidth:65%;\r\n\t}\r\n\t.Basic_information>span{\r\n\t\tfont-size:16px;\r\n\t}\r\n\t.Basic_information:after{\r\n\t\tfont-size:14px;\r\n\t}\r\n}\r\n@media (max-width:900px){\r\n\t.content>div{\r\n\t\twidth:60%;\r\n\t}\r\n\t.content hr{\r\n\t\tmargin-bottom:30px;\r\n\t}\r\n\t.Basic_information{\r\n\t\tmargin-top:30px;\r\n\t\twidth:99%;\r\n\t}\r\n\t.Basic_information>span{\r\n\t\tfont-size:18px;\r\n\t}\r\n\t.Basic_information:after{\r\n\t\tfont-size:14px;\r\n\t}\r\n\t.Contact_main>div{\r\n\t\twidth:80%;\r\n\t}\r\n}\r\n@media (max-width:776px){\r\n\tbody{\r\n\t\twidth:100%;\r\n\t}\r\n\t.content{\r\n\t\twidth:100%;\r\n\t\tmax-width:760px;\r\n\t\tmargin-top:120px;\r\n\t\tpadding-left:0;\r\n\t}\r\n\t.content>div{\r\n\t\twidth:100%;\r\n\t\tposition: absolute;\r\n\t}\r\n\t.content>div>div{\r\n\t\twidth:78%;\r\n\t\tmargin:0 auto;\r\n\t}\r\n\t.Basic_header>h2,.Contact_header>h2{\r\n\t\theight:70px;\r\n\t\tline-height:70px;\r\n\t}\r\n\t.content hr{\r\n\t\tmargin-bottom:10px;\r\n\t\tmargin-top:15px;\r\n\t}\r\n\t.Basic_information{\r\n\t\tmargin-top:20px;\r\n\t\twidth:99%;\r\n\t}\r\n\t.Basic_information>span{\r\n\t\tfont-size:14px;\r\n\t}\r\n\t.Basic_information:after{\r\n\t\tfont-size:12px;\r\n\t}\r\n\t.Contact_main>div{\r\n\t\twidth:90%;\r\n\t}\r\n\t.Contact_main img{\r\n\t\tmargin-top:15px;\r\n\t}\r\n\t.Contact_main p{\r\n\t\tmargin-top:20px;\r\n\t}\r\n\t.skills_content{\r\n\t\tmargin:0;\r\n\t}\r\n\tnav{\r\n\t\twidth:100%;\r\n\t\tbackground-color:#262727;\r\n\t\tposition:fixed;\r\n\t\tleft:0;\r\n\t\tright:0;\r\n\t\ttop:0;\r\n\t\tmin-height:100px;\r\n\t\theight:100px;\r\n\t}\r\n\t.nav_header{\r\n\t\tposition:absolute;\r\n\t\tz-index:99999;\r\n\t\tbackground-color:#262727;\r\n\t}\r\n\t.nav_header #nav{\r\n\t\t/*opacity:1;*/\r\n\t\tvisibility:visible;\r\n\t\tcursor:pointer;\r\n\t\ttransition:all 0.3s ease-out;\r\n\t}\r\n\t/* .nav_header span:hover{\r\n\t\ttransform:scale(1.1);\r\n\t} */\r\n\t.nav_content>ul{\r\n\t\twidth:100%;height:auto;\r\n\t\tposition:absolute;\r\n\t\ttransform:translateY(-100%);\r\n\t\tz-index:9999;\r\n\t\tmargin-top:0;\r\n\t\tpadding:20px 0;\r\n\t\tbackground-color:#262727;\r\n\t\tanimation-duration:0.6s;\r\n\t\tanimation-timing-function:ease-out;\r\n\t\tanimation-fill-mode:forwards;\r\n\t}\r\n\t.nav_content>ul.slide{\r\n\t\tanimation-name:slide;\r\n\t\t/*display:block;\r\n\t\topacity:1;*/\r\n\t}\r\n\t.nav_content>ul.slideHide{\r\n\t\tanimation-name:slideHide;\r\n\t}\r\n\t@keyframes slide{\r\n\t\tfrom{\r\n\t\t\ttransform:translateY(-100%);\r\n\t\t\t/*visibility:hidden;*/\r\n\t\t\t/*opacity:0;*/\r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform:translateY(100px);\r\n\t\t\t/*visibility:visible;*/\r\n\t\t\t/*opacity:1;*/\r\n\t\t}\r\n\t}\r\n\t@keyframes slideHide{\r\n\t\tfrom{\r\n\t\t\ttransform:translateY(100px);\r\n\t\t\tvisibility:visible;\r\n\t\t\t/*opacity:1;*/\r\n\t\t}\r\n\t\tto{\r\n\t\t\ttransform:translateY(-100%);\r\n\t\t\t/*visibility:hidden;*/\r\n\t\t\t/*opacity:0;*/\r\n\t\t}\r\n\t}\r\n\t.nav_footer{\r\n\t\tdisplay:none;\r\n\t}\r\n\t.portfolio>.portfolio_content{\r\n\t\twidth:100%;\r\n\t}\r\n\tbody{\r\n\t\theight:auto;\r\n\t}\r\n\tfooter{\r\n\t\tdisplay: block;\r\n\t\twidth:100%;\r\n\t\t/* border:1px solid red; */\r\n\t\tposition: absolute;\r\n\t\tbottom:15px;\r\n\t}\r\n\t.skill_content>ol>li{\r\n\t\tfont-size:13px;\r\n\t}\r\n}\r\n@media (max-height:800px){\r\n\t.nav_footer{\r\n\t\tposition: absolute;\r\n\t\tbottom:15px;\r\n\t}\r\n}", ""]);

// exports


/***/ }),
/* 17 */
/***/ (function(module, exports) {

function tab(){
	var oUl=document.querySelector('.nav_content>ul');
	var oLis=oUl.getElementsByTagName('li');
	var oDivs=document.querySelectorAll('.content>div');
	for(var i=0;i<oLis.length;i++){
		(function(i){
			oLis[i].onclick=function(){
				for(var j=0;j<oLis.length;j++){
					oLis[j].className="";
					oDivs[j].className="hide";
					oDivs[j].style.zIndex="1";
				}
				this.className="active";
				oDivs[i].className="show";
				oDivs[i].style.zIndex="8888";
			};
		})(i);
	}
}
function showNav(){
	var oNav=document.getElementById('nav');
	// var aNav=document.getElementsByTagName('nav')[0];
	var oUl=document.querySelector('.nav_content ul');
	var flag=false;
	oNav.onclick=function(e){
		if(oUl.style.visibility="hidden"&&!flag){
			oUl.className="slide";
			oUl.style.visibility="visible";
		}
		if(flag){
			oUl.className="slideHide";
			oUl.style.visibility="hidden";
		}
		flag=!flag;
		e.stopPropagation();
	}
	document.onclick=function(e){
		// console.log(e.target.id);
		if(e.target.id&&e.target.id=="nav"){
			return;
		}else{
			if(oUl.className!=""){
				oUl.className="slideHide";
				oUl.style.visibility="hidden";
				flag=false;
			}
		}
	}
	window.onresize=function(){
		if(document.body.offsetWidth>=760){
			oUl.className="";
			oUl.style.visibility="visible";
		}else{
			oUl.style.visibility="hidden";
		}
	}

}

window.onload=function(){
	tab();
	showNav();
};

/***/ })
/******/ ]);