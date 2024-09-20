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
 * @param {Object} parentSchema -
 * @param {Object} parentTable - The name of the parent table in the foreign key relationship.
 * @param {Object} parentKey - The name of the column in the parent table that is the primary key.
 * @param {string} parentFilter - The condition to filter the data of parent table.
 * @param {Object} childSchema -
 * @param {Object} childTable - The name of the child table in the foreign key relationship.
 * @param {Object} childKey - The name of the column in the child table that is the foreign key.
 * @param {string} childFilter - The condition to filter the data of child table.
 */

const assertions = [];

const createReferentialIntegrityAssertion = (globalParams, parentSchema, parentTable, parentKey, parentFilter, childSchema, childTable, childKey, childFilter) => {

  const assertion = assert(`assert_referential_integrity_${parentSchema}_${parentTable}_${childSchema}_${childTable}`)
    .database(globalParams.database)
    .schema(globalParams.schema)
    .description(`Check referential integrity for ${childTable}.${childKey} referencing ${parentTable}.${parentKey}`)
    .tags("assert-referential-integrity")
    .query(ctx => `
                WITH
                    parent_filtering AS (
                        SELECT
                            *
                        FROM
                            ${ctx.ref(parentSchema, parentTable)}
                        WHERE
                            ${parentFilter}
                    ),

                    child_filtering AS (
                        SELECT
                            *
                        FROM
                            ${ctx.ref(childSchema, childTable)}
                        WHERE
                            ${childFilter}
                    )

                    SELECT pt.${parentKey}
                    FROM parent_filtering AS pt
                    LEFT JOIN child_filtering AS t ON t.${childKey} = pt.${parentKey}
                    WHERE t.${childKey} IS NULL
        `);

  (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

  (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

  assertions.push(assertion);
};

module.exports = (globalParams, config, referentialIntegrityConditions) => {
  for (let parentSchema in referentialIntegrityConditions) {
    const parentTables = referentialIntegrityConditions[parentSchema];
    for (let parentTable in parentTables) {
      const relationships = parentTables[parentTable];
      const parentFilter = config[parentTable]?.where ?? true;

      relationships.forEach(({
        parentKey,
        childSchema,
        childTable,
        childKey
      }) => {
        const childFilter = config[childTable]?.where ?? true;
        createReferentialIntegrityAssertion(
          globalParams,
          parentSchema,
          parentTable,
          parentKey,
          parentFilter,
          childSchema,
          childTable,
          childKey,
          childFilter
        );
      })
    }
  };
  return assertions;
};
