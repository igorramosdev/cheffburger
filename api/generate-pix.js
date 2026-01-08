const axios = require('axios');

// Busca a chave segura do ambiente
const RAW_KEY = process.env.OTIMIZE_SECRET_KEY || '';
const SECRET_KEY = RAW_KEY.trim(); 
const API_URL = 'https://api.otimizepagamentos.com/v1/transactions';

module.exports = async (req, res) => {
    // Configurações de Segurança (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido.' });

    if (!SECRET_KEY) return res.status(500).json({ success: false, message: "Erro de configuração do servidor." });

    try {
        const { customer, total, items } = req.body;

        // 1. Limpeza de Dados (Remove pontos e traços)
        const cleanCPF = customer?.cpf ? customer.cpf.replace(/\D/g, '') : '';
        const cleanPhone = customer?.telefone ? customer.telefone.replace(/\D/g, '') : '';

        // 2. Validação Obrigatória (Regra de Negócio)
        if (!cleanCPF || cleanCPF.length !== 11) {
            return res.status(400).json({ success: false, message: "Por favor, informe um CPF válido." });
        }

        // 3. Tratamento de Valores
        let amountFloat = 0;
        if (typeof total === 'string') {
            amountFloat = parseFloat(total.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        } else {
            amountFloat = parseFloat(total);
        }
        const amountInCents = Math.round(amountFloat * 100);

        // 4. Autenticação na Otimize
        const authString = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

        // 5. Montagem do Payload (Padrão CamelCase exigido)
        const payload = {
            amount: amountInCents,
            paymentMethod: "pix",
            checkout: "api",
            postbackUrl: "https://seusite.com/api/webhook",
            pix: { expiresInSeconds: 1800 },
            customer: {
                name: customer.nome || "Cliente",
                email: customer.email || "cliente@email.com",
                phone: cleanPhone, 
                document: {
                    number: cleanCPF,
                    type: "cpf"
                }
            },
            items: items && items.length > 0 ? items.map(item => ({
                title: item.nome || item.title || "Produto",
                unitPrice: Math.round(parseFloat(item.preco || item.unitPrice || item.unit_price || amountFloat) * 100),
                quantity: parseInt(item.quantidade || item.quantity || 1),
                tangible: true
            })) : [
                { title: "Pedido Delivery", unitPrice: amountInCents, quantity: 1, tangible: true }
            ]
        };

        console.log("Processando Pix para:", cleanCPF);

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = response.data;

        return res.status(200).json({
            success: true,
            transactionId: data.id,
            pix_copy_paste: data.pix?.qrcode_text || data.pix?.qrcode || data.pix_qrcode_text,
            qr_code_base64: data.pix?.qrcode_image || data.pix_qrcode_image,
            amount: amountFloat,
            customer: customer,
            expiration_seconds: 1800
        });

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status || 500;
        console.error("ERRO OTIMIZE:", JSON.stringify(errorData, null, 2));
        
        return res.status(statusCode).json({
            success: false,
            message: `Erro ao processar: ${errorData?.error?.message || error.message}`,
            details: errorData
        });
    }
};