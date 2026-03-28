import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress removeChild errors caused by browser extensions (Grammarly, translate, etc.)
// that modify the DOM outside of React's control
const origRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  if (child.parentNode !== this) {
    if (console?.warn) console.warn('removeChild: node is not a child — likely browser extension conflict, suppressed.');
    return child;
  }
  return origRemoveChild.call(this, child) as T;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
