module.exports = async function (req, res) {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const endpoint = req.query.endpoint;
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    if (!endpoint) {
        console.log(`[${requestId}] ❌ No se proporcionó endpoint`);
        return res.status(400).json({ error: 'Se requiere un endpoint' });
    }

    try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const urlCodere = `https://codere-sbs-es.azurewebsites.net${cleanEndpoint}`;
        
        console.log(`[${requestId}] 🌐 Solicitando: ${urlCodere}`);

        const response = await fetch(urlCodere, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Language': 'es'
            }
        });

        console.log(`[${requestId}] 📡 Status: ${response.status}`);

        if (response.status === 204) {
            console.log(`[${requestId}] ⚠️ 204 No Content`);
            return res.status(204).end();
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`[${requestId}] ❌ Error ${response.status}:`, errorText.substring(0, 200));
            return res.status(response.status).json({
                error: `Rechazo de Codere (Status ${response.status})`,
                url_intentada: urlCodere,
                detalle: errorText.substring(0, 500)
            });
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
            console.log(`[${requestId}] ✅ Éxito - Array con ${data.length} elementos`);
        } else {
            console.log(`[${requestId}] ✅ Éxito - Objeto recibido`);
        }

        return res.status(200).json(data);

    } catch (error) {
        console.log(`[${requestId}] 💥 Error interno:`, error.message);
        return res.status(500).json({
            error: 'Fallo interno en Vercel',
            detalle: error.toString()
        });
    }
};
