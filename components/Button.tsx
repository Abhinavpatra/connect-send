import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variants?: any;
  whileHover?: string;
  whileTap?: string;
}

export default function Button({ 
  onClick, 
  children, 
  disabled = false,
  ...props 
}: ButtonProps) {
  return (
    <StyledWrapper>
      <div 
        className={`box-button ${disabled ? 'disabled' : ''}`}
        onClick={!disabled ? onClick : undefined}
        {...props}
      >
        <div className="button">
          <span>{children}</span>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .box-button {
    cursor: pointer;
    border: 4px solid black;
    background-color: gray;
    padding-bottom: 10px;
    transition: 0.1s ease-in-out;
    user-select: none;

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .button {
    background-color: #85BB65;
    border: 4px solid #fff;
    padding: 3px 8px;
  }

  .button span {
    font-size: 1.2em;
    letter-spacing: 1px;
  }

  .box-button:active:not(.disabled) {
    padding: 0;
    margin-bottom: 10px;
    transform: translateY(10px);
  }
`;