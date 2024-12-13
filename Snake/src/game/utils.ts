

export function log(message: string, func: Function) {
  console.log(func.name + ': ' + message)
}


export function LogExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
      const start = Date.now(); // Record the start time
      console.log(`${propertyKey} Begin`);

      const result = originalMethod.apply(this, args);

      const end = Date.now(); // Record the end time
      const timeTaken = end - start; // Calculate the time taken
      console.log(`${propertyKey} Finish - Time: ${timeTaken}ms`);

      return result;
  };

  return descriptor;
}
