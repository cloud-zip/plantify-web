import React from 'react';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
