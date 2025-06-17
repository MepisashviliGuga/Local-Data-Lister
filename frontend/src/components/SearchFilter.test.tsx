// frontend/src/components/SearchFilter.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilter from './SearchFilter';

describe('SearchFilter Component', () => {

  it('should call onFilterChange with the correct text when the user types', async () => {
    const user = userEvent.setup();

    // 1. Arrange: Create a "mock function" or "spy"
    // This lets us watch if the function is called, how many times, and with what arguments.
    const mockOnFilterChange = vi.fn();

    // Render the component and pass our mock function as the prop
    render(<SearchFilter onFilterChange={mockOnFilterChange} />);

    // Find the input element on the screen
    const inputElement = screen.getByPlaceholderText('Type to search...');

    // 2. Act: Simulate a user typing "test" into the input box
    await user.type(inputElement, 'test');

    // 3. Assert: Check if our mock function behaved as expected
    // Was it called 4 times (once for each letter: 't', 'e', 's', 't')?
    expect(mockOnFilterChange).toHaveBeenCalledTimes(4);

    // What was the argument on the very last call? It should be the full word "test".
    expect(mockOnFilterChange).toHaveBeenLastCalledWith('test');
  });

  it('should render the label and input field', () => {
    // A simpler test to ensure the component renders correctly
    const mockOnFilterChange = vi.fn();
    render(<SearchFilter onFilterChange={mockOnFilterChange} />);

    expect(screen.getByLabelText('Filter Items:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument();
  });
});