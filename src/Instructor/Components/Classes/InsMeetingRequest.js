const handleReject = async (meetingId, reason) => {
  try {
    const response = await axios.put(`${API_URL}/meeting/${meetingId}`, {
      action: 'reject',
      rejectionReason: reason
    });
    
    if (response.status === 200) {
      toast.success('Meeting rejected successfully');
      // Refresh meetings list
      fetchMeetings();
    }
  } catch (error) {
    console.error('Error rejecting meeting:', error);
    toast.error('Failed to reject meeting');
  }
}; 