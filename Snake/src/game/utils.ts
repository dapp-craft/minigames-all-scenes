

export function log(message: string, func: Function) {
  console.log(func.name + ': ' + message)
}