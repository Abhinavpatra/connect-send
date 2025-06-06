import React from 'react';
import styled from 'styled-components';

export default function Button({children}:any)  {
  return (
    <StyledWrapper>
      <div className="box-button">
        <div className="button"><span>Send transaction {children}</span></div>
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

  .box-button:active {
    padding: 0;
    margin-bottom: 10px;
    transform: translateY(10px);
  }`;

