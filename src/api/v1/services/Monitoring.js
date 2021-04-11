import * as msgs from './Messages';
import * as userService from './User';

import twilio from 'twilio';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const flowId = 'FWb03f53b1bd3f913752f113086ecf0143';
// const { MessagingResponse } = twilio.twiml;

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
 * @returns {Promise<string>} Message to be sent after handling the work flow
 */
export async function handleIncomingMessage(userPhone, userMsg) {
  const user = await userService.getUserByPhone(userPhone);

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
      await userService.updateUserByPhone(updatedUser.phone, updatedUser);
      return msgs.WELLNESS_OPTIONS;
    }

    if (!isUserInputValid(userMsg)) {
      return msgs.INVALID_INPUT + '\n\n' + msgs[`${userActiveFollowUp.status}_OPTIONS`];
    }

    if (userActiveFollowUp.status === 'WELLNESS') {


      const wellnessMsgs = {
        1: msgs.GLAD_GOT_BETTER + '\n\n' + msgs.THANKS,
        2: msgs.GLAD_GOT_BETTER + '\n\n' + msgs.THANKS,
        3: msgs.THANKS,
        4: msgs.SYMPTOMS_OPTIONS,
      }

      return wellnessMsgs[userMsg];
    }


    if (userActiveFollowUp.status === 'SYMPTOMS') {
      await userService.updateSymptomsStatus(user, userActiveFollowUp, userMsg);
      return msgs.THANKS;
    }

    // it shouldn't get here
    throw new Error('No incoming known state met');
  }
}

/**
 * @param {string} userPhone
 * @param {string} userAnswer
 */
export async function updateWellnessStatus(userPhone, userAnswer) {
  const user = await userService.getUserByPhone(userPhone);
  if (!user) throw new Error('User not found');

  const activeFollowUp = userService.getActiveFollowUp(user);

  const updatedFollowUp = {
    ...activeFollowUp,
    wellnessStatus: userService.getWellnessStatus(userAnswer),
  };

  const updatedUser = (userAnswer !== '4') ? // 4 - "me sinto pior"
    userService.completeActiveFollowUp(user, updatedFollowUp) :
    userService.goToSymptomsFollowUp(user, updatedFollowUp);

  return userService.updateUserByPhone(updatedUser.phone, updatedUser);
}

/**
 * @param {string} userPhone
 * @param {string} userAnswer
 */
export async function updateSymptomsStatus(userPhone, userAnswer) {
  const user = await userService.getUserByPhone(userPhone);
  if (!user) throw new Error('User not found');

  const activeFollowUp = userService.getActiveFollowUp(user);

  const updatedFollowUp = {
    ...activeFollowUp,
    symptomsStatus: userService.getSymptomsStatus(userAnswer),
  };

  const updatedUser = userService.completeActiveFollowUp(user, updatedFollowUp);
  return userService.updateUserByPhone(updatedUser.phone, updatedUser);
}

// export async function triggerBulkFollowUp() {
//   const users = await userService.getElectiveUsers();
//   const executionPromises = users.map(triggerNewFollowUp);
//   return Promise.all(executionPromises);
// }

/**
 * @param {string} userPhone
 * @param {string} executionSid
 */
export async function createNewFollowUp(userPhone, executionSid) {
  const updatedUser = await userService.addNewFollowUpToUser(userPhone, executionSid);
  return userService.updateUserByPhone(userPhone, updatedUser);
}

/**
 * @param {string} userPhone
 */
export async function triggerNewFollowUp(userPhone) {
  await userService.endActiveFollowUpExecution(userPhone);

  return client.studio.flows(flowId)
    .executions
    .create({ to: userPhone, from: 'whatsapp:+14155238886' })
    .then(execution => {
      console.log(execution);
      return createNewFollowUp(userPhone, execution.sid)
    });
}

/**
 * @param {string} executionSid
 * @returns {Promise}
 */
export function endActiveExecution(executionSid) {
  console.log('End active execution', executionSid);
  return client.studio.flows(flowId)
    .executions(executionSid)
    .update({ status: 'ended' })
    .then(execution => console.log(execution.sid));
}