import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { createIncident, getIncidents, verifyIncident } from '../api/incidents';
import { Incident } from '../types';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return '#ef4444';
    case 'pending': return '#f59e0b';
    case 'resolved': return '#22c55e';
    case 'cancelled': return '#6b7280';
    default: return '#6b7280';
  }
};

const IncidentsScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'verification' | 'map' | 'form' | 'list'>('verification');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState({
    callerName: '',
    patientLocation: '',
    callerNumber: '',
    patientName: '',
  });

  const [formData, setFormData] = useState({
    // Patient Information
    patientName: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contactNumber: '',
    civilStatus: [] as string[],
    address: '',

    // Incident Information
    date: '',
    callerNumber: '',
    dispatchTime: '',
    enRouteTime: '',
    onSceneTime: '',
    transportTime: '',
    arrivedHF: '',
    departedHF: '',
    natureOfCall: '',

    // Assessment
    assessment: [] as string[],

    // Vital Signs
    vitalSigns: {
      take1: { time: '', o2Sat: '', prHr: '', rr: '', bp: '', temp: '' },
      take2: { time: '', o2Sat: '', prHr: '', rr: '', bp: '', temp: '' },
      take3: { time: '', o2Sat: '', prHr: '', rr: '', bp: '', temp: '' },
    },

    // Glasgow Coma Scale
    gcsEye: '',
    gcsVerbal: '',
    gcsMotor: '',
    gcsTotal: '',

    // Other sections
    disposition: '',
    responders: '',
    receivedBy: '',
    transportedTo: '',
    specialInstructions: '',
  });

  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Child', 'Separated'];
  const assessmentOptions = [
    'Abrasion', 'Contusion', 'Laceration', 'Amputation', 'Avulsion',
    'Fractured', 'Punctured', 'Hematoma', 'Swelling', 'Burns',
    'Incision', 'Tenderness'
  ];
  const natureOfCallOptions = ['Emergency', 'Transport', 'Standby', 'Non-Emergency', 'Medical Assistance'];

  const fetchIncidents = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await getIncidents();
      setIncidents(response?.data?.data ?? []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load incidents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchIncidents();
    }
  }, [viewMode, fetchIncidents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents(true);
  }, [fetchIncidents]);

  const handleSubmitVerification = async () => {
    if (!verificationData.callerName || !verificationData.patientLocation || !verificationData.callerNumber || !verificationData.patientName) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      // Create a new incident with verification data
      await createIncident({
        title: verificationData.callerName,
        age: '',
        gender: 'Male',
        civil_status: '',
        contact_number: verificationData.callerNumber,
        location_name: verificationData.patientLocation,
        type: 'General',
        status: 'active',
        severity: 'medium',
        call_information: '',
        received_by: 'Mobile User',
        description: '',
      });
      
      // Populate form with verification data
      setFormData({
        ...formData,
        patientName: verificationData.patientName || verificationData.callerName,
        address: verificationData.patientLocation,
        contactNumber: verificationData.callerNumber,
      });
      
      Alert.alert('Success', 'Incident verified successfully');
      setViewMode('map');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to verify incident';
      Alert.alert('Error', errorMessage);
    }
  };

  const toggleCivilStatus = (status: string) => {
    setFormData(prev => ({
      ...prev,
      civilStatus: prev.civilStatus.includes(status)
        ? prev.civilStatus.filter(s => s !== status)
        : [...prev.civilStatus, status]
    }));
  };

  const toggleAssessment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      assessment: prev.assessment.includes(item)
        ? prev.assessment.filter(a => a !== item)
        : [...prev.assessment, item]
    }));
  };

  const updateVitalSign = (take: 'take1' | 'take2' | 'take3', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [take]: { ...prev.vitalSigns[take], [field]: value }
      }
    }));
  };

  const calculateGCSTotal = () => {
    const eye = parseInt(formData.gcsEye) || 0;
    const verbal = parseInt(formData.gcsVerbal) || 0;
    const motor = parseInt(formData.gcsMotor) || 0;
    setFormData(prev => ({ ...prev, gcsTotal: (eye + verbal + motor).toString() }));
  };

  const handleClearForm = () => {
    setFormData({
      patientName: '',
      age: '',
      gender: 'Male',
      contactNumber: '',
      civilStatus: [],
      address: '',
      date: '',
      callerNumber: '',
      dispatchTime: '',
      enRouteTime: '',
      onSceneTime: '',
      transportTime: '',
      arrivedHF: '',
      departedHF: '',
      natureOfCall: '',
      assessment: [],
      vitalSigns: {
        take1: { time: '', o2Sat: '', prHr: '', rr: '', bp: '', temp: '' },
        take2: { time: '', o2Sat: '', prHr: '', rr: '', bp: '', temp: '' },
        take3: { time: '', o2Sat: '', prHr: '', rr: '', bp: '', temp: '' },
      },
      gcsEye: '',
      gcsVerbal: '',
      gcsMotor: '',
      gcsTotal: '',
      disposition: '',
      responders: '',
      receivedBy: '',
      transportedTo: '',
      specialInstructions: '',
    });
  };

  const handleSaveRecord = async () => {
    if (!formData.patientName) {
      Alert.alert('Error', 'Patient name is required');
      return;
    }

    setSubmitting(true);

    try {
      await createIncident({
        title: formData.patientName,
        age: formData.age,
        gender: formData.gender,
        civil_status: Array.isArray(formData.civilStatus) ? formData.civilStatus.join(', ') : formData.civilStatus,
        contact_number: formData.contactNumber,
        location_name: formData.address || 'Unknown',
        type: formData.natureOfCall || 'General',
        status: 'active',
        severity: 'medium',
        call_information: formData.specialInstructions || '',
        received_by: 'Mobile User',
        description: formData.specialInstructions || '',
      });

      handleClearForm();
      await fetchIncidents();
      setViewMode('list');
      Alert.alert('Success', 'Patient Care Record saved successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save record';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {viewMode !== 'verification' && viewMode !== 'map' && (
            <TouchableOpacity onPress={() => setViewMode('list')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <View style={[styles.logoPlaceholder, (viewMode === 'form' || viewMode === 'verification' || viewMode === 'map') && styles.logoPlaceholderCentered]}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerOrg}>Local Disaster Risk Reduction Management Office</Text>
            <Text style={styles.headerTitle}>
              {viewMode === 'form' ? 'PATIENT CARE RECORD' : viewMode === 'verification' ? 'INCIDENT VERIFICATION' : viewMode === 'map' ? 'INCIDENT MAP' : 'INCIDENTS OVERVIEW'}
            </Text>
          </View>
          <View style={[styles.logoPlaceholder, (viewMode === 'form' || viewMode === 'verification' || viewMode === 'map') && styles.logoPlaceholderCentered]}>
            <Text style={styles.logoText}>🚑</Text>
            <Text style={styles.logoSubtext}>POL RESCUE</Text>
          </View>
          {(viewMode === 'form' || viewMode === 'verification' || viewMode === 'map') && <View style={styles.spacer} />}
        </View>
        <Text style={styles.revision}>Rev. 2 / 2026</Text>
      </View>

      {viewMode === 'list' ? (
        <>
          <ScrollView
            style={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.listContainer}>
              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color="#1e40af" />
                  <Text style={{ marginTop: 10 }}>Loading incidents...</Text>
                </View>
              ) : incidents.length === 0 ? (
                <View style={styles.center}>
                  <Text style={{ color: '#6b7280' }}>No incidents found</Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => setViewMode('verification')}
                  >
                    <Text style={styles.emptyBtnText}>Create New Record</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                incidents.map((incident) => (
                  <View key={incident.id} style={styles.incidentCard}>
                    <View style={styles.incidentCardHeader}>
                      <Text style={styles.incidentTitle}>{incident.location}</Text>
                      <View style={styles.headerBadges}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
                            {incident.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.incidentType}>{incident.type}</Text>
                    <Text style={styles.incidentDate}>{incident.created_at}</Text>
                    {incident.call_information && (
                      <Text style={styles.incidentNotes} numberOfLines={2}>
                        Notes: {incident.call_information}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setViewMode('verification')}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </>
      ) : viewMode === 'verification' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incident Verification</Text>

            <Text style={styles.label}>Name of Caller</Text>
            <TextInput
              style={styles.input}
              value={verificationData.callerName}
              onChangeText={(v) => setVerificationData({ ...verificationData, callerName: v })}
              placeholder="Enter caller name"
            />

            <Text style={styles.label}>Caller Number</Text>
            <TextInput
              style={styles.input}
              value={verificationData.callerNumber}
              onChangeText={(v) => setVerificationData({ ...verificationData, callerNumber: v })}
              placeholder="Enter caller number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Name of Patient</Text>
            <TextInput
              style={styles.input}
              value={verificationData.patientName}
              onChangeText={(v) => setVerificationData({ ...verificationData, patientName: v })}
              placeholder="Enter patient name"
            />

            <Text style={styles.label}>Location of Patient</Text>
            <TextInput
              style={styles.input}
              value={verificationData.patientLocation}
              onChangeText={(v) => setVerificationData({ ...verificationData, patientLocation: v })}
              placeholder="Enter patient location"
            />

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.footerBtn, styles.clearBtn]}
                onPress={() => setViewMode('list')}
              >
                <Text style={styles.clearBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerBtn, styles.saveBtn]}
                onPress={handleSubmitVerification}
              >
                <Text style={styles.saveBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : viewMode === 'map' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incident Location</Text>

            <View style={styles.mapContainer}>
              {Platform.OS === 'web' ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=120.97,14.59,120.99,14.61&layer=mapnik&marker=14.5995,120.9842`}
                  style={{ borderRadius: 12 }}
                />
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>Map not available in Expo Go</Text>
                  <Text style={styles.mapPlaceholderSubtext}>Location: {formData.address || 'No address specified'}</Text>
                </View>
              )}
            </View>

            <Text style={styles.label}>Confirm Location</Text>
            <Text style={styles.locationText}>
              {formData.address || 'No address specified'}
            </Text>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.footerBtn, styles.clearBtn]}
                onPress={() => setViewMode('verification')}
              >
                <Text style={styles.clearBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerBtn, styles.saveBtn]}
                onPress={() => setViewMode('form')}
              >
                <Text style={styles.saveBtnText}>Continue to Patient Care</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Patient Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Name of Patient</Text>
              <TextInput
                style={styles.input}
                value={formData.patientName}
                onChangeText={(v) => setFormData({ ...formData, patientName: v })}
                placeholder="Enter patient name"
              />
            </View>
            <View style={styles.quarterField}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(v) => setFormData({ ...formData, age: v })}
                placeholder="Age"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female', 'Other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[styles.radioBtn, formData.gender === gender && styles.radioBtnActive]}
                onPress={() => setFormData({ ...formData, gender: gender as any })}
              >
                <View style={[styles.radioCircle, formData.gender === gender && styles.radioCircleActive]} />
                <Text style={[styles.radioText, formData.gender === gender && styles.radioTextActive]}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Contact #</Text>
              <TextInput
                style={styles.input}
                value={formData.contactNumber}
                onChangeText={(v) => setFormData({ ...formData, contactNumber: v })}
                placeholder="Contact number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Civil Status</Text>
          <View style={styles.checkboxGroup}>
            {civilStatusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.checkboxBtn, formData.civilStatus.includes(status) && styles.checkboxBtnActive]}
                onPress={() => toggleCivilStatus(status)}
              >
                <View style={[styles.checkboxSquare, formData.civilStatus.includes(status) && styles.checkboxSquareActive]}>
                  {formData.civilStatus.includes(status) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(v) => setFormData({ ...formData, address: v })}
            placeholder="Enter address"
            multiline
          />
        </View>

        {/* Incident Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Information</Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(v) => setFormData({ ...formData, date: v })}
                placeholder="mm/dd/yyyy"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Caller #</Text>
              <TextInput
                style={styles.input}
                value={formData.callerNumber}
                onChangeText={(v) => setFormData({ ...formData, callerNumber: v })}
                placeholder="Caller number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Time Records</Text>
          <View style={styles.timeGrid}>
            {[
              { key: 'dispatchTime', label: 'Dispatch Time' },
              { key: 'enRouteTime', label: 'En Route Time' },
              { key: 'onSceneTime', label: 'On Scene Time' },
              { key: 'transportTime', label: 'Transport Time' },
              { key: 'arrivedHF', label: 'Arrived HF' },
              { key: 'departedHF', label: 'Departed HF' },
            ].map((field) => (
              <View key={field.key} style={styles.timeField}>
                <Text style={styles.timeLabel}>{field.label}</Text>
                <TextInput
                  style={styles.timeInput}
                  value={(formData as any)[field.key]}
                  onChangeText={(v) => setFormData({ ...formData, [field.key]: v })}
                  placeholder="--:--"
                />
              </View>
            ))}
          </View>

          <Text style={styles.label}>Nature of Call</Text>
          <View style={styles.natureGrid}>
            {natureOfCallOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.natureBtn, formData.natureOfCall === option && styles.natureBtnActive]}
                onPress={() => setFormData({ ...formData, natureOfCall: option })}
              >
                <Text style={styles.natureIcon}>📞</Text>
                <Text style={[styles.natureText, formData.natureOfCall === option && styles.natureTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assessment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment</Text>
          <View style={styles.assessmentGrid}>
            {assessmentOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.assessmentBtn, formData.assessment.includes(item) && styles.assessmentBtnActive]}
                onPress={() => toggleAssessment(item)}
              >
                <View style={[styles.assessmentCheck, formData.assessment.includes(item) && styles.assessmentCheckActive]}>
                  {formData.assessment.includes(item) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.assessmentText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Vital Signs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>
          <View style={styles.vitalSignsTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Parameter</Text>
              <Text style={styles.tableHeaderCell}>1ST TAKE</Text>
              <Text style={styles.tableHeaderCell}>2ND TAKE</Text>
              <Text style={styles.tableHeaderCell}>3RD TAKE</Text>
            </View>
            {[
              { key: 'time', label: 'TIME' },
              { key: 'o2Sat', label: 'O2 SAT (%)' },
              { key: 'prHr', label: 'PR/HR (bpm)' },
              { key: 'rr', label: 'RR (breaths/min)' },
              { key: 'bp', label: 'BP (mmHg)' },
              { key: 'temp', label: 'TEMP (°C)' },
            ].map((row) => (
              <View key={row.key} style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>{row.label}</Text>
                <TextInput
                  style={styles.tableCellInput}
                  value={formData.vitalSigns.take1[row.key as keyof typeof formData.vitalSigns.take1]}
                  onChangeText={(v) => updateVitalSign('take1', row.key, v)}
                  placeholder="--"
                />
                <TextInput
                  style={styles.tableCellInput}
                  value={formData.vitalSigns.take2[row.key as keyof typeof formData.vitalSigns.take2]}
                  onChangeText={(v) => updateVitalSign('take2', row.key, v)}
                  placeholder="--"
                />
                <TextInput
                  style={styles.tableCellInput}
                  value={formData.vitalSigns.take3[row.key as keyof typeof formData.vitalSigns.take3]}
                  onChangeText={(v) => updateVitalSign('take3', row.key, v)}
                  placeholder="--"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Glasgow Coma Scale Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glasgow Coma Scale</Text>
          <View style={styles.gcsContainer}>
            <View style={styles.gcsField}>
              <Text style={styles.gcsLabel}>Best eye response (E)</Text>
              <TextInput
                style={styles.gcsInput}
                value={formData.gcsEye}
                onChangeText={(v) => { setFormData({ ...formData, gcsEye: v }); calculateGCSTotal(); }}
                placeholder="Select"
              />
            </View>
            <View style={styles.gcsField}>
              <Text style={styles.gcsLabel}>Best verbal response (V)</Text>
              <TextInput
                style={styles.gcsInput}
                value={formData.gcsVerbal}
                onChangeText={(v) => { setFormData({ ...formData, gcsVerbal: v }); calculateGCSTotal(); }}
                placeholder="Select"
              />
            </View>
            <View style={styles.gcsField}>
              <Text style={styles.gcsLabel}>Best motor response (M)</Text>
              <TextInput
                style={styles.gcsInput}
                value={formData.gcsMotor}
                onChangeText={(v) => { setFormData({ ...formData, gcsMotor: v }); calculateGCSTotal(); }}
                placeholder="Select"
              />
            </View>
            <View style={styles.gcsTotal}>
              <Text style={styles.gcsTotalLabel}>TOTAL (3-15)</Text>
              <TextInput
                style={[styles.gcsInput, styles.gcsTotalInput]}
                value={formData.gcsTotal}
                editable={false}
              />
            </View>
            <TouchableOpacity style={styles.gcsLink}>
              <Text style={styles.gcsLinkText}>View Scale Guide</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Disposition Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Disposition</Text>
          <TextInput
            style={styles.input}
            value={formData.disposition}
            onChangeText={(v) => setFormData({ ...formData, disposition: v })}
            placeholder="Select disposition"
          />
        </View>

        {/* Responders Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Responders</Text>
          <TextInput
            style={styles.input}
            value={formData.responders}
            onChangeText={(v) => setFormData({ ...formData, responders: v })}
            placeholder="Enter responder names"
          />
        </View>

        {/* Received By Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Received By</Text>
          <TextInput
            style={styles.input}
            value={formData.receivedBy}
            onChangeText={(v) => setFormData({ ...formData, receivedBy: v })}
            placeholder="Enter name"
          />
        </View>

        {/* Transported To Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Transported To</Text>
          <TextInput
            style={styles.input}
            value={formData.transportedTo}
            onChangeText={(v) => setFormData({ ...formData, transportedTo: v })}
            placeholder="Enter hospital/facility name"
          />
        </View>

        {/* Special Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Special Instructions / Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.specialInstructions}
            onChangeText={(v) => setFormData({ ...formData, specialInstructions: v })}
            placeholder="Enter any special instructions or additional notes..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.clearBtn]}
            onPress={handleClearForm}
          >
            <Text style={styles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, styles.saveBtn]}
            onPress={handleSaveRecord}
            disabled={submitting}
          >
            <Text style={styles.saveBtnText}>{submitting ? 'Saving...' : 'Save Record'} ✓</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 16,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderCentered: {
    width: 40,
    height: 40,
  },
  spacer: {
    width: 50,
  },
  logoText: {
    fontSize: 28,
  },
  logoSubtext: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: -5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerOrg: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  revision: {
    color: '#93c5fd',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  quarterField: {
    flex: 0.4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  radioBtnActive: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9ca3af',
  },
  radioCircleActive: {
    borderColor: '#1e40af',
    backgroundColor: '#1e40af',
  },
  radioText: {
    fontSize: 12,
    color: '#6b7280',
  },
  radioTextActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  checkboxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  checkboxBtnActive: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  checkboxSquare: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    borderColor: '#1e40af',
    backgroundColor: '#1e40af',
  },
  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 11,
    color: '#374151',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  timeField: {
    width: '48%',
  },
  timeLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  natureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  natureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  natureBtnActive: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  natureIcon: {
    fontSize: 16,
  },
  natureText: {
    fontSize: 11,
    color: '#6b7280',
  },
  natureTextActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assessmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  assessmentBtnActive: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  assessmentCheck: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessmentCheckActive: {
    borderColor: '#1e40af',
    backgroundColor: '#1e40af',
  },
  assessmentText: {
    fontSize: 11,
    color: '#374151',
  },
  vitalSignsTable: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCellLabel: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#f9fafb',
  },
  tableCellInput: {
    flex: 1,
    padding: 6,
    fontSize: 11,
    textAlign: 'center',
    borderWidth: 0,
    backgroundColor: '#fff',
  },
  gcsContainer: {
    gap: 12,
  },
  gcsField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gcsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  gcsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  gcsTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 6,
  },
  gcsTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  gcsTotalInput: {
    backgroundColor: '#1e40af',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gcsLink: {
    alignSelf: 'flex-start',
  },
  gcsLinkText: {
    fontSize: 11,
    color: '#1e40af',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  clearBtnText: {
    color: '#1e40af',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#1e40af',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomSpacing: {
    height: 20,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
  },
  toggleBtnText: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#1e40af',
  },
  listContainer: {
    padding: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyBtn: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  incidentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  incidentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifiedBy: {
    fontSize: 10,
    color: '#22c55e',
    marginTop: 2,
    fontStyle: 'italic',
  },
  incidentType: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  incidentDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  incidentNotes: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 32,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapPlaceholderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationText: {
    fontSize: 16,
    color: '#374151',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default IncidentsScreen;