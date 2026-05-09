import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { submitDispatchRequest, getDispatchRequests, getInventoryItems, getInventory, updateInventoryItem, createInventoryItem, createNotification, getNotifications, deleteDispatchRequest } from '../api/dispatch';
import { useUser } from '../context/UserContext';

const DispatchScreen: React.FC = () => {
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [dispatchRequests, setDispatchRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [formData, setFormData] = useState({
    requesterName: user.name,
    dateTime: new Date().toISOString().slice(0, 16),
    category: '',
    items: [{ id: 1, number: '', qty: '', item: '', remarks: '' }],
  });
  const categories = ['Equipment', 'Medical', 'Relief Good', 'Other'];
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState<any>(null);
  const [returnFormData, setReturnFormData] = useState({
    itemId: '',
    itemName: '',
    quantityReturned: '',
    remarks: '',
    condition: 'good',
  });
  const conditionOptions = ['Brand New', 'Good', 'Damaged', 'Under Maintenance'];
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showItemQtyModal, setShowItemQtyModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [itemQtyInput, setItemQtyInput] = useState('');
  const [editingDispatchRequest, setEditingDispatchRequest] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDispatchRequests = async () => {
    setLoading(true);
    try {
      const response = await getDispatchRequests();
      setDispatchRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching dispatch requests:', error);
      Alert.alert('Error', 'Failed to load dispatch requests');
    } finally {
      setLoading(false);
    }
  };

  const generateRequestNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REQ-${year}${month}${day}-${random}`;
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await getInventoryItems();
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      const items = response.data.data;
      console.log('Fetched inventory items:', items);
      console.log('Number of items:', items.length);
      setInventoryItems(items);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      console.error('Error response:', (error as any).response);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      const notifs = response.data.data;
      setNotifications(notifs);
      const unread = notifs.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    setRequestNumber(generateRequestNumber());
  }, []);

  useEffect(() => {
    fetchInventoryItems();
    
    // Auto-refresh inventory items every 30 seconds
    const interval = setInterval(() => {
      fetchInventoryItems();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    fetchDispatchRequests();
    
    // Auto-refresh dispatch requests every 30 seconds
    const interval = setInterval(() => {
      fetchDispatchRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showForm) {
      fetchDispatchRequests();
    }
  }, [showForm]);

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now(), number: '', qty: '', item: '', remarks: '' }],
    });
  };

  const removeItemRow = (id: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id),
    });
  };

  const updateItemRow = (id: number, field: string, value: string) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const editItemRow = (id: number) => {
    // For now, the fields are already editable
    // This could open a modal for editing in the future
  };

  const handleSubmitDispatch = async () => {
    if (!formData.requesterName) {
      Alert.alert('Error', 'Please enter requester name');
      return;
    }

    if (formData.items.length === 0 || formData.items.some(item => !item.item || !item.qty)) {
      Alert.alert('Error', 'Please fill in all item fields');
      return;
    }

    // Validate that requested quantity doesn't exceed available inventory
    for (const item of formData.items) {
      const inventoryItem = inventoryItems.find(
        (inv: any) => inv.name.toLowerCase() === item.item.toLowerCase()
      );
      
      if (!inventoryItem) {
        Alert.alert('Error', `Item "${item.item}" not found in inventory`);
        return;
      }

      const availableQty = inventoryItem.quantity || inventoryItem.stock_quantity || 0;
      const requestedQty = parseInt(item.qty) || 0;

      if (requestedQty > availableQty) {
        Alert.alert(
          'Insufficient Stock',
          `Item "${item.item}" has only ${availableQty} available, but you requested ${requestedQty}. Please reduce the quantity.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitDispatchRequest({
        requester_name: formData.requesterName,
        date_time: formData.dateTime,
        category: formData.category,
        items: formData.items,
      });
      Alert.alert('Success', 'Dispatch request submitted successfully');
      setRequestNumber(generateRequestNumber());
      setFormData({
        requesterName: user.name,
        dateTime: new Date().toISOString().slice(0, 16),
        category: '',
        items: [{ id: 1, number: '', qty: '', item: '', remarks: '' }],
      });
      await fetchDispatchRequests();
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit dispatch request');
      console.error('Error submitting dispatch:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Supply Request</Text>
          <Text style={styles.headerSubtitle}>Submit your supply request below</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.notificationBell}
            onPress={() => {
              setShowNotificationModal(true);
              fetchNotifications();
            }}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>📦</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showForm && styles.toggleButtonActive]}
          onPress={() => setShowForm(true)}
        >
          <Text style={[styles.toggleButtonText, showForm && styles.toggleButtonTextActive]}>New Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !showForm && styles.toggleButtonActive]}
          onPress={() => setShowForm(false)}
        >
          <Text style={[styles.toggleButtonText, !showForm && styles.toggleButtonTextActive]}>My Requests</Text>
        </TouchableOpacity>
      </View>

      {showForm ? (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📋 Request Information</Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Request Number</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{requestNumber}</Text>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name of Request Person</Text>
              <TextInput
                style={styles.input}
                value={formData.requesterName}
                onChangeText={(text) => setFormData({ ...formData, requesterName: text })}
                placeholder="Enter name"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date/Time</Text>
              <TextInput
                style={styles.input}
                value={formData.dateTime}
                onChangeText={(text) => setFormData({ ...formData, dateTime: text })}
                placeholder="Select date and time"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>All Type</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {formData.category || 'Select type of supply'}
                </Text>
                <Text style={styles.dropdownArrow}>{showCategoryDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View style={styles.dropdownList}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.dropdownItem, formData.category === cat && styles.dropdownItemSelected]}
                      onPress={() => {
                        setFormData({ ...formData, category: cat });
                        setShowCategoryDropdown(false);
                        // Filter items by category
                        const categoryMap: { [key: string]: string[] } = {
                          'Equipment': ['equipment', 'equipment supply'],
                          'Medical': ['medical', 'medical supply'],
                          'Relief Good': ['relief good', 'relief good supply'],
                          'Other': ['other', 'office', 'office supply'],
                        };
                        const filtered = inventoryItems.filter((item: any) => {
                          const itemCategory = (item.category || item.type_of_supply || '').toLowerCase().trim();
                          const searchTerms = categoryMap[cat] || [];
                          return searchTerms.some(term => itemCategory.includes(term));
                        });
                        setFilteredItems(filtered);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, formData.category === cat && styles.dropdownItemTextSelected]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.itemListContainer}>
                <Text style={styles.itemListTitle}>
                  Available Items ({formData.category ? filteredItems.length : inventoryItems.length})
                </Text>
                {(formData.category ? filteredItems : inventoryItems).length > 0 ? (
                  <ScrollView style={styles.itemListScroll} nestedScrollEnabled={true}>
                    {(formData.category ? filteredItems : inventoryItems).map((item: any) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.availableItem}
                        onPress={() => {
                          // Check if item already exists in the form
                          const itemExists = formData.items.some(
                            (existingItem: any) => existingItem.item.toLowerCase() === item.name.toLowerCase()
                          );
                          
                          if (itemExists) {
                            Alert.alert('Item Already Added', `${item.name} is already in your request list.`);
                            return;
                          }
                          
                          setSelectedInventoryItem(item);
                          setItemQtyInput('');
                          setShowItemQtyModal(true);
                        }}
                      >
                        <Text style={styles.availableItemName}>{item.name}</Text>
                        <Text style={styles.availableItemStock}>Stock: {item.quantity || item.stock_quantity || 0}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyItemsText}>No items available</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📦 Items</Text>
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>{formData.items.length}</Text>
              </View>
            </View>
            
            {formData.items.map((item, index) => (
              <View key={item.id} style={styles.itemFormCard}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Item Name</Text>
                  <TextInput
                    style={styles.input}
                    value={item.item}
                    onChangeText={(text) => updateItemRow(item.id, 'item', text)}
                    placeholder="Enter item name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Qty</Text>
                  <TextInput
                    style={styles.input}
                    value={item.qty}
                    onChangeText={(text) => updateItemRow(item.id, 'qty', text)}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Remark</Text>
                  <TextInput
                    style={styles.input}
                    value={item.remarks}
                    onChangeText={(text) => updateItemRow(item.id, 'remarks', text)}
                    placeholder="Enter remarks"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                {formData.items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItemRow(item.id)} style={styles.removeRowButton}>
                    <Text style={styles.removeRowText}>🗑️ Remove Item</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addButton} onPress={addItemRow}>
              <Text style={styles.addButtonText}>➕ Add Another Item</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitDispatch}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '⏳ Submitting...' : '📤 Submit Request'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Dispatch Requests</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : dispatchRequests.length === 0 ? (
              <Text style={styles.emptyText}>No dispatch requests found</Text>
            ) : (
              dispatchRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Request #:</Text>
                      <Text style={styles.infoValue}>{request.id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{request.requester_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Date/Time:</Text>
                      <Text style={styles.infoValue}>{new Date(request.date_time).toLocaleString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <View style={[
                        styles.statusBadge,
                        request.status === 'approved' && styles.statusApproved,
                        request.status === 'rejected' && styles.statusRejected,
                        request.status === 'pending' && styles.statusPending
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.itemsSection}>
                    <Text style={styles.itemsTitle}>Items:</Text>
                    {request.items?.map((item: any, index: number) => (
                      <View key={index} style={styles.itemRow}>
                        <View style={styles.itemCell}>
                          <Text style={styles.itemLabel}>Item:</Text>
                          <Text style={styles.itemValue}>{item.item}</Text>
                        </View>
                        <View style={styles.itemCell}>
                          <Text style={styles.itemLabel}>Qty:</Text>
                          <Text style={styles.itemValue}>{item.qty}</Text>
                        </View>
                        <View style={styles.itemCell}>
                          <Text style={styles.itemLabel}>Remark:</Text>
                          <Text style={styles.itemValue}>{item.remarks || '-'}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.actionsSection}>
                    <Text style={[
                      styles.statusBadge,
                      request.status === 'approved' && styles.statusApproved,
                      request.status === 'rejected' && styles.statusRejected,
                      request.status === 'pending' && styles.statusPending,
                    ]}>
                      {request.status}
                    </Text>
                    <View style={styles.requestActionButtons}>
                      <TouchableOpacity 
                        style={styles.returnActionButton}
                        onPress={() => {
                          setSelectedReturnRequest(request);
                          setShowReturnModal(true);
                        }}
                      >
                        <Text style={styles.returnActionText}>↩️ Return</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.editActionButton}
                        onPress={() => {
                          setEditingDispatchRequest(request);
                          setShowEditModal(true);
                        }}
                      >
                        <Text style={styles.editActionText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteActionButton}
                        onPress={() => {
                          Alert.alert(
                            'Delete Request',
                            'Are you sure you want to delete this dispatch request?',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel',
                              },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await deleteDispatchRequest(request.id);
                                    fetchDispatchRequests();
                                    Alert.alert('Success', 'Dispatch request deleted successfully');
                                  } catch (error) {
                                    Alert.alert('Error', 'Failed to delete dispatch request');
                                  }
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.deleteActionText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
      
      {/* Return Item Modal */}
      <Modal visible={showReturnModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Return Item</Text>
              <TouchableOpacity onPress={() => setShowReturnModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Item to Return</Text>
                <ScrollView style={styles.itemSelectorScroll}>
                  {selectedReturnRequest?.items?.map((item: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.itemSelectorItem,
                        returnFormData.itemId === String(index) && styles.itemSelectorItemSelected
                      ]}
                      onPress={() => {
                        setReturnFormData({ 
                          ...returnFormData, 
                          itemId: String(index),
                          itemName: item.item,
                          quantityReturned: String(item.qty),
                          condition: returnFormData.condition 
                        });
                        setShowItemSelector(false);
                      }}
                    >
                      <Text style={styles.itemSelectorItemName}>{item.item}</Text>
                      <Text style={styles.itemSelectorItemQty}>Qty: {item.qty}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {returnFormData.itemName && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Item Name</Text>
                    <TextInput
                      style={styles.input}
                      value={returnFormData.itemName}
                      editable={false}
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Quantity to Return</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Enter quantity to return"
                      value={returnFormData.quantityReturned}
                      onChangeText={(text) => setReturnFormData({ ...returnFormData, quantityReturned: text })}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.modalLabel}>Condition *</Text>
                    <View style={styles.modalDropdown}>
                      <Text style={styles.modalDropdownText}>{returnFormData.condition}</Text>
                      <Text style={styles.modalDropdownArrow}>▼</Text>
                    </View>
                    <View style={styles.modalDropdownOptions}>
                      {conditionOptions.map((condition) => (
                        <TouchableOpacity
                          key={condition}
                          style={[
                            styles.modalDropdownOption,
                            returnFormData.condition === condition && styles.modalDropdownOptionSelected
                          ]}
                          onPress={() => setReturnFormData({ ...returnFormData, condition })}
                        >
                          <Text style={[
                            styles.modalDropdownOptionText,
                            returnFormData.condition === condition && styles.modalDropdownOptionTextSelected
                          ]}>{condition}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Remarks</Text>
                    <TextInput
                      style={styles.input}
                      value={returnFormData.remarks}
                      onChangeText={(text) => setReturnFormData({ ...returnFormData, remarks: text })}
                      placeholder="Enter remarks"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowReturnModal(false);
                  setReturnFormData({ itemId: '', itemName: '', quantityReturned: '', remarks: '', condition: 'good' });
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, !returnFormData.itemName && styles.modalSubmitButtonDisabled]}
                onPress={async () => {
                  try {
                    // Map condition to match API values
                    const conditionMap: Record<string, string> = {
                      'Brand New': 'brand new',
                      'Good': 'good',
                      'Damaged': 'damaged',
                      'Under Maintenance': 'under maintenance',
                    };
                    const condition = conditionMap[returnFormData.condition] || 'good';
                    
                    const quantity = parseInt(returnFormData.quantityReturned) || 1;
                    
                    // Create notification for returned item (will show on web notification bell)
                    await createNotification({
                      type: 'return_item',
                      title: 'Item Returned',
                      message: `${returnFormData.itemName} (Qty: ${returnFormData.quantityReturned}, Condition: ${returnFormData.condition}) has been returned`,
                      user_id: typeof user.id === 'string' ? parseInt(user.id) : user.id,
                      data: {
                        itemName: returnFormData.itemName,
                        quantityReturned: returnFormData.quantityReturned,
                        remarks: returnFormData.remarks,
                        condition: returnFormData.condition,
                        requestId: selectedReturnRequest?.id,
                      },
                    });
                    
                    // Delete the dispatch request after returning the item
                    if (selectedReturnRequest?.id) {
                      await deleteDispatchRequest(selectedReturnRequest.id);
                    }
                    
                    // Refresh dispatch requests list
                    await fetchDispatchRequests();
                    
                    Alert.alert('Success', 'Return request submitted. Check notification bell on web for approval.');
                    setShowReturnModal(false);
                    setReturnFormData({ itemId: '', itemName: '', quantityReturned: '', remarks: '', condition: 'good' });
                  } catch (error) {
                    console.error('Error processing return:', error);
                    Alert.alert('Error', 'Failed to submit return request');
                  }
                }}
                disabled={!returnFormData.itemName}
              >
                <Text style={styles.modalSubmitText}>Submit Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Notification Modal */}
      <Modal visible={showNotificationModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationScroll}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifications}>
                  <Text style={styles.emptyNotificationsText}>No notifications</Text>
                </View>
              ) : (
                notifications.map((notification: any) => (
                  <View 
                    key={notification.id} 
                    style={[
                      styles.notificationItem,
                      !notification.is_read && styles.notificationItemUnread
                    ]}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={[
                        styles.notificationTypeBadge,
                        notification.type === 'stock_alert' && styles.stockAlertBadge,
                        notification.type === 'return_item' && styles.returnItemBadge
                      ]}>
                        <Text style={styles.notificationTypeText}>
                          {notification.type === 'stock_alert' ? '⚠️ Stock Alert' : '↩️ Return Item'}
                        </Text>
                      </View>
                      {!notification.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Item Quantity Modal */}
      <Modal visible={showItemQtyModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Item Quantity</Text>
              <TouchableOpacity onPress={() => setShowItemQtyModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedInventoryItem && (
              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Item Name</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedInventoryItem.name}
                    editable={false}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Available Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={String(selectedInventoryItem.quantity || selectedInventoryItem.stock_quantity || 0)}
                    editable={false}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quantity to Request</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    value={itemQtyInput}
                    onChangeText={setItemQtyInput}
                    keyboardType="numeric"
                    onSubmitEditing={() => {
                      if (!itemQtyInput || parseInt(itemQtyInput) <= 0) {
                        Alert.alert('Error', 'Please enter a valid quantity');
                        return;
                      }

                      const availableQty = selectedInventoryItem.quantity || selectedInventoryItem.stock_quantity || 0;
                      const requestedQty = parseInt(itemQtyInput);

                      if (requestedQty > availableQty) {
                        Alert.alert(
                          'Insufficient Stock',
                          `Only ${availableQty} available, but you requested ${requestedQty}.`
                        );
                        return;
                      }

                      const newItem = {
                        id: Date.now(),
                        number: '',
                        qty: itemQtyInput,
                        item: selectedInventoryItem.name,
                        remarks: ''
                      };
                      setFormData({ ...formData, items: [...formData.items, newItem] });
                      setShowItemQtyModal(false);
                      setSelectedInventoryItem(null);
                      setItemQtyInput('');
                    }}
                  />
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowItemQtyModal(false);
                  setSelectedInventoryItem(null);
                  setItemQtyInput('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, !itemQtyInput && styles.modalSubmitButtonDisabled]}
                onPress={() => {
                  if (!itemQtyInput || parseInt(itemQtyInput) <= 0) {
                    Alert.alert('Error', 'Please enter a valid quantity');
                    return;
                  }

                  const availableQty = selectedInventoryItem.quantity || selectedInventoryItem.stock_quantity || 0;
                  const requestedQty = parseInt(itemQtyInput);

                  if (requestedQty > availableQty) {
                    Alert.alert(
                      'Insufficient Stock',
                      `Only ${availableQty} available, but you requested ${requestedQty}.`
                    );
                    return;
                  }

                  const newItem = {
                    id: Date.now(),
                    number: '',
                    qty: itemQtyInput,
                    item: selectedInventoryItem.name,
                    remarks: ''
                  };
                  setFormData({ ...formData, items: [...formData.items, newItem] });
                  setShowItemQtyModal(false);
                  setSelectedInventoryItem(null);
                  setItemQtyInput('');
                }}
                disabled={!itemQtyInput}
              >
                <Text style={styles.modalSubmitText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Dispatch Request Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Dispatch Request</Text>
              <TouchableOpacity onPress={() => { setShowEditModal(false); setEditingDispatchRequest(null); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {editingDispatchRequest && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Requester Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editingDispatchRequest.requester_name}
                    onChangeText={(text) => setEditingDispatchRequest({ ...editingDispatchRequest, requester_name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={editingDispatchRequest.category || ''}
                    onChangeText={(text) => setEditingDispatchRequest({ ...editingDispatchRequest, category: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Items</Text>
                  {editingDispatchRequest.items?.map((item: any, index: number) => (
                    <View key={index} style={styles.editItemRow}>
                      <View style={styles.editItemField}>
                        <Text style={styles.editItemLabel}>Item {index + 1}</Text>
                        <TextInput
                          style={styles.editItemInput}
                          value={item.item}
                          onChangeText={(text) => {
                            const newItems = [...editingDispatchRequest.items];
                            newItems[index].item = text;
                            setEditingDispatchRequest({ ...editingDispatchRequest, items: newItems });
                          }}
                        />
                      </View>
                      <View style={styles.editItemField}>
                        <Text style={styles.editItemLabel}>Qty</Text>
                        <TextInput
                          style={styles.editItemInput}
                          value={String(item.qty)}
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            const newItems = [...editingDispatchRequest.items];
                            newItems[index].qty = text;
                            setEditingDispatchRequest({ ...editingDispatchRequest, items: newItems });
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => { setShowEditModal(false); setEditingDispatchRequest(null); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={() => {
                  // Note: You'll need to implement an update API endpoint for this
                  Alert.alert('Info', 'Update functionality requires backend API endpoint');
                  setShowEditModal(false);
                  setEditingDispatchRequest(null);
                }}
              >
                <Text style={styles.modalSubmitText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 28,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBell: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleButtonTextActive: {
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemCountBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  readOnlyField: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
  },
  readOnlyText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  itemFormCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  removeRowButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
  },
  removeRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  removeText: {
    fontSize: 18,
  },
  tableContainer: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderTextAction: {
    width: 50,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  tableCellAction: {
    width: 80,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  addButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
    marginTop: 20,
  },
  emptyText: {
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  requestCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requestInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    width: 80,
  },
  infoValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  itemRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  itemCell: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    width: 50,
  },
  itemValue: {
    fontSize: 12,
    color: '#1e293b',
    flex: 1,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  requestActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  deleteActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  returnActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  returnActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemSelected: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1e293b',
  },
  dropdownItemTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  dropdownEmptyText: {
    padding: 14,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  itemListContainer: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  itemListScroll: {
    maxHeight: 200,
  },
  availableItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  availableItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  availableItemStock: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyItemsText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalClose: {
    padding: 8,
  },
  modalScroll: {
    padding: 20,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 10,
  },
  itemSelectorScroll: {
    maxHeight: 200,
  },
  itemSelectorItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemSelectorItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  itemSelectorItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemSelectorItemQty: {
    fontSize: 12,
    color: '#64748b',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  notificationModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationScroll: {
    maxHeight: 400,
  },
  emptyNotifications: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyNotificationsText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  notificationItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notificationItemUnread: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockAlertBadge: {
    backgroundColor: '#fef3c7',
  },
  returnItemBadge: {
    backgroundColor: '#dcfce7',
  },
  notificationTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  modalDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  modalDropdownText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  modalDropdownArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  modalDropdownOptions: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 4,
  },
  modalDropdownOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalDropdownOptionSelected: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#166534',
  },
  modalDropdownOptionText: {
    fontSize: 13,
    color: '#64748b',
  },
  modalDropdownOptionTextSelected: {
    color: '#166534',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
  },
  editItemRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  editItemField: {
    flex: 1,
  },
  editItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  editItemInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default DispatchScreen;
