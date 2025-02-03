import { Worker } from 'worker_threads';
import express from 'express';

// Singleton para manejar Workers
class WorkerPool {
  constructor() {
    this.workers = [];
  }

  executeTask(workerFile, data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerFile, { workerData: data });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }
}

const workerPool = new WorkerPool();

// Strategy Pattern - Diferentes cálculos matemáticos
class SumStrategy {
  execute(a, b) {
    return a + b;
  }
}

class MultiplyStrategy {
  execute(a, b) {
    return a * b;
  }
}

class Calculator {
  strategy;

  constructor(strategy) {
    this.strategy = strategy;
  }

  calculate(a, b) {
    return this.strategy.execute(a, b);
  }
}

// Express API
const app = express();
app.use(express.json());

// Endpoint para cálculos simples
app.post('/calculate', async (req, res) => {
  const { a, b, operation } = req.body;

  let strategy;
  if (operation === 'sum') {
    strategy = new SumStrategy();
  } else if (operation === 'multiply') {
    strategy = new MultiplyStrategy();
  } else {
    return res.status(400).json({ error: 'Invalid operation' });
  }

  const calculator = new Calculator(strategy);
  const result = calculator.calculate(a, b);
  return res.json({ result });
});

// Endpoint para cálculo intensivo usando Worker Threads
app.post('/heavy-task', async (req, res) => {
  try {
    const result = await workerPool.executeTask('./src/worker.js', req.body.number);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **BUG EN EL EVENT LOOP** (Corregido)
app.get('/buggy-endpoint', async (req, res) => {
  console.log('Start request');
  let stop = false;

  setTimeout(() => {
    console.log('Timeout executed');
    stop = true;
    res.send('Response reached!');
  }, Math.random() * 100);

  // Eliminamos el bucle infinito que bloqueaba el Event Loop
});

app.listen(3000, () => console.log('Server running on port 3000'));
