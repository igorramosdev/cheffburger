/**
 * Endpoint para testar o webhook UTMify localmente
 * 
 * Acesse: POST /api/webhook-test
 * 
 * Este endpoint simula um payload da Otimize Pagamentos
 * para testar se a integração com a UTMify está funcionando.
 * 
 * IMPORTANTE: Use apenas para testes! Em produção, o webhook
 * será chamado automaticamente pela Otimize.
 */

const axios = require('axios');

module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET retorna instruções de uso
    if (req.method === 'GET') {
        return res.status(200).json({
            message: 'Endpoint de teste do webhook UTMify',
            instructions: 'Envie um POST para este endpoint para simular um webhook da Otimize',
            example_payload: {
                id: 'TEST-123456',
                status: 'paid',
                amount: 990,
                customer: {
                    name: 'Cliente Teste',
                    email: 'teste@email.com',
                    phone: '11999999999',
                    document: { number: '12345678900', type: 'cpf' }
                },
                items: [
                    { title: 'Produto Teste', unitPrice: 990, quantity: 1 }
                ],
                metadata: {
                    src: 'facebook',
                    sck: 'test123',
                    utm_source: 'facebook',
                    utm_campaign: 'teste_campanha',
                    utm_medium: 'cpc'
                }
            },
            note: 'O campo isTest será automaticamente definido como true para não poluir o dashboard da UTMify'
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Payload de teste padrão ou customizado
        const testPayload = req.body.id ? req.body : {
            id: `TEST-${Date.now()}`,
            status: 'paid',
            amount: 990, // R$ 9,90 em centavos
            created_at: new Date().toISOString(),
            paid_at: new Date().toISOString(),
            customer: {
                name: 'Cliente Teste UTMify',
                email: 'teste@utmify.com',
                phone: '11999999999',
                document: {
                    number: '12345678900',
                    type: 'cpf'
                }
            },
            items: [
                {
                    title: 'Taxa de Serviço - Teste',
                    unitPrice: 990,
                    quantity: 1
                }
            ],
            metadata: {
                src: 'facebook',
                sck: 'test_sck_123',
                utm_source: 'facebook',
                utm_campaign: 'campanha_teste',
                utm_medium: 'cpc',
                utm_content: 'teste_content',
                utm_term: 'teste_term',
                customer_name: 'Cliente Teste UTMify',
                customer_email: 'teste@utmify.com',
                customer_phone: '11999999999',
                customer_document: '12345678900',
                product_name: 'Taxa de Serviço - Teste',
                created_at: new Date().toISOString(),
                internal_ref: `TEST-REF-${Date.now()}`
            }
        };

        console.log('🧪 Enviando payload de teste para o webhook:', testPayload);

        // Determina a URL base
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const webhookUrl = `${protocol}://${host}/api/webhook-otimize`;

        // Chama o webhook real
        const response = await axios.post(webhookUrl, testPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        return res.status(200).json({
            success: true,
            message: 'Teste executado com sucesso',
            test_payload: testPayload,
            webhook_response: response.data
        });

    } catch (error) {
        console.error('Erro no teste:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao executar teste',
            message: error.message,
            details: error.response?.data || null
        });
    }
};
