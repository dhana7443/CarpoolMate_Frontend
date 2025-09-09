import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const GenderPicker = ({ value, onChange, editable }) => {
  const [visible, setVisible] = useState(false);

  const genders = ['Male', 'Female', 'Other'];

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>Gender</Text>

      <TouchableOpacity
        style={[styles.input, !editable && styles.disabledInput]}
        disabled={!editable}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: value ? '#000' : '#9CA3AF' }}>
          {value || 'Select Gender'}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <FlatList
              data={genders}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setVisible(false)}
            >
              <Text style={{ color: '#fff' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  cancelButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#5A67D8',
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default GenderPicker;
