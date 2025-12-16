import React, { useState, useEffect } from 'react';
import { Trash2, Database, RefreshCw, X, Bug } from 'lucide-react';

const DebugPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [storageStats, setStorageStats] = useState({});

    // Toggle panel with Ctrl+Shift+D
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                if (!isOpen) {
                    updateStats();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen]);

    const updateStats = () => {
        const stats = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(value);
                stats[key] = {
                    size: new Blob([value]).size,
                    type: Array.isArray(parsed) ? `Array (${parsed.length})` : typeof parsed,
                    preview: Array.isArray(parsed)
                        ? `${parsed.length} items`
                        : typeof parsed === 'object'
                            ? Object.keys(parsed).length + ' keys'
                            : String(parsed).substring(0, 50)
                };
            } catch {
                stats[key] = {
                    size: new Blob([value]).size,
                    type: 'string',
                    preview: value.substring(0, 50)
                };
            }
        }
        setStorageStats(stats);
    };

    const clearAllData = () => {
        if (window.confirm('⚠️ This will clear ALL localStorage data. Continue?')) {
            localStorage.clear();
            updateStats();
            alert('✅ All localStorage data cleared!');
            window.location.reload();
        }
    };

    const clearKey = (key) => {
        if (window.confirm(`Clear "${key}"?`)) {
            localStorage.removeItem(key);
            updateStats();
            alert(`✅ Cleared: ${key}`);
        }
    };

    const reinitializeData = () => {
        if (window.confirm('Reinitialize database with demo data?')) {
            const { initializeDatabase } = require('../utils/unifiedDataManager');
            initializeDatabase();
            updateStats();
            alert('✅ Database reinitialized!');
            window.location.reload();
        }
    };

    if (!isOpen) {
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    transition: 'transform 0.2s',
                }}
                onClick={() => {
                    setIsOpen(true);
                    updateStats();
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Debug Panel (Ctrl+Shift+D)"
            >
                <Bug size={24} color="white" />
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: '400px',
                maxHeight: '600px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                zIndex: 9999,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bug size={20} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Debug Panel</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <X size={18} color="white" />
                </button>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                        onClick={clearAllData}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}
                    >
                        <Trash2 size={16} />
                        Clear All
                    </button>
                    <button
                        onClick={reinitializeData}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}
                    >
                        <Database size={16} />
                        Reinit DB
                    </button>
                </div>
                <button
                    onClick={updateStats}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}
                >
                    <RefreshCw size={16} />
                    Refresh Stats
                </button>
            </div>

            {/* Storage Stats */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    localStorage Keys ({Object.keys(storageStats).length})
                </h4>
                {Object.keys(storageStats).length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                        No data in localStorage
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(storageStats).map(([key, data]) => (
                            <div
                                key={key}
                                style={{
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827', wordBreak: 'break-word' }}>
                                            {key}
                                        </p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                                            {data.type} • {(data.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => clearKey(key)}
                                        style={{
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: '8px',
                                        }}
                                        title="Delete this key"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                                    {data.preview}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '11px',
                    color: '#6b7280',
                    textAlign: 'center',
                }}
            >
                Press <kbd style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>Ctrl+Shift+D</kbd> to toggle
            </div>
        </div>
    );
};

export default DebugPanel;
