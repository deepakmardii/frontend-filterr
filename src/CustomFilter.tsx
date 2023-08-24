// CustomFilter.tsx
import React, { useState } from "react";
import Select from "react-select";
// import ValueType from "react-select";

interface CustomFilterProps {
  columnKey: string;
  values: string[];
  onChange: (columnKey: string, selectedValues: string[]) => void;
}

// interface OptionType {
//   value: string;
//   label: string;
// }

const CustomFilter: React.FC<CustomFilterProps> = ({
  columnKey,
  values,
  onChange,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleCheckboxChange = (value: string) => {
    let newSelectedValues: string[];
    if (selectedValues.includes(value)) {
      newSelectedValues = selectedValues.filter((v) => v !== value);
    } else {
      newSelectedValues = [...selectedValues, value];
    }
    setSelectedValues(newSelectedValues);
    onChange(columnKey, newSelectedValues);
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
        value={options.filter((opt) => selectedValues.includes(opt.value))}
        options={options}
        onChange={(selectedOptions) => {
          const selected = selectedOptions
            ? selectedOptions.map((option) => option.value)
            : [];
          setSelectedValues(selected);
          onChange(columnKey, selected);
        }}
        components={{
          Option: ({ data, ...props }) => (
            <div>
              <input
                type="checkbox"
                checked={selectedValues.includes(data.value)}
                onChange={() => handleCheckboxChange(data.value)}
              />
              <label>{props.children}</label>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default CustomFilter;
