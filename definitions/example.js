const commonAssertions = require("../index");

const commonAssertionsResult = commonAssertions({
  globalAssertionsParams: {
    "database": "sandbox-hrialan",
    "schema": "assertions_" + dataform.projectConfig.vars.env,
    "location": "EU",
    "tags": ["assertions"],
    // Sometimes data quality is not good in some environments,
    // assertions can be disabled in those environments.
    // Set the 'dataform.projectConfig.vars.env' var in 'dataform.json' for this to work.
    // "disabledInEnvs": ["dv", "qa"]
  },
  rowConditions: {
    "first_table": {
      "id_not_null": "id IS NOT NULL",
      "id_strict_positive": "id > 0"
    },
    "second_table": {
      "id_in_accepted_values": "id IN (1, 2, 3)"
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
      "timeZone": "America/Los_Angeles"
    },
    "second_table": {
      "dateColumn": "updated_date",
      "timeUnit": "HOUR",
      "delayCondition": 3,
      "timeZone": "-08"
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
  },
  referentialIntegrityConditions: {
    "first_table": [{
        "parentKey": "id",
        "childTable": "second_table",
        "childKey": "id"
      },
      {
        "parentKey": "id",
        "childTable": "third_table",
        "childKey": "parent_id"
      }
    ]
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
