"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/signup');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <StyledContainer>
      <StyledContent>
        <h1>404</h1>
        <p>Page not found</p>
        <p className="redirect-text">Redirecting to signup...</p>
      </StyledContent>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #1a1a1a, #000000);
`;

const StyledContent = styled.div`
  text-align: center;
  color: white;

  h1 {
    font-size: 6rem;
    margin: 0;
    background: linear-gradient(45deg, #4a90e2, #357abd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.5rem;
    margin: 1rem 0;
    color: #a0a0a0;
  }

  .redirect-text {
    font-size: 1rem;
    color: #4a90e2;
  }
`; 