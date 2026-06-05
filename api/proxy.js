export default async function handler(req, res) {
    // 1. Configurar las cabeceras CORS para permitir que tu HTML lea la respuesta
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Language');

    // Si es una petición de pre-vuelo (Preflight), responder OK
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Extraer el endpoint que el HTML quiere consultar (ej: /sports)
    const { endpoint } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Se requiere un endpoint' });
    }

    try {
        // 3. Hacer la petición real a Codere desde el servidor de Vercel
        const urlCodere = `https://codere-sbs-es.azurewebsites.net/api${endpoint}`;
        
        const response = await fetch(urlCodere, {
            method: 'GET',
            headers: {
                'Language': 'es-Mx', // Forzamos el idioma para México
                'Accept': 'application/json'
            }
        });

        // 4. Manejar el caso especial 204 (Codere cargando datos)
        if (response.status === 204) {
            return res.status(204).end();
        }

        if (!response.ok) {
            throw new Error(`Codere respondió con status: ${response.status}`);
        }

        // 5. Devolver los datos al HTML
        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Error en el Proxy:", error);
        res.status(500).json({ error: 'Error interno del proxy al contactar a Codere' });
    }
}
