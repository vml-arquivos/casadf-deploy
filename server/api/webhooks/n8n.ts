import { Router } from "express";
import { db, pool } from "../../db";
import { leads, n8nChatHistories, properties } from "../../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

// ============================================
// WEBHOOK: Ingestão de Leads via N8N
// ============================================
router.post("/leads/ingest", async (req, res) => {
  try {
    const { 
      name, phone, email, 
      qualification, stage, client_type,
      budget_min, budget_max, neighborhoods,
      property_id,
      message_log, interest_profile 
    } = req.body;

    console.log(`[Webhook] Processando lead: ${phone} | Qualificação: ${qualification}`);

    // Upsert Inteligente: Atualiza colunas se existirem no payload
    await db.insert(leads).values({
      name: name || "Lead N8N",
      phone: phone,
      email: email,
      qualification: qualification || "nao_qualificado",
      stage: stage || "novo",
      clientType: client_type || "comprador",
      budgetMin: budget_min ? String(budget_min) : null,
      budgetMax: budget_max ? String(budget_max) : null,
      preferredNeighborhoods: neighborhoods,
      interestedPropertyId: property_id ? Number(property_id) : null,
      interestProfile: interest_profile || {},
    }).onConflictDoUpdate({
      target: leads.phone,
      set: { 
        ...(qualification ? { qualification } : {}),
        ...(stage ? { stage } : {}),
        ...(budget_min ? { budgetMin: String(budget_min) } : {}),
        ...(neighborhoods ? { preferredNeighborhoods: neighborhoods } : {}),
        interestProfile: interest_profile
      }
    });

    // Log de Conversa
    if (message_log) {
      await db.insert(n8nChatHistories).values({
        sessionId: phone,
        role: 'user',
        message: typeof message_log === 'string' ? { content: message_log } : message_log
      });
    }

    res.json({ success: true });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

// ============================================
// WEBHOOK: Salvar Cliente (casadf_clients)
// ============================================
router.post("/clients/save", async (req, res) => {
  try {
    const { name, phone, email, origin, status, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
    }

    console.log(`[Webhook] Salvando cliente: ${name} (${phone})`);

    const result = await pool.query(
      `INSERT INTO casadf_clients (name, phone, email, origin, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (phone) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         email = COALESCE(EXCLUDED.email, casadf_clients.email),
         status = COALESCE(EXCLUDED.status, casadf_clients.status),
         notes = COALESCE(EXCLUDED.notes, casadf_clients.notes),
         updated_at = NOW()
       RETURNING id`,
      [name, phone, email || null, origin || 'whatsapp', status || 'novo', notes || null]
    );

    res.json({ success: true, client_id: result.rows[0].id });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao salvar cliente" });
  }
});

// ============================================
// WEBHOOK: Salvar Interesse do Cliente
// ============================================
router.post("/clients/interests", async (req, res) => {
  try {
    const { 
      client_id, phone, 
      property_type, interest_type, 
      budget_min, budget_max, 
      preferred_neighborhoods, bedrooms, notes 
    } = req.body;

    let finalClientId = client_id;

    // Se não tem client_id mas tem phone, buscar
    if (!finalClientId && phone) {
      const clientResult = await pool.query(
        'SELECT id FROM casadf_clients WHERE phone = $1',
        [phone]
      );
      if (clientResult.rows.length > 0) {
        finalClientId = clientResult.rows[0].id;
      }
    }

    if (!finalClientId) {
      return res.status(400).json({ error: "client_id ou phone são obrigatórios" });
    }

    console.log(`[Webhook] Salvando interesse do cliente ID: ${finalClientId}`);

    await pool.query(
      `INSERT INTO casadf_client_interests 
       (client_id, property_type, interest_type, budget_min, budget_max, preferred_neighborhoods, bedrooms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        finalClientId,
        property_type || null,
        interest_type || null,
        budget_min || null,
        budget_max || null,
        preferred_neighborhoods || null,
        bedrooms || null,
        notes || null
      ]
    );

    res.json({ success: true });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao salvar interesse" });
  }
});

// ============================================
// WEBHOOK: Agendar Visita
// ============================================
router.post("/visits/schedule", async (req, res) => {
  try {
    const { 
      client_id, phone, client_name,
      property_id, 
      visit_date, visit_time, 
      notes 
    } = req.body;

    if (!phone || !client_name || !visit_date || !visit_time) {
      return res.status(400).json({ 
        error: "phone, client_name, visit_date e visit_time são obrigatórios" 
      });
    }

    console.log(`[Webhook] Agendando visita: ${client_name} em ${visit_date} ${visit_time}`);

    const result = await pool.query(
      `INSERT INTO casadf_visits 
       (client_id, property_id, phone, client_name, visit_date, visit_time, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        client_id || null,
        property_id || null,
        phone,
        client_name,
        visit_date,
        visit_time,
        'agendada',
        notes || null
      ]
    );

    res.json({ success: true, visit_id: result.rows[0].id });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao agendar visita" });
  }
});

// ============================================
// WEBHOOK: Salvar Mensagem no Buffer
// ============================================
router.post("/messages/buffer", async (req, res) => {
  try {
    const { phone, message_id, message_text, message_type } = req.body;

    if (!phone || !message_id) {
      return res.status(400).json({ error: "phone e message_id são obrigatórios" });
    }

    await pool.query(
      `INSERT INTO casadf_message_buffer (phone, message_id, message_text, message_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (message_id) DO NOTHING`,
      [phone, message_id, message_text || null, message_type || 'text']
    );

    res.json({ success: true });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao salvar mensagem" });
  }
});

// ============================================
// WEBHOOK: Salvar Contexto da IA
// ============================================
router.post("/ai/context", async (req, res) => {
  try {
    const { session_id, phone, message, context_type, metadata } = req.body;

    if (!session_id || !phone || !message) {
      return res.status(400).json({ error: "session_id, phone e message são obrigatórios" });
    }

    await pool.query(
      `INSERT INTO casadf_ai_context (session_id, phone, message, context_type, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session_id,
        phone,
        typeof message === 'string' ? JSON.parse(message) : message,
        context_type || 'conversation',
        metadata || null
      ]
    );

    res.json({ success: true });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao salvar contexto" });
  }
});

// ============================================
// WEBHOOK: Buscar Imóveis (para a IA)
// ============================================
router.post("/properties/search", async (req, res) => {
  try {
    const { 
      property_type, 
      transaction_type, 
      min_price, max_price, 
      bedrooms, 
      neighborhood,
      limit 
    } = req.body;

    let query = `SELECT id, title, property_type, transaction_type, sale_price, rent_price, 
                        neighborhood, city, bedrooms, bathrooms, total_area, status
                 FROM properties 
                 WHERE status = 'disponivel'`;
    const params: any[] = [];
    let paramCount = 1;

    if (property_type) {
      query += ` AND property_type = $${paramCount}`;
      params.push(property_type);
      paramCount++;
    }

    if (transaction_type) {
      query += ` AND transaction_type = $${paramCount}`;
      params.push(transaction_type);
      paramCount++;
    }

    if (min_price) {
      query += ` AND (sale_price >= $${paramCount} OR rent_price >= $${paramCount})`;
      params.push(min_price);
      paramCount++;
    }

    if (max_price) {
      query += ` AND (sale_price <= $${paramCount} OR rent_price <= $${paramCount})`;
      params.push(max_price);
      paramCount++;
    }

    if (bedrooms) {
      query += ` AND bedrooms >= $${paramCount}`;
      params.push(bedrooms);
      paramCount++;
    }

    if (neighborhood) {
      query += ` AND LOWER(neighborhood) LIKE LOWER($${paramCount})`;
      params.push(`%${neighborhood}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit || 10);

    const result = await pool.query(query, params);

    res.json({ success: true, properties: result.rows });
  } catch (e) {
    console.error('[Webhook Error]', e);
    res.status(500).json({ error: "Erro ao buscar imóveis" });
  }
});

// ============================================
// WEBHOOK: Health Check
// ============================================
router.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "n8n-webhooks",
    timestamp: new Date().toISOString() 
  });
});

export default router;
