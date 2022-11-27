import { ItemInputLineData } from 'item-input-line-data';
import React, { FC, useState } from 'react';
import styles from './ItemInputLine.module.scss';
import CheckIcon from '@mui/icons-material/Check'

interface ItemInputLineProps {
  item: ItemInputLineData;
  onClick?: () => void;
}

const ItemInputLine: FC<ItemInputLineProps> = (props) => {
const [text, setText] = useState(props.item.text);
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.item.text = event.target.value;
    setText(props.item.text);
}

return (
    <div className={styles.ItemInputLine}>
        <input type="text" value={text} onChange={handleChange} />
        <button
            onClick={() => {
                if (!!props.onClick) props.onClick();
            }}
        >
            -
        </button>
        {props.item.loaded ? <CheckIcon className={styles.check} /> : null}
        {props.item.loaded2 ? <CheckIcon className={styles.check} /> : null}
    </div>
);};

export { ItemInputLine, ItemInputLineProps };