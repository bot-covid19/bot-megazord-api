import twilio from 'twilio';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const { MessagingResponse } = twilio.twiml;

/**
 * Picks a random value from a collection
 * @template T
 * @param {T[]} array
 * @returns {T} Random value
 */
const pickRandom = array => array[Math.floor(Math.random() * array.length)];

export function incoming(req, res, next) {
  const msg = req.body.Body;
  console.info(`> Incoming message body: ${msg}`);

  const risadas = [
    'huehuehuehuehueh',
    'kkkkkkkkkkkkkkkk',
    'hahahahahahahaha',
    'rsrsrsrsrsrsrsrs',
    'huahuahuahuahuah',
    'paoskpaoskpoaska',
    'hehehehehehehehe',
  ];

  const outgoingMessage = pickRandom(risadas);
  console.info(`< Outgoing message body: ${outgoingMessage}`)

  const msgSender = new MessagingResponse();
  msgSender.message(outgoingMessage);

  res.set('Content-Type', 'text/xml');
  res.status(200).send(msgSender.toString());
}

export function callback(req, res, next) {
  console.log('Callback!');
  const msg = req.body.Body;
  res.status(200).json({ msg });
}

export async function send(req, res, next) {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Fields `to` and `message` are required' });
  }

  const messageInfo = await client.messages.create({
    from: 'whatsapp:+14155238886',
    body: message,
    to: `whatsapp:+55${to}`
  });

  console.info(JSON.stringify(messageInfo, null, 2));
  res.sendStatus(200);
}