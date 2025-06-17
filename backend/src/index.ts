import express from "express";
const app = express();
const PORT = 3001; // or any port you prefer

app.listen(PORT, () => {
  console.log(`Backend server is listening on http://localhost:${PORT}`);
});
