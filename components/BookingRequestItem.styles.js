import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  
  container: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    elevation:1
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
