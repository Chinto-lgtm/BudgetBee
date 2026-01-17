
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Alert, FlatList, Dimensions } from 'react-native';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS, SPACING, SHADOWS, WISDOM_QUOTES } from '../constants';
import { checkNiyat, verifyTaskImage } from '../services/geminiService';
import { calculateSplits } from '../services/TransactionService';

export const ChildDashboard = () => {
  const { config, currentUser, transactions, processExternalIncome, addPendingRequest } = useFamily();
  
  const [modalType, setModalType] = useState<'NONE' | 'NIYAT' | 'TASK' | 'INCOME' | 'HISTORY' | 'GIVE'>('NONE');
  const [loading, setLoading] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [taskResult, setTaskResult] = useState<{confidence: number, feedback: string} | null>(null);
  
  // Hidden input bridge for real-time picking
  const fileInputRef = useRef<any>(null);

  const quote = useMemo(() => WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)], []);

  if (!currentUser || !config) return null;

  if (config.isAppFrozen) {
    return (
      <View style={styles.frozenContainer}>
        <View style={styles.frozenIcon}><Text style={{fontSize: 50}}>🔒</Text></View>
        <Text style={styles.frozenTitle}>Garden is Resting</Text>
        <Text style={styles.frozenText}>Your parent has paused activity. Use this time for reflection.</Text>
      </View>
    );
  }

  const handleIncomeSplit = () => {
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) return;
    processExternalIncome(val);
    const splits = calculateSplits(val, config);
    Alert.alert("Barakah Distributed!", 
      `$${splits.charity.toFixed(2)} to Sadaqah\n$${splits.savings.toFixed(2)} to Savings\n$${splits.wallet.toFixed(2)} for you!`);
    setModalType('NONE');
    setAmountInput('');
  };

  const handleNiyatCheck = async () => {
    if (!descriptionInput) return;
    setLoading(true);
    const advice = await checkNiyat(descriptionInput);
    setAiAdvice(advice);
    setLoading(false);
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setModalType('TASK'); // Ensure modal is open to show progress

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      try {
        const result = await verifyTaskImage(base64, "Household Chores");
        setTaskResult(result);
      } catch (err) {
        Alert.alert("Verification Error", "Could not analyze the image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const submitTaskForApproval = async () => {
    if (!taskResult) return;
    setLoading(true);
    await addPendingRequest({
      userId: currentUser.uid,
      type: 'TASK_COMPLETION',
      title: 'Task: Garden Care',
      description: taskResult.feedback,
      amount: config.allowanceAmount,
      aiFeedback: taskResult.feedback,
      aiScore: taskResult.confidence
    });
    setLoading(false);
    setTaskResult(null);
    setModalType('NONE');
    Alert.alert("Task Submitted", "JazakAllah! Your parent will review the AI score and grant your allowance.");
  };

  const handleDischargeRequest = async () => {
    if (currentUser.sadaqahBalance <= 0) {
      Alert.alert("Jar is Empty", "Continue saving to fill your Sadaqah jar.");
      return;
    }
    setLoading(true);
    await addPendingRequest({
      userId: currentUser.uid,
      type: 'SADAQAH_DISCHARGE',
      title: 'Discharge Sadaqah',
      description: `Requesting to give $${currentUser.sadaqahBalance.toFixed(2)} in charity.`,
      amount: currentUser.sadaqahBalance,
      aiFeedback: "Charity does not decrease wealth, but increases it in Barakah."
    });
    setLoading(false);
    setModalType('NONE');
    Alert.alert("Request Sent", "Your parent has been notified to send your Sadaqah to those in need!");
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const isOut = item.type === 'SADAQAH_GIVEN' || item.type === 'WITHDRAWAL';
    return (
      <View style={styles.transItem}>
        <View style={[styles.transIcon, { backgroundColor: isOut ? COLORS.redLight : COLORS.emeraldLight }]}>
          <Text>{item.type === 'INCOME_SPLIT' ? '💰' : item.type === 'SADAQAH_GIVEN' ? '❤️' : item.type === 'BONUS' ? '🎁' : '🏦'}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.transNote}>{item.note}</Text>
          <Text style={styles.transDate}>{new Date(item.timestamp).toLocaleDateString()} • {item.type.replace('_', ' ')}</Text>
        </View>
        <Text style={[styles.transAmount, {color: isOut ? COLORS.red : COLORS.emerald}]}>
          {isOut ? '-' : '+'}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hidden File Input for Real Time Picking */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />

      <View style={styles.wisdomCard}>
        <Text style={styles.wisdomLabel}>DAILY INTENTION</Text>
        <Text style={styles.wisdomText}>"{quote}"</Text>
      </View>

      <View style={styles.gardenFrame}>
        <View style={styles.treeContainer}>
          <Text style={styles.treeEmoji}>{currentUser.savingsBalance > 100 ? '🌳' : '🌱'}</Text>
          <Text style={styles.gardenLabel}>My Garden</Text>
        </View>
        <View style={styles.balanceInfo}>
          <Text style={styles.walletLabel}>SPENDABLE</Text>
          <Text style={styles.walletValue}>${currentUser.walletBalance.toFixed(2)}</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {currentUser.streakDays} Day Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.jarGrid}>
        <TouchableOpacity style={[styles.jar, { backgroundColor: COLORS.goldLight }]} onPress={() => setModalType('GIVE')}>
          <Text style={styles.jarEmoji}>🍯</Text>
          <Text style={styles.jarTitle}>Sadaqah</Text>
          <Text style={[styles.jarValue, {color: COLORS.goldDark}]}>${currentUser.sadaqahBalance.toFixed(2)}</Text>
          <Text style={styles.jarAction}>Tap to Give</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.jar, { backgroundColor: COLORS.blueLight }]} onPress={() => setModalType('HISTORY')}>
          <Text style={styles.jarEmoji}>📜</Text>
          <Text style={styles.jarTitle}>History</Text>
          <Text style={[styles.jarValue, {color: COLORS.blue}]}>{transactions.length}</Text>
          <Text style={styles.jarAction}>View Ledger</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsBox}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setModalType('INCOME')}>
          <View style={styles.iconCircle}><Text style={{fontSize: 20}}>💰</Text></View>
          <View style={{flex: 1}}>
            <Text style={styles.actionTitle}>Add Gift Money</Text>
            <Text style={styles.actionDesc}>Split any cash you received</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={triggerCamera}>
          <View style={[styles.iconCircle, {backgroundColor: COLORS.emeraldLight}]}><Text style={{fontSize: 20}}>✅</Text></View>
          <View style={{flex: 1}}>
            <Text style={styles.actionTitle}>Earn Allowance</Text>
            <Text style={styles.actionDesc}>Snap a photo of your task</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setModalType('NIYAT')}>
          <View style={[styles.iconCircle, {backgroundColor: COLORS.slateLight}]}><Text style={{fontSize: 20}}>🧠</Text></View>
          <View style={{flex: 1}}>
            <Text style={styles.actionTitle}>Mindful Spend</Text>
            <Text style={styles.actionDesc}>Use savings with clear intention</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <Modal visible={modalType === 'TASK'} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Task Verification</Text>
            {loading ? (
              <View style={{padding: 40}}>
                <ActivityIndicator size="large" color={COLORS.emerald} />
                <Text style={styles.modalDesc}>AI is checking your work...</Text>
              </View>
            ) : taskResult ? (
              <View style={{alignItems: 'center'}}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>{taskResult.confidence}%</Text>
                </View>
                <Text style={styles.scoreLabel}>Confidence Score</Text>
                <Text style={styles.adviceText}>"{taskResult.feedback}"</Text>
                <TouchableOpacity style={[styles.submitBtn, {width: '100%', marginTop: 20}]} onPress={submitTaskForApproval}>
                  <Text style={styles.submitText}>Submit for Approval</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadArea} onPress={triggerCamera}>
                <Text style={{fontSize: 40, marginBottom: 10}}>📸</Text>
                <Text style={styles.actionTitle}>Snap Task Image</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => {setModalType('NONE'); setTaskResult(null);}} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalType === 'HISTORY'} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { height: '80%' }]}>
            <Text style={styles.modalTitle}>Financial Ledger</Text>
            <FlatList 
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: COLORS.slate, marginTop: 20 }}>No transactions yet.</Text>}
            />
            <TouchableOpacity onPress={() => setModalType('NONE')} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalType === 'GIVE'} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sadaqah Distribution</Text>
            <Text style={styles.modalDesc}>You have ${currentUser.sadaqahBalance.toFixed(2)} in your jar. Would you like to ask your parent to send it to someone in need?</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={handleDischargeRequest} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Request Charity Distribution</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalType('NONE')} style={styles.closeBtn}>
              <Text style={styles.closeText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalType === 'INCOME'} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Incoming Barakah</Text>
            <Text style={styles.modalDesc}>How much did you receive?</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="$0.00" 
              keyboardType="numeric" 
              value={amountInput}
              onChangeText={setAmountInput}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleIncomeSplit}>
              <Text style={styles.submitText}>Apply Halal Split</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalType('NONE')} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalType === 'NIYAT'} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mindful Intent</Text>
            <Text style={styles.modalDesc}>What is your purpose for this spending?</Text>
            <TextInput 
              style={[styles.modalInput, { height: 80, fontSize: 16, textAlign: 'left' }]} 
              placeholder="I want to buy..." 
              multiline
              value={descriptionInput}
              onChangeText={setDescriptionInput}
            />
            {aiAdvice ? (
              <View style={styles.adviceBox}>
                <Text style={styles.adviceLabel}>GEMINI WISDOM</Text>
                <Text style={styles.adviceText}>{aiAdvice}</Text>
              </View>
            ) : null}
            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.5 }]} 
              onPress={aiAdvice ? () => {
                addPendingRequest({
                  userId: currentUser.uid,
                  type: 'WITHDRAWAL',
                  title: 'Withdrawal Request',
                  description: descriptionInput,
                  amount: 10,
                  aiFeedback: aiAdvice
                });
                setModalType('NONE');
                setAiAdvice('');
                setDescriptionInput('');
                Alert.alert("Sent", "Your intention has been sent to your parent for approval.");
              } : handleNiyatCheck}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>{aiAdvice ? "Send to Parent" : "Ask for Advice"}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModalType('NONE'); setAiAdvice(''); }} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  wisdomCard: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 20, ...SHADOWS.soft, borderLeftWidth: 4, borderLeftColor: COLORS.emerald, marginBottom: SPACING.md },
  wisdomLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.emerald, letterSpacing: 1 },
  wisdomText: { fontStyle: 'italic', color: COLORS.slate, marginTop: 4 },
  gardenFrame: { backgroundColor: COLORS.emerald, borderRadius: 30, padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, ...SHADOWS.medium },
  treeContainer: { alignItems: 'center' },
  treeEmoji: { fontSize: 60, marginBottom: 5 },
  gardenLabel: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', opacity: 0.8 },
  balanceInfo: { alignItems: 'flex-end' },
  walletLabel: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', opacity: 0.8 },
  walletValue: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  streakBadge: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 10, marginTop: 10 },
  streakText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  jarGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  jar: { flex: 1, padding: SPACING.lg, borderRadius: 25, ...SHADOWS.soft, alignItems: 'center' },
  jarEmoji: { fontSize: 24, marginBottom: 5 },
  jarTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.slate },
  jarValue: { fontSize: 18, fontWeight: 'bold' },
  jarAction: { fontSize: 9, fontWeight: '600', color: COLORS.slate, marginTop: 4, opacity: 0.6 },
  actionsBox: { gap: 10 },
  actionBtn: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 15, ...SHADOWS.soft },
  iconCircle: { width: 44, height: 44, backgroundColor: COLORS.goldLight, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontWeight: 'bold', color: COLORS.slateDark },
  actionDesc: { fontSize: 12, color: COLORS.slate },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: SPACING.xl },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 30, padding: SPACING.xl, ...SHADOWS.medium },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.slateDark, textAlign: 'center', marginBottom: 10 },
  modalDesc: { fontSize: 13, color: COLORS.slate, textAlign: 'center', marginVertical: 15 },
  modalInput: { backgroundColor: COLORS.slateLight, padding: 20, borderRadius: 20, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  submitBtn: { backgroundColor: COLORS.emerald, padding: 18, borderRadius: 18, alignItems: 'center' },
  submitText: { color: COLORS.white, fontWeight: 'bold' },
  closeBtn: { padding: 15, alignItems: 'center' },
  closeText: { color: COLORS.slate, fontWeight: 'bold' },
  adviceBox: { backgroundColor: COLORS.emeraldLight, padding: 15, borderRadius: 15, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: COLORS.emerald },
  adviceLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.emerald },
  adviceText: { fontSize: 13, fontStyle: 'italic', color: COLORS.emeraldDark },
  frozenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  frozenIcon: { backgroundColor: COLORS.redLight, padding: 30, borderRadius: 40, marginBottom: 20 },
  frozenTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.slateDark },
  frozenText: { textAlign: 'center', color: COLORS.slate, marginTop: 10 },
  transItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  transIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transNote: { fontWeight: 'bold', color: COLORS.slateDark, fontSize: 14 },
  transDate: { fontSize: 10, color: COLORS.slate },
  transAmount: { fontWeight: 'bold' },
  uploadArea: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 20, padding: 40, alignItems: 'center', backgroundColor: '#F8FAFC' },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.emeraldLight, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 4, borderColor: COLORS.emerald },
  scoreText: { fontSize: 28, fontWeight: 'bold', color: COLORS.emerald },
  scoreLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.slate, marginBottom: 10 }
});
