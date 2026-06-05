module.exports = async function (req, res) {
    // 1. Cabeceras CORS abiertas para que tu HTML pueda leer los datos
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const endpoint = req.query.endpoint;

    if (!endpoint) {
        return res.status(400).json({ error: 'Se requiere un endpoint' });
    }

    try {
        // Aseguramos que el endpoint tenga la diagonal correcta
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        // URL exacta basada en la documentación de Swagger (sin /api)
        const urlCodere = `https://codere-sbs-es.azurewebsites.net${cleanEndpoint}`;
        
        // Petición clonada de tu cURL de prueba
        const response = await fetch(urlCodere, {
            method: 'GET',
            headers: {
                'accept': '*/*',     // Exacto al Swagger
                'Language': 'es'     // Exacto al Swagger (Cambiado de es-Mx)
            }
        });

        if (response.status === 204) {
            return res.status(204).end();
        }

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ 
                error: `Rechazo de Codere (Status ${response.status})`, 
                url_intentada: urlCodere,
                detalle: errorText 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Fallo interno en Vercel', detalle: error.toString() });
    }
};
