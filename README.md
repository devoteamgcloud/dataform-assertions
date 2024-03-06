# Dataform Assertions

This Dataform package provides a set of assertions for testing the data in your warehouse. It includes assertions for data freshness, unique keys, row conditions, and data completeness.

Contributions are welcome! If you have an idea for a new assertion, please open an issue or submit a pull request.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Available assertions](#available-assertions)
- [License](#license)

## Installation

Follow the instructions in the [Dataform documentation](https://cloud.google.com/dataform/docs/install-package) to install this package. Here is a quick summary:

1. In the `package.json`file dependencies, add the following line:
```json
"dataform-assertions": "https://github.com/devoteamgcloud/dataform-assertions/archive/refs/tags/[RELEASE_VERSION].tar.gz"
```
2. Click on `Install packages` in the Dataform web UI or use the `dataform install` CLI command in the terminal.
3. You are ready to go!

## Usage

Create a js file in the `/definitions` folder of your Dataform project and add the following code with the desired parameters:

```javascript
const commonAssertions = require("dataform-assertions");

const commonAssertionsResult = commonAssertions({
  globalAssertionsParams: {
    // If not provided, the default values will be used
    "database": "your-database",
    "schema": "your-schema",
    "location": "your-location",
    "tags": ["your-tags"],
    "disabledInEnvs": ["your-disabled-environments"]
  },
  rowConditions: {
    "your-table": {
      "your-condition": "your-SQL-condition"
    }
  }
});
```

You can find a more complete example in [`definitions/example.js`](./definitions/example.js).


## Available assertions

This package includes the following types of assertions:

- **Row conditions**: Check if the rows in a table satisfy a given SQL condition.
- **Unique key conditions**: Check if a given primary key (can be a set of columns) is not duplicated in a table.
- **Data freshness conditions**: Check if the data in a table is fresh enough given some conditions.
- **Data completeness conditions**: Check if the data in a column have less than a given percentage of null values.

## Supported warehouses

This package has been tested with BigQuery. It has not been tested with other warehouses.

# License

This project is licensed under the MIT License. See the LICENSE file for details.
