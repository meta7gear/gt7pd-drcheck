// const db = require('./firebase');
const admin = require('firebase-admin');

async function registerUser(email, password) {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    return { uid: userRecord.uid, email: userRecord.email };

  } catch (error) {
    console.error('Error accessing auth:', error.message);
    throw new Error('Failed to create user');
  }
}

async function loginUser(email, password, token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };

  } catch (error) {
    console.error('Error accessing auth:', error.message);
    throw new Error('Failed to create user');
  }
}

module.exports = { loginUser, registerUser };
