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
        updateFilters(googleData.data);
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
    let newFilteredData = data;

    if (selectedValues.length > 0) {
      newFilteredData = newFilteredData.filter((item) =>
        selectedValues.includes(item[columnKey])
      );
    }

    for (const key in filters) {
      if (key !== columnKey && filters[key].length > 0) {
        newFilteredData = newFilteredData.filter((item) =>
          filters[key].includes(item[key])
        );
      }
    }

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
        paginationPerPage={20}
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

  const handleCheckboxChange = (value: string) => {
    let newSelectedValues;
    if (selectedValues.includes(value)) {
      newSelectedValues = selectedValues.filter((v) => v !== value);
    } else {
      newSelectedValues = [...selectedValues, value];
    }
    setSelectedValues(newSelectedValues);
    onChange(columnKey, newSelectedValues); // Trigger the filter change immediately
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
        isSearchable={true}
        closeMenuOnSelect={false}
        value={selectedValues.map((value) => ({
          label: value,
          value: value,
        }))}
        options={options}
        onChange={(selectedOptions) => {
          const selected = selectedOptions.map((option) => option.value);
          setSelectedValues(selected);
          onChange(columnKey, selected);
        }}
        components={{
          Option: ({ children, ...props }) => (
            <div>
              <input
                type="checkbox"
                checked={selectedValues.includes(props.value)}
                onChange={() => handleCheckboxChange(props.value)}
              />
              <label>{children}</label>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default App;
