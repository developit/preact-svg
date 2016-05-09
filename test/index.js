import SVG from '../src';
import { h, render } from 'preact';

describe('preact-svg', () => {
	describe('<SVG />', () => {
		it('should be a function', () => {
			expect(SVG).to.be.a('function');
		});
	});

	describe('Namespaced Attributes', () => {
		it('should render xlinkHref', () => {
			let scratch = document.createElement('div');

			let root = render(h(SVG, null,
				h('use', { xlinkHref: 'test#foo' })
			), scratch);

			expect(root.firstChild)
				.to.have.deep.property('attributes.0')
				.that.contains.keys({
					namespaceURI: 'http://www.w3.org/1999/xlink',
					name: 'href',
					value: 'test#foo'
				});
		});

		it('should render xlink:href', () => {
			let scratch = document.createElement('div');

			let root = render(h(SVG, null,
				h('use', { 'xlink:href' :'test#bar' })
			), scratch);

			expect(root.firstChild)
				.to.have.deep.property('attributes.0')
				.that.contains.keys({
					namespaceURI: 'http://www.w3.org/1999/xlink',
					name: 'href',
					value: 'test#bar'
				});
		});
	});
});
