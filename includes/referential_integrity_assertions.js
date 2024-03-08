/**
 * referential_integrity_assertions.js
 *
 * This file contains a function to create referential integrity assertions for specific tables in a database.
 * The assertions are used to check if the foreign key relationships are maintained between tables.
 * The conditions for referential integrity checks are defined in an object format:
 * { parentTableName: [{ parentKey, childTableName, childKey }, ...], ... }
 *
 * The function `createReferentialIntegrityAssertions` takes in global parameters and the referential integrity conditions.
 */

/**
 * @param {Object} globalParams - See index.js for details.
 * @param {Object} parentTableName - The name of the parent table in the foreign key relationship.
 * @param {Object} parentKey - The name of the column in the parent table that is the primary key.
 * @param {Object} childTableName - The name of the child table in the foreign key relationship.
 * @param {Object} childKey - The name of the column in the child table that is the foreign key.
 */

const assertions = [];

const createReferentialIntegrityAssertion = (globalParams, parentTableName, parentKey, childTableName, childKey) => {

  const assertion = assert(`assert_referential_integrity_${parentTableName}_${childTableName}`)
    .database(globalParams.database)
    .schema(globalParams.schema)
    .description(`Check referential integrity for ${childTableName}.${childKey} referencing ${parentTableName}.${parentKey}`)
    .tags("assert-referential-integrity")
    .query(ctx => `
          SELECT pt.${parentKey}
          FROM ${ctx.ref(parentTableName)} AS pt
          LEFT JOIN ${ctx.ref(childTableName)} AS t ON t.${childKey} = pt.${parentKey}
          WHERE t.${childKey} IS NULL
        `);

  (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

  (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

  assertions.push(assertion);
};

module.exports = (globalParams, referentialIntegrityConditions) => {
  for (let parentTableName in referentialIntegrityConditions) {
    const relationships = referentialIntegrityConditions[parentTableName];

    relationships.forEach(({
      parentKey,
      childTableName,
      childKey
    }) => {
      createReferentialIntegrityAssertion(globalParams, parentTableName, parentKey, childTableName, childKey);
    })
  }
  return assertions;
};
