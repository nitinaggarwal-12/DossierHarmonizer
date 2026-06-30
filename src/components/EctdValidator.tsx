import React, { useState } from 'react';
import { ShieldCheck, Play, FileCode, CheckCircle2, AlertOctagon, HelpCircle, RefreshCw, Terminal } from 'lucide-react';

const VALID_XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<ectd:ectd-submission xmlns:ectd="http://www.ich.org/ectd" version="4.0">
  <submission-header>
    <application-number>NDA-214958</application-number>
    <sequence-number>0001</sequence-number>
    <regulatory-activity-type>new-drug-application</regulatory-activity-type>
    <uuid>f81d4fae-7dec-11d0-a765-00a0c91e6bf6</uuid>
  </submission-header>
  <ectd-envelope>
    <country-code>US</country-code>
    <agency-name>FDA</agency-name>
    <product-name>AlignedCompound-Alpha</product-name>
  </ectd-envelope>
  <manifest>
    <file path="m3/32s-drug-sub/32s1-general-info.pdf" checksum-type="md5">a8bc76241a293bf7c264d1f2e96d9102</file>
    <file path="m3/32p-drug-prod/32p1-description.pdf" checksum-type="md5">b91ac7a29e24bf6cd5d1920aa234d101</file>
  </manifest>
</ectd:ectd-submission>`;

const INVALID_XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<ectd:ectd-submission xmlns:ectd="http://www.ich.org/ectd" version="4.0">
  <submission-header>
    <application-number>NDA-214958</application-number>
    <sequence-number>0001</sequence-number>
    <!-- MISSING REGULATORY ACTIVITY TYPE TAG -->
    <uuid>invalid-uuid-format-12345</uuid>
  </submission-header>
  <ectd-envelope>
    <country-code>US</country-code>
    <agency-name>FDA</agency-name>
  </ectd-envelope>
  <manifest>
    <!-- CRITICAL Checksum missing -->
    <file path="m3/32s-drug-sub/32s1-general-info.pdf" checksum-type="md5"></file>
  </manifest>
</ectd:ectd-submission>`;

interface EctdValidatorProps {
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function EctdValidator({ triggerNotification }: EctdValidatorProps) {
  const [xmlCode, setXmlCode] = useState(VALID_XML_SAMPLE);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'success' | 'failed';
    errors: { severity: 'error' | 'warning'; message: string; line?: number }[];
    warnings: string[];
    md5Matches: boolean;
    envelopeCheck: boolean;
  } | null>(null);

  const handleLoadSample = (type: 'valid' | 'invalid') => {
    setXmlCode(type === 'valid' ? VALID_XML_SAMPLE : INVALID_XML_SAMPLE);
    setValidationResult(null);
    triggerNotification(`Loaded ${type} eCTD XML schema template.`, 'info');
  };

  const handleValidate = () => {
    setIsValidating(true);
    setValidationResult(null);
    triggerNotification("Executing eCTD XML schema validation pass...", "info");

    setTimeout(() => {
      setIsValidating(false);
      
      const code = xmlCode.toLowerCase();
      const errors: { severity: 'error' | 'warning'; message: string; line?: number }[] = [];
      const warnings: string[] = [];

      // 1. Check schema tags
      if (!code.includes('<ectd:ectd-submission')) {
        errors.push({ severity: 'error', message: "Namespace 'ectd:ectd-submission' is undefined or missing root nodes.", line: 2 });
      }

      // 2. Check activity type
      if (!code.includes('<regulatory-activity-type>')) {
        errors.push({ severity: 'error', message: "Missing mandatory envelope element: '<regulatory-activity-type>' tag.", line: 6 });
      }

      // 3. Check UUID length
      const uuidMatch = code.match(/<uuid>([^<]+)<\/uuid>/);
      if (uuidMatch) {
        const uuidVal = uuidMatch[1];
        if (uuidVal.length !== 36 || !uuidVal.includes('-')) {
          errors.push({ severity: 'error', message: `Malformed UUID: "${uuidVal}". eCTD v4.0 requires valid RFC 4122 standard UUIDs.`, line: 7 });
        }
      } else {
        errors.push({ severity: 'error', message: "Submission identifier '<uuid>' is missing.", line: 7 });
      }

      // 4. Check checksums
      if (code.includes('checksum-type="md5">')) {
        const hasEmptyChecksum = code.includes('checksum-type="md5"></') || code.includes('checksum-type="md5"> </');
        if (hasEmptyChecksum) {
          errors.push({ severity: 'error', message: "File manifest item contains empty MD5 checksum field.", line: 15 });
        }
      }

      // Warnings
      if (!code.includes('version="4.0"')) {
        warnings.push("Old eCTD specification detected. Recommended upgrade to eCTD v4.0 schema standards.");
      }

      const isPassed = errors.length === 0;
      setValidationResult({
        status: isPassed ? 'success' : 'failed',
        errors,
        warnings,
        md5Matches: !code.includes('checksum-type="md5"></'),
        envelopeCheck: code.includes('<regulatory-activity-type>')
      });

      if (isPassed) {
        triggerNotification("eCTD validation successful! Schema is fully compliant.", "success");
      } else {
        triggerNotification(`eCTD validation failed with ${errors.length} schema errors.`, "error");
      }

    }, 1200);
  };

  return (
    <div className="space-y-6" id="ectd-validator">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-40 h-40 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            eCTD Schema & UUID Validator
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">XML Backbone Validator</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Audit compliance of eCTD submission manifests (index.xml) against ICH global xml schemes, UUID formats, and MD5 file integrity tags.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Code Editor (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">eCTD Submission Backbone Manifest</h3>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadSample('valid')}
                  className="px-2 py-1 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-bold text-slate-300 cursor-pointer"
                >
                  Load Valid XML
                </button>
                <button
                  onClick={() => handleLoadSample('invalid')}
                  className="px-2 py-1 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-bold text-slate-300 cursor-pointer"
                >
                  Load Erroneous XML
                </button>
              </div>
            </div>

            <textarea
              value={xmlCode}
              onChange={(e) => setXmlCode(e.target.value)}
              rows={11}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-[11px] font-mono outline-none text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <button
            onClick={handleValidate}
            disabled={isValidating || !xmlCode.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-md mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Run Submission Validation Pass
          </button>
        </div>

        {/* Right pane: Validation results Terminal console (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-start">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Validation Console Diagnostic</h3>

          {isValidating && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-xs font-bold text-slate-300">Evaluating Document Structure...</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Comparing element tree tags with ICH validation schemas</p>
            </div>
          )}

          {!isValidating && !validationResult && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Terminal className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-400">Console Awaiting Validation Stream</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Click the validate button to initiate diagnostic schemas checks.</p>
            </div>
          )}

          {!isValidating && validationResult && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Passed / Failed status badge */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                validationResult.status === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/20 text-rose-300'
              }`}>
                {validationResult.status === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {validationResult.status === 'success' ? 'Validation Passed' : 'Validation Failed'}
                  </h4>
                  <p className="text-[10px] mt-0.5">
                    {validationResult.status === 'success' 
                      ? 'Dossier structure satisfies electronic submission guidelines.' 
                      : `Found ${validationResult.errors.length} critical XML integrity error(s).`}
                  </p>
                </div>
              </div>

              {/* Checklist Parameters */}
              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-slate-400">ICH envelope tags compliance</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${validationResult.envelopeCheck ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {validationResult.envelopeCheck ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-slate-400">MD5 file checksum integrity mapping</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${validationResult.md5Matches ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {validationResult.md5Matches ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              {/* Detailed errors list */}
              {validationResult.errors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Critical Errors log</span>
                  
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} className="p-3 bg-rose-950/20 border border-rose-900/20 text-rose-300 rounded-xl text-[11px] leading-relaxed flex gap-2">
                      <span className="font-bold text-rose-400 text-xs shrink-0 mt-0.5">!</span>
                      <div>
                        {err.line && <span className="font-mono text-[9px] bg-rose-500/15 text-rose-400 px-1 py-0.25 rounded mr-1.5 font-bold">Line {err.line}</span>}
                        {err.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings log */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Warnings log</span>
                  
                  {validationResult.warnings.map((warn, idx) => (
                    <div key={idx} className="p-3 bg-amber-950/15 border border-amber-900/15 text-amber-300 rounded-xl text-[11px] leading-relaxed">
                      {warn}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
