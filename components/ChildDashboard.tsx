
import React, { useState, useMemo } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { WISDOM_QUOTES, COLORS } from '../constants';
import { checkNiyat, verifyTaskImage } from '../services/geminiService';
import { calculateSplits } from '../services/TransactionService';

export const ChildDashboard: React.FC = () => {
  const { config, childProfile, addPendingRequest, processExternalIncome } = useFamily();
  const [niyatInput, setNiyatInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showNiyat, setShowNiyat] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [taskResult, setTaskResult] = useState<any>(null);

  const quote = useMemo(() => WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)], []);

  if (!config || !childProfile) return null;

  if (config.isAppFrozen) {
    return (
      <div style={styles.frozenContainer}>
        <div style={styles.frozenIcon}>
          <i className="fas fa-snowflake" style={{fontSize: '48px', color: COLORS.red}}></i>
        </div>
        <h2 style={styles.frozenTitle}>Garden is Resting</h2>
        <p style={styles.frozenText}>Your parent has paused the app. Take this time for mindfulness and dhikr.</p>
        <button style={styles.contactBtn}>Contact Parent</button>
      </div>
    );
  }

  const handleNiyatCheck = async () => {
    if (!niyatInput) return;
    setIsBusy(true);
    const advice = await checkNiyat(niyatInput);
    setAiAdvice(advice);
    setIsBusy(false);
  };

  const handleIncomeSubmit = () => {
    const amount = parseFloat(incomeInput);
    if (isNaN(amount) || amount <= 0) return;
    processExternalIncome(amount);
    const splits = calculateSplits(amount, config);
    alert(`Barakah Split! $${splits.charity.toFixed(2)} added to Sadaqah, $${splits.savings.toFixed(2)} to Savings.`);
    setShowIncome(false);
    setIncomeInput('');
  };

  const handleTaskUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBusy(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await verifyTaskImage(base64, "Clean Room");
      setTaskResult(res);
      setIsBusy(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.container}>
      <div style={styles.quoteCard}>
        <p style={styles.quoteLabel}>Daily Wisdom</p>
        <p style={styles.quoteText}>"{quote}"</p>
      </div>

      <div style={styles.walletCard}>
        <div style={styles.walletContent}>
          <p style={styles.walletLabel}>SPENDABLE WALLET</p>
          <h1 style={styles.walletValue}>${childProfile.walletBalance.toFixed(2)}</h1>
          <div style={styles.badgeRow}>
            <div style={styles.streakBadge}>
              <i className="fas fa-fire" style={{color: '#FB923C'}}></i>
              <span>{childProfile.streakDays} Day Streak</span>
            </div>
            <button onClick={() => setShowIncome(true)} style={styles.addBtn}>
              <i className="fas fa-plus"></i> Add Income
            </button>
          </div>
        </div>
        <div style={styles.walletDecor}></div>
      </div>

      <div style={styles.jarGrid}>
        <div style={{...styles.jarCard, backgroundColor: COLORS.goldLight}}>
          <div style={{...styles.jarIcon, color: COLORS.gold}}><i className="fas fa-hand-holding-heart"></i></div>
          <p style={styles.jarLabel}>Sadaqah Jar</p>
          <p style={styles.jarValue}>${childProfile.sadaqahBalance.toFixed(2)}</p>
          <div style={styles.miniProgress}><div style={{...styles.progressBar, backgroundColor: COLORS.gold, width: '45%'}}></div></div>
        </div>
        <div style={{...styles.jarCard, backgroundColor: COLORS.blueLight}}>
          <div style={{...styles.jarIcon, color: COLORS.blue}}><i className="fas fa-vault"></i></div>
          <p style={styles.jarLabel}>Locked Savings</p>
          <p style={styles.jarValue}>${childProfile.savingsBalance.toFixed(2)}</p>
          <div style={styles.miniProgress}><div style={{...styles.progressBar, backgroundColor: COLORS.blue, width: '70%'}}></div></div>
        </div>
      </div>

      <div style={styles.actions}>
        <h3 style={styles.sectionHeader}>Garden Actions</h3>
        <button onClick={() => setShowTask(true)} style={styles.actionBtn}>
           <div style={styles.actionIcon}><i className="fas fa-broom"></i></div>
           <div style={styles.actionText}>
             <p style={styles.actionTitle}>Earn Allowance</p>
             <p style={styles.actionDesc}>Submit task for AI verification</p>
           </div>
           <i className="fas fa-chevron-right" style={{color: '#CBD5E1'}}></i>
        </button>

        <button onClick={() => setShowNiyat(true)} style={styles.actionBtn}>
           <div style={{...styles.actionIcon, backgroundColor: COLORS.slateLight}}><i className="fas fa-brain" style={{color: COLORS.slate}}></i></div>
           <div style={styles.actionText}>
             <p style={styles.actionTitle}>Mindful Withdrawal</p>
             <p style={styles.actionDesc}>Check your intention with Gemini</p>
           </div>
           <i className="fas fa-chevron-right" style={{color: '#CBD5E1'}}></i>
        </button>
      </div>

      {showIncome && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Income (Splitter)</h3>
              <button onClick={() => setShowIncome(false)} style={styles.closeBtn}>×</button>
            </div>
            <p style={styles.modalInfo}>Any amount you add will be automatically split: {config.sadaqahSplit}% to Sadaqah and {config.savingsSplit}% to Savings.</p>
            <div style={styles.inputContainer}>
              <span style={styles.inputPrefix}>$</span>
              <input 
                type="number" 
                style={styles.numInputBig} 
                placeholder="0.00"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
              />
            </div>
            <button onClick={handleIncomeSubmit} style={styles.submitBtn}>Apply Halal Split</button>
          </div>
        </div>
      )}

      {showNiyat && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Set Your Niyat</h3>
              <button onClick={() => {setShowNiyat(false); setAiAdvice('');}} style={styles.closeBtn}>×</button>
            </div>
            <textarea 
              style={styles.textarea} 
              placeholder="What is your purpose for this spending?"
              // Fix: Changed niiyatInput typo to niyatInput
              value={niyatInput}
              onChange={(e) => setNiyatInput(e.target.value)}
            />
            {aiAdvice && (
              <div style={styles.aiAdviceBox}>
                <p style={styles.aiAdviceLabel}>GEMINI ADVICE</p>
                <p style={styles.aiAdviceText}>{aiAdvice}</p>
              </div>
            )}
            <button 
              onClick={aiAdvice ? () => {
                addPendingRequest({
                  userId: childProfile.uid,
                  type: 'WITHDRAWAL',
                  title: 'Withdrawal Intention',
                  description: niyatInput,
                  amount: 10,
                  aiFeedback: aiAdvice
                });
                setShowNiyat(false);
                alert("Niyat sent to Parent!");
              } : handleNiyatCheck}
              disabled={isBusy}
              style={styles.submitBtn}
            >
              {isBusy ? 'Consulting AI...' : aiAdvice ? 'Submit to Parent' : 'Check Intention'}
            </button>
          </div>
        </div>
      )}

      {showTask && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Task Submission</h3>
              <button onClick={() => setShowTask(false)} style={styles.closeBtn}>×</button>
            </div>
            {!taskResult ? (
              <label style={styles.uploadArea}>
                <input type="file" style={{display: 'none'}} onChange={handleTaskUpload} />
                <i className="fas fa-camera" style={{fontSize: '32px', color: COLORS.emerald, marginBottom: '8px'}}></i>
                <p style={{fontSize: '13px', fontWeight: 'bold'}}>{isBusy ? 'Analyzing...' : 'Snap Task Photo'}</p>
              </label>
            ) : (
              <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={styles.scoreCircle}>
                  <p style={{fontSize: '24px', fontWeight: 'bold'}}>{taskResult.confidence}%</p>
                </div>
                <p style={{fontSize: '13px', fontStyle: 'italic', color: '#64748B'}}>{taskResult.feedback}</p>
                <button 
                  onClick={() => {
                    addPendingRequest({
                      userId: childProfile.uid,
                      type: 'TASK_COMPLETION',
                      title: 'Verified Task',
                      description: 'Task confirmed via Vision AI',
                      amount: config.allowanceAmount,
                      aiFeedback: taskResult.feedback,
                      aiScore: taskResult.confidence
                    });
                    setShowTask(false);
                    setTaskResult(null);
                  }}
                  style={styles.submitBtn}
                >
                  Send for Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  frozenContainer: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' },
  frozenIcon: { width: '96px', height: '96px', backgroundColor: '#FEF2F2', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' },
  frozenTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1E293B', marginBottom: '12px' },
  frozenText: { color: '#64748B', marginBottom: '32px' },
  contactBtn: { backgroundColor: COLORS.emerald, color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: 'bold' },
  quoteCard: { backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' },
  quoteLabel: { fontSize: '10px', fontWeight: 'bold', color: COLORS.emerald, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  quoteText: { color: '#64748B', fontSize: '14px', fontStyle: 'italic' },
  walletCard: { backgroundColor: COLORS.emerald, padding: '32px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.2)' },
  walletContent: { position: 'relative', zIndex: 10 },
  walletLabel: { fontSize: '11px', fontWeight: 'bold', opacity: 0.8, letterSpacing: '1px' },
  walletValue: { fontSize: '48px', fontWeight: 'bold', margin: '8px 0 20px 0' },
  badgeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  streakBadge: { backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  addBtn: { backgroundColor: 'white', color: COLORS.emerald, padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' },
  walletDecor: { position: 'absolute', right: '-30px', bottom: '-30px', width: '150px', height: '150px', backgroundColor: 'white', opacity: 0.1, borderRadius: '99px' },
  jarGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  jarCard: { padding: '24px 20px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  jarIcon: { fontSize: '20px', marginBottom: '16px' },
  jarLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' },
  jarValue: { fontSize: '22px', fontWeight: 'bold', color: '#1E293B', marginBottom: '12px' },
  miniProgress: { height: '6px', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '99px' },
  sectionHeader: { fontSize: '14px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  actions: { display: 'flex', flexDirection: 'column', gap: '12px' },
  actionBtn: { backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' },
  actionIcon: { width: '48px', height: '48px', backgroundColor: COLORS.emeraldLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.emerald, fontSize: '20px' },
  actionText: { flex: 1 },
  actionTitle: { fontWeight: 'bold', color: '#1E293B', fontSize: '16px' },
  actionDesc: { fontSize: '12px', color: '#64748B' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px', zIndex: 100 },
  modal: { backgroundColor: 'white', width: '100%', maxWidth: '420px', borderRadius: '32px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 -20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1E293B' },
  modalInfo: { fontSize: '13px', color: '#64748B', lineHeight: '1.6' },
  closeBtn: { fontSize: '28px', color: '#94A3B8', lineHeight: 1 },
  inputContainer: { display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' },
  inputPrefix: { fontSize: '32px', fontWeight: 'bold', color: '#CBD5E1' },
  numInputBig: { flex: 1, border: 'none', outline: 'none', fontSize: '40px', fontWeight: 'bold', color: '#1E293B' },
  textarea: { width: '100%', padding: '18px', borderRadius: '18px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '15px', minHeight: '120px', outline: 'none' },
  aiAdviceBox: { backgroundColor: COLORS.emeraldLight, padding: '16px', borderRadius: '18px', border: `1px solid ${COLORS.emerald}` },
  aiAdviceLabel: { fontSize: '10px', fontWeight: 'bold', color: COLORS.emerald, marginBottom: '6px' },
  aiAdviceText: { fontSize: '14px', color: '#065F46', fontStyle: 'italic', lineHeight: '1.5' },
  submitBtn: { backgroundColor: COLORS.emerald, color: 'white', padding: '18px', borderRadius: '18px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.2)' },
  uploadArea: { border: '3px dashed #F1F5F9', borderRadius: '28px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  scoreCircle: { width: '90px', height: '90px', borderRadius: '99px', backgroundColor: COLORS.emeraldLight, color: COLORS.emerald, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `5px solid ${COLORS.emerald}` }
};
