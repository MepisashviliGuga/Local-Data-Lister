// frontend/src/components/FileItem.test.tsx

import { render, screen } from '@testing-library/react';
import FileItem from './FileItem';

// Mock the lucide-react icons. We don't need to test the icons themselves,
// just that our component chooses the right one. This makes the test faster.
vi.mock('lucide-react', () => ({
  File: () => <div data-testid="file-icon" />,
  Folder: () => <div data-testid="folder-icon" />,
}));

describe('FileItem Component', () => {

  // Test Case 1: Testing how it renders a file
  it('should render a file with the correct name and icon', () => {
    // Arrange: Set up the props for the component
    const fileProps = {
      name: 'README.md',
      type: 'file' as const,
    };

    // Act: Render the component
    render(<FileItem {...fileProps} />);

    // Assert: Check if the output is correct
    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('folder-icon')).not.toBeInTheDocument(); // Make sure the folder icon is NOT there
  });

  // Test Case 2: Testing how it renders a directory
  it('should render a directory with the correct name and icon', () => {
    // Arrange
    const folderProps = {
      name: 'src',
      type: 'directory' as const,
    };

    // Act
    render(<FileItem {...folderProps} />);

    // Assert
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('file-icon')).not.toBeInTheDocument(); // Make sure the file icon is NOT there
  });

});