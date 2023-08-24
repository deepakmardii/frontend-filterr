// App.tsx
import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Papa from "papaparse";
import CustomFilter from "./CustomFilter";

interface DataItem {
  [key: string]: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    Papa.parse<DataItem>("/data.csv", {
      download: true,
      header: true,
      complete: (result) => {
        setData(result.data);
        setFilteredData(result.data);
        updateFilters(result.data);
      },
    });
  }, []);

  const updateFilters = (dataToUpdate: DataItem[]) => {
    const newFilters: { [key: string]: string[] } = {};
    for (const key in dataToUpdate[0]) {
      const uniqueValues = Array.from(
        new Set(dataToUpdate.map((item) => item[key]))
      );
      newFilters[key] = uniqueValues;
    }
    setFilters(newFilters);
  };

  const handleFilterChange = (columnKey: string, selectedValues: string[]) => {
    const filterFunctions: ((item: DataItem) => boolean)[] = [];

    if (selectedValues.length > 0) {
      filterFunctions.push((item: DataItem) =>
        selectedValues.includes(item[columnKey])
      );
    }

    for (const key in filters) {
      if (key !== columnKey && filters[key].length > 0) {
        filterFunctions.push((item: DataItem) =>
          filters[key].includes(item[key])
        );
      }
    }

    const newFilteredData = data.filter((item) =>
      filterFunctions.every((func) => func(item))
    );

    setFilteredData(newFilteredData);
  };

  const filterElements = Object.keys(filters).map((columnKey) => (
    <CustomFilter
      key={columnKey}
      columnKey={columnKey}
      values={filters[columnKey]}
      onChange={handleFilterChange}
    />
  ));

  const columns: TableColumn<DataItem>[] = data[0]
    ? Object.keys(data[0]).map((key) => ({
        name: key,
        selector: (row) => row[key],
        sortable: true,
      }))
    : [];

  return (
    <>
      <div className="filters">{filterElements}</div>
      <DataTable
        title="CSV Data"
        data={filteredData}
        columns={columns}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
      />
    </>
  );
};

export default App;
