import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    paddingTop:20,
    paddingBottom:16
  },
  row: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 2,
  },

  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    minWidth: 70,
  },

  value: {
    fontSize: 14,
    color: '#555',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeContainer: {
  position: 'absolute',
  top: 10,
  right: 10,
  
},
badgeBase: {
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 4,
},
badgeText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 12,
},

});

export default styles;
