// import { GREETING, ANSWER_TO_CONTINUE } from '../services/Messages';
import * as Monitoring from '../services/Monitoring';

// export async function triggerBulkFollowUp(req, res, next) {
//   try {
//     await Monitoring.triggerBulkFollowUp();
//   } catch (e) {
//     next(e);
//   }

//   return res.sendStatus(200);
// }

export async function createFollowUp(req, res, next) {
  const { to: userPhone } = req.body;
  if (!userPhone) {
    return res.status(400).json({ error: 'Field `to` is required' });
  }

  try {
    await Monitoring.triggerNewFollowUp(userPhone);
  } catch (e) {
    return next(e);
  }

  return res.sendStatus(200);
}

export async function wellnessUpdate(req, res, next) {
  const { to: userPhone, userAnswer } = req.body;

  try {
    await Monitoring.updateWellnessStatus(userPhone, userAnswer);
  } catch (e) {
    return next(e);
  }

  return res.sendStatus(200);
}

export async function symptomsUpdate(req, res, next) {
  const { to: userPhone, userAnswer } = req.body;

  try {
    await Monitoring.updateSymptomsStatus(userPhone, userAnswer);
  } catch (e) {
    return next(e);
  }

  return res.sendStatus(200);
}
