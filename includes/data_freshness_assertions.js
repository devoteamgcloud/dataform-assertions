/**
 * data_freshness_assertions.js
 *
 * This file contains a function to create data freshness assertions for specific tables in a database.
 * The assertions are used to check if the data in each specified table is fresh, based on a specified delay condition and time unit.
 *
 * The function `createDataFreshnessAssertion` takes in global parameters, a table name, a delay condition, a time unit, and a date column to create these assertions.
 */

/**
 * @param {Object} globalParams - See index.js for details.
 * @param {string} schemaName - The name of the schema to check for unique keys.
 * @param {string} tableName - The name of the table to check for data freshness.
 * @param {string} filter - The condition to filter the data.
 * @param {number} delayCondition - The maximum allowed delay (in units specified by `timeUnit`) for the data to be considered fresh.
 * @param {string} timeUnit - The unit of time to use for the delay condition. This should be a string that is valid in a SQL `DATE_DIFF` function, such as 'DAY', 'HOUR', etc.
 * @param {string} dateColumn - The name of the date column to check for data freshness.
 * @param {string} timeZone - The name of the time zone for the date column.
 */

const assertions = [];

const createDataFreshnessAssertion = (globalParams, schemaName, tableName, filter, delayCondition, timeUnit, dateColumn, timeZone = "UTC") => {
  const assertion = assert(`assert_freshness_${schemaName}_${tableName}`)
    .database(globalParams.database)
    .schema(globalParams.schema)
    .description(`Assert that data in ${schemaName}.${tableName} is fresh with a delay less than ${delayCondition} ${timeUnit}`)
    .tags("assert-data-freshness")
    .query(ctx => `
                WITH
                    filtering AS (
                        SELECT
                            *
                        FROM
                            ${ctx.ref(schemaName, tableName)}
                        WHERE
                            ${filter}
                    ),
                    freshness AS (
                        SELECT
                          ${["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"].includes(timeUnit)
                              ? `DATE_DIFF(CURRENT_DATE("${timeZone}"), MAX(${dateColumn}), ${timeUnit})`
                              : `TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), MAX(${dateColumn}), ${timeUnit})`} AS delay
                        FROM
                            filtering
                    )
                SELECT
                    *
                FROM
                    freshness
                WHERE
                    delay > ${delayCondition}
            `);

  (globalParams.tags && globalParams.tags.forEach((tag) => assertion.tags(tag)));

  (globalParams.disabledInEnvs && globalParams.disabledInEnvs.includes(dataform.projectConfig.vars.env)) && assertion.disabled();

  assertions.push(assertion);
};

module.exports = (globalParams, config, freshnessConditions) => {
  // Loop through freshnessConditions to create assertions.
  for (let schemaName in freshnessConditions) {
    const tableNames = freshnessConditions[schemaName];
    for (let tableName in tableNames) {
      const {
        delayCondition,
        timeUnit,
        dateColumn,
        timeZone
      } = tableNames[tableName];
      const filter = config[schemaName][tableName]?.where ?? true;
      createDataFreshnessAssertion(globalParams, schemaName, tableName, filter, delayCondition, timeUnit, dateColumn);
    }
  }

  return assertions;
};
