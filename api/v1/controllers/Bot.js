import { GREETING, ANSWER_TO_CONTINUE } from '../services/Messages';
import { handleIncomingMessage, createNewFollowUp } from '../services/Monitoring';
import twilio from 'twilio';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const { MessagingResponse } = twilio.twiml;

export function incoming(req, res, next) {
  const {
    To: recipient,
    From: userPhone,
    Body: userMsg
  } = req.body;

  console.info(`Incoming message body: ${userMsg}`);

  const outgoingMessage = handleIncomingMessage(userPhone, userMsg);

  if (outgoingMessage) {
    console.info(`Outgoing message body: ${outgoingMessage}`);
  
    const twimlMsgBuilder = new MessagingResponse();

    twimlMsgBuilder.message(outgoingMessage);
    const outgoingMsgXML = twimlMsgBuilder.toString();
  
    res.set('Content-Type', 'text/xml');
    return res.status(200).send(outgoingMsgXML);
  }

  console.info('No messages to be sent.');
  return res.sendStatus(200);
}

export async function createFollowUp(req, res, next) {
  const { to: userPhone } = req.body;
  if (!userPhone) {
    return res.status(400).json({ error: 'Field `to` is required' });
  }

  const message = GREETING + ANSWER_TO_CONTINUE;

  const messageInfo = await client.messages.create({
    from: 'whatsapp:+14155238886', // sandbox phone
    body: message,
    to: userPhone
  });

  // add new follow up only after sending the message successfully
  try {
    createNewFollowUp(userPhone);
  } catch (e) {
    return next(e);
  }

  console.info(JSON.stringify(messageInfo, null, 2));
  return res.sendStatus(200);
}