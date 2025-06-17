

import { render, screen } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  it('renders the headline', () => {
    // 1. Render the App component into the fake DOM
    render(<App />);

    // 2. Find an element with the text "Vite + React" on the screen
    const headlineElement = screen.getByText(/Vite \+ React/i);

    // 3. Assert that the element was actually found in the document
    expect(headlineElement).toBeInTheDocument();
  });
});