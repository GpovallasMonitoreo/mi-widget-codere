module.exports = async function (req, res) {
    // 1. Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Manejo de la petición Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Capturar el endpoint
    const endpoint = req.query.endpoint;

    if (!endpoint) {
        return res.status(400).json({ error: 'Se requiere un endpoint' });
    }

    try {
        // 3. Consultar a Codere
        const urlCodere = `https://codere-sbs-es.azurewebsites.net/api${endpoint}`;
        
        const response = await fetch(urlCodere, {
            method: 'GET',
            headers: {
                'Language': 'es-Mx',
                'Accept': 'application/json'
            }
        });

        if (response.status === 204) {
            return res.status(204).end();
        }

        if (!response.ok) {
            throw new Error(`Codere respondió con status: ${response.status}`);
        }

        const data = await response.json();
        
        // 4. Enviar datos al frontend
        res.status(200).json(data);

    } catch (error) {
        console.error("Error en el Proxy:", error.message);
        res.status(500).json({ error: 'Error interno del proxy', detalle: error.message });
    }
};
