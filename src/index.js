import { h, Component } from 'preact';

const DOM = typeof document!=='undefined' && !!document.createElement;

/** A list of SVG properties that are read-only, requiring `setAttribute()` to mutate.
 *	@private
 */
const ATTRS = DOM ? ['width', 'height', 'viewBox', 'preserveAspectRatio'] : [];


/** During <SVG> DOM building, this flag is set to `true`.
 *	@private
 */
let updateMode = false;


if (DOM) {
	/** Hook into document.createElement() to slap a namespace on manually namespaced nodes (yup)
	 *	@private
	 */
	let oldCreate = document.createElement;
	document.createElement = name => {
		if (updateMode || name==='svg') {
			return document.createElementNS('http://www.w3.org/2000/svg', name);
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
let contentPropertyDef = memoize( prop => ({
	set(v) {
		if (v===null || v===undefined) this.removeAttribute(prop);
		else this.setAttribute(prop, v);
	},
	get() { return this.getAttribute(prop); }
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
		let { base, props } = this;
		for (let i in props) {
			if (props.hasOwnProperty(i) && ~ATTRS.indexOf(i) && base.getAttribute(i)!==props[i]) {
				base.setAttribute(i, props[i]);
				if (!base['_psvg'+i]) {
					base['_psvg'+i] = true;
					Object.defineProperty(base, i, contentPropertyDef(i));
				}
			}
		}
	}

	render({ children, ...props }) {
		// componentWillUpdate() is not called on first render, so we have to shim that here.
		// thankfully, first render() does synchronous DOM generation so it works fine.
		if (!this.hasRendered) {
			this.hasRendered = updateMode = true;
		}

		let attrs = {
			xmlns: 'http://www.w3.org/2000/svg',
			version: '1.1'
		};
		for (let i in props) if (props.hasOwnProperty(i) && ATTRS.indexOf(i)<0) {
			attrs[i] = props[i];
		}
		return <svg {...attrs}>{ children }</svg>;
	}
}
