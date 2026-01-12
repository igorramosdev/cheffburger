const axios = require('axios');

const UTMIFY_PIXEL_ID = '69618e480e598651b2b76386'; // ex: 69618e480e598651b2b76386
const UTMIFY_ENDPOINT = 'https://api.utmify.com.br/conversions';

// Armazene IDs processados para evitar duplicação
const processedTransactions = new Set();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = req.body;

    /*
      🔍 Ajuste os nomes conforme a Otimize envia
    */
    const transactionId = data.id;
    const status = data.status;
    const amount = data.amount || data.value || 0;

    if (!transactionId || !status) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const paidStatuses = ['paid', 'completed', 'captured', 'authorized'];

    if (!paidStatuses.includes(status)) {
      return res.status(200).json({ ignored: true });
    }

    // Evita duplicar venda
    if (processedTransactions.has(transactionId)) {
      return res.status(200).json({ duplicated: true });
    }

    // 🔥 ENVIO PARA A UTMIFY
    await axios.post(UTMIFY_ENDPOINT, {
      pixel_id: UTMIFY_PIXEL_ID,
      event: 'purchase',
      value: amount,
      currency: 'BRL',
      transaction_id: transactionId
    });

    processedTransactions.add(transactionId);

    return res.status(200).json({
      success: true,
      utmify: 'conversion_sent'
    });

  } catch (error) {
    console.error('Webhook error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Erro no webhook' });
  }
};
