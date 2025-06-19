import express, { Request, Response, NextFunction } from "express";
import * as testData from "../test data/test_data.json"; // Import your JSON data
import cors from "cors";

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Custom type definition for your data
type DataItem =
  | {
      name: string;
      location: string;
      cuisine: string;
      rating: number | null;
      priceRange: string;
      openingHours: string;
      type: "restaurant";
    }
  | {
      name: string;
      location: string;
      amenities: string[];
      size: string;
      openingHours: string;
      type: "park";
    }
  | {
      name: string;
      location: string;
      date: string;
      time: string;
      description: string;
      category: string;
      price: number | null;
      type: "event";
    };

// Combine all data into a single array
const allItems: DataItem[] = [
  ...(testData.restaurants as DataItem[]),
  ...(testData.parks as DataItem[]),
  ...(testData.events as DataItem[]),
];

// 1. GET /api/items - Returns all items
app.get("/api/items", (req: Request, res: Response) => {
  try {
    res.json(allItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// 2. GET /api/search?q=searchTerm - Returns items matching the search term
app.get("/api/search", (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    res
      .status(400)
      .json({ message: "A search query parameter 'q' is required." });
  }

  try {
    // Ensure q is a string before using toLowerCase
    const searchTerm = typeof q === "string" ? q.toLowerCase() : "";
    const results = allItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm)
    );
    res.json(results);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Failed to perform search" });
  }
});

// Error handling middleware (example)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Backend server is listening on http://localhost:${PORT}`);
});
