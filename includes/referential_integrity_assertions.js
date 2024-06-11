/**
 * referential_integrity_assertions.js
 *
 * This file contains a function to create referential integrity assertions for specific tables in a database.
 * The assertions are used to check if the foreign key relationships are maintained between tables.
 * The conditions for referential integrity checks are defined in an object format:
 * { parentTable: [{ parentKey, childTable, childKey }, ...], ... }
 *
 * The function `createReferentialIntegrityAssertions` takes in global parameters and the referential integrity conditions.
 */

/**
 * @param {Object} globalParams - See index.js for details.
 * @param {string} filter - The condition to filter the data.
 * @param {Object} parentTable - The name of the parent table in the foreign key relationship.
 * @param {Object} parentKey - The name of the column in the parent table that is the primary key.
 * @param {Object} childTable - The name of the child table in the foreign key relationship.
 * @param {Object} childKey - The name of the column in the child table that is the foreign key.
 */

const assertions = [];

const createReferentialIntegrityAssertion = (globalParams, filter, parentTable, parentKey, childTable, childKey) => {

  const assertion = assert(`assert_referential_integrity_${parentTable}_${childTable}`)
    .database(globalParams.database)
    .schema(globalParams.schema)
    .description(`Check referential integrity for ${childTable}.${childKey} referencing ${parentTable}.${parentKey}`)
    .tags("assert-referential-integrity")
    .query(ctx => `
                WITH
                    filtering AS (
                        SELECT
                            *
                        FROM
                            ${ctx.ref(parentTable)}
                        WHERE
                            ${filter}
                    )      
                    SELECT pt.${parentKey}
                    FROM filtering AS pt
                    LEFT JOIN ${ctx.ref(childTable)} AS t ON t.${childKey} = pt.${parentKey}
                    WHERE t.${childKey} IS NULL
        `);

  (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

  (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

  assertions.push(assertion);
};

module.exports = (globalParams, config, referentialIntegrityConditions) => {
  for (let parentTable in referentialIntegrityConditions) {
    const relationships = referentialIntegrityConditions[parentTable];
    const filter = config[parentTable]?.where ?? true;

    relationships.forEach(({
      parentKey,
      childTable,
      childKey
    }) => {
      createReferentialIntegrityAssertion(globalParams, filter, parentTable, parentKey, childTable, childKey);
    })
  }
  return assertions;
};
