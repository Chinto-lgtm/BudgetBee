
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { FamilyProvider, useFamily } from './contexts/FamilyContext';
import { LoginScreen } from './screens/LoginScreen';
import { ChildDashboard } from './screens/ChildDashboard';
import { ParentDashboard } from './screens/ParentDashboard';
import { ParentSettings } from './screens/ParentSettings';
import { COLORS, SHADOWS } from './constants';

const AppContent = () => {
  const { currentUser, logout, isLoading } = useFamily();
  const [activeTab, setActiveTab] = useState<'DASH' | 'SETTINGS'>('DASH');

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>🐝 Harvesting Barakah...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={{fontSize: 20}}>🐝</Text>
          </View>
          <View>
            <Text style={styles.logoText}>BUDGETBEE</Text>
            <Text style={styles.logoSub}>Halal Growth Garden</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentUser.role === 'CHILD' ? (
          <ChildDashboard />
        ) : (
          activeTab === 'DASH' ? <ParentDashboard /> : <ParentSettings />
        )}
      </ScrollView>

      {/* Parent Bottom Navigation */}
      {currentUser.role === 'PARENT' && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            onPress={() => setActiveTab('DASH')}
            style={[styles.tabBtn, activeTab === 'DASH' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'DASH' && styles.tabTextActive]}>Garden View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('SETTINGS')}
            style={[styles.tabBtn, activeTab === 'SETTINGS' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'SETTINGS' && styles.tabTextActive]}>Control Room</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <FamilyProvider>
      <AppContent />
    </FamilyProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { color: COLORS.goldDark, fontWeight: '700', fontSize: 16 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...SHADOWS.soft,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { 
    backgroundColor: COLORS.beeYellow, 
    padding: 6, 
    borderRadius: 12, 
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.beeBlack
  },
  logoText: { fontSize: 20, fontWeight: '900', color: COLORS.beeBlack, letterSpacing: -0.5 },
  logoSub: { fontSize: 10, fontWeight: '700', color: COLORS.emerald, marginTop: -4 },
  logoutBtn: { backgroundColor: COLORS.slateLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: COLORS.slate, fontWeight: 'bold', fontSize: 12 },
  scrollContent: { paddingBottom: 100 },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'white',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 20,
    ...SHADOWS.medium,
  },
  tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBtnActive: { borderTopWidth: 4, borderTopColor: COLORS.beeYellow },
  tabText: { color: COLORS.slate, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: COLORS.beeBlack, fontWeight: '800' },
});
