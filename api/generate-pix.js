const axios = require('axios');

// Busca a chave segura do ambiente
const RAW_KEY = process.env.OTIMIZE_SECRET_KEY || '';
const SECRET_KEY = RAW_KEY.trim(); 
const API_URL = 'https://api.otimizepagamentos.com/v1/transactions';

// ============================================
// CONFIGURAÇÃO DO WEBHOOK
// ============================================
// IMPORTANTE: Substitua pela URL real do seu webhook em produção
// Esta URL será chamada pela Otimize quando o status do pagamento mudar
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://cheffburguer.shop/api/webhook-otimize';

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
        // ============================================
        // RECEBE DADOS DO FRONTEND
        // ============================================
        const { customer, total, items, trackingParams } = req.body;

        // Log dos parâmetros de rastreamento recebidos
        if (trackingParams) {
            console.log("📊 Parâmetros de rastreamento recebidos:", trackingParams);
        }

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

        // ============================================
        // MONTA O PAYLOAD COM METADADOS DE RASTREAMENTO
        // ============================================
        // Os metadados serão retornados pelo webhook da Otimize,
        // permitindo associar a venda aos parâmetros UTM originais
        
        const metadata = {
            // Parâmetros de rastreamento UTMify
            src: trackingParams?.src || null,
            sck: trackingParams?.sck || null,
            utm_source: trackingParams?.utm_source || null,
            utm_campaign: trackingParams?.utm_campaign || null,
            utm_medium: trackingParams?.utm_medium || null,
            utm_content: trackingParams?.utm_content || null,
            utm_term: trackingParams?.utm_term || null,
            
            // Dados do cliente para backup
            customer_name: customer.nome || "Cliente",
            customer_email: customer.email || "cliente@email.com",
            customer_phone: cleanPhone,
            customer_document: cleanCPF,
            
            // Informações adicionais
            product_name: items?.[0]?.nome || items?.[0]?.title || "Taxa de Serviço",
            created_at: new Date().toISOString(),
            
            // ID interno para rastreamento
            internal_ref: `CHEFF-${Date.now()}`
        };

        // 5. Montagem do Payload (Padrão CamelCase exigido)
        const payload = {
            amount: amountInCents,
            paymentMethod: "pix",
            checkout: "api",
            postbackUrl: WEBHOOK_URL, // URL do webhook que receberá as atualizações
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
            ],
            // ============================================
            // METADADOS COM PARÂMETROS DE RASTREAMENTO
            // ============================================
            // Estes dados serão retornados no webhook quando o pagamento for confirmado
            metadata: metadata
        };

        console.log("🔄 Processando Pix para:", cleanCPF);
        console.log("📦 Metadados incluídos:", JSON.stringify(metadata, null, 2));

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = response.data;

        console.log("✅ Pix gerado com sucesso! ID:", data.id);

        return res.status(200).json({
            success: true,
            transactionId: data.id,
            pix_copy_paste: data.pix?.qrcode_text || data.pix?.qrcode || data.pix_qrcode_text,
            qr_code_base64: data.pix?.qrcode_image || data.pix_qrcode_image,
            amount: amountFloat,
            customer: customer,
            expiration_seconds: 1800,
            // Retorna os tracking params para o frontend poder usar se necessário
            trackingParams: trackingParams || null
        });

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status || 500;
        console.error("❌ ERRO OTIMIZE:", JSON.stringify(errorData, null, 2));
        
        return res.status(statusCode).json({
            success: false,
            message: `Erro ao processar: ${errorData?.error?.message || error.message}`,
            details: errorData
        });
    }
};
