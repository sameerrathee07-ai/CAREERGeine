import natural from 'natural';
import 'dotenv/config';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;

const KNOWN_SKILLS = (process.env.KNOWN_SKILLS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'has', 'have', 'had',
  'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'can', 'could', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'its', 'our',
  'their', 'about', 'after', 'all', 'also', 'am', 'any', 'because', 'been', 'being',
  'between', 'both', 'each', 'few', 'here', 'how', 'into', 'just', 'like', 'more',
  'most', 'much', 'no', 'nor', 'not', 'now', 'only', 'other', 'out', 'over', 'own',
  'same', 'so', 'than', 'too', 'up', 'very', 'what', 'when', 'where', 'which',
  'while', 'who', 'why',
]);

export function preprocess(text) {
  if (!text || typeof text !== 'string') return [];
  return tokenizer.tokenize(text.toLowerCase())
    .filter((word) => word.length > 1 && !COMMON_STOP_WORDS.has(word))
    .map((word) => stemmer.stem(word));
}

export function extractSkills(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  // Multi-word skills first (longer matches have priority)
  const sortedSkills = [...KNOWN_SKILLS].sort((a, b) => b.length - a.length);
  for (const skill of sortedSkills) {
    if (lower.includes(skill)) {
      found.add(skill);
    }
  }
  return Array.from(found).map((s) => {
    return KNOWN_SKILLS.find((k) => k.toLowerCase() === s) || s;
  });
}

export function extractSections(text) {
  const sections = {
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: '',
  };

  const sectionHeaders = {
    summary: /(?:professional\s+)?summary|profile|about\s+me/i,
    experience: /(?:work\s+)?experience|employment|work\s+history|professional\s+background/i,
    education: /education|academic|qualifications|degrees?/i,
    skills: /skills|technical\s+skills|core\s+competencies|expertise/i,
    projects: /projects|personal\s+projects|key\s+projects/i,
    certifications: /certifications|certificates|licenses|accreditations/i,
  };

  const lines = text.split('\n');
  let currentSection = 'summary';
  const sectionLines = { summary: [], experience: [], education: [], skills: [], projects: [], certifications: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matched = false;
    for (const [key, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(trimmed) && trimmed.length < 100) {
        currentSection = key;
        matched = true;
        break;
      }
    }
    if (!matched && sectionLines[currentSection]) {
      sectionLines[currentSection].push(trimmed);
    }
  }

  for (const key of Object.keys(sections)) {
    sections[key] = sectionLines[key].join('\n').trim();
  }

  return sections;
}

export function extractExperience(yearsText) {
  if (!yearsText) return { years: '0', level: 'entry' };
  const yearsMatch = yearsText.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  let level = 'entry';
  if (years >= 8) level = 'lead';
  else if (years >= 5) level = 'senior';
  else if (years >= 2) level = 'mid';

  return { years: years.toString(), level };
}

export function extractEducation(text) {
  if (!text) return '';
  const degrees = text.match(/(?:Bachelor|Master|PhD|Doctorate|B\.?\w*|M\.?\w*|Associate|High\s*School)/gi);
  if (degrees) return degrees.join(', ');
  // Fallback: return first meaningful line
  const lines = text.split('\n').filter((l) => l.trim().length > 10);
  return lines[0] || '';
}

export function computeMatchScore(resumeText, jobDescription, resumeSkills = []) {
  if (!resumeText && !resumeSkills.length) return 0;

  const tfidf = new TfIdf();
  tfidf.addDocument(resumeText || '');
  tfidf.addDocument(jobDescription || '');

  let similarity = 0;
  try {
    tfidf.tfidfs('', 0);
    const doc1Terms = {};
    const doc2Terms = {};
    tfidf.listTerms(0).forEach((item) => { doc1Terms[item.term] = item.tfidf; });
    tfidf.listTerms(1).forEach((item) => { doc2Terms[item.term] = item.tfidf; });

    const allTerms = new Set([...Object.keys(doc1Terms), ...Object.keys(doc2Terms)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const term of allTerms) {
      const v1 = doc1Terms[term] || 0;
      const v2 = doc2Terms[term] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }

    similarity = norm1 && norm2 ? dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2)) : 0;
  } catch {
    similarity = 0;
  }

  // Skill overlap score (0-1)
  const jobSkills = extractSkills(jobDescription);
  const skillOverlap = jobSkills.length
    ? resumeSkills.filter((s) => jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())).length / jobSkills.length
    : 0;

  // Combined: 60% TF-IDF similarity + 40% skill overlap
  return Math.round(((similarity * 0.6) + (skillOverlap * 0.4)) * 100);
}

export function generateSuggestions(resumeText, jobDescription) {
  const suggestions = [];
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription || '');

  const missingSkills = jobSkills.filter(
    (js) => !resumeSkills.some((rs) => rs.toLowerCase() === js.toLowerCase())
  );

  if (missingSkills.length > 0) {
    suggestions.push(`Add these missing skills to your resume: ${missingSkills.slice(0, 5).join(', ')}`);
  }

  if (resumeSkills.length < 5) {
    suggestions.push('Add more relevant skills to improve your match score');
  }

  if (resumeText && resumeText.split(/\s+/).length < 100) {
    suggestions.push('Your resume appears too short. Add more details about your experience and achievements.');
  }

  const bulletPoints = (resumeText.match(/[•\-\*]\s/g) || []).length;
  if (bulletPoints < 5) {
    suggestions.push('Use bullet points with action verbs to describe your achievements');
  }

  const numbers = resumeText.match(/\d+%/g);
  if (!numbers) {
    suggestions.push('Quantify your achievements with percentages and metrics');
  }

  if (!resumeText.toLowerCase().includes('summary') && !resumeText.toLowerCase().includes('profile')) {
    suggestions.push('Add a professional summary at the top of your resume');
  }

  return suggestions.slice(0, 5);
}

export function extractName(text) {
  // Simple heuristic: first line that looks like a name
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(trimmed)) {
      return trimmed;
    }
  }
  return '';
}

export function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

export function extractPhone(text) {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : '';
}

export default {
  preprocess,
  extractSkills,
  extractSections,
  extractExperience,
  extractEducation,
  computeMatchScore,
  generateSuggestions,
  extractName,
  extractEmail,
  extractPhone,
};
