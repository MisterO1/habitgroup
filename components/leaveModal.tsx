import React from 'react'

export const leaveModal = () => {
  return (
    <div>leaveModal</div>
  )
}



{/* <Modal visible={showLeaveModal} transparent animationType="fade" onRequestClose={() => setShowLeaveModal(false)}>
<View style={styles.modalBackdrop} testID="leaveModalBackdrop">
  <View style={[styles.modalCard, { backgroundColor: colors.surface }]} testID="leaveModal">
    <View style={styles.modalHeader}>
      <View style={styles.modalIconWrap}>
        <LogOut size={24} color={colors.error} />
      </View>
      <Text style={[styles.modalTitle, { color: colors.text }]}>Leave group</Text>
      <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Choose what to do with your activity data in this group.</Text>
    </View>

    <TouchableOpacity
      style={[styles.optionRow, { borderColor: colors.border }]}
      onPress={() => setDeleteData(false)}
      accessibilityState={{ selected: !deleteData }}
      testID="keepDataOption"
    >
      <View style={[styles.radio, { borderColor: colors.primary }, !deleteData ? { backgroundColor: colors.primary } : null ]} />
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>Leave and keep my data</Text>
        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Your past check-ins remain for the group stats.</Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.optionRow, { borderColor: colors.border }]}
      onPress={() => setDeleteData(true)}
      accessibilityState={{ selected: deleteData }}
      testID="deleteDataOption"
    >
      <View style={[styles.radio, { borderColor: colors.error }, deleteData ? { backgroundColor: colors.error } : null ]} />
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>Leave and delete my data</Text>
        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>All your progress and comments in this group will be removed.</Text>
      </View>
      <Trash2 size={18} color={colors.error} />
    </TouchableOpacity>

    <View style={styles.modalActions}>
      <TouchableOpacity onPress={() => setShowLeaveModal(false)} style={[styles.actionBtn, { backgroundColor: colors.card }]} testID="cancelLeave">
        <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
      </TouchableOpacity>
      { <TouchableOpacity onPress={onConfirmLeave} disabled={submitting} style={[styles.actionBtn, { backgroundColor: deleteData ? colors.error : colors.primary }]} testID="confirmLeave">
        <Text style={[styles.actionText, { color: '#fff' }]}>{submitting ? 'Leaving...' : 'Confirm'}</Text>
      </TouchableOpacity> }
    </View>
  </View>
</View>
</Modal> */}