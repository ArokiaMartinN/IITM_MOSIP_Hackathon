import { pool } from '../config/database.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateVC = async (req, res) => {
  try {
    console.log('=== generateVC called ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const { inspectionId } = req.body;
    const issuerId = req.user.id;

    if (!inspectionId) {
      console.error('Missing inspectionId');
      return res.status(400).json({ error: 'Inspection ID required' });
    }

    // Fetch inspection and batch details
    const inspectionResult = await pool.query(
      `SELECT i.*, b.product_type, b.quantity, b.location, b.destination
       FROM inspections i
       JOIN batches b ON i.batch_id = b.id
       WHERE i.id = $1`,
      [inspectionId]
    );

    if (inspectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const inspection = inspectionResult.rows[0];

    // Only completed inspections can issue credentials
    if (inspection.status !== 'completed') {
      return res.status(400).json({ error: 'Inspection must be completed before issuing a credential' });
    }

    // Enforce issuer is the assigned QA agency (unless admin or qa_agency role)
    const isAdmin = req.user.role === 'admin';
    const isQA = req.user.role === 'qa_agency';
    // For now, allow any QA agency or admin to issue; can be tightened later
    if (!isAdmin && !isQA) {
      return res.status(403).json({ error: 'Only QA agency or admin can issue credentials' });
    }
    if (!isAdmin && isQA && Number(inspection.qa_agency_id) !== Number(req.user.id)) {
      console.log('QA mismatch:', { inspection_qa_id: inspection.qa_agency_id, user_id: req.user.id });
      // Allow for now to debug; can enforce later
    }

    // Prevent duplicate credentials for the same inspection
    const existingVC = await pool.query(
      'SELECT id FROM verifiable_credentials WHERE inspection_id = $1',
      [inspectionId]
    );

    if (existingVC.rows.length > 0) {
      return res.status(400).json({ error: 'Credential already exists for this inspection', credentialId: existingVC.rows[0].id });
    }

    const issuanceDate = new Date();
    const ttlDays = Number(process.env.VC_TTL_DAYS || 180);
    const expirationDate = new Date(issuanceDate.getTime() + ttlDays * 24 * 60 * 60 * 1000);

    // Create VC payload (W3C Verifiable Credential format)
    const vcPayload = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', 'AgriculturalProductCredential'],
      issuer: `did:example:issuer-${issuerId}`,
      issuanceDate: issuanceDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      credentialSubject: {
        productType: inspection.product_type,
        quantity: inspection.quantity,
        location: inspection.location,
        destination: inspection.destination,
        moistureLevel: inspection.moisture_level,
        pesticideContent: inspection.pesticide_content,
        organicStatus: inspection.organic_status,
        isoCodes: inspection.iso_codes,
        batchId: inspection.batch_id,
        inspectionId: inspection.id
      }
    };

    // Attach a simple integrity proof (hash of payload + secret)
    const signingSecret = process.env.VC_SIGNING_SECRET || 'vc-signing-secret';
    const proofValue = crypto
      .createHash('sha256')
      .update(JSON.stringify(vcPayload) + signingSecret)
      .digest('hex');

    vcPayload.proof = {
      type: 'DataIntegrityProof',
      created: issuanceDate.toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `did:example:issuer-${issuerId}#key-1`,
      proofValue
    };

    // Store VC in database
    console.log('Storing VC for inspection:', inspectionId);
    const vcResult = await pool.query(
      `INSERT INTO verifiable_credentials (inspection_id, issuer_id, vc_payload, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [inspectionId, issuerId, JSON.stringify(vcPayload), 'issued']
    );

    const credentialId = vcResult.rows[0].id;
    console.log('VC stored with ID:', credentialId);

    // Update batch status
    await pool.query('UPDATE batches SET status = $1 WHERE id = $2', ['certified', inspection.batch_id]);

    res.status(201).json({
      message: 'Verifiable Credential generated successfully',
      credential: {
        id: credentialId,
        credentialId: credentialId,
        issuer: `did:example:issuer-${issuerId}`,
        issuanceDate: issuanceDate.toISOString(),
        expirationDate: vcPayload.expirationDate
      },
      success: true
    });
  } catch (error) {
    console.error('Generate VC error:', error);
    res.status(500).json({ error: 'Failed to generate VC', message: error.message });
  }
};

export const getVC = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM verifiable_credentials WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const credential = result.rows[0];
    const vcPayload = JSON.parse(credential.vc_payload);

    res.json({
      credential: {
        id: credential.id,
        ...vcPayload
      }
    });
  } catch (error) {
    console.error('Get VC error:', error);
    res.status(500).json({ error: 'Failed to fetch VC', message: error.message });
  }
};

export const verifyVC = async (req, res) => {
  try {
    const credentialId = req.body?.credentialId || req.params?.id || req.query?.credentialId;

    if (!credentialId) {
      return res.status(400).json({ error: 'Credential ID required', isValid: false });
    }

    const result = await pool.query(
      `SELECT vc.*, i.status AS inspection_status, i.batch_id, b.status AS batch_status
       FROM verifiable_credentials vc
       JOIN inspections i ON vc.inspection_id = i.id
       JOIN batches b ON i.batch_id = b.id
       WHERE vc.id = $1`,
      [credentialId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found', isValid: false });
    }

    const credential = result.rows[0];
    const vcPayload = JSON.parse(credential.vc_payload);

    // Check status gates
    if (credential.status !== 'issued') {
      return res.status(400).json({ error: 'Credential is not in an issuable state', isValid: false });
    }

    if (credential.inspection_status !== 'completed') {
      return res.status(400).json({ error: 'Associated inspection is not completed', isValid: false });
    }

    if (credential.batch_status !== 'certified') {
      return res.status(400).json({ error: 'Batch is not certified', isValid: false });
    }

    // Expiry check
    const now = new Date();
    const expired = vcPayload.expirationDate ? new Date(vcPayload.expirationDate) <= now : false;
    if (expired) {
      return res.status(400).json({ error: 'Credential is expired', isValid: false });
    }

    // Proof integrity check
    const signingSecret = process.env.VC_SIGNING_SECRET || 'vc-signing-secret';
    const expectedProof = crypto
      .createHash('sha256')
      .update(JSON.stringify({ ...vcPayload, proof: undefined }) + signingSecret)
      .digest('hex');

    const proofValue = vcPayload?.proof?.proofValue;
    if (!proofValue || proofValue !== expectedProof) {
      return res.status(400).json({ error: 'Credential integrity check failed', isValid: false });
    }

    res.json({
      isValid: true,
      credentialId: credential.id,
      issuer: vcPayload.issuer,
      issuanceDate: vcPayload.issuanceDate,
      expirationDate: vcPayload.expirationDate,
      batchId: credential.batch_id,
      message: 'Credential is valid'
    });
  } catch (error) {
    console.error('Verify VC error:', error);
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
};

export const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM verifiable_credentials WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Create QR code data URL
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${id}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.json({
      message: 'QR code generated successfully',
      qrCode,
      credentialId: id
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code', message: error.message });
  }
};
