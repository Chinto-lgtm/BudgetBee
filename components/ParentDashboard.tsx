
import React, { useState, useEffect, useRef } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS } from '../constants';

export const ParentDashboard: React.FC = () => {
  const { childProfile, pendingRequests, resolveRequest, config, updateChildProfile } = useFamily();
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safety check for config
    if (showQr && qrRef.current && config?.familyCode) {
      qrRef.current.innerHTML = ''; // Clear previous
      new (window as any).QRCode(qrRef.current, {
        text: config.familyCode,
        width: 180,
        height: 180,
        colorDark: "#1E293B",
        colorLight: "#FFFFFF",
        correctLevel: (window as any).QRCode.CorrectLevel.H
      });
    }
  }, [showQr, config?.familyCode]);

  const handleBarakahBonus = () => {
    if (!childProfile || !config) return;
    updateChildProfile({
      walletBalance: childProfile.walletBalance + config.barakahBonusAmount
    });
    alert(`Barakah Bonus of $${config.barakahBonusAmount} granted!`);
  };

  const isBarakahEligible = childProfile && config ? childProfile.streakDays >= config.barakahThreshold : false;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h2 style={styles.title}>Family Dashboard</h2>
            <p style={styles.subtitle}>Growth oversight for {childProfile?.displayName || 'Family'}</p>
          </div>
          <button onClick={() => setShowQr(true)} style={styles.qrMiniBtn}>
            <i className="fas fa-qrcode"></i>
          </button>
        </div>
      </header>

      {/* QR Modal Simulation */}
      {showQr && config && (
        <div style={styles.qrModal}>
          <div style={styles.qrContent} className="fade-in">
            <h3 style={styles.qrTitle}>Family Access Code</h3>
            <div style={styles.qrWrapper}>
              <div ref={qrRef} style={styles.qrCodeBox}></div>
            </div>
            <p style={styles.qrCodeText}>{config.familyCode}</p>
            <p style={styles.qrInfo}>Have your child scan this QR or enter the code to link their account to your garden.</p>
            <button onClick={() => setShowQr(false)} style={styles.qrCloseBtn}>Close Control Panel</button>
          </div>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div style={styles.cardGrid}>
        {/* Fix: Changed lightEmerald to emeraldLight as per COLORS definition */}
        <div style={{...styles.miniCard, backgroundColor: COLORS.emeraldLight}}>
          <p style={styles.miniLabel}>Spendable</p>
          <p style={{...styles.miniValue, color: COLORS.emerald}}>${childProfile?.walletBalance.toFixed(2) || '0.00'}</p>
        </div>
        {/* Fix: Changed lightGold to goldLight as per COLORS definition */}
        <div style={{...styles.miniCard, backgroundColor: COLORS.goldLight}}>
          <p style={styles.miniLabel}>Sadaqah</p>
          <p style={{...styles.miniValue, color: COLORS.gold}}>${childProfile?.sadaqahBalance.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{...styles.miniCard, backgroundColor: '#EFF6FF'}}>
          <p style={styles.miniLabel}>Savings</p>
          <p style={{...styles.miniValue, color: '#2563EB'}}>${childProfile?.savingsBalance.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Barakah Bonus Section */}
      <div style={{...styles.card, border: `2px solid ${isBarakahEligible ? COLORS.gold : '#E2E8F0'}`}}>
        <div style={styles.bonusHeader}>
          <div>
            <p style={styles.cardTitle}>Barakah Consistency</p>
            <p style={styles.cardDesc}>{childProfile?.streakDays || 0} Day Saving Streak</p>
          </div>
          <div style={{...styles.streakBadge, backgroundColor: isBarakahEligible ? COLORS.gold : '#94A3B8'}}>
             {isBarakahEligible ? 'ELIGIBLE' : `NEED ${(config?.barakahThreshold || 0) - (childProfile?.streakDays || 0)} MORE`}
          </div>
        </div>
        
        <button 
          onClick={handleBarakahBonus}
          disabled={!isBarakahEligible}
          style={{
            ...styles.bonusBtn, 
            backgroundColor: isBarakahEligible ? COLORS.gold : '#F1F5F9',
            color: isBarakahEligible ? 'white' : '#94A3B8'
          }}
        >
          <i className="fas fa-gift"></i> Grant Barakah Bonus (${config?.barakahBonusAmount || 0})
        </button>
      </div>

      {/* Pending Requests */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Review Requests ({pendingRequests.length})</h3>
        {pendingRequests.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="fas fa-check-circle" style={{fontSize: '32px', marginBottom: '8px', color: '#CBD5E1'}}></i>
            <p>No pending intentions to review.</p>
          </div>
        ) : (
          pendingRequests.map(req => (
            <div key={req.id} style={styles.requestCard}>
              <div style={styles.reqTop}>
                <span style={styles.reqBadge}>{req.type}</span>
                <span style={styles.reqDate}>{new Date(req.timestamp).toLocaleTimeString()}</span>
              </div>
              <p style={styles.reqTitle}>{req.title}</p>
              
              <div style={styles.quoteBox}>
                <p style={styles.quoteText}>"{req.description}"</p>
              </div>

              <div style={styles.aiBox}>
                <div style={styles.aiHeader}>
                  <i className="fas fa-brain" style={{color: COLORS.emerald}}></i>
                  <span style={styles.aiLabel}>AI NIYAT ADVICE</span>
                </div>
                <p style={styles.aiText}>{req.aiFeedback}</p>
              </div>

              <div style={styles.actionRow}>
                <button onClick={() => resolveRequest(req.id, false)} style={styles.declineBtn}>Decline</button>
                <button onClick={() => resolveRequest(req.id, true)} style={styles.approveBtn}>Approve</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { marginBottom: '8px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: '14px', color: '#64748B' },
  qrMiniBtn: { backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '12px', color: '#1E293B', fontSize: '20px' },
  qrModal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  qrContent: { backgroundColor: 'white', padding: '32px', borderRadius: '32px', textAlign: 'center', width: '100%', maxWidth: '340px' },
  qrTitle: { fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' },
  qrWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  qrCodeBox: { padding: '10px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px' },
  qrCodeText: { fontSize: '24px', fontWeight: 'bold', color: COLORS.emerald, letterSpacing: '4px', marginBottom: '16px' },
  qrInfo: { fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginBottom: '24px' },
  qrCloseBtn: { backgroundColor: COLORS.emerald, color: 'white', padding: '14px', width: '100%', borderRadius: '12px', fontWeight: 'bold' },
  cardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  miniCard: { padding: '16px 12px', borderRadius: '16px', textAlign: 'center' },
  miniLabel: { fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' },
  miniValue: { fontSize: '18px', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  bonusHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  cardTitle: { fontWeight: 'bold', color: '#1E293B', fontSize: '16px' },
  cardDesc: { fontSize: '13px', color: '#64748B' },
  streakBadge: { padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: 'white' },
  bonusBtn: { width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1E293B' },
  emptyState: { padding: '40px 20px', textAlign: 'center', backgroundColor: '#F1F5F9', borderRadius: '20px', color: '#94A3B8', border: '2px dashed #E2E8F0' },
  requestCard: { backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  reqTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reqBadge: { fontSize: '10px', fontWeight: 'bold', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', color: '#64748B' },
  reqDate: { fontSize: '10px', color: '#94A3B8' },
  reqTitle: { fontWeight: 'bold', color: '#1E293B' },
  quoteBox: { backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', borderLeft: `4px solid #E2E8F0` },
  quoteText: { fontSize: '13px', color: '#475569', fontStyle: 'italic' },
  aiBox: { backgroundColor: '#ECFDF5', padding: '12px', borderRadius: '12px' },
  aiHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  aiLabel: { fontSize: '10px', fontWeight: 'bold', color: COLORS.emerald },
  aiText: { fontSize: '12px', color: '#065F46' },
  actionRow: { display: 'flex', gap: '8px' },
  declineBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 'bold', fontSize: '13px', color: '#64748B' },
  approveBtn: { flex: 2, padding: '10px', borderRadius: '10px', backgroundColor: COLORS.emerald, color: 'white', fontWeight: 'bold', fontSize: '13px' },
};
