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
        return res.status(500).json({ success: false, message: "Erro: Chave de API não configurada na Vercel." });
    }

    try {
        const { customer, total, items } = req.body;

        // 1. Sanitização
        const cleanCPF = customer?.cpf ? customer.cpf.replace(/\D/g, '') : '';
        
        let amountFloat = 0;
        if (typeof total === 'string') {
            amountFloat = parseFloat(total.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        } else {
            amountFloat = parseFloat(total);
        }

        // Garante valor inteiro em centavos
        const amountInCents = Math.round(amountFloat * 100);

        // 2. Autenticação (Mantendo o :x que funcionou)
        const authString = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

        // 3. Payload seguindo a documentação (CamelCase)
        const payload = {
            amount: amountInCents,
            paymentMethod: "pix", // <--- EXATAMENTE COMO NA DOC
            checkout: "api",
            postbackUrl: "https://seusite.com/api/webhook", // Opcional, mas recomendado
            
            // Configuração específica do Pix (Exigido por algumas validações)
            pix: {
                expiresInSeconds: 1800 // 30 minutos
            },

            customer: {
                name: customer.nome || "Cliente",
                email: customer.email || "cliente@email.com",
                phone: customer.telefone || "", 
                document: {
                    number: cleanCPF,
                    type: "cpf"
                }
            },

            // Itens também em CamelCase (unitPrice)
            items: items && items.length > 0 ? items.map(item => ({
                title: item.nome || item.title || "Produto",
                unitPrice: Math.round(parseFloat(item.preco || item.unitPrice || item.unit_price || amountFloat) * 100),
                quantity: parseInt(item.quantidade || item.quantity || 1),
                tangible: true
            })) : [
                {
                    title: "Pedido Delivery",
                    unitPrice: amountInCents,
                    quantity: 1,
                    tangible: true
                }
            ]
        };

        console.log("Enviando Payload CamelCase:", JSON.stringify(payload));

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Forçando cabeçalho de aceitação
            }
        });

        const data = response.data;

        // Sucesso!
        return res.status(200).json({
            success: true,
            transactionId: data.id,
            // A API pode retornar o código Pix em caminhos diferentes, garantimos todos:
            pix_copy_paste: data.pix?.qrcode_text || data.pix?.qrcode || data.pix_qrcode_text,
            qr_code_base64: data.pix?.qrcode_image || data.pix_qrcode_image,
            amount: amountFloat,
            customer: customer,
            expiration_seconds: 1800
        });

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status;
        
        console.error("ERRO OTIMIZE:", JSON.stringify(errorData, null, 2));

        // Formata mensagem de erro amigável
        let msg = "Erro desconhecido";
        if (errorData?.errors) {
             // Se a API retornar lista de erros, mostramos o primeiro
             msg = JSON.stringify(errorData.errors);
        } else if (errorData?.message) {
             msg = errorData.message;
        } else if (errorData?.error?.message) {
             msg = errorData.error.message;
        }

        return res.status(statusCode || 500).json({
            success: false,
            message: `Falha (${statusCode}): ${msg}`,
            details: errorData
        });
    }
};