import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-md mx-auto min-h-screen bg-black text-red-500 font-mono text-xs space-y-4 overflow-auto" style={{ zIndex: 10000, position: 'relative' }}>
          <h1 className="text-lg font-bold text-red-400">⚠️ Application Error</h1>
          <p className="font-bold text-white">{this.state.error && this.state.error.toString()}</p>
          <pre className="bg-zinc-950 p-4 rounded-xl border border-red-950/40 text-[10px] text-red-400 overflow-auto whitespace-pre-wrap max-h-[60vh]">
            {this.state.error && this.state.error.stack}
            {"\n\nComponent Stack:\n"}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2.5 bg-red-900/50 border border-red-800/30 text-red-200 font-bold rounded-xl cursor-pointer hover:bg-red-900"
            >
              Reset Cache & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-zinc-900 border border-white/5 text-gray-200 font-bold rounded-xl cursor-pointer hover:bg-zinc-800"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DevDebugger() {
  const [errors, setErrors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checks, setChecks] = useState({
    tailwindLoaded: false,
    leafletLoaded: false,
    localStorageAccess: false,
    materialSymbolsLoaded: false
  });

  useEffect(() => {
    const handleError = (e) => {
      setErrors((prev) => [...prev, {
        message: e.message || 'Uncaught runtime error',
        filename: e.filename || '',
        lineno: e.lineno || '',
        colno: e.colno || '',
        stack: e.error?.stack || ''
      }]);
    };

    const handleRejection = (e) => {
      setErrors((prev) => [...prev, {
        message: e.reason?.message || String(e.reason) || 'Unhandled promise rejection',
        filename: 'Promise Rejection',
        lineno: '',
        colno: '',
        stack: e.reason?.stack || ''
      }]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    const runDiagnostics = () => {
      const tailwind = typeof window.tailwind !== 'undefined';
      const leaflet = typeof window.L !== 'undefined';
      let storage = false;
      try {
        localStorage.setItem('__test_db__', '1');
        localStorage.removeItem('__test_db__');
        storage = true;
      } catch (err) {}

      const span = document.createElement('span');
      span.className = 'material-symbols-outlined';
      document.body.appendChild(span);
      const isMaterialLoaded = window.getComputedStyle(span).fontFamily.includes('Material Symbols Outlined');
      document.body.removeChild(span);

      setChecks({
        tailwindLoaded: tailwind,
        leafletLoaded: leaflet,
        localStorageAccess: storage,
        materialSymbolsLoaded: isMaterialLoaded
      });
    };

    runDiagnostics();
    const interval = setInterval(runDiagnostics, 3000);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      clearInterval(interval);
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[99999] size-10 rounded-full bg-red-600 border border-red-500 text-white font-bold flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
        style={{ fontSize: '16px' }}
        title="Open Diagnostics Debugger"
      >
        🐞
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 w-80 max-h-96 z-[99999] bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col font-mono text-[10px] text-gray-300 overflow-hidden">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-800">
        <span className="font-bold text-red-500 flex items-center gap-1">🐞 System Diagnostics</span>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white cursor-pointer">Close</button>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between">
          <span>Tailwind CDN:</span>
          <span className={checks.tailwindLoaded ? "text-green-500" : "text-red-500"}>{checks.tailwindLoaded ? "ACTIVE" : "MISSING"}</span>
        </div>
        <div className="flex justify-between">
          <span>Leaflet Maps:</span>
          <span className={checks.leafletLoaded ? "text-green-500" : "text-red-500"}>{checks.leafletLoaded ? "ACTIVE" : "MISSING"}</span>
        </div>
        <div className="flex justify-between">
          <span>LocalStorage:</span>
          <span className={checks.localStorageAccess ? "text-green-500" : "text-red-500"}>{checks.localStorageAccess ? "ACTIVE" : "BLOCKED"}</span>
        </div>
        <div className="flex justify-between">
          <span>Material Symbols:</span>
          <span className={checks.materialSymbolsLoaded ? "text-green-500" : "text-yellow-500"}>{checks.materialSymbolsLoaded ? "LOADED" : "LOADING..."}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-zinc-800 pt-2 min-h-24">
        <div className="font-bold text-red-400 mb-1">Runtime Logs/Errors ({errors.length}):</div>
        {errors.length === 0 ? (
          <div className="text-green-600">✓ No runtime flaws detected.</div>
        ) : (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <div key={i} className="p-1.5 bg-red-950/20 border border-red-950/40 rounded text-red-400">
                <div className="font-bold">{err.message}</div>
                {err.filename && <div className="text-gray-500">{err.filename.split('/').pop()}:{err.lineno}:{err.colno}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <DevDebugger />
    </ErrorBoundary>
  </React.StrictMode>
);
