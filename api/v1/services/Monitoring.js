import * as db from './DB';
import * as msgs from './Messages';
import * as userService from './User';

/**
 * @param {string} input
 * @returns {boolean}
 */
function isUserInputValid(input) {
  const validInputs = ['1', '2', '3', '4'];
  return validInputs.includes(input);
}

/**
 * @param {string} userPhone Phone of the user who sent the message
 * @param {string} userMsg User's sent message
 * @returns {string} Message to be sent after handling the work flow
 */
export function handleIncomingMessage(userPhone, userMsg) {
  const user = userService.getUserByPhone(userPhone);
  
  // if not already present at the base, do not interact
  if (!user) return null;

  // clone object
  const userActiveFollowUp = { ...userService.getActiveFollowUp(user) };

  // is Empty?
  if (!Object.entries(userActiveFollowUp).length) {
    return msgs.NO_ACTIVE_FOLLOWUP;
  } else {
    if (userActiveFollowUp.status === 'OPEN_SESSION') {
      const updatedUser = userService.goToWellnessFollowUp(user, userActiveFollowUp);
      db.index(updatedUser.phone, updatedUser);
      return msgs.WELLNESS_OPTIONS;
    }
    
    if (!isUserInputValid(userMsg)) {
      return msgs.INVALID_INPUT + '\n\n' + msgs[`${userActiveFollowUp.status}_OPTIONS`];
    }

    if (userActiveFollowUp.status === 'WELLNESS') {
      // sets flow info
      userActiveFollowUp.wellnessStatus = userService.getWellnessStatus(userMsg);

      // only option 4 continues the follow up flow... the rest completes it
      const updatedUser = (userMsg !== '4') ?
        userService.completeActiveFollowUp(user, userActiveFollowUp) :
        userService.goToSymptomsFollowUp(user, userActiveFollowUp);

      // record on db
      db.index(updatedUser.phone, updatedUser);

      const wellnessMsgs = {
        1: msgs.GLAD_GOT_BETTER + '\n\n' + msgs.THANKS,
        2: msgs.GLAD_GOT_BETTER + '\n\n' + msgs.THANKS,
        3: msgs.THANKS,
        4: msgs.SYMPTOMS_OPTIONS,
      }

      return wellnessMsgs[userMsg];
    }


    if (userActiveFollowUp.status === 'SYMPTOMS') {
      // sets flow info
      userActiveFollowUp.symptomsStatus = userService.getSymptomsStatus(userMsg);

      const updatedUser = userService.completeActiveFollowUp(user, userActiveFollowUp);
      db.index(updatedUser.phone, updatedUser);
      return msgs.THANKS;
    }

    // it shouldn't get here
    throw new Error('No incoming known state met');
  }
}

/**
 * @param {string} userPhone
 */
export function createNewFollowUp(userPhone) {
  const user = userService.getUserByPhone(userPhone);

  if (!user) throw new Error(`User ${userPhone} not found`);

  const updatedUser = userService.createNewFollowUp(user);
  db.index(user.phone, updatedUser);
}