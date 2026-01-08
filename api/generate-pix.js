const axios = require('axios');

const RAW_KEY = process.env.OTIMIZE_SECRET_KEY || '';
const SECRET_KEY = RAW_KEY.trim(); 
const API_URL = 'https://api.otimizepagamentos.com/v1/transactions';

module.exports = async (req, res) => {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido.' });

    if (!SECRET_KEY) {
        return res.status(500).json({ success: false, message: "Chave de API não configurada." });
    }

    try {
        const { customer, total, items } = req.body;

        // Sanitização
        const cleanCPF = customer?.cpf ? customer.cpf.replace(/\D/g, '') : '';
        let amountFloat = 0;
        
        if (typeof total === 'string') {
            amountFloat = parseFloat(total.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        } else {
            amountFloat = parseFloat(total);
        }

        if (isNaN(amountFloat) || amountFloat <= 0) {
            return res.status(400).json({ success: false, message: "Valor total inválido." });
        }
        
        const amountInCents = Math.round(amountFloat * 100);
        const authString = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

        // --- CORREÇÃO DO PAYLOAD (Voltando para snake_case) ---
        const payload = {
            amount: amountInCents,
            payment_method: "pix", // Voltamos para snake_case
            checkout: "api",
            postback_url: "https://seusite.com/api/webhook", // Opcional, mas bom ter
            customer: {
                name: customer.nome || "Cliente",
                email: customer.email || "cliente@email.com",
                phone_number: customer.telefone || "", // Algumas APIs usam phone_number
                document: {
                    number: cleanCPF,
                    type: "cpf"
                }
            },
            items: items && items.length > 0 ? items.map(item => ({
                title: item.nome || item.title || "Produto",
                unit_price: Math.round(parseFloat(item.preco || item.unitPrice || item.unit_price || amountFloat) * 100),
                quantity: parseInt(item.quantidade || item.quantity || 1),
                tangible: true
            })) : [
                {
                    title: "Pedido Delivery",
                    unit_price: amountInCents,
                    quantity: 1,
                    tangible: true
                }
            ]
        };

        console.log("Enviando Payload Snake_Case:", JSON.stringify(payload));

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        return res.status(200).json({
            success: true,
            transactionId: data.id,
            pix_copy_paste: data.pix_qrcode_text || data.pix?.qrcode_text || data.pix?.qrcode, // Tenta várias formas comuns
            qr_code_base64: data.pix_qrcode_image || data.pix?.qrcode_image, 
            amount: amountFloat,
            customer: customer,
            expiration_seconds: 1800
        });

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status;
        console.error("ERRO OTIMIZE:", JSON.stringify(errorData, null, 2));

        // Pega mensagens de erro aninhadas se existirem
        let msg = "Erro desconhecido";
        if (errorData?.errors) {
             msg = JSON.stringify(errorData.errors);
        } else if (errorData?.message) {
             msg = errorData.message;
        }

        return res.status(statusCode || 500).json({
            success: false,
            message: `Falha (${statusCode}): ${msg}`,
            details: errorData
        });
    }
};