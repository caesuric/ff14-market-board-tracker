import { ItemInputLineData } from "item-input-line-data";
import React, { FC, useState } from "react";
import styles from "./ItemInputLine.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Button, Input } from "@mui/material";

interface ItemInputLineProps {
  item: ItemInputLineData;
  onClick?: () => void;
}

const ItemInputLine: FC<ItemInputLineProps> = (props) => {
  const [text, setText] = useState(props.item.text);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.item.text = event.target.value;
    setText(props.item.text);
  };

  return (
    <div className={styles.ItemInputLine}>
      <Button
        className={styles.minusButton}
        onClick={() => {
          if (!!props.onClick) props.onClick();
        }}
      >
        <FontAwesomeIcon icon={faMinus} />
      </Button>
      <Input type="text" value={text} onChange={handleChange} />
      {props.item.loaded ? (
        <FontAwesomeIcon icon={faCheck} className={styles.check} />
      ) : null}
      {props.item.loaded2 ? (
        <FontAwesomeIcon icon={faCheck} className={styles.check} />
      ) : null}
    </div>
  );
};

export { ItemInputLine, ItemInputLineProps };
