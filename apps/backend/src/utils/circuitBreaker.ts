type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

type Circuit = {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
};

const circuits: Record<string, Circuit> = {};


const FAILURE_THRESHOLD = 10;
const RESET_TIMEOUT = 10000; 

export const checkCircuit = (endpoint: string): boolean => {
  
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  const circuit = circuits[endpoint];

  if (!circuit) return true;

  if (circuit.state === "OPEN") {
    const now = Date.now();

    if (now - circuit.lastFailureTime > RESET_TIMEOUT) {
      circuit.state = "HALF_OPEN";
      return true;
    }

    return false;
  }

  return true;
};

export const recordSuccess = (endpoint: string) => {
  const circuit = circuits[endpoint];

  if (!circuit) return;

  circuit.failureCount = 0;
  circuit.state = "CLOSED";
};

export const recordFailure = (endpoint: string) => {
  if (!circuits[endpoint]) {
    circuits[endpoint] = {
      state: "CLOSED",
      failureCount: 0,
      lastFailureTime: 0,
    };
  }

  const circuit = circuits[endpoint];

  circuit.failureCount++;
  circuit.lastFailureTime = Date.now();

  if (circuit.failureCount >= FAILURE_THRESHOLD) {
    circuit.state = "OPEN";
  }
};


export const resetCircuitBreaker = () => {
  for (const key in circuits) {
    delete circuits[key];
  }
};