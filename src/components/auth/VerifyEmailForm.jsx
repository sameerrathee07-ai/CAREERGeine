import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export function VerifyEmailForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <span className="text-xl font-bold text-surface-900 dark:text-surface-100">CareerGenie</span>
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Verify your email</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-lg font-semibold input-field"
          />
        ))}
      </div>

      <Button className="w-full" disabled={code.some((d) => !d)}>
        Verify Email
      </Button>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-4">
        Didn&apos;t receive code?{' '}
        <button className="text-primary-600 hover:text-primary-700 font-medium">Resend</button>
      </p>
    </div>
  );
}
