const axios = require('axios');

// SEGURANÇA: Busca a mesma variável de ambiente
const SECRET_KEY = process.env.OTIMIZE_SECRET_KEY;
const BASE_URL = 'https://api.otimizepagamentos.com/v1/transactions';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'ID obrigatório' });

    if (!SECRET_KEY) {
        return res.status(500).json({ error: 'Configuração de servidor incompleta (Chave ausente)' });
    }

    try {
        const authString = Buffer.from(`${SECRET_KEY}:`).toString('base64');

        const response = await axios.get(`${BASE_URL}/transactions/${id}`, {
            headers: { 'Authorization': `Basic ${authString}` }
        });

        const status = response.data.status;

        // Lista de status considerados "Pagos"
        const isPaid = ['paid', 'captured', 'authorized', 'completed'].includes(status);

        return res.status(200).json({ 
            paid: isPaid, 
            status: status 
        });

    } catch (error) {
        console.error("Erro check-status:", error.message);
        return res.status(500).json({ error: 'Erro ao verificar status na API' });
    }
}