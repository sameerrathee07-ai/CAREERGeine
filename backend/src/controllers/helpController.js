import { db, Timestamp } from '../config/firebase.js';
import { queryDocuments } from '../services/firestore.js';
import logger from '../services/logger.js';
import { BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../utils/helpers.js';

export async function createArticle(req, res, next) {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !title.trim()) throw new BadRequestError('Title is required');
    if (!content || !content.trim()) throw new BadRequestError('Content is required');

    const article = {
      title: title.trim(),
      content: content.trim(),
      slug: title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      category: category || 'general',
      tags: tags || [],
      authorId: req.user.uid,
      status: 'published',
      views: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const ref = await db.collection('helpArticles').add(article);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'help.createArticle', resource: 'helpArticles',
      resourceId: ref.id, req,
    }));

    res.status(201).json({ success: true, data: { id: ref.id, ...article } });
  } catch (err) {
    next(err);
  }
}

export async function listArticles(req, res, next) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let filters = [];
    filters.push({ type: 'where', field: 'status', op: '==', value: 'published' });
    if (category) filters.push({ type: 'where', field: 'category', op: '==', value: category });

    const result = await queryDocuments({
      collection: 'helpArticles',
      filters,
      sort: 'createdAt',
      order: 'desc',
      page: parseInt(page),
      limit: parseInt(limit),
    });

    let data = result.data;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((a) =>
        a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
      );
    }

    // Strip content to excerpts
    data = data.map(({ content, ...rest }) => ({
      ...rest,
      excerpt: content?.substring(0, 200) || '',
    }));

    res.json({ success: true, data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getArticle(req, res, next) {
  try {
    const ref = db.collection('helpArticles').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } });
    }

    // Increment views
    await ref.update({ views: (doc.data().views || 0) + 1 });

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const { title, content, category, tags, status } = req.body;
    const updates = { updatedAt: Timestamp.now() };

    if (title) {
      updates.title = title.trim();
      updates.slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (content) updates.content = content.trim();
    if (category) updates.category = category;
    if (tags) updates.tags = tags;
    if (status) updates.status = status;

    await db.collection('helpArticles').doc(req.params.id).update(updates);

    logger.info(`Help article updated: ${req.params.id}`);

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'help.updateArticle', resource: 'helpArticles',
      resourceId: req.params.id, req,
    }));

    res.json({ success: true, message: 'Article updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    await db.collection('helpArticles').doc(req.params.id).delete();

    await db.collection('auditLogs').add(createAuditLog({
      userId: req.user.uid, action: 'help.deleteArticle', resource: 'helpArticles',
      resourceId: req.params.id, req,
    }));

    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
}

export async function markHelpful(req, res, next) {
  try {
    const ref = db.collection('helpArticles').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } });
    }

    const { helpful } = req.body;
    if (helpful) {
      await ref.update({ helpfulCount: (doc.data().helpfulCount || 0) + 1 });
    } else {
      await ref.update({ notHelpfulCount: (doc.data().notHelpfulCount || 0) + 1 });
    }

    res.json({ success: true, message: 'Feedback recorded' });
  } catch (err) {
    next(err);
  }
}
