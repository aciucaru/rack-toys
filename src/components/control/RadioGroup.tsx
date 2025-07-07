import React, { useState } from 'react';
import styles from './RadioGroup.module.css';

// type RadioGroupProps =
interface RadioGroupProps
{
    options: string[];
    onSelect: (selected: string) => void;
}

// const RadioGroup: React.FC<RadioGroupProps> = ({ options, onSelect }) => {

export function RadioGroup({ options, onSelect }: RadioGroupProps)
{
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const value = event.target.value;
        setSelectedOption(value);
        onSelect(value);
    };

    return (
    <div className={styles.radioGroup}>
        {options.map((option) => (
        <label key={option} className={styles.radioLabel}>
            <input
                type="radio"
                value={option}
                checked={selectedOption === option}
                onChange={handleChange}
                className={styles.radioInput}
                name="radio-group"
            />
            {option}
        </label>
        ))}
    </div>
    );
}

// export default RadioGroup;
