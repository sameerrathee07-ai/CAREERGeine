import { aiCall, isAiConfigured } from './openai.js';
import { promptParseResume } from './aiPrompts.js';
import {
  extractSkills, extractSections, extractExperience, extractEducation,
  extractName, extractEmail, extractPhone,
} from './nlp.js';
import logger from './logger.js';

export async function aiParseResume(resumeText) {
  if (!resumeText || resumeText.trim().length < 20) {
    throw new Error('Resume text too short');
  }

  // AI-first
  if (isAiConfigured()) {
    try {
      const result = await aiCall({
        ...promptParseResume(resumeText),
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            linkedin: { type: 'string' },
            portfolio: { type: 'string' },
            summary: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            tools: { type: 'array', items: { type: 'string' } },
            languages: { type: 'array', items: { type: 'string' } },
            certifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  issuer: { type: 'string' },
                  year: { type: 'string' },
                },
                required: ['name'],
              },
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  company: { type: 'string' },
                  location: { type: 'string' },
                  startDate: { type: 'string' },
                  endDate: { type: 'string' },
                  description: { type: 'string' },
                  highlights: { type: 'array', items: { type: 'string' } },
                },
                required: ['title', 'company'],
              },
            },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: { type: 'string' },
                  institution: { type: 'string' },
                  field: { type: 'string' },
                  year: { type: 'string' },
                },
                required: ['degree', 'institution'],
              },
            },
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  technologies: { type: 'array', items: { type: 'string' } },
                  url: { type: 'string' },
                },
                required: ['name'],
              },
            },
            softSkills: { type: 'array', items: { type: 'string' } },
          },
          required: ['name', 'email', 'skills'],
        },
      });

      if (result) return { ...result.data, _source: 'ai' };
    } catch (err) {
      logger.warn(`AI resume parse failed, falling back to NLP: ${err.message}`);
    }
  }

  // NLP fallback
  const sections = extractSections(resumeText);
  return {
    name: extractName(resumeText),
    email: extractEmail(resumeText),
    phone: extractPhone(resumeText),
    location: '',
    linkedin: null,
    portfolio: null,
    summary: sections.summary || null,
    skills: extractSkills(resumeText),
    tools: [],
    languages: [],
    certifications: [],
    experience: [{
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: sections.experience,
      highlights: [],
    }],
    education: [{
      degree: extractEducation(sections.education),
      institution: '',
      field: '',
      year: '',
    }],
    projects: [],
    softSkills: [],
    _source: 'nlp',
  };
}
