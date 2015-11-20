import { h, Component } from 'preact';

const DOM = typeof document!=='undefined' && !!document.createElement;


if (DOM) {
	/** Hook into document.createElement() to slap a namespace on manually namespaced nodes (yup)
	 *	@private
	 */
	let oldCreate = document.createElement;
	document.createElement = (name) => {
		if (name.match(/^(SVG\:|SVG$)/i)) {
			return document.createElementNS('http://www.w3.org/2000/svg', name.replace(/^SVG\:/i,''));
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
export default class SVG extends Component {
	// after any update, manually apply exempted readOnly SVG properties as attributes:
	componentDidUpdate() {
		let { base, props } = this;
		for (let i in props) {
			if (props.hasOwnProperty(i) && ~ATTRS.indexOf(i) && base.getAttribute(i)!==props[i]) {
				base.setAttribute(i, props[i]);
			}
		}
	}

	render({ children, ...props }) {
		let attrs = {
			xmlns: 'http://www.w3.org/2000/svg',
			version: '1.1'
		};
		for (let i in props) if (props.hasOwnProperty(i) && ATTRS.indexOf(i)<0) {
			attrs[i] = props[i];
		}
		if (DOM) {
			walk(children);
		}
		return <svg {...attrs}>{ children }</svg>;
	}
}


/** Iterate over descendants, modifying nodeNames to include an "svg:" prefix
 *	@private
 */
function walk(children) {
	for (let i=children.length; i--; ) {
		let node = children[i],
			n = node.nodeName;
		if (typeof n==='string' && !n.match(/^SVG\:/i)) {
			node.nodeName = 'SVG:'+n;
		}
		if (node.children) walk(node.children);
	}
}
