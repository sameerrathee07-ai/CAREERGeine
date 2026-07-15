import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { uploadResumeFromText } from '../../store/slices/resumeSlice';
import { addToast } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function ResumeUploadWidget() {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef();
  const dispatch = useDispatch();
  const { loading, current } = useSelector((state) => state.resumes);

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + '\n';
    }
    return text;
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.pdf')) {
      dispatch(addToast({ type: 'error', message: 'Please upload a PDF file' }));
      return;
    }
    setParsing(true);
    try {
      const text = await extractTextFromPDF(file);
      if (text.trim().length < 20) {
        dispatch(addToast({ type: 'error', message: 'Could not extract text from this PDF' }));
        return;
      }
      await dispatch(uploadResumeFromText({ filename: file.name, text })).unwrap();
      dispatch(addToast({ type: 'success', message: 'Resume uploaded and analyzed!' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err || 'Upload failed' }));
    } finally {
      setParsing(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Upload Resume</h3>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {parsing ? 'Parsing PDF...' : loading ? 'Uploading...' : 'Drop your resume here or click to browse'}
        </p>
        <p className="text-xs text-surface-500">Supports PDF, DOCX (max 10MB)</p>
      </motion.div>

      {current && (
        <div className="mt-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{current.filename || 'resume.pdf'}</span>
            <span className="text-xs text-surface-500">Uploaded</span>
          </div>
          {current.analysis ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">Resume Score</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100">{current.analysis.resumeScore || 0}%</span>
              </div>
              <ProgressBar value={current.analysis.resumeScore || 0} />
            </div>
          ) : (
            <Button variant="secondary" size="sm" className="w-full mt-2" loading>
              Analyzing...
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
