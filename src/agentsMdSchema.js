/**
 * Compact schema validation for set summaries and agent entries
 * Schema validation without external dependencies
 */

/**
 * Validates a set summary object
 * @param {Object} setSummary - The set summary to validate
 * @param {string} setSummary.setId - Unique identifier for the set
 * @param {string} setSummary.name - Human-readable name
 * @param {number} setSummary.agentCount - Number of agents in the set
 * @param {string} setSummary.description - Description of the set
 * @throws {Error} If validation fails
 */
function validateSetSummary(setSummary) {
  if (!setSummary || typeof setSummary !== 'object') {
    throw new Error('Set summary must be an object');
  }

  if (typeof setSummary.setId !== 'string' || setSummary.setId.length === 0) {
    throw new Error('setId must be a non-empty string');
  }

  if (typeof setSummary.name !== 'string' || setSummary.name.length === 0) {
    throw new Error('name must be a non-empty string');
  }

  if (typeof setSummary.agentCount !== 'number' || !Number.isInteger(setSummary.agentCount) || setSummary.agentCount < 0) {
    throw new Error('agentCount must be a non-negative integer');
  }

  if (typeof setSummary.description !== 'string' || setSummary.description.length === 0) {
    throw new Error('description must be a non-empty string');
  }
}

/**
 * Validates an agent entry object
 * @param {Object} agentEntry - The agent entry to validate
 * @param {string} agentEntry.agentName - Unique identifier for the agent
 * @param {string} agentEntry.role - Role of the agent
 * @param {string[]} agentEntry.capabilities - Array of capabilities
 * @param {string} agentEntry.version - Version string
 * @throws {Error} If validation fails
 */
function validateAgentEntry(agentEntry) {
  if (!agentEntry || typeof agentEntry !== 'object') {
    throw new Error('Agent entry must be an object');
  }

  if (typeof agentEntry.agentName !== 'string' || agentEntry.agentName.length === 0) {
    throw new Error('agentName must be a non-empty string');
  }

  if (typeof agentEntry.role !== 'string' || agentEntry.role.length === 0) {
    throw new Error('role must be a non-empty string');
  }

  if (!Array.isArray(agentEntry.capabilities) || agentEntry.capabilities.length === 0) {
    throw new Error('capabilities must be a non-empty array');
  }

  if (!agentEntry.capabilities.every(cap => typeof cap === 'string' && cap.length > 0)) {
    throw new Error('All capabilities must be non-empty strings');
  }

  if (typeof agentEntry.version !== 'string' || agentEntry.version.length === 0) {
    throw new Error('version must be a non-empty string');
  }
}

module.exports = {
  validateSetSummary,
  validateAgentEntry
};