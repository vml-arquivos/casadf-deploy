import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db, pool } from "../db";
import { eq, and, desc, asc } from "drizzle-orm";

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const siteSettingsSchema = z.object({
  companyName: z.string().min(1),
  companySlogan: z.string().optional(),
  companyDescription: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
  logoDarkUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  fontSizeBase: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  businessHours: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
});

const sitePageSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  content: z.any(), // JSONB
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  showInMenu: z.boolean().optional(),
  menuLabel: z.string().optional(),
  icon: z.string().optional(),
  orderIndex: z.number().optional(),
});

const siteBlockSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  content: z.any(), // JSONB
  isActive: z.boolean().optional(),
});

const siteTestimonialSchema = z.object({
  clientName: z.string().min(1),
  clientRole: z.string().optional(),
  clientPhoto: z.string().url().optional().nullable(),
  testimonial: z.string().min(1),
  rating: z.number().min(1).max(5),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().optional(),
});

const siteFaqSchema = z.object({
  category: z.string().optional(),
  question: z.string().min(1),
  answer: z.string().min(1),
  orderIndex: z.number().optional(),
  isActive: z.boolean().optional(),
});

const siteBannerSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional().nullable(),
  linkText: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  orderIndex: z.number().optional(),
});

// ============================================
// ROTAS: CONFIGURAÇÕES DO SITE
// ============================================

export const cmsRouter = router({
  // Obter configurações (público)
  getSettings: publicProcedure.query(async () => {
    const result = await pool.query('SELECT * FROM site_settings WHERE id = 1');
    return result.rows[0] || null;
  }),

  // Atualizar configurações (protegido)
  updateSettings: protectedProcedure
    .input(siteSettingsSchema)
    .mutation(async ({ input }) => {
      const fields = Object.keys(input).map((key, i) => 
        `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`
      ).join(', ');
      
      const values = Object.values(input);
      
      await pool.query(
        `UPDATE site_settings SET ${fields}, updated_at = NOW() WHERE id = 1`,
        values
      );
      
      return { success: true };
    }),

  // ============================================
  // ROTAS: PÁGINAS
  // ============================================

  // Listar páginas (público)
  listPages: publicProcedure
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      let query = 'SELECT * FROM site_pages';
      const params: any[] = [];
      
      if (input?.activeOnly) {
        query += ' WHERE is_active = TRUE';
      }
      
      query += ' ORDER BY order_index ASC';
      
      const result = await pool.query(query, params);
      return result.rows;
    }),

  // Obter página por slug (público)
  getPageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await pool.query(
        'SELECT * FROM site_pages WHERE slug = $1',
        [input.slug]
      );
      return result.rows[0] || null;
    }),

  // Criar página (protegido)
  createPage: protectedProcedure
    .input(sitePageSchema)
    .mutation(async ({ input }) => {
      const result = await pool.query(
        `INSERT INTO site_pages 
         (slug, title, subtitle, content, meta_title, meta_description, is_active, show_in_menu, menu_label, icon, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          input.slug,
          input.title,
          input.subtitle || null,
          JSON.stringify(input.content),
          input.metaTitle || null,
          input.metaDescription || null,
          input.isActive !== false,
          input.showInMenu !== false,
          input.menuLabel || input.title,
          input.icon || null,
          input.orderIndex || 0,
        ]
      );
      
      return { success: true, id: result.rows[0].id };
    }),

  // Atualizar página (protegido)
  updatePage: protectedProcedure
    .input(z.object({ id: z.number(), data: sitePageSchema }))
    .mutation(async ({ input }) => {
      await pool.query(
        `UPDATE site_pages SET
         slug = $1, title = $2, subtitle = $3, content = $4,
         meta_title = $5, meta_description = $6, is_active = $7,
         show_in_menu = $8, menu_label = $9, icon = $10, order_index = $11,
         updated_at = NOW()
         WHERE id = $12`,
        [
          input.data.slug,
          input.data.title,
          input.data.subtitle || null,
          JSON.stringify(input.data.content),
          input.data.metaTitle || null,
          input.data.metaDescription || null,
          input.data.isActive !== false,
          input.data.showInMenu !== false,
          input.data.menuLabel || input.data.title,
          input.data.icon || null,
          input.data.orderIndex || 0,
          input.id,
        ]
      );
      
      return { success: true };
    }),

  // Deletar página (protegido)
  deletePage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Verificar se é página do sistema
      const check = await pool.query(
        'SELECT is_system FROM site_pages WHERE id = $1',
        [input.id]
      );
      
      if (check.rows[0]?.is_system) {
        throw new Error('Páginas do sistema não podem ser deletadas');
      }
      
      await pool.query('DELETE FROM site_pages WHERE id = $1', [input.id]);
      return { success: true };
    }),

  // ============================================
  // ROTAS: BLOCOS
  // ============================================

  // Listar blocos (público)
  listBlocks: publicProcedure.query(async () => {
    const result = await pool.query('SELECT * FROM site_blocks WHERE is_active = TRUE');
    return result.rows;
  }),

  // Obter bloco por nome (público)
  getBlockByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const result = await pool.query(
        'SELECT * FROM site_blocks WHERE name = $1',
        [input.name]
      );
      return result.rows[0] || null;
    }),

  // Criar bloco (protegido)
  createBlock: protectedProcedure
    .input(siteBlockSchema)
    .mutation(async ({ input }) => {
      const result = await pool.query(
        `INSERT INTO site_blocks (name, type, content, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          input.name,
          input.type,
          JSON.stringify(input.content),
          input.isActive !== false,
        ]
      );
      
      return { success: true, id: result.rows[0].id };
    }),

  // Atualizar bloco (protegido)
  updateBlock: protectedProcedure
    .input(z.object({ id: z.number(), data: siteBlockSchema }))
    .mutation(async ({ input }) => {
      await pool.query(
        `UPDATE site_blocks SET
         name = $1, type = $2, content = $3, is_active = $4, updated_at = NOW()
         WHERE id = $5`,
        [
          input.data.name,
          input.data.type,
          JSON.stringify(input.data.content),
          input.data.isActive !== false,
          input.id,
        ]
      );
      
      return { success: true };
    }),

  // Deletar bloco (protegido)
  deleteBlock: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await pool.query('DELETE FROM site_blocks WHERE id = $1', [input.id]);
      return { success: true };
    }),

  // ============================================
  // ROTAS: DEPOIMENTOS
  // ============================================

  // Listar depoimentos (público)
  listTestimonials: publicProcedure
    .input(z.object({ featuredOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      let query = 'SELECT * FROM site_testimonials WHERE is_active = TRUE';
      
      if (input?.featuredOnly) {
        query += ' AND is_featured = TRUE';
      }
      
      query += ' ORDER BY order_index ASC';
      
      const result = await pool.query(query);
      return result.rows;
    }),

  // Criar depoimento (protegido)
  createTestimonial: protectedProcedure
    .input(siteTestimonialSchema)
    .mutation(async ({ input }) => {
      const result = await pool.query(
        `INSERT INTO site_testimonials 
         (client_name, client_role, client_photo, testimonial, rating, is_featured, is_active, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          input.clientName,
          input.clientRole || null,
          input.clientPhoto || null,
          input.testimonial,
          input.rating,
          input.isFeatured || false,
          input.isActive !== false,
          input.orderIndex || 0,
        ]
      );
      
      return { success: true, id: result.rows[0].id };
    }),

  // Atualizar depoimento (protegido)
  updateTestimonial: protectedProcedure
    .input(z.object({ id: z.number(), data: siteTestimonialSchema }))
    .mutation(async ({ input }) => {
      await pool.query(
        `UPDATE site_testimonials SET
         client_name = $1, client_role = $2, client_photo = $3,
         testimonial = $4, rating = $5, is_featured = $6, is_active = $7, order_index = $8
         WHERE id = $9`,
        [
          input.data.clientName,
          input.data.clientRole || null,
          input.data.clientPhoto || null,
          input.data.testimonial,
          input.data.rating,
          input.data.isFeatured || false,
          input.data.isActive !== false,
          input.data.orderIndex || 0,
          input.id,
        ]
      );
      
      return { success: true };
    }),

  // Deletar depoimento (protegido)
  deleteTestimonial: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await pool.query('DELETE FROM site_testimonials WHERE id = $1', [input.id]);
      return { success: true };
    }),

  // ============================================
  // ROTAS: FAQs
  // ============================================

  // Listar FAQs (público)
  listFaqs: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      let query = 'SELECT * FROM site_faqs WHERE is_active = TRUE';
      const params: any[] = [];
      
      if (input?.category) {
        query += ' AND category = $1';
        params.push(input.category);
      }
      
      query += ' ORDER BY order_index ASC';
      
      const result = await pool.query(query, params);
      return result.rows;
    }),

  // Criar FAQ (protegido)
  createFaq: protectedProcedure
    .input(siteFaqSchema)
    .mutation(async ({ input }) => {
      const result = await pool.query(
        `INSERT INTO site_faqs (category, question, answer, order_index, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          input.category || 'geral',
          input.question,
          input.answer,
          input.orderIndex || 0,
          input.isActive !== false,
        ]
      );
      
      return { success: true, id: result.rows[0].id };
    }),

  // Atualizar FAQ (protegido)
  updateFaq: protectedProcedure
    .input(z.object({ id: z.number(), data: siteFaqSchema }))
    .mutation(async ({ input }) => {
      await pool.query(
        `UPDATE site_faqs SET
         category = $1, question = $2, answer = $3, order_index = $4, is_active = $5
         WHERE id = $6`,
        [
          input.data.category || 'geral',
          input.data.question,
          input.data.answer,
          input.data.orderIndex || 0,
          input.data.isActive !== false,
          input.id,
        ]
      );
      
      return { success: true };
    }),

  // Deletar FAQ (protegido)
  deleteFaq: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await pool.query('DELETE FROM site_faqs WHERE id = $1', [input.id]);
      return { success: true };
    }),

  // ============================================
  // ROTAS: BANNERS
  // ============================================

  // Listar banners (público)
  listBanners: publicProcedure
    .input(z.object({ position: z.string().optional() }).optional())
    .query(async ({ input }) => {
      let query = `SELECT * FROM site_banners 
                   WHERE is_active = TRUE 
                   AND (start_date IS NULL OR start_date <= NOW())
                   AND (end_date IS NULL OR end_date >= NOW())`;
      const params: any[] = [];
      
      if (input?.position) {
        query += ' AND (position = $1 OR position = \'all\')';
        params.push(input.position);
      }
      
      query += ' ORDER BY order_index ASC';
      
      const result = await pool.query(query, params);
      return result.rows;
    }),

  // Criar banner (protegido)
  createBanner: protectedProcedure
    .input(siteBannerSchema)
    .mutation(async ({ input }) => {
      const result = await pool.query(
        `INSERT INTO site_banners 
         (title, description, image_url, link_url, link_text, position, is_active, start_date, end_date, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          input.title,
          input.description || null,
          input.imageUrl,
          input.linkUrl || null,
          input.linkText || null,
          input.position || 'home',
          input.isActive !== false,
          input.startDate || null,
          input.endDate || null,
          input.orderIndex || 0,
        ]
      );
      
      return { success: true, id: result.rows[0].id };
    }),

  // Atualizar banner (protegido)
  updateBanner: protectedProcedure
    .input(z.object({ id: z.number(), data: siteBannerSchema }))
    .mutation(async ({ input }) => {
      await pool.query(
        `UPDATE site_banners SET
         title = $1, description = $2, image_url = $3, link_url = $4, link_text = $5,
         position = $6, is_active = $7, start_date = $8, end_date = $9, order_index = $10
         WHERE id = $11`,
        [
          input.data.title,
          input.data.description || null,
          input.data.imageUrl,
          input.data.linkUrl || null,
          input.data.linkText || null,
          input.data.position || 'home',
          input.data.isActive !== false,
          input.data.startDate || null,
          input.data.endDate || null,
          input.data.orderIndex || 0,
          input.id,
        ]
      );
      
      return { success: true };
    }),

  // Deletar banner (protegido)
  deleteBanner: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await pool.query('DELETE FROM site_banners WHERE id = $1', [input.id]);
      return { success: true };
    }),
});
