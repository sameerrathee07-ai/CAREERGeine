import { db, FieldValue, Timestamp } from '../config/firebase.js';
import { NotFoundError } from '../utils/errors.js';

export async function getDocument(collection, id) {
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) throw new NotFoundError(`${collection.slice(0, -1)} not found`);
  return { id: doc.id, ...doc.data() };
}

export async function getDocumentOpt(collection, id) {
  const doc = await db.collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function setDocument(collection, id, data) {
  await db.collection(collection).doc(id).set({
    ...data,
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return getDocument(collection, id);
}

export async function createDocument(collection, data) {
  const ref = db.collection(collection).doc();
  const now = Timestamp.now();
  await ref.set({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return getDocument(collection, ref.id);
}

export async function updateDocument(collection, id, data) {
  const ref = db.collection(collection).doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new NotFoundError(`${collection.slice(0, -1)} not found`);
  await ref.update({ ...data, updatedAt: Timestamp.now() });
  return getDocument(collection, id);
}

export async function deleteDocument(collection, id) {
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) throw new NotFoundError(`${collection.slice(0, -1)} not found`);
  await db.collection(collection).doc(id).delete();
  return true;
}

export async function queryDocuments({ collection, filters = [], sort = 'createdAt', order = 'desc', page = 1, limit = 20 }) {
  let query = db.collection(collection);

  for (const filter of filters) {
    if (filter.type === 'where') {
      query = query.where(filter.field, filter.op, filter.value);
    }
    if (filter.type === 'orderBy') {
      query = query.orderBy(filter.field, filter.order || 'desc');
    }
  }

  query = query.orderBy(sort, order);

  const snapshot = await query.offset((page - 1) * limit).limit(limit).get();
  const totalSnapshot = await db.collection(collection).count().get();

  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  const total = totalSnapshot.data().count;

  return {
    data: docs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function incrementField(collection, id, field, amount = 1) {
  const ref = db.collection(collection).doc(id);
  await ref.update({ [field]: FieldValue.increment(amount), updatedAt: Timestamp.now() });
}
