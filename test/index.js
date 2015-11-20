import SVG from '../src';
import { h, Component } from 'preact';
import { expect, use } from 'chai';
import { spy, match } from 'sinon';
import sinonChai from 'sinon-chai';
use(sinonChai);

describe('preact-svg', () => {
	describe('<SVG />', () => {
		it('should be a function', () => {
			expect(SVG).to.be.a('function');
		});
	});
});
