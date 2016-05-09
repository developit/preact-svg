import { h, Component } from 'preact';

const DOM = typeof document!=='undefined' && !!document.createElement;

const SVG_ATTRS = ['viewBox'];

const NS = {
	xlink: 'http://www.w3.org/1999/xlink'
}

const NS_ATTR = /^([a-zA-Z]+)(?:\:|([A-Z]))/;

const PROP_TO_ATTR_MAP = {
	'className': 'class'
};

const EMPTY = {};


/** During <SVG> DOM building, this flag is set to `true`.
 *	@private
 */
let updateMode = false;


if (DOM) {
	let div = document.createElement('div');

	/** Hook into document.createElement() to slap a namespace on manually namespaced nodes (yup)
	 *	@private
	 */
	let oldCreate = document.createElement;
	document.createElement = name => {
		if (updateMode || name==='svg') {
			let el = document.createElementNS('http://www.w3.org/2000/svg', name);
			// shim setAttribute to automatically apply namespaces
			el.setAttribute = createAttributeShim('setAttribute');
			el.getAttribute = createAttributeShim('getAttribute');
			el.removeAttribute = createAttributeShim('removeAttribute');
			for (let key in el) {
				if (~SVG_ATTRS.indexOf(key) || !(key in div) || PROP_TO_ATTR_MAP.hasOwnProperty(key)) {
					overwriteProperty(el, key);
				}
			}
			return el;
		}
		return oldCreate.call(document, name);
	};
}


const PROPERTY_ERRORS = {};
let hasPropertyErrors = false;

function overwriteProperty(el, key) {
	let err = PROPERTY_ERRORS[key];
	if (err===false) {
		Object.defineProperty(el, key, contentPropertyDef(key));
	}
	else {
		attemptOverwriteProperty(el, key);
	}
}

function attemptOverwriteProperty(el, key) {
	try {
		Object.defineProperty(el, key, contentPropertyDef(key));
		PROPERTY_ERRORS[key] = false;
	}
	catch (e) {
		if (!PROPERTY_ERRORS[key]) {
			let err = el.nodeName+': '+e;
			PROPERTY_ERRORS[key] = err;
			if (!hasPropertyErrors && 'undefined'!==typeof console && console.warn) {
				hasPropertyErrors = true;
				console.warn('Error overwriting some SVG properties.', { errors: PROPERTY_ERRORS });
			}
		}
	}
}


/** Cache return values from a function using the first argument as a key.
 *	@private
 */
let memoize = (fn, mem={}) => k => mem.hasOwnProperty(k) ? mem[k] : (mem[k] = fn(k));


/** Create a getter/setter pair for a Content Property that proxies to the corresponding attribute.
 *	@private
 */
let contentPropertyDef = memoize( (prop, attr=(PROP_TO_ATTR_MAP[prop] || prop)) => ({
	set(v) {
		if (v===null || v===undefined) this.removeAttribute(attr);
		else this.setAttribute(attr, v);
	},
	get() { return this.getAttribute(attr); }
}) );


let createAttributeShim = memoize( method => function(name, value) {
	let proto = this.constructor.prototype,
		p = name.match(NS_ATTR);
	if (p && NS.hasOwnProperty(p[1])) {
		name = name.replace(NS_ATTR, '$2').toLowerCase();
		let ns = NS[p[1]];
		return proto[method+'NS'].call(this, ns, name, value);
	}
	else {
		return proto.setAttribute.call(this, name, value);
	}
});



/** Wrapper around <svg> that provides Preact support.
 *	@public
 */
export default class SVG extends Component {
	componentWillUpdate() {
		updateMode = true;
	}

	// after any update, manually apply exempted readOnly SVG properties as attributes:
	componentDidUpdate() {
		updateMode = false;

		if (this.base) {
			for (let i in this.props) {
				if (~SVG_ATTRS.indexOf(i) || PROPERTY_ERRORS.hasOwnProperty(i) && PROPERTY_ERRORS[i]!==false) {
					this.base.setAttribute(i, this.props[i]);
				}
			}
		}
	}

	render({ children, ...props }) {
		// componentWillUpdate() is not called on first render, so we have to shim that here.
		// thankfully, first render() does synchronous DOM generation so it works fine.
		if (!this.hasRendered) {
			this.hasRendered = updateMode = true;
			// componentDidUpdate() is not called after initial render,
			// so we use a setState() callback to call it manually:
			this.setState(EMPTY, setStateUpdateProxy(this));
		}

		for (let i in props) {
			if (~SVG_ATTRS.indexOf(i) || PROPERTY_ERRORS.hasOwnProperty(i) && PROPERTY_ERRORS[i]!==false) {
				delete props[i];
			}
		}

		return <svg version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>{ children }</svg>;
	}
}


function setStateUpdateProxy(component) {
	return () => {
		component.componentDidUpdate();
		component = null;
	};
}
