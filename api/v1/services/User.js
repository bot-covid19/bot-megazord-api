import * as db from './DB';

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
 */

/**
  @returns {FollowUp}
 */
function newFollowUp() {
  const now = new Date().toISOString();

  return {
    status: 'OPEN_SESSION',
    completed: false,
    createdAt: now,
    updatedAt: now,
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
  return user.followUps.find(f => !f.completed);
}

/**
 * @param {string} userPhone
 * @returns {User} User record found on DB
 */
export function getUserByPhone(userPhone) {
  return db.find(userPhone);
}

/**
 * @param {User} user
 * @param {FollowUp} updatedFollowUp
 * @returns {User} Updated User
 */
export function updateUserActiveFollowUp(user, updatedFollowUp) {
  const { followUps: userFollowUps } = user;

  const activeFollowUpIndex = userFollowUps.findIndex(f => !f.completed);
  const updatedFollowUps = userFollowUps.map((f, i) =>
    (i === activeFollowUpIndex) ? updatedFollowUp : f
  );

  const updatedUser = {
    ...user,
    followUps: updatedFollowUps,
    updatedAt: new Date().toISOString(),
  };

  return updatedUser;
}

/**
 * @param {User} user
 * @param {FollowUp} userActiveFollowUp
 * @returns {User} Updated User
 */
export function completeActiveFollowUp(user, userActiveFollowUp) {
  userActiveFollowUp.completed = true;
  return updateUserActiveFollowUp(user, userActiveFollowUp);
}

/**
 * @param {User} user
 * @param {FollowUp} userActiveFollowUp
 * @returns {User} Updated User
 */
export function goToSymptomsFollowUp(user, userActiveFollowUp) {
  userActiveFollowUp.status = 'SYMPTOMS';
  return updateUserActiveFollowUp(user, userActiveFollowUp);
}

export function goToWellnessFollowUp(user, userActiveFollowUp) {
  userActiveFollowUp.status = 'WELLNESS';
  return updateUserActiveFollowUp(user, userActiveFollowUp);
}

/**
 * @param {User} currentUser 
 * @returns {User} User with a new follow up appended to its list
 */
export function createNewFollowUp(currentUser) {
  const activeFollowUp = getActiveFollowUp(currentUser);

  const user = (activeFollowUp) ?
    completeActiveFollowUp(currentUser, activeFollowUp) : currentUser;
  
  return {
    ...user,
    followUps: [...user.followUps, newFollowUp()],
  };
}