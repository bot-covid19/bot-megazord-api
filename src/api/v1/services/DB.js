const bd = {
  "whatsapp:+5521997979797": {
    name: "Blabla",
    phone: "whatsapp:+5521997979797",
    createdAt: new Date().toISOString(),
    followUps: []
  },
  "whatsapp:+5521998989898": {
    name: "Huehue",
    phone: "whatsapp:+5521998989898",
    createdAt: new Date().toISOString(),
    followUps: []
  }
};

export function index(key, obj) {
  bd[key] = obj;
}

export function find(key) {
  return bd[key];
}