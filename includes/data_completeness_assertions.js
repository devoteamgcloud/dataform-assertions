/**
 * data_completeness_assertions.js
 *
 * This file contains a function to create data completeness assertions for specific tables and columns in a database.
 * The assertions are used to check if the percentage of null values in each specified column exceeds an allowed limit.
 * The conditions for data completeness checks are defined in an object format:
 * { tableName: { columnName: allowedPercentageNull, ... }, ... }
 *
 * The function `createDataCompletenessAssertion` takes in global parameters, a table name, and column conditions to create these assertions.
 */

/**
 * @param {Object} globalParams - See index.js for details.
 * @param {string} schemaName - The name of the schema to check for unique keys.
 * @param {string} tableName - The name of the table to check for data completeness.
 * @param {Object} columnConditions - An object mapping column names to their allowed percentage of null values. If a value is an object, it should have an `allowedPercentageNull` property.
 */

const assertions = [];

const createDataCompletenessAssertion = (globalParams, schemaName, tableName, columnConditions) => {

  for (let columnName in columnConditions) {
    const allowedPercentageNull = columnConditions[columnName];

    const assertion = assert(`assert_data_completeness_${schemaName}_${tableName}_${columnName}`)
      .database(globalParams.database)
      .schema(globalParams.schema)
      .description(`Check data completeness for ${schemaName}.${tableName}.${columnName}, allowed percentage of null values: ${allowedPercentageNull}`)
      .tags("assert-data-completeness")
      .query(ctx => `SELECT COUNT(*) AS total_rows,
                        SUM(CASE WHEN ${columnName} IS NULL THEN 1 ELSE 0 END) AS null_count
                        FROM ${ctx.ref(schemaName, tableName)}
                        HAVING SAFE_DIVIDE(null_count, total_rows) > ${allowedPercentageNull / 100} AND null_count > 0 AND total_rows > 0`);

    (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

    (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

    assertions.push(assertion);
  }

};

module.exports = (globalParams, dataCompletenessConditions) => {
  // Loop through dataCompletenessConditions to create data completeness check assertions.
  for (let schemaName in dataCompletenessConditions) {
    const tableNames = dataCompletenessConditions[schemaName];
    for (let tableName in tableNames) {
      const columnConditions = tableNames[tableName];
      createDataCompletenessAssertion(globalParams, schemaName, tableName, columnConditions);
    }
  }
  return assertions;
};
