import React, { useState, useEffect } from "react";
import styles from "./ToggleButton.module.css";

interface ToggleButtonProps
{
    label?: string;
    onToggleChange: (isToggled: boolean) => void;
    isToggled?: boolean;
    buttonWidth?: number;
    buttonHeight?: number;
}

// const ToggleButton: React.FC<ToggleButtonProps> = ({
//   label = "",
//   onToggleChange,
//   isToggled: initialToggled = false,
//   buttonWidth = 24,
//   buttonHeight = 20,
// }) => {

export function ToggleButton({
    label = "",
    onToggleChange,
    isToggled: initialToggled = false,
    buttonWidth = 24,
    buttonHeight = 20,
}: ToggleButtonProps)
{
    const [isToggled, setIsToggled] = useState<boolean>(initialToggled);

    useEffect(() =>
    {
        setIsToggled(initialToggled);
    }, [initialToggled]);

    // function handleToggleClick()
    // {
    //     const newToggled = !isToggled;
    //     setIsToggled(newToggled);
    //     onToggleChange(newToggled);
    // }

    const handleToggleClick = () =>
    {
        const newToggled = !isToggled;
        setIsToggled(newToggled);
        onToggleChange(newToggled);
    }

    const backgroundClass = isToggled
        ? `${styles.buttonImage} ${styles.backgroundOnDefaultImage}`
        : `${styles.buttonImage} ${styles.backgroundOffDefaultImage}`;

    const foregroundClass = isToggled
        ? `${styles.buttonImage} ${styles.foregroundOnDefaultImage} ${styles.foregroundOnFilter}`
        : `${styles.buttonImage} ${styles.foregroundOffDefaultImage} ${styles.foregroundOffFilter}`;

    const dimensionsStyle: React.CSSProperties =
    {
        width: `${buttonWidth}px`,
        height: `${buttonHeight}px`,
    };

    return (
    <div className={styles.mainContainer} style={dimensionsStyle}>
        <div className={styles.buttonContainer} style={dimensionsStyle}>
            <div className={styles.buttonMain} style={dimensionsStyle}>
                <div className={backgroundClass} style={dimensionsStyle} />
            </div>
            <div
                className={styles.buttonMain}
                style={dimensionsStyle}
                onClick={handleToggleClick}
                >
                <div className={foregroundClass} style={dimensionsStyle} />
            </div>
        </div>
        {label && (
            <div className={`${styles.label} ${styles.unselectable}`} onClick={handleToggleClick}>
        {label}
        </div>
        )}
    </div>
    );
}

// export default ToggleButton;
