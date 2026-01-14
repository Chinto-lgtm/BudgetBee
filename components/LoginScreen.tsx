
import React, { useState } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS } from '../constants';

type AuthMode = 'LOGIN' | 'SIGNUP';

export const LoginScreen: React.FC = () => {
  const { login, signUpParent, signUpChild } = useFamily();
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [role, setRole] = useState<'PARENT' | 'CHILD'>('CHILD');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [familyCode, setFamilyCode] = useState('');

  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'LOGIN') {
      login({ identifier: role === 'PARENT' ? email : username, password, role });
    } else {
      if (role === 'PARENT') {
        signUpParent({ email, name });
      } else {
        signUpChild({ familyCode, username, name });
      }
    }
  };

  const simulateQrScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFamilyCode('BEE-GARDEN-2024');
      setIsScanning(false);
      alert("QR Code Scanned! Family linked.");
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    alert("Simulating Google Sign-In...");
    signUpParent({ email: 'google.user@gmail.com', name: 'Google Parent' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <i className="fas fa-bee" style={{ color: 'white', fontSize: '32px' }}></i>
          </div>
          <h1 style={styles.logoText}>BudgetBee</h1>
          <p style={styles.tagline}>The Halal Growth Garden</p>
        </div>

        <div style={styles.tabs}>
          <button 
            onClick={() => setMode('LOGIN')}
            style={{...styles.tab, ...(mode === 'LOGIN' ? styles.tabActive : {})}}
          >
            Log In
          </button>
          <button 
            onClick={() => setMode('SIGNUP')}
            style={{...styles.tab, ...(mode === 'SIGNUP' ? styles.tabActive : {})}}
          >
            Sign Up
          </button>
        </div>

        <div style={styles.roleToggle}>
          <button 
            onClick={() => setRole('CHILD')}
            style={{...styles.roleBtn, ...(role === 'CHILD' ? styles.roleBtnActive : {})}}
          >
            Child
          </button>
          <button 
            onClick={() => setRole('PARENT')}
            style={{...styles.roleBtn, ...(role === 'PARENT' ? styles.roleBtnActive : {})}}
          >
            Parent
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'SIGNUP' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                style={styles.input} 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {role === 'PARENT' ? (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                style={styles.input} 
                placeholder="parent@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Unique Username</label>
              <input 
                style={styles.input} 
                placeholder="lil_bee_22" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          {mode === 'SIGNUP' && role === 'CHILD' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Family Code</label>
              <div style={styles.qrInputWrapper}>
                <input 
                  style={{...styles.input, flex: 1}} 
                  placeholder="Enter parent's code" 
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  required
                />
                <button type="button" onClick={simulateQrScan} style={styles.qrBtn}>
                  <i className={`fas ${isScanning ? 'fa-spinner fa-spin' : 'fa-qrcode'}`}></i>
                </button>
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              style={styles.input} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            {mode === 'LOGIN' ? 'Enter Garden' : 'Create Garden'}
          </button>

          {role === 'PARENT' && (
            <button type="button" onClick={handleGoogleSignIn} style={styles.googleBtn}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{width: '18px'}} />
              <span>Continue with Google</span>
            </button>
          )}
        </form>

        <p style={styles.footerText}>
          {role === 'PARENT' 
            ? "Manage allowances and verify task outcomes." 
            : "Scan parent's QR code to link your account."}
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 100%)',
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '32px',
    padding: '40px 32px',
    boxShadow: '0 25px 50px -12px rgba(5, 150, 105, 0.15)',
    textAlign: 'center',
  },
  logoContainer: { marginBottom: '24px' },
  logoIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: COLORS.emerald,
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
    boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)',
  },
  logoText: { fontSize: '28px', fontWeight: 'bold', color: '#1E293B' },
  tagline: { color: COLORS.emerald, fontSize: '14px', fontWeight: 500, marginTop: '4px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px' },
  tab: { flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: '#64748B' },
  tabActive: { backgroundColor: 'white', color: COLORS.emerald, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  roleToggle: { display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px', marginBottom: '24px' },
  roleBtn: { flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: '#64748B' },
  roleBtnActive: { backgroundColor: COLORS.emerald, color: 'white' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '15px', outline: 'none', backgroundColor: '#F8FAFC' },
  qrInputWrapper: { display: 'flex', gap: '8px' },
  qrBtn: { backgroundColor: '#F1F5F9', padding: '0 16px', borderRadius: '12px', color: COLORS.emerald, fontSize: '18px' },
  submitBtn: { backgroundColor: COLORS.emerald, color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' },
  googleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#1F2937', fontWeight: 500, fontSize: '14px', marginTop: '8px' },
  footerText: { marginTop: '24px', fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 },
};
