import { newMongoClient, dbName } from './DB';
import { endActiveExecution } from './Monitoring';

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} phone
 * @property {string} createdAt Date in ISO format
 * @property {string} updatedAt Date in ISO format
 * @property {FollowUp[]} followUps
 */

/**
 * @typedef {Object} FollowUp
 * @property {string} status
 * @property {boolean} completed
 * @property {string} [wellnessStatus]
 * @property {string} [symptomsStatus]
 * @property {string} createdAt Date in ISO format
 * @property {string} updatedAt Date in ISO format
 * @property {string} executionSid Reference to the Twilio Execution
 */

/**
 * @param {string} executionSid
 * @returns {FollowUp}
 */
function newFollowUp(executionSid) {
  const now = new Date().toISOString();

  return {
    status: 'OPEN_SESSION',
    completed: false,
    createdAt: now,
    updatedAt: now,
    executionSid,
  };
}

export function getWellnessStatus(n) {
  const wellnessStatus = {
    1: 'FULLY_RECOVERED',
    2: 'BETTER',
    3: 'NO_CHANGES',
    4: 'WORSE'
  };

  return wellnessStatus[n];
}


export function getSymptomsStatus(n) {
  const symptomsStatus = {
    1: 'FEVER',
    2: 'BREATH_DIFICULTIES',
    3: 'FEVER_AND_BREATH_DIFICULTIES',
    4: 'OTHER'
  };

  return symptomsStatus[n];
}

/**
 * @param {User} user
 * @returns {FollowUp} Given User's active follow up
 */
export function getActiveFollowUp(user) {
  return user.followUps && user.followUps.find(f => !f.completed);
}

/**
 * @param {string} userPhone
 * @returns {Promise<User>} User record found on DB
 */
export async function getUserByPhone(userPhone) {
  const client = newMongoClient();
  const conn = await client.connect();
  const db = conn.db(dbName);
  const user = await db.collection('Covid19').findOne({ phone: userPhone });
  await conn.close();
  return user;
}

/**
 * @param {string} userPhone
 * @param {User} updatedUser
 */
export async function updateUserByPhone(userPhone, updatedUser) {
  const client = newMongoClient();
  const conn = await client.connect();
  const db = conn.db(dbName);
  await db.collection('Covid19').replaceOne({ phone: userPhone }, updatedUser);
  await conn.close();
}

/**
 * @param {User} user
 * @param {FollowUp} updatedFollowUp
 * @returns {User} Updated User
 */
export function updateUserActiveFollowUp(user, updatedFollowUp) {
  const now = new Date().toISOString();

  const { followUps: userFollowUps } = user;

  const activeFollowUpIndex = userFollowUps.findIndex(f => !f.completed);
  const updatedFollowUps = userFollowUps.map((f, i) =>
    (i === activeFollowUpIndex) ?
      { ...updatedFollowUp, updatedAt: now } :
      f
  );

  const updatedUser = {
    ...user,
    followUps: updatedFollowUps,
    updatedAt: now,
  };

  return updatedUser;
}

/**
 * @param {User} user
 * @param {FollowUp} userActiveFollowUp
 * @returns {User} Updated User
 */
export function completeActiveFollowUp(user, userActiveFollowUp) {
  const updatedFollowUp = {
    ...userActiveFollowUp,
    completed: true,
  };

  return updateUserActiveFollowUp(user, updatedFollowUp);
}

/**
 * @param {User} user
 * @param {FollowUp} userActiveFollowUp
 * @returns {User} Updated User
 */
export function goToSymptomsFollowUp(user, userActiveFollowUp) {
  const updatedFollowUp = {
    ...userActiveFollowUp,
    status: 'SYMPTOMS'
  };

  return updateUserActiveFollowUp(user, updatedFollowUp);
}

/**
 * @param {User} user
 * @param {FollowUp} userActiveFollowUp
 * @returns {User} Updated User
 */
export function goToWellnessFollowUp(user, userActiveFollowUp) {
  userActiveFollowUp.status = 'WELLNESS';
  return updateUserActiveFollowUp(user, userActiveFollowUp);
}

/**
 * @param {string} userPhone
 * @param {string} executionSid
 * @returns {User} User with a new follow up appended to its list
 */
export async function addNewFollowUpToUser(userPhone, executionSid) {
  const user = await getUserByPhone(userPhone);
  if (!user) throw new Error(`User ${userPhone} not found`);

  return {
    ...user,
    followUps: [...user.followUps, newFollowUp(executionSid)],
  };
}

/**
 * @param {string} userPhone
 */
export async function endActiveFollowUpExecution(userPhone) {
  const user = await getUserByPhone(userPhone);
  const activeFollowUp = getActiveFollowUp(user);
  return activeFollowUp && endActiveExecution(activeFollowUp.executionSid);
}