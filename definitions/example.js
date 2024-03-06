const commonAssertions = require("../index");

const commonAssertionsResult = commonAssertions({
  globalAssertionsParams: {
    "database": "sandbox-hrialan",
    "schema": "assertions_" + dataform.projectConfig.vars.env,
    "location": "EU",
    "tags": ["assertions"],
    // Sometimes data quality is not good in some environments,
    // assertions can be disabled in those environments.
    // "disabledInEnvs": ["dv", "qa"]
  },
  rowConditions: {
    "first_table": {
      "id_not_null": "id IS NOT NULL",
      "id_strict_positive": "id > 0"
    },
    "second_table": {
      "id_not_null": "id IS NOT NULL"
    }
  },
  uniqueKeyConditions: {
    "first_table": ["id"],
    "second_table": ["id", "updated_date"]
  },
  dataFreshnessConditions: {
    "first_table": {
      "dateColumn": "updated_date",
      "timeUnit": "DAY",
      "delayCondition": 1,
    },
    "second_table": {
      "dateColumn": "updated_date",
      "timeUnit": "MONTH",
      "delayCondition": 3,
    }
  },
  dataCompletenessConditions: {
    "first_table": {
      // Format: "column": allowedPercentageNull
      "updated_date": 1, // 1% of null values allowed in the updated_date column
      "id": 20
    },
    "second_table": {
      "id": 30
    }
  }
});

/*
 * ASSERTIONS AUDIT TABLE EXAMPLE
 * The following code snippet is used to publish the results of the created assertions in a table for audit purposes.
 * The result is a table with the following columns:
 * | assertion_name | assertion_type |
 * |----------------|----------------|
 * | id_not_null    | row_condition  |
 * |       ...      |       ...      |
 * 
 * It is here as an example on how you can re use the created assertions for audit or for any other purpose.
 */

let selectClauses = [];

for (const key in commonAssertionsResult) {
  if (commonAssertionsResult.hasOwnProperty(key)) {
    const commonAssertionsResultForKey = commonAssertionsResult[key];
    if (commonAssertionsResultForKey.length > 0) {
      const selectClause = commonAssertionsResultForKey.map(assertion => {
        return `SELECT "${assertion.proto.target.name}" AS assertion_name, '${key}' AS assertion_type`;
      }).join("\n UNION ALL \n");

      selectClauses.push(selectClause);
    }
  }
}

const sqlQuery = selectClauses.join("\n UNION ALL \n");

publish("assertions_audit", {
  type: "table"
}).query(
  (ctx) => sqlQuery
);
