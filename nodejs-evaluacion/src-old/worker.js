const { parentPort, workerData } = require('worker_threads');

// Simula una tarea intensiva (por ejemplo, calcular el factorial)
function heavyTask(number) {
  let result = 1;
  for (let i = 1; i <= number; i++) {
    result *= i;
  }
  return result;
}

// Ejecuta la tarea y envía el resultado al hilo principal
const result = heavyTask(workerData);
parentPort.postMessage(result);
