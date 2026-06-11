// api/proxy.js
export default async function handler(req, res) {
  // Habilitar CORS (importante para peticiones desde el frontend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint } = req.query;

  if (!endpoint) {
    console.error('Error: No se proporcionó el parámetro "endpoint"');
    return res.status(400).json({ error: 'Se requiere un endpoint' });
  }

  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `https://codere-sbs-es.azurewebsites.net${cleanEndpoint}`;
    console.log(`[Proxy] Solicitando: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Language': 'es'
      }
    });
    
    console.log(`[Proxy] Status Code: ${response.status}`);

    if (!response.ok) {
      console.error(`[Proxy] Error ${response.status} desde la API externa`);
      return res.status(response.status).json({ 
        error: `La API externa respondió con un error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(`[Proxy] Error interno: ${error.message}`);
    return res.status(500).json({ error: 'Error interno del proxy' });
  }
}
