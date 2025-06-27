# Component Structure Documentation

## DataList (`src/components/DataList.tsx`)

- **Purpose:** Displays a list of data items.
- **Props:**
  - `items: Item[]` – Array of items to display

## FileItem (`src/components/FileItem.tsx`)

- **Purpose:** Renders a single file entry.
- **Props:**
  - `file: File` – File object to display

## ListItem (`src/components/ListItem.tsx`)

- **Purpose:** Represents a single item in a list (used by DataList).
- **Props:**
  - `item: Item` – The item to render

## SearchFilter (`src/components/SearchFilter.tsx`)

- **Purpose:** Provides search and filter controls for the data list.
- **Props:**
  - `onSearch: (query: string) => void` – Callback for search input
