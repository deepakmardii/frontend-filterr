import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Papa from "papaparse";
import Select from "react-select";

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
      complete: (googleData) => {
        setData(googleData.data);
        setFilteredData(googleData.data);
        // Initialize filters with all unique values for each column
        const initialFilters: { [key: string]: string[] } = {};
        for (const key in googleData.data[0]) {
          const uniqueValues = Array.from(
            new Set(googleData.data.map((item) => item[key]))
          );
          initialFilters[key] = uniqueValues;
        }
        setFilters(initialFilters);
      },
    });
  }, []);

  const handleFilterChange = (columnKey: string, selectedValues: string[]) => {
    // Update filters with selected values for the column
    setFilters({ ...filters, [columnKey]: selectedValues });

    // Filter data based on selected values from all filters
    let filteredData = data;

    // Filter data for the selected column
    if (selectedValues.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedValues.includes(item[columnKey])
      );
    }

    // Apply filters for other columns
    for (const key in filters) {
      if (key !== columnKey && filters[key].length > 0) {
        filteredData = filteredData.filter((item) =>
          filters[key].includes(item[key])
        );
      }
    }

    setFilteredData(filteredData);
  };

  const filterElements = Object.keys(filters).map((columnKey) => (
    <CustomFilter
      key={columnKey}
      columnKey={columnKey}
      values={filters[columnKey]}
      onChange={handleFilterChange}
    />
  ));

  const columns = data[0]
    ? Object.keys(data[0]).map((key) => ({
        name: key,
        selector: key,
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
        paginationPerPage={100}
        paginationRowsPerPageOptions={[20, 50, 100]}
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
      />
    </>
  );
};

interface CustomFilterProps {
  columnKey: string;
  values: string[];
  onChange: (columnKey: string, selectedValues: string[]) => void;
}

const CustomFilter: React.FC<CustomFilterProps> = ({
  columnKey,
  values,
  onChange,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleSelectChange = (selectedOptions: any) => {
    const selected = selectedOptions.map((option: any) => option.value);
    setSelectedValues(selected);
    onChange(columnKey, selected);
  };

  const options = values.map((value) => ({
    label: value,
    value: value,
  }));

  return (
    <div className="filter">
      <label>{columnKey} Filter:</label>
      <Select
        isMulti
        value={selectedValues.map((value) => ({
          label: value,
          value: value,
        }))}
        options={options}
        onChange={handleSelectChange}
      />
    </div>
  );
};

export default App;
