let history: {
  gaz: number;
  smoke: number;
  time: string;
  nom: string;
  prenom: string;
  adresse: string;
  tel: string;
}[] = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { gaz, smoke, nom, prenom, adresse, tel } = req.body;
    const time = new Date().toISOString();
    history.push({ gaz, smoke, nom, prenom, adresse, tel, time });
    if (history.length > 1000) history.shift();
    return res.status(200).json({ message: 'ok' });
  } else if (req.method === 'GET') {
    return res.status(200).json(history);
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
