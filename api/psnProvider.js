const db = require("./firebase");

async function getUserByPsn(userPsn) {
  try {
    const usersRef = db.collection("psn");
    const snapshot = await usersRef.where("np_online_id", "==", userPsn).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const user = snapshot.docs[0].data();

    return {
      user_id: user.user_id,
      nick_name: user.nick_name,
      np_online_id: user.np_online_id,
    };

  } catch (error) {
    console.error("Error querying Firestore:", error.message);
    throw new Error("Failed to fetch user data");
  }
}

module.exports = { getUserByPsn };
