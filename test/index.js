import SVG from '../src';
import { h, render } from 'preact';

describe('preact-svg', () => {
	describe('<SVG />', () => {
		it('should be a function', () => {
			expect(SVG).to.be.a('function');
		});
	});
});
