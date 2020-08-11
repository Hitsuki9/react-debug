import * as React from './packages/react';
import * as ReactDOM from './packages/react-dom';

const Block = (
  <div className="app">
    <p>Hello World</p>
  </div>
);

console.log(Block);

ReactDOM.render(
  Block,
  document.getElementById('root')
);
