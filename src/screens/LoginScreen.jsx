import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useFamily } from '../contexts/FamilyContext';
import { COLORS } from '../constants/constants'; // ✅ Fixed Import Path

export default function LoginScreen() { // ✅ Default Export
  const { login, signUpParent } = useFamily();
  // ✅ Fixed: Removed TypeScript generics <'PARENT' | 'CHILD'>
  const [role, setRole] = useState('CHILD');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleEnter = () => {
    login({ identifier: role === 'PARENT' ? email : username, role });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}><Text style={{color: 'white', fontSize: 24}}>🐝</Text></View>
        <Text style={styles.title}>BudgetBee</Text>
        <Text style={styles.tagline}>The Halal Growth Garden</Text>
      </View>

      <View style={styles.rolePicker}>
        <TouchableOpacity 
          onPress={() => setRole('CHILD')}
          style={[styles.roleBtn, role === 'CHILD' && styles.roleBtnActive]}
        >
          <Text style={[styles.roleText, role === 'CHILD' && styles.roleTextActive]}>Child</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setRole('PARENT')}
          style={[styles.roleBtn, role === 'PARENT' && styles.roleBtnActive]}
        >
          <Text style={[styles.roleText, role === 'PARENT' && styles.roleTextActive]}>Parent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.inputLabel}>{role === 'PARENT' ? 'Email Address' : 'Unique Username'}</Text>
        <TextInput 
          style={styles.input}
          placeholder={role === 'PARENT' ? "parent@me.com" : "lil_bee"}
          value={role === 'PARENT' ? email : username}
          onChangeText={role === 'PARENT' ? setEmail : setUsername}
          autoCapitalize="none"
        />
        
        <TouchableOpacity style={styles.submitBtn} onPress={handleEnter}>
          <Text style={styles.submitText}>Enter My Garden</Text>
        </TouchableOpacity>

        {role === 'PARENT' && (
          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={() => signUpParent({email: 'demo@parent.com', name: 'Demo Parent'})}
          >
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#F8FAFC' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoIcon: { backgroundColor: COLORS.emerald, padding: 20, borderRadius: 25, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  tagline: { color: COLORS.emerald, fontWeight: '600' },
  rolePicker: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 15, padding: 5, marginBottom: 30 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  roleBtnActive: { backgroundColor: COLORS.emerald },
  roleText: { color: '#64748B', fontWeight: 'bold' },
  roleTextActive: { color: 'white' },
  form: { gap: 15 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  submitBtn: { backgroundColor: COLORS.emerald, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  googleBtn: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: 'white' },
  googleText: { color: '#1E293B', fontWeight: '600' }
});