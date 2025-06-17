// frontend/src/pages/HomePage.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from './HomePage';

describe('HomePage Integration Flow', () => {

  it('should display the initial list and filter it correctly when a user types', async () => {
    // 1. ARRANGE
    // Set up the user-event instance for simulating user actions.
    const user = userEvent.setup();
    // Render the HomePage component. Since the data is hardcoded inside it,
    // this is all the setup we need!
    render(<HomePage />);

    // 2. ASSERT - INITIAL STATE
    // Check that all the initial items are displayed on the screen.
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.getByText('City Park')).toBeInTheDocument();
    expect(screen.getByText('The Grind Cafe')).toBeInTheDocument();
    expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();

    // 3. ACT - USER FILTERS THE LIST
    // Find the search input field by its label text.
    const searchInput = screen.getByLabelText('Filter Items:');
    // Simulate the user typing the word "park" into the input.
    await user.type(searchInput, 'park');

    // 4. ASSERT - FILTERED STATE
    // The list should have re-rendered with only the matching items.
    
    // Check that "City Park" is still visible.
    expect(screen.getByText('City Park')).toBeInTheDocument();

    // Check that the other items are now GONE from the screen.
    // We use `queryByText` because it returns `null` if the element isn't found,
    // which is what we want to assert. `getByText` would throw an error.
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
    expect(screen.queryByText('The Grind Cafe')).not.toBeInTheDocument();
    expect(screen.queryByText('Summer Music Festival')).not.toBeInTheDocument();
  });

  it('should show all items again when the search is cleared', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<HomePage />);

    // Act 1: Type something to filter the list
    const searchInput = screen.getByLabelText('Filter Items:');
    await user.type(searchInput, 'pizza');

    // Assert that the list is filtered
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('City Park')).not.toBeInTheDocument();

    // Act 2: Clear the input field
    await user.clear(searchInput);

    // Assert: All items should be visible again
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.getByText('City Park')).toBeInTheDocument();
    expect(screen.getByText('The Grind Cafe')).toBeInTheDocument();
  });
});