/**
 * Persistence Validator
 * Utilities to verify that data operations are immediately persisted to the database
 */

/**
 * Verify that a record exists in the database after creation
 * @param {Object} Model - Sequelize model
 * @param {number} id - Record ID
 * @param {Object} transaction - Optional transaction
 * @returns {Promise<boolean>} True if record exists
 */
async function verifyRecordExists(Model, id, transaction = null) {
  try {
    const record = await Model.findByPk(id, { transaction });
    return record !== null;
  } catch (error) {
    console.error('Error verifying record existence:', error);
    return false;
  }
}

/**
 * Verify that a record has been updated with expected values
 * @param {Object} Model - Sequelize model
 * @param {number} id - Record ID
 * @param {Object} expectedValues - Object with field names and expected values
 * @param {Object} transaction - Optional transaction
 * @returns {Promise<boolean>} True if all expected values match
 */
async function verifyRecordUpdate(Model, id, expectedValues, transaction = null) {
  try {
    const record = await Model.findByPk(id, { transaction });
    
    if (!record) {
      return false;
    }

    // Check each expected value
    for (const [field, expectedValue] of Object.entries(expectedValues)) {
      if (record[field] !== expectedValue) {
        console.warn(`Field ${field} mismatch: expected ${expectedValue}, got ${record[field]}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error verifying record update:', error);
    return false;
  }
}

/**
 * Verify that a record has been deleted
 * @param {Object} Model - Sequelize model
 * @param {number} id - Record ID
 * @param {Object} transaction - Optional transaction
 * @returns {Promise<boolean>} True if record does not exist
 */
async function verifyRecordDeleted(Model, id, transaction = null) {
  try {
    const record = await Model.findByPk(id, { transaction });
    return record === null;
  } catch (error) {
    console.error('Error verifying record deletion:', error);
    return false;
  }
}

/**
 * Verify that related records are properly created
 * @param {Object} Model - Sequelize model
 * @param {Object} whereClause - Where clause to find related records
 * @param {number} expectedCount - Expected number of related records
 * @param {Object} transaction - Optional transaction
 * @returns {Promise<boolean>} True if count matches
 */
async function verifyRelatedRecords(Model, whereClause, expectedCount, transaction = null) {
  try {
    const count = await Model.count({
      where: whereClause,
      transaction
    });
    
    if (count !== expectedCount) {
      console.warn(`Related records count mismatch: expected ${expectedCount}, got ${count}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying related records:', error);
    return false;
  }
}

/**
 * Verify data integrity after a complex operation
 * This is a helper that can be used to verify multiple conditions
 * @param {Array<Function>} verificationFunctions - Array of async verification functions
 * @returns {Promise<boolean>} True if all verifications pass
 */
async function verifyDataIntegrity(verificationFunctions) {
  try {
    const results = await Promise.all(
      verificationFunctions.map(fn => fn().catch(() => false))
    );
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error verifying data integrity:', error);
    return false;
  }
}

module.exports = {
  verifyRecordExists,
  verifyRecordUpdate,
  verifyRecordDeleted,
  verifyRelatedRecords,
  verifyDataIntegrity
};
