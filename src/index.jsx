import { createRoot } from 'react-dom/client';

const Block = (
  <div className="app">
    <p>Hello World</p>
  </div>
);

console.log(Block);

// debugger;
const root = createRoot(document.getElementById('root'));
root.render(Block);
