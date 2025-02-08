const db = require("./firebase");

async function getUserByPsn(userPsn) {
  try {
    const usersRef = db.collection("psn");
    const snapshot = await usersRef
      .where("np_online_id_lc", "==", userPsn.toLowerCase())
      .limit(1)
      .get();

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

async function addUser(user) {
  try {
    const usersRef = db.collection("psn");
    const userId = user.user_id;

    // Create a new user object with the lowercase np_online_id
    const newUser = {
      ...user,
      np_online_id_lc: user.np_online_id.toLowerCase(),
    };

    // Set the document with the user_id as the document ID
    await usersRef.doc(userId).set(newUser);

    return newUser;

  } catch (error) {
    console.error("Error adding user to Firestore:", error.message);
    throw new Error("Failed to add user data");
  }
}

module.exports = { getUserByPsn, addUser };
