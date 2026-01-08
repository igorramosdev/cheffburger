const axios = require('axios');

const SECRET_KEY = process.env.OTIMIZE_SECRET_KEY ? process.env.OTIMIZE_SECRET_KEY.trim() : '';
const API_URL = 'https://api.otimizepagamentos.com/v1/transactions';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'ID obrigatório' });
    
    if (!SECRET_KEY) {
        return res.status(500).json({ error: 'Chave de API não configurada' });
    }

    try {
        // --- CORREÇÃO CRÍTICA AQUI TAMBÉM ---
        const authString = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

        const response = await axios.get(`${API_URL}/${id}`, {
            headers: { 'Authorization': `Basic ${authString}` }
        });

        const status = response.data.status;
        const isPaid = ['paid', 'captured', 'authorized', 'completed'].includes(status);

        return res.status(200).json({ 
            paid: isPaid, 
            status: status 
        });

    } catch (error) {
        console.error("Erro status:", error.message);
        return res.status(500).json({ error: 'Erro ao verificar status' });
    }
};