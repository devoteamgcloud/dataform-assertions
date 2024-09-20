/**
 * row_condition_assertions.js
 *
 * This file contains a function to create row condition assertions for specific tables in a database.
 * The assertions are used to check if the rows in each specified table meet a certain condition.
 * The conditions for row checks are defined in an object format:
 * { tableName: { conditionName: conditionQuery, ... }, ... }
 *
 * The function `createRowConditionAssertion` takes in global parameters, a table name, a condition name, and a condition query to create these assertions.
 */

/**
 * @param {Object} globalParams - See index.js for details.
 * @param {string} schemaName - The name of the schema to check for unique keys.
 * @param {string} tableName - The name of the table to check for row conditions.
 * @param {string} filter - The condition to filter the data.
 * @param {string} conditionName - The name of the condition to check.
 * @param {string} conditionQuery - The SQL query that defines the condition to check.
 */

const assertions = [];

const createRowConditionAssertion = (globalParams, schemaName, tableName, filter, conditionName, conditionQuery) => {
  const assertion = assert(`assert_${conditionName.replace(/-/g , "_")}${schemaName}_${tableName}`)
    .database(globalParams.database)
    .schema(globalParams.schema)
    .description(`Assert that rows in ${schemaName}.${tableName} meet ${conditionName}`)
    .tags("assert-row-condition")
    .query(ctx => `
                WITH
                    filtering AS (
                        SELECT
                            *
                        FROM
                            ${ctx.ref(schemaName, tableName)}
                        WHERE
                            ${filter}
                    )
                    SELECT "Condition not met: ${conditionQuery}, Table: ${ctx.ref(tableName)}" AS assertion_description
                        FROM filtering
                        WHERE NOT (${conditionQuery})
                    `);

  (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

  (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

  assertions.push(assertion);
};

module.exports = (globalParams, config, rowConditions) => {

  // Loop through rowConditions to create assertions.
  for (let schemaName in rowConditions) {
    const tableNames = rowConditions[schemaName];
    for (let tableName in tableNames) {
      for (let conditionName in tableNames[tableName]) {
        const conditionQuery = tableNames[tableName][conditionName];
        const filter = config[tableName]?.where ?? true;
        createRowConditionAssertion(
          globalParams,
          schemaName,
          tableName,
          filter,
          conditionName,
          conditionQuery
        );
      }
    }
  }
  return assertions;
}
