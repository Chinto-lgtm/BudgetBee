import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS, SPACING, SHADOWS } from '../constants/constants'; // ✅ Fixed Import Path

export default function ParentDashboard() { // ✅ Default Export
  const { childProfile, pendingRequests, resolveRequest, config, grantBarakahBonus, transactions } = useFamily();
  const [showCode, setShowCode] = useState(false);
  
  // ✅ Fixed: Removed TypeScript generics <string | null>
  const [resolvingId, setResolvingId] = useState(null);
  // ✅ Fixed: Removed TypeScript generics <'REQUESTS' | 'LEDGER'>
  const [activeView, setActiveView] = useState('REQUESTS');

  const handleBarakahBonus = async () => {
    if (!childProfile || !config) return;
    await grantBarakahBonus();
    Alert.alert("Bonus Granted", `JazakAllah Khair! $${config.barakahBonusAmount} added to wallet.`);
  };

  // ✅ Fixed: Removed type annotations (id: string, approved: boolean)
  const handleResolve = async (id, approved) => {
    setResolvingId(id);
    await resolveRequest(id, approved);
    setResolvingId(null);
  };

  const isBarakahEligible = childProfile && config ? childProfile.streakDays >= config.barakahThreshold : false;

  // ✅ Fixed: Removed type annotation ({ item: any })
  const renderTransaction = ({ item }) => {
    const isOut = item.type === 'SADAQAH_GIVEN' || item.type === 'WITHDRAWAL';
    return (
      <View style={styles.transItem}>
        <View style={[styles.transIcon, { backgroundColor: isOut ? COLORS.redLight : COLORS.emeraldLight }]}>
          <Text>{item.type === 'INCOME_SPLIT' ? '💰' : item.type === 'SADAQAH_GIVEN' ? '❤️' : '🏦'}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.transNote}>{item.note}</Text>
          <Text style={styles.transDate}>{new Date(item.timestamp).toLocaleDateString()} • {item.type}</Text>
        </View>
        <Text style={[styles.transAmount, {color: isOut ? COLORS.red : COLORS.emerald}]}>
          {isOut ? '-' : '+'}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Family Dashboard</Text>
          <Text style={styles.subtitle}>Oversight for {childProfile?.displayName || 'Child'}</Text>
        </View>
        <TouchableOpacity style={styles.codeBtn} onPress={() => setShowCode(!showCode)}>
          <Text style={styles.codeBtnText}>{showCode ? 'Hide Code' : 'Show Code'}</Text>
        </TouchableOpacity>
      </View>

      {showCode && config && (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Family Link Code</Text>
          <Text style={styles.codeValue}>{config.familyCode}</Text>
          <Text style={styles.codeDesc}>Give this code to your child to link their account.</Text>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: COLORS.emeraldLight }]}>
          <Text style={styles.statLabel}>Spendable</Text>
          <Text style={[styles.statValue, { color: COLORS.emerald }]}>${childProfile?.walletBalance.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.goldLight }]}>
          <Text style={styles.statLabel}>Sadaqah</Text>
          <Text style={[styles.statValue, { color: COLORS.gold }]}>${childProfile?.sadaqahBalance.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.statLabel}>Savings</Text>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>${childProfile?.savingsBalance.toFixed(2) || '0.00'}</Text>
        </View>
      </View>

      {/* View Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeView === 'REQUESTS' && styles.tabActive]} 
          onPress={() => setActiveView('REQUESTS')}
        >
          <Text style={[styles.tabText, activeView === 'REQUESTS' && styles.tabTextActive]}>
            Requests ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeView === 'LEDGER' && styles.tabActive]} 
          onPress={() => setActiveView('LEDGER')}
        >
          <Text style={[styles.tabText, activeView === 'LEDGER' && styles.tabTextActive]}>Ledger</Text>
        </TouchableOpacity>
      </View>

      {activeView === 'REQUESTS' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Barakah Bonus Card */}
          <View style={[styles.card, isBarakahEligible && styles.cardActive]}>
            <View style={styles.row}>
              <View>
                <Text style={styles.cardTitle}>Barakah Consistency</Text>
                <Text style={styles.cardDesc}>{childProfile?.streakDays || 0} Day Saving Streak</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isBarakahEligible ? COLORS.gold : '#94A3B8' }]}>
                <Text style={styles.badgeText}>{isBarakahEligible ? 'ELIGIBLE' : 'PROGRESSING'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.bonusBtn, !isBarakahEligible && styles.bonusBtnDisabled]}
              disabled={!isBarakahEligible}
              onPress={handleBarakahBonus}
            >
              <Text style={styles.bonusBtnText}>Grant Barakah Bonus (${config?.barakahBonusAmount})</Text>
            </TouchableOpacity>
          </View>

          {pendingRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>All intentions are currently reviewed.</Text>
            </View>
          ) : (
            pendingRequests.map((req) => {
              const isCharity = req.type === 'SADAQAH_DISCHARGE';
              return (
                <View key={req.id} style={[styles.requestCard, isCharity && { borderColor: COLORS.gold, borderWidth: 1 }]}>
                  <View style={styles.row}>
                    <View style={styles.reqHeaderLeft}>
                      <Text style={[styles.reqType, isCharity && { color: COLORS.gold }]}>
                        {isCharity ? 'CHARITY DISTRIBUTION' : req.type === 'TASK_COMPLETION' ? 'VERIFICATION' : 'NIYAT'}
                      </Text>
                      {req.aiScore && (
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreBadgeText}>{req.aiScore}% Match</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.reqTime}>{new Date(req.timestamp).toLocaleTimeString()}</Text>
                  </View>
                  
                  <Text style={styles.reqTitle}>{req.title}</Text>
                  <View style={styles.niyatBox}>
                    <Text style={styles.niyatText}>"{req.description}"</Text>
                  </View>

                  {req.aiFeedback && (
                    <View style={[styles.aiBox, isCharity && { backgroundColor: COLORS.goldLight }]}>
                      <Text style={[styles.aiLabel, isCharity && { color: COLORS.goldDark }]}>AI INSIGHT</Text>
                      <Text style={[styles.aiText, isCharity && { color: COLORS.goldDark }]}>{req.aiFeedback}</Text>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={styles.declineBtn} 
                      onPress={() => handleResolve(req.id, false)}
                      disabled={resolvingId === req.id}
                    >
                      <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.approveBtn, isCharity && { backgroundColor: COLORS.gold }]} 
                      onPress={() => handleResolve(req.id, true)}
                      disabled={resolvingId === req.id}
                    >
                      {resolvingId === req.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.approveText}>
                          {isCharity ? 'Confirm Giving' : `Approve ${req.amount ? `($${req.amount})` : ''}`}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <FlatList 
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No financial history yet.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B' },
  codeBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  codeBtnText: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
  codeCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.emerald },
  codeLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.emerald, marginBottom: 5 },
  codeValue: { fontSize: 24, fontWeight: 'bold', letterSpacing: 5, color: '#1E293B', marginBottom: 10 },
  codeDesc: { fontSize: 11, color: '#64748B' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'white', ...SHADOWS.soft },
  tabText: { color: COLORS.slate, fontWeight: 'bold', fontSize: 12 },
  tabTextActive: { color: COLORS.emerald },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 20, ...SHADOWS.soft },
  cardActive: { borderColor: COLORS.gold, borderWidth: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  reqHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBadge: { backgroundColor: COLORS.emeraldLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  scoreBadgeText: { fontSize: 9, color: COLORS.emerald, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cardDesc: { fontSize: 12, color: '#64748B' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  bonusBtn: { backgroundColor: COLORS.gold, padding: 15, borderRadius: 15, alignItems: 'center' },
  bonusBtnDisabled: { backgroundColor: '#F1F5F9' },
  bonusBtnText: { color: 'white', fontWeight: 'bold' },
  emptyState: { backgroundColor: '#F1F5F9', padding: 30, borderRadius: 20, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 20 },
  requestCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 15, ...SHADOWS.soft },
  reqType: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase' },
  reqTime: { fontSize: 10, color: '#94A3B8' },
  reqTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginVertical: 8 },
  niyatBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#E2E8F0' },
  niyatText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },
  aiBox: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, marginBottom: 15 },
  aiLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.emerald, marginBottom: 4 },
  aiText: { fontSize: 12, color: '#065F46' },
  actionRow: { flexDirection: 'row', gap: 10 },
  declineBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  declineText: { color: '#64748B', fontWeight: 'bold' },
  approveBtn: { flex: 2, backgroundColor: COLORS.emerald, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  approveText: { color: 'white', fontWeight: 'bold' },
  transItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  transIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transNote: { fontWeight: 'bold', color: COLORS.slateDark, fontSize: 14 },
  transDate: { fontSize: 10, color: COLORS.slate },
  transAmount: { fontWeight: 'bold' }
});