import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { fileURLToPath } from 'url';
import { BadRequestError } from '../utils/errors.js';
import logger from './logger.js';
import {
  extractSkills,
  extractSections,
  extractExperience,
  extractEducation,
  computeMatchScore,
  generateSuggestions,
  extractName,
  extractEmail,
  extractPhone,
} from './nlp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function parsePDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestError('File not found');
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text || '',
      pages: data.numpages || 0,
      metadata: {
        title: data.info?.Title || '',
        author: data.info?.Author || '',
        subject: data.info?.Subject || '',
        keywords: data.info?.Keywords || '',
        creator: data.info?.Creator || '',
        producer: data.info?.Producer || '',
        creationDate: data.info?.CreationDate || '',
      },
    };
  } catch (error) {
    logger.error(`PDF parse error: ${error.message}`);
    throw new BadRequestError('Failed to parse PDF file. Ensure the file is a valid PDF.');
  }
}

export async function analyzeResume(filePath, jobDescription) {
  const parsed = await parsePDF(filePath);
  const text = parsed.text;

  if (!text || text.trim().length < 20) {
    throw new BadRequestError('Resume appears to be empty or contains insufficient text');
  }

  const sections = extractSections(text);
  const skills = extractSkills(text);
  const experience = extractExperience(sections.experience);
  const education = extractEducation(sections.education);
  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const suggestions = generateSuggestions(text, jobDescription);

  // Scores
  const skillScore = Math.min(100, Math.round((skills.length / 20) * 100));
  const contentScore = Math.min(100, Math.round((text.split(/\s+/).length / 300) * 100));
  const formatScore = sections.experience && sections.education ? 90 : 60;
  const atsScore = Math.min(100, Math.round((skillScore + contentScore + formatScore) / 3));
  const resumeScore = Math.min(100, Math.round((atsScore * 0.5) + (skillScore * 0.3) + (contentScore * 0.2)));

  let matchScore = 0;
  if (jobDescription) {
    matchScore = computeMatchScore(text, jobDescription, skills);
  }

  return {
    text,
    metadata: parsed.metadata,
    name,
    email,
    phone,
    skills,
    sections,
    experience,
    education,
    scores: {
      resumeScore,
      atsScore,
      skillScore,
      contentScore,
      formatScore,
      matchScore,
    },
    suggestions,
    wordCount: text.split(/\s+/).length,
    pageCount: parsed.pages,
  };
}

export function saveUploadedFile(buffer, originalName) {
  const ext = path.extname(originalName) || '.pdf';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return { filename, filePath, ext };
}

export function getUploadPath(filename) {
  return path.join(UPLOAD_DIR, filename);
}

export function deleteUploadedFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.warn(`Failed to delete temp file: ${filePath}`);
  }
}

export default {
  parsePDF,
  analyzeResume,
  saveUploadedFile,
  getUploadPath,
  deleteUploadedFile,
};
