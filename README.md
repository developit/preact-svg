# preact-svg

[![NPM](http://img.shields.io/npm/v/preact-svg.svg)](https://www.npmjs.com/package/preact-svg)
[![travis-ci](https://travis-ci.org/developit/preact-svg.svg)](https://travis-ci.org/developit/preact-svg)

An `<SVG>` wrapper component that makes inline `<svg>` work in [Preact].

> **[CodePen Demo](http://codepen.io/developit/pen/ZbPdem?editors=001)**
>
> ![preact-svg](https://i.gyazo.com/df0bcc29e36ee107352600679e537176.gif)

---


### Usage Example

```js
import SVG from 'preact-svg';
import { h, render } from 'preact';
/** @jsx h */

const Main = () => (
	<SVG width="100" height="50">
		<path d="M0,0T 50,50 100,50 50,100Z" stroke="#000" stroke-width="2" />
	</SVG>
);

render(<Main />, document.body);
```


---


### License

[MIT]


[Preact]: https://github.com/developit/preact
[MIT]: http://choosealicense.com/licenses/mit/
