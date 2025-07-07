import React from 'react';
import styles from './MyComponent.module.css';

type MyComponentProps = {
  customStyle?: React.CSSProperties;
};

const MyComponent: React.FC<MyComponentProps> = ({ customStyle }) => {
  return (
    <div
      className={styles.container}
      style={{ ...customStyle }} // merged with the default class styles
    >
      Content goes here
    </div>
  );
};

export default MyComponent;