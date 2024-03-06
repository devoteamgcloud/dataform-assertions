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
 * @param {string} tableName - The name of the table to check for row conditions.
 * @param {string} conditionName - The name of the condition to check.
 * @param {string} conditionQuery - The SQL query that defines the condition to check.
 */

const assertions = [];

const createRowConditionAssertion = (globalParams, tableName, conditionName, conditionQuery) => {
  const assertion = assert(`assert_${conditionName}_${tableName}`)
    .database(globalParams.database)
    .schema(globalParams.schema)
    .description(`Assert that rows in ${tableName} meet ${conditionName}`)
    .tags("assert-row-condition")
    .query(ctx => `SELECT "Condition not met: ${conditionQuery}, Table: ${ctx.ref(tableName)}" AS assertion_description
                       FROM ${ctx.ref(tableName)}
                       WHERE NOT (${conditionQuery})`);

  (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

  (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

  assertions.push(assertion);
};

module.exports = (globalParams, rowConditions) => {

  // Loop through rowConditions to create assertions.
  for (let tableName in rowConditions) {
    for (let conditionName in rowConditions[tableName]) {
      const conditionQuery = rowConditions[tableName][conditionName];
      createRowConditionAssertion(globalParams, tableName, conditionName, conditionQuery);
    }
  }

  return assertions;
}
