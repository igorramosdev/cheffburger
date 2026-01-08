const axios = require('axios');

// 1. SEGURANÇA: Busca a chave nas variáveis de ambiente
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

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido.' });
    }

    if (!SECRET_KEY) {
        return res.status(500).json({
            success: false,
            message: "Erro de configuração: Chave de API não encontrada na Vercel."
        });
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

        if (isNaN(amountFloat)) amountFloat = 0;
        const amountInCents = Math.round(amountFloat * 100);

        // --- CORREÇÃO CRÍTICA AQUI ---
        // Adicionado o ":x" conforme a documentação da Otimize
        const authString = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

        const payload = {
            amount: amountInCents,
            payment_method: "pix",
            checkout: "api",
            customer: {
                name: customer.nome || "Cliente",
                email: customer.email || "cliente@email.com",
                phone: customer.telefone || "",
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

        console.log("Enviando para Otimize com Auth corrigido...");

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
            pix_copy_paste: data.pix.qrcode_text,
            qr_code_base64: data.pix.qrcode_image,
            amount: amountFloat,
            customer: customer,
            expiration_seconds: 1800
        });

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status;
        console.error("ERRO OTIMIZE:", JSON.stringify(errorData, null, 2));

        return res.status(statusCode || 500).json({
            success: false,
            message: `Falha (${statusCode}): ${errorData?.error?.message || errorData?.message || error.message}`,
            details: errorData
        });
    }
};