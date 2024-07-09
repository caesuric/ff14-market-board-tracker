import React, { FC, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Autocomplete, Button, debounce, TextField } from "@mui/material";
import { ItemInputLineData } from "item-input-line-data";
import { XivApiResult } from "xiv-api-result";
import styles from "./ItemInputLine.module.scss";

interface ItemInputLineProps {
  item: ItemInputLineData;
  onClick?: () => void;
}

const ItemInputLine: FC<ItemInputLineProps> = ({ item, onClick }) => {
  const [value, setValue] = useState<XivApiResult | undefined>(item.result);
  const [inputValue, setInputValue] = useState<string>(item.text);
  const [dropdownOptions, setDropdownOptions] = useState<XivApiResult[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const getItemsFromBackend = (search: string) => {
    fetch(`/xivapi/search?string=${search}`).then(async (response) => {
      const processedResponse: XivApiResult[] = (await response.json())
        .Results as XivApiResult[];
      const options = processedResponse.sort((x) => x._Score).reverse();
      const output = options.reduce(
        (accumulator: XivApiResult[], current: XivApiResult) => {
          let exists = accumulator.find((item: XivApiResult) => {
            return item.ID === current.ID;
          });
          if (!exists) accumulator = accumulator.concat(current);
          return accumulator;
        },
        []
      );
      setDropdownOptions(output);
    });
  };
  const backendWrapper = (value: string) =>
    debounce(() => getItemsFromBackend(value), 400);
  const onChange = (event: any, newValue: string) => {
    setInputValue(newValue);
    if (newValue !== "") {
      setIsOpen(true);
      backendWrapper(newValue)();
    }
  };

  return (
    <div className={styles.ItemInputLine}>
      <Button
        className={styles.minusButton}
        onClick={() => {
          if (!!onClick) onClick();
        }}
      >
        <FontAwesomeIcon icon={faMinus} />
      </Button>
      {!item.result ? (
        <Autocomplete
          getOptionLabel={(x: XivApiResult | string) => {
            if (typeof x === "string") return x;
            return x.Name;
          }}
          options={dropdownOptions}
          freeSolo
          value={value}
          inputValue={inputValue}
          fullWidth={true}
          noOptionsText="No results"
          onChange={(event: any, newValue: XivApiResult | null | string) => {
            if (typeof newValue === "string" || newValue === null)
              setValue(undefined);
            else {
              setValue(newValue);
              setInputValue(newValue.Name);
              setIsOpen(false);
              item.result = newValue;
              item.ffxivId = newValue.ID.toString();
              item.text = newValue.Name;
            }
          }}
          getOptionKey={(option: XivApiResult | string) => {
            if (typeof option === "string") return option;
            return option.ID;
          }}
          onInputChange={onChange}
          open={isOpen}
          renderInput={(params) => (
            <TextField {...params} label="Search for an item" />
          )}
        />
      ) : (
        <div>{item.result.Name}</div>
      )}
      {item.loaded ? (
        <FontAwesomeIcon size="lg" icon={faCheck} className={styles.check} />
      ) : null}
      {item.loaded2 ? (
        <FontAwesomeIcon size="lg" icon={faCheck} className={styles.check} />
      ) : null}
    </div>
  );
};

export { ItemInputLine, ItemInputLineProps };
