import { h, Component } from 'preact';

const DOM = typeof document!=='undefined' && !!document.createElement;

const PROP_TO_ATTR_MAP = {
	'className': 'class'
}


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
			for (let i in el) {
				if (!(i in div) || PROP_TO_ATTR_MAP.hasOwnProperty(i)) {
					try {
						Object.defineProperty(el, i, contentPropertyDef(i));
					}
					catch (e) {}
				}
			}
			return el;
		}
		return oldCreate.call(document, name);
	};
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
	}

	render({ children, ...props }) {
		// componentWillUpdate() is not called on first render, so we have to shim that here.
		// thankfully, first render() does synchronous DOM generation so it works fine.
		if (!this.hasRendered) {
			this.hasRendered = updateMode = true;
			// componentDidUpdate() is not called after initial render,
			// so we use a setState() callback to call it manually:
			this.setState({}, this.componentDidUpdate);
		}

		return <svg version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>{ children }</svg>;
	}
}
