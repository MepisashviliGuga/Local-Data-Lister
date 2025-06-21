// import * as testData from "../test data/test_data.json";
// import { Restaurant, Park, Event } from "../../shared/types";

// describe("Data Model Tests", () => {
//   describe("Restaurant Tests", () => {
//     it("should have at least one restaurant", () => {
//       // DD-001 (Partial Implementation)
//       expect((testData.restaurants as Restaurant[]).length).toBeGreaterThan(0);
//     });

//     it("should have a non-empty name for every restaurant", () => {
//       (testData.restaurants as Restaurant[]).forEach((restaurant) => {
//         expect(typeof restaurant.name).toBe("string");
//         expect(restaurant.name.length).toBeGreaterThan(0);
//       });
//     });

//     it("should have a rating that is either null or a number between 0 and 5", () => {
//       (testData.restaurants as Restaurant[]).forEach((restaurant) => {
//         if (restaurant.rating !== null) {
//           expect(typeof restaurant.rating).toBe("number");
//           expect(restaurant.rating).toBeGreaterThanOrEqual(0);
//           expect(restaurant.rating).toBeLessThanOrEqual(5);
//         }
//       });
//     });

//     it("should have amenities as an array for every park", () => {
//       (testData.parks as Park[]).forEach((park) => {
//         expect(Array.isArray(park.amenities)).toBe(true);
//       });
//     });

//     it("should have a non-empty location for every park", () => {
//       (testData.parks as Park[]).forEach((park) => {
//         expect(typeof park.location).toBe("string");
//         expect(park.location && park.location.length).toBeGreaterThan(0);
//       });
//     });

//     it("should have a date in YYYY-MM-DD format for every event", () => {
//       const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
//       (testData.events as Event[]).forEach((event) => {
//         expect(event.date).toMatch(dateFormatRegex);
//       });
//     });

//     it("should show message that restaurants are not available, if there are no restaurants", () => {
//       // DD-002
//       // Here, we're simulating an empty restaurant array
//       const emptyRestaurants: Restaurant[] = [];
//       //Replace this for tests to mock out data later
//       expect(emptyRestaurants.length).toEqual(0);
//     });

//     it("the first restaurant should have a name defined", () => {
//       expect((testData.restaurants as Restaurant[])[0].name).toBeDefined();
//     });

//     it("the first restaurant should have a location", () => {
//       expect((testData.restaurants as Restaurant[])[0].location).toBeDefined();
//     });

//     it("should handle empty location value and should not return any errors", () => {
//       const emptyRestaurants = (testData.restaurants as Restaurant[]).filter(
//         (restaurant) => restaurant.location === null
//       );
//       expect(emptyRestaurants.length).toBeGreaterThanOrEqual(0);
//     });

//     it("all restaurants should have type equals to restaurant", () => {
//       (testData.restaurants as Restaurant[]).forEach((restaurant) => {
//         expect(restaurant.type).toEqual("restaurant");
//       });
//     });
//   });

//   describe("Park Tests", () => {
//     it("should have at least one park", () => {
//       // DD-003 (Partial Implementation)
//       expect((testData.parks as Park[]).length).toBeGreaterThan(0);
//     });

//     it("the first park should have a name defined", () => {
//       expect((testData.parks as Park[])[0].name).toBeDefined();
//     });

//     it("the first park should have opening hours", () => {
//       expect((testData.parks as Park[])[0].openingHours).toBeDefined();
//     });

//     it("all park objects should have type equals to park", () => {
//       (testData.parks as Park[]).forEach((park) => {
//         expect(park.type).toEqual("park");
//       });
//     });
//   });

//   describe("Event Tests", () => {
//     it("should have at least one event", () => {
//       // DD-004 (Partial Implementation)
//       expect((testData.events as Event[]).length).toBeGreaterThan(0);
//     });

//     it("the first event should have a name defined", () => {
//       expect((testData.events as Event[])[0].name).toBeDefined();
//     });

//     it("The first event can have a null price value", () => {
//       expect((testData.events as Event[])[0].price).toBeNull();
//     });

//     it("all event objects should have type equals to event", () => {
//       (testData.events as Event[]).forEach((event) => {
//         expect(event.type).toEqual("event");
//       });
//     });
//   });
// });

// describe("Search Tests", () => {
//   describe("Restaurant Search Tests", () => {
//     it("should find a restaurant by name", () => {
//       // S-001
//       const searchTerm = "The Italian Place";
//       const searchResults = (testData.restaurants as Restaurant[]).filter(
//         (restaurant) =>
//           restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       expect(searchResults.length).toBe(1);
//       expect(searchResults[0].name).toBe(searchTerm);
//     });

//     it("should find restaurants by cuisine", () => {
//       // S-002
//       const searchTerm = "Italian";
//       const searchResults = (testData.restaurants as Restaurant[]).filter(
//         (restaurant) =>
//           restaurant.cuisine &&
//           restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       expect(searchResults.length).toBeGreaterThan(0);
//       searchResults.forEach((restaurant) => {
//         expect(restaurant.cuisine).toContain(searchTerm);
//       });
//     });
//   });

//   describe("Park Search Tests", () => {
//     it("should find a park by location", () => {
//       // S-003
//       const searchTerm = "Downtown";
//       const searchResults = (testData.parks as Park[]).filter(
//         (park) =>
//           park.location &&
//           park.location.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       expect(searchResults.length).toBe(1);
//       expect(searchResults[0].name).toBe("Central Park");
//     });
//   });

//   describe("General Search Tests", () => {
//     it('should display "No results found" message when no results are found', () => {
//       // S-004
//       const searchTerm = "NonExistentPlace";
//       const searchResults = (testData.restaurants as Restaurant[]).filter(
//         (restaurant) =>
//           restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       expect(searchResults.length).toBe(0);
//     });
//   });
// });