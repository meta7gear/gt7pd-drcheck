/**
 * Calculates the driver's rating based on their driver rating and DR point ratio.
 * @param {number} driverRating - The driver rating value (6, 5, or 4).
 * @param {number} drPointRatio - The DR point ratio (value between 0 and 1).
 * @returns {number} - The calculated driver rating.
 * @throws {Error} - If the driver rating is invalid.
 */

const calculateRating = (driverRating, drPointRatio) => {
  switch (driverRating) {
    case 7:
      return {
        rank: 'S',
        rating: 50000 + 49999 * drPointRatio,
      };
    case 6:
      return {
        rank: 'A+',
        rating: 50000 + 49999 * drPointRatio,
      };
    case 5:
      return {
        rank: 'A',
        rating: 30000 + 19999 * drPointRatio,
      };
    case 4:
      return {
        rank: 'B',
        rating: 10000 + 19999 * drPointRatio,
      };
    case 3:
      return {
        rank: 'C',
        rating: 5000 + 4999 * drPointRatio,
      }
    case 2:
      return {
        rank: 'D',
        rating: 4999 * drPointRatio,
      }
    case 1:
      return {
        rank: 'E',
        rating: 1000,
      }
    default:
      throw new Error("Invalid driver rating value");
  }
};

module.exports = calculateRating;
