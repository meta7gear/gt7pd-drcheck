const db = require('./firebase');
const admin = require('firebase-admin');

async function getUserByPsn(userPsn) {
  try {
    const usersRef = db.collection('psn');
    const snapshot = await usersRef
      .where('np_online_id_lc', '==', userPsn.toLowerCase())
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
    console.error('Error querying Firestore:', error.message);
    throw new Error('Failed to fetch user data');
  }
}

async function addUser(user) {
  try {
    const usersRef = db.collection('psn');
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
    console.error('Error adding user to Firestore:', error.message);
    throw new Error('Failed to add user data');
  }
}

async function saveDailyStats(stats) {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const docId = `${stats.userID}_${today}`; // Unique doc per user per day

    const params = {
      userID: stats.userID,
      dr: stats.dr,
      drPointRatio: stats.drPointRatio,
      rank: stats.rank,
      sr: stats.sr,
      manufacturerID: stats.manufacturerID,
      raceCount: stats.raceCount,
      polePositionCount: stats.polePositionCount,
      fastestLapCount: stats.fastestLapCount,
      winCount: stats.winCount,
    };
    
    const statsData = {
      ...params,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Firestore timestamp
    };

    await db.collection('stats').doc(docId).set(statsData, { merge: true });
  } catch (error) {
    console.error('Error adding stats object to Firestore:', error.message);
    throw new Error('Failed to save stats data');
  }
}

async function updateUserStatsHistory(user) {
  try {
    const userRef = db.collection('userStatsHistory').doc(user.userID);
    const newEntry = {
      dr: user.dr,
      sr: user.sr,
      rank: user.rank,
      winCount: user.winCount,
      polePositionCount: user.polePositionCount,
      fastestLapCount: user.fastestLapCount,
    };

    const docSnap = await userRef.get();
    let history = [];

    if (docSnap.exists) {
      history = docSnap.data().history || [];
    }

    history.unshift(newEntry);
    history = history.slice(0, 5);

    await userRef.set({ history }, { merge: true });
  } catch (error) {
    console.error('Error adding userStatsHistory object to Firestore:', error.message);
    throw new Error('Failed to save userStatsHistory data');
  }
}


module.exports = { addUser, getUserByPsn, saveDailyStats, updateUserStatsHistory };
