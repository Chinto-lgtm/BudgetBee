
import React from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS } from '../constants';

export const ParentSettings: React.FC = () => {
  const { config, updateConfig } = useFamily();

  const handleInput = (key: keyof typeof config, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) updateConfig({ [key]: num });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Control Room</h2>
        <p style={styles.subtitle}>Super-Admin Financial Rules</p>
      </header>

      {/* Master Freeze Switch */}
      <div style={{...styles.card, ...(config.isAppFrozen ? styles.cardFrozen : {})}}>
        <div style={styles.row}>
          <div>
            <p style={styles.cardLabel}>Master App Lock</p>
            <p style={styles.cardDesc}>Freeze all child activity instantly</p>
          </div>
          <button 
            onClick={() => updateConfig({ isAppFrozen: !config.isAppFrozen })}
            style={{...styles.switch, backgroundColor: config.isAppFrozen ? COLORS.red : '#E2E8F0'}}
          >
            <div style={{...styles.switchKnob, transform: config.isAppFrozen ? 'translateX(24px)' : 'translateX(0)'}}></div>
          </button>
        </div>
      </div>

      {/* Split Percentages */}
      <div style={styles.card}>
        <h3 style={styles.sectionLabel}>Halal Split Config</h3>
        
        <div style={styles.inputGroup}>
          <div style={styles.row}>
            <label style={styles.label}>Sadaqah Split (Charity)</label>
            <span style={{color: COLORS.gold, fontWeight: 'bold'}}>{config.sadaqahSplit}%</span>
          </div>
          <input 
            type="range" min="0" max="50" 
            value={config.sadaqahSplit}
            onChange={(e) => updateConfig({ sadaqahSplit: parseInt(e.target.value) })}
            style={styles.range}
          />
        </div>

        <div style={styles.inputGroup}>
          <div style={styles.row}>
            <label style={styles.label}>Savings Split (Locked)</label>
            <span style={{color: '#2563EB', fontWeight: 'bold'}}>{config.savingsSplit}%</span>
          </div>
          <input 
            type="range" min="0" max="50" 
            value={config.savingsSplit}
            onChange={(e) => updateConfig({ savingsSplit: parseInt(e.target.value) })}
            style={styles.range}
          />
        </div>
        
        <p style={styles.infoText}>
          Remainder ({100 - config.sadaqahSplit - config.savingsSplit}%) goes to spendable wallet.
        </p>
      </div>

      {/* Amounts Config */}
      <div style={styles.card}>
        <h3 style={styles.sectionLabel}>Financial Variables</h3>
        
        <div style={styles.gridRow}>
          <div style={styles.inputStack}>
            <label style={styles.labelSmall}>Allowance ($)</label>
            <input 
              type="number" 
              value={config.allowanceAmount}
              onChange={(e) => handleInput('allowanceAmount', e.target.value)}
              style={styles.numInput}
            />
          </div>
          <div style={styles.inputStack}>
            <label style={styles.labelSmall}>Barakah Gift ($)</label>
            <input 
              type="number" 
              value={config.barakahBonusAmount}
              onChange={(e) => handleInput('barakahBonusAmount', e.target.value)}
              style={styles.numInput}
            />
          </div>
        </div>

        <div style={styles.inputStack}>
          <label style={styles.labelSmall}>Streak Threshold (Days)</label>
          <input 
            type="number" 
            value={config.barakahThreshold}
            onChange={(e) => handleInput('barakahThreshold', e.target.value)}
            style={styles.numInput}
          />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { marginBottom: '8px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: '14px', color: '#64748B' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' },
  cardFrozen: { border: `2px solid ${COLORS.red}`, backgroundColor: '#FEF2F2' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontWeight: 'bold', color: '#1E293B', fontSize: '16px' },
  cardDesc: { fontSize: '12px', color: '#64748B' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' },
  switch: { width: '52px', height: '28px', borderRadius: '99px', padding: '2px', position: 'relative', transition: 'background-color 0.2s' },
  switchKnob: { width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '99px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'transform 0.2s' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 600, color: '#475569' },
  range: { width: '100%', cursor: 'pointer', height: '6px', borderRadius: '4px' },
  infoText: { fontSize: '11px', color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' },
  gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputStack: { display: 'flex', flexDirection: 'column', gap: '6px' },
  labelSmall: { fontSize: '12px', fontWeight: 'bold', color: '#64748B' },
  numInput: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '16px', fontWeight: 'bold', outline: 'none' },
};
