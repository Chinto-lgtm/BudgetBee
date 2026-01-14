
import React from 'react';
import { View, Text, StyleSheet, Switch, TextInput, ScrollView } from 'react-native';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS } from '../constants';

export const ParentSettings = () => {
  const { config, updateConfig } = useFamily();

  if (!config) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Control Room</Text>
      
      {/* Master Freeze */}
      <View style={[styles.card, config.isAppFrozen && styles.cardFrozen]}>
        <View style={styles.row}>
          <View>
            <Text style={styles.cardTitle}>Master App Lock</Text>
            <Text style={styles.cardDesc}>Pause all child activities</Text>
          </View>
          <Switch 
            value={config.isAppFrozen} 
            onValueChange={(val) => updateConfig({ isAppFrozen: val })}
            trackColor={{ false: "#E2E8F0", true: COLORS.emerald }}
          />
        </View>
      </View>

      {/* Split Config */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>HALAL SPLIT RULES</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.row}>
            <Text style={styles.label}>Sadaqah Split (%)</Text>
            <Text style={[styles.val, {color: COLORS.gold}]}>{config.sadaqahSplit}%</Text>
          </View>
          {/* Simulation of a slider */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${config.sadaqahSplit * 2}%`, backgroundColor: COLORS.gold }]} />
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.row}>
            <Text style={styles.label}>Savings Split (%)</Text>
            <Text style={[styles.val, {color: '#2563EB'}]}>{config.savingsSplit}%</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${config.savingsSplit * 2}%`, backgroundColor: '#2563EB' }]} />
          </View>
        </View>
      </View>

      {/* Numeric Inputs */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>AMOUNTS & THRESHOLDS</Text>
        
        <View style={styles.inputGrid}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Allowance ($)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={config.allowanceAmount.toString()}
              onChangeText={(val) => updateConfig({ allowanceAmount: parseFloat(val) || 0 })}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Bonus ($)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={config.barakahBonusAmount.toString()}
              onChangeText={(val) => updateConfig({ barakahBonusAmount: parseFloat(val) || 0 })}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardFrozen: { borderColor: COLORS.emerald, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardDesc: { fontSize: 12, color: '#64748B' },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 15 },
  settingItem: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600' },
  val: { fontWeight: 'bold' },
  sliderTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  sliderFill: { height: '100%', borderRadius: 3 },
  inputGrid: { flexDirection: 'row', gap: 15 },
  inputWrapper: { flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontWeight: 'bold' },
});
