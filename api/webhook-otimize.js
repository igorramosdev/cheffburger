/**
 * Webhook para receber eventos da Otimize Pagamentos e enviar conversões para UTMify
 * 
 * Este endpoint deve ser configurado como postbackUrl na Otimize Pagamentos.
 * Quando um pagamento Pix é confirmado, a Otimize envia um POST para este endpoint,
 * que então processa os dados e envia a conversão para a API da UTMify.
 * 
 * Endpoint UTMify: POST https://api.utmify.com.br/api-credentials/orders
 * Header: x-api-token: <credencial_api>
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURAÇÕES - ALTERE CONFORME NECESSÁRIO
// ============================================

// Token da API UTMify - Obtenha em: Integrações > Webhooks > Credenciais de API
const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || 'SUA_CREDENCIAL_API_UTMIFY_AQUI';

// Endpoint correto da API UTMify para envio de pedidos
const UTMIFY_ENDPOINT = 'https://api.utmify.com.br/api-credentials/orders';

// Nome da plataforma (aparecerá no dashboard da UTMify)
const PLATFORM_NAME = 'OtimizePagamentos';

// Arquivo para controle de transações processadas (evita duplicação)
const PROCESSED_FILE = path.join('/tmp', 'utmify_processed_transactions.json');

// Arquivo de logs
const LOG_FILE = path.join('/tmp', 'utmify_webhook_logs.json');

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Carrega as transações já processadas do arquivo
 */
function loadProcessedTransactions() {
    try {
        if (fs.existsSync(PROCESSED_FILE)) {
            const data = fs.readFileSync(PROCESSED_FILE, 'utf8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('Erro ao carregar transações processadas:', error.message);
    }
    return new Set();
}

/**
 * Salva uma transação como processada
 */
function saveProcessedTransaction(transactionId) {
    try {
        const processed = loadProcessedTransactions();
        processed.add(transactionId);
        
        // Mantém apenas as últimas 10000 transações para não crescer indefinidamente
        const processedArray = Array.from(processed).slice(-10000);
        fs.writeFileSync(PROCESSED_FILE, JSON.stringify(processedArray));
    } catch (error) {
        console.error('Erro ao salvar transação processada:', error.message);
    }
}

/**
 * Verifica se uma transação já foi processada
 */
function isTransactionProcessed(transactionId) {
    const processed = loadProcessedTransactions();
    return processed.has(transactionId);
}

/**
 * Registra log de eventos
 */
function logEvent(type, data) {
    try {
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        }
        
        logs.push({
            timestamp: new Date().toISOString(),
            type,
            data
        });
        
        // Mantém apenas os últimos 1000 logs
        logs = logs.slice(-1000);
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Erro ao registrar log:', error.message);
    }
}

/**
 * Formata data para o padrão UTC exigido pela UTMify (YYYY-MM-DD HH:MM:SS)
 */
function formatDateUTC(dateInput) {
    try {
        const date = dateInput ? new Date(dateInput) : new Date();
        return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}

/**
 * Extrai parâmetros de rastreamento dos metadados da transação
 */
function extractTrackingParams(metadata) {
    if (!metadata) return {};
    
    return {
        src: metadata.src || null,
        sck: metadata.sck || null,
        utm_source: metadata.utm_source || null,
        utm_campaign: metadata.utm_campaign || null,
        utm_medium: metadata.utm_medium || null,
        utm_content: metadata.utm_content || null,
        utm_term: metadata.utm_term || null
    };
}

/**
 * Monta o payload no formato correto da API UTMify
 */
function buildUtmifyPayload(transaction) {
    const {
        id,
        status,
        amount,
        customer,
        items,
        metadata,
        created_at,
        paid_at,
        updated_at
    } = transaction;

    // Extrai parâmetros de rastreamento dos metadados
    const trackingParams = extractTrackingParams(metadata);

    // Valor em centavos (a Otimize pode enviar em centavos ou reais)
    let amountInCents = amount;
    if (amount && amount < 1000) {
        // Se o valor for menor que 1000, provavelmente está em reais
        amountInCents = Math.round(amount * 100);
    }

    // Monta o payload conforme documentação da UTMify
    const payload = {
        orderId: id?.toString() || `TXN-${Date.now()}`,
        platform: PLATFORM_NAME,
        paymentMethod: 'pix',
        status: 'paid',
        createdAt: formatDateUTC(created_at || metadata?.created_at),
        approvedDate: formatDateUTC(paid_at || updated_at || new Date()),
        refundedAt: null,
        customer: {
            name: customer?.name || metadata?.customer_name || 'Cliente',
            email: customer?.email || metadata?.customer_email || 'cliente@email.com',
            phone: customer?.phone?.replace(/\D/g, '') || metadata?.customer_phone?.replace(/\D/g, '') || null,
            document: customer?.document?.number?.replace(/\D/g, '') || 
                      customer?.document?.replace(/\D/g, '') ||
                      metadata?.customer_document?.replace(/\D/g, '') || null,
            country: 'BR'
        },
        products: [],
        trackingParameters: trackingParams,
        commission: {
            totalPriceInCents: amountInCents,
            gatewayFeeInCents: 0,
            userCommissionInCents: amountInCents,
            currency: 'BRL'
        },
        isTest: false
    };

    // Processa os itens/produtos
    if (items && Array.isArray(items) && items.length > 0) {
        payload.products = items.map((item, index) => ({
            id: item.id?.toString() || `PROD-${index + 1}`,
            name: item.title || item.name || item.nome || 'Produto',
            planId: null,
            planName: null,
            quantity: parseInt(item.quantity || item.quantidade || 1),
            priceInCents: Math.round((item.unitPrice || item.unit_price || item.preco || amountInCents) * (item.unitPrice > 100 ? 1 : 100))
        }));
    } else {
        // Produto padrão se não houver itens
        payload.products = [{
            id: 'TAXA-SERVICO',
            name: metadata?.product_name || 'Taxa de Serviço',
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: amountInCents
        }];
    }

    return payload;
}

// ============================================
// HANDLER PRINCIPAL DO WEBHOOK
// ============================================

module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-token');

    // Responde OPTIONS para preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Método não permitido',
            message: 'Este endpoint aceita apenas requisições POST'
        });
    }

    const startTime = Date.now();

    try {
        const data = req.body;
        
        // Log do payload recebido
        logEvent('webhook_received', {
            body: data,
            headers: req.headers
        });

        console.log('📥 Webhook recebido da Otimize:', JSON.stringify(data, null, 2));

        // A Otimize pode enviar os dados de diferentes formas
        // Tenta extrair a transação do payload
        const transaction = data.transaction || data.data || data;

        // Extrai informações básicas
        const transactionId = transaction.id || data.id;
        const status = transaction.status || data.status;
        const amount = transaction.amount || data.amount || data.value || 0;

        // Validação básica
        if (!transactionId) {
            logEvent('webhook_error', { error: 'ID da transação não encontrado', data });
            return res.status(400).json({ 
                error: 'Dados incompletos',
                message: 'ID da transação não encontrado no payload'
            });
        }

        // Lista de status que indicam pagamento confirmado
        const paidStatuses = ['paid', 'completed', 'captured', 'authorized', 'approved'];
        const normalizedStatus = status?.toLowerCase();

        // Ignora se não for um status de pagamento confirmado
        if (!paidStatuses.includes(normalizedStatus)) {
            logEvent('webhook_ignored', { 
                transactionId, 
                status,
                reason: 'Status não é de pagamento confirmado'
            });
            
            console.log(`⏭️ Transação ${transactionId} ignorada - Status: ${status}`);
            
            return res.status(200).json({ 
                success: true,
                ignored: true,
                message: `Status '${status}' não requer envio para UTMify`
            });
        }

        // Verifica duplicação
        if (isTransactionProcessed(transactionId)) {
            logEvent('webhook_duplicate', { transactionId });
            console.log(`🔄 Transação ${transactionId} já foi processada anteriormente`);
            
            return res.status(200).json({ 
                success: true,
                duplicated: true,
                message: 'Transação já foi processada anteriormente'
            });
        }

        // Verifica se o token da UTMify está configurado
        if (!UTMIFY_API_TOKEN || UTMIFY_API_TOKEN === 'SUA_CREDENCIAL_API_UTMIFY_AQUI') {
            logEvent('webhook_error', { 
                error: 'Token UTMify não configurado',
                transactionId 
            });
            
            console.error('❌ UTMIFY_API_TOKEN não está configurado!');
            
            return res.status(500).json({ 
                error: 'Configuração incompleta',
                message: 'Token da API UTMify não está configurado. Configure a variável de ambiente UTMIFY_API_TOKEN.'
            });
        }

        // Monta o payload para a UTMify
        const utmifyPayload = buildUtmifyPayload({
            ...transaction,
            id: transactionId,
            status: normalizedStatus,
            amount
        });

        console.log('📤 Enviando para UTMify:', JSON.stringify(utmifyPayload, null, 2));

        // Envia para a API da UTMify
        const utmifyResponse = await axios.post(UTMIFY_ENDPOINT, utmifyPayload, {
            headers: {
                'x-api-token': UTMIFY_API_TOKEN,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 segundos de timeout
        });

        // Marca como processada
        saveProcessedTransaction(transactionId);

        const processingTime = Date.now() - startTime;

        // Log de sucesso
        logEvent('webhook_success', {
            transactionId,
            utmifyResponse: utmifyResponse.data,
            processingTime
        });

        console.log(`✅ Conversão enviada para UTMify com sucesso!`);
        console.log(`   Transaction ID: ${transactionId}`);
        console.log(`   Valor: R$ ${(utmifyPayload.commission.totalPriceInCents / 100).toFixed(2)}`);
        console.log(`   Tempo de processamento: ${processingTime}ms`);

        return res.status(200).json({
            success: true,
            message: 'Conversão enviada para UTMify com sucesso',
            transactionId,
            utmifyResponse: utmifyResponse.data,
            processingTime
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        // Log detalhado do erro
        const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            processingTime
        };

        logEvent('webhook_error', errorDetails);

        console.error('❌ Erro no webhook:', errorDetails);

        // Retorna erro mas com status 200 para não causar retry infinito da Otimize
        // Em produção, você pode querer retornar 500 para que a Otimize tente novamente
        return res.status(200).json({
            success: false,
            error: 'Erro ao processar webhook',
            message: error.message,
            details: error.response?.data || null
        });
    }
};
