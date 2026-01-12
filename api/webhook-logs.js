/**
 * Endpoint para visualizar logs do webhook UTMify
 * 
 * Acesse: GET /api/webhook-logs
 * 
 * Este endpoint é útil para debug e monitoramento das conversões
 * enviadas para a UTMify.
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join('/tmp', 'utmify_webhook_logs.json');
const PROCESSED_FILE = path.join('/tmp', 'utmify_processed_transactions.json');

module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Carrega os logs
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        }

        // Carrega transações processadas
        let processedTransactions = [];
        if (fs.existsSync(PROCESSED_FILE)) {
            processedTransactions = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
        }

        // Parâmetros de query
        const { limit = 50, type, clear } = req.query;

        // Limpa os logs se solicitado
        if (clear === 'true') {
            fs.writeFileSync(LOG_FILE, JSON.stringify([]));
            return res.status(200).json({
                success: true,
                message: 'Logs limpos com sucesso'
            });
        }

        // Filtra por tipo se especificado
        let filteredLogs = logs;
        if (type) {
            filteredLogs = logs.filter(log => log.type === type);
        }

        // Limita a quantidade de logs retornados
        const limitedLogs = filteredLogs.slice(-parseInt(limit));

        // Estatísticas
        const stats = {
            total_logs: logs.length,
            total_processed: processedTransactions.length,
            by_type: {
                webhook_received: logs.filter(l => l.type === 'webhook_received').length,
                webhook_success: logs.filter(l => l.type === 'webhook_success').length,
                webhook_error: logs.filter(l => l.type === 'webhook_error').length,
                webhook_ignored: logs.filter(l => l.type === 'webhook_ignored').length,
                webhook_duplicate: logs.filter(l => l.type === 'webhook_duplicate').length
            },
            last_success: logs.filter(l => l.type === 'webhook_success').slice(-1)[0] || null,
            last_error: logs.filter(l => l.type === 'webhook_error').slice(-1)[0] || null
        };

        return res.status(200).json({
            success: true,
            stats,
            logs: limitedLogs.reverse(), // Mais recentes primeiro
            processed_transactions: processedTransactions.slice(-20) // Últimas 20 transações
        });

    } catch (error) {
        console.error('Erro ao ler logs:', error);
        return res.status(500).json({
            error: 'Erro ao ler logs',
            message: error.message
        });
    }
};
