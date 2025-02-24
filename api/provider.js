const axios = require("axios");

/**
 * Retrieves the access token using the provided cookie.
 * @param {string} cookie - The user's session cookie.
 * @returns {Promise<string>} - The access token.
 */
const getToken = async (cookie) => {
  try {
    const response = await axios.get("https://www.gran-turismo.com/au/gt7/info/api/token/", {
      headers: {
        Cookie: cookie,
      },
    });
    const accessToken = response.data.access_token;

    if (!accessToken) {
      throw new Error("Failed to retrieve access token");
    }

    return accessToken;
  } catch (error) {
    throw new Error(`Error in getToken: ${error.message}`);
  }
};

/**
 * Fetches the user stats using the provided user ID and access token.
 * @param {string} userId - The user ID.
 * @param {string} accessToken - The access token.
 * @returns {Promise<object>} - The user stats object.
 */
const getStats = async (userId, accessToken) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const response = await axios.post(
      "https://web-api.gt7.game.gran-turismo.com/stats/get",
      {
        user_id: userId,
        year: currentYear,
        month: currentMonth,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0",
        },
      }
    );

    const user = response.data.result.user;
    const sports_mode = response.data.result.sports_mode;
    
    return {
      drPointRatio: user.dr_point_ratio,
      driverRating: user.driver_rating,
      onlineID: user.np_online_id,
      nickname: user.nick_name,
      userID: user.user_id,
      isStarPlayer: user.is_star_player,
      manufacturerID: user.manufacturer_id,
      sportsmanshipRating: user.sportsmanship_rating,
      countryCode: user.country_code,
      raceCount: sports_mode.race_count,
      polePositionCount: sports_mode.pole_position_count,
      fastestLapCount: sports_mode.fastest_lap_count,
      winCount: sports_mode.win_count,
    };
  } catch (error) {
    throw new Error(`Error in getStats: ${error.message}`);
  }
};

/**
 * Fetches the user info using the provided user url and access token.
 * @param {string} userUrl - The user Url.
 * @param {string} accessToken - The access token.
 * @returns {Promise<object>} - The user object.
 */
const getUser = async (userUrl, accessToken) => {
  try {
    const uuidMatch = userUrl.match(/\/([0-9a-fA-F-]{36})(?:\/|$)/);
    const uuid = uuidMatch ? uuidMatch[1] : null;

    const response = await axios.post(
      "https://web-api.gt7.game.gran-turismo.com/user/get_user_profile_by_user_id",
      {
        user_id: uuid,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0",
        },
      }
    );

    const data = response.data.result;

    return {
      onlineID: data.np_online_id,
      nickname: data.nick_name,
      user_id: data.user_id,
    };
  } catch (error) {
    throw new Error(`Error in getUser: ${error.message}`);
  }
};

/**
 * Fetches the user info using the provided user url and access token.
 * @param {string} userUrl - The user Url.
 * @param {string} accessToken - The access token.
 * @returns {Promise<object>} - The user object.
 */
const getRoundLapTimes = async (eventId, accessToken) => {
  try {
    const response = await axios.post(
      "https://web-api.gt7.game.gran-turismo.com/ranking/get_list_by_page",
      {
        board_id: `p_rt_10${eventId}_001`,
        page: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0",
        },
      }
    );

    const data = response.data.result;

    return {
      list: data.list,
      total: data.total,
    };
  } catch (error) {
    throw new Error(`Error in getRoundLapTimes: ${error.message}`);
  }
};




module.exports = { getToken, getStats, getUser, getRoundLapTimes };
