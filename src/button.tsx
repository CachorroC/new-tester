import React from 'react';

export default function Button() {
  const [
    currentState,
    setCurrentState
  ] = React.useState(
    'No lo se' 
  );
  return (
    <button
      onClick={() => {
        setCurrentState(
          'le dio un click al botón' 
        );
      }}
    >
      <span>{currentState}</span>
    </button>
  );
}

export function ButtonsRow() {
  return (
    <>
      <Button />
      <Button />
    </>
  );
}
