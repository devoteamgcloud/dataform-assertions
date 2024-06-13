# Dataform Assertions

Unlock advanced data testing capabilities with this Dataform package, offering a comprehensive and common suite of assertions designed for testing various facets of your warehouse data, including data freshness, unique keys, row conditions, data completeness and referential integrity.

Your contributions are highly encouraged – whether you have an innovative assertion idea or wish to enhance the existing ones, feel free to open an issue or submit a pull request to enrich the Dataform community.

<p align="center">
</br>
<img src="https://github.com/devoteamgcloud/dataform-assertions/actions/workflows/publish-package.yaml/badge.svg">
</p>

## Contents

- [Context](#context)
- [Installation](#installation)
- [Usage](#usage)
- [Available assertions](#available-assertions)
- [Warning](#warning)
- [Supported warehouses](#supported-warehouses)
- [Contributing](#contributing)
- [License](#license)

## Context

Data testing is a crucial part of the data engineering process, ensuring that the data is accurate, reliable, and consistent. Dataform provides a powerful framework for data testing, allowing you to write SQL-based assertions to validate your data. However, writing these assertions can be time-consuming and error-prone, especially when you need to test the same conditions across multiple tables.

This package aims to provide a common suite of assertions that can be easily reused across multiple projects, saving you time and effort. It includes a variety of assertions to test different facets of your data.

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
    // If not provided, the default Dataform project config will be used
    "database": "gcp-project-id",
    "schema": "bigquery-dataset",
    "location": "bigquery-location",
    "tags": ["global-assertions-tag"],
    "disabledInEnvs": ["dv"] // Check match with 'dataform.projectConfig.vars.env' value
  },
  rowConditions: {
    "your_table": {
      "id_not_null": "id IS NOT NULL",
    }
  }
});
```

You can find a more complete example here: [definitions/example.js](./definitions/example.js).

## Available assertions

This package includes the following types of assertions:

- **Row conditions**: Check if the rows in a table satisfy a given SQL condition.
- **Unique key conditions**: Check if a given primary key (can be a set of columns) is not duplicated in a table.
- **Data freshness conditions**: Check if the data in a table is fresh enough given some conditions.
- **Data completeness conditions**: Check if the data in a column have less than a given percentage of null values.
- **Referential integrity conditions**: Check if foreign key relationships are maintained between tables.

## Warning

Dataform assertions are SQL-based and executed in the data warehouse. This means that they can be resource-intensive, especially when dealing with a large volume of data.

In the Dataform UI, you have the option to review complete assertion queries and the amount of data processed before running them. Depending on the size of the tables in your data warehouse, you might consider running these assertions less frequently compared to other Dataform actions or limiting the number of assertions.

## Supported warehouses

This package has been tested with BigQuery. It has not been tested with other warehouses, but it should work with any warehouse supported by Dataform.

## Contributing

We welcome contributions to the Dataform Assertions package. If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
