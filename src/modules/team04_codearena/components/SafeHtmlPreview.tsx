import React, { useMemo } from 'react';

interface SafeHtmlPreviewProps {
  sourceCode: string;
}

export const SafeHtmlPreview: React.FC<SafeHtmlPreviewProps> = ({ sourceCode }) => {
  // Inject strict security policies inside the student frame
  const secureHtmlContent = useMemo(() => {
    const cspMeta = `
      <meta http-equiv="Content-Security-Policy" 
        content="default-src 'none'; 
                 style-src 'unsafe-inline' https://fonts.googleapis.com; 
                 font-src https://fonts.gstatic.com;
                 script-src 'unsafe-inline'; 
                 img-src data: https: blob:; 
                 connect-src 'none';">
    `;

    // Intercept console.log and forward errors visually
    const errorInterceptor = `
      <script>
        window.onerror = function(msg, url, line) {
          const div = document.createElement('div');
          div.style = 'background: #7f1d1d; color: #fca5a5; padding: 10px; font-family: monospace; font-size: 12px; margin: 10px; border-radius: 6px;';
          div.innerText = 'Runtime Error [Line ' + line + ']: ' + msg;
          document.body.prepend(div);
        };
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${cspMeta}
          ${errorInterceptor}
        </head>
        <body>
          ${sourceCode}
        </body>
      </html>
    `;
  }, [sourceCode]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 bg-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-700">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Safe Web Preview (Isolated Origin)
        </span>
        <span className="text-slate-400">Sandbox: allow-scripts</span>
      </div>
      <iframe
        title="UniSphere Web Sandbox"
        srcDoc={secureHtmlContent}
        sandbox="allow-scripts" // Strictly omitting 'allow-same-origin' to protect tokens and cookies
        className="w-full h-full border-none bg-white"
      />
    </div>
  );
};
