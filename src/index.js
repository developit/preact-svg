import { h, Component } from 'preact';

const DOM = typeof document!=='undefined' && !!document.createElement;

let updateMode = false;

if (DOM) {
	/** Hook into document.createElement() to slap a namespace on manually namespaced nodes (yup)
	 *	@private
	 */
	let oldCreate = document.createElement;
	document.createElement = (name) => {
		if (updateMode || name==='svg') {
			return document.createElementNS('http://www.w3.org/2000/svg', name);
		}
		return oldCreate.call(document, name);
	};
}


/** A list of SVG properties that are read-only, requiring `setAttribute()` to mutate.
 *	@private
 */
const ATTRS = DOM ? ['width', 'height', 'viewBox', 'preserveAspectRatio'] : [];


/** Wrapper around <svg> that provides Preact support.
 *	@public
 */
class SVG extends Component {
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
