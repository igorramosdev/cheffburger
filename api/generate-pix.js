const axios = require('axios');

// SEGURANÇA: A chave agora é buscada nas variáveis de ambiente do servidor
const SECRET_KEY = process.env.OTIMIZE_SECRET_KEY; 
const BASE_URL = 'https://api.otimizepagamentos.com/v1/transactions';

export default async function handler(req, res) {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Trava de segurança: Se a chave não estiver configurada no servidor, para tudo.
    if (!SECRET_KEY) {
        console.error("ERRO CRÍTICO: Variável OTIMIZE_SECRET_KEY não encontrada.");
        return res.status(500).json({ 
            success: false, 
            message: "Erro de configuração no servidor (Chave de API ausente)." 
        });
    }

    try {
        const { customer, total, items } = req.body;

        // Converter valor para centavos e sanitizar input
        let amountFloat = 0;
        if (typeof total === 'string') {
             amountFloat = parseFloat(total.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        } else {
             amountFloat = parseFloat(total);
        }

        if (isNaN(amountFloat)) amountFloat = 0;
        const amountInCents = Math.round(amountFloat * 100);

        // Autenticação Basic Auth (Base64 da Secret Key + :)
        const authString = Buffer.from(`${SECRET_KEY}:`).toString('base64');

        const payload = {
            amount: amountInCents,
            payment_method: "pix",
            checkout: "api",
            customer: {
                name: customer?.nome || "Cliente Visitante",
                email: customer?.email || "cliente@email.com",
                phone: customer?.telefone || "",
                document: {
                    number: customer?.cpf || "000.000.000-00", 
                    type: "cpf"
                }
            },
            items: items || [
                {
                    title: "Pedido Delivery",
                    unit_price: amountInCents,
                    quantity: 1,
                    tangible: true
                }
            ]
        };

        console.log("Enviando para Otimize:", JSON.stringify(payload));

        const response = await axios.post(`${BASE_URL}/transactions`, payload, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        return res.status(200).json({
            success: true,
            transactionId: data.id,
            pix_copy_paste: data.pix.qrcode_text,
            qr_code_base64: data.pix.qrcode_image,
            amount: total,
            customer: customer,
            expiration_seconds: 1800
        });

    } catch (error) {
        console.error("Erro Otimize API:", error.response?.data || error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Erro ao processar pagamento.", 
            details: error.response?.data || error.message 
        });
    }
}