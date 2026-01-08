const axios = require('axios');

// 1. SEGURANÇA: Busca a chave nas variáveis de ambiente
const SECRET_KEY = process.env.OTIMIZE_SECRET_KEY;

// 2. URL CORRETA DA OTIMIZE
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

    // Responde ao "preflight" do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido.' });
    }

    // Validação da Chave de API
    if (!SECRET_KEY) {
        console.error("ERRO CRÍTICO: Variável OTIMIZE_SECRET_KEY não encontrada.");
        return res.status(500).json({
            success: false,
            message: "Erro de configuração no servidor: Chave de API não encontrada."
        });
    }

    try {
        const { customer, total, items } = req.body;

        console.log("Processando Pix para:", customer?.nome);

        // --- SANITIZAÇÃO DE DADOS ---

        // 1. CPF (Remove não-números)
        const cleanCPF = customer?.cpf ? customer.cpf.replace(/\D/g, '') : '';
        if (!cleanCPF || cleanCPF.length !== 11) {
            return res.status(400).json({ success: false, message: "CPF inválido. Informe apenas números." });
        }

        // 2. Valor (Converte para centavos)
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

        // 3. Autenticação
        const authString = Buffer.from(`${SECRET_KEY}:`).toString('base64');

        // 4. Montagem do Payload
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

        // 5. Chamada à API Externa
        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        // Sucesso
        return res.status(200).json({
            success: true,
            transactionId: data.id,
            pix_copy_paste: data.pix.qrcode_text,
            qr_code_base64: data.pix.qrcode_image,
            amount: amountFloat,
            customer: customer,
            expiration_seconds: 1800 // 30 min
        });

    } catch (error) {
        console.error("Erro na API Otimize:", error.response?.data || error.message);
        
        // Tenta pegar a mensagem de erro específica da Otimize
        const apiErrorMsg = error.response?.data?.error?.message || error.response?.data?.message;
        const errorMessage = apiErrorMsg || error.message || "Erro desconhecido ao processar pagamento.";
        
        return res.status(500).json({
            success: false,
            message: "Falha ao gerar Pix: " + errorMessage,
            details: error.response?.data
        });
    }
};