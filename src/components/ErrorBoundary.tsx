import { Component, type ReactNode } from 'react';

// Shows what broke instead of a blank screen.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card" style={{ margin: 16 }}>
        <h2 style={{ fontSize: 18 }}>Something went wrong on this screen</h2>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--danger-text)' }}>{String(this.state.error.stack || this.state.error)}</pre>
        <button type="button" className="btn primary" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}
